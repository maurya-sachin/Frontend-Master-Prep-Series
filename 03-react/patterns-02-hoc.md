# React Patterns: Higher-Order Components (HOCs)

## Question 1: What are Higher-Order Components (HOCs) and how to implement them?

### Answer

A Higher-Order Component (HOC) is an advanced React pattern for reusing component logic. It's a function that takes a component and returns a new component with additional props or behavior. HOCs don't modify the input component; instead, they compose it by wrapping it in a container component.

**Core Concept:**
```javascript
const EnhancedComponent = higherOrderComponent(OriginalComponent);
```

HOCs follow the naming convention `withX` (e.g., `withAuth`, `withLoading`, `withRouter`). They're pure functions with no side effects, making them composable and testable.

**Key Characteristics:**
- **Composition**: HOCs wrap components to add functionality
- **Props proxy**: HOCs can manipulate props before passing them down
- **State abstraction**: HOCs can manage state and pass it as props
- **Render hijacking**: HOCs can control rendering based on conditions

**Basic Implementation Pattern:**
```javascript
function withEnhancement(WrappedComponent) {
  return function EnhancedComponent(props) {
    // Add enhancement logic here
    const enhancedProps = { ...props, newProp: 'value' };
    return <WrappedComponent {...enhancedProps} />;
  };
}
```

**Common Use Cases:**
- Authentication checks (`withAuth`)
- Loading states (`withLoading`)
- Error boundaries (`withErrorBoundary`)
- Data fetching (`withData`)
- Analytics tracking (`withTracking`)
- Subscription management (`withSubscription`)

HOCs were popularized by libraries like React Redux (`connect`) and React Router (`withRouter`). While modern React favors hooks, HOCs remain useful for cross-cutting concerns in class components or when wrapping external libraries.

---

### 🔍 Deep Dive

#### HOC Implementation Patterns

**1. Props Proxy Pattern**

The most common HOC pattern manipulates props before passing them to the wrapped component:

```javascript
// Basic props proxy
function withExtraProps(WrappedComponent) {
  return function WithExtraProps(props) {
    const extraProps = {
      injectedProp: 'This is injected',
      timestamp: Date.now()
    };

    return <WrappedComponent {...props} {...extraProps} />;
  };
}

// Usage
const EnhancedUser = withExtraProps(UserProfile);
```

**2. Authentication HOC (Real-World Example)**

```javascript
// ✅ GOOD: Comprehensive authentication HOC
function withAuth(WrappedComponent, options = {}) {
  const {
    redirectTo = '/login',
    requiredRoles = [],
    LoadingComponent = () => <div>Loading...</div>
  } = options;

  function WithAuth(props) {
    const { user, loading } = useAuth(); // Custom hook
    const router = useRouter();

    // Loading state
    if (loading) {
      return <LoadingComponent />;
    }

    // Not authenticated
    if (!user) {
      useEffect(() => {
        router.push(redirectTo);
      }, []);
      return null;
    }

    // Check roles
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role =>
        user.roles?.includes(role)
      );

      if (!hasRequiredRole) {
        return <div>Access Denied</div>;
      }
    }

    // Pass user and authentication methods as props
    return (
      <WrappedComponent
        {...props}
        user={user}
        isAuthenticated={true}
      />
    );
  }

  // Set display name for debugging
  WithAuth.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuth;
}

// Helper function for display names
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName ||
         WrappedComponent.name ||
         'Component';
}

// Usage
const ProtectedDashboard = withAuth(Dashboard, {
  requiredRoles: ['admin', 'editor']
});
```

**3. Loading State HOC**

```javascript
// ✅ GOOD: Reusable loading HOC
function withLoading(WrappedComponent, LoadingComponent = null) {
  return function WithLoading({ isLoading, ...props }) {
    if (isLoading) {
      return LoadingComponent ? (
        <LoadingComponent />
      ) : (
        <div className="loading-spinner">
          <span>Loading...</span>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Custom loading component
const CustomLoader = () => (
  <div className="custom-loader">
    <div className="spinner" />
    <p>Fetching data...</p>
  </div>
);

// Usage
const UserListWithLoading = withLoading(UserList, CustomLoader);

// In parent component
<UserListWithLoading isLoading={loading} users={users} />
```

**4. Data Fetching HOC**

```javascript
// ✅ GOOD: Generic data fetching HOC
function withData(WrappedComponent, fetchFunction) {
  return function WithData(props) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      let cancelled = false;

      const fetchData = async () => {
        try {
          setLoading(true);
          const result = await fetchFunction(props);

          if (!cancelled) {
            setData(result);
            setError(null);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        cancelled = true;
      };
    }, [JSON.stringify(props)]); // Dependency on props

    return (
      <WrappedComponent
        {...props}
        data={data}
        loading={loading}
        error={error}
      />
    );
  };

  WithData.displayName = `WithData(${getDisplayName(WrappedComponent)})`;
  return WithData;
}

// Usage
const fetchUserData = async ({ userId }) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

const UserProfileWithData = withData(UserProfile, fetchUserData);

// Render
<UserProfileWithData userId={123} />
```

**5. Composing Multiple HOCs**

```javascript
// ❌ BAD: Nested composition (hard to read)
const EnhancedComponent = withAuth(
  withLoading(
    withErrorBoundary(
      withTracking(Dashboard)
    )
  )
);

// ✅ GOOD: Using compose utility
import { compose } from 'redux'; // or create your own

const enhance = compose(
  withAuth,
  withLoading,
  withErrorBoundary,
  withTracking
);

const EnhancedComponent = enhance(Dashboard);

// Custom compose function
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
```

**6. Forwarding Refs**

HOCs don't automatically forward refs. You need to use `React.forwardRef`:

```javascript
// ❌ BAD: Ref not forwarded
function withLogging(WrappedComponent) {
  return function WithLogging(props) {
    console.log('Props:', props);
    return <WrappedComponent {...props} />;
  };
}

// ✅ GOOD: Properly forwarding refs
function withLogging(WrappedComponent) {
  function WithLogging(props, ref) {
    console.log('Props:', props);
    return <WrappedComponent {...props} ref={ref} />;
  }

  WithLogging.displayName = `WithLogging(${getDisplayName(WrappedComponent)})`;

  return React.forwardRef(WithLogging);
}

// Usage
const EnhancedInput = withLogging(Input);
const inputRef = useRef();

<EnhancedInput ref={inputRef} />
```

**7. Static Method Hoisting**

HOCs don't automatically copy static methods:

```javascript
// ❌ BAD: Static methods lost
function MyComponent() {}
MyComponent.staticMethod = function() { return 'static'; };

const Enhanced = withHOC(MyComponent);
Enhanced.staticMethod(); // undefined!

// ✅ GOOD: Manual hoisting
import hoistNonReactStatics from 'hoist-non-react-statics';

function withHOC(WrappedComponent) {
  function WithHOC(props) {
    return <WrappedComponent {...props} />;
  }

  // Copy static methods
  hoistNonReactStatics(WithHOC, WrappedComponent);

  return WithHOC;
}

// Or manually
function withHOC(WrappedComponent) {
  const WithHOC = (props) => <WrappedComponent {...props} />;

  // Copy specific static method
  WithHOC.staticMethod = WrappedComponent.staticMethod;

  return WithHOC;
}
```

