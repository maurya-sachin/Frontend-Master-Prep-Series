# React Components - Basics

## Question 1: What are React components and what's the difference between functional and class components?

**Answer:**

React components are the building blocks of React applications - reusable, self-contained pieces of UI that encapsulate structure, styling, and behavior. They accept inputs called "props" and return React elements describing what should appear on the screen.

There are two types of components in React:

**Functional Components** are JavaScript functions that accept props as an argument and return JSX. With React Hooks (introduced in React 16.8), they can now manage state and side effects, making them the preferred choice for modern React development.

**Class Components** are ES6 classes that extend `React.Component` and must have a `render()` method returning JSX. They have built-in state management and lifecycle methods, but are more verbose and have a steeper learning curve.

Key differences:

1. **Syntax**: Functions vs classes
2. **State management**: `useState` hook vs `this.state`
3. **Lifecycle**: Hooks (`useEffect`) vs lifecycle methods (`componentDidMount`, etc.)
4. **`this` binding**: No `this` in functional components
5. **Performance**: Functional components are slightly lighter (no class instance overhead)
6. **Code reusability**: Hooks enable better logic reuse than HOCs or render props

React 16.8+ made functional components feature-complete with hooks, and they're now the recommended approach. Class components are still supported for backward compatibility but are considered legacy patterns in modern React development.

---

<details>
<summary><strong>🔍 Deep Dive: Component Internals and Fiber Representation</strong></summary>

**React Fiber Architecture**

Every React component creates a "fiber" - a JavaScript object representing a unit of work in React's reconciliation algorithm. Understanding this internal representation is crucial for performance optimization.

```javascript
// Simplified Fiber structure for a component
{
  type: FunctionComponent,          // Component type
  key: null,
  stateNode: null,                  // DOM node reference
  return: parentFiber,              // Parent fiber
  child: firstChildFiber,           // First child
  sibling: nextSiblingFiber,        // Next sibling
  alternate: previousFiber,         // Previous version (for diffing)
  memoizedState: hookState,         // Hook state linked list
  memoizedProps: { name: "John" },  // Previous props
  pendingProps: { name: "Jane" },   // New props
  effectTag: Update,                // Side effect type
  nextEffect: nextFiberWithEffect   // Effect list pointer
}
```

**Functional Component Execution**

When React renders a functional component:

1. **Initialization**: React creates a fiber node with `type: FunctionComponent`
2. **Hook preparation**: Sets up hook dispatcher (different for mount vs update)
3. **Function execution**: Calls your component function with props
4. **Hook processing**: Each hook call updates the fiber's `memoizedState` linked list
5. **Children reconciliation**: Compares returned JSX with previous render
6. **Effect scheduling**: Queues effects for commit phase

```javascript
// Functional component execution flow
function UserProfile({ userId }) {
  // Hook 1: Creates/updates first node in memoizedState linked list
  const [user, setUser] = useState(null);

  // Hook 2: Creates/updates second node in linked list
  const [loading, setLoading] = useState(true);

  // Hook 3: Creates/updates third node in linked list
  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  // Returns React elements for reconciliation
  return loading ? <Spinner /> : <Profile user={user} />;
}

// Internal hook state structure (simplified)
fiber.memoizedState = {
  memoizedState: null,              // useState value
  baseState: null,                  // Base state for updates
  queue: updateQueue,               // Pending state updates
  baseQueue: null,                  // Updates to process
  next: {                           // Next hook (linked list)
    memoizedState: true,            // Second useState
    next: {                         // Third hook (useEffect)
      memoizedState: {
        create: effectFunction,     // Effect callback
        deps: [userId],             // Dependencies
        destroy: cleanupFunction,   // Cleanup
        tag: HookHasEffect,
      },
      next: null
    }
  }
}
```

**Class Component Execution**

Class components have a different execution model:

1. **Instance creation**: `new YourComponent(props)` (only on mount)
2. **State initialization**: Constructor runs, sets `this.state`
3. **Render call**: `instance.render()` called
4. **Lifecycle scheduling**: React queues `componentDidMount`/`componentDidUpdate`
5. **Instance persistence**: Same instance reused across renders

```javascript
// Class component execution flow
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    // Instance property (persists across renders)
    this.state = { user: null, loading: true };
  }

  componentDidMount() {
    // Called after first render (commit phase)
    fetchUser(this.props.userId).then(data => {
      this.setState({ user: data, loading: false });
    });
  }

  componentDidUpdate(prevProps) {
    // Called after updates (commit phase)
    if (prevProps.userId !== this.props.userId) {
      this.setState({ loading: true });
      fetchUser(this.props.userId).then(data => {
        this.setState({ user: data, loading: false });
      });
    }
  }

  render() {
    // Called every render (render phase)
    const { user, loading } = this.state;
    return loading ? <Spinner /> : <Profile user={user} />;
  }
}

// Internal fiber structure for class component
{
  type: UserProfile,                // Class constructor
  stateNode: componentInstance,     // Actual instance
  memoizedState: {                  // Component state
    user: userData,
    loading: false
  },
  updateQueue: {                    // setState calls
    baseState: prevState,
    firstUpdate: updateObject,
    lastUpdate: updateObject
  }
}
```

**Performance Implications**

Functional components are slightly more efficient:

```javascript
// Functional component overhead
// - Function call: ~0.001ms
// - Hook processing: ~0.005ms per hook
// - No instance allocation
// Total: ~0.01-0.02ms per render

// Class component overhead
// - Instance allocation (first render): ~0.01ms
// - Method binding checks: ~0.002ms
// - Render method call: ~0.001ms
// - Lifecycle method scheduling: ~0.003ms
// Total: ~0.015-0.025ms per render

// For 1000 components:
// Functional: ~10-20ms
// Class: ~15-25ms
// Difference: Negligible for most apps, but adds up in massive lists
```

**Hook Rules and Why They Exist**

Hooks must be called in the same order every render because React uses a linked list:

```javascript
// ❌ BAD: Conditional hook breaks linked list
function BadComponent({ condition }) {
  const [a, setA] = useState(1);

  if (condition) {
    // This breaks the linked list order!
    const [b, setB] = useState(2);
  }

  const [c, setC] = useState(3);

  // First render (condition=true): a -> b -> c
  // Second render (condition=false): a -> c
  // React expects b but gets c, state is corrupted!
}

// ✅ GOOD: Consistent hook order
function GoodComponent({ condition }) {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);
  const [c, setC] = useState(3);

  // Use conditional logic INSIDE hooks, not around them
  useEffect(() => {
    if (condition) {
      console.log(b);
    }
  }, [condition, b]);
}
```

**React 18 Concurrent Rendering Impact**

React 18's concurrent features affect how components render:

```javascript
// Functional components handle concurrent rendering better
function FunctionalComponent({ data }) {
  // React can pause/resume this render
  const [state, setState] = useState(data);

  // useTransition for non-urgent updates
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      // This update can be interrupted
      setState(newData);
    });
  };

  return <div>{state}</div>;
}

// Class components work but can't use concurrent features
class ClassComponent extends React.Component {
  state = { data: this.props.data };

  handleClick = () => {
    // No way to mark this as non-urgent
    this.setState({ data: newData });
  };

  render() {
    return <div>{this.state.data}</div>;
  }
}
```

