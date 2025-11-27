# React Lifecycle Methods

## Question 1: What are React lifecycle methods and how do they map to hooks?

### Answer

React lifecycle methods are special methods in class components that allow developers to hook into specific moments in a component's lifetime. These methods execute at different stages: when a component mounts (is created and inserted into the DOM), updates (re-renders due to prop or state changes), or unmounts (is removed from the DOM).

With the introduction of React Hooks in version 16.8, functional components gained the ability to use state and lifecycle features previously only available in class components. The primary hook for handling lifecycle events is `useEffect`, which can replicate the behavior of `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` through its dependency array and cleanup function mechanism.

**Class Lifecycle Methods to Hooks Mapping:**

| Class Method | Hook Equivalent | Purpose |
|-------------|----------------|---------|
| `componentDidMount` | `useEffect(() => {}, [])` | Run once after initial render |
| `componentDidUpdate` | `useEffect(() => {})` | Run after every render |
| `componentWillUnmount` | `useEffect(() => { return () => {} }, [])` | Cleanup before unmounting |
| `shouldComponentUpdate` | `React.memo()` / `useMemo` | Prevent unnecessary re-renders |
| `getDerivedStateFromProps` | `useState` + `useEffect` | Sync state with props |
| `componentDidCatch` | No direct equivalent (use Error Boundaries) | Error handling |

While class components use distinct methods for different lifecycle phases, hooks consolidate this logic into a single `useEffect` API, making code more concise and reducing the need to duplicate logic across multiple lifecycle methods.

---

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

#### Class Component Lifecycle Architecture

React class components have three main lifecycle phases, each with specific methods:

**1. Mounting Phase (Component Creation):**
```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    // 1️⃣ First: Initialize state and bind methods
    this.state = { count: 0 };
  }

  static getDerivedStateFromProps(props, state) {
    // 2️⃣ Second: Sync state with props (rarely used)
    // Must return state update object or null
    return null;
  }

  render() {
    // 3️⃣ Third: Return JSX
    return <div>{this.state.count}</div>;
  }

  componentDidMount() {
    // 4️⃣ Fourth: After DOM insertion
    // Perfect for API calls, subscriptions, DOM manipulation
    this.fetchData();
  }
}
```

**2. Updating Phase (Re-renders):**
```javascript
class MyComponent extends React.Component {
  static getDerivedStateFromProps(props, state) {
    // 1️⃣ First: Before every re-render
    return null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    // 2️⃣ Second: Optimization point
    // Return false to skip rendering
    return nextState.count !== this.state.count;
  }

  render() {
    // 3️⃣ Third: Create new React elements
    return <div>{this.state.count}</div>;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // 4️⃣ Fourth: Capture DOM info before changes
    // Return value passed to componentDidUpdate
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // 5️⃣ Fifth: After DOM updates
    // Perfect for comparing prev/current state
    if (prevState.count !== this.state.count) {
      this.trackAnalytics();
    }
  }
}
```

**3. Unmounting Phase (Component Removal):**
```javascript
class MyComponent extends React.Component {
  componentWillUnmount() {
    // Clean up subscriptions, timers, listeners
    this.subscription.unsubscribe();
    clearInterval(this.timer);
  }
}
```

#### React Fiber and Lifecycle Execution

React Fiber (React 16+) introduced a two-phase rendering architecture:

**Render Phase (Can be interrupted/paused):**
- `constructor`
- `getDerivedStateFromProps`
- `shouldComponentUpdate`
- `render`

These methods must be pure (no side effects) because React may call them multiple times or discard the work.

**Commit Phase (Synchronous, cannot be interrupted):**
- `getSnapshotBeforeUpdate`
- `componentDidMount`
- `componentDidUpdate`
- `componentWillUnmount`

Side effects (API calls, subscriptions) must only occur in commit phase methods.

#### Hooks Architecture: useEffect Deep Dive

`useEffect` consolidates all lifecycle behavior through two mechanisms:

**1. Dependency Array Controls When Effect Runs:**
```javascript
// ❌ BAD: Runs after EVERY render (performance issue)
useEffect(() => {
  fetchData();
});

// ✅ GOOD: Runs only on mount
useEffect(() => {
  fetchData();
}, []);

// ✅ GOOD: Runs when userId changes
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ✅ GOOD: Runs when either changes
useEffect(() => {
  fetchData(userId, filter);
}, [userId, filter]);
```

**2. Cleanup Function Handles Unmounting:**
```javascript
useEffect(() => {
  const subscription = subscribeToData();
  const timer = setInterval(() => {}, 1000);

  // Cleanup runs:
  // 1. Before effect re-runs (if dependencies changed)
  // 2. When component unmounts
  return () => {
    subscription.unsubscribe();
    clearInterval(timer);
  };
}, [dependencies]);
```

#### Complete Mapping Examples

**componentDidMount + componentWillUnmount:**
```javascript
// ❌ Class Component (11 lines)
class DataFetcher extends React.Component {
  componentDidMount() {
    this.subscription = api.subscribe(this.props.userId, (data) => {
      this.setState({ data });
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }
}

// ✅ Functional Component (6 lines)
function DataFetcher({ userId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const subscription = api.subscribe(userId, setData);
    return () => subscription.unsubscribe();
  }, [userId]);
}
```

**componentDidUpdate with Previous Value Comparison:**
```javascript
// ❌ Class Component
class SearchComponent extends React.Component {
  componentDidUpdate(prevProps) {
    if (prevProps.query !== this.props.query) {
      this.fetchResults(this.props.query);
    }
  }
}

// ✅ Functional Component
function SearchComponent({ query }) {
  useEffect(() => {
    fetchResults(query);
  }, [query]); // Automatically runs only when query changes
}
```

**shouldComponentUpdate → React.memo:**
```javascript
// ❌ Class Component
class ExpensiveComponent extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.data !== this.props.data;
  }

  render() {
    return <div>{/* expensive rendering */}</div>;
  }
}

// ✅ Functional Component
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive rendering */}</div>;
}, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  return prevProps.data === nextProps.data;
});
```

#### getDerivedStateFromProps Modern Alternative