**8. TypeScript HOC Implementation**

```typescript
// ✅ GOOD: Properly typed HOC
import React, { ComponentType } from 'react';

// Injected props type
interface InjectedProps {
  isAuthenticated: boolean;
  user: User | null;
}

// HOC function with proper types
function withAuth<P extends InjectedProps>(
  WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, keyof InjectedProps>> {

  const WithAuth: React.FC<Omit<P, keyof InjectedProps>> = (props) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Please login</div>;

    return (
      <WrappedComponent
        {...props as P}
        isAuthenticated={true}
        user={user}
      />
    );
  };

  WithAuth.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuth;
}

// Usage
interface DashboardProps extends InjectedProps {
  title: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  title,
  isAuthenticated,
  user
}) => {
  return <div>{title} - {user?.name}</div>;
};

// Enhanced component doesn't require auth props
const ProtectedDashboard = withAuth(Dashboard);

// Usage - no need to pass isAuthenticated or user
<ProtectedDashboard title="My Dashboard" />
```

---

### 🐛 Real-World Scenario

**Scenario: Props Collision Bug in Production Dashboard**

**Context:**
An e-commerce analytics dashboard used multiple HOCs for authentication, data fetching, and theme management. After adding a new `withAnalytics` HOC, the dashboard started showing incorrect data and throwing TypeScript errors in production.

**The Problem Code:**

```javascript
// ❌ PROBLEMATIC: Multiple HOCs with prop collisions
function withAuth(Component) {
  return function(props) {
    const user = useAuth();
    return <Component {...props} user={user} loading={true} />;
  };
}

function withData(Component, endpoint) {
  return function(props) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true); // Collision!

    useEffect(() => {
      fetch(endpoint)
        .then(r => r.json())
        .then(setData)
        .finally(() => setLoading(false));
    }, []);

    return <Component {...props} data={data} loading={loading} />;
  };
}

function withAnalytics(Component) {
  return function(props) {
    const user = useAnalytics(); // Collision!
    return <Component {...props} user={user} />;
  };
}

// Composition
const EnhancedDashboard = compose(
  withAuth,
  withData('/api/stats'),
  withAnalytics
)(Dashboard);

// Dashboard component expects:
// - user (auth data)
// - user (analytics data) ← COLLISION
// - loading (auth state)
// - loading (data state) ← COLLISION
```

**Impact:**
- **User Experience**: Dashboard showed wrong user data (analytics user instead of auth user)
- **Loading States**: Loading spinner stuck because one HOC's `loading` prop overwrote another's
- **Error Rate**: 15% of dashboard renders failed with "Cannot read property 'name' of undefined"
- **TypeScript Errors**: 47 type errors in production builds
- **Debug Time**: 8 hours to identify the root cause across nested HOCs

**Debugging Process:**

**Step 1: React DevTools Inspection**
```javascript
// In React DevTools, we saw the component tree:
WithAuth
  └─ WithData
      └─ WithAnalytics
          └─ Dashboard

// Props at Dashboard level:
{
  user: { id: 'analytics-123' }, // Should be auth user!
  loading: false, // Wrong loading state
  data: { ... }
}
```

**Step 2: Console Logging in HOCs**
```javascript
function withAuth(Component) {
  return function(props) {
    const user = useAuth();
    console.log('withAuth - user:', user);
    console.log('withAuth - props before spread:', props);
    return <Component {...props} user={user} loading={true} />;
  };
}

// Console output showed prop overwriting:
// withAuth - user: { id: 'auth-456', name: 'John' }
// withData - loading: true
// withAnalytics - user: { id: 'analytics-123' } ← Overwrites auth user!
```

**Step 3: Identifying the Pattern**

Props were being overwritten because each HOC spread `{...props}` and then added its own props with the same names.

**The Fix:**

```javascript
// ✅ SOLUTION 1: Namespace props to avoid collisions
function withAuth(Component) {
  return function(props) {
    const authUser = useAuth();
    const authLoading = true;

    return (
      <Component
        {...props}
        auth={{ user: authUser, loading: authLoading }}
      />
    );
  };
}

function withData(Component, endpoint) {
  return function(props) {
    const [data, setData] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
      fetch(endpoint)
        .then(r => r.json())
        .then(setData)
        .finally(() => setDataLoading(false));
    }, []);

    return (
      <Component
        {...props}
        dataFetch={{ data, loading: dataLoading }}
      />
    );
  };
}

function withAnalytics(Component) {
  return function(props) {
    const analyticsUser = useAnalytics();

    return (
      <Component
        {...props}
        analytics={{ user: analyticsUser }}
      />
    );
  };
}

// Updated Dashboard component
function Dashboard({ auth, dataFetch, analytics }) {
  if (auth.loading || dataFetch.loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1>Welcome, {auth.user.name}</h1>
      <Stats data={dataFetch.data} />
      <Analytics user={analytics.user} />
    </div>
  );
}
```

```javascript
// ✅ SOLUTION 2: Migrate to custom hooks (better approach)
// Instead of HOCs, use hooks to avoid composition issues

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthUser().then(setUser).finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

function useData(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(endpoint)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading };
}

function useAnalytics() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getAnalyticsUser().then(setUser);
  }, []);

  return user;
}

// Clean Dashboard with hooks (no prop collisions!)
function Dashboard() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { data, loading: dataLoading } = useData('/api/stats');
  const analyticsUser = useAnalytics();

  if (authLoading || dataLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1>Welcome, {authUser.name}</h1>
      <Stats data={data} />
      <Analytics user={analyticsUser} />
    </div>
  );
}
```

**Results After Fix:**
- **Error Rate**: Dropped from 15% to 0.2%
- **Correct Data**: Auth user displayed correctly 100% of the time
- **Loading States**: Both loading states managed independently
- **TypeScript**: Zero type errors
- **Performance**: Reduced unnecessary re-renders by 40%
- **Code Clarity**: 60% less code, easier to debug
- **Maintenance**: 3x faster to add new data sources

**Key Lessons:**

1. **Prop Naming Conflicts**: Always namespace props from HOCs (`auth`, `data`, `analytics` objects)
2. **HOC Order Matters**: Later HOCs can overwrite props from earlier ones
3. **Debugging Difficulty**: Deep HOC nesting makes debugging exponentially harder
4. **Migration Path**: Hooks solve most HOC problems elegantly
5. **Type Safety**: Proper TypeScript types catch these issues at compile time
6. **DevTools**: React DevTools' component tree is essential for HOC debugging
7. **Testing**: Unit test each HOC in isolation to catch prop conflicts early

**Additional Anti-Pattern:**

```javascript
// ❌ BAD: Mutating props in HOC
function withModifiedProps(Component) {
  return function(props) {
    props.modifiedProp = 'changed'; // NEVER mutate props!
    return <Component {...props} />;
  };
}

// ✅ GOOD: Create new object
function withModifiedProps(Component) {
  return function(props) {
    const newProps = { ...props, modifiedProp: 'changed' };
    return <Component {...newProps} />;
  };
}
```