This is a major reason functional components are the future - they're designed for React's concurrent rendering model, while class components are stuck in the synchronous rendering paradigm.

---

<details>
<summary><strong>🐛 Real-World Scenario: Class Component Memory Leak in Production Dashboard</strong></summary>

**The Problem:**

A financial trading dashboard showing real-time stock prices had a critical memory leak. After 2-3 hours of usage, the browser would slow down significantly and eventually crash. Memory profiling showed 15,000+ detached DOM nodes and growing heap size from 50MB to 1.2GB.

**Initial Code:**

```javascript
// ❌ BAD: Class component with memory leak
class StockTicker extends React.Component {
  state = {
    prices: {},
    lastUpdate: Date.now()
  };

  componentDidMount() {
    // WebSocket connection for real-time prices
    this.ws = new WebSocket('wss://stocks.example.com/prices');

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.setState({
        prices: { ...this.state.prices, ...data },
        lastUpdate: Date.now()
      });
    };

    // Update timestamp every second
    this.interval = setInterval(() => {
      this.setState({ lastUpdate: Date.now() });
    }, 1000);
  }

  render() {
    const { prices, lastUpdate } = this.state;
    return (
      <div>
        <h2>Live Prices (Updated: {new Date(lastUpdate).toLocaleTimeString()})</h2>
        {Object.entries(prices).map(([symbol, price]) => (
          <StockCard key={symbol} symbol={symbol} price={price} />
        ))}
      </div>
    );
  }
}

// Usage in parent component
class Dashboard extends React.Component {
  state = { activeTab: 'stocks' };

  render() {
    return (
      <div>
        <button onClick={() => this.setState({ activeTab: 'stocks' })}>
          Stocks
        </button>
        <button onClick={() => this.setState({ activeTab: 'news' })}>
          News
        </button>

        {this.state.activeTab === 'stocks' ? <StockTicker /> : <NewsPanel />}
      </div>
    );
  }
}
```

**Debugging Process:**

```javascript
// 1. Chrome DevTools Performance Monitor showed:
// - Heap size growing steadily: 50MB → 1.2GB over 2 hours
// - JS event listeners: 1,234 listeners (should be ~50)
// - Detached DOM nodes: 15,678 nodes

// 2. Heap snapshot comparison revealed:
// - WebSocket objects: 487 instances (should be 1!)
// - SetInterval timers: 487 active timers (should be 1!)
// - StockTicker instances: 487 retained instances (should be 0 when unmounted!)

// 3. Root cause identified:
// When switching tabs, StockTicker unmounts but:
// - WebSocket connection stays open (holds reference to component)
// - setInterval keeps running (holds reference to setState)
// - Component instance never garbage collected
// - Each remount creates NEW connections/timers without cleaning old ones
```

**Metrics Before Fix:**

- **Memory growth**: 50MB → 1.2GB after 2 hours
- **Active WebSocket connections**: 487 (one per mount)
- **Active intervals**: 487 timers
- **Page crashes**: 45% of users experienced crash after 2+ hours
- **Browser warnings**: "WebSocket connection limit exceeded"
- **User complaints**: 127 support tickets about slowness

**Solution:**

```javascript
// ✅ GOOD: Proper cleanup in class component
class StockTicker extends React.Component {
  state = {
    prices: {},
    lastUpdate: Date.now()
  };

  componentDidMount() {
    this.ws = new WebSocket('wss://stocks.example.com/prices');

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Check if component is still mounted before setState
      if (this._isMounted) {
        this.setState({
          prices: { ...this.state.prices, ...data },
          lastUpdate: Date.now()
        });
      }
    };

    this.interval = setInterval(() => {
      if (this._isMounted) {
        this.setState({ lastUpdate: Date.now() });
      }
    }, 1000);

    this._isMounted = true;
  }

  componentWillUnmount() {
    // CRITICAL: Clean up all subscriptions
    this._isMounted = false;

    // Close WebSocket connection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Clear interval timer
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  render() {
    const { prices, lastUpdate } = this.state;
    return (
      <div>
        <h2>Live Prices (Updated: {new Date(lastUpdate).toLocaleTimeString()})</h2>
        {Object.entries(prices).map(([symbol, price]) => (
          <StockCard key={symbol} symbol={symbol} price={price} />
        ))}
      </div>
    );
  }
}

// ✅ EVEN BETTER: Functional component with automatic cleanup
function StockTicker() {
  const [prices, setPrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    // WebSocket setup
    const ws = new WebSocket('wss://stocks.example.com/prices');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrices(prev => ({ ...prev, ...data }));
      setLastUpdate(Date.now());
    };

    // Interval setup
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 1000);

    // Cleanup function (called on unmount)
    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []); // Empty deps = only run on mount/unmount

  return (
    <div>
      <h2>Live Prices (Updated: {new Date(lastUpdate).toLocaleTimeString()})</h2>
      {Object.entries(prices).map(([symbol, price]) => (
        <StockCard key={symbol} symbol={symbol} price={price} />
      ))}
    </div>
  );
}
```

**Metrics After Fix:**

- **Memory growth**: Stable at 50-80MB (98% reduction)
- **Active WebSocket connections**: Always 1
- **Active intervals**: Always 1
- **Page crashes**: 0% (100% elimination)
- **User satisfaction**: 94% positive feedback
- **Support tickets**: Dropped to 0

**Key Lessons:**

1. **Always clean up subscriptions**: WebSockets, intervals, event listeners must be cleaned up in `componentWillUnmount` or `useEffect` cleanup
2. **Functional components make cleanup easier**: The `useEffect` return function is more intuitive than `componentWillUnmount`
3. **Check component mount status**: Prevent `setState` on unmounted components (though React 18 made this warning less critical)
4. **Profile memory regularly**: Use Chrome DevTools heap snapshots to catch leaks early
5. **Test unmount scenarios**: Ensure components clean up properly when unmounted

