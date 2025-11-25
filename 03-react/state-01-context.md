# React State Management - Context

> Context API and state management with Context

---

## Question 1: Context API - When to Use It

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Meta, Google, Amazon

### Question
Explain React Context API. When should you use it vs prop drilling vs external state management?

### Answer

**Context API** - Share data across component tree without prop drilling.

```jsx
// 1. Create Context
const ThemeContext = React.createContext('light');

// 2. Provider
function App() {
  const [theme, setTheme] = useState('dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Dashboard />
    </ThemeContext.Provider>
  );
}

// 3. Consumer (using useContext hook)
function Button() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button className={theme}>
      Toggle: {theme}
    </button>
  );
}
```

**When to Use:**
- ✅ Theme, locale, auth (rarely changing, widely needed)
- ✅ Avoid prop drilling 3+ levels
- ❌ Frequently changing data (performance issues)
- ❌ Complex state logic (use Redux/Zustand)

### Resources
- [React Context](https://react.dev/reference/react/useContext)

---

<details>
<summary><strong>🔍 Deep Dive: Internal Architecture and Reconciliation</strong></summary>

**Internal Architecture and Reconciliation:**

Context API is built on React's reconciliation algorithm and the Provider-Consumer pattern. When you create a context with `React.createContext(defaultValue)`, React internally creates two components: a Provider and a Consumer. The Provider component maintains an internal value reference and a list of subscribed consumers (components using `useContext` or `<Context.Consumer>`).

**Subscription Mechanism:**

When a component calls `useContext(ThemeContext)`, React registers that component as a subscriber to that specific context. The subscription happens during the render phase - React fiber nodes store references to all contexts they consume. This subscription list is stored in the fiber tree structure, allowing React to efficiently track which components need updates when context values change.

**Re-render Propagation Algorithm:**

When a Provider's value changes (via `<ThemeContext.Provider value={newValue}>`), React performs a bailout check - it uses `Object.is()` to compare the old and new value references. If they're different, React marks all subscribed consumer components as needing re-render. This propagation happens top-down through the fiber tree:

```jsx
// ❌ This creates a new object every render, causing all consumers to re-render
function App() {
  const [theme, setTheme] = useState('dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Dashboard />
    </ThemeContext.Provider>
  );
}

// ✅ useMemo prevents new object creation unless theme changes
function App() {
  const [theme, setTheme] = useState('dark');

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <Dashboard />
    </ThemeContext.Provider>
  );
}
```

**Context Selectors Problem:**

Unlike Redux or Zustand, Context API doesn't support selective subscriptions (selectors). When any part of the context value changes, ALL consumers re-render, even if they only use a subset of the data:

```jsx
// ❌ Both UserProfile and UserSettings re-render when either name OR theme changes
const UserContext = React.createContext();

function App() {
  const [user, setUser] = useState({ name: 'Alice', theme: 'dark', settings: {} });

  return (
    <UserContext.Provider value={user}>
      <UserProfile /> {/* Only uses user.name */}
      <UserSettings /> {/* Only uses user.theme */}
    </UserContext.Provider>
  );
}

// ✅ Split contexts - only relevant components re-render
const UserNameContext = React.createContext();
const ThemeContext = React.createContext();

function App() {
  const [name, setName] = useState('Alice');
  const [theme, setTheme] = useState('dark');

  return (
    <UserNameContext.Provider value={name}>
      <ThemeContext.Provider value={theme}>
        <UserProfile /> {/* Only re-renders on name change */}
        <UserSettings /> {/* Only re-renders on theme change */}
      </ThemeContext.Provider>
    </UserNameContext.Provider>
  );
}
```

**Multiple Contexts and Composition:**

React supports multiple context providers in the same tree. When a component consumes multiple contexts, it subscribes to each independently. The component re-renders if ANY of its subscribed contexts change. Provider nesting order doesn't matter for subscriptions, but it affects context value resolution - inner providers override outer ones for the same context.

**Context with Reducers Pattern:**

For complex state logic, combining Context with `useReducer` provides Redux-like patterns without external dependencies:

```jsx
const TodoContext = React.createContext();

function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD': return [...state, action.todo];
    case 'REMOVE': return state.filter(t => t.id !== action.id);
    default: return state;
  }
}

function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, []);

  const value = useMemo(() => ({ todos, dispatch }), [todos]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}
```

**Default Values and TypeScript:**

The `defaultValue` parameter in `createContext` is used ONLY when a component consumes context without a Provider ancestor. In TypeScript, this enables type inference:

```typescript
interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

// ✅ Type-safe context with proper default
const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {}
});

// ❌ Unsafe - requires null checks everywhere
const ThemeContext = React.createContext<ThemeContextType | null>(null);
```

**Performance Optimization Strategies:**

1. **Memoize Provider values** - Prevent unnecessary re-renders from new object references
2. **Split contexts** - Separate frequently-changing data from static data
3. **Compose consumers** - Use multiple contexts instead of one large context object
4. **Use React.memo** - Prevent child re-renders if they don't consume context

Context API excels at managing global, infrequently-changing state like themes, localization, and authentication. For frequently-updating state or complex state logic with selectors, external libraries like Redux, Zustand, or Jotai provide better performance characteristics through optimized subscription mechanisms and built-in selector support.

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Excessive Re-renders</strong></summary>



**Production Bug: Excessive Re-renders Causing 3.2s Page Load**

**Context:** E-commerce dashboard with 150+ components using shared context for user data, cart, theme, notifications, and app settings. Users reported sluggish interactions, especially when updating cart items.

**Symptoms:**
- Page load time: 3.2s (target: <1s)
- Time to Interactive (TTI): 4.7s (target: <2.5s)
- Cart update lag: 850ms (target: <100ms)
- React DevTools showed 147 component re-renders on single cart update
- Profiler flamegraph revealed excessive reconciliation time (2.1s per cart action)

**Investigation Steps:**

**Step 1: Profile with React DevTools Profiler (15 minutes)**

Recorded a cart update interaction and analyzed the flamegraph:

```jsx
// ❌ PROBLEMATIC CODE - One massive context
const AppContext = React.createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});

  // 🚨 New object created EVERY render - all 150 consumers re-render
  const value = {
    user, setUser,
    cart, setCart,
    theme, setTheme,
    notifications, setNotifications,
    settings, setSettings
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Components consuming context
function ProductCard() {
  const { theme } = useContext(AppContext); // Re-renders on ANY context change
  // ... render logic
}

function CartIcon() {
  const { cart } = useContext(AppContext); // Re-renders on ANY context change
  // ... render logic
}

function UserProfile() {
  const { user } = useContext(AppContext); // Re-renders on ANY context change
  // ... render logic
}
```

**Metrics from Profiler:**
- ProductCard: Re-rendered 147 times (only needs theme changes)
- UserProfile: Re-rendered 147 times (only needs user changes)
- CartIcon: Re-rendered 147 times (correctly needs cart changes)
- Total wasted renders: 294 (147 × 2 components that shouldn't re-render)

**Step 2: Analyze Context Usage Patterns (20 minutes)**

Used custom script to analyze which components used which context values:

```bash
# Found 87 components only use theme
# Found 23 components only use cart
# Found 15 components only use user
# Found 12 components use cart + theme
# Found 8 components use multiple contexts
```

**Root Cause:** Monolithic context pattern with non-memoized value object causing global re-render storms.

**Solution 1: Split Contexts by Update Frequency (2 hours implementation)**

```jsx
// ✅ SOLUTION - Split contexts by change frequency
const UserContext = React.createContext();
const CartContext = React.createContext();
const ThemeContext = React.createContext();
const NotificationsContext = React.createContext();
const SettingsContext = React.createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});

  // ✅ Memoize each context value independently
  const userValue = useMemo(() => ({ user, setUser }), [user]);
  const cartValue = useMemo(() => ({ cart, setCart }), [cart]);
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  const notificationsValue = useMemo(
    () => ({ notifications, setNotifications }),
    [notifications]
  );
  const settingsValue = useMemo(
    () => ({ settings, setSettings }),
    [settings]
  );

  return (
    <UserContext.Provider value={userValue}>
      <CartContext.Provider value={cartValue}>
        <ThemeContext.Provider value={themeValue}>
          <NotificationsContext.Provider value={notificationsValue}>
            <SettingsContext.Provider value={settingsValue}>
              {children}
            </SettingsContext.Provider>
          </NotificationsContext.Provider>
        </ThemeContext.Provider>
      </CartContext.Provider>
    </UserContext.Provider>
  );
}

// ✅ Components only subscribe to what they need
function ProductCard() {
  const { theme } = useContext(ThemeContext); // Only re-renders on theme change
  // ... render logic
}

function CartIcon() {
  const { cart } = useContext(CartContext); // Only re-renders on cart change
  // ... render logic
}

function UserProfile() {
  const { user } = useContext(UserContext); // Only re-renders on user change
  // ... render logic
}
```

**Solution 2: Add React.memo to Pure Components (1 hour)**

```jsx
// ✅ Prevent re-renders for components that don't consume context
const ProductCard = React.memo(function ProductCard({ product }) {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`card ${theme}`}>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
});

// ✅ Memoize with custom comparison for expensive renders
const ProductList = React.memo(
  function ProductList({ products }) {
    const { theme } = useContext(ThemeContext);

    return (
      <div className={`product-grid ${theme}`}>
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    );
  },
  (prev, next) => {
    // Only re-render if products array actually changed
    return prev.products.length === next.products.length &&
           prev.products.every((p, i) => p.id === next.products[i].id);
  }
);
```

**Solution 3: Custom Hook for Cart Actions (30 minutes)**

```jsx
// ✅ Encapsulate cart logic in custom hook
function useCart() {
  const { cart, setCart } = useContext(CartContext);

  const addToCart = useCallback((item) => {
    setCart(prev => [...prev, item]);
  }, [setCart]);

  const removeFromCart = useCallback((itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  }, [setCart]);

  const updateQuantity = useCallback((itemId, quantity) => {
    setCart(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, [setCart]);

  return { cart, addToCart, removeFromCart, updateQuantity };
}

// Usage
function CartItem({ item }) {
  const { updateQuantity } = useCart(); // Only subscribes to cart context

  return (
    <div>
      <span>{item.name}</span>
      <input
        type="number"
        value={item.quantity}
        onChange={(e) => updateQuantity(item.id, +e.target.value)}
      />
    </div>
  );
}
```

**Results After Fix:**

**Performance Metrics (Chrome DevTools Performance tab):**
- Page load time: 3.2s → **0.8s** (75% improvement)
- Time to Interactive: 4.7s → **1.9s** (60% improvement)
- Cart update lag: 850ms → **45ms** (95% improvement)
- Component re-renders per cart update: 147 → **23** (84% reduction)
- Reconciliation time: 2.1s → **0.3s** (86% improvement)

**React DevTools Profiler:**
- ProductCard re-renders on cart update: 147 → **0** (now only re-renders on theme change)
- UserProfile re-renders on cart update: 147 → **0** (now only re-renders on user change)
- CartIcon re-renders on cart update: **23** (expected - displays cart count)

**Business Impact:**
- Bounce rate: 34% → 18% (47% reduction)
- Cart abandonment rate: 28% → 15% (46% reduction)
- Customer satisfaction score: 3.2/5 → 4.5/5

**Key Lessons:**
1. **Always memoize context values** - Use `useMemo` to prevent new object references
2. **Split contexts by update frequency** - Fast-changing data (cart) separate from slow-changing (theme)
3. **Profile before optimizing** - React DevTools Profiler reveals exact re-render patterns
4. **Use React.memo strategically** - Prevent cascade re-renders for pure components
5. **Monitor production metrics** - Set up performance budgets (TTI <2.5s, re-renders <30 per action)

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Context API vs Alternatives</strong></summary>



**Context API vs Prop Drilling vs External State Management - Decision Matrix**

**Scenario 1: Theme Management (Global, Rarely Changes)**

| Approach | Setup Time | Performance | Maintenance | Verdict |
|----------|-----------|-------------|-------------|---------|
| **Context API** | 10 min | Excellent (changes rare) | Simple | ✅ **BEST CHOICE** |
| **Prop Drilling** | 5 min | Excellent | High burden (3+ levels) | ❌ Avoid |
| **Redux** | 45 min | Excellent | Overkill (boilerplate) | ❌ Overkill |
| **Zustand** | 15 min | Excellent | Overkill | ❌ Overkill |

**Recommendation:** Context API wins - minimal setup, perfect for infrequent changes, no external dependencies.

```jsx
// ✅ Context API - Perfect for theme
const ThemeContext = React.createContext('light');

function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Dashboard />
    </ThemeContext.Provider>
  );
}
```

---

**Scenario 2: Shopping Cart (Frequent Updates, 50+ Components)**

| Approach | Setup Time | Performance | Maintenance | Verdict |
|----------|-----------|-------------|-------------|---------|
| **Context API** | 10 min | ⚠️ Poor (all consumers re-render) | Simple | ❌ Performance issues |
| **Context + useMemo + Split** | 30 min | Good (with optimization) | Moderate complexity | ⚠️ Acceptable |
| **Redux** | 45 min | Excellent (selectors) | High (boilerplate) | ✅ For large apps |
| **Zustand** | 15 min | Excellent (selectors) | Low | ✅ **BEST CHOICE** |

**Recommendation:** Zustand wins for medium apps (50-200 components), Redux for large apps (200+), Context API only with heavy optimization.

```jsx
// ❌ Context API - All 50+ components re-render on cart update
const CartContext = React.createContext();

function App() {
  const [cart, setCart] = useState([]);
  return (
    <CartContext.Provider value={{ cart, setCart }}>
      <ProductList /> {/* 50 components re-render unnecessarily */}
    </CartContext.Provider>
  );
}

// ✅ Zustand - Only subscribed components re-render
import create from 'zustand';

const useCartStore = create((set) => ({
  cart: [],
  addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
}));

function CartIcon() {
  const cart = useCartStore((state) => state.cart); // Selector!
  return <span>{cart.length}</span>;
}

function ProductCard() {
  const addToCart = useCartStore((state) => state.addToCart); // No re-render!
  return <button onClick={() => addToCart(product)}>Add</button>;
}
```

---

**Scenario 3: Form State (Local to Form Component)**

| Approach | Setup Time | Performance | Maintenance | Verdict |
|----------|-----------|-------------|-------------|---------|
| **Context API** | 10 min | ❌ Poor (unnecessary global) | Overkill | ❌ Wrong tool |
| **Local useState** | 2 min | Excellent | Simple | ✅ **BEST CHOICE** |
| **React Hook Form** | 15 min | Excellent (uncontrolled) | Library dependency | ✅ For complex forms |
| **Redux** | 45 min | Excellent | Massive overkill | ❌ Never |

**Recommendation:** Keep form state local unless shared across multiple routes/components.

```jsx
// ❌ Context API - Overkill for local form
const FormContext = React.createContext();

function FormProvider({ children }) {
  const [formData, setFormData] = useState({});
  return <FormContext.Provider value={{ formData, setFormData }}>{children}</FormContext.Provider>;
}

// ✅ Local useState - Perfect for form
function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    api.submitForm(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
    </form>
  );
}
```

---

**Scenario 4: Authentication State (Global, Moderate Updates)**

| Approach | Setup Time | Performance | Maintenance | Verdict |
|----------|-----------|-------------|-------------|---------|
| **Context API** | 15 min | Good (split user/session) | Simple | ✅ **BEST CHOICE** |
| **Prop Drilling** | 5 min | Good | Nightmare | ❌ Avoid |
| **Redux** | 60 min | Excellent | Overkill | ⚠️ Only for large apps |
| **Zustand** | 20 min | Excellent | Good | ✅ Alternative |

**Recommendation:** Context API wins for most apps - auth changes are infrequent, wide component access needed.

```jsx
// ✅ Context API - Perfect for auth
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  const login = useCallback(async (credentials) => {
    const { user, session } = await api.login(credentials);
    setUser(user);
    setSession(session);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSession(null);
  }, []);

  const value = useMemo(() => ({ user, session, login, logout }), [user, session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

---

**Performance Comparison: Context API vs Redux vs Zustand**

**Test:** Update cart item in app with 200 components

| Library | Re-renders | Update Time | Bundle Size | Verdict |
|---------|-----------|-------------|-------------|---------|
| **Context API (naive)** | 200 | 850ms | 0 KB | ❌ Slowest |
| **Context API (optimized)** | 23 | 120ms | 0 KB | ✅ Good for small apps |
| **Redux** | 15 | 45ms | 42 KB | ✅ Best performance |
| **Zustand** | 15 | 50ms | 3.2 KB | ✅ **BEST TRADE-OFF** |

**Key Insights:**
- **Context API naive:** Re-renders ALL consumers, slowest
- **Context API optimized:** Requires manual splitting + memoization, fragile
- **Redux:** Best performance, but 42 KB + boilerplate
- **Zustand:** Near-Redux performance, 13× smaller bundle, minimal boilerplate

---

**Decision Tree: When to Use Context API**

```
Does data need to be accessed by 3+ component levels deep?
├─ NO → Use local state (useState)
└─ YES → Continue

Does data update frequently (>5 times/second)?
├─ YES → Use Zustand/Redux (selectors needed)
└─ NO → Continue

Is data simple (theme, locale, auth)?
├─ YES → ✅ USE CONTEXT API
└─ NO → Continue

Can you split into multiple contexts by update frequency?
├─ YES → ✅ USE CONTEXT API (with optimization)
└─ NO → Use Zustand/Redux

Is app large (200+ components)?
├─ YES → Use Redux (DevTools, middleware, ecosystem)
└─ NO → Use Zustand (simplicity, selectors)
```

---

**Common Pitfalls and Fixes**

**Pitfall 1: Non-Memoized Provider Values**
```jsx
// ❌ New object every render
<ThemeContext.Provider value={{ theme, setTheme }}>

// ✅ Memoized value
const value = useMemo(() => ({ theme, setTheme }), [theme]);
<ThemeContext.Provider value={value}>
```

**Pitfall 2: Monolithic Context**
```jsx
// ❌ One context for everything
<AppContext.Provider value={{ user, cart, theme, settings }}>

// ✅ Split by update frequency
<UserContext.Provider value={user}>
  <CartContext.Provider value={cart}>
    <ThemeContext.Provider value={theme}>
```

**Pitfall 3: Missing Default Values**
```jsx
// ❌ Null default requires checks everywhere
const ThemeContext = React.createContext(null);
const { theme } = useContext(ThemeContext); // Could be null!

// ✅ Proper default
const ThemeContext = React.createContext({ theme: 'light', setTheme: () => {} });
```

**Final Recommendation:**
- **Small apps (<50 components):** Context API for global state, useState for local
- **Medium apps (50-200 components):** Context for slow-changing (auth, theme), Zustand for fast-changing (cart, notifications)
- **Large apps (200+ components):** Redux for complex state, Context for simple global state
- **Always:** Profile with React DevTools before optimizing, measure re-renders

---

### 💬 Explain to Junior

**Analogy: School Announcement System vs Passing Notes**

Imagine you're in a school with 100 classrooms (components). The principal (parent component) needs to share the lunch menu (state) with every classroom.

**Passing Notes (Prop Drilling):**

The principal tells the vice-principal, who tells the department head, who tells the floor supervisor, who tells the teachers, who tell the students. If the lunch menu changes, you have to pass a new note through this entire chain. Annoying!

```jsx
// ❌ Prop drilling - like passing notes through 5 people
function School() {
  const [lunchMenu, setLunchMenu] = useState('Pizza');

  return <Floor menu={lunchMenu} />;
}

function Floor({ menu }) {
  return <Hallway menu={menu} />;
}

function Hallway({ menu }) {
  return <Classroom menu={menu} />;
}

function Classroom({ menu }) {
  return <Student menu={menu} />;
}

function Student({ menu }) {
  return <div>Today's lunch: {menu}</div>;
}
```

**Context API (Announcement System):**

Instead, the principal uses the PA system (Context Provider). Every classroom (component) has a speaker (useContext hook) and can hear announcements directly. No need to pass notes through 5 people!

```jsx
// ✅ Context API - like a school PA system
const LunchMenuContext = React.createContext();

function School() {
  const [lunchMenu, setLunchMenu] = useState('Pizza');

  // Principal broadcasts on PA system
  return (
    <LunchMenuContext.Provider value={lunchMenu}>
      <Floor />
    </LunchMenuContext.Provider>
  );
}

function Floor() {
  return <Hallway />;
}

function Hallway() {
  return <Classroom />;
}

function Classroom() {
  return <Student />;
}

function Student() {
  // Student hears announcement directly from speaker
  const menu = useContext(LunchMenuContext);
  return <div>Today's lunch: {menu}</div>;
}
```

**When the PA System Becomes a Problem:**

Now imagine the principal uses the PA system for EVERYTHING - lunch menu, class schedule, homework assignments, weather, sports scores. Every time ANY announcement is made, EVERY classroom stops what they're doing to listen, even if it's not relevant to them.

```jsx
// ❌ One context for everything - everyone listens to every announcement
const SchoolContext = React.createContext();

function School() {
  const [lunchMenu, setLunchMenu] = useState('Pizza');
  const [weather, setWeather] = useState('Sunny');
  const [homework, setHomework] = useState('Math p.42');

  return (
    <SchoolContext.Provider value={{ lunchMenu, weather, homework }}>
      <Classroom />
    </SchoolContext.Provider>
  );
}

function Classroom() {
  const { lunchMenu, weather, homework } = useContext(SchoolContext);

  // 🚨 This classroom re-renders even if only weather changed
  // but they only care about lunchMenu!

  return <div>Today's lunch: {lunchMenu}</div>;
}
```

**Solution: Multiple PA Systems (Split Contexts):**

Instead of one PA system for everything, have separate channels - one for lunch, one for weather, one for homework. Classrooms only tune into the channels they care about.

```jsx
// ✅ Split contexts - separate channels for different topics
const LunchMenuContext = React.createContext();
const WeatherContext = React.createContext();
const HomeworkContext = React.createContext();

function School() {
  const [lunchMenu, setLunchMenu] = useState('Pizza');
  const [weather, setWeather] = useState('Sunny');
  const [homework, setHomework] = useState('Math p.42');

  return (
    <LunchMenuContext.Provider value={lunchMenu}>
      <WeatherContext.Provider value={weather}>
        <HomeworkContext.Provider value={homework}>
          <Classroom />
        </HomeworkContext.Provider>
      </WeatherContext.Provider>
    </LunchMenuContext.Provider>
  );
}

function Classroom() {
  const lunchMenu = useContext(LunchMenuContext); // Only listens to lunch channel

  // ✅ This classroom ONLY re-renders when lunch menu changes,
  // not when weather or homework changes!

  return <div>Today's lunch: {lunchMenu}</div>;
}
```

---

**Simple Rules for Beginners:**

**Rule 1: Use Context for "Global" Data**

If 3 or more component levels need the same data, use Context instead of passing props.

```jsx
// ❌ Prop drilling through 3+ levels
<App theme="dark">
  <Header theme="dark">
    <Nav theme="dark">
      <Button theme="dark" />

// ✅ Context - skip the middlemen
const ThemeContext = React.createContext('light');

<ThemeContext.Provider value="dark">
  <App>
    <Header>
      <Nav>
        <Button /> {/* Gets theme from context directly */}
```

**Rule 2: Always Wrap Value in useMemo**

Otherwise, every component using the context re-renders on EVERY parent render, even if the value didn't change.

```jsx
// ❌ New object every render - all consumers re-render
function App() {
  const [theme, setTheme] = useState('dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Dashboard />
    </ThemeContext.Provider>
  );
}

// ✅ Memoized - only re-renders when theme actually changes
function App() {
  const [theme, setTheme] = useState('dark');

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <Dashboard />
    </ThemeContext.Provider>
  );
}
```

**Rule 3: Split Contexts by How Often They Change**

Fast-changing data (cart, notifications) separate from slow-changing (theme, auth).

```jsx
// ❌ Cart updates trigger theme components to re-render
<AppContext.Provider value={{ cart, theme }}>

// ✅ Cart updates only affect cart components
<CartContext.Provider value={cart}>
  <ThemeContext.Provider value={theme}>
```

**Rule 4: For Frequently Updating Data, Consider Alternatives**

If data updates more than 5 times per second (e.g., real-time stock prices, game state), Context API will cause performance problems. Use Zustand, Redux, or local state instead.

---

**Interview Answer Template:**

**Q: When should you use Context API vs prop drilling vs Redux?**

**Structured Answer (2-3 minutes):**

"Context API is React's built-in solution for sharing data across the component tree without prop drilling. I use it when data needs to be accessed by multiple components at different nesting levels, but doesn't update frequently.

**When I use Context API:**
- Theme management - changes rarely, needed everywhere
- User authentication - shared across many components, updates on login/logout
- Localization settings - global data that rarely changes

**When I avoid Context API:**
- Frequently updating data like shopping carts or real-time feeds - all consumers re-render on every update, causing performance issues
- Complex state logic - Context doesn't have built-in selectors or middleware like Redux

**Example from a recent project:**
We had a dashboard with 150 components sharing user data, cart, and theme. Initially, we used one large context, but noticed 850ms lag on cart updates because all 150 components re-rendered. I split it into separate contexts - UserContext, CartContext, ThemeContext - and memoized each value. This reduced re-renders from 147 to 23 per cart update, cutting lag to 45ms.

**Key practices I follow:**
1. Always memoize context values with useMemo to prevent unnecessary re-renders
2. Split contexts by update frequency - fast-changing separate from slow-changing
3. Use React DevTools Profiler to measure re-renders before optimizing
4. For complex state with selectors, I prefer Zustand over Context - smaller bundle than Redux with better performance than Context

**Decision tree:**
- Data needed 3+ levels deep? Consider Context
- Updates frequently? Use Zustand or Redux
- Simple global state like theme/auth? Context API is perfect"

**Common Follow-up Questions:**

**Q: How do you prevent re-renders with Context?**
"Three strategies: First, memoize the provider value with useMemo. Second, split contexts by update frequency. Third, use React.memo on consumer components that don't need to re-render. I also profile with React DevTools Profiler to measure actual re-render counts before optimizing."

**Q: Context API vs Redux - when to use each?**
"Context API for simple global state that changes rarely - theme, auth, locale. Redux for complex state with frequent updates, middleware needs, or time-travel debugging. For most apps under 200 components, I use Context for slow-changing data and Zustand for fast-changing - it has Redux's performance with Context's simplicity."

**Q: Can you have multiple contexts?**
"Yes, and I recommend it! Split contexts by concern - one for auth, one for theme, one for cart. Components only subscribe to contexts they need, minimizing re-renders. Order doesn't matter for subscriptions, but inner providers override outer ones for the same context."

**Red Flags to Avoid:**
- ❌ "Context is always better than prop drilling" (not for local state)
- ❌ "Context replaces Redux" (different use cases)
- ❌ "Context has no performance issues" (naive usage causes re-render storms)
- ❌ Not mentioning memoization or splitting strategies

</details>

---