---

### ⚖️ Trade-offs

#### HOCs vs Hooks vs Render Props

**1. Higher-Order Components (HOCs)**

**Pros:**
- ✅ **Composition**: Easy to compose multiple enhancements
- ✅ **Reusability**: Share logic across many components
- ✅ **Props abstraction**: Hide complex logic from child components
- ✅ **Legacy compatibility**: Works with class components
- ✅ **External library integration**: Wrap third-party components easily

**Cons:**
- ❌ **Wrapper hell**: Deep nesting makes debugging difficult
- ❌ **Prop collisions**: Multiple HOCs can overwrite each other's props
- ❌ **Static typing**: Complex TypeScript types for prop inference
- ❌ **Ref forwarding**: Requires explicit `forwardRef` handling
- ❌ **Performance**: Extra component layers can impact performance
- ❌ **Name collisions**: `displayName` can be confusing in DevTools

**When to Use HOCs:**
- Wrapping third-party components
- Legacy codebases with class components
- Library authors providing reusable functionality
- Cross-cutting concerns (auth, logging, tracking)

---

**2. Custom Hooks**

**Pros:**
- ✅ **No wrapper hell**: Logic composition without extra components
- ✅ **Clear dependencies**: Hooks explicitly show what they use
- ✅ **Type safety**: Excellent TypeScript inference
- ✅ **No prop conflicts**: Direct variable naming
- ✅ **Modern React**: Aligns with React's current direction
- ✅ **Easier testing**: Test hooks independently with `@testing-library/react-hooks`

**Cons:**
- ❌ **Function components only**: Can't use with class components
- ❌ **Rules of hooks**: Must follow strict hook rules
- ❌ **Render dependency**: Every hook call happens on every render
- ❌ **No component wrapping**: Can't wrap components without render props

**When to Use Hooks:**
- Modern React applications (React 16.8+)
- Logic sharing between function components
- Complex state management
- Side effects and lifecycle logic
- When you want clear, readable code

---

**3. Render Props**

**Pros:**
- ✅ **Explicit data flow**: Clear what's passed to children
- ✅ **Dynamic composition**: Render different children based on state
- ✅ **No naming conflicts**: Consumer names props explicitly
- ✅ **Works with any component**: Class or function components
- ✅ **Fine-grained control**: Consumer controls rendering completely

**Cons:**
- ❌ **Callback hell**: Nesting multiple render props is ugly
- ❌ **Verbose**: More code than HOCs or hooks
- ❌ **Performance**: Inline functions can break `PureComponent` optimization
- ❌ **No static typing help**: TypeScript inference can be tricky

**When to Use Render Props:**
- When you need to pass dynamic JSX
- Building reusable UI components (modals, tooltips)
- When consumers need full rendering control
- Animations and transitions

---

#### Comparison Table

| Feature | HOC | Hook | Render Prop |
|---------|-----|------|-------------|
| **Syntax Complexity** | Medium | Low | High |
| **Wrapper Hell** | Yes | No | Yes |
| **Prop Collisions** | Common | Rare | None |
| **TypeScript Support** | Hard | Excellent | Medium |
| **Debugging** | Hard | Easy | Medium |
| **Performance** | Medium | Best | Medium |
| **Reusability** | High | High | Medium |
| **Class Components** | Yes | No | Yes |
| **Learning Curve** | Medium | Low | High |

---

#### Code Comparison: Same Feature, Three Approaches

**Use Case: Data fetching with loading state**

```javascript
// ❌ APPROACH 1: HOC (verbose, wrapper hell)
function withDataFetching(Component, endpoint) {
  return function WithDataFetching(props) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch(endpoint)
        .then(r => r.json())
        .then(setData)
        .finally(() => setLoading(false));
    }, []);

    return <Component {...props} data={data} loading={loading} />;
  };
}

const UserListWithData = withDataFetching(UserList, '/api/users');
const PostListWithData = withDataFetching(PostList, '/api/posts');

// Usage (extra component layer)
<UserListWithData />
```

```javascript
// ✅ APPROACH 2: Custom Hook (best for modern React)
function useDataFetching(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(endpoint)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading };
}

// Usage (clean, no extra components)
function UserList() {
  const { data, loading } = useDataFetching('/api/users');

  if (loading) return <Spinner />;
  return <div>{data.map(user => <User key={user.id} {...user} />)}</div>;
}
```

```javascript
// 🤔 APPROACH 3: Render Props (verbose but flexible)
function DataFetcher({ endpoint, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(endpoint)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [endpoint]);

  return children({ data, loading });
}

// Usage (callback hell with multiple data sources)
<DataFetcher endpoint="/api/users">
  {({ data: users, loading: usersLoading }) => (
    <DataFetcher endpoint="/api/posts">
      {({ data: posts, loading: postsLoading }) => {
        if (usersLoading || postsLoading) return <Spinner />;
        return <Dashboard users={users} posts={posts} />;
      }}
    </DataFetcher>
  )}
</DataFetcher>
```

---

#### Migration Strategy: HOCs to Hooks

**Before (HOC):**
```javascript
function withAuth(Component) {
  return function WithAuth(props) {
    const user = useAuth();
    if (!user) return <Login />;
    return <Component {...props} user={user} />;
  };
}

const ProtectedDashboard = withAuth(Dashboard);
```

**After (Hook):**
```javascript
function useRequireAuth() {
  const user = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  return user;
}

function Dashboard() {
  const user = useRequireAuth();
  if (!user) return null;

  return <div>Welcome {user.name}</div>;
}
```

