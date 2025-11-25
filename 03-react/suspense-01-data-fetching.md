# React Suspense - Data Fetching

## Question 1: How does Suspense work for data fetching in React 18+?

**Answer:**

React Suspense is a component that lets you declaratively specify loading states for parts of your component tree while waiting for asynchronous operations (like data fetching) to complete. Introduced experimentally in React 16.6 for code-splitting and matured in React 18, Suspense enables concurrent rendering features that allow React to pause rendering while waiting for data and show fallback UI without blocking the entire application.

The core mechanism works by "throwing" promises. When a component reads data that isn't ready yet (via libraries like React Query, SWR, or Relay), it throws a promise. React catches this promise, suspends rendering of that component tree, shows the nearest `<Suspense>` fallback, and resumes rendering once the promise resolves. This is fundamentally different from traditional loading states where each component manages its own loading flag.

In React 18+, Suspense integrates deeply with concurrent features like `useTransition` and `useDeferredValue`, allowing you to mark certain updates as non-urgent. This prevents jarring loading states by keeping old UI visible while new content loads in the background. Streaming Server-Side Rendering (SSR) also leverages Suspense, enabling you to send HTML to the browser progressively as different parts of the page become ready, dramatically improving Time to First Byte (TTFB) and First Contentful Paint (FCP).

The pattern encourages a "render-as-you-fetch" approach rather than "fetch-on-render" (where data fetching starts after component mounts) or "fetch-then-render" (where you wait for all data before rendering). With Suspense, you can start fetching data as early as possible (even before rendering starts) and let components suspend individually as they need their data.

**Key benefits:**
- **Declarative loading states**: No manual `isLoading` flags scattered throughout components
- **Automatic coordination**: React orchestrates multiple loading boundaries
- **Improved UX**: Transitions keep old UI visible during updates
- **Better performance**: Streaming SSR and progressive hydration
- **Code simplicity**: Components just read data; Suspense handles the rest

---

<details>
<summary><strong>🔍 Deep Dive: Suspense Internal Mechanism</strong></summary>

**Suspense Internal Mechanism: Promise Throwing & Catching**

The magic of Suspense relies on JavaScript's exception handling mechanism. When a Suspense-enabled data source (a "resource") isn't ready, it literally throws a promise:

```javascript
// Simplified internal mechanism
function wrapPromise(promise) {
  let status = 'pending';
  let result;

  const suspender = promise.then(
    (data) => {
      status = 'success';
      result = data;
    },
    (error) => {
      status = 'error';
      result = error;
    }
  );

  return {
    read() {
      if (status === 'pending') {
        throw suspender; // Throws promise to React
      } else if (status === 'error') {
        throw result; // Throws error to Error Boundary
      } else {
        return result; // Returns data
      }
    }
  };
}

// Usage
const resource = wrapPromise(fetch('/api/user').then(r => r.json()));

function User() {
  const user = resource.read(); // May throw promise or error
  return <div>{user.name}</div>;
}
```

When React encounters a thrown promise during rendering:

1. **Capture Phase**: React catches the promise in its reconciliation loop
2. **Boundary Search**: Traverses up the tree to find nearest `<Suspense>` boundary
3. **Fallback Render**: Commits the fallback UI to the DOM
4. **Promise Tracking**: Attaches a `.then()` handler to the promise
5. **Resume Phase**: When promise resolves, triggers re-render of suspended tree
6. **Commit Phase**: Replaces fallback with actual content

**Concurrent Rendering Integration**

React 18's concurrent rendering fundamentally changed how Suspense works. In legacy mode (React 17), Suspense boundaries would immediately show fallbacks, causing jarring "spinners everywhere" experiences. With concurrent features:

```javascript
import { useTransition, Suspense } from 'react';

function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('about');

  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab); // Mark as non-urgent
    });
  }

  return (
    <>
      <button onClick={() => selectTab('about')}>About</button>
      <button onClick={() => selectTab('posts')}>
        Posts {isPending && <Spinner />}
      </button>

      <Suspense fallback={<Spinner />}>
        {tab === 'about' && <AboutTab />}
        {tab === 'posts' && <PostsTab />} {/* May suspend */}
      </Suspense>
    </>
  );
}
```

**How useTransition affects Suspense:**

- **Without transition**: Clicking "Posts" immediately shows `<Spinner />` fallback (jarring)
- **With transition**: Old "About" tab stays visible while `<PostsTab>` loads in background
- **isPending flag**: Shows inline loading indicator in button (better UX)
- **Interruptible**: User can switch tabs mid-transition; React cancels old render

Internally, React maintains multiple "lanes" (priority levels). Transition updates use a lower-priority lane, allowing React to render the new tree without committing it. If a component suspends during a transition, React keeps the old UI visible until the new tree is ready.

**Streaming SSR Architecture**

React 18's Streaming SSR with Suspense revolutionizes server rendering:

```javascript
// server.js
import { renderToPipeableStream } from 'react-dom/server';

app.get('/', (req, res) => {
  const { pipe } = renderToPipeableStream(
    <App />,
    {
      bootstrapScripts: ['/main.js'],
      onShellReady() {
        // Shell (static parts) ready - start streaming
        res.setHeader('Content-Type', 'text/html');
        pipe(res);
      },
      onAllReady() {
        // All content (including suspended) ready
      },
      onError(error) {
        console.error(error);
      }
    }
  );
});

// App.js
function App() {
  return (
    <html>
      <body>
        <Header /> {/* Static - renders immediately */}

        <Suspense fallback={<Spinner />}>
          <Comments /> {/* Streams later */}
        </Suspense>

        <Suspense fallback={<Spinner />}>
          <RecommendedProducts /> {/* Streams later */}
        </Suspense>
      </body>
    </html>
  );
}
```

**Streaming flow:**

1. **Shell Ready** (50ms): Header + Suspense fallbacks sent to browser
2. **Progressive Hydration**: Browser starts hydrating static parts immediately
3. **Chunks Stream In**: As components resolve, HTML chunks sent via `<script>` tags
4. **Selective Hydration**: React hydrates high-priority components first (e.g., user clicked area)
5. **Complete**: All content loaded and interactive

The HTML arrives in chunks:
```html
<!-- Initial shell -->
<div id="root">
  <header>My Site</header>
  <div>Loading comments...</div>
  <div>Loading products...</div>
</div>

<!-- Later: Comments chunk -->
<div hidden id="comments-chunk">
  <div class="comment">Great article!</div>
  <!-- ... more comments -->
</div>
<script>
  // Inject comments into correct location
  document.getElementById('comments').replaceChildren(
    document.getElementById('comments-chunk')
  );
</script>

<!-- Later: Products chunk -->
<!-- Similar pattern -->
```

**Cache Integration (React Query Example)**

Modern data fetching libraries provide first-class Suspense support:

```javascript
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true, // Enable Suspense mode globally
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<AppSkeleton />}>
        <Dashboard />
      </Suspense>
    </QueryClientProvider>
  );
}

function Dashboard() {
  // No loading state needed - throws if not ready
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  });

  const { data: posts } = useQuery({
    queryKey: ['posts', user.id],
    queryFn: () => fetchPosts(user.id),
  });

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <PostList posts={posts} />
    </div>
  );
}
```

React Query's Suspense mode automatically:
- Throws promises when data is loading
- Throws errors to nearest Error Boundary
- Returns data when ready
- Handles background refetching without suspending again (uses cached data)

**Render-as-you-Fetch Pattern**

The optimal pattern with Suspense is starting data fetches as early as possible:

```javascript
// ❌ BAD: Fetch-on-render (waterfall)
function Profile() {
  return (
    <Suspense fallback={<Spinner />}>
      <User /> {/* Starts fetching */}
    </Suspense>
  );
}

function User() {
  const user = fetchUser(); // Fetch starts here
  return (
    <Suspense fallback={<Spinner />}>
      <Posts userId={user.id} /> {/* Can't start until user loads */}
    </Suspense>
  );
}

// ✅ GOOD: Render-as-you-fetch (parallel)
function Profile() {
  const userResource = useMemo(() => fetchUser(), []);
  const postsResource = useMemo(() => fetchPosts(), []);

  return (
    <Suspense fallback={<Spinner />}>
      <User resource={userResource} />
      <Posts resource={postsResource} /> {/* Fetches in parallel */}
    </Suspense>
  );
}
```

Even better with React Router or Next.js:
```javascript
// Start fetching before navigation
function ProductLink({ productId }) {
  return (
    <Link
      to={`/product/${productId}`}
      onMouseEnter={() => {
        // Prefetch on hover
        queryClient.prefetchQuery(['product', productId], fetchProduct);
      }}
    >
      View Product
    </Link>
  );
}
```

**Concurrent Features: useDeferredValue**

Another way to prevent jarring loading states:

```javascript
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);

  return (
    <Suspense fallback={<Spinner />}>
      <Results query={deferredQuery} /> {/* Uses stale value during transition */}
    </Suspense>
  );
}
```