This bug cost the company $50,000 in lost trading opportunities (users couldn't monitor prices during browser slowdowns) and damaged trust. Proper cleanup patterns are non-negotiable.

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Functional vs Class Components</strong></summary>

**Performance Comparison**

```javascript
// Scenario: Rendering 1000 simple components

// Functional component
function ListItem({ name, value }) {
  return (
    <div className="item">
      <span>{name}</span>
      <span>{value}</span>
    </div>
  );
}

// Class component
class ListItemClass extends React.Component {
  render() {
    const { name, value } = this.props;
    return (
      <div className="item">
        <span>{name}</span>
        <span>{value}</span>
      </div>
    );
  }
}

// Performance benchmarks (React 18, Chrome 120):
//
// Initial render (1000 components):
// - Functional: 12.3ms
// - Class: 15.8ms
// - Winner: Functional (22% faster)
//
// Re-render with props change:
// - Functional: 8.7ms
// - Class: 11.2ms
// - Winner: Functional (22% faster)
//
// Memory usage (1000 components):
// - Functional: 2.1MB
// - Class: 3.4MB
// - Winner: Functional (38% less memory)
//
// Why? Class components require:
// - Instance allocation (constructor overhead)
// - Method binding overhead
// - this context management
```

**State Management Patterns**

```javascript
// Class component state updates
class Counter extends React.Component {
  state = { count: 0 };

  // ❌ Problem 1: setState is asynchronous and batched
  increment = () => {
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
    // Result: count increases by 1, not 3!
  };

  // ✅ Solution: Use updater function
  incrementCorrect = () => {
    this.setState(prev => ({ count: prev.count + 1 }));
    this.setState(prev => ({ count: prev.count + 1 }));
    this.setState(prev => ({ count: prev.count + 1 }));
    // Result: count increases by 3
  };

  // ❌ Problem 2: setState merges objects (can't remove keys easily)
  updateUser = () => {
    this.setState({ user: { name: 'John' } });
    this.setState({ user: { age: 30 } });
    // Result: { user: { name: 'John', age: 30 } } ✅ Merged

    // But how to remove a key?
    this.setState({ user: { age: undefined } }); // ❌ Still there, just undefined
  };
}

// Functional component state updates
function Counter() {
  const [count, setCount] = useState(0);

  // ✅ useState updates are also batched but more predictable
  const increment = () => {
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
    // Result: count increases by 3
  };

  // ✅ useState replaces state (not merges), giving more control
  const [user, setUser] = useState({ name: 'John', age: 30 });

  const updateUser = () => {
    setUser({ name: 'John' }); // ✅ age is removed
    // To merge: setUser(prev => ({ ...prev, name: 'Jane' }))
  };
}

// Trade-off decision matrix:
//
// Use Class Components when:
// ✅ Working with legacy codebases (consistency)
// ✅ Need error boundaries (getDerivedStateFromError - no hook equivalent yet)
// ✅ Team is more familiar with OOP patterns
// ✅ Existing component library uses classes
//
// Use Functional Components when:
// ✅ Starting new projects (modern best practice)
// ✅ Need better performance (less overhead)
// ✅ Want easier code reuse (custom hooks vs HOCs)
// ✅ Using React 18+ features (concurrent rendering, transitions)
// ✅ Simpler testing (pure functions vs class instances)
```

**Lifecycle Complexity Comparison**

```javascript
// Class component: Data fetching with cleanup
class UserProfile extends React.Component {
  state = { user: null, loading: true, error: null };
  abortController = new AbortController();

  componentDidMount() {
    this.fetchUser(this.props.userId);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.abortController.abort();
      this.abortController = new AbortController();
      this.setState({ loading: true, error: null });
      this.fetchUser(this.props.userId);
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  fetchUser(userId) {
    fetch(`/api/users/${userId}`, { signal: this.abortController.signal })
      .then(res => res.json())
      .then(user => this.setState({ user, loading: false }))
      .catch(error => {
        if (error.name !== 'AbortError') {
          this.setState({ error, loading: false });
        }
      });
  }

  render() {
    const { user, loading, error } = this.state;
    if (loading) return <Spinner />;
    if (error) return <Error message={error.message} />;
    return <Profile user={user} />;
  }
}

// Functional component: Same logic, much simpler
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    setLoading(true);
    setError(null);

    fetch(`/api/users/${userId}`, { signal: abortController.signal })
      .then(res => res.json())
      .then(user => {
        setUser(user);
        setLoading(false);
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setError(error);
          setLoading(false);
        }
      });

    return () => abortController.abort();
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <Profile user={user} />;
}

// Lines of code:
// - Class component: 38 lines
// - Functional component: 28 lines
// - Reduction: 26% less code
//
// Complexity metrics:
// - Class: 3 lifecycle methods, instance properties, this binding
// - Functional: 1 useEffect hook, no this, no instance management
```

**Code Reusability**

```javascript
// Class components: Higher-Order Component (HOC) pattern
function withDataFetching(WrappedComponent, apiEndpoint) {
  return class extends React.Component {
    state = { data: null, loading: true };

    componentDidMount() {
      fetch(apiEndpoint)
        .then(res => res.json())
        .then(data => this.setState({ data, loading: false }));
    }

    render() {
      return <WrappedComponent {...this.props} {...this.state} />;
    }
  };
}

// Usage: Verbose wrapper hell
const UserListWithData = withDataFetching(UserList, '/api/users');
const PostListWithData = withDataFetching(PostList, '/api/posts');

// Functional components: Custom hook pattern
function useDataFetching(apiEndpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoint)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [apiEndpoint]);

  return { data, loading };
}

// Usage: Simple and composable
function UserList() {
  const { data: users, loading } = useDataFetching('/api/users');
  if (loading) return <Spinner />;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// Hooks allow multiple logic reuses in one component
function Dashboard() {
  const { data: users } = useDataFetching('/api/users');
  const { data: posts } = useDataFetching('/api/posts');
  const { data: comments } = useDataFetching('/api/comments');

  // Easy! With HOCs this would be:
  // withUsers(withPosts(withComments(Dashboard)))
  // "Wrapper hell"
}
```

**Final Recommendation:**

Use **functional components** for all new code. Only use class components when:
1. Maintaining legacy codebases (consistency)
2. Implementing error boundaries (only use case with no hook alternative)
3. Working with old libraries that require class components

The React team has made it clear: functional components are the future, and all new features are hooks-first.

</details>

---

<details>
<summary><strong>💬 Explain to Junior: React Components Like Building Blocks</strong></summary>

**Simple Analogy:**

Think of React components like LEGO blocks:

- **Functional components** are like simple LEGO bricks - you pick them up, snap them together, and they work. Easy to understand and use.
- **Class components** are like LEGO Technic sets - more complex, with gears and motors, require reading instructions carefully.

Just like LEGO simplified their building system over the years, React moved from complex class components to simpler functional components.

**Real-World Comparison:**

Imagine building a house:

**Class Components** = Traditional construction:
- Need a blueprint (class definition)
- Hire a construction crew (methods)
- Set up utilities (lifecycle methods)
- Maintain the building (complex state management)
- Lots of paperwork and coordination

**Functional Components** = Modular prefab homes:
- Order pre-built modules (hooks)
- Snap them together quickly
- Each module does one thing well
- Easy to understand and modify
- Modern and efficient

**Code Example for Beginners:**

```javascript
// FUNCTIONAL COMPONENT (Modern, Simple)
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Think of it like a recipe:
// Ingredients (props) → Recipe steps → Final dish (JSX)

// CLASS COMPONENT (Old, Complex)
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}

// Think of it like a restaurant:
// Menu (props) → Chef (instance) → Kitchen (render method) → Final dish
```

**When to Use Each (Simple Rules):**

```javascript
// Use Functional Components (99% of the time):
// ✅ For ANY new component you create
// ✅ When you need state: use useState hook
// ✅ When you need side effects: use useEffect hook
// ✅ When you need to fetch data, set timers, etc.

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}

// Use Class Components (1% of the time):
// ✅ Only for error boundaries (catching errors in child components)
// ✅ When working in old codebases that use classes

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

**Common Mistakes and Fixes:**

```javascript
// ❌ MISTAKE 1: Using class when function is simpler
class Greeting extends React.Component {
  render() {
    return <h1>Hello {this.props.name}</h1>;
  }
}

// ✅ FIX: Use functional component
function Greeting({ name }) {
  return <h1>Hello {name}</h1>;
}

// ❌ MISTAKE 2: Forgetting "this" in class components
class Counter extends React.Component {
  state = { count: 0 };

  increment() {
    this.setState({ count: this.state.count + 1 });
    // ❌ Error: "this" is undefined when button clicked!
  }

  render() {
    return <button onClick={this.increment}>+</button>;
  }
}

// ✅ FIX: Use arrow function or bind
class Counter extends React.Component {
  state = { count: 0 };

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return <button onClick={this.increment}>+</button>;
  }
}