**When NOT to Migrate:**
- Class components (can't use hooks)
- Third-party library wrappers
- Stable, working code with no issues
- When HOC provides component wrapping (e.g., error boundaries)

---

#### Decision Matrix

**Choose HOCs when:**
- ✅ Working with class components
- ✅ Wrapping third-party components
- ✅ Building a library (like React Redux's `connect`)
- ✅ Need to wrap component tree (error boundaries)

**Choose Hooks when:**
- ✅ Modern React (16.8+) with function components
- ✅ Logic reuse between components
- ✅ State and side effect management
- ✅ You want clean, readable code

**Choose Render Props when:**
- ✅ Consumer needs full control over rendering
- ✅ Building reusable UI components (modals, tooltips)
- ✅ Dynamic children based on state
- ✅ Animation libraries (Framer Motion uses render props)

---

#### Performance Considerations

**HOC Performance Issues:**
```javascript
// ❌ BAD: Creates new component on every render
function ParentComponent() {
  const EnhancedChild = withLoading(Child); // New component each time!
  return <EnhancedChild />;
}

// ✅ GOOD: Create enhanced component outside
const EnhancedChild = withLoading(Child);

function ParentComponent() {
  return <EnhancedChild />;
}
```

**Hook Performance:**
```javascript
// ✅ Hooks are optimized and don't create extra component layers
function Component() {
  const data = useData(); // Minimal overhead
  const auth = useAuth(); // No wrapper components
  return <div>{data}</div>;
}
```

**Render Props Performance:**
```javascript
// ❌ BAD: Inline function breaks PureComponent optimization
<DataFetcher>
  {data => <ExpensiveComponent data={data} />}
</DataFetcher>

// ✅ GOOD: Memoize children
const renderData = useCallback(
  data => <ExpensiveComponent data={data} />,
  []
);

<DataFetcher>{renderData}</DataFetcher>
```

---

### 💬 Explain to Junior

**Simple Analogy: The Gift Wrapper**

Imagine you have a birthday present (your React component). A Higher-Order Component is like a gift wrapper that adds a nice box, ribbon, and card around your present, making it fancier without changing what's inside.

**Example:**
```javascript
// Your original present (component)
function SimpleBirthdayCard() {
  return <div>Happy Birthday!</div>;
}

// Gift wrapper (HOC)
function withGiftWrap(Present) {
  return function WrappedPresent(props) {
    return (
      <div style={{ border: '2px solid gold', padding: '20px' }}>
        <div>🎁 Special Gift 🎁</div>
        <Present {...props} />
        <div>With love ❤️</div>
      </div>
    );
  };
}

// Wrapped present
const FancyBirthdayCard = withGiftWrap(SimpleBirthdayCard);

// Result: Your card now has a fancy wrapper around it!
```

Just like you can wrap a gift multiple times (box → ribbon → card), you can wrap components with multiple HOCs to add different features.

---

#### Real-World Example: Authentication Check

**Without HOC (repetitive code):**
```javascript
function Dashboard() {
  const user = useAuth();

  if (!user) {
    return <div>Please login</div>;
  }

  return <div>Welcome to Dashboard, {user.name}</div>;
}

function Profile() {
  const user = useAuth();

  if (!user) {
    return <div>Please login</div>;
  }

  return <div>Your profile, {user.name}</div>;
}

// We're repeating the auth check everywhere!
```

**With HOC (reusable):**
```javascript
// Create the HOC once
function withAuth(Component) {
  return function ProtectedComponent(props) {
    const user = useAuth();

    if (!user) {
      return <div>Please login</div>;
    }

    // Pass user as prop to wrapped component
    return <Component {...props} user={user} />;
  };
}

// Use it everywhere (no more repetition!)
function Dashboard({ user }) {
  return <div>Welcome to Dashboard, {user.name}</div>;
}

function Profile({ user }) {
  return <div>Your profile, {user.name}</div>;
}

// Wrap components
const ProtectedDashboard = withAuth(Dashboard);
const ProtectedProfile = withAuth(Profile);
```

---

#### Common HOC Patterns You'll See in Interviews

**1. `withLoading` - Show spinner while loading**
```javascript
function withLoading(Component) {
  return function({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <Component {...props} />;
  };
}

// Usage
const UserListWithLoading = withLoading(UserList);
<UserListWithLoading isLoading={loading} users={users} />
```

**2. `withErrorBoundary` - Catch errors**
```javascript
function withErrorBoundary(Component) {
  return class extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    render() {
      if (this.state.hasError) {
        return <div>Something went wrong!</div>;
      }
      return <Component {...this.props} />;
    }
  };
}
```

**3. `withLogger` - Log props for debugging**
```javascript
function withLogger(Component) {
  return function(props) {
    console.log('Component props:', props);
    return <Component {...props} />;
  };
}

// Useful during development!
const DebuggedComponent = withLogger(MyComponent);
```

---

#### Interview Answer Template

**When asked: "What is a Higher-Order Component?"**

**Good Answer Structure:**

1. **Definition**: "A Higher-Order Component is a function that takes a component and returns a new component with additional props or behavior."

2. **Example**: "For instance, `withAuth` is a HOC that checks authentication:
   ```javascript
   const ProtectedComponent = withAuth(MyComponent);
   ```
   It wraps MyComponent and adds authentication checking before rendering it."

3. **Use Cases**: "Common HOCs include:
   - `withAuth` for authentication
   - `withLoading` for loading states
   - `withErrorBoundary` for error handling
   - Redux's `connect` is also a HOC"

4. **Trade-offs**: "HOCs are powerful but have downsides:
   - **Pros**: Great for reusing logic across components
   - **Cons**: Can cause wrapper hell and prop naming conflicts
   - **Modern Alternative**: Custom hooks are now preferred in most cases"

5. **Code Example**:
   ```javascript
   function withAuth(Component) {
     return function(props) {
       const user = useAuth();
       if (!user) return <Login />;
       return <Component {...props} user={user} />;
     };
   }
   ```

**Red Flags to Avoid:**
- ❌ Don't say "HOCs modify components" (they don't, they wrap them)
- ❌ Don't confuse HOCs with hooks
- ❌ Don't forget to mention `displayName` and ref forwarding issues

---

#### Quick Checklist for HOC Implementation

**When writing a HOC, remember:**

1. ✅ **Pass all props**: `<Component {...props} />`
2. ✅ **Set displayName**: `WithHOC.displayName = 'WithHOC(Component)'`
3. ✅ **Forward refs**: Use `React.forwardRef` if component uses refs
4. ✅ **Hoist static methods**: Use `hoist-non-react-statics` library
5. ✅ **Namespace injected props**: Avoid `loading`, use `auth.loading`
6. ✅ **Don't mutate**: Create new props object, don't modify existing
7. ✅ **Don't create inside render**: Define HOCs outside components

---

#### The Problem with HOCs (Why Hooks Won)

**Wrapper Hell Example:**
```javascript
// ❌ This is hard to read and debug
const EnhancedComponent = withRouter(
  withAuth(
    withLoading(
      withErrorBoundary(
        withTracking(Dashboard)
      )
    )
  )
);

// In React DevTools:
WithRouter
  WithAuth
    WithLoading
      WithErrorBoundary
        WithTracking
          Dashboard ← Your actual component is buried 5 layers deep!
```

**Hooks Solution (Much Cleaner):**
```javascript
// ✅ Clear, flat, easy to understand
function Dashboard() {
  const router = useRouter();
  const user = useAuth();
  const { data, loading } = useData();
  const tracking = useTracking();

  // All logic in one place, no nesting!
}
```

---

#### Key Takeaways

1. **HOCs wrap components** to add functionality (like gift wrapping)
2. **Use `withX` naming convention** (withAuth, withLoading, withRouter)
3. **Always pass props down** using spread: `{...props}`
4. **Set displayName** for better debugging
5. **Watch for prop collisions** when composing multiple HOCs
6. **Hooks are usually better** for new code (simpler, no wrappers)
7. **HOCs still useful** for class components and third-party wrappers

---

## Question 2: What are the problems with HOCs and what are the modern alternatives?

### Answer

While Higher-Order Components were a popular pattern in React for years, they have several significant problems that led to the creation of modern alternatives like hooks and render props.

**Major Problems with HOCs:**

**1. Wrapper Hell (Deep Nesting)**
Multiple HOCs create deeply nested component trees, making debugging and performance optimization difficult. In React DevTools, you might see 5-10 wrapper components before reaching your actual component.

**2. Props Naming Collisions**
When multiple HOCs inject props with the same name (like `data`, `loading`, or `user`), later HOCs overwrite earlier ones, causing bugs that are hard to trace.

**3. Implicit Dependencies**
HOCs hide what props they inject or consume, making it unclear what data a component actually receives. This hurts code readability and maintainability.

**4. Static Typing Complexity**
TypeScript types for HOCs become extremely complex when composing multiple HOCs, requiring advanced type gymnastics to properly infer prop types.

**5. Ref Forwarding Issues**
HOCs don't automatically forward refs, requiring explicit `React.forwardRef` handling, which adds boilerplate.

**6. Static Method Loss**
Static methods on the wrapped component are lost unless explicitly hoisted using libraries like `hoist-non-react-statics`.

**Modern Alternatives:**

**1. Custom Hooks (Best Solution)**
Hooks allow you to reuse stateful logic without component wrappers. They're composable, explicit, and have excellent TypeScript support.

**2. Render Props**
Render props give consumers full control over rendering while sharing logic. Useful for UI components like modals and tooltips.

**3. Component Composition**
Breaking components into smaller, composable pieces often eliminates the need for HOCs entirely.

**When to Still Use HOCs:**
- Wrapping third-party components
- Legacy class components
- Library authors (like Redux's `connect`)
- Error boundaries (can't be hooks yet)

The React team recommends hooks as the primary abstraction for logic reuse in modern applications. HOCs remain useful for specific scenarios, but should no longer be the default choice.

---

### 🔍 Deep Dive

#### Problem 1: Wrapper Hell

**The Issue:**
Each HOC adds a layer to your component tree, making debugging difficult and potentially impacting performance.

**Example:**
```javascript
// ❌ PROBLEM: Deep HOC nesting
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

const enhance = compose(
  withRouter,
  connect(mapStateToProps),
  withAuth,
  withLoading,
  withErrorBoundary,
  withTracking,
  withTheme
);

const EnhancedDashboard = enhance(Dashboard);

// React DevTools shows:
// WithRouter
//   Connect(WithAuth(WithLoading(WithErrorBoundary(WithTracking(WithTheme(Dashboard))))))
//     WithAuth
//       WithLoading
//         WithErrorBoundary
//           WithTracking
//             WithTheme
//               Dashboard ← Your component is buried 7 levels deep!
```

**Impact:**
- **Debugging**: Setting breakpoints is confusing when you have 7 wrapper components
- **Performance**: Each wrapper is a component that can trigger re-renders
- **DevTools**: Component tree is cluttered and hard to navigate
- **Error Messages**: Stack traces are polluted with HOC wrapper names

**Solution with Hooks:**
```javascript
// ✅ SOLUTION: Flat structure with hooks
import { useRouter } from './hooks/useRouter';
import { useSelector } from 'react-redux';
import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';
import { useTracking } from './hooks/useTracking';
import { useTheme } from './hooks/useTheme';

function Dashboard() {
  const router = useRouter();
  const state = useSelector(state => state.dashboard);
  const auth = useAuth();
  const { data, loading } = useData('/api/dashboard');
  const tracking = useTracking();
  const theme = useTheme();

  // All logic in one place, zero wrapper components!
  // DevTools shows: Dashboard (clean!)
}
```

---

#### Problem 2: Props Naming Collisions

**The Issue:**
Multiple HOCs can inject props with the same name, causing silent bugs.

**Example:**
```javascript
// ❌ PROBLEM: Prop collisions
function withUser(Component) {
  return function(props) {
    const user = { id: 1, name: 'Auth User' };
    return <Component {...props} user={user} />;
  };
}

function withAnalytics(Component) {
  return function(props) {
    const user = { id: 'analytics-123' }; // Collision!
    return <Component {...props} user={user} />;
  };
}

// Both HOCs inject 'user' prop
const Enhanced = compose(
  withUser,      // This sets user = Auth User
  withAnalytics  // This OVERWRITES user = Analytics User
)(Dashboard);

// Dashboard receives analytics user instead of auth user!
function Dashboard({ user }) {
  console.log(user); // { id: 'analytics-123' } ← Wrong user!
}
```

**Real Bug Example:**
```javascript
// ❌ Multiple HOCs with 'loading' prop
function withAuth(Component) {
  return function(props) {
    const [loading, setLoading] = useState(true); // Auth loading
    // ...
    return <Component {...props} loading={loading} />;
  };
}

function withData(Component) {
  return function(props) {
    const [loading, setLoading] = useState(true); // Data loading
    // ...
    return <Component {...props} loading={loading} />;
  };
}

const Enhanced = compose(withAuth, withData)(UserList);

// UserList only sees data loading, not auth loading!
function UserList({ loading }) {
  // If auth is still loading but data finished,
  // loading = false (data's loading), so component renders
  // but crashes because auth.user is undefined!
}
```

**Solution: Namespace Props**
```javascript
// ✅ SOLUTION 1: Namespace props in HOCs
function withAuth(Component) {
  return function(props) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    return (
      <Component
        {...props}
        auth={{ user, loading }} // Namespaced!
      />
    );
  };
}

function withData(Component) {
  return function(props) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    return (
      <Component
        {...props}
        dataFetch={{ data, loading }} // Namespaced!
      />
    );
  };
}

// Clear, no collisions
function UserList({ auth, dataFetch }) {
  if (auth.loading || dataFetch.loading) return <Spinner />;
  return <div>{auth.user.name} - {dataFetch.data.length} items</div>;
}
```

**Solution: Use Hooks**
```javascript
// ✅ SOLUTION 2: Hooks eliminate prop collisions
function UserList() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { data, loading: dataLoading } = useData('/api/users');

  // Explicit naming, zero confusion!
  if (authLoading || dataLoading) return <Spinner />;
  return <div>{authUser.name} - {data.length} items</div>;
}
```

---

#### Problem 3: Implicit Dependencies (Props Unclear)

**The Issue:**
HOCs hide what props they provide or consume, making components hard to understand.

**Example:**
```javascript
// ❌ PROBLEM: What props does this component expect?
function UserProfile({ user, posts, loading, error, refetch, subscriptions }) {
  // Where do these props come from?
  // - user: withAuth HOC?
  // - posts: withData HOC?
  // - loading: which HOC?
  // - error: withErrorBoundary?
  // - refetch: withData?
  // - subscriptions: withSubscriptions?

  // You have to read all the HOC code to understand this!
}

const EnhancedUserProfile = compose(
  withAuth,
  withData('posts'),
  withSubscriptions
)(UserProfile);

// Looking at the component definition, it's impossible to know
// what props are injected vs what props are passed by parent
```

**With Hooks (Explicit Dependencies):**
```javascript
// ✅ SOLUTION: Crystal clear where data comes from
function UserProfile() {
  // Explicit: these come from hooks
  const { user, loading: authLoading } = useAuth();
  const { posts, loading: postsLoading, error, refetch } = useData('posts');
  const subscriptions = useSubscriptions(user.id);

  // Now it's obvious what this component uses and where it comes from!
}

// Or with props (explicit prop types)
function UserProfile({ userId, showPosts = true }) {
  // userId comes from parent (clear)
  // showPosts comes from parent (clear)
  // Everything else is internal
}
```

**TypeScript Makes This Worse with HOCs:**
```typescript
// ❌ PROBLEM: Complex types
interface OwnProps {
  userId: string;
}

interface InjectedAuthProps {
  user: User;
  isAuthenticated: boolean;
}

interface InjectedDataProps {
  data: Post[];
  loading: boolean;
  error: Error | null;
}

// Component expects injected + own props
type UserProfileProps = OwnProps & InjectedAuthProps & InjectedDataProps;

function UserProfile(props: UserProfileProps) { }

// But when using it, you only pass OwnProps
const Enhanced = compose(
  withAuth,
  withData
)(UserProfile);

<Enhanced userId="123" /> // How do you know what props to pass?
```

```typescript
// ✅ SOLUTION: Explicit types with hooks
interface UserProfileProps {
  userId: string; // Clear: from parent
}

function UserProfile({ userId }: UserProfileProps) {
  // Internal dependencies are obvious
  const { user } = useAuth(); // From hook
  const { data } = useData(`/users/${userId}/posts`); // From hook

  return <div>...</div>;
}

// Usage is clear
<UserProfile userId="123" /> // Only pass what's in the interface!
```

---

#### Problem 4: TypeScript Type Complexity

**The Issue:**
Properly typing HOCs in TypeScript is extremely difficult, especially with multiple HOCs.

**Example:**
```typescript
// ❌ PROBLEM: Complex HOC types
import { ComponentType } from 'react';

// Injected props that HOC provides
interface InjectedProps {
  user: User;
  loading: boolean;
}

// HOC type signature (confusing!)
function withAuth<P extends InjectedProps>(
  Component: ComponentType<P>
): ComponentType<Omit<P, keyof InjectedProps>> {
  return function WithAuth(props: Omit<P, keyof InjectedProps>) {
    const { user, loading } = useAuth();

    return (
      <Component
        {...props as P}
        user={user}
        loading={loading}
      />
    );
  };
}

// Using it:
interface DashboardProps extends InjectedProps {
  title: string;
}

const Dashboard: React.FC<DashboardProps> = ({ title, user, loading }) => {
  return <div>{title} - {user.name}</div>;
};

// Now wrap it
const ProtectedDashboard = withAuth(Dashboard);

// Usage (TypeScript infers you don't need to pass user/loading)
<ProtectedDashboard title="My Dashboard" /> // ✅ Correct

// But composing multiple HOCs is a nightmare:
const Enhanced = compose(
  withAuth,      // Injects { user, loading }
  withData,      // Injects { data, dataLoading }
  withRouter     // Injects { router, location }
)(Dashboard);

// TypeScript struggles to infer correct types here
<Enhanced title="Dashboard" /> // Type errors everywhere!
```

**Hook Alternative (Simple Types):**
```typescript
// ✅ SOLUTION: Simple, clear types
interface DashboardProps {
  title: string; // Only props from parent
}

function Dashboard({ title }: DashboardProps) {
  // Hooks have excellent type inference
  const { user, loading } = useAuth(); // Types inferred automatically
  const { data, loading: dataLoading } = useData<Post[]>('/api/posts');
  const router = useRouter(); // Types inferred

  if (loading || dataLoading) return <Spinner />;

  return <div>{title} - {user.name}</div>;
}

// Usage is simple
<Dashboard title="My Dashboard" /> // TypeScript knows exactly what props are needed!
```

---

#### Problem 5: Ref Forwarding

**The Issue:**
Refs don't automatically forward through HOCs.

**Example:**
```javascript
// ❌ PROBLEM: Ref doesn't work
function withLogging(Component) {
  return function WithLogging(props) {
    console.log('Rendering with props:', props);
    return <Component {...props} />;
  };
}

const EnhancedInput = withLogging(Input);

function ParentComponent() {
  const inputRef = useRef();

  // This ref doesn't work!
  return <EnhancedInput ref={inputRef} />;
  // ref attaches to WithLogging, not Input!
}
```

**Solution: forwardRef**
```javascript
// ✅ SOLUTION: Use forwardRef
import React, { forwardRef } from 'react';

function withLogging(Component) {
  function WithLogging(props, ref) {
    console.log('Rendering with props:', props);
    return <Component {...props} ref={ref} />;
  }

  WithLogging.displayName = `WithLogging(${Component.name})`;

  // Must wrap with forwardRef
  return forwardRef(WithLogging);
}

const EnhancedInput = withLogging(Input);

// Now refs work correctly
function ParentComponent() {
  const inputRef = useRef();
  return <EnhancedInput ref={inputRef} />; // ✅ Works!
}
```

**Hooks Don't Have This Problem:**
```javascript
// ✅ Hooks don't interfere with refs
function FormInput() {
  const inputRef = useRef();
  const { validate } = useValidation(); // Hook doesn't affect refs

  return <input ref={inputRef} onChange={validate} />;
}
```

---

#### Problem 6: Static Methods Lost

**The Issue:**
Static methods on components are lost when wrapped in HOCs.

**Example:**
```javascript
// ❌ PROBLEM: Static methods lost
class MyComponent extends React.Component {
  static staticMethod() {
    return 'I am static';
  }

  render() {
    return <div>Component</div>;
  }
}

MyComponent.staticMethod(); // ✅ Works

// Wrap with HOC
const Enhanced = withHOC(MyComponent);

Enhanced.staticMethod(); // ❌ undefined! Static method lost!
```

**Solution: Hoist Statics**
```javascript
// ✅ SOLUTION: Manually copy statics
import hoistNonReactStatics from 'hoist-non-react-statics';

function withHOC(Component) {
  function WithHOC(props) {
    return <Component {...props} />;
  }

  // Copy all non-React static methods
  hoistNonReactStatics(WithHOC, Component);

  return WithHOC;
}

const Enhanced = withHOC(MyComponent);
Enhanced.staticMethod(); // ✅ Works now!
```

---

#### Modern Alternatives Comparison

**1. Custom Hooks (Best for Logic Reuse)**

```javascript
// ✅ Modern way: Custom hooks
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser().then(setUser).finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

// Clean usage
function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Login />;

  return <div>Welcome {user.name}</div>;
}
```

**2. Render Props (Best for UI Control)**

```javascript
// ✅ Render props for flexible rendering
function Auth({ children }) {
  const { user, loading } = useAuth();

  return children({ user, loading });
}

// Consumer controls rendering
<Auth>
  {({ user, loading }) => {
    if (loading) return <Spinner />;
    if (!user) return <Login />;
    return <Dashboard user={user} />;
  }}
</Auth>
```

**3. Component Composition (Best for Structure)**

```javascript
// ✅ Break into smaller components
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

---

#### When HOCs Are Still Useful

**1. Error Boundaries (Can't Be Hooks Yet)**
```javascript
// ✅ HOCs still needed for error boundaries
function withErrorBoundary(Component) {
  return class extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    componentDidCatch(error, info) {
      logError(error, info);
    }

    render() {
      if (this.state.hasError) {
        return <ErrorFallback />;
      }
      return <Component {...this.props} />;
    }
  };
}
```

**2. Third-Party Library Wrappers**
```javascript
// ✅ Wrapping external libraries
import { Map } from 'external-map-library';

function withMapControls(MapComponent) {
  return function WithMapControls(props) {
    const [zoom, setZoom] = useState(10);
    const [center, setCenter] = useState([0, 0]);

    return (
      <>
        <Controls zoom={zoom} onZoomChange={setZoom} />
        <MapComponent
          {...props}
          zoom={zoom}
          center={center}
        />
      </>
    );
  };
}

const EnhancedMap = withMapControls(Map);
```

---

### ⚖️ Trade-offs

#### HOCs vs Hooks: Detailed Comparison

**Scenario 1: Authentication Logic**

```javascript
// HOC Approach
function withAuth(Component) {
  return function WithAuth(props) {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;

    return <Component {...props} user={user} />;
  };
}

const ProtectedDashboard = withAuth(Dashboard);
const ProtectedProfile = withAuth(Profile);
const ProtectedSettings = withAuth(Settings);

// Pros:
// ✅ Wrap once, reuse everywhere
// ✅ Consistent authentication handling
// ✅ Works with class components

// Cons:
// ❌ Extra wrapper component in tree
// ❌ Props implicitly injected (user prop)
// ❌ Can't customize loading/redirect per component
```

```javascript
// Hook Approach
function useRequireAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  return { user, loading };
}

function Dashboard() {
  const { user, loading } = useRequireAuth();
  if (loading) return <Spinner />;
  return <div>Welcome {user.name}</div>;
}

function Profile() {
  const { user, loading } = useRequireAuth();
  if (loading) return <ProfileSkeleton />; // Custom loading!
  return <div>{user.email}</div>;
}

// Pros:
// ✅ No wrapper components
// ✅ Explicit dependencies
// ✅ Easy to customize per component
// ✅ Better TypeScript inference

// Cons:
// ❌ Repeat hook call in every component (minimal cost)
// ❌ Can't use with class components
```

**Winner: Hooks** (cleaner, more flexible, better types)

---

**Scenario 2: Data Fetching**

```javascript
// HOC Approach
function withData(Component, endpoint) {
  return function WithData(props) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch(endpoint)
        .then(r => r.json())
        .then(setData)
        .finally(() => setLoading(false));
    }, []);

    return <Component {...props} data={data} loading={loading} />;
  };
}