```javascript
// ❌ OLD: Class component with getDerivedStateFromProps
class UserProfile extends React.Component {
  state = { displayName: '' };

  static getDerivedStateFromProps(props, state) {
    // Runs on every render, can cause bugs
    if (props.userName !== state.prevUserName) {
      return {
        displayName: props.userName.toUpperCase(),
        prevUserName: props.userName
      };
    }
    return null;
  }
}

// ✅ NEW: Functional component with useMemo
function UserProfile({ userName }) {
  // Computed on demand, properly memoized
  const displayName = useMemo(
    () => userName.toUpperCase(),
    [userName]
  );

  return <div>{displayName}</div>;
}

// ✅ OR: If you need stateful derived data
function UserProfile({ userName }) {
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    setDisplayName(userName.toUpperCase());
  }, [userName]);
}
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

#### Scenario: E-commerce Product Search with Critical Lifecycle Bugs

**Context:** An e-commerce platform with 2M daily active users experienced severe performance degradation and memory leaks in their product search feature. Users reported slow search responses (5-8 seconds instead of <500ms) and browser crashes after prolonged use.

**Initial Buggy Implementation:**

```javascript
// ❌ PROBLEMATIC: Multiple lifecycle anti-patterns
class ProductSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      isLoading: false
    };
  }

  // 🚨 BUG #1: Side effects in constructor
  constructor(props) {
    super(props);
    this.state = { results: [] };
    // ❌ NEVER do side effects in constructor!
    fetch(`/api/products?q=${props.initialQuery}`)
      .then(res => res.json())
      .then(data => this.setState({ results: data }));
  }

  // 🚨 BUG #2: setState in render (infinite loop)
  render() {
    if (this.props.query && !this.state.isLoading) {
      // ❌ Causes infinite re-render loop!
      this.setState({ isLoading: true });
    }
    return <div>{/* ... */}</div>;
  }

  // 🚨 BUG #3: Missing cleanup in componentDidMount
  componentDidMount() {
    // ❌ Event listener never removed
    window.addEventListener('scroll', this.handleScroll);

    // ❌ Interval never cleared
    this.pollInterval = setInterval(() => {
      this.fetchNewProducts();
    }, 5000);
  }

  // 🚨 BUG #4: componentDidUpdate without guards
  componentDidUpdate(prevProps) {
    // ❌ No comparison, runs on EVERY update
    this.fetchProducts(this.props.query);

    // ❌ Even worse: can trigger infinite loop
    this.setState({ timestamp: Date.now() });
  }

  // 🚨 BUG #5: Missing componentWillUnmount
  // No cleanup = memory leak!
}
```

**Production Impact Metrics:**
- **Search latency**: 5,800ms average (target: <500ms)
- **Memory leaks**: 15MB/minute growth (100+ event listeners accumulating)
- **Browser crashes**: 234 crashes/day (mobile devices running out of memory)
- **Bounce rate increase**: 34% users abandoned search after 3+ seconds
- **Revenue impact**: Estimated $12K/day loss from abandoned searches

**Debugging Process:**

**Step 1: React DevTools Profiler**
```bash
# Identified components re-rendering 40+ times per search
# ProductSearch component: 87ms average render time
# Cascading re-renders in child components
```

**Step 2: Chrome Performance Monitor**
```javascript
// Memory leak detected:
// - Initial: 45MB heap
// - After 5 minutes: 320MB heap
// - After 10 minutes: 580MB heap (browser crash)

// Event listeners growing:
console.log(window.getEventListeners(window).scroll.length);
// After 1 minute: 12 listeners
// After 5 minutes: 60 listeners
```

**Step 3: Network Tab Analysis**
```bash
# Duplicate API calls detected:
# - Same query called 4 times in 200ms
# - 600+ requests in 2 minutes (should be ~20)
```

**Fixed Implementation (Class Component):**

```javascript
// ✅ FIXED: Proper lifecycle management
class ProductSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      isLoading: false
    };
    // ✅ Only initialization, no side effects
    this.abortController = null;
  }

  componentDidMount() {
    // ✅ Side effects in componentDidMount
    this.fetchProducts(this.props.query);

    // ✅ Store references for cleanup
    this.handleScroll = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.handleScroll);

    this.pollInterval = setInterval(() => {
      this.fetchNewProducts();
    }, 5000);
  }

  componentDidUpdate(prevProps) {
    // ✅ Guard against unnecessary calls
    if (prevProps.query !== this.props.query) {
      this.fetchProducts(this.props.query);
    }
  }

  componentWillUnmount() {
    // ✅ Clean up ALL subscriptions and listeners
    window.removeEventListener('scroll', this.handleScroll);
    clearInterval(this.pollInterval);

    // ✅ Cancel in-flight requests
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  fetchProducts(query) {
    // ✅ Cancel previous request
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    this.setState({ isLoading: true });

    fetch(`/api/products?q=${query}`, {
      signal: this.abortController.signal
    })
      .then(res => res.json())
      .then(data => {
        this.setState({ results: data, isLoading: false });
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          this.setState({ isLoading: false });
        }
      });
  }

  render() {
    // ✅ Pure render, no side effects
    return (
      <div>
        {this.state.isLoading && <Spinner />}
        {this.state.results.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    );
  }
}
```

**Migrated to Hooks (Best Solution):**

```javascript
// ✅ BEST: Functional component with hooks
function ProductSearch({ query }) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fetch products when query changes
  useEffect(() => {
    const abortController = new AbortController();

    setIsLoading(true);
    fetch(`/api/products?q=${query}`, {
      signal: abortController.signal
    })
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setIsLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setIsLoading(false);
        }
      });

    // ✅ Cleanup runs automatically
    return () => abortController.abort();
  }, [query]); // Only re-run when query changes

  // ✅ Separate effect for scroll listener
  useEffect(() => {
    const handleScroll = () => {
      // Handle infinite scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Only mount/unmount

  // ✅ Separate effect for polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNewProducts();
    }, 5000);

    return () => clearInterval(interval);
  }, []); // Only mount/unmount

  return (
    <div>
      {isLoading && <Spinner />}
      {results.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
```

**Post-Fix Metrics:**
- **Search latency**: 420ms average (93% improvement)
- **Memory usage**: Stable at 48-52MB (no leaks)
- **Browser crashes**: 0 crashes/day
- **API calls**: Reduced from 600+ to 18 per session (97% reduction)
- **Bounce rate**: Dropped to 8% (74% improvement)
- **Revenue recovery**: $11K/day recovered

**Key Lessons:**
1. **Never put side effects in constructor/render** - Use componentDidMount or useEffect
2. **Always clean up** - Every subscription/listener needs cleanup
3. **Guard componentDidUpdate** - Compare prev props/state to avoid infinite loops
4. **Cancel in-flight requests** - Use AbortController to prevent state updates on unmounted components
5. **Separate concerns in hooks** - Use multiple useEffect hooks instead of one giant effect

</details>

---

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

#### Class Components vs Functional Components with Hooks

**Class Components:**

**Advantages:**
1. **Explicit lifecycle control** - Clear separation between mount, update, unmount phases
2. **Error boundaries** - `componentDidCatch` and `getDerivedStateFromError` only work in class components
3. **Familiar to senior developers** - Well-established patterns from pre-Hooks era
4. **Single update method** - `componentDidUpdate` handles all prop/state changes in one place
5. **Instance methods** - Easy to share methods between lifecycle and event handlers

**Disadvantages:**
1. **Verbose boilerplate** - More code for same functionality
2. **Logic duplication** - Same logic split across componentDidMount and componentDidUpdate
3. **`this` binding complexity** - Need to bind methods or use arrow functions
4. **Harder to extract reusable logic** - No equivalent to custom hooks
5. **Bundle size** - Classes don't minify as well as functions

**Performance Comparison:**
```javascript
// Class Component: ~180 lines for complex feature
class UserDashboard extends React.Component {
  componentDidMount() {
    this.fetchUser();
    this.subscribeToNotifications();
    this.trackPageView();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser();
    }
  }

  componentWillUnmount() {
    this.unsubscribeFromNotifications();
  }

  // + 15 more methods
}

// Functional Component: ~90 lines for same feature
function UserDashboard({ userId }) {
  useEffect(() => {
    fetchUser();
  }, [userId]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications();
    return unsubscribe;
  }, []);

  useEffect(() => {
    trackPageView();
  }, []);

  // Custom hooks extract reusable logic
  const userData = useUserData(userId);
  const notifications = useNotifications();
}
```

**Functional Components with Hooks:**

**Advantages:**
1. **Less boilerplate** - 40-60% less code for same functionality
2. **Reusable logic** - Custom hooks extract and share stateful logic
3. **No `this` confusion** - Closures instead of instance binding
4. **Easier testing** - Pure functions, no class instance mocking
5. **Better code splitting** - Tree-shaking works better with functions
6. **Concurrent features** - Full support for Concurrent React features

**Disadvantages:**
1. **Learning curve** - Closures, stale closures, useEffect dependencies can be confusing
2. **No error boundaries** - Must wrap with class component for error handling
3. **Different mental model** - Think in "effects" instead of lifecycle methods
4. **Dependency array footguns** - Easy to miss dependencies or create infinite loops
5. **Stale closure bugs** - Can accidentally capture old values

**When to Use Each:**

| Scenario | Recommendation | Reason |
|----------|---------------|---------|
| **New projects** | Functional + Hooks | Modern, less code, better tooling |
| **Error boundaries** | Class components | Only option currently |
| **Large existing codebase** | Mixed (migrate gradually) | Avoid big-bang rewrites |
| **Simple presentational** | Functional | No lifecycle needed anyway |
| **Complex state logic** | Functional + useReducer | More predictable than setState |
| **Reusable logic** | Custom hooks | Can't extract from classes |
| **Performance-critical** | Functional + React.memo | Better optimization options |

#### Lifecycle Complexity Trade-offs

**Multiple useEffect vs Single componentDidUpdate:**

```javascript
// ❌ ANTI-PATTERN: One giant useEffect
function Dashboard({ userId, filter, sortBy }) {
  useEffect(() => {
    // Hard to understand dependencies
    fetchUserData(userId);
    fetchFilteredResults(filter);
    updateAnalytics(sortBy);

    const subscription = subscribeToUpdates(userId, filter);
    return () => subscription.unsubscribe();
  }, [userId, filter, sortBy]); // All run when any changes
}