When `query` changes:
1. `deferredQuery` stays at old value
2. React starts rendering new tree with new `query` in background
3. If `<Results>` suspends, old UI (with old `deferredQuery`) stays visible
4. Once ready, new UI appears

This creates a natural "debouncing" effect without manual debounce logic.

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Implementing Suspense in Production Dashboard</strong></summary>

### 🐛 Real-World Scenario

**Scenario: Implementing Suspense in Production E-commerce Dashboard**

You're working on a Next.js e-commerce admin dashboard with multiple data dependencies. The current implementation uses traditional loading states, resulting in a poor user experience with multiple spinners appearing sequentially. Let's migrate to Suspense and measure the improvements.

**Initial Implementation (Traditional Loading States):**

```javascript
// app/dashboard/page.tsx - Before
'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const userData = await fetch('/api/user').then(r => r.json());
        setUser(userData);

        const statsData = await fetch('/api/stats').then(r => r.json());
        setStats(statsData);

        const ordersData = await fetch('/api/orders').then(r => r.json());
        setRecentOrders(ordersData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <UserHeader user={user} />
      <StatsGrid stats={stats} />
      <OrdersTable orders={recentOrders} />
    </div>
  );
}
```

**Problems identified:**

1. **Sequential waterfall**: User → Stats → Orders (500ms + 800ms + 1200ms = 2500ms total)
2. **All-or-nothing loading**: Entire dashboard blocked until slowest API completes
3. **Poor perceived performance**: User sees blank skeleton for 2.5 seconds
4. **No granular control**: Can't prioritize critical sections
5. **Duplicate loading logic**: Every page repeats this pattern

**Production Metrics (Before):**
- Time to Interactive (TTI): 2.8s
- Largest Contentful Paint (LCP): 2.6s
- User complaints: "Dashboard feels slow"
- Bounce rate: 12% (users leaving before content loads)

**Refactored Implementation with Suspense:**

**Step 1: Setup React Query with Suspense**

```javascript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// app/providers.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Step 2: Create Query Hooks**

```javascript
// hooks/use-dashboard-data.ts
import { useQuery } from '@tanstack/react-query';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user');
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });
}

export function useRecentOrders() {
  return useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: async () => {
      const res = await fetch('/api/orders?limit=10');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
  });
}
```

**Step 3: Component Implementation with Nested Suspense Boundaries**

```javascript
// app/dashboard/page.tsx - After
import { Suspense } from 'react';
import { UserHeader } from './components/UserHeader';
import { StatsGrid } from './components/StatsGrid';
import { OrdersTable } from './components/OrdersTable';
import {
  UserHeaderSkeleton,
  StatsGridSkeleton,
  OrdersTableSkeleton,
} from './components/Skeletons';

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* Critical: User info loads first */}
      <Suspense fallback={<UserHeaderSkeleton />}>
        <UserHeader />
      </Suspense>

      {/* Important: Stats load independently */}
      <Suspense fallback={<StatsGridSkeleton />}>
        <StatsGrid />
      </Suspense>

      {/* Less critical: Orders can load last */}
      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrdersTable />
      </Suspense>
    </div>
  );
}

// components/UserHeader.tsx
'use client';

import { useUser } from '@/hooks/use-dashboard-data';

export function UserHeader() {
  const { data: user } = useUser(); // Suspends if not ready

  return (
    <header>
      <img src={user.avatar} alt={user.name} />
      <h1>Welcome back, {user.name}</h1>
    </header>
  );
}

// components/StatsGrid.tsx
'use client';

import { useStats } from '@/hooks/use-dashboard-data';

export function StatsGrid() {
  const { data: stats } = useStats(); // Suspends if not ready

  return (
    <div className="grid">
      <StatCard label="Revenue" value={stats.revenue} />
      <StatCard label="Orders" value={stats.orders} />
      <StatCard label="Customers" value={stats.customers} />
    </div>
  );
}

// components/OrdersTable.tsx
'use client';

import { useRecentOrders } from '@/hooks/use-dashboard-data';

export function OrdersTable() {
  const { data: orders } = useRecentOrders(); // Suspends if not ready

  return (
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td>{order.id}</td>
            <td>{order.customer}</td>
            <td>${order.amount}</td>
            <td>{order.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Step 4: Optimize with Prefetching**

```javascript
// app/dashboard/layout.tsx
'use client';

import { useEffect } from 'react';
import { queryClient } from '@/lib/query-client';

export default function DashboardLayout({ children }) {
  useEffect(() => {
    // Prefetch dashboard data on layout mount
    queryClient.prefetchQuery(['user'], fetchUser);
    queryClient.prefetchQuery(['stats'], fetchStats);
    queryClient.prefetchQuery(['orders', 'recent'], fetchRecentOrders);
  }, []);

  return <div className="dashboard-layout">{children}</div>;
}

// components/DashboardNav.tsx
function DashboardLink({ href, queryKey, queryFn, children }) {
  return (
    <Link
      href={href}
      onMouseEnter={() => {
        // Prefetch on hover for instant navigation
        queryClient.prefetchQuery(queryKey, queryFn);
      }}
    >
      {children}
    </Link>
  );
}
```

**Step 5: Handle Errors with Error Boundaries**

```javascript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Dashboard error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// app/dashboard/page.tsx - Updated with error handling
export default function Dashboard() {
  return (
    <div className="dashboard">
      <ErrorBoundary fallback={<UserHeaderError />}>
        <Suspense fallback={<UserHeaderSkeleton />}>
          <UserHeader />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<StatsGridError />}>
        <Suspense fallback={<StatsGridSkeleton />}>
          <StatsGrid />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<OrdersTableError />}>
        <Suspense fallback={<OrdersTableSkeleton />}>
          <OrdersTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

**Production Metrics (After):**

**Performance improvements:**
- Time to First Paint: 0.3s (was 0.5s) - 40% improvement
- Time to Interactive (UserHeader only): 0.8s (was 2.8s) - 71% improvement
- Full page load: 1.2s (was 2.8s) - 57% improvement
- Network requests: Parallel (500ms total, not 2500ms sequential)

**User experience improvements:**
- Progressive loading: User sees header in 500ms, stats in 800ms, orders in 1200ms
- No blank page: Skeleton components provide visual feedback
- Reduced bounce rate: 12% → 5%
- Perceived performance: Users report "feels faster"

**Code quality improvements:**
- 60% less loading state code
- Automatic error handling with boundaries
- Reusable query hooks across components
- Cache management handled by React Query

**Debugging Issues Encountered:**

**Issue 1: Suspense boundary too high**
```javascript
// ❌ Problem: Single boundary blocks entire dashboard
<Suspense fallback={<DashboardSkeleton />}>
  <UserHeader />
  <StatsGrid />
  <OrdersTable />
</Suspense>

// ✅ Solution: Granular boundaries for progressive loading
<Suspense fallback={<UserHeaderSkeleton />}>
  <UserHeader />
</Suspense>
<Suspense fallback={<StatsGridSkeleton />}>
  <StatsGrid />
</Suspense>
```

**Issue 2: Waterfall in nested components**
```javascript
// ❌ Problem: Posts can't load until user loads
function Dashboard() {
  return (
    <Suspense>
      <User /> {/* Loads first */}
    </Suspense>
  );
}

function User() {
  const user = useUser();
  return (
    <>
      <h1>{user.name}</h1>
      <Suspense>
        <Posts userId={user.id} /> {/* Waits for user */}
      </Suspense>
    </>
  );
}

// ✅ Solution: Lift data fetching to parent
function Dashboard() {
  const user = useUser(); // Start both fetches
  const posts = usePosts(user.id); // In parallel

  return (
    <Suspense>
      <UserDisplay user={user} />
      <PostsList posts={posts} />
    </Suspense>
  );
}
```

**Issue 3: Server Component vs Client Component confusion**
```javascript
// ❌ Problem: Mixing server/client incorrectly
// app/dashboard/page.tsx
import { Suspense } from 'react';

export default async function Dashboard() {
  // Server component - can't use hooks
  const data = await fetch('/api/user').then(r => r.json());

  return (
    <Suspense> {/* Works on server */}
      <ClientComponent data={data} />
    </Suspense>
  );
}

// ✅ Solution: Choose appropriate component type
// Option A: Pure server component (no Suspense needed)
export default async function Dashboard() {
  const data = await fetch('/api/user').then(r => r.json());
  return <div>{data.name}</div>;
}

// Option B: Client component with Suspense
'use client';
export default function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserData />
    </Suspense>
  );
}
```

**Key Lessons:**
1. Start with granular Suspense boundaries
2. Prefetch data on navigation intent (hover, route preload)
3. Combine Error Boundaries with Suspense boundaries
4. Use React DevTools Profiler to identify waterfalls
5. Monitor real user metrics (LCP, TTI) in production

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Suspense vs Traditional Loading States</strong></summary>

### ⚖️ Trade-offs

**1. Suspense vs Traditional Loading States**

**Suspense Approach:**
```javascript
// Declarative, no loading state management
function UserProfile() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile />
    </Suspense>
  );
}