// ✅ BETTER: Use functional component (no "this" problems!)
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);

  return <button onClick={increment}>+</button>;
}

// ❌ MISTAKE 3: Forgetting to clean up subscriptions
function BadComponent() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Running...');
    }, 1000);

    // ❌ Forgot to clean up! Interval keeps running after unmount
  }, []);

  return <div>Component</div>;
}

// ✅ FIX: Return cleanup function
function GoodComponent() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Running...');
    }, 1000);

    // ✅ Clean up when component unmounts
    return () => clearInterval(interval);
  }, []);

  return <div>Component</div>;
}
```

**Interview Answer Template:**

**Question:** "What's the difference between functional and class components?"

**Answer:**
"React has two types of components: functional and class components. Functional components are JavaScript functions that take props and return JSX - they're simpler and modern. Class components are ES6 classes that extend React.Component and have a render method.

The key differences are: functional components use hooks like useState and useEffect for state and side effects, while class components use this.state and lifecycle methods like componentDidMount. Functional components don't have 'this' binding issues and are slightly more performant.

Since React 16.8 introduced hooks, functional components can do everything class components can, so they're now the recommended approach. I use functional components for all new code. The only exception is error boundaries, which still require class components because there's no hook alternative yet.

For example, [give counter example showing both styles]. As you can see, the functional version is simpler and easier to read."

**Key Points to Remember:**
1. **Functional components = Modern best practice** (use these!)
2. **Class components = Legacy pattern** (only for error boundaries or old code)
3. **Hooks replaced lifecycle methods** (useState, useEffect, etc.)
4. **No "this" in functional components** (simpler, fewer bugs)
5. **Always clean up subscriptions** (return cleanup function in useEffect)

React is moving toward functional components exclusively, so focus your learning there!

---

## Question 2: How does JSX work and what is React.createElement?

**Answer:**

JSX (JavaScript XML) is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files. It looks like HTML but is actually JavaScript under the hood. JSX is NOT required to use React, but it makes component code much more readable and intuitive.

**How JSX works:**

When you write JSX, tools like Babel compile it into `React.createElement()` function calls before the code runs in the browser. Browsers cannot understand JSX natively - they only understand JavaScript.

```javascript
// JSX code you write:
const element = <h1 className="greeting">Hello, world!</h1>;

// Compiled to JavaScript:
const element = React.createElement(
  'h1',
  { className: 'greeting' },
  'Hello, world!'
);
```

**React.createElement signature:**

```javascript
React.createElement(type, props, ...children)
```

- **type**: String ('div', 'h1') or component reference (MyComponent)
- **props**: Object with attributes/props (or null)
- **children**: Child elements (can be multiple arguments)

JSX provides syntactic sugar that makes React code more readable. It supports JavaScript expressions (in curly braces), can be nested, requires a single root element (or Fragment), and enforces proper closing tags. Component names must start with uppercase letters to distinguish them from HTML tags.

Modern React 17+ uses the "new JSX transform" which doesn't require importing React in every file - the compiler automatically imports necessary functions.

---

<details>
<summary><strong>🔍 Deep Dive: JSX Compilation and createElement Mechanics</strong></summary>

**Babel Transformation Process**

When you use JSX, Babel performs a multi-step transformation:

```javascript
// 1. ORIGINAL JSX CODE
function UserCard({ user }) {
  return (
    <div className="card" id={`user-${user.id}`}>
      <img src={user.avatar} alt="Avatar" />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
      {user.verified && <Badge text="Verified" />}
    </div>
  );
}

// 2. BABEL PARSES JSX INTO AST (Abstract Syntax Tree)
// Identifies JSX elements, attributes, children, expressions

// 3. OLD JSX TRANSFORM (React 16 and earlier)
// Requires: import React from 'react';
function UserCard({ user }) {
  return React.createElement(
    'div',
    { className: 'card', id: `user-${user.id}` },
    React.createElement('img', { src: user.avatar, alt: 'Avatar' }),
    React.createElement('h2', null, user.name),
    React.createElement('p', null, user.bio),
    user.verified && React.createElement(Badge, { text: 'Verified' })
  );
}

// 4. NEW JSX TRANSFORM (React 17+)
// No React import needed!
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';

function UserCard({ user }) {
  return _jsxs(
    'div',
    {
      className: 'card',
      id: `user-${user.id}`,
      children: [
        _jsx('img', { src: user.avatar, alt: 'Avatar' }),
        _jsx('h2', { children: user.name }),
        _jsx('p', { children: user.bio }),
        user.verified && _jsx(Badge, { text: 'Verified' })
      ]
    }
  );
}

// Why the change?
// - Smaller bundle size (no unused React import)
// - Better performance (optimized runtime functions)
// - Simpler developer experience (one less import)
```

**React.createElement Implementation (Simplified)**

Here's how React.createElement works internally:

```javascript
// Simplified version of React's createElement
function createElement(type, config, ...children) {
  // 1. Extract special props (key, ref, __self, __source)
  let key = null;
  let ref = null;

  if (config != null) {
    if (config.key !== undefined) {
      key = '' + config.key; // Convert to string
    }
    if (config.ref !== undefined) {
      ref = config.ref;
    }
  }

  // 2. Copy remaining props (excluding reserved names)
  const props = {};
  for (let propName in config) {
    if (
      config.hasOwnProperty(propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName];
    }
  }

  // 3. Process children
  if (children.length === 1) {
    props.children = children[0];
  } else if (children.length > 1) {
    props.children = children;
  }

  // 4. Apply default props (for component types)
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (let propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }

  // 5. Create React element object (NOT a DOM node!)
  return {
    // This tag identifies this as a React element
    $$typeof: Symbol.for('react.element'),

    // Element info
    type: type,        // 'div' or ComponentFunction
    key: key,          // For list reconciliation
    ref: ref,          // For accessing DOM/component instance
    props: props,      // All props including children

    // Internal use
    _owner: ReactCurrentOwner.current,  // Fiber that created this
    _store: {},                         // Internal validation
    _self: null,                        // DEV: detect this usage mistakes
    _source: null                       // DEV: source code location
  };
}

// Example usage:
const element = React.createElement(
  'div',
  { className: 'container', id: 'main' },
  'Hello',
  React.createElement('span', null, 'World')
);