// ✅ BEST PRACTICE: Separate concerns
function Dashboard({ userId, filter, sortBy }) {
  // Only runs when userId changes
  useEffect(() => {
    fetchUserData(userId);
  }, [userId]);

  // Only runs when filter changes
  useEffect(() => {
    fetchFilteredResults(filter);
  }, [filter]);

  // Only runs when sortBy changes
  useEffect(() => {
    updateAnalytics(sortBy);
  }, [sortBy]);

  // Subscription with specific dependencies
  useEffect(() => {
    const subscription = subscribeToUpdates(userId, filter);
    return () => subscription.unsubscribe();
  }, [userId, filter]);
}
```

**Trade-off:**
- **Single effect**: Fewer effects to manage, but over-executes
- **Multiple effects**: More granular control, but more code

**Performance Impact:**
- Single effect: ~150ms wasted work per update (running all logic)
- Multiple effects: ~40ms (only necessary logic runs)

#### Optimization Trade-offs

**shouldComponentUpdate vs React.memo:**

```javascript
// Class Component: Fine-grained control
class ProductCard extends React.Component {
  shouldComponentUpdate(nextProps) {
    // Custom comparison logic
    return (
      nextProps.product.id !== this.props.product.id ||
      nextProps.product.price !== this.props.product.price
      // Ignore other props (like callbacks)
    );
  }
}

// Functional: Less control, but cleaner
const ProductCard = React.memo(
  ({ product, onSelect }) => {
    return <div>{product.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.price === nextProps.product.price
    );
  }
);
```

**Decision Matrix:**

| Need | Use This | Avoid This |
|------|---------|-----------|
| Prevent re-renders for expensive components | `React.memo` with comparison | Wrapping every component |
| Skip renders based on state | `useMemo` for computed values | `shouldComponentUpdate` in hooks |
| Memoize callbacks | `useCallback` | Creating new functions every render |
| Optimize child re-renders | `React.memo` on children | Premature optimization |

</details>

---

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

#### The Life of a Plant Analogy

Think of a React component like a plant growing in your garden:

**1. Mounting (Planting the Seed):**
```
🌱 Seed planted → 🌿 Sprout emerges → 🌳 Full tree
   constructor      render         componentDidMount
```

When you plant a seed (create a component), it goes through stages:
- **Constructor**: The seed has its DNA (initial state)
- **Render**: The sprout emerges from soil (JSX appears in virtual DOM)
- **componentDidMount**: The plant is fully visible in your garden (component in real DOM)

```javascript
// When you write <ProductCard />, React "plants" it:

function ProductCard() {
  // 1️⃣ First: Component function runs (like seed sprouting)
  const [count, setCount] = useState(0);

  // 3️⃣ Third: After visible in browser (like roots established)
  useEffect(() => {
    console.log('Component is now in the DOM!');
    // Perfect time to:
    // - Fetch data from API (like plant absorbing nutrients)
    // - Start subscriptions (like plant connecting to water source)
    // - Set up timers (like plant's internal clock)
  }, []); // Empty array = only run once when planted

  // 2️⃣ Second: Return JSX (like plant becoming visible)
  return <div>{count}</div>;
}
```

**2. Updating (Plant Growing & Changing):**
```
☀️ Sunlight changes → 🌳 Leaves adjust → 🍃 New growth
   Props/state change    render          componentDidUpdate
```

When conditions change (rain, sunlight, seasons), the plant adapts:
- **Props/state change**: Environment changes (like rain starting)
- **Render**: Plant adjusts (like leaves turning toward sun)
- **componentDidUpdate**: Plant finished adjusting (like new leaves fully grown)

```javascript
function ProductCard({ productId }) {
  const [data, setData] = useState(null);

  // Runs when productId changes (like seasons changing)
  useEffect(() => {
    console.log('Product ID changed! Fetching new data...');
    fetchProductData(productId).then(setData);
  }, [productId]); // Runs whenever productId changes

  return <div>{data?.name}</div>;
}

// When parent changes productId from 1 to 2:
// 1. React re-renders component (plant adjusts)
// 2. useEffect notices productId changed (season changed)
// 3. Effect runs, fetches new data (plant grows new leaves)
```

**3. Unmounting (Removing the Plant):**
```
✂️ Gardener pulls plant → 🗑️ Removed from garden
   Component removed        componentWillUnmount
```

When you remove a plant from your garden, you need to clean up:
- Remove stakes (cancel subscriptions)
- Turn off irrigation (clear timers)
- Clean up roots (remove event listeners)

```javascript
function ProductCard() {
  useEffect(() => {
    // Plant the irrigation system
    const interval = setInterval(() => {
      console.log('Auto-watering...');
    }, 1000);

    // CLEANUP: When plant removed, disconnect irrigation!
    return () => {
      clearInterval(interval);
      console.log('Irrigation disconnected');
    };
  }, []);

  return <div>Product</div>;
}

// ❌ WITHOUT cleanup:
// - Timers keep running (wasting water on empty soil)
// - Memory leaks (10 timers running for removed components)
// - Browser slows down (too many background tasks)

// ✅ WITH cleanup:
// - Timer stops when component removed
// - No memory leaks
// - Clean and efficient
```

#### Class Components vs Hooks (Simple Explanation)

**Class Components = Traditional Gardening:**
- You have separate tools for each task
- Planting tool (componentDidMount)
- Watering schedule (componentDidUpdate)
- Removal tool (componentWillUnmount)
- More organized but more tools to carry

**Hooks = Modern All-in-One Tool:**
- One multitool (useEffect) does everything
- Plant, water, and remove with same tool
- Less to carry, but need to learn how to use it

```javascript
// CLASS COMPONENT (Old way - separate tools)
class GardenPlant extends React.Component {
  // Tool #1: Planting
  componentDidMount() {
    this.startWatering();
  }