function Profile() {
  const user = useUser(); // Throws if not ready
  return <div>{user.name}</div>;
}
```

**Traditional Approach:**
```javascript
// Imperative, manual state management
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ProfileSkeleton />;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{user.name}</div>;
}
```

**Comparison:**

| Aspect | Suspense | Traditional |
|--------|----------|-------------|
| **Code complexity** | Lower (no state management) | Higher (manual flags) |
| **Coordination** | Automatic (React handles) | Manual (complex logic) |
| **Error handling** | Requires Error Boundary | Can be inline |
| **Loading UX** | Can be jarring without transitions | Full control |
| **SSR support** | Built-in streaming | Manual implementation |
| **Granularity** | Boundary-based | Component-based |
| **Library support** | Requires integration | Universal |
| **Browser support** | Modern only | All browsers |

**When to use Suspense:**
- ✅ React 18+ projects with concurrent features
- ✅ Complex UIs with multiple loading states
- ✅ Streaming SSR requirements
- ✅ Using libraries with Suspense support (React Query, Relay, Next.js)
- ✅ Teams comfortable with Error Boundaries

**When to use traditional:**
- ✅ Legacy React versions (< 18)
- ✅ Simple components with single data source
- ✅ Need inline error handling
- ✅ Full control over loading behavior required
- ✅ Third-party libraries without Suspense support

**2. Suspense Boundary Granularity**

**Coarse-grained (Single Boundary):**
```javascript
// All-or-nothing loading
function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <UserHeader />   {/* 500ms */}
      <StatsGrid />    {/* 800ms */}
      <RecentOrders /> {/* 1200ms */}
    </Suspense>
  );
}
```

**Fine-grained (Multiple Boundaries):**
```javascript
// Progressive loading
function Dashboard() {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <UserHeader /> {/* Shows at 500ms */}
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsGrid /> {/* Shows at 800ms */}
      </Suspense>

      <Suspense fallback={<OrdersSkeleton />}>
        <RecentOrders /> {/* Shows at 1200ms */}
      </Suspense>
    </>
  );
}
```

**Hybrid Approach (Grouped Boundaries):**
```javascript
// Balance between granularity and UX
function Dashboard() {
  return (
    <>
      {/* Critical above-fold content */}
      <Suspense fallback={<AboveFoldSkeleton />}>
        <UserHeader />
        <StatsGrid />
      </Suspense>

      {/* Below-fold content */}
      <Suspense fallback={<BelowFoldSkeleton />}>
        <RecentOrders />
        <ActivityFeed />
        <RecommendedActions />
      </Suspense>
    </>
  );
}
```

**Granularity comparison:**

| Strategy | Pros | Cons | Best For |
|----------|------|------|----------|
| **Single boundary** | Simple, consistent UX, less code | Slow (waits for slowest), poor perceived perf | Simple pages, fast APIs |
| **Per-component** | Progressive, fast perceived perf | Potential "popcorn" effect, more code | Complex dashboards, varied load times |
| **Grouped** | Balanced UX, coordinated sections | Requires UX planning | Most production apps |

**Decision framework:**
```javascript
// Use single boundary if:
// - All data loads in < 500ms
// - Strong visual relationship between components
// - Small component tree

// Use per-component boundaries if:
// - Load times vary significantly (> 500ms difference)
// - Components are visually independent
// - Progressive disclosure is important

// Use grouped boundaries if:
// - Natural content sections exist
// - Want to avoid "popcorn" effect
// - Balancing performance and UX
```

</details>

<details>
<summary><strong>⚖️ Trade-offs Continued: Suspense vs Skeleton Screens</strong></summary>

**3. Suspense vs Skeleton Screens**

Both can coexist, but require thoughtful design:

**Suspense-only approach:**
```javascript
<Suspense fallback={<Spinner />}>
  <Content />
</Suspense>
```

**Skeleton approach:**
```javascript
<Suspense fallback={<ContentSkeleton />}>
  <Content />
</Suspense>

function ContentSkeleton() {
  return (
    <div>
      <div className="skeleton-title" />
      <div className="skeleton-text" />
      <div className="skeleton-text" />
    </div>
  );
}
```

**Comparison:**

| Approach | Perceived Performance | Development Cost | Maintenance |
|----------|----------------------|------------------|-------------|
| **Spinner** | Low (feels slow) | Low (reusable) | Easy |
| **Skeleton** | High (feels fast) | High (per-component) | Harder |
| **Hybrid** | Medium-High | Medium | Medium |

**Best practices:**
- Use skeletons for above-fold, critical content
- Use spinners for below-fold, secondary content
- Match skeleton layout to actual content (avoid layout shift)
- Consider generating skeletons from actual components

**4. Performance Considerations**

**Bundle size:**
```javascript
// Suspense adds minimal overhead (built into React 18)
// But data fetching libraries add weight:

// React Query: ~13KB gzipped
// SWR: ~5KB gzipped
// Relay: ~40KB gzipped (for complex graphs)

// Trade-off: Library size vs development speed
```

**Runtime performance:**
```javascript
// Suspense can trigger more renders during transitions
// Traditional approach renders once

// Measure with React DevTools Profiler:
// - Suspense: 3 renders (suspending → fallback → resolved)
// - Traditional: 2 renders (loading → loaded)

// Impact minimal in most cases, but consider for:
// - Heavy component trees
// - Frequent updates
// - Low-end devices
```

**Memory usage:**
```javascript
// React Query caches all queries in memory
// Can grow large in long-lived apps

// Configure garbage collection:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 5, // Clear after 5 min inactive
      staleTime: 1000 * 60 * 1, // Refetch after 1 min
    },
  },
});
```

**5. Migration Strategy**

**Big Bang (Risky):**
```javascript
// Refactor entire app to Suspense at once
// ❌ High risk, long dev time, hard to debug
```

**Incremental (Recommended):**
```javascript
// 1. Add React Query (keep existing patterns)
function OldComponent() {
  const { data, isLoading } = useQuery(['key'], fetcher, {
    suspense: false, // Traditional mode
  });

  if (isLoading) return <Spinner />;
  return <div>{data}</div>;
}

// 2. Migrate new features to Suspense
function NewFeature() {
  return (
    <Suspense fallback={<Spinner />}>
      <NewComponent /> {/* Uses suspense: true */}
    </Suspense>
  );
}

// 3. Gradually refactor old components
// 4. Enable Suspense globally once comfortable
```

**Decision matrix:**

| Factor | Suspense | Traditional |
|--------|----------|-------------|
| React version | 18+ required | Any |
| Team experience | Learning curve | Familiar |
| SSR requirements | Excellent (streaming) | Manual work |
| Library ecosystem | Growing | Mature |
| Error handling | Needs boundaries | Inline possible |
| Code simplicity | Higher (less state) | Lower (more state) |
| UX control | Boundary-level | Component-level |

**Recommendation:**
- **New projects**: Start with Suspense (React 18+, modern stack)
- **Existing projects**: Incremental migration, new features first
- **Legacy apps**: May not be worth migration cost unless rewriting

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Simple Explanations and Patterns</strong></summary>

### 💬 Explain to Junior

**Simple Explanation:**

Imagine you're at a restaurant ordering multiple dishes. You have two options:

**Traditional approach (without Suspense):**
You wait for the chef to finish cooking ALL dishes before the waiter brings anything to your table. Even if the salad is ready in 5 minutes, you wait 30 minutes for the steak to finish. You sit there staring at an empty table the whole time.

This is like traditional loading states where your entire component shows a spinner until all data loads:
```javascript
if (loading) return <Spinner />; // Show nothing until everything is ready
```

**Suspense approach:**
You tell the waiter: "Bring each dish as soon as it's ready!" The salad comes in 5 minutes, the soup in 10 minutes, the steak in 30 minutes. You start eating immediately and your experience feels much faster.

This is Suspense with multiple boundaries:
```javascript
<Suspense fallback={<SaladPlaceholder />}>
  <Salad /> {/* Shows as soon as ready */}
</Suspense>

<Suspense fallback={<SteakPlaceholder />}>
  <Steak /> {/* Shows when ready, doesn't block salad */}
</Suspense>
```

**How Suspense Actually Works (Simple Version):**

When a component needs data that isn't ready yet, it throws a special promise (like throwing a ball):

```javascript
function UserProfile() {
  const user = getUserData(); // Might throw a promise
  return <h1>Hello, {user.name}</h1>;
}
```

React catches that promise (like catching the ball) and says: "Okay, this component isn't ready. Let me show a loading state instead."

```javascript
<Suspense fallback={<div>Loading...</div>}>
  <UserProfile /> {/* Throws promise → shows "Loading..." */}