// Fixed endpoint - can't pass dynamic ID
const UserList = withData(List, '/api/users');

// Pros:
// ✅ Simple for static endpoints

// Cons:
// ❌ Can't pass dynamic parameters easily
// ❌ Hard to refetch data
// ❌ Can't compose multiple data sources without prop collisions
```

```javascript
// Hook Approach
function useData(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    setLoading(true);
    fetch(endpoint)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [endpoint]);

  useEffect(() => {
    refetch();
  }, [endpoint, refetch]);

  return { data, loading, refetch };
}

function UserList({ userId }) {
  // Dynamic endpoint based on props
  const { data, loading, refetch } = useData(`/api/users/${userId}`);

  // Easy to refetch
  return (
    <>
      <button onClick={refetch}>Refresh</button>
      {loading ? <Spinner /> : <List items={data} />}
    </>
  );
}

// Multiple data sources? No problem!
function Dashboard() {
  const { data: users, loading: usersLoading } = useData('/api/users');
  const { data: posts, loading: postsLoading } = useData('/api/posts');

  // Clear variable names, no collisions
}

// Pros:
// ✅ Dynamic endpoints
// ✅ Easy refetching
// ✅ Multiple data sources without collisions
// ✅ Clear loading states

// Cons:
// ❌ Slightly more verbose per component
```

**Winner: Hooks** (far more flexible)

---

**Scenario 3: Logging/Analytics**

```javascript
// HOC Approach
function withTracking(Component, eventName) {
  return function WithTracking(props) {
    useEffect(() => {
      analytics.track(eventName, { props });
    }, [props]);

    return <Component {...props} />;
  };
}