  // Tool #2: Checking if needs care
  componentDidUpdate(prevProps) {
    if (prevProps.season !== this.props.season) {
      this.adjustWatering();
    }
  }

  // Tool #3: Removal
  componentWillUnmount() {
    this.stopWatering();
  }
}

// FUNCTIONAL COMPONENT (New way - multitool)
function GardenPlant({ season }) {
  useEffect(() => {
    // Plant and start watering
    startWatering();

    // When removed, stop watering
    return () => stopWatering();
  }, []); // Only when planted/removed

  useEffect(() => {
    // Adjust when season changes
    adjustWatering();
  }, [season]); // When season changes
}
```

#### Interview Answer Template

**Question: "Explain React lifecycle methods and their hooks equivalents"**

**Template Answer:**

"React lifecycle methods are special functions in class components that run at specific times during a component's existence. There are three main phases:

**Mounting** is when the component first appears. In class components, we use `componentDidMount()` to run code after the component is in the DOM, like fetching data. In hooks, we use `useEffect` with an empty dependency array: `useEffect(() => { /* code */ }, [])`.

**Updating** happens when props or state change. Class components use `componentDidUpdate(prevProps, prevState)` to respond to changes. In hooks, we use `useEffect` with dependencies: `useEffect(() => { /* code */ }, [dependency])`.

**Unmounting** is cleanup before the component is removed. Class components use `componentWillUnmount()`, while hooks return a cleanup function from `useEffect`: `useEffect(() => { return () => { /* cleanup */ } }, [])`.

The key difference is that class components have separate methods for each phase, while hooks consolidate everything into `useEffect`. This makes hooks code more concise and reduces duplication, but you need to understand dependency arrays to control when effects run.

For example, if you have a subscription that needs cleanup:

```javascript
// Class
componentDidMount() {
  this.subscription = subscribe();
}
componentWillUnmount() {
  this.subscription.unsubscribe();
}

// Hooks (same logic, fewer lines)
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

Modern React development favors hooks because they're more concise, easier to test, and allow extracting reusable logic into custom hooks."

---

## Question 2: What is the component lifecycle flow in React? (mounting, updating, unmounting)

### Answer

The React component lifecycle represents the sequence of phases a component goes through from creation to removal. Understanding this flow is crucial for managing side effects, optimizing performance, and preventing memory leaks.

**Three Main Phases:**

**1. Mounting Phase (Birth):**
The component is being created and inserted into the DOM for the first time. This happens when you render a component initially or when a conditional component becomes visible.

**Order of execution:**
1. Constructor / useState initialization
2. getDerivedStateFromProps (class only)
3. render()
4. React updates DOM
5. componentDidMount / useEffect with `[]`

**2. Updating Phase (Life):**
The component re-renders due to changes in props, state, or parent re-renders. This phase can happen many times during a component's lifetime.

**Order of execution:**
1. getDerivedStateFromProps (class only)
2. shouldComponentUpdate (class only)
3. render()
4. getSnapshotBeforeUpdate (class only)
5. React updates DOM
6. componentDidUpdate / useEffect with dependencies

**3. Unmounting Phase (Death):**
The component is being removed from the DOM, either because a parent unmounted, a conditional render became false, or the component's route changed.

**Order of execution:**
1. componentWillUnmount / useEffect cleanup function

**Visual Flow:**
```
Component Created → Mounted → Updated (0-N times) → Unmounted
                      ↓          ↓                      ↓
                    Mount      Update               Cleanup
                    Phase      Phase                 Phase
```

---

### 🔍 Deep Dive

#### Complete Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     MOUNTING PHASE                           │
│  (Component being inserted into DOM for first time)         │
└─────────────────────────────────────────────────────────────┘

CLASS COMPONENT:                    FUNCTIONAL COMPONENT:
┌──────────────────┐               ┌──────────────────┐
│   constructor    │               │  Function call   │
│  (initialize     │               │  useState init   │
│   state)         │               └────────┬─────────┘
└────────┬─────────┘                        │
         │                                  │
         ▼                                  │
┌──────────────────┐                        │
│getDerivedState   │               ┌────────▼─────────┐
│   FromProps      │               │   render         │
│  (rare, avoid)   │               │  (return JSX)    │
└────────┬─────────┘               └────────┬─────────┘
         │                                  │
         ▼                                  │
┌──────────────────┐                        │
│     render       │                        │
│  (return JSX)    │                        │
└────────┬─────────┘                        │
         │                                  │
         └──────────┬───────────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │  React updates   │
         │    real DOM      │
         └────────┬─────────┘
                  │
                  ▼
┌──────────────────┐               ┌──────────────────┐
│componentDidMount │               │  useEffect with  │
│  (side effects)  │               │   [] dependency  │
└──────────────────┘               └──────────────────┘
         │                                  │
         └──────────────────────────────────┘
                  ▼
         Component is live!


┌─────────────────────────────────────────────────────────────┐
│                     UPDATING PHASE                           │
│     (Props/state changed, parent re-rendered, or            │
│      forceUpdate called)                                     │
└─────────────────────────────────────────────────────────────┘

Trigger: setState(), new props, parent re-render, forceUpdate()
         │
         ▼
┌──────────────────┐               ┌──────────────────┐
│getDerivedState   │               │  Function call   │
│   FromProps      │               │  (re-execution)  │
└────────┬─────────┘               └────────┬─────────┘
         │                                  │
         ▼                                  │
┌──────────────────┐                        │
│shouldComponent   │                        │
│    Update        │                        │
│ (optimization)   │                        │
└────────┬─────────┘                        │
         │                                  │
         │ return false? ────> Skip         │
         │ return true? ─┐                  │
         ▼               │                  │
┌──────────────────┐    │         ┌────────▼─────────┐
│     render       │    │         │   render         │
└────────┬─────────┘    │         │  (return JSX)    │
         │              │         └────────┬─────────┘
         ▼              │                  │
┌──────────────────┐    │                  │
│getSnapshotBefore │    │                  │
│     Update       │    │                  │
│(capture DOM info)│    │                  │
└────────┬─────────┘    │                  │
         │              │                  │
         └──────────┬───┴──────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │  React updates   │
         │    real DOM      │
         └────────┬─────────┘
                  │
                  ▼
┌──────────────────┐               ┌──────────────────┐
│componentDidUpdate│               │useEffect cleanup │
│ (prev props/     │               │   runs first,    │
│  state available)│               │ then effect runs │
└──────────────────┘               └──────────────────┘
         │                                  │
         └──────────────────────────────────┘
                  ▼
         Component updated!


┌─────────────────────────────────────────────────────────────┐
│                   UNMOUNTING PHASE                           │
│   (Component being removed from DOM)                         │
└─────────────────────────────────────────────────────────────┘

Trigger: Parent unmounts, conditional false, route change
         │
         ▼
┌──────────────────┐               ┌──────────────────┐
│componentWill     │               │  useEffect       │
│   Unmount        │               │   cleanup        │
│  (cleanup:       │               │  (return () =>   │
│   timers,        │               │   { cleanup })   │
│   listeners,     │               │                  │
│   subscriptions) │               │                  │
└────────┬─────────┘               └────────┬─────────┘
         │                                  │
         └──────────────────────────────────┘
                  ▼
         ┌──────────────────┐
         │  React removes   │
         │  from real DOM   │
         └──────────────────┘
                  ▼
         Component destroyed!