</Suspense>
```

When the promise finishes (data arrives), React tries rendering again. This time, the component doesn't throw anything and renders normally!

**Key Concepts for Beginners:**

**1. Suspense Boundaries = Loading Zones**

Think of `<Suspense>` as creating a "loading zone." Anything inside that zone that needs to load will trigger the fallback:

```javascript
<Suspense fallback={<Spinner />}> {/* Loading zone starts */}
  <FastComponent />  {/* Ready immediately */}
  <SlowComponent />  {/* Takes 2 seconds */}
  <FastComponent2 /> {/* Ready immediately */}
</Suspense> {/* Loading zone ends */}

// Result: Spinner shows for 2 seconds, then all 3 components appear together
```

**2. Nested Boundaries = Progressive Loading**

You can nest loading zones for progressive loading:

```javascript
<div>
  <Suspense fallback={<HeaderSkeleton />}>
    <Header /> {/* Loads fast (500ms) */}
  </Suspense>

  <Suspense fallback={<ContentSkeleton />}>
    <Content /> {/* Loads slow (2000ms) */}
  </Suspense>
</div>

// Timeline:
// 0ms: Both skeletons show
// 500ms: Header appears, content still loading
// 2000ms: Content appears
```

**3. Error Boundaries = Error Zones**

Just like Suspense catches loading states, Error Boundaries catch errors:

```javascript
<ErrorBoundary fallback={<ErrorMessage />}>
  <Suspense fallback={<Spinner />}>
    <DataComponent /> {/* Might throw error OR suspend */}
  </Suspense>
</ErrorBoundary>

// If component throws error → ErrorMessage shows
// If component suspends → Spinner shows
// If component succeeds → DataComponent shows
```

**Common Beginner Mistakes:**

**Mistake 1: Using Suspense with non-Suspense libraries**
```javascript
// ❌ Won't work - fetch doesn't integrate with Suspense
<Suspense fallback={<Spinner />}>
  <Component />
</Suspense>

function Component() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api').then(r => r.json()).then(setData);
  }, []);
  return <div>{data?.name}</div>; // Renders immediately with null
}

// ✅ Must use Suspense-enabled library
import { useQuery } from '@tanstack/react-query';

function Component() {
  const { data } = useQuery({
    queryKey: ['key'],
    queryFn: fetcher,
    suspense: true, // Important!
  });
  return <div>{data.name}</div>; // Suspends until ready
}
```

**Mistake 2: Forgetting Error Boundary**
```javascript
// ❌ Uncaught error crashes app
<Suspense fallback={<Spinner />}>
  <DataComponent /> {/* If fetch fails, app crashes */}
</Suspense>

// ✅ Always wrap with Error Boundary
<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Spinner />}>
    <DataComponent />
  </Suspense>
</ErrorBoundary>
```

**Mistake 3: Too many small boundaries**
```javascript
// ❌ "Popcorn" effect - too jarring
<div>
  <Suspense fallback={<Skeleton1 />}><Component1 /></Suspense>
  <Suspense fallback={<Skeleton2 />}><Component2 /></Suspense>
  <Suspense fallback={<Skeleton3 />}><Component3 /></Suspense>
  <Suspense fallback={<Skeleton4 />}><Component4 /></Suspense>
  <Suspense fallback={<Skeleton5 />}><Component5 /></Suspense>
</div>

// ✅ Group related components
<div>
  <Suspense fallback={<HeaderSkeletons />}>
    <Component1 />
    <Component2 />
  </Suspense>

  <Suspense fallback={<ContentSkeletons />}>
    <Component3 />
    <Component4 />
    <Component5 />
  </Suspense>
</div>
```

**Interview Answer Template:**

**Q: How does Suspense work in React?**

**Answer:**
"Suspense is a React component that handles loading states declaratively. When a component inside Suspense isn't ready (like waiting for data), it suspends rendering and shows a fallback UI instead.

The key mechanism is that components throw promises when they need data. React catches these promises at the nearest Suspense boundary and shows the fallback. When the promise resolves, React re-renders the component with the data.

For example:
```javascript
<Suspense fallback={<Spinner />}>
  <UserProfile /> {/* Might suspend */}
</Suspense>
```

This is better than traditional loading states because:
1. No manual loading flags needed
2. React coordinates multiple loading components automatically
3. Works great with concurrent features like useTransition
4. Enables streaming SSR in Next.js

I've used it in [specific project] to improve loading UX by showing progressive content rather than a blank page. We saw [X]% improvement in perceived performance."

**Q: What are best practices for Suspense boundaries?**

**Answer:**
"The key is choosing the right granularity:

1. **Too coarse (one boundary)**: Entire page waits for slowest component
2. **Too fine (many boundaries)**: Jarring 'popcorn' effect as components pop in
3. **Just right (grouped)**: Balance between progressive loading and smooth UX

I typically:
- Use separate boundaries for above-fold vs below-fold content
- Group related components that should appear together
- Always combine with Error Boundaries for robust error handling
- Use skeleton screens for important content, spinners for secondary content

For example, on a dashboard:
```javascript
<Suspense fallback={<HeaderSkeleton />}>
  <Header />
</Suspense>

<Suspense fallback={<DashboardSkeleton />}>
  <Stats />
  <Charts />
</Suspense>
```

This shows the header quickly while the heavier dashboard content loads progressively."

**Quick Reference:**

```javascript
// Basic Suspense
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>

// With Error Boundary
<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Loading />}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>

// With useTransition (smooth updates)
function App() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button onClick={() => startTransition(() => setTab('profile'))}>
        Profile {isPending && '...'}
      </button>

      <Suspense fallback={<Loading />}>
        {tab === 'home' && <Home />}
        {tab === 'profile' && <Profile />}
      </Suspense>
    </>
  );
}

// With React Query
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
});

function Component() {
  const { data } = useQuery(['key'], fetcher);
  return <div>{data.name}</div>;
}
```

</details>

---

## Question 2: What are Suspense boundaries and error handling patterns?

**Answer:**

Suspense boundaries are React components (`<Suspense>`) that define where loading fallbacks appear in your component tree when child components suspend (pause rendering while waiting for asynchronous operations). They act as "loading zones" that catch suspended states and show fallback UI until all child components are ready to render. Combined with Error Boundaries, they create a robust pattern for handling both loading and error states in React applications.

A Suspense boundary works by catching promises thrown by components during rendering. When any component inside a Suspense boundary suspends, React stops rendering that subtree, commits the fallback UI to the DOM, and waits for the promise to resolve. Once resolved, React re-renders the suspended components and replaces the fallback with the actual content. This happens transparently without requiring manual loading state management in each component.

Error Boundaries complement Suspense by catching JavaScript errors during rendering, in lifecycle methods, and in constructors of the component tree below them. Since Suspense components can throw both promises (loading states) and errors (failures), combining both patterns creates a complete solution:

```javascript
<ErrorBoundary fallback={<ErrorUI />}>
  <Suspense fallback={<LoadingUI />}>
    <DataComponent />
  </Suspense>
</ErrorBoundary>
```

The boundary strategy significantly impacts user experience. Multiple small boundaries create progressive loading (components appear as they're ready) but can cause a jarring "popcorn" effect. A single large boundary provides a consistent loading state but keeps users waiting for the slowest component. The optimal approach usually involves grouping related components within boundaries based on their importance and expected load times.

**Key patterns:**

**1. Nested boundaries** for progressive disclosure:
```javascript
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<ContentSkeleton />}>
    <SlowContent />
  </Suspense>
</Suspense>
```

**2. Sibling boundaries** for independent sections:
```javascript
<>
  <Suspense fallback={<Sidebar />}>
    <MainContent />
  </Suspense>
  <Suspense fallback={<AsideSkeleton />}>
    <Aside />
  </Suspense>
</>
```

**3. Error boundaries at different levels** for granular recovery:
```javascript
<ErrorBoundary fallback={<AppError />}>
  <App>
    <ErrorBoundary fallback={<FeatureError />}>
      <Suspense fallback={<FeatureLoading />}>
        <Feature />
      </Suspense>
    </ErrorBoundary>
  </App>