const TrackedDashboard = withTracking(Dashboard, 'dashboard_view');

// Pros:
// ✅ Declarative (component name tells you it's tracked)
// ✅ Can't forget to track (wrapper handles it)

// Cons:
// ❌ Extra wrapper component
// ❌ Tracks on every prop change (may not want this)
```

```javascript
// Hook Approach
function useTracking(eventName, data) {
  useEffect(() => {
    analytics.track(eventName, data);
  }, [eventName, JSON.stringify(data)]);
}

function Dashboard({ userId }) {
  useTracking('dashboard_view', { userId });

  // Or track specific actions
  const handleExport = () => {
    analytics.track('dashboard_export', { format: 'pdf' });
    exportData();
  };
}

// Pros:
// ✅ More control over when to track
// ✅ Easy to track user actions
// ✅ No wrapper component

// Cons:
// ❌ Must remember to add hook (but IDE can remind)
```

**Winner: Tie** (HOCs for automatic tracking, hooks for fine-grained control)

---

**Scenario 4: Theme/Context Injection**

```javascript
// HOC Approach
function withTheme(Component) {
  return function WithTheme(props) {
    const theme = useContext(ThemeContext);
    return <Component {...props} theme={theme} />;
  };
}

const ThemedButton = withTheme(Button);

// Pros:
// ✅ Works before hooks existed
// ✅ Class component compatible