```

#### Detailed Phase Analysis with Code Examples

**1. Mounting Phase Deep Dive:**

```javascript
// ============================================
// CLASS COMPONENT MOUNTING
// ============================================
class UserProfile extends React.Component {
  // 1️⃣ FIRST: Constructor runs
  constructor(props) {
    super(props);
    console.log('1. Constructor - Initialize state');

    this.state = {
      user: null,
      loading: true
    };

    // ✅ DO: Initialize state, bind methods
    this.handleClick = this.handleClick.bind(this);

    // ❌ DON'T: Side effects, API calls, setState
    // fetch('/api/user'); // NEVER!
  }

  // 2️⃣ SECOND: getDerivedStateFromProps (rare)
  static getDerivedStateFromProps(props, state) {
    console.log('2. getDerivedStateFromProps');

    // Only use for deriving state from props
    // Most cases should use componentDidUpdate instead
    if (props.userId !== state.prevUserId) {
      return {
        loading: true,
        prevUserId: props.userId
      };
    }
    return null;
  }

  // 3️⃣ THIRD: Render
  render() {
    console.log('3. Render - Create React elements');

    // ✅ MUST be pure - no side effects!
    // ❌ DON'T: setState, API calls, subscriptions

    return (
      <div>
        {this.state.loading ? 'Loading...' : this.state.user.name}
      </div>
    );
  }

  // 4️⃣ FOURTH: React updates DOM (internal)
  // React takes JSX from render() and updates real DOM

  // 5️⃣ FIFTH: componentDidMount
  componentDidMount() {
    console.log('5. componentDidMount - Component in DOM!');

    // ✅ Perfect time for:
    // - API calls
    fetch(`/api/users/${this.props.userId}`)
      .then(res => res.json())
      .then(user => this.setState({ user, loading: false }));

    // - Subscriptions
    this.subscription = EventEmitter.subscribe('userUpdate', this.handleUpdate);

    // - DOM measurements
    const height = this.divRef.offsetHeight;

    // - Third-party integrations
    this.chart = new Chart(this.canvasRef, { /* config */ });
  }
}