</ErrorBoundary>
```

Modern patterns also leverage `useTransition` to prevent Suspense boundaries from showing fallbacks during updates, keeping the previous UI visible while new content loads in the background. This dramatically improves perceived performance during navigation or filter changes.

---

<details>
<summary><strong>🔍 Deep Dive: Suspense Boundary Mechanics</strong></summary>

**Suspense Boundary Mechanics**

When React encounters a suspended component, it follows a specific algorithm to find the appropriate boundary:

```javascript
// Simplified internal flow
function renderWithSuspense(component) {
  try {
    // Attempt to render component
    return renderComponent(component);
  } catch (value) {
    // Check what was thrown
    if (isPromise(value)) {
      // Component suspended - find boundary
      const boundary = findNearestSuspenseBoundary(component);

      if (boundary) {
        // Show boundary's fallback
        commitFallback(boundary);

        // Attach resolution handler
        value.then(() => {
          // Re-render component when ready
          scheduleUpdate(component);
        });
      } else {
        // No boundary found - propagate to root
        throw new Error('Component suspended but no <Suspense> found');
      }
    } else {
      // Regular error - find error boundary
      const errorBoundary = findNearestErrorBoundary(component);
      if (errorBoundary) {
        errorBoundary.componentDidCatch(value);
      } else {
        // Uncaught error - crash app
        throw value;
      }
    }
  }
}
```

**Boundary Resolution Order:**

When a component throws, React traverses up the tree:

```javascript
<App>                                  {/* Level 4 */}
  <ErrorBoundary>                      {/* Level 3 - catches errors */}
    <Suspense fallback={<PageLoader />}> {/* Level 2 - catches suspense */}
      <Content>                        {/* Level 1 */}
        <DataComponent />              {/* Level 0 - throws promise */}
      </Content>
    </Suspense>
  </ErrorBoundary>
</App>

// Traversal:
// 1. DataComponent throws promise
// 2. Content - no boundary, continue up
// 3. Suspense - catches promise, shows PageLoader
// 4. ErrorBoundary - not reached (Suspense caught it)
```

**Multiple Suspending Components:**

When multiple components suspend within the same boundary:

```javascript
<Suspense fallback={<Loading />}>
  <User />     {/* Suspends for 500ms */}
  <Posts />    {/* Suspends for 1000ms */}
  <Comments /> {/* Suspends for 800ms */}
</Suspense>

// Timeline:
// 0ms: All three components start suspending
// 0ms: React shows <Loading /> fallback
// 500ms: User data ready (but React waits for others)
// 800ms: Comments data ready (but React waits for Posts)
// 1000ms: Posts data ready - ALL components render together
```

React waits for **all** suspended components within a boundary before committing. This ensures visual consistency (no partial renders).

**Suspense + useTransition Integration:**

`useTransition` modifies Suspense behavior to prevent showing fallbacks:

```javascript
function TabContainer() {
  const [tab, setTab] = useState('about');
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    <>
      <button onClick={() => selectTab('posts')}>
        Posts {isPending && <Spinner />}
      </button>

      <Suspense fallback={<TabSkeleton />}>
        {tab === 'about' && <AboutTab />}
        {tab === 'posts' && <PostsTab />}
      </Suspense>
    </>
  );
}
```

**Behavior differences:**

| Scenario | Without Transition | With Transition |
|----------|-------------------|-----------------|
| Click "Posts" | Immediately shows `<TabSkeleton />` | Keeps `<AboutTab />` visible |
| User sees | Jarring flash of skeleton | Smooth transition with pending indicator |
| React's work | Normal priority - commits immediately | Low priority - keeps old UI while preparing new |
| Interruptibility | Cannot cancel | User can click another tab mid-transition |

**Internal mechanism:**

```javascript
// Without transition
setTab('posts'); // High-priority update
// React immediately:
// 1. Attempts to render <PostsTab />
// 2. <PostsTab /> suspends
// 3. Commits <TabSkeleton /> fallback

// With transition
startTransition(() => setTab('posts')); // Low-priority update
// React:
// 1. Keeps <AboutTab /> visible (old UI)
// 2. Renders <PostsTab /> in background (on low-priority lane)
// 3. <PostsTab /> suspends - doesn't commit fallback
// 4. Waits for data to resolve
// 5. Once ready, commits <PostsTab /> (no skeleton shown)
```

**Error Boundary Implementation:**

Since hooks can't catch errors, Error Boundaries must be class components:

```typescript
import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state to trigger fallback render
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('Caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);

    // Send to error tracking
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } }
      });
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error!, this.reset);
      }
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Usage with reset functionality
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
      <button onClick={reset}>Try again</button>
    </div>
  )}
  onError={(error, errorInfo) => {
    // Log to service
    logErrorToService(error, errorInfo);
  }}
>
  <Suspense fallback={<Loading />}>
    <DataComponent />
  </Suspense>
</ErrorBoundary>
```

**Catching Different Error Types:**

```javascript
// Error Boundary catches:
// ✅ Errors during render
// ✅ Errors in lifecycle methods (componentDidMount, etc.)
// ✅ Errors in constructors
// ✅ Errors thrown by Suspense components (if not promises)

// Error Boundary does NOT catch:
// ❌ Event handlers (use try/catch)
// ❌ Asynchronous code (setTimeout, fetch.then)
// ❌ Server-side rendering errors
// ❌ Errors in Error Boundary itself

// Example of what IS caught:
function Component() {
  const user = useUser();
  return <div>{user.name.toUpperCase()}</div>; // If user.name is null → caught
}

// Example of what is NOT caught:
function Component() {
  const handleClick = () => {
    throw new Error('Click error'); // NOT caught by Error Boundary
  };

  return <button onClick={handleClick}>Click</button>;
}

// Fix: Wrap event handler errors manually
function Component() {
  const [error, setError] = useState(null);

  const handleClick = () => {
    try {
      throw new Error('Click error');
    } catch (err) {
      setError(err); // Handle manually
    }
  };

  if (error) throw error; // Now Error Boundary catches it

  return <button onClick={handleClick}>Click</button>;
}
```

**Boundary Recovery Patterns:**

**Pattern 1: Automatic retry with exponential backoff**

```javascript
interface RetryErrorBoundaryProps {
  children: ReactNode;
  maxRetries?: number;
  onError?: (error: Error) => void;
}

interface RetryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

class RetryErrorBoundary extends Component<RetryErrorBoundaryProps, RetryState> {
  state = { hasError: false, error: null, retryCount: 0 };
  retryTimeout: NodeJS.Timeout | null = null;

  static getDerivedStateFromError(error: Error): Partial<RetryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { maxRetries = 3, onError } = this.props;
    const { retryCount } = this.state;

    onError?.(error);

    if (retryCount < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000;

      this.retryTimeout = setTimeout(() => {
        this.setState(prev => ({
          hasError: false,
          error: null,
          retryCount: prev.retryCount + 1,
        }));
      }, delay);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    const { hasError, error, retryCount } = this.state;
    const { maxRetries = 3 } = this.props;

    if (hasError) {
      if (retryCount >= maxRetries) {
        return (
          <div>
            <h2>Failed after {maxRetries} attempts</h2>
            <p>{error?.message}</p>
          </div>
        );
      }

      return (
        <div>
          <p>Error occurred. Retrying ({retryCount + 1}/{maxRetries})...</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Pattern 2: Granular boundaries for partial recovery**

```javascript
function Dashboard() {
  return (
    <div>
      {/* Critical section - if fails, show specific error */}
      <ErrorBoundary fallback={<HeaderError />}>
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>
      </ErrorBoundary>

      {/* Optional sections - if fail, app continues */}
      <div className="grid">
        <ErrorBoundary fallback={<WidgetError name="Stats" />}>
          <Suspense fallback={<WidgetSkeleton />}>
            <StatsWidget />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<WidgetError name="Activity" />}>
          <Suspense fallback={<WidgetSkeleton />}>
            <ActivityWidget />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<WidgetError name="Charts" />}>
          <Suspense fallback={<WidgetSkeleton />}>
            <ChartsWidget />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

// If StatsWidget fails, only that widget shows error
// Rest of dashboard continues working
```

**Pattern 3: Fallback chain**

```javascript
<ErrorBoundary fallback={<AppCrash />}> {/* Level 3: Total failure */}
  <App>
    <ErrorBoundary fallback={<PageError />}> {/* Level 2: Page failure */}
      <Suspense fallback={<PageSkeleton />}>
        <Page>
          <ErrorBoundary fallback={<FeatureError />}> {/* Level 1: Feature failure */}
            <Suspense fallback={<FeatureSkeleton />}>
              <Feature />
            </Suspense>
          </ErrorBoundary>
        </Page>
      </Suspense>
    </ErrorBoundary>
  </App>
</ErrorBoundary>

// Error propagation:
// - Feature error → FeatureError shown (page still works)
// - Page error → PageError shown (app still works)
// - App error → AppCrash shown (total failure)
```

**Suspense Boundary Strategies:**

**Strategy 1: Route-based boundaries**

```javascript
// app/layout.tsx
export default function Layout({ children }) {
  return (
    <ErrorBoundary fallback={<AppError />}>
      <Header />
      <Suspense fallback={<PageTransition />}>
        {children} {/* Each route suspends independently */}
      </Suspense>
      <Footer />
    </ErrorBoundary>
  );
}

// app/products/page.tsx
export default function ProductsPage() {
  return (
    <>
      <Suspense fallback={<FiltersSkeleton />}>
        <ProductFilters />
      </Suspense>

      <Suspense fallback={<GridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </>
  );
}
```

**Strategy 2: Content-priority boundaries**

```javascript
function ArticlePage() {
  return (
    <>
      {/* Critical content - high priority */}
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleContent /> {/* Main content */}
      </Suspense>

      {/* Secondary content - lower priority */}
      <Suspense fallback={null}> {/* No skeleton for below-fold */}
        <RelatedArticles />
        <Comments />
        <Newsletter />
      </Suspense>
    </>
  );
}
```

**Strategy 3: Data-dependency boundaries**

```javascript
function UserDashboard() {
  // All components need user data - single boundary
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <UserProvider> {/* Fetches user data */}
        <UserHeader />
        <UserStats />
        <UserActivity />
      </UserProvider>
    </Suspense>
  );
}

function IndependentDashboard() {
  // Components have independent data - multiple boundaries
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <UserHeader />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <GlobalStats /> {/* Different API */}
      </Suspense>

      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity /> {/* Different API */}
      </Suspense>
    </>
  );
}
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Implementing Robust Error Handling in Production</strong></summary>

### 🐛 Real-World Scenario

**Scenario: Implementing Robust Error Handling in Production Next.js App**

You're building a SaaS analytics dashboard that displays real-time metrics from multiple APIs. The product team reports that when any single API fails, the entire dashboard crashes, forcing users to refresh the page. Your task is to implement comprehensive error and loading boundaries that allow partial functionality even when some services are down.

**Initial Implementation (Fragile):**

```typescript
// app/dashboard/page.tsx
'use client';

import { Suspense } from 'react';

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const metrics = useMetrics(); // API 1
  const users = useUsers();     // API 2
  const revenue = useRevenue(); // API 3

  return (
    <div>
      <MetricsWidget data={metrics} />
      <UsersWidget data={users} />
      <RevenueWidget data={revenue} />
    </div>
  );
}
```

**Problem:** If any API fails, entire dashboard crashes (no Error Boundary).

**Production Impact:**
- **Incident**: Revenue API went down for 30 minutes
- **User impact**: Dashboard completely inaccessible
- **Business impact**: Sales team couldn't access ANY metrics
- **Support tickets**: 47 tickets in 30 minutes
- **Revenue loss**: Estimated $5,000 (customers couldn't monitor campaigns)

**Refactored Implementation with Granular Boundaries:**

**Step 1: Create Reusable Boundary Components**

```typescript
// components/boundaries/ErrorBoundary.tsx
'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // Prevent error propagation to parent
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Custom error handler
    this.props.onError?.(error, errorInfo);

    // Optionally prevent propagation
    if (!this.props.isolate) {
      throw error; // Propagate to parent boundary
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error!, this.reset);
      }

      return this.props.fallback || <DefaultErrorFallback error={this.state.error!} reset={this.reset} />;
    }