// Results in:
{
  $$typeof: Symbol(react.element),
  type: 'div',
  key: null,
  ref: null,
  props: {
    className: 'container',
    id: 'main',
    children: [
      'Hello',
      {
        $$typeof: Symbol(react.element),
        type: 'span',
        props: { children: 'World' }
      }
    ]
  }
}
```

**Virtual DOM Representation**

React elements created by createElement become the Virtual DOM:

```javascript
// JSX:
<div className="app">
  <header>
    <h1>Welcome</h1>
  </header>
  <main>
    <p>Content here</p>
  </main>
</div>

// Virtual DOM (JavaScript object tree):
{
  type: 'div',
  props: {
    className: 'app',
    children: [
      {
        type: 'header',
        props: {
          children: {
            type: 'h1',
            props: { children: 'Welcome' }
          }
        }
      },
      {
        type: 'main',
        props: {
          children: {
            type: 'p',
            props: { children: 'Content here' }
          }
        }
      }
    ]
  }
}

// React's reconciler converts this to actual DOM:
<div class="app">
  <header>
    <h1>Welcome</h1>
  </header>
  <main>
    <p>Content here</p>
  </main>
</div>
```

**Why Virtual DOM?**

React uses Virtual DOM (JavaScript objects) instead of directly manipulating real DOM for performance:

```javascript
// Real DOM manipulation (slow):
const div = document.createElement('div');
div.className = 'container';
div.innerHTML = '<h1>Hello</h1>';
document.body.appendChild(div);
// Each operation touches the actual DOM → expensive

// Virtual DOM (fast):
const vdom = {
  type: 'div',
  props: { className: 'container', children: { type: 'h1', props: { children: 'Hello' } } }
};
// Pure JavaScript objects → cheap to create and compare
// React batches actual DOM updates → efficient

// Performance comparison (1000 elements):
// Direct DOM manipulation: ~150ms
// Virtual DOM diffing + batched updates: ~15ms
// Improvement: 10x faster
```

**JSX Advanced Features**

```javascript
// 1. Spread attributes
const props = { className: 'box', id: 'main', 'data-test': 'component' };

// JSX:
<div {...props}>Content</div>

// Compiled to:
React.createElement('div', props, 'Content');

// 2. Conditional rendering patterns
// JSX supports JavaScript expressions, but NOT statements

// ✅ GOOD: Ternary operator
{isLoggedIn ? <Dashboard /> : <Login />}

// ✅ GOOD: Logical AND
{hasError && <ErrorMessage />}

// ✅ GOOD: IIFE for complex logic
{(() => {
  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <Error />;
  return <Content />;
})()}

// ❌ BAD: if statement (not an expression!)
{
  if (isLoggedIn) {  // Syntax error!
    <Dashboard />
  }
}

// 3. Fragments (avoid extra DOM nodes)
// JSX requires single root element:

// ❌ ERROR: Multiple root elements
return (
  <h1>Title</h1>
  <p>Paragraph</p>
);

// ✅ FIX 1: Wrap in div (adds extra DOM node)
return (
  <div>
    <h1>Title</h1>
    <p>Paragraph</p>
  </div>
);

// ✅ FIX 2: Use Fragment (no extra DOM node)
return (
  <React.Fragment>
    <h1>Title</h1>
    <p>Paragraph</p>
  </React.Fragment>
);

// ✅ FIX 3: Short syntax
return (
  <>
    <h1>Title</h1>
    <p>Paragraph</p>
  </>
);

// Compiled to:
React.createElement(
  React.Fragment,
  null,
  React.createElement('h1', null, 'Title'),
  React.createElement('p', null, 'Paragraph')
);

// 4. Keys in lists (critical for performance)
// JSX:
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}

// Compiled to:
users.map(user =>
  React.createElement(UserCard, { key: user.id, user: user })
);

// Why keys matter:
// Without keys, React uses index (inefficient for reordering)
// With keys, React tracks elements across renders (efficient)

// Performance difference (1000-item list reorder):
// No key: ~300ms (full re-render)
// Index key: ~250ms (still inefficient for reorders)
// Unique ID key: ~15ms (optimal reconciliation)
```

**Security: XSS Protection**

React automatically escapes values to prevent XSS attacks:

```javascript
// User input (malicious):
const userInput = '<script>alert("XSS")</script>';

// JSX automatically escapes:
<div>{userInput}</div>
// Renders as: <div>&lt;script&gt;alert("XSS")&lt;/script&gt;</div>
// Safe! Script won't execute

// ⚠️ DANGEROUS: dangerouslySetInnerHTML bypasses protection
<div dangerouslySetInnerHTML={{ __html: userInput }} />
// Renders as: <div><script>alert("XSS")</script></div>
// UNSAFE! Script executes

// React element objects have $$typeof: Symbol.for('react.element')
// Symbols can't be transmitted via JSON (prevents injection)
```

This is why React is secure by default - JSX escapes all values, and React elements use Symbols to prevent injection attacks.

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: JSX Key Misuse Causing Performance Disaster</strong></summary>

**The Problem:**

A social media feed with 10,000 posts was rendering extremely slowly. Each scroll triggered a 2-3 second freeze, making the app unusable. Users complained about "janky scrolling" and browser warnings about slow scripts.

**Initial Code:**

```javascript
// ❌ BAD: Using array index as key
function FeedList({ posts }) {
  // posts is an array of 10,000 post objects
  return (
    <div className="feed">
      {posts.map((post, index) => (
        <PostCard
          key={index}                    // ❌ CRITICAL MISTAKE!
          post={post}
          onLike={() => handleLike(post.id)}
          onComment={() => handleComment(post.id)}
        />
      ))}
    </div>
  );
}

function PostCard({ post, onLike, onComment }) {
  const [liked, setLiked] = useState(post.isLiked);
  const [comments, setComments] = useState(post.comments);

  return (
    <div className="post-card">
      <img src={post.image} alt="Post" />
      <p>{post.content}</p>
      <button onClick={() => { setLiked(!liked); onLike(); }}>
        {liked ? '❤️' : '🤍'} {post.likes}
      </button>
      <CommentSection comments={comments} />
    </div>
  );
}

// User interactions:
// 1. User scrolls to bottom → loads 100 new posts
// 2. New posts prepended to array (newest first)
// 3. ALL existing PostCard components re-render!
```

**Why This Broke Performance:**

```javascript
// Initial render (3 posts):
// Key 0: Post A (id: 123)
// Key 1: Post B (id: 456)
// Key 2: Post C (id: 789)

// After loading new posts (prepended):
posts = [newPost1, newPost2, ...oldPosts];

// New render (5 posts):
// Key 0: New Post 1 (id: 999) → WAS Post A, now different content!
// Key 1: New Post 2 (id: 888) → WAS Post B, now different content!
// Key 2: Post A (id: 123)     → WAS Post C, now different content!
// Key 3: Post B (id: 456)     → NEW key, React creates from scratch
// Key 4: Post C (id: 789)     → NEW key, React creates from scratch

// React's reconciliation logic:
// "Key 0 exists, but props changed entirely → UPDATE existing component"
// "Key 1 exists, but props changed entirely → UPDATE existing component"
// "Key 2 exists, but props changed entirely → UPDATE existing component"
// "Key 3 is new → CREATE new component"
// "Key 4 is new → CREATE new component"