// ============================================
// FUNCTIONAL COMPONENT MOUNTING
// ============================================
function UserProfile({ userId }) {
  // 1️⃣ FIRST: Function executes, hooks run
  console.log('1. Function call - Component rendering');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2️⃣ SECOND: Render (return JSX)
  console.log('2. Render - Create React elements');

  // 3️⃣ THIRD: React updates DOM (internal)

  // 4️⃣ FOURTH: useEffect with [] runs (equivalent to componentDidMount)
  useEffect(() => {
    console.log('4. useEffect (mount) - Component in DOM!');

    // ✅ Same side effects as componentDidMount
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(user => {
        setUser(user);
        setLoading(false);
      });

    const subscription = EventEmitter.subscribe('userUpdate', handleUpdate);

    // ✅ Return cleanup for unmount phase
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty array = only run on mount

  return (
    <div>
      {loading ? 'Loading...' : user.name}
    </div>
  );
}
```

**2. Updating Phase Deep Dive:**

```javascript
// ============================================
// CLASS COMPONENT UPDATING
// ============================================
class ProductList extends React.Component {
  state = {
    products: [],
    filters: { category: 'all' }
  };

  // 1️⃣ FIRST: getDerivedStateFromProps (every update)
  static getDerivedStateFromProps(props, state) {
    console.log('1. getDerivedStateFromProps (update)');
    // Runs on EVERY update, be careful!
    return null;
  }

  // 2️⃣ SECOND: shouldComponentUpdate (optimization gate)
  shouldComponentUpdate(nextProps, nextState) {
    console.log('2. shouldComponentUpdate');

    // Return false to skip re-render
    if (
      nextProps.category === this.props.category &&
      nextState.products === this.state.products
    ) {
      console.log('   → Skipping update (no changes)');
      return false;
    }

    console.log('   → Proceeding with update');
    return true;
  }

  // 3️⃣ THIRD: render
  render() {
    console.log('3. Render (update)');
    return (
      <div ref={this.listRef}>
        {this.state.products.map(p => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
    );
  }

  // 4️⃣ FOURTH: getSnapshotBeforeUpdate (capture pre-update DOM)
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('4. getSnapshotBeforeUpdate');

    // Capture scroll position before DOM updates
    if (prevState.products.length < this.state.products.length) {
      return this.listRef.scrollHeight;
    }
    return null;
  }

  // 5️⃣ FIFTH: React updates DOM (internal)

  // 6️⃣ SIXTH: componentDidUpdate
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('6. componentDidUpdate - DOM updated!');

    // ✅ Compare previous vs current
    if (prevProps.category !== this.props.category) {
      console.log('   → Category changed, fetching new products');
      this.fetchProducts(this.props.category);
    }

    // ✅ Use snapshot from getSnapshotBeforeUpdate
    if (snapshot !== null) {
      console.log('   → Adjusting scroll position');
      this.listRef.scrollTop += (this.listRef.scrollHeight - snapshot);
    }

    // ❌ DANGER: Infinite loop if no guards!
    // this.setState({ ... }); // Must have condition!
  }

  fetchProducts(category) {
    fetch(`/api/products?category=${category}`)
      .then(res => res.json())
      .then(products => this.setState({ products }));
  }
}

// ============================================
// FUNCTIONAL COMPONENT UPDATING
// ============================================
function ProductList({ category }) {
  const [products, setProducts] = useState([]);
  const listRef = useRef(null);

  // Effect runs when category changes
  useEffect(() => {
    console.log('useEffect (update) - category changed');

    fetch(`/api/products?category=${category}`)
      .then(res => res.json())
      .then(products => setProducts(products));
  }, [category]); // Dependency array = run when category changes

  // Separate effect for scroll management
  useEffect(() => {
    console.log('useEffect (update) - products changed');

    if (products.length > 0) {
      // Adjust scroll position
      listRef.current.scrollTop = 0;
    }
  }, [products]); // Run when products change

  // Optimization with React.memo (like shouldComponentUpdate)
  return (
    <div ref={listRef}>
      {products.map(p => (
        <MemoizedProductCard key={p.id} {...p} />
      ))}
    </div>
  );
}

// Equivalent to shouldComponentUpdate
const MemoizedProductCard = React.memo(
  ProductCard,
  (prevProps, nextProps) => {
    // Return true if equal (skip re-render)
    return prevProps.id === nextProps.id &&
           prevProps.price === nextProps.price;
  }
);
```

**3. Unmounting Phase Deep Dive:**

```javascript
// ============================================
// CLASS COMPONENT UNMOUNTING
// ============================================
class ChatRoom extends React.Component {
  componentDidMount() {
    // Set up resources
    this.socket = io.connect('ws://chat.example.com');
    this.socket.on('message', this.handleMessage);

    this.timer = setInterval(() => {
      this.checkOnlineStatus();
    }, 5000);

    window.addEventListener('beforeunload', this.handleUnload);
  }

  componentWillUnmount() {
    console.log('componentWillUnmount - Cleaning up!');

    // ✅ Clean up ALL resources
    this.socket.disconnect();
    this.socket.off('message', this.handleMessage);

    clearInterval(this.timer);

    window.removeEventListener('beforeunload', this.handleUnload);

    // ✅ Cancel in-flight requests
    if (this.abortController) {
      this.abortController.abort();
    }

    // ❌ DON'T: setState (component is dying!)
    // this.setState({ ... }); // React will warn!
  }

  render() {
    return <div>Chat Room</div>;
  }
}

// ============================================
// FUNCTIONAL COMPONENT UNMOUNTING
// ============================================
function ChatRoom() {
  useEffect(() => {
    console.log('useEffect - Setting up resources');

    const socket = io.connect('ws://chat.example.com');
    socket.on('message', handleMessage);

    const timer = setInterval(() => {
      checkOnlineStatus();
    }, 5000);

    const handleUnload = () => { /* ... */ };
    window.addEventListener('beforeunload', handleUnload);

    // ✅ Cleanup function (runs on unmount)
    return () => {
      console.log('useEffect cleanup - Cleaning up!');

      socket.disconnect();
      socket.off('message', handleMessage);
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []); // Empty array = only mount/unmount

  return <div>Chat Room</div>;
}
```

#### Commit Phase vs Render Phase

React Fiber architecture splits lifecycle into two phases:

**Render Phase (Can be paused/restarted):**
- Constructor
- getDerivedStateFromProps
- shouldComponentUpdate
- render
- **Must be pure** (no side effects)

**Commit Phase (Synchronous, cannot be interrupted):**
- getSnapshotBeforeUpdate
- componentDidMount
- componentDidUpdate
- componentWillUnmount
- **Can have side effects** (API calls, subscriptions)

```javascript
// ❌ WRONG: Side effect in render phase
function BadComponent() {
  // This runs during render phase - can run multiple times!
  fetch('/api/data'); // NEVER!

  return <div>Bad</div>;
}

// ✅ CORRECT: Side effect in commit phase
function GoodComponent() {
  useEffect(() => {
    // This runs during commit phase - guaranteed once
    fetch('/api/data');
  }, []);

  return <div>Good</div>;
}
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

#### Scenario: Social Media Feed with Critical Lifecycle Flow Issues

**Context:** A social media platform with 5M users experienced cascading failures in their news feed component. Users reported infinite loading spinners, duplicate posts appearing, memory consumption spiking to 2GB+ after 10 minutes of scrolling, and the browser becoming unresponsive.

**Production Metrics (Before Fix):**
- **Memory leaks**: 180MB/minute growth rate
- **Duplicate API calls**: 47 calls for single feed load (should be 1)
- **Render performance**: 2,400ms for feed update (target: <100ms)
- **Crash rate**: 890 browser crashes/day
- **User engagement**: Down 42% (users abandoning app)

**Initial Problematic Implementation:**

```javascript
// ❌ CRITICAL BUGS: Multiple lifecycle anti-patterns
class NewsFeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      page: 1,
      loading: false
    };

    // 🚨 BUG #1: API call in constructor
    // Runs BEFORE component is in DOM
    // Can cause race conditions
    fetch(`/api/feed?page=${this.state.page}`)
      .then(res => res.json())
      .then(posts => {
        // May call setState before component mounted!
        this.setState({ posts });
      });
  }

  componentDidMount() {
    // 🚨 BUG #2: No cleanup for scroll listener
    window.addEventListener('scroll', this.handleScroll);

    // 🚨 BUG #3: Redundant fetch (already called in constructor)
    this.fetchPosts();

    // 🚨 BUG #4: WebSocket never closed
    this.ws = new WebSocket('wss://api.example.com/live');
    this.ws.onmessage = (event) => {
      const newPost = JSON.parse(event.data);
      this.setState(prevState => ({
        posts: [newPost, ...prevState.posts]
      }));
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // 🚨 BUG #5: No guards, runs on EVERY update
    this.fetchPosts(); // Infinite loop!

    // 🚨 BUG #6: setState without condition
    this.setState({ timestamp: Date.now() }); // Triggers another update!

    // 🚨 BUG #7: Expensive DOM operation every update
    const element = document.getElementById('feed-container');
    element.style.height = `${window.innerHeight}px`;
  }

  // 🚨 BUG #8: Missing componentWillUnmount entirely!
  // No cleanup = massive memory leaks

  handleScroll = () => {
    // 🚨 BUG #9: Not debounced, fires 100+ times/second
    const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight;
    if (bottom && !this.state.loading) {
      this.setState({ page: this.state.page + 1 }, () => {
        this.fetchPosts();
      });
    }
  };

  fetchPosts() {
    // 🚨 BUG #10: No abort mechanism
    fetch(`/api/feed?page=${this.state.page}`)
      .then(res => res.json())
      .then(posts => {
        // Can set state after unmount!
        this.setState(prevState => ({
          posts: [...prevState.posts, ...posts]
        }));
      });
  }

  render() {
    return (
      <div id="feed-container">
        {this.state.posts.map(post => (
          <Post key={post.id} {...post} />
        ))}
      </div>
    );
  }
}
```

**Debugging Process:**

**Step 1: React DevTools Profiler**
```bash
# Flamegraph Analysis:
- NewsFeed component: 2,400ms render time
- componentDidUpdate called 87 times in 3 seconds
- Each update triggers fetchPosts (87 API calls!)
- Cascading re-renders in child Post components
```

**Step 2: Chrome Performance Monitor**
```javascript
// Memory snapshot comparison:
// Initial: 65MB
// After 1 minute: 245MB (+180MB)
// After 5 minutes: 965MB (+900MB)
// After 10 minutes: 1.8GB (browser crash)

// Event listeners analysis:
console.log(getEventListeners(window).scroll);
// Expected: 1 scroll listener
// Actual: 143 scroll listeners (each feed instance adding more!)
```

**Step 3: Network Tab Analysis**
```bash
# Waterfall view:
- Same API endpoint called 47 times in 2 seconds
- Requests not cancelling when component updates
- 16 simultaneous WebSocket connections (should be 1)
```

**Step 4: Console Warnings**
```javascript
// Warning: Can't perform a React state update on an unmounted component
// (fetchPosts completing after unmount - 234 occurrences)

// Warning: Maximum update depth exceeded
// (componentDidUpdate setState loop - infinite)
```

**Fixed Implementation (Class Component):**

```javascript
// ✅ FIXED: Proper lifecycle management
class NewsFeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      page: 1,
      loading: false,
      hasMore: true
    };

    // ✅ Only initialization, no side effects
    this.abortController = null;
    this.ws = null;
    this.handleScroll = this.debounce(this.handleScroll.bind(this), 200);
  }

  componentDidMount() {
    // ✅ Single fetch on mount
    this.fetchPosts();

    // ✅ Store reference for cleanup
    window.addEventListener('scroll', this.handleScroll);

    // ✅ Initialize WebSocket
    this.initializeWebSocket();
  }

  componentDidUpdate(prevProps, prevState) {
    // ✅ Guard: Only fetch if page changed
    if (prevState.page !== this.state.page) {
      this.fetchPosts();
    }

    // ✅ Guard: Only update if userId changed
    if (prevProps.userId !== this.props.userId) {
      this.resetFeed();
    }

    // ✅ No setState without guards!
  }

  componentWillUnmount() {
    // ✅ Clean up scroll listener
    window.removeEventListener('scroll', this.handleScroll);

    // ✅ Cancel in-flight requests
    if (this.abortController) {
      this.abortController.abort();
    }

    // ✅ Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  initializeWebSocket() {
    this.ws = new WebSocket('wss://api.example.com/live');

    this.ws.onmessage = (event) => {
      const newPost = JSON.parse(event.data);

      // ✅ Check if still mounted
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.setState(prevState => ({
          posts: [newPost, ...prevState.posts]
        }));
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Auto-reconnect logic here
    };
  }

  fetchPosts() {
    // ✅ Cancel previous request
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    this.setState({ loading: true });

    fetch(`/api/feed?page=${this.state.page}`, {
      signal: this.abortController.signal
    })
      .then(res => res.json())
      .then(data => {
        this.setState(prevState => ({
          posts: [...prevState.posts, ...data.posts],
          loading: false,
          hasMore: data.hasMore
        }));
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          this.setState({ loading: false });
        }
      });
  }

  handleScroll() {
    if (this.state.loading || !this.state.hasMore) return;

    const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;

    if (bottom) {
      this.setState(prevState => ({
        page: prevState.page + 1
      }));
    }
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  resetFeed() {
    this.setState({
      posts: [],
      page: 1,
      hasMore: true
    });
  }

  render() {
    return (
      <div>
        {this.state.posts.map(post => (
          <Post key={post.id} {...post} />
        ))}
        {this.state.loading && <Spinner />}
      </div>
    );
  }
}
```

**Modern Solution with Hooks:**

```javascript
// ✅ BEST: Functional component with proper lifecycle hooks
function NewsFeed({ userId }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ✅ Fetch posts when page changes
  useEffect(() => {
    const abortController = new AbortController();

    setLoading(true);
    fetch(`/api/feed?page=${page}`, {
      signal: abortController.signal
    })
      .then(res => res.json())
      .then(data => {
        setPosts(prev => [...prev, ...data.posts]);
        setHasMore(data.hasMore);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setLoading(false);
        }
      });

    // ✅ Cleanup cancels request
    return () => abortController.abort();
  }, [page]); // Only when page changes

  // ✅ Reset feed when userId changes
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [userId]);

  // ✅ Scroll listener with cleanup
  useEffect(() => {
    const handleScroll = debounce(() => {
      if (loading || !hasMore) return;

      const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      if (bottom) {
        setPage(prev => prev + 1);
      }
    }, 200);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]); // Re-create when these change

  // ✅ WebSocket with cleanup
  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/live');

    ws.onmessage = (event) => {
      const newPost = JSON.parse(event.data);
      setPosts(prev => [newPost, ...prev]);
    };

    return () => ws.close();
  }, []); // Only mount/unmount

  return (
    <div>
      {posts.map(post => (
        <Post key={post.id} {...post} />
      ))}
      {loading && <Spinner />}
    </div>
  );
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

**Post-Fix Metrics:**
- **Memory usage**: Stable at 58-65MB (96% reduction)
- **API calls**: 1 call per page load (97% reduction)
- **Render performance**: 68ms average (97% improvement)
- **Crash rate**: 0 crashes/day (100% elimination)
- **User engagement**: Recovered to +8% above baseline
- **Scroll listener leaks**: 0 (was accumulating 14/minute)

**Root Causes Identified:**
1. **Side effects in constructor** - Caused race conditions and duplicate calls
2. **Missing componentWillUnmount** - Event listeners and WebSockets leaked
3. **Unguarded componentDidUpdate** - Created infinite update loops
4. **No request cancellation** - setState on unmounted components
5. **Non-debounced scroll** - 100+ handleScroll calls per second

</details>

---

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

#### Lifecycle Complexity vs Control

**Detailed Lifecycle Methods (Class Components):**

**Advantages:**
1. **Explicit control** - Separate methods for mount vs update
2. **Optimization points** - `shouldComponentUpdate` and `getSnapshotBeforeUpdate`
3. **Clear phase separation** - Render phase vs commit phase
4. **Easier debugging** - Stack traces show exact lifecycle method
5. **Error boundaries** - Only available in class components

**Disadvantages:**
1. **Code duplication** - Same logic in mount and update
2. **Verbose** - 3+ methods for single feature
3. **Easy to misuse** - Common to put side effects in wrong phase
4. **Hard to extract** - Can't share lifecycle logic across components
5. **Mental model** - Need to think about three separate phases

**Consolidated useEffect (Functional Components):**

**Advantages:**
1. **Less code** - Single useEffect for mount + update + cleanup
2. **Co-located logic** - Setup and cleanup in same place
3. **Reusable** - Extract into custom hooks
4. **Dependency tracking** - Automatic re-run when dependencies change
5. **Better code splitting** - Easier to lazy-load

**Disadvantages:**
1. **Stale closures** - Can capture old values
2. **Dependency array confusion** - Easy to miss dependencies
3. **No error boundaries** - Must use class component wrapper
4. **Over-execution** - Without proper dependencies, runs too often
5. **Debugging complexity** - Multiple effects can be hard to trace

#### Decision Matrix: When to Use Which Pattern

| Scenario | Use This | Reason |
|----------|---------|--------|
| **New feature development** | Functional + hooks | Modern, less code, better tooling |
| **Error boundary** | Class component | Only option for `componentDidCatch` |
| **Legacy codebase (all classes)** | Class component | Consistency, avoid mixed patterns |
| **Need getSnapshotBeforeUpdate** | Class component | No hooks equivalent |
| **Reusable logic across components** | Custom hooks | Can't extract from classes |
| **Performance-critical list** | Functional + React.memo | Better optimization options |
| **Third-party library integration** | Either (prefer hooks) | Hooks have cleaner cleanup |
| **Testing** | Functional + hooks | Easier to test, no mocking `this` |

#### Performance Comparison

**Memory Usage:**
```javascript
// Class Component: ~8KB per instance
class MyComponent extends React.Component {
  // Instance properties: 8KB
  // Prototype methods: shared
  // Event handler bindings: 2KB per handler
}

// Functional Component: ~3KB per instance
function MyComponent() {
  // Closures: 3KB
  // No instance, no prototype
  // Inline handlers: optimized by React
}
```

**Bundle Size:**
```bash
# Class components:
- Larger minified size (class syntax doesn't minify well)
- Example: 45KB for complex component

# Functional components:
- Smaller minified size (functions minify better)
- Example: 28KB for same component (38% smaller)
```

**Execution Speed:**
```javascript
// Benchmark: 10,000 component mounts

// Class component: 240ms
// - Constructor overhead
// - Instance creation
// - Method binding

// Functional component: 180ms (25% faster)
// - Direct function call
// - No instance overhead
// - Hooks optimized by React
```

#### Lifecycle Granularity Trade-offs

**Single Effect vs Multiple Effects:**

```javascript
// ❌ ANTI-PATTERN: One giant effect (hard to debug)
useEffect(() => {
  // Everything in one effect
  fetchUser();
  subscribeToNotifications();
  trackAnalytics();
  setupWebSocket();

  return () => {
    // Complex cleanup
    unsubscribe();
    closeWebSocket();
  };
}, [userId, settings, preferences]); // Too many dependencies

// ✅ BEST PRACTICE: Separate concerns
useEffect(() => {
  fetchUser();
}, [userId]); // Only when userId changes

useEffect(() => {
  const unsubscribe = subscribeToNotifications();
  return unsubscribe;
}, []); // Only mount/unmount

useEffect(() => {
  trackAnalytics();
}, [userId, currentPage]); // When either changes

useEffect(() => {
  const ws = setupWebSocket();
  return () => ws.close();
}, [userId]); // When userId changes
```

**Trade-off Analysis:**
- **Single effect**: 4 fewer useEffect calls (minor perf), but over-executes
- **Multiple effects**: More granular control, better performance, easier debugging
- **Recommended**: Split by concern (data fetching, subscriptions, analytics)

#### Optimization Strategies Comparison

**Class Component Optimization:**
```javascript
class ProductList extends React.Component {
  // Option 1: shouldComponentUpdate (manual)
  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.products !== this.props.products ||
      nextState.filter !== this.state.filter
    );
  }

  // Option 2: PureComponent (shallow comparison)
  // class ProductList extends React.PureComponent {
}

// Pros: Fine-grained control, can optimize based on business logic
// Cons: Easy to get wrong, must manually compare all relevant props/state
```

**Functional Component Optimization:**
```javascript
// Option 1: React.memo (component level)
const ProductList = React.memo(({ products, filter }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.products === nextProps.products &&
         prevProps.filter === nextProps.filter;
});

// Option 2: useMemo (value level)
function ProductList({ products, filter }) {
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === filter);
  }, [products, filter]);
}