    return this.props.children;
  }
}

// components/boundaries/DefaultErrorFallback.tsx
interface FallbackProps {
  error: Error;
  reset: () => void;
}

function DefaultErrorFallback({ error, reset }: FallbackProps) {
  return (
    <div className="error-fallback">
      <div className="error-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <details>
        <summary>Error details</summary>
        <pre>{error.message}</pre>
      </details>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Step 2: Create Widget-Level Fallbacks**

```typescript
// components/widgets/WidgetErrorFallback.tsx
interface Props {
  widgetName: string;
  error: Error;
  reset: () => void;
}

export function WidgetErrorFallback({ widgetName, error, reset }: Props) {
  const isNetworkError = error.message.includes('fetch');
  const isAuthError = error.message.includes('401');

  return (
    <div className="widget-error">
      <h4>{widgetName} unavailable</h4>

      {isNetworkError && (
        <p>Unable to connect to server. Please check your connection.</p>
      )}

      {isAuthError && (
        <p>Session expired. Please <a href="/login">log in again</a>.</p>
      )}

      {!isNetworkError && !isAuthError && (
        <p>This widget is temporarily unavailable.</p>
      )}

      <button onClick={reset} className="retry-button">
        Retry
      </button>
    </div>
  );
}

// components/widgets/WidgetSkeleton.tsx
export function WidgetSkeleton() {
  return (
    <div className="widget-skeleton">
      <div className="skeleton-title" />
      <div className="skeleton-content">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    </div>
  );
}
```

**Step 3: Implement Granular Dashboard Boundaries**

```typescript
// app/dashboard/page.tsx
'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/boundaries/ErrorBoundary';
import { WidgetErrorFallback } from '@/components/widgets/WidgetErrorFallback';
import { WidgetSkeleton } from '@/components/widgets/WidgetSkeleton';

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* Critical header - separate boundary */}
      <ErrorBoundary
        fallback={(error, reset) => (
          <div className="header-error">
            <p>Unable to load user info</p>
            <button onClick={reset}>Retry</button>
          </div>
        )}
      >
        <Suspense fallback={<HeaderSkeleton />}>
          <DashboardHeader />
        </Suspense>
      </ErrorBoundary>

      {/* Widget grid - each widget isolated */}
      <div className="widget-grid">
        {/* Metrics Widget */}
        <ErrorBoundary
          isolate // Don't crash other widgets
          fallback={(error, reset) => (
            <WidgetErrorFallback
              widgetName="Metrics"
              error={error}
              reset={reset}
            />
          )}
          onError={(error) => {
            // Track which widgets fail most often
            analytics.track('widget_error', {
              widget: 'metrics',
              error: error.message,
            });
          }}
        >
          <Suspense fallback={<WidgetSkeleton />}>
            <MetricsWidget />
          </Suspense>
        </ErrorBoundary>

        {/* Users Widget */}
        <ErrorBoundary
          isolate
          fallback={(error, reset) => (
            <WidgetErrorFallback
              widgetName="Users"
              error={error}
              reset={reset}
            />
          )}
          onError={(error) => {
            analytics.track('widget_error', {
              widget: 'users',
              error: error.message,
            });
          }}
        >
          <Suspense fallback={<WidgetSkeleton />}>
            <UsersWidget />
          </Suspense>
        </ErrorBoundary>

        {/* Revenue Widget */}
        <ErrorBoundary
          isolate
          fallback={(error, reset) => (
            <WidgetErrorFallback
              widgetName="Revenue"
              error={error}
              reset={reset}
            />
          )}
          onError={(error) => {
            analytics.track('widget_error', {
              widget: 'revenue',
              error: error.message,
            });
          }}
        >
          <Suspense fallback={<WidgetSkeleton />}>
            <RevenueWidget />
          </Suspense>
        </ErrorBoundary>

        {/* Activity Feed Widget */}
        <ErrorBoundary
          isolate
          fallback={(error, reset) => (
            <WidgetErrorFallback
              widgetName="Activity Feed"
              error={error}
              reset={reset}
            />
          )}
        >
          <Suspense fallback={<WidgetSkeleton />}>
            <ActivityWidget />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
```

**Step 4: Implement Smart Retry Logic**

```typescript
// hooks/use-query-with-retry.ts
import { useQuery, QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
}

export function useQueryWithRetry<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options?: UseQueryOptions<T> & RetryConfig
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    ...queryOptions
  } = options || {};

  return useQuery({
    queryKey,
    queryFn,
    suspense: true,
    retry: maxRetries,
    retryDelay: (attemptIndex) => {
      if (exponentialBackoff) {
        return Math.min(retryDelay * Math.pow(2, attemptIndex), 30000);
      }
      return retryDelay;
    },
    ...queryOptions,
  });
}

// Usage in widget
function MetricsWidget() {
  const { data } = useQueryWithRetry(
    ['metrics'],
    fetchMetrics,
    {
      maxRetries: 3,
      retryDelay: 2000,
      exponentialBackoff: true,
      staleTime: 60000, // 1 minute
    }
  );

  return <MetricsDisplay data={data} />;
}
```

**Step 5: Add Graceful Degradation**

```typescript
// components/widgets/RevenueWidget.tsx
'use client';

import { useQueryWithRetry } from '@/hooks/use-query-with-retry';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function RevenueWidget() {
  const [cachedData, setCachedData] = useLocalStorage('revenue-cache', null);

  const { data } = useQueryWithRetry(
    ['revenue'],
    async () => {
      const result = await fetchRevenue();
      setCachedData(result); // Cache successful response
      return result;
    },
    {
      // If query fails after retries, Error Boundary catches it
      // But we can show stale data in fallback
    }
  );

  return <RevenueDisplay data={data} />;
}

// Enhanced error fallback with stale data
function RevenueErrorFallback({ error, reset }: FallbackProps) {
  const [cachedData] = useLocalStorage('revenue-cache', null);

  if (cachedData) {
    return (
      <div className="widget-degraded">
        <div className="warning-banner">
          ⚠️ Showing cached data from {formatTimestamp(cachedData.timestamp)}
          <button onClick={reset}>Refresh</button>
        </div>
        <RevenueDisplay data={cachedData} />
      </div>
    );
  }

  return <WidgetErrorFallback widgetName="Revenue" error={error} reset={reset} />;
}
```

**Step 6: Monitor Boundary Performance**

```typescript
// lib/boundary-monitor.ts
export function monitorBoundaryHealth() {
  const boundaryMetrics = {
    errorRate: new Map<string, number>(),
    suspenseTime: new Map<string, number[]>(),
  };

  return {
    trackError(boundaryName: string) {
      const current = boundaryMetrics.errorRate.get(boundaryName) || 0;
      boundaryMetrics.errorRate.set(boundaryName, current + 1);

      // Alert if error rate too high
      if (current + 1 > 10) {
        alert(`High error rate in ${boundaryName} boundary`);
      }
    },

    trackSuspense(boundaryName: string, duration: number) {
      const times = boundaryMetrics.suspenseTime.get(boundaryName) || [];
      times.push(duration);
      boundaryMetrics.suspenseTime.set(boundaryName, times);

      // Alert if average suspense time too high
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      if (avg > 2000) {
        console.warn(`${boundaryName} averaging ${avg}ms load time`);
      }
    },

    getReport() {
      return {
        errors: Object.fromEntries(boundaryMetrics.errorRate),
        suspenseTimes: Object.fromEntries(
          Array.from(boundaryMetrics.suspenseTime.entries()).map(
            ([name, times]) => [name, {
              avg: times.reduce((a, b) => a + b, 0) / times.length,
              p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)],
            }]
          )
        ),
      };
    },
  };
}

// Usage
const monitor = monitorBoundaryHealth();

<ErrorBoundary
  onError={() => monitor.trackError('metrics')}
  fallback={...}
>
  <Suspense fallback={...}>
    <MetricsWidget />
  </Suspense>
</ErrorBoundary>
```

**Production Results After Implementation:**

**Reliability Improvements:**
- **Zero total failures**: Revenue API down for 2 hours → Only revenue widget affected
- **Partial functionality**: Users could still access 3 out of 4 widgets
- **Automatic recovery**: Retry logic recovered 73% of transient errors
- **Support tickets**: 47 → 3 (94% reduction)

**Performance Metrics:**
- **Time to Interactive (critical content)**: 1.2s (header + 2 working widgets)
- **Total page load**: 2.8s (all widgets or errors shown)
- **Error recovery time**: Average 4.2s (automatic retries)

**User Experience:**
- **Bounce rate**: 12% → 2% (dashboard always partially functional)
- **Session duration**: +35% (users stay even when some widgets fail)
- **User satisfaction**: 3.2 → 4.6 /5 (measured via in-app surveys)

**Error Tracking Insights:**
- **Most common failure**: Revenue API (23% error rate during peak hours)
- **Fastest widget**: Metrics (avg 340ms)
- **Slowest widget**: Activity Feed (avg 1.8s)
- **Recovery success rate**: 73% (errors resolved by retry logic)

**Key Lessons Learned:**

1. **Granular boundaries** are essential for dashboards with independent data sources
2. **Error isolation** (`isolate` prop) prevents cascading failures
3. **Retry logic** with exponential backoff recovers most transient errors
4. **Cached data** enables graceful degradation when APIs fail
5. **Monitoring** helps identify problematic boundaries and optimize

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Granular vs Coarse Boundaries and Error Strategies</strong></summary>

### ⚖️ Trade-offs

**1. Granular vs Coarse Boundaries**

**Coarse (Single Boundary):**
```typescript
<Suspense fallback={<DashboardSkeleton />}>
  <MetricsWidget />
  <UsersWidget />
  <RevenueWidget />
  <ActivityWidget />
</Suspense>
```

**Granular (Multiple Boundaries):**
```typescript
<>
  <Suspense fallback={<MetricsSkeleton />}>
    <MetricsWidget />
  </Suspense>
  <Suspense fallback={<UsersSkeleton />}>
    <UsersWidget />
  </Suspense>
  <Suspense fallback={<RevenueSkeleton />}>
    <RevenueWidget />
  </Suspense>
  <Suspense fallback={<ActivitySkeleton />}>
    <ActivityWidget />
  </Suspense>
</>
```

**Comparison:**

| Aspect | Coarse | Granular |
|--------|--------|----------|
| **Code complexity** | Low (1 boundary) | High (4 boundaries) |
| **Time to first content** | Slow (waits for slowest) | Fast (progressive) |
| **Perceived performance** | Poor (blank page longer) | Excellent (content appears progressively) |
| **Visual consistency** | High (appears together) | Lower (staggered) |
| **Error resilience** | Low (one error = total failure) | High (isolated failures) |
| **Skeleton complexity** | Simple (one skeleton) | Complex (multiple skeletons) |
| **Use case** | Fast APIs, related content | Slow/independent APIs |

**When to use coarse:**
- All data loads in < 500ms
- Strong visual relationship (e.g., form with dependencies)
- Consistent loading times across components
- Simple content structure

**When to use granular:**
- Wide variation in load times (> 500ms difference)
- Independent data sources
- Need for partial functionality during failures
- Complex dashboards

**2. Error Boundary Placement Strategy**

**App-Level Boundary:**
```typescript
// Root layout
<ErrorBoundary fallback={<AppCrash />}>
  <App />
</ErrorBoundary>
```

**Pros:**
- Catches all errors (safety net)
- Simple implementation
- Guaranteed error handling

**Cons:**
- Poor UX (entire app crashes)
- No granular recovery
- Hard to debug (which component failed?)

**Feature-Level Boundaries:**
```typescript
<div>
  <ErrorBoundary fallback={<HeaderError />}>
    <Header />
  </ErrorBoundary>

  <ErrorBoundary fallback={<ContentError />}>
    <Content />
  </ErrorBoundary>

  <ErrorBoundary fallback={<FooterError />}>
    <Footer />
  </ErrorBoundary>
</div>
```

**Pros:**
- Isolated failures
- Partial functionality
- Easier debugging

**Cons:**
- More boilerplate code
- Multiple fallback components
- Requires careful planning

**Recommended: Layered Strategy**

```typescript
<ErrorBoundary fallback={<AppError />}> {/* Level 3: Total failure */}
  <App>
    <ErrorBoundary fallback={<RouteError />}> {/* Level 2: Route failure */}
      <Page>
        <ErrorBoundary fallback={<FeatureError />} isolate> {/* Level 1: Feature failure */}
          <Feature />
        </ErrorBoundary>
      </Page>
    </ErrorBoundary>
  </App>
</ErrorBoundary>
```

**3. Suspense + Transitions vs Immediate Suspense**

**Immediate Suspense (Default):**
```typescript
function App() {
  const [tab, setTab] = useState('posts');

  return (
    <Suspense fallback={<Skeleton />}>
      {tab === 'posts' && <Posts />}
      {tab === 'comments' && <Comments />}
    </Suspense>
  );
}
```

**Behavior:** Clicking tabs immediately shows skeleton (jarring)

**With useTransition:**
```typescript
function App() {
  const [tab, setTab] = useState('posts');
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab) {
    startTransition(() => setTab(nextTab));
  }

  return (
    <Suspense fallback={<Skeleton />}>
      {tab === 'posts' && <Posts />}
      {tab === 'comments' && <Comments />}
    </Suspense>
  );
}
```

**Behavior:** Old tab stays visible while new tab loads (smooth)

**Comparison:**

| Aspect | Immediate | Transition |
|--------|-----------|------------|
| **User sees** | Skeleton immediately | Old content until ready |
| **Perceived speed** | Feels slow | Feels instant |
| **Implementation** | Simple | Requires useTransition |
| **Best for** | Initial page load | Tab switching, filters |
| **Downside** | Jarring | Old UI might feel stale |

**When to use transitions:**
- Navigation between views
- Filter/sort changes
- Search query updates
- Any update where old UI is better than skeleton

**When to use immediate:**
- Initial page load
- Navigation to completely different pages
- When old UI would be confusing

**4. Skeleton Fidelity**

**Low-Fidelity Skeleton:**
```typescript
function SimpleSkeleton() {
  return <div className="spinner">Loading...</div>;
}
```

**High-Fidelity Skeleton:**
```typescript
function HighFidelitySkeleton() {
  return (
    <div className="skeleton">
      <div className="skeleton-avatar" />
      <div className="skeleton-title" />
      <div className="skeleton-text" />
      <div className="skeleton-text" />
      <div className="skeleton-button" />
    </div>
  );
}
```

**Comparison:**

| Aspect | Low-Fidelity | High-Fidelity |
|--------|--------------|---------------|
| **Development time** | Minutes | Hours (per component) |
| **Perceived performance** | Low | High |
| **Layout shift** | Likely (CLS) | Minimal |
| **Maintenance** | Easy | Hard (sync with actual component) |
| **Code duplication** | None | Significant |

**Hybrid Approach:**
```typescript
// Use high-fidelity for critical, above-fold content
<Suspense fallback={<ProductGridSkeleton />}>
  <ProductGrid />
</Suspense>

// Use low-fidelity for below-fold, secondary content
<Suspense fallback={<Spinner />}>
  <RelatedProducts />
</Suspense>
```

**5. Client-Side vs Server-Side Boundaries**

**Client-Side Suspense:**
```typescript
'use client';

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ClientDataComponent />
    </Suspense>
  );
}
```

**Server-Side Suspense (Next.js):**
```typescript
// app/page.tsx (Server Component)
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ServerDataComponent />
    </Suspense>
  );
}

async function ServerDataComponent() {
  const data = await fetch('https://api.example.com/data').then(r => r.json());
  return <div>{data.title}</div>;
}
```

**Comparison:**

| Aspect | Client-Side | Server-Side (Streaming SSR) |
|--------|-------------|------------------------------|
| **Initial HTML** | Skeleton in HTML | Progressive HTML chunks |
| **SEO** | Poor (JS required) | Excellent (real content) |
| **TTFB** | Fast | Very fast (shell sent immediately) |
| **LCP** | Slow (waits for JS + data) | Fast (content streams in) |
| **Browser support** | Modern only | Modern only (fallback possible) |
| **Use case** | Client-only data | Public content, SEO critical |

**Recommendation:**
- Use **server-side** for public pages (landing, blog, products)
- Use **client-side** for authenticated dashboards, admin panels

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Understanding Boundaries and Error Recovery</strong></summary>

### 💬 Explain to Junior

**Simple Explanation:**

Imagine you're building a dashboard with multiple widgets. Each widget loads data from different APIs. You have two problems to solve:

1. **What to show while data is loading?** (Suspense handles this)
2. **What to show when something breaks?** (Error Boundaries handle this)

**Suspense Boundaries:**

Think of Suspense boundaries like "loading zones" in your UI. Any component inside a zone that needs to load data will trigger the zone's loading state:

```javascript
<Suspense fallback={<div>Loading weather...</div>}>
  <WeatherWidget /> {/* Takes 2 seconds to load */}
</Suspense>

<Suspense fallback={<div>Loading news...</div>}>
  <NewsWidget /> {/* Takes 1 second to load */}
</Suspense>
```

**Timeline:**
- **0s**: Both show "Loading..." messages
- **1s**: NewsWidget appears (weather still loading)
- **2s**: WeatherWidget appears

If you used ONE boundary for both:
```javascript
<Suspense fallback={<div>Loading everything...</div>}>
  <WeatherWidget />
  <NewsWidget />
</Suspense>
```

**Timeline:**
- **0s**: Shows "Loading everything..."
- **2s**: BOTH appear together (NewsWidget waited for WeatherWidget)

**Which is better?**
- One boundary = Simple, but slower perceived performance
- Two boundaries = More complex, but feels faster

**Error Boundaries:**

Error Boundaries are like "safety nets" that catch errors and prevent your entire app from crashing:

```javascript
<ErrorBoundary fallback={<div>Weather unavailable</div>}>
  <Suspense fallback={<div>Loading...</div>}>
    <WeatherWidget />
  </Suspense>
</ErrorBoundary>

<ErrorBoundary fallback={<div>News unavailable</div>}>
  <Suspense fallback={<div>Loading...</div>}>
    <NewsWidget />
  </Suspense>
</ErrorBoundary>
```

**What happens if WeatherWidget crashes?**
- Shows "Weather unavailable"
- NewsWidget keeps working!

**Without Error Boundary:**
- Entire page crashes
- User sees white screen or default React error

**Real-World Analogy:**

Imagine a restaurant buffet:

**Bad approach (one loading zone + no error handling):**
- Chef prepares ALL dishes before opening buffet
- If soup burns, entire buffet is cancelled
- Customers wait 30 minutes staring at empty tables

**Good approach (multiple loading zones + error handling):**
- Each station opens as dishes are ready (progressive loading)
- If soup burns, that station shows "Soup unavailable" sign
- Customers can start eating salad while waiting for main course

**Common Patterns:**

**Pattern 1: Nested Boundaries (Progressive Disclosure)**

```javascript
<div>
  {/* Critical header loads first */}
  <Suspense fallback={<HeaderSkeleton />}>
    <Header />
  </Suspense>

  {/* Main content loads next */}
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />

    {/* Comments load last (inside content) */}
    <Suspense fallback={<CommentsSkeleton />}>
      <Comments />
    </Suspense>
  </Suspense>
</div>
```

**Timeline:**
1. Header appears (fast)
2. Main content appears (medium)
3. Comments appear (slow)

**Pattern 2: Sibling Boundaries (Independent Sections)**

```javascript
<div className="grid">
  <Suspense fallback={<Skeleton />}>
    <StatsWidget />
  </Suspense>

  <Suspense fallback={<Skeleton />}>
    <GraphWidget />
  </Suspense>

  <Suspense fallback={<Skeleton />}>
    <TableWidget />
  </Suspense>
</div>
```

Each widget loads independently - fastest appears first!

**Pattern 3: Error + Suspense Combo**

```javascript
<ErrorBoundary fallback={<ErrorUI />}>
  <Suspense fallback={<LoadingUI />}>
    <DataComponent />
  </Suspense>
</ErrorBoundary>
```

**What user sees:**
1. **Loading**: Shows `<LoadingUI />` (spinner/skeleton)
2. **Success**: Shows `<DataComponent />` (actual data)
3. **Error**: Shows `<ErrorUI />` (error message)

**Choosing Boundary Granularity (Decision Tree):**

```
Are components related? (e.g., form fields that depend on each other)
├─ YES: Use single Suspense boundary
└─ NO: Do they load at different speeds? (> 500ms difference)
   ├─ YES: Use multiple boundaries
   └─ NO: Single boundary is fine

Will error in one component affect others?
├─ YES: Shared Error Boundary might be ok
└─ NO: Use isolated Error Boundaries
```

**useTransition for Smooth Updates:**

Without transition:
```javascript
function App() {
  const [query, setQuery] = useState('');

  return (
    <>
      <input onChange={(e) => setQuery(e.target.value)} />

      <Suspense fallback={<Spinner />}>
        <SearchResults query={query} />
      </Suspense>
    </>
  );
}
```

**Problem:** Every keystroke shows spinner (jarring!)

With transition:
```javascript
function App() {
  const [query, setQuery] = useState('');
  const [deferredQuery, setDeferredQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    setQuery(e.target.value); // Update input immediately
    startTransition(() => {
      setDeferredQuery(e.target.value); // Update results in background
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <SmallSpinner />} {/* Show subtle loading indicator */}

      <Suspense fallback={<Spinner />}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </>
  );
}
```

**Result:** Old results stay visible while typing, new results appear smoothly!

**Interview Answer Template:**

**Q: How do you handle errors with Suspense?**

**Answer:**
"You combine Suspense with Error Boundaries. Suspense handles loading states, Error Boundaries handle failures.

I typically wrap each Suspense boundary with an Error Boundary:

```javascript
<ErrorBoundary fallback={<ErrorMessage />}>
  <Suspense fallback={<Loading />}>
    <DataComponent />
  </Suspense>
</ErrorBoundary>
```

This creates three possible states:
1. Loading: Suspense shows fallback
2. Success: Component renders normally
3. Error: Error Boundary shows error UI

For dashboards with multiple widgets, I use granular boundaries so one failing widget doesn't crash the whole page. Each widget gets its own Error Boundary and Suspense wrapper for maximum resilience.

In production, I also log errors to Sentry from the Error Boundary's `componentDidCatch` method to track which components fail most often."

**Q: When would you use multiple Suspense boundaries vs one?**

**Answer:**
"It depends on the loading characteristics and user experience goals.

Use **one boundary** when:
- Components load quickly (< 500ms)
- Strong visual relationship (should appear together)
- Simple content

Use **multiple boundaries** when:
- Load times vary significantly (some fast, some slow)
- Components are independent
- Want progressive loading for better perceived performance

For example, on a product page:
- One boundary for critical above-fold content (product details)
- Separate boundary for reviews (slower, below-fold)
- Separate boundary for recommendations (optional content)

This way, users see the main content quickly even if reviews are slow to load. I've found this reduces bounce rate because users don't wait for a blank page."

**Quick Reference:**

```javascript
// Basic pattern
<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
</ErrorBoundary>

// Multiple independent sections
{sections.map(section => (
  <ErrorBoundary key={section.id} fallback={<SectionError />}>
    <Suspense fallback={<SectionLoading />}>
      <Section data={section} />
    </Suspense>
  </ErrorBoundary>
))}

// With transitions (smooth updates)
function App() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('home');

  return (
    <>
      <button onClick={() => startTransition(() => setTab('profile'))}>
        Profile {isPending && '...'}
      </button>

      <Suspense fallback={<Skeleton />}>
        {tab === 'home' && <Home />}
        {tab === 'profile' && <Profile />}
      </Suspense>
    </>
  );
}
```

</details>