// Cons:
// ❌ Unnecessary wrapper (hooks solve this better)
```

```javascript
// Hook Approach
function Button() {
  const theme = useContext(ThemeContext);
  return <button style={{ color: theme.primary }}>Click</button>;
}

// Pros:
// ✅ Direct, no wrapper
// ✅ Built into React

// Cons:
// None really
```

**Winner: Hooks** (context hooks are built-in, HOCs are redundant)

---

#### Performance Comparison

**HOCs:**
```javascript
// ❌ Each HOC is a component that can re-render
const Enhanced = compose(
  withAuth,   // Re-renders when auth changes
  withData,   // Re-renders when data changes
  withTheme   // Re-renders when theme changes
)(Component);

// Component re-renders when:
// - Its own props change
// - withAuth re-renders (auth change)
// - withData re-renders (data change)
// - withTheme re-renders (theme change)

// More components = more potential re-renders
```

**Hooks:**
```javascript
// ✅ Hooks don't add component layers
function Component() {
  const { user } = useAuth();      // Subscribes to auth
  const { data } = useData();      // Subscribes to data
  const theme = useContext(Theme); // Subscribes to theme

  // Component re-renders when:
  // - Its own props change
  // - Any hook's data changes

  // But no intermediate wrapper re-renders!
}

// Generally more efficient
```

**Winner: Hooks** (fewer component layers = better performance)

---

#### Bundle Size Impact

**HOCs:**
```javascript
// Each HOC adds code
import { compose } from 'redux';  // +1KB
import hoistStatics from 'hoist-non-react-statics'; // +2KB

function withAuth(Component) { /* ... */ }
function withData(Component, endpoint) { /* ... */ }
function withTheme(Component) { /* ... */ }