// Pros: More flexible, can memoize individual values
// Cons: Easy to over-memoize, dependency array pitfalls
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

#### The Restaurant Service Analogy

Think of a React component like a restaurant serving a customer:

**1. Mounting Phase (Customer Arrives):**

```
🚶 Customer enters → 🪑 Seated at table → 🍽️ Server takes order
   Component created    Rendered to DOM       Side effects run
```

**Example:**
```javascript
function Restaurant({ customerId }) {
  const [order, setOrder] = useState(null);

  // 1️⃣ Customer enters (component created)
  console.log('Customer arriving...');

  // 3️⃣ Server takes order (after seated)
  useEffect(() => {
    console.log('Welcome! Taking your order...');

    // Fetch customer's favorite order
    fetchFavoriteOrder(customerId).then(setOrder);

    // Set up notification for when food is ready
    const subscription = kitchenNotifications.subscribe(customerId);

    // When customer leaves, clean up
    return () => subscription.unsubscribe();
  }, []); // Only when customer first arrives

  // 2️⃣ Customer seated (component rendered)
  return <div>Welcome, customer #{customerId}!</div>;
}
```

**2. Updating Phase (Order Changes):**

```
🗣️ Customer changes order → 🍽️ Server updates kitchen → 🍔 New food arrives
   Props/state change         Re-render               Effect runs
```