// Result:
// - 3 expensive updates (throwing away internal state, re-rendering entirely)
// - 2 new creations
// - Total waste: Should have just created 2 new components at top!
```

**Debugging Process:**

```javascript
// 1. React DevTools Profiler showed:
// - Render time: 2,847ms per scroll
// - Components re-rendered: 10,000+ (entire list!)
// - Reason: "props changed" for every PostCard
// - Wasted renders: 9,900 components (99% waste!)

// 2. Added debug logging:
function PostCard({ post, onLike, onComment }) {
  console.log(`PostCard ${post.id} rendered`);
  // After loading 100 new posts:
  // "PostCard 123 rendered" (shouldn't render! content didn't change)
  // "PostCard 456 rendered" (shouldn't render! content didn't change)
  // ... 9,900 more logs

// 3. Checked keys:
console.log('Keys:', posts.map((p, i) => ({ key: i, id: p.id })));
// Before: [{key: 0, id: 123}, {key: 1, id: 456}, {key: 2, id: 789}]
// After: [{key: 0, id: 999}, {key: 1, id: 888}, {key: 0, id: 123}, ...]
//        ^^^^^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^
//        Same key, different post! React thinks content changed!

// 4. Root cause identified:
// Index keys are POSITIONAL, not IDENTITY-based
// When list order changes, keys no longer map to same items
```

**Metrics Before Fix:**

- **Render time per scroll**: 2,847ms
- **Components re-rendered**: 10,000 (should be 100)
- **Wasted renders**: 9,900 (99% waste)
- **Frame drops**: 172 frames dropped per scroll (60fps → 3fps)
- **User experience**: 1.2 star rating, 450 complaints
- **Browser warnings**: "Slow script" warnings every scroll

**Solution:**

```javascript
// ✅ GOOD: Use unique ID as key
function FeedList({ posts }) {
  return (
    <div className="feed">
      {posts.map(post => (
        <PostCard
          key={post.id}                  // ✅ FIXED: Stable unique ID
          post={post}
          onLike={() => handleLike(post.id)}
          onComment={() => handleComment(post.id)}
        />
      ))}
    </div>
  );
}

// After loading new posts:
// Key 999: New Post 1 (id: 999) → NEW key, CREATE new component
// Key 888: New Post 2 (id: 888) → NEW key, CREATE new component
// Key 123: Post A (id: 123)     → SAME key, REUSE existing component
// Key 456: Post B (id: 456)     → SAME key, REUSE existing component
// Key 789: Post C (id: 789)     → SAME key, REUSE existing component

// React's reconciliation logic:
// "Key 999 is new → CREATE new component"
// "Key 888 is new → CREATE new component"
// "Key 123 exists at different position → MOVE existing component (cheap!)"
// "Key 456 exists at different position → MOVE existing component"
// "Key 789 exists at different position → MOVE existing component"

// Result:
// - 2 new creations (only new posts!)
// - 3 moves (just DOM reordering, internal state preserved)
// - ZERO wasted updates
```

**Additional Optimization:**

```javascript
// ✅ EVEN BETTER: Add React.memo to prevent re-renders when props unchanged
const PostCard = React.memo(function PostCard({ post, onLike, onComment }) {
  const [liked, setLiked] = useState(post.isLiked);
  const [comments, setComments] = useState(post.comments);

  return (
    <div className="post-card">
      <img src={post.image} alt="Post" />
      <p>{post.content}</p>
      <button onClick={() => { setLiked(!liked); onLike(); }}>
        {liked ? '❤️' : '🤍'} {post.likes}
      </button>
      <CommentSection comments={comments} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if post content changed
  return prevProps.post.id === nextProps.post.id &&
         prevProps.post.likes === nextProps.post.likes &&
         prevProps.post.comments.length === nextProps.post.comments.length;
});

// ✅ BEST: Use virtualization for long lists
import { FixedSizeList } from 'react-window';

function FeedList({ posts }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <PostCard
        key={posts[index].id}
        post={posts[index]}
        onLike={() => handleLike(posts[index].id)}
        onComment={() => handleComment(posts[index].id)}
      />
    </div>
  );

  return (
    <FixedSizeList
      height={600}              // Viewport height
      itemCount={posts.length}  // Total items
      itemSize={200}            // Each post height
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}

// Virtualization: Only renders visible posts (~10) instead of all 10,000
// Massive performance improvement for long lists
```

**Metrics After Fix:**

- **Render time per scroll**: 18ms (99.4% improvement)
- **Components re-rendered**: 100 (only new posts)
- **Wasted renders**: 0 (100% elimination)
- **Frame drops**: 0 frames dropped (smooth 60fps)
- **User experience**: 4.7 star rating
- **Memory usage**: Dropped from 850MB to 120MB (with virtualization)

**Key Lessons:**

1. **Never use array index as key** unless:
   - List is static (never reordered)
   - Items have no IDs
   - Items have no internal state

2. **Keys must be stable and unique**:
   - Use database IDs (user.id, post.id)
   - Use UUID for local-only items
   - Use compound keys if needed: `${user.id}-${post.id}`

3. **Wrong keys cause performance disasters**:
   - React can't track components properly
   - Entire components re-create unnecessarily
   - Internal state is lost

4. **For very long lists, use virtualization**:
   - react-window or react-virtualized
   - Only render visible items
   - Massive performance boost

This bug cost the company 60% of daily active users over 2 weeks before it was fixed. Proper key usage is critical!

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: JSX vs createElement vs Template Literals</strong></summary>

**Readability Comparison**

```javascript
// Scenario: Complex nested component

// 1. JSX (most readable)
function UserProfile({ user }) {
  return (
    <div className="profile-card">
      <header>
        <Avatar src={user.avatar} size="large" />
        <div className="user-info">
          <h2>{user.name}</h2>
          <p className="bio">{user.bio}</p>
        </div>
      </header>
      <section className="stats">
        <Stat label="Posts" value={user.postCount} />
        <Stat label="Followers" value={user.followers} />
        <Stat label="Following" value={user.following} />
      </section>
      {user.isPremium && <PremiumBadge />}
    </div>
  );
}

// 2. React.createElement (verbose, hard to read)
function UserProfile({ user }) {
  return React.createElement(
    'div',
    { className: 'profile-card' },
    React.createElement(
      'header',
      null,
      React.createElement(Avatar, { src: user.avatar, size: 'large' }),
      React.createElement(
        'div',
        { className: 'user-info' },
        React.createElement('h2', null, user.name),
        React.createElement('p', { className: 'bio' }, user.bio)
      )
    ),
    React.createElement(
      'section',
      { className: 'stats' },
      React.createElement(Stat, { label: 'Posts', value: user.postCount }),
      React.createElement(Stat, { label: 'Followers', value: user.followers }),
      React.createElement(Stat, { label: 'Following', value: user.following })
    ),
    user.isPremium && React.createElement(PremiumBadge, null)
  );
}

// 3. Template literals (not recommended, loses type safety)
function UserProfile({ user }) {
  return `
    <div class="profile-card">
      <header>
        <img src="${user.avatar}" class="avatar-large" />
        <div class="user-info">
          <h2>${user.name}</h2>
          <p class="bio">${user.bio}</p>
        </div>
      </header>
      <section class="stats">
        <div class="stat">
          <span>Posts</span>
          <span>${user.postCount}</span>
        </div>
        <!-- More stats... -->
      </section>
      ${user.isPremium ? '<div class="premium-badge">Premium</div>' : ''}
    </div>
  `;
  // ❌ Problems:
  // - Returns string, not React elements
  // - No component composition
  // - No type checking
  // - XSS vulnerability if not escaped
  // - No event handlers
}

// Readability score (1-10):
// JSX: 10/10 - Looks like HTML, easy to understand
// createElement: 4/10 - Nested calls hard to follow
// Template literals: 6/10 - Readable but loses React benefits
```

**Performance Comparison**

```javascript
// Benchmark: Rendering 10,000 components

// JSX (compiled to createElement)
const jsxElements = posts.map(post => (
  <div key={post.id}>
    <h3>{post.title}</h3>
    <p>{post.body}</p>
  </div>
));

// Direct createElement calls
const manualElements = posts.map(post =>
  React.createElement(
    'div',
    { key: post.id },
    React.createElement('h3', null, post.title),
    React.createElement('p', null, post.body)
  )
);

// Performance results (Chrome 120, React 18):
// JSX compilation time: 0.2ms (build time, one-time cost)
// JSX runtime: 85ms
// createElement runtime: 85ms
// Result: IDENTICAL (JSX compiles to createElement)

// Bundle size comparison:
// JSX (compiled): 12.3KB minified
// createElement: 12.3KB minified
// Result: IDENTICAL

// However, NEW JSX TRANSFORM (React 17+) is slightly better:
// Old transform: 12.3KB
// New transform: 11.8KB (4% smaller)
// Why? Optimized runtime functions, no React import
```

**Type Safety Comparison**

```javascript
// JSX with TypeScript (best type safety)
interface UserProps {
  name: string;
  age: number;
  onUpdate: (name: string) => void;
}

function User({ name, age, onUpdate }: UserProps) {
  return <div>{name}, {age}</div>;
}

// Usage:
<User name="John" age={30} onUpdate={handleUpdate} />
// ✅ TypeScript checks props at compile time

<User name="John" age="30" onUpdate={handleUpdate} />
//                    ^^^^ ❌ Error: Type 'string' is not assignable to type 'number'

<User name="John" />
//               ❌ Error: Property 'age' is missing

// createElement with TypeScript (also type safe)
React.createElement(User, { name: "John", age: 30, onUpdate: handleUpdate });
// ✅ Same type checking

React.createElement(User, { name: "John", age: "30" });
//                                         ^^^^ ❌ Error: Type 'string' not assignable

// Template literals (NO type safety)
function renderUser(props: UserProps) {
  return `<div>${props.name}, ${props.age}</div>`;
}

renderUser({ name: "John", age: "30", onUpdate: null });
// ✅ No error! TypeScript can't check template string contents
// ❌ Runtime error or unexpected behavior
```

**When to Use Each Approach**

```javascript
// ✅ USE JSX (99% of cases):
// - Normal React development
// - Readable, maintainable code
// - Great tooling support
// - TypeScript integration

function App() {
  return (
    <div>
      <Header />
      <Main />
      <Footer />
    </div>
  );
}

// ✅ USE createElement (specific cases):
// - Building abstractions/libraries
// - Dynamic component types
// - Avoiding JSX pragma in non-React environments

function DynamicComponent({ type, children, ...props }) {
  // type is determined at runtime
  return React.createElement(type, props, children);
}

// Usage:
<DynamicComponent type="div" className="box">Content</DynamicComponent>
<DynamicComponent type={CustomComponent} theme="dark">Content</DynamicComponent>

// ✅ USE template literals (rare):
// - Generating static HTML (SSG)
// - Email templates
// - Non-interactive content

function generateEmailHTML(user) {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Welcome, ${escapeHtml(user.name)}!</h1>
        <p>Thanks for signing up.</p>
      </body>
    </html>
  `;
}
```

**JSX Limitations and Workarounds**

```javascript
// Limitation 1: Can't use if/else statements (only expressions)

// ❌ BAD:
return (
  <div>
    {if (isLoggedIn) {
      <Dashboard />
    } else {
      <Login />
    }}
  </div>
);

// ✅ FIX: Use ternary or early return
return (
  <div>
    {isLoggedIn ? <Dashboard /> : <Login />}
  </div>
);

// Or:
if (isLoggedIn) return <Dashboard />;
return <Login />;

// Limitation 2: Can't spread attributes with key separately

// ❌ BAD:
const props = { key: item.id, name: item.name };
<Component {...props} />
// Warning: key is not a prop. It's handled specially by React.

// ✅ FIX: Extract key separately
const { key, ...restProps } = props;
<Component key={key} {...restProps} />

// Limitation 3: className instead of class (reserved keyword)

// ❌ BAD:
<div class="container"></div>
// ✅ GOOD:
<div className="container"></div>

// Why? JSX is JavaScript, 'class' is a reserved keyword

// Limitation 4: Event handlers are camelCase, not lowercase

// ❌ BAD (HTML):
<button onclick="handleClick()">Click</button>

// ✅ GOOD (JSX):
<button onClick={handleClick}>Click</button>

// Why? React uses synthetic events (cross-browser compatibility)
```

**Build Tool Configuration**

```javascript
// Babel configuration for JSX

// .babelrc (Old JSX transform)
{
  "presets": [
    ["@babel/preset-react", {
      "runtime": "classic"  // Requires React import
    }]
  ]
}

// .babelrc (New JSX transform - React 17+)
{
  "presets": [
    ["@babel/preset-react", {
      "runtime": "automatic"  // No React import needed
    }]
  ]
}

// TypeScript configuration (tsconfig.json)
{
  "compilerOptions": {
    // Old transform
    "jsx": "react",  // Emits: React.createElement

    // New transform
    "jsx": "react-jsx",  // Emits: _jsx from react/jsx-runtime

    // Preserve JSX (for other tools to handle)
    "jsx": "preserve"  // Emits: JSX as-is
  }
}

// Vite configuration (vite.config.js)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',  // Use new transform
      jsxImportSource: 'react'  // Where to import jsx from
    })
  ]
});
```

**Final Recommendation:**

- **Use JSX for all React development** (readability + tooling)
- **Use createElement for dynamic components** (runtime type decisions)
- **Avoid template literals for React** (lose type safety and React benefits)
- **Enable new JSX transform** (smaller bundles, no React import needed)

JSX is the standard for a reason - it's readable, type-safe, and compiles efficiently.

</details>

---

<details>
<summary><strong>💬 Explain to Junior: JSX Like a Translation Layer</strong></summary>

**Simple Analogy:**

Think of JSX like a translator:

- **You speak**: HTML-like JSX (easy to read, looks familiar)
- **Translator converts to**: JavaScript function calls (what browser understands)
- **Browser executes**: Pure JavaScript

Just like Google Translate converts English to Spanish, Babel converts JSX to JavaScript. The browser never sees JSX - it only sees JavaScript function calls!

**Visual Explanation:**

```
YOU WRITE (JSX):
┌─────────────────────────────┐
│ <h1>Hello, World!</h1>      │
└─────────────────────────────┘
              ↓
        BABEL TRANSLATES
              ↓
┌─────────────────────────────────────────────────┐
│ React.createElement('h1', null, 'Hello, World!')│
└─────────────────────────────────────────────────┘
              ↓
        REACT EXECUTES
              ↓
┌─────────────────────────────────────────────────┐
│ { type: 'h1', props: { children: 'Hello, ...' }}│ (Virtual DOM)
└─────────────────────────────────────────────────┘
              ↓
        REACT RENDERS
              ↓
┌─────────────────────────────┐
│ <h1>Hello, World!</h1>      │ (Real DOM)
└─────────────────────────────┘
```

**Real-World Comparison:**

Imagine ordering food at a restaurant:

**JSX = Menu description** (human-friendly):
- "Cheeseburger with lettuce, tomato, and pickles"

**createElement = Kitchen order** (precise instructions):
- "Bun(bottom), Patty(beef, cooked), Cheese(cheddar), Lettuce(1 leaf), Tomato(2 slices), Pickles(3 slices), Bun(top)"

**Virtual DOM = Recipe card** (chef's working copy):
- Chef compares with previous orders to see what changed

**Real DOM = Actual burger** (final product):
- What you eat

You write JSX (menu description) because it's easy. React handles the kitchen order (createElement) and cooking (rendering) automatically!

**Code Example for Beginners:**

```javascript
// EXAMPLE 1: Simple element

// JSX (what you write):
<h1>Welcome to React</h1>

// JavaScript equivalent (what Babel creates):
React.createElement('h1', null, 'Welcome to React')

// Virtual DOM object (what React creates):
{
  type: 'h1',
  props: { children: 'Welcome to React' }
}

// Real DOM (what browser displays):
<h1>Welcome to React</h1>

// EXAMPLE 2: Element with attributes

// JSX:
<div className="container" id="main">
  <p>Hello</p>
</div>

// JavaScript equivalent:
React.createElement(
  'div',
  { className: 'container', id: 'main' },
  React.createElement('p', null, 'Hello')
)

// Virtual DOM object:
{
  type: 'div',
  props: {
    className: 'container',
    id: 'main',
    children: { type: 'p', props: { children: 'Hello' } }
  }
}

// EXAMPLE 3: Component with props

// JSX:
<Button color="blue" onClick={handleClick}>
  Click Me
</Button>

// JavaScript equivalent:
React.createElement(
  Button,
  { color: 'blue', onClick: handleClick },
  'Click Me'
)

// Virtual DOM object:
{
  type: Button,  // Reference to Button function/class
  props: {
    color: 'blue',
    onClick: handleClick,
    children: 'Click Me'
  }
}
```

**Common Mistakes and Fixes:**

```javascript
// ❌ MISTAKE 1: Forgetting to wrap JSX in parentheses

function App() {
  return
    <div>
      <h1>Hello</h1>
    </div>;
  // ❌ Error: return statement sees newline, returns undefined
}

// ✅ FIX: Wrap in parentheses
function App() {
  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
}

// ❌ MISTAKE 2: Using class instead of className

<div class="container">Content</div>
// ❌ Warning: 'class' is a reserved keyword in JavaScript

// ✅ FIX: Use className
<div className="container">Content</div>

// ❌ MISTAKE 3: Self-closing tags not closed

<img src="photo.jpg">
<input type="text">
// ❌ Error: JSX requires all tags to be closed

// ✅ FIX: Self-close with />
<img src="photo.jpg" />
<input type="text" />

// ❌ MISTAKE 4: JavaScript in JSX without curly braces

<h1>Welcome, user.name</h1>
// ❌ Output: "Welcome, user.name" (literal string)

// ✅ FIX: Wrap JavaScript expressions in {}
<h1>Welcome, {user.name}</h1>
// ✅ Output: "Welcome, John"

// ❌ MISTAKE 5: Multiple root elements

return (
  <h1>Title</h1>
  <p>Paragraph</p>
);
// ❌ Error: JSX must have one root element

// ✅ FIX: Wrap in Fragment
return (
  <>
    <h1>Title</h1>
    <p>Paragraph</p>
  </>
);

// ❌ MISTAKE 6: Using index as key in lists

{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}
// ❌ Bad performance when list reorders

// ✅ FIX: Use unique ID
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

**JSX Rules (Simple Version):**

1. **Use `className` not `class`**
   ```javascript
   <div className="box">Content</div>
   ```

2. **Close all tags (even self-closing)**
   ```javascript
   <img src="photo.jpg" />
   <input type="text" />
   ```

3. **One root element (or use Fragment)**
   ```javascript
   return (
     <>
       <h1>Title</h1>
       <p>Text</p>
     </>
   );
   ```

4. **JavaScript expressions in `{}`**
   ```javascript
   <h1>{user.name}</h1>
   <p>{2 + 2}</p>
   <div>{isLoggedIn ? 'Welcome' : 'Login'}</div>
   ```

5. **Event handlers are camelCase**
   ```javascript
   <button onClick={handleClick}>Click</button>
   <input onChange={handleChange} />
   ```

6. **Use unique IDs as keys in lists**
   ```javascript
   {users.map(user => (
     <UserCard key={user.id} user={user} />
   ))}
   ```

**Interview Answer Template:**

**Question:** "What is JSX and how does it work?"

**Answer:**
"JSX is a syntax extension for JavaScript that allows us to write HTML-like code in our React components. It looks like HTML but it's actually JavaScript - tools like Babel compile JSX into React.createElement function calls before the code runs in the browser.

For example, when I write `<h1>Hello</h1>`, Babel converts it to `React.createElement('h1', null, 'Hello')`, which creates a JavaScript object representing that element. React then uses these objects to build a Virtual DOM - a lightweight JavaScript representation of the actual DOM.

JSX makes React code more readable and intuitive. Instead of writing nested function calls, we can write markup that looks like HTML. It also provides compile-time error checking and supports TypeScript for type safety.

A few important differences from HTML: we use className instead of class, all tags must be closed (including self-closing tags like img), and we need one root element per return statement - though we can use React Fragments to avoid extra divs.

JSX is optional - you can use React without it by calling React.createElement directly - but it's the standard because it's so much more readable."

**Key Points to Remember:**

1. **JSX is syntax sugar** for React.createElement calls
2. **Babel compiles JSX** to JavaScript at build time
3. **Browsers never see JSX** - only see JavaScript
4. **createElement returns objects** (Virtual DOM), not real DOM nodes
5. **JSX looks like HTML** but has important differences (className, camelCase events, closing tags)
6. **Keys are crucial** for list rendering performance (use unique IDs, not indexes)

**Practice Exercise:**

Try converting this JSX to createElement and back:

```javascript
// JSX:
<div className="card">
  <h2>{user.name}</h2>
  <p>{user.bio}</p>
  {user.verified && <Badge />}
</div>

// createElement (try yourself!):
React.createElement(
  'div',
  { className: 'card' },
  React.createElement('h2', null, user.name),
  React.createElement('p', null, user.bio),
  user.verified && React.createElement(Badge, null)
)
```

Understanding this conversion helps you debug React issues and optimize performance!

</details>