// Total: ~5-10KB for HOC utilities and implementations
```

**Hooks:**
```javascript
// Hooks are leaner
function useAuth() { /* ... */ }
function useData(endpoint) { /* ... */ }
const theme = useContext(ThemeContext); // Built-in

// Total: ~2-3KB (no extra utilities needed)
```

**Winner: Hooks** (smaller bundle size)

---

#### Decision Matrix

| Criteria | HOC | Hook | Winner |
|----------|-----|------|--------|
| **Code Clarity** | Medium | High | Hook |
| **Type Safety** | Hard | Easy | Hook |
| **Debugging** | Hard | Easy | Hook |
| **Performance** | Medium | High | Hook |
| **Bundle Size** | Larger | Smaller | Hook |
| **Reusability** | High | High | Tie |
| **Learning Curve** | Medium | Low | Hook |
| **Class Components** | Yes | No | HOC |
| **Composition** | Complex | Simple | Hook |
| **Flexibility** | Medium | High | Hook |

**Overall Winner: Hooks** (9 out of 10 categories)

---

#### Migration Strategy: HOC to Hook

**Step 1: Identify HOC Pattern**
```javascript
// Before: HOC
function withAuth(Component) {
  return function WithAuth(props) {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;
    return <Component {...props} user={user} />;
  };
}

const ProtectedDashboard = withAuth(Dashboard);
```

**Step 2: Extract Hook Logic**
```javascript
// Create custom hook
function useRequireAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  return { user, loading };
}
```

**Step 3: Update Components**
```javascript
// After: Using hook
function Dashboard() {
  const { user, loading } = useRequireAuth();

  if (loading) return <Spinner />;

  return <div>Welcome {user.name}</div>;
}
```

**Step 4: Gradually Migrate**
```javascript
// Keep HOC for class components during transition
class LegacyDashboard extends React.Component { }
const ProtectedLegacyDashboard = withAuth(LegacyDashboard);

// Use hooks for new function components
function ModernDashboard() {
  const { user } = useRequireAuth();
  return <div>{user.name}</div>;
}
```

---

### 💬 Explain to Junior

**The Problem with HOCs: A Restaurant Analogy**

Imagine you're ordering food, but to get your meal, it has to pass through 5 different workers:

**HOC Approach (Wrapper Hell):**
```
You order pizza
  → Worker 1 checks if you're allowed to order (withAuth)
    → Worker 2 adds a receipt (withLogging)
      → Worker 3 wraps it in a box (withPackaging)
        → Worker 4 adds utensils (withUtensils)
          → Worker 5 finally gives you pizza
```

If something goes wrong (pizza is cold, wrong toppings), you have to ask 5 different workers to figure out who messed up!

**Hook Approach (Flat):**
```
You order pizza
  → One person checks everything:
      ✅ Are you allowed to order? (useAuth)
      ✅ Add receipt (useLogging)
      ✅ Pack it (usePackaging)
      ✅ Add utensils (useUtensils)
  → You get pizza
```

If something goes wrong, you know exactly who to ask because it's one person handling everything!

---

#### Real Code Example

**The Problem: Props Collision**

```javascript
// ❌ BAD: Two HOCs both inject 'user' prop
function withAuth(Component) {
  return function(props) {
    const user = { name: 'John', role: 'admin' }; // Auth user
    return <Component {...props} user={user} />;
  };
}

function withAnalytics(Component) {
  return function(props) {
    const user = { id: 'analytics-123' }; // Analytics user
    return <Component {...props} user={user} />;
  };
}

// Combine them
const Enhanced = withAnalytics(withAuth(Dashboard));

// Dashboard receives analytics user, not auth user!
function Dashboard({ user }) {
  console.log(user); // { id: 'analytics-123' } ← Wrong!
  // We wanted auth user but got analytics user
}
```

**Why This Happens:**
```javascript
// Step by step execution:
// 1. withAuth wraps Dashboard and passes user = { name: 'John' }
// 2. withAnalytics wraps that and OVERWRITES user = { id: 'analytics-123' }
// 3. Dashboard gets the last 'user' prop, which is from analytics

// It's like writing:
const props = {};
props.user = { name: 'John' };       // withAuth sets this
props.user = { id: 'analytics-123' }; // withAnalytics OVERWRITES it
```

**The Solution: Use Hooks**

```javascript
// ✅ GOOD: Hooks let you name variables explicitly
function Dashboard() {
  const { user: authUser } = useAuth();           // Rename to authUser
  const { user: analyticsUser } = useAnalytics(); // Rename to analyticsUser

  // No confusion!
  console.log(authUser);       // { name: 'John', role: 'admin' }
  console.log(analyticsUser);  // { id: 'analytics-123' }
}
```

---

#### Common Interview Question: "Why are hooks better than HOCs?"

**Good Answer Template:**

**1. Start with the main problem:**
"HOCs have three main problems: wrapper hell, prop collisions, and unclear dependencies."

**2. Explain wrapper hell:**
"When you stack multiple HOCs like `withAuth(withLoading(withData(Component)))`, you get deeply nested component trees. In React DevTools, you see 5-6 wrapper components before your actual component. This makes debugging really hard."

**3. Explain prop collisions:**
"If two HOCs inject props with the same name, like both adding a 'user' prop, the last HOC overwrites the first one. This causes silent bugs that are hard to trace."

**4. Give the hook solution:**
"Hooks solve this because they don't create wrapper components. Instead, you just call functions inside your component:
```javascript
function Dashboard() {
  const { user } = useAuth();
  const { data } = useData();
  // No wrappers, no collisions!
}
```

**5. End with when HOCs are still useful:**
"HOCs are still useful for error boundaries (which can't be hooks yet) and wrapping third-party components, but for most logic reuse, hooks are the modern standard."

---

#### Visual Comparison

**HOCs in DevTools:**
```
▼ WithRouter
  ▼ Connect(Dashboard)
    ▼ WithAuth
      ▼ WithLoading
        ▼ WithErrorBoundary
          ▶ Dashboard ← Your component is buried here!
```

**Hooks in DevTools:**
```
▶ Dashboard ← Just your component!
```

Much cleaner!

---

#### Red Flags to Avoid in Interviews

**❌ Don't say:**
- "HOCs are bad" (they're not, they're just less common now)
- "Never use HOCs" (error boundaries still need them)
- "Hooks and HOCs are the same thing" (completely different patterns)

**✅ Do say:**
- "Hooks are the modern standard for logic reuse"
- "HOCs have their place but are less common in new React code"
- "Hooks solve the wrapper hell and prop collision problems of HOCs"

---

#### Key Takeaways

1. **HOCs create wrapper components**, hooks don't
2. **Props collisions** happen when multiple HOCs inject same prop names
3. **Wrapper hell** makes debugging really hard
4. **Hooks are simpler**: just call functions inside components
5. **HOCs still useful** for error boundaries and wrapping third-party code
6. **Modern React prefers hooks** for logic reuse
7. **Migration is gradual**: you can mix HOCs and hooks during transition

**Remember:** If someone asks "Should I use HOCs?", the answer is usually "No, use hooks instead" unless they're working with class components or error boundaries.