**Example:**
```javascript
function Restaurant({ customerId, tableNumber }) {
  const [order, setOrder] = useState(null);

  // When customer moves to different table
  useEffect(() => {
    console.log(`Customer moved to table ${tableNumber}`);
    updateTableAssignment(customerId, tableNumber);
  }, [tableNumber]); // Only when table changes

  // When customer ID changes (new customer!)
  useEffect(() => {
    console.log('New customer, fetching their order...');
    fetchFavoriteOrder(customerId).then(setOrder);
  }, [customerId]); // Only when customer changes

  return (
    <div>
      Table {tableNumber}: {order?.name}
    </div>
  );
}
```

**Why separate effects?**
- Changing tables doesn't need new order fetch
- New customer needs everything reset
- Each effect runs only when relevant

**3. Unmounting Phase (Customer Leaves):**

```
💵 Customer pays → 🧹 Clean table → ✨ Table ready for next customer
   Component unmounts   Cleanup runs    Memory freed
```

**Example:**
```javascript
function Restaurant({ customerId }) {
  useEffect(() => {
    // Customer arrives, start their service
    const kitchenAlert = subscribeToKitchen(customerId);
    const waiterAlert = assignWaiter(customerId);
    const timer = setInterval(() => {
      checkIfNeedsRefill(customerId);
    }, 60000); // Check every minute

    // CLEANUP: When customer leaves
    return () => {
      console.log('Customer leaving, cleaning up...');

      kitchenAlert.unsubscribe();  // Stop kitchen notifications
      waiterAlert.dismiss();        // Free up waiter
      clearInterval(timer);         // Stop checking for refills

      cleanTable();                 // Reset for next customer
    };
  }, []);

  return <div>Serving customer...</div>;
}

// ❌ WITHOUT cleanup:
// - 100 customers served = 100 timers still running!
// - 100 waiter alerts piling up
// - Memory leak, restaurant can't handle new customers

// ✅ WITH cleanup:
// - Each customer cleaned up when they leave
// - Resources freed for next customer
// - Efficient, no memory leaks
```

#### Common Lifecycle Mistakes (Simple Explanations)

**Mistake #1: Forgetting Cleanup**
```javascript
// ❌ BAD: Like leaving dirty dishes on table forever
function BadRestaurant() {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Checking kitchen...');
    }, 1000);

    // FORGOT TO CLEAN UP!
    // Timer runs forever even after restaurant closes
  }, []);
}

// ✅ GOOD: Clean up dirty dishes when customer leaves
function GoodRestaurant() {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Checking kitchen...');
    }, 1000);

    return () => {
      clearInterval(timer); // Stop timer when done!
    };
  }, []);
}
```

**Mistake #2: Running Effects Too Often**
```javascript
// ❌ BAD: Asking customer's name every second (annoying!)
function BadRestaurant({ customerName }) {
  useEffect(() => {
    console.log('What is your name?');
    updateNameTag(customerName);
  }); // No dependency array = runs EVERY render!
}

// ✅ GOOD: Only ask name when it actually changes
function GoodRestaurant({ customerName }) {
  useEffect(() => {
    console.log('Updating name tag...');
    updateNameTag(customerName);
  }, [customerName]); // Only when name changes
}
```

**Mistake #3: Infinite Loops**
```javascript
// ❌ BAD: Customer asks for water → Waiter brings water → Customer asks for water → infinite!
function BadRestaurant() {
  const [waterRequests, setWaterRequests] = useState(0);

  useEffect(() => {
    // This causes infinite loop!
    setWaterRequests(waterRequests + 1);
  }, [waterRequests]); // Runs when waterRequests changes, which we change inside!
}

// ✅ GOOD: Only refill when glass is empty
function GoodRestaurant({ glassEmpty }) {
  const [waterRefills, setWaterRefills] = useState(0);

  useEffect(() => {
    if (glassEmpty) {
      setWaterRefills(prev => prev + 1);
    }
  }, [glassEmpty]); // Only when glass becomes empty
}
```

#### Interview Answer Template

**Question: "Explain the React component lifecycle flow"**

**Template Answer:**

"React components go through three main lifecycle phases: mounting, updating, and unmounting.

**Mounting** is when the component first appears in the DOM. In class components, this involves the constructor initializing state, render creating JSX, and then componentDidMount running side effects like API calls. In functional components, the component function runs, returns JSX, and then useEffect with an empty dependency array runs, which is equivalent to componentDidMount.

**Updating** happens when props or state change, causing a re-render. In class components, render is called again, and componentDidUpdate runs after the DOM updates, where you can compare previous and current props/state. In functional components, the function re-executes, and useEffect with dependencies runs only when those dependencies change.

**Unmounting** is cleanup before the component is removed. Class components use componentWillUnmount to clean up subscriptions, timers, and event listeners. Functional components return a cleanup function from useEffect that runs when the component unmounts.

The key difference is that class components have separate methods for each phase (componentDidMount, componentDidUpdate, componentWillUnmount), while functional components consolidate everything into useEffect using dependency arrays to control when effects run.

For example, a subscription in class components requires two methods:

```javascript
// Class
componentDidMount() {
  this.subscription = subscribe();
}
componentWillUnmount() {
  this.subscription.unsubscribe();
}

// Hooks (cleaner)
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

The most important rule is to always clean up side effects to prevent memory leaks, and to use dependency arrays in useEffect to control when effects re-run, avoiding infinite loops or unnecessary executions."

</details>
