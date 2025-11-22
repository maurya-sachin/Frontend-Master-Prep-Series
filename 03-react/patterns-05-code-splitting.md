# React Patterns: Code Splitting and Lazy Loading

## Question 1: How to implement code splitting with React.lazy and Suspense?

**Answer:**

Code splitting is a technique that allows you to split your application bundle into smaller chunks that can be loaded on-demand, rather than loading the entire application upfront. React provides built-in support for code splitting through `React.lazy()` for dynamic imports and `Suspense` for handling loading states.

**Basic Implementation:**

```javascript
import React, { lazy, Suspense } from 'react';

// Dynamic import - creates separate chunk
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

**Key Concepts:**

1. **React.lazy**: Accepts a function that returns a dynamic import, which must resolve to a module with a default export containing a React component
2. **Suspense**: Wraps lazy components to display a fallback UI while the component is loading
3. **Dynamic Import**: Uses `import()` function which returns a Promise, triggering Webpack/Vite to create a separate bundle chunk

**Error Handling:**

```javascript
import { lazy, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <ErrorBoundary fallback={<div>Failed to load component</div>}>
      <Suspense fallback={<Spinner />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

React.lazy only works with default exports, so if your component uses named exports, you need to create an intermediate module that re-exports it as default. Code splitting is most effective for large components, route-based loading, or features that users may not access immediately.

---

### 🔍 Deep Dive: Dynamic Imports and Module Loading Internals

**How Dynamic Imports Work Under the Hood:**

When you use `import()` with React.lazy, several layers of the stack are involved:

1. **JavaScript Engine Level:**
   - Dynamic import creates a Promise that resolves to a module namespace object
   - The import specifier is parsed and resolved to an actual module URL/path
   - Browser/bundler fetches the module asynchronously

2. **Bundler Level (Webpack/Vite):**
   - Bundler analyzes dynamic import statements during build
   - Creates separate "chunks" (bundles) for each dynamic import
   - Generates a runtime mechanism to load chunks on-demand
   - Creates a manifest mapping chunk IDs to file names

**Webpack Chunking Mechanism:**

```javascript
// Your code
const Dashboard = lazy(() => import('./Dashboard'));

// Webpack transforms this to (simplified):
const Dashboard = lazy(() => {
  return __webpack_require__.e(/* chunk id */ 123)
    .then(__webpack_require__.bind(null, './Dashboard'));
});

// At runtime, __webpack_require__.e creates a <script> tag:
function loadChunk(chunkId) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `/static/js/${chunkId}.chunk.js`;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

**Chunk Naming and Magic Comments:**

Webpack provides "magic comments" to control chunk generation:

```javascript
// Custom chunk name
const Dashboard = lazy(() =>
  import(/* webpackChunkName: "dashboard" */ './Dashboard')
);

// Prefetch (high priority, loaded during idle time)
const Settings = lazy(() =>
  import(/* webpackPrefetch: true */ './Settings')
);

// Preload (parallel to parent, high priority)
const Critical = lazy(() =>
  import(/* webpackPreload: true */ './Critical')
);

// Multiple magic comments
const Admin = lazy(() =>
  import(
    /* webpackChunkName: "admin" */
    /* webpackPrefetch: true */
    './AdminPanel'
  )
);
```

**React.lazy Implementation Details:**

```javascript
// Simplified React.lazy implementation
function lazy(loader) {
  return {
    $$typeof: REACT_LAZY_TYPE,
    _payload: {
      _status: 'pending',
      _result: loader,
    },
    _init: function(payload) {
      if (payload._status === 'pending') {
        const loader = payload._result;
        const moduleObject = loader(); // Call import()

        moduleObject.then(
          (module) => {
            payload._status = 'resolved';
            payload._result = module.default;
          },
          (error) => {
            payload._status = 'rejected';
            payload._result = error;
          }
        );
      }

      if (payload._status === 'resolved') {
        return payload._result;
      }

      throw payload._result; // Suspense catches this
    }
  };
}
```

**Suspense Coordination:**

Suspense uses React's internal "thenable" tracking mechanism:

```javascript
// When lazy component throws promise during render:
function Suspense({ fallback, children }) {
  try {
    return children;
  } catch (thrownValue) {
    // If thrown value is a Promise (thenable)
    if (isThenable(thrownValue)) {
      // Show fallback, attach listener for promise resolution
      thrownValue.then(() => {
        // Re-render this subtree when promise resolves
        scheduleUpdate(this);
      });
      return fallback;
    }
    throw thrownValue; // Re-throw if not a promise
  }
}
```

**Network Loading Patterns:**

```javascript
// Pattern 1: Serial Loading (default)
<Suspense fallback={<Loading />}>
  <ComponentA /> {/* Loads, then... */}
  <ComponentB /> {/* ...this loads */}
</Suspense>

// Pattern 2: Parallel Loading (nested Suspense)
<Suspense fallback={<Loading />}>
  <Suspense fallback={null}>
    <ComponentA /> {/* Both load in parallel */}
  </Suspense>
  <Suspense fallback={null}>
    <ComponentB />
  </Suspense>
</Suspense>

// Pattern 3: Waterfall (nested components)
const Parent = lazy(() => import('./Parent')); // Parent imports Child
// Creates waterfall: Parent → fetch → Parent code → import Child → fetch Child
```

**Module Federation (Advanced):**

Webpack 5 Module Federation allows sharing chunks across different builds:

```javascript
// Host app (main app)
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    remote1: 'remote1@http://localhost:3001/remoteEntry.js',
  },
});

// In React component
const RemoteComponent = lazy(() => import('remote1/Component'));

// This loads component from completely different build/server!
```

**Performance Monitoring:**

```javascript
// Track chunk loading performance
const Dashboard = lazy(() => {
  const start = performance.now();
  return import('./Dashboard').then((module) => {
    const loadTime = performance.now() - start;
    console.log(`Dashboard loaded in ${loadTime}ms`);

    // Send to analytics
    analytics.track('chunk_loaded', {
      chunk: 'dashboard',
      loadTime,
      cacheHit: loadTime < 50, // Fast = likely cached
    });

    return module;
  });
});
```

**Vite's Approach:**

Vite uses native ES modules in development and Rollup for production:

```javascript
// In development - native browser imports
const Dashboard = lazy(() => import('./Dashboard.jsx'));
// Browser makes HTTP request: GET /src/Dashboard.jsx

// In production - Rollup creates chunks similar to Webpack
// Output: dashboard.[hash].js
```

---

### 🐛 Real-World Scenario: Bundle Size Crisis and Loading Performance

**Situation:**
An e-commerce React application was experiencing poor initial load performance. Users were abandoning the site before it fully loaded, especially on mobile networks.

**Initial Metrics (Before Code Splitting):**
```
Bundle Size: 2.8 MB (uncompressed)
Gzipped: 850 KB
Initial Load Time (3G): 12.4 seconds
Time to Interactive (TTI): 14.8 seconds
Lighthouse Performance Score: 32/100
Bounce Rate: 47%
```

**Problem Discovery:**

The development team analyzed the bundle with webpack-bundle-analyzer:

```bash
npm install --save-dev webpack-bundle-analyzer

# webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
    }),
  ],
};
```

**Bundle Analysis Revealed:**

```
main.bundle.js (2.8 MB):
├── lodash: 530 KB (19%)
├── moment.js: 288 KB (10%)
├── chart.js: 245 KB (9%)
├── admin dashboard: 420 KB (15%)
├── rich text editor: 380 KB (14%)
├── PDF generator: 310 KB (11%)
└── application code: 627 KB (22%)
```

**Critical Issues Found:**

1. **Admin Dashboard Loading for All Users**: Only 8% of users were admins, but 100% paid the cost
2. **Heavy Libraries Loaded Upfront**: Chart.js, PDF generator loaded even though 60% of users never used these features
3. **Entire Lodash Imported**: Only using 12 functions, but importing entire library
4. **Moment.js Bloat**: Using for simple date formatting, including all locales

**Solution Implementation:**

**Step 1: Route-Based Code Splitting**

```javascript
// Before ❌
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import ProductCatalog from './pages/ProductCatalog';

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/products" element={<ProductCatalog />} />
    </Routes>
  );
}

// After ✅
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const ProductCatalog = lazy(() => import('./pages/ProductCatalog'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/products" element={<ProductCatalog />} />
      </Routes>
    </Suspense>
  );
}
```

**Step 2: Component-Level Code Splitting**

```javascript
// Heavy chart component
const ChartComponent = lazy(() =>
  import(/* webpackChunkName: "charts" */ './components/Chart')
);

// PDF export feature
const PDFExporter = lazy(() =>
  import(/* webpackChunkName: "pdf" */ './features/PDFExport')
);

// Rich text editor (only for content creators)
const RichTextEditor = lazy(() =>
  import(/* webpackChunkName: "editor" */ './components/Editor')
);

function Dashboard({ showCharts, canEdit }) {
  return (
    <div>
      <h1>Dashboard</h1>

      {showCharts && (
        <Suspense fallback={<ChartPlaceholder />}>
          <ChartComponent data={data} />
        </Suspense>
      )}

      {canEdit && (
        <Suspense fallback={<EditorPlaceholder />}>
          <RichTextEditor />
        </Suspense>
      )}
    </div>
  );
}
```

**Step 3: Library Optimization**

```javascript
// Before: Import entire Lodash ❌
import _ from 'lodash';
_.debounce(fn, 300);

// After: Import individual functions ✅
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
debounce(fn, 300);

// Before: Moment.js for simple formatting ❌
import moment from 'moment';
const formatted = moment(date).format('YYYY-MM-DD');

// After: date-fns with tree-shaking ✅
import { format } from 'date-fns';
const formatted = format(date, 'yyyy-MM-dd');
// Saved: 270 KB (moment.js → date-fns)
```

**Step 4: Progressive Loading Strategy**

```javascript
// Prefetch likely-needed routes during idle time
import { lazy } from 'react';

const ProductDetail = lazy(() =>
  import(
    /* webpackChunkName: "product-detail" */
    /* webpackPrefetch: true */
    './pages/ProductDetail'
  )
);

// Prefetch on user intent (hover over link)
function ProductLink({ id, name }) {
  const prefetchProduct = () => {
    // Trigger chunk download
    import('./pages/ProductDetail');
  };

  return (
    <Link
      to={`/product/${id}`}
      onMouseEnter={prefetchProduct}
      onTouchStart={prefetchProduct}
    >
      {name}
    </Link>
  );
}
```

**Step 5: Advanced Loading States**

```javascript
import { lazy, Suspense, useState, useTransition } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  const [show, setShow] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleShow = () => {
    // Start loading chunk before showing
    startTransition(() => {
      setShow(true);
    });
  };

  return (
    <div>
      <button onClick={handleShow} disabled={isPending}>
        {isPending ? 'Loading...' : 'Show Component'}
      </button>

      {show && (
        <Suspense fallback={<Skeleton />}>
          <HeavyComponent />
        </Suspense>
      )}
    </div>
  );
}
```

**Results After Implementation:**

```
BEFORE (Monolithic Bundle):
├── main.bundle.js: 2.8 MB
├── Initial Load (3G): 12.4s
├── TTI: 14.8s
└── Performance Score: 32/100

AFTER (Code Split):
├── main.bundle.js: 380 KB (-86%)
├── admin.chunk.js: 420 KB (loaded only for admins)
├── charts.chunk.js: 245 KB (loaded on demand)
├── editor.chunk.js: 380 KB (loaded on demand)
├── pdf.chunk.js: 310 KB (loaded on demand)
├── Initial Load (3G): 3.2s (-74%)
├── TTI: 4.1s (-72%)
└── Performance Score: 87/100
```

**Business Impact:**

```
Bounce Rate: 47% → 23% (-51%)
Time to Interactive: 14.8s → 4.1s (-72%)
Mobile Conversion Rate: +34%
Lighthouse Score: 32 → 87 (+171%)
Server Bandwidth Cost: -68% (smaller initial bundle)
```

**Monitoring Setup:**

```javascript
// Track chunk loading failures
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.name === 'ChunkLoadError') {
    analytics.track('chunk_load_error', {
      chunk: event.reason.request,
      userAgent: navigator.userAgent,
      connection: navigator.connection?.effectiveType,
    });

    // Offer retry or fallback
    showErrorMessage('Content failed to load. Retry?');
  }
});

// Performance monitoring
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.initiatorType === 'script') {
      console.log(`Chunk loaded: ${entry.name} (${entry.duration}ms)`);
    }
  }
});
observer.observe({ entryTypes: ['resource'] });
```

**Key Lessons Learned:**

1. **Split at Route Level First**: Biggest wins come from splitting routes
2. **Analyze Bundle Regularly**: Use bundle analyzer in CI pipeline
3. **Monitor Real User Performance**: Track chunk load times and failures
4. **Progressive Enhancement**: Prefetch likely-needed chunks
5. **Loading States Matter**: Good UX during loading prevents user frustration

---

### ⚖️ Trade-offs: Code Splitting Granularity and Loading Strategies

**Trade-off 1: Bundle Size vs Number of Requests**

**Monolithic Bundle:**
```javascript
// Single large bundle ❌
// Bundle: 2.5 MB
// Requests: 1
// Load time: 8s on 3G
// Cache hit: All or nothing

Pros:
- Single HTTP request
- No additional round trips
- Simpler deployment
- Easier to debug
- Consistent performance

Cons:
- Huge initial load time
- Users pay for unused code
- Poor cache efficiency (one change invalidates everything)
- Memory-intensive parsing
- Longer Time to Interactive
```

**Aggressive Code Splitting:**
```javascript
// Every component in separate chunk ❌
const Button = lazy(() => import('./Button'));
const Input = lazy(() => import('./Input'));
const Modal = lazy(() => import('./Modal'));
// 100+ small chunks

Pros:
- Minimal initial bundle
- Perfect cache granularity
- Load only what's needed
- Better memory usage

Cons:
- Too many HTTP requests (HTTP/1.1)
- Request overhead (each ~50-100ms)
- Complicated build output
- Loading waterfalls
- More points of failure
```

**Balanced Approach (Recommended):**
```javascript
// Strategic splitting ✅
const routes = {
  home: lazy(() => import('./pages/Home')),        // 150 KB
  admin: lazy(() => import('./pages/Admin')),      // 300 KB
  features: lazy(() => import('./features')),      // 200 KB
};

// Main bundle: 400 KB (core + framework)
// Chunks: 3-5 major features
// Total: 1.05 MB split across 4-6 files

Decision Matrix:
├── Routes: Always split (users may never visit)
├── Large features: Split if >100 KB or <30% usage
├── Third-party libraries: Split if >50 KB
├── Small components: Keep in main bundle
└── Critical path: Keep in main bundle
```

**Measurement:**
```javascript
// Track performance per strategy
const metrics = {
  monolithic: {
    requests: 1,
    totalSize: '2.5 MB',
    initialLoad: '8.2s',
    cacheHitRate: '34%', // All or nothing
  },
  aggressive: {
    requests: 127,
    totalSize: '2.3 MB',
    initialLoad: '6.8s', // Request overhead
    cacheHitRate: '89%', // Granular caching
  },
  balanced: {
    requests: 5,
    totalSize: '1.05 MB',
    initialLoad: '2.9s',
    cacheHitRate: '76%', // Good compromise
  },
};
```

---

**Trade-off 2: Loading Strategy - Lazy vs Prefetch vs Preload**

**Pure Lazy Loading:**
```javascript
// Load on demand only
const Dashboard = lazy(() => import('./Dashboard'));

// User clicks → Network request → Download → Parse → Render
// Delay: 500-2000ms visible to user

Pros:
- Minimal initial bundle
- Bandwidth saved for unused features
- Good for rarely-used features

Cons:
- Visible loading delay
- Poor UX for expected features
- Waterfalls (component imports child)
- Network dependency
```

**Prefetch Strategy:**
```javascript
// Load during idle time (low priority)
const Dashboard = lazy(() =>
  import(/* webpackPrefetch: true */ './Dashboard')
);

// Browser loads during idle time after main content
// When user navigates, chunk already available

Pros:
- No visible delay on interaction
- Uses idle network time
- Doesn't block critical resources
- Good cache warming

Cons:
- Uses bandwidth even if not needed
- May waste data on mobile
- Browser decides priority (less control)
```

**Preload Strategy:**
```javascript
// Load immediately in parallel (high priority)
const CriticalFeature = lazy(() =>
  import(/* webpackPreload: true */ './CriticalFeature')
);

// Loaded immediately alongside parent chunk
// Very high priority

Pros:
- Fast when needed
- Predictable performance
- Good for critical features

Cons:
- Increases initial bundle (parallel loads)
- Can compete with main bundle
- Should only use for near-certain needs
```

**Intent-Based Prefetching (Best UX):**
```javascript
function ProductList() {
  const prefetchDetail = () => {
    // Start loading on hover/touch
    import('./ProductDetail');
  };

  return (
    <div>
      {products.map(product => (
        <Link
          to={`/product/${product.id}`}
          onMouseEnter={prefetchDetail}
          onTouchStart={prefetchDetail}
        >
          {product.name}
        </Link>
      ))}
    </div>
  );
}

// Load time feels instant because chunk loaded during hover (200-300ms)

Pros:
- Feels instant to users
- Only loads when highly likely needed
- Better than pure lazy loading
- User intent signals

Cons:
- Requires manual implementation
- False positives (hover without click)
- More complex code
```

**Decision Matrix:**
```
Feature Usage Rate | Strategy
-------------------|----------
<10%               | Lazy load only
10-30%             | Lazy + Prefetch
30-60%             | Intent-based prefetch
60-90%             | Preload
>90%               | Include in main bundle
```

---

**Trade-off 3: Error Handling Complexity**

**Optimistic (Minimal Error Handling):**
```javascript
const Component = lazy(() => import('./Component'));

<Suspense fallback={<Loading />}>
  <Component />
</Suspense>

// Assumes network always works
// No retry mechanism
// Chunk load failure crashes app

Pros:
- Simple code
- Fast to implement
- Works fine in perfect conditions

Cons:
- Poor UX on network failures
- No recovery mechanism
- Users stuck on errors
```

**Defensive (Full Error Handling):**
```javascript
import { Component as ErrorBoundaryClass } from 'react';

class LazyLoadErrorBoundary extends ErrorBoundaryClass {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>Failed to load component</p>
          <button onClick={this.retry}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage with retry
const Component = lazy(() =>
  import('./Component').catch(err => {
    console.error('Chunk load failed', err);
    analytics.track('chunk_error', { chunk: 'Component' });
    throw err;
  })
);

<LazyLoadErrorBoundary>
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
</LazyLoadErrorBoundary>

Pros:
- Graceful degradation
- User can retry
- Tracking for monitoring
- Better production reliability

Cons:
- More boilerplate
- Complexity increases
- Testing becomes harder
```

**Recommended Approach:**
```javascript
// Reusable lazy wrapper with retry
function lazyWithRetry(importFn, chunkName) {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const retry = (attempt = 1) => {
        importFn()
          .then(resolve)
          .catch((error) => {
            if (attempt < 3) {
              console.log(`Retry ${attempt} for ${chunkName}`);
              setTimeout(() => retry(attempt + 1), 1000 * attempt);
            } else {
              analytics.track('chunk_failed', { chunk: chunkName });
              reject(error);
            }
          });
      };
      retry();
    });
  });
}

// Usage
const Dashboard = lazyWithRetry(
  () => import('./Dashboard'),
  'dashboard'
);
```

---

### 💬 Explain to Junior: Code Splitting Made Simple

**Simple Analogy:**

Imagine you're going to a new restaurant. There are two ways to get your meal:

**Option 1 (Monolithic Bundle)**: The restaurant brings ALL food on their menu to your table at once - appetizers, main courses, desserts, drinks, everything. Even items you don't want. Your table is overflowing, you wait forever, and most food gets wasted.

**Option 2 (Code Splitting)**: The restaurant brings you the menu first (small and quick). You order only what you want. They bring your appetizer first, then your main course when ready, then dessert if you want it. Much faster, less waste, and you only pay for what you eat.

**Code splitting is Option 2 for your React app.**

---

**Core Concepts Explained:**

**1. What is a "bundle"?**

When you write React code with multiple components and libraries, a build tool (like Webpack or Vite) combines everything into a single JavaScript file called a "bundle." This bundle is what users download to run your app.

```javascript
// You write multiple files:
// - App.js
// - Dashboard.js
// - Profile.js
// - Chart.js (big library)
// - axios.js (HTTP library)

// Build tool creates one file:
// main.bundle.js (2 MB) ← Everything combined
```

**Problem**: If your app is large, this bundle becomes huge. Users wait a long time for it to download, even if they only need a small part of your app.

---

**2. React.lazy - The Magic Splitter**

`React.lazy` tells React: "Don't include this component in the main bundle. Load it separately when needed."

```javascript
// Normal import ❌
// Component code included in main bundle
import Dashboard from './Dashboard';

// Lazy import ✅
// Component code in separate file, loaded when needed
const Dashboard = lazy(() => import('./Dashboard'));
```

**What happens:**

When you build your app:
```
Output files:
├── main.bundle.js (400 KB) ← Main app
└── Dashboard.chunk.js (300 KB) ← Lazy component
```

When user visits your app:
1. Browser downloads main.bundle.js (400 KB)
2. App starts quickly
3. If user navigates to Dashboard → Browser downloads Dashboard.chunk.js
4. If user never visits Dashboard → Never downloads it (saves 300 KB!)

---

**3. Suspense - The Loading Manager**

`Suspense` is like a safety net. While React is downloading your lazy component, Suspense shows a loading spinner so your app doesn't crash or look broken.

```javascript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <div>
      <h1>My App</h1>

      {/* Without Suspense: App crashes while loading Dashboard */}

      {/* With Suspense: Shows "Loading..." while downloading */}
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
```

**Think of Suspense as a polite waiter**: While the kitchen (network) prepares your order (lazy component), the waiter (Suspense) serves you bread and water (loading fallback) so you're not just sitting there wondering what's happening.

---

**4. When Should You Use Code Splitting?**

**Good candidates for splitting:**

```javascript
// 1. Routes (different pages)
const HomePage = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/About'));
const AdminPage = lazy(() => import('./pages/Admin'));

// Why: Users might never visit Admin page
// Savings: Don't make all users download admin code

// 2. Big libraries
const ChartComponent = lazy(() => import('./Chart')); // includes chart.js library

// Why: Chart library is 200 KB
// Savings: Only download if user views charts

// 3. Rare features
const PdfExporter = lazy(() => import('./PdfExport'));

// Why: Only 10% of users export PDFs
// Savings: 90% of users save bandwidth
```

**Bad candidates (don't split):**

```javascript
// ❌ Small components used everywhere
const Button = lazy(() => import('./Button')); // 2 KB

// Why bad: Overhead of loading outweighs benefit
// Cost: Extra HTTP request (50-100ms) for tiny component

// ❌ Critical components (needed immediately)
const Header = lazy(() => import('./Header'));

// Why bad: User sees broken layout while loading
// Cost: Poor UX, visible loading delay
```

**Rule of thumb**: Split components that are either large (>50 KB) or rarely used (<50% of users).

---

**5. Common Patterns for Interviews**

**Pattern 1: Route-Based Splitting**

```javascript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load each page
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading page...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**Interview talking point**: "Route-based splitting is the most common pattern. Each page is a separate chunk, so users only download the pages they visit. This is especially effective for large apps with many routes."

---

**Pattern 2: Conditional Splitting**

```javascript
import { lazy, Suspense, useState } from 'react';

const HeavyModal = lazy(() => import('./HeavyModal'));

function Dashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => setShowModal(true)}>
        Open Modal
      </button>

      {showModal && (
        <Suspense fallback={<div>Loading...</div>}>
          <HeavyModal onClose={() => setShowModal(false)} />
        </Suspense>
      )}
    </div>
  );
}
```

**Interview talking point**: "Conditional splitting is useful for modals, popovers, or any component that's not immediately visible. The component only loads when the user triggers it, reducing initial bundle size."

---

**Pattern 3: Error Handling**

```javascript
import { lazy, Suspense, Component } from 'react';

// Error boundary component
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    </ErrorBoundary>
  );
}
```

**Interview talking point**: "Always wrap lazy components in an error boundary. If the chunk fails to load (network issue, 404, etc.), the error boundary catches it and shows a friendly message instead of crashing the entire app."

---

**6. Interview Answer Template**

**Question**: "How would you optimize a large React application with slow initial load times?"

**Answer Structure**:

1. **Identify the problem**: "I'd first analyze the bundle size using tools like webpack-bundle-analyzer to identify large chunks of code that not all users need."

2. **Explain solution**: "I'd implement code splitting using React.lazy and Suspense to split the application into smaller chunks that load on-demand."

3. **Give example**:
```javascript
// Example: Split admin section that only 10% of users access
const AdminPanel = lazy(() => import('./admin/AdminPanel'));

<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/admin" element={<AdminPanel />} />
  </Routes>
</Suspense>
```

4. **Mention benefits**: "This reduces the initial bundle from 2 MB to 400 KB, improving load time by 70%. Users only download admin code if they're admins."

5. **Add considerations**: "I'd wrap lazy components in error boundaries to handle chunk loading failures, and use prefetching for routes users are likely to visit."

---

**7. Common Mistakes to Avoid**

```javascript
// ❌ MISTAKE 1: Named exports with lazy
export const Dashboard = () => <div>Dashboard</div>;
const Dashboard = lazy(() => import('./Dashboard')); // ERROR!

// ✅ FIX: Use default export
export default function Dashboard() { return <div>Dashboard</div>; }
const Dashboard = lazy(() => import('./Dashboard'));

// OR: Re-export as default
const Dashboard = lazy(() =>
  import('./Dashboard').then(module => ({ default: module.Dashboard }))
);

// ❌ MISTAKE 2: Forgetting Suspense
const Dashboard = lazy(() => import('./Dashboard'));
<Dashboard /> // Crashes!

// ✅ FIX: Wrap in Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>

// ❌ MISTAKE 3: Too aggressive splitting
const Button = lazy(() => import('./Button'));
const Input = lazy(() => import('./Input'));
// 100+ tiny chunks = too many requests

// ✅ FIX: Split strategically (routes, large features)
const AdminSection = lazy(() => import('./admin')); // Contains many components
```

---

**Key Takeaways for Interviews:**

1. **What**: Code splitting breaks your app into smaller pieces loaded on-demand
2. **Why**: Reduces initial bundle size, faster load times, better UX
3. **How**: React.lazy + Suspense + dynamic imports
4. **When**: Routes, large libraries, rarely-used features
5. **Watch out**: Error boundaries, default exports, don't over-split small components

---

## Question 2: What are advanced code splitting strategies? (route-based, component-based, library splitting)

**Answer:**

Advanced code splitting strategies involve splitting your application at different levels of granularity to optimize bundle size, loading performance, and caching efficiency. The three primary strategies are route-based splitting, component-based splitting, and library splitting, each targeting different parts of your application architecture.

**1. Route-Based Splitting:**

This is the most common and effective strategy. Each route or page is loaded as a separate chunk, ensuring users only download code for the routes they visit.

```javascript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**2. Component-Based Splitting:**

Split large, complex, or conditional components that aren't part of the critical rendering path. This includes modals, tabs, accordions, and feature-specific components.

```javascript
// Heavy chart library only loaded when needed
const ChartComponent = lazy(() => import('./components/Chart'));

function Dashboard({ showCharts }) {
  return (
    <div>
      <h1>Dashboard</h1>
      {showCharts && (
        <Suspense fallback={<ChartSkeleton />}>
          <ChartComponent data={data} />
        </Suspense>
      )}
    </div>
  );
}
```

**3. Library Splitting:**

Separate large third-party libraries into their own chunks, especially when they're conditionally used or can be lazy-loaded.

```javascript
// Webpack config for manual library splitting
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        lodash: {
          test: /[\\/]node_modules[\\/]lodash[\\/]/,
          name: 'lodash',
          chunks: 'all',
        },
      },
    },
  },
};

// Or lazy load heavy libraries
const loadPDF = () => import('jspdf');

function ExportButton() {
  const exportPDF = async () => {
    const { jsPDF } = await loadPDF();
    const doc = new jsPDF();
    doc.text('Hello', 10, 10);
    doc.save('export.pdf');
  };

  return <button onClick={exportPDF}>Export PDF</button>;
}
```

These strategies can be combined for maximum effect. For example, route-based splitting at the page level, component-based splitting for heavy features within pages, and library splitting for shared dependencies across routes. The key is analyzing your bundle, understanding user behavior, and splitting at boundaries that provide the most benefit.

---

### 🔍 Deep Dive: Advanced Splitting Techniques and Module Federation

**Route-Based Splitting Deep Dive:**

Route splitting leverages the natural boundaries in your application where users navigate between different views. This is the highest-impact splitting strategy because it aligns with user behavior.

**Nested Route Splitting:**

```javascript
// Lazy load both parent and child routes
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const ProductReviews = lazy(() => import('./pages/ProductReviews'));

<Routes>
  <Route path="/products" element={<Products />}>
    <Route path=":id" element={<ProductDetail />} />
    <Route path=":id/reviews" element={<ProductReviews />} />
  </Route>
</Routes>

// Webpack output:
// products.chunk.js (parent route)
// product-detail.chunk.js (child route)
// product-reviews.chunk.js (child route)
```

**Route Prefetching Based on Navigation Patterns:**

```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Prefetch likely next routes based on current route
const routePrefetchMap = {
  '/': ['/products', '/about'],
  '/products': ['/products/:id', '/cart'],
  '/cart': ['/checkout'],
};

function RoutePreloader() {
  const location = useLocation();

  useEffect(() => {
    const nextRoutes = routePrefetchMap[location.pathname] || [];

    // Prefetch during idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        nextRoutes.forEach(route => {
          // Trigger import to start downloading chunk
          import(`./pages${route}`).catch(() => {});
        });
      });
    }
  }, [location.pathname]);

  return null;
}
```

**Progressive Route Loading:**

```javascript
// Load critical routes first, defer others
import { lazy, Suspense, useEffect, useState } from 'react';

// Load immediately (critical)
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));

// Load after initial render (deferred)
const About = lazy(() => import(/* webpackPrefetch: true */ './pages/About'));
const Contact = lazy(() => import(/* webpackPrefetch: true */ './pages/Contact'));

// Load only when accessed (rare routes)
const Admin = lazy(() => import('./pages/Admin'));
const Analytics = lazy(() => import('./pages/Analytics'));
```

---

**Component-Based Splitting Deep Dive:**

Component splitting requires more nuance than route splitting because splitting too aggressively can create request waterfalls and hurt performance.

**Granularity Decision Framework:**

```javascript
// Decision tree for component splitting:

// 1. SIZE CHECK
// If component + dependencies < 30 KB → Don't split
// If component + dependencies > 100 KB → Split
// If 30-100 KB → Check usage

// 2. USAGE CHECK
// If used on >80% of page loads → Don't split
// If used on <20% of page loads → Split
// If 20-80% → Check criticality

// 3. CRITICALITY CHECK
// If needed for initial render → Don't split
// If needed after user interaction → Split
// If conditional/behind feature flag → Always split

// Example 1: Header component
// Size: 15 KB
// Usage: 100% of pages
// Critical: Yes
// Decision: DON'T SPLIT ❌

// Example 2: Chart component
// Size: 250 KB (includes chart.js)
// Usage: 30% of pages
// Critical: No (below fold)
// Decision: SPLIT ✅

// Example 3: Modal component
// Size: 40 KB
// Usage: 50% of pages
// Critical: No (user triggered)
// Decision: SPLIT ✅
```

**Smart Component Splitting with Metrics:**

```javascript
// HOC to track component usage and automate splitting decisions
function withSplitAnalytics(Component, componentName) {
  useEffect(() => {
    analytics.track('component_loaded', {
      component: componentName,
      timestamp: Date.now(),
    });
  }, []);

  return Component;
}

// Analyze after 30 days:
// If usage < 40% and size > 50 KB → Move to lazy loading
```

**Tab/Accordion Splitting:**

```javascript
import { lazy, Suspense, useState } from 'react';

const tabs = {
  overview: lazy(() => import('./tabs/Overview')),
  analytics: lazy(() => import('./tabs/Analytics')),
  settings: lazy(() => import('./tabs/Settings')),
};

function TabbedInterface() {
  const [activeTab, setActiveTab] = useState('overview');
  const ActiveTabComponent = tabs[activeTab];

  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab('overview')}>Overview</button>
        <button onClick={() => setActiveTab('analytics')}>Analytics</button>
        <button onClick={() => setActiveTab('settings')}>Settings</button>
      </nav>

      <Suspense fallback={<TabLoader />}>
        <ActiveTabComponent />
      </Suspense>
    </div>
  );
}

// Only loads tab content when clicked
// If user only views Overview tab → Analytics and Settings never loaded
```

**Modal/Overlay Splitting with Preloading:**

```javascript
import { lazy, Suspense, useState } from 'react';

const EditModal = lazy(() => import('./modals/EditModal'));

function UserList() {
  const [showModal, setShowModal] = useState(false);
  const [modalPreloaded, setModalPreloaded] = useState(false);

  // Preload on hover (user intent signal)
  const handleEditHover = () => {
    if (!modalPreloaded) {
      import('./modals/EditModal');
      setModalPreloaded(true);
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        onMouseEnter={handleEditHover}
        onFocus={handleEditHover}
      >
        Edit User
      </button>

      {showModal && (
        <Suspense fallback={<ModalLoader />}>
          <EditModal onClose={() => setShowModal(false)} />
        </Suspense>
      )}
    </div>
  );
}
```

---

**Library Splitting Deep Dive:**

Library splitting optimizes how third-party dependencies are bundled and loaded.

**Automatic Vendor Splitting (Webpack):**

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Split all node_modules into vendor bundle
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },

        // Split large libraries into separate chunks
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react-vendor',
          priority: 10,
        },

        lodash: {
          test: /[\\/]node_modules[\\/]lodash[\\/]/,
          name: 'lodash-vendor',
          priority: 10,
        },

        // Split by size
        large: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
          minSize: 100000, // 100 KB
          priority: 5,
        },
      },
    },
  },
};

// Output:
// main.bundle.js (your app code)
// react-vendor.chunk.js (React + ReactDOM)
// lodash-vendor.chunk.js (Lodash)
// vendor.axios.chunk.js (Axios if > 100 KB)
```

**Tree-Shaking and Selective Imports:**

```javascript
// ❌ BAD: Imports entire Lodash library (530 KB)
import _ from 'lodash';
_.debounce(fn, 300);
_.throttle(fn, 500);
_.uniq(array);

// ✅ GOOD: Import only needed functions (15 KB)
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import uniq from 'lodash/uniq';

// ❌ BAD: Imports entire MUI library (2 MB)
import { Button, TextField, Select } from '@mui/material';

// ✅ GOOD: Import from specific paths (200 KB)
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';

// Webpack config to help with tree-shaking
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false,
  },
};
```

**Dynamic Library Loading:**

```javascript
// Load heavy libraries only when needed
async function generatePDF() {
  // jsPDF is 500 KB - only load when user exports
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  doc.text('Report', 10, 10);
  doc.save('report.pdf');
}

async function showChart(data) {
  // Chart.js is 250 KB - only load when showing charts
  const { Chart } = await import('chart.js');
  new Chart(ctx, { type: 'bar', data });
}

async function validateForm(values) {
  // Yup is 120 KB - only load when validating
  const yup = await import('yup');
  const schema = yup.object().shape({
    email: yup.string().email().required(),
  });
  return schema.validate(values);
}
```

**Polyfill Splitting:**

```javascript
// Load polyfills only for browsers that need them
async function loadPolyfills() {
  const polyfills = [];

  if (!('IntersectionObserver' in window)) {
    polyfills.push(import('intersection-observer'));
  }

  if (!('fetch' in window)) {
    polyfills.push(import('whatwg-fetch'));
  }

  if (!('Promise' in window)) {
    polyfills.push(import('promise-polyfill'));
  }

  await Promise.all(polyfills);
}

// Load before app starts
loadPolyfills().then(() => {
  ReactDOM.render(<App />, document.getElementById('root'));
});

// Modern browsers: 0 KB polyfills
// Old browsers: Only needed polyfills loaded
```

---

**Module Federation (Micro-Frontends):**

Webpack 5 Module Federation allows sharing code between separately deployed applications.

```javascript
// Host app webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        // Load components from remote apps
        marketing: 'marketing@http://localhost:3001/remoteEntry.js',
        dashboard: 'dashboard@http://localhost:3002/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};

// Remote app (marketing) webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'marketing',
      filename: 'remoteEntry.js',
      exposes: {
        // Expose components to host
        './Banner': './src/components/Banner',
        './Newsletter': './src/components/Newsletter',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};

// In host app, use remote components
import { lazy } from 'react';

const MarketingBanner = lazy(() => import('marketing/Banner'));
const Newsletter = lazy(() => import('marketing/Newsletter'));

function App() {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <MarketingBanner />
        <Newsletter />
      </Suspense>
    </div>
  );
}

// Benefits:
// - Marketing team deploys independently
// - Shared dependencies (React) loaded once
// - Each team owns their build
```

---

### 🐛 Real-World Scenario: Enterprise App Optimization with Multi-Strategy Splitting

**Situation:**
A large enterprise SaaS application (project management tool) had massive bundle sizes and poor performance, especially for international users on slower connections.

**Initial State:**

```
Bundle Analysis (Before):
├── main.bundle.js: 4.2 MB
│   ├── React + dependencies: 450 KB
│   ├── UI library (Material-UI): 1.8 MB
│   ├── Chart libraries: 600 KB
│   ├── Rich text editor: 520 KB
│   ├── Date/time libraries: 380 KB
│   ├── Application code: 450 KB
│   └── Other dependencies: 600 KB

Performance Metrics:
├── Initial Load (3G): 18.3 seconds
├── Time to Interactive: 21.7 seconds
├── Lighthouse Score: 23/100
├── First Contentful Paint: 8.2s
└── Largest Contentful Paint: 14.3s

User Impact:
├── Bounce rate: 54%
├── Mobile users: 68% bounce rate
├── International users (India, SEA): 71% bounce rate
└── Conversion rate: 2.1%
```

**Analysis Phase:**

The team used multiple tools to understand usage patterns:

```bash
# 1. Bundle analysis
npx webpack-bundle-analyzer dist/stats.json

# 2. User analytics query
SELECT
  feature_path,
  COUNT(DISTINCT user_id) as users,
  COUNT(*) as visits,
  (COUNT(DISTINCT user_id) / total_users) * 100 as usage_percentage
FROM analytics
WHERE event_date > NOW() - INTERVAL 30 days
GROUP BY feature_path
ORDER BY usage_percentage DESC;

# Results:
# /dashboard: 95% users
# /projects: 88% users
# /tasks: 82% users
# /reports: 45% users (but 600 KB chart libs always loaded!)
# /admin: 8% users (but 520 KB always loaded!)
# /timeline: 32% users (but 380 KB date libs always loaded!)
```

**Key Findings:**

1. **45% of users never viewed reports**, but everyone loaded 600 KB of chart libraries
2. **92% of users were not admins**, but all loaded 520 KB admin bundle
3. **Material-UI was 1.8 MB** but only 40% of components were used
4. **68% of users never exported PDFs**, but PDF library (400 KB) always loaded
5. **Rich text editor (520 KB)** only used by content creators (15% of users)

---

**Implementation: Three-Pronged Strategy**

**Strategy 1: Route-Based Splitting**

```javascript
// Before: All routes in main bundle ❌
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Timeline from './pages/Timeline';

// After: Lazy load all routes ✅
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Critical routes (90%+ usage) - prefetch
const Dashboard = lazy(() =>
  import(/* webpackPrefetch: true */ './pages/Dashboard')
);
const Projects = lazy(() =>
  import(/* webpackPrefetch: true */ './pages/Projects')
);
const Tasks = lazy(() =>
  import(/* webpackPrefetch: true */ './pages/Tasks')
);

// Medium usage (30-80%) - regular lazy load
const Reports = lazy(() => import('./pages/Reports'));
const Timeline = lazy(() => import('./pages/Timeline'));

// Low usage (<10%) - lazy load only
const Admin = lazy(() => import('./pages/Admin'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// Output after build:
// main.bundle.js: 520 KB (core + framework)
// dashboard.chunk.js: 180 KB
// projects.chunk.js: 220 KB
// reports.chunk.js: 680 KB (includes charts)
// admin.chunk.js: 540 KB
// timeline.chunk.js: 410 KB (includes date libs)
```

---

**Strategy 2: Component-Based Splitting**

```javascript
// Reports page - split heavy chart component
import { lazy, Suspense } from 'react';

const ChartComponent = lazy(() =>
  import(/* webpackChunkName: "charts" */ './components/Chart')
);
const DataTable = lazy(() =>
  import(/* webpackChunkName: "table" */ './components/DataTable')
);

function ReportsPage() {
  const [view, setView] = useState('table');

  return (
    <div>
      <h1>Reports</h1>
      <ViewToggle onChange={setView} />

      <Suspense fallback={<ContentLoader />}>
        {view === 'chart' && <ChartComponent data={data} />}
        {view === 'table' && <DataTable data={data} />}
      </Suspense>
    </div>
  );
}

// Result: Chart library (600 KB) only loads if user selects chart view
// 55% of report viewers use table only → Save 600 KB for them

// Editor component - lazy load rich text editor
const RichTextEditor = lazy(() =>
  import(/* webpackChunkName: "editor" */ './components/Editor')
);

function ContentEditor({ isContentCreator }) {
  if (!isContentCreator) {
    return <BasicTextarea />; // 5 KB
  }

  return (
    <Suspense fallback={<EditorLoader />}>
      <RichTextEditor /> {/* 520 KB */}
    </Suspense>
  );
}

// Result: 85% of users get 5 KB textarea instead of 520 KB editor

// PDF Export - lazy load on demand
function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    // Load PDF library only when exporting
    const { generatePDF } = await import('./utils/pdfGenerator');
    await generatePDF(data);

    setIsExporting(false);
  };

  return (
    <button onClick={handleExport} disabled={isExporting}>
      {isExporting ? 'Generating PDF...' : 'Export PDF'}
    </button>
  );
}

// Result: PDF library (400 KB) only loads when user clicks export
// 68% of users never export → Save 400 KB permanently
```

---

**Strategy 3: Library Splitting and Optimization**

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Split React and React-DOM
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          name: 'react-vendor',
          priority: 20,
          enforce: true,
        },

        // Split large UI library
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui-vendor',
          priority: 15,
          enforce: true,
        },

        // Split utilities used across app
        utils: {
          test: /[\\/]node_modules[\\/](lodash|date-fns|axios)[\\/]/,
          name: 'utils-vendor',
          priority: 10,
        },

        // All other node_modules
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 5,
        },
      },
    },
  },
};

// Optimize Material-UI imports
// Before ❌
import { Button, TextField, Select, MenuItem } from '@mui/material';

// After ✅
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Configure Babel plugin for automatic optimization
// .babelrc
{
  "plugins": [
    [
      "babel-plugin-import",
      {
        "libraryName": "@mui/material",
        "libraryDirectory": "",
        "camel2DashComponentName": false
      }
    ]
  ]
}

// Replace moment.js with date-fns
// Before: moment.js = 288 KB ❌
import moment from 'moment';
const formatted = moment(date).format('YYYY-MM-DD');

// After: date-fns = 14 KB ✅
import { format } from 'date-fns';
const formatted = format(date, 'yyyy-MM-dd');

// Savings: 274 KB per user
```

---

**Strategy 4: Intelligent Prefetching**

```javascript
// Prefetch likely routes based on user role and navigation
function SmartPrefetch() {
  const { user, location } = useAppContext();

  useEffect(() => {
    // Admin users likely visit admin panel
    if (user.isAdmin && location.pathname !== '/admin') {
      import('./pages/Admin');
    }

    // Dashboard users often go to Projects
    if (location.pathname === '/') {
      requestIdleCallback(() => {
        import('./pages/Projects');
      });
    }

    // Timeline users often need date pickers
    if (location.pathname === '/timeline') {
      import('./components/DatePicker');
    }
  }, [user, location]);

  return null;
}

// Link-level prefetching
function SmartLink({ to, children }) {
  const [prefetched, setPrefetched] = useState(false);

  const handleHover = () => {
    if (!prefetched) {
      // Map route to chunk
      const chunkMap = {
        '/reports': () => import('./pages/Reports'),
        '/admin': () => import('./pages/Admin'),
        '/timeline': () => import('./pages/Timeline'),
      };

      const prefetchFn = chunkMap[to];
      if (prefetchFn) {
        prefetchFn();
        setPrefetched(true);
      }
    }
  };

  return (
    <Link
      to={to}
      onMouseEnter={handleHover}
      onFocus={handleHover}
    >
      {children}
    </Link>
  );
}
```

---

**Results After Full Implementation:**

```
Bundle Structure (After):
├── main.bundle.js: 520 KB (core app + router)
├── react-vendor.chunk.js: 140 KB (React + ReactDOM)
├── mui-vendor.chunk.js: 420 KB (Material-UI)
├── utils-vendor.chunk.js: 95 KB (shared utilities)
├── dashboard.chunk.js: 180 KB
├── projects.chunk.js: 220 KB
├── reports.chunk.js: 680 KB (loaded on demand)
├── admin.chunk.js: 540 KB (loaded for admins only)
├── charts.chunk.js: 600 KB (loaded in reports if needed)
├── editor.chunk.js: 520 KB (loaded for content creators)
└── timeline.chunk.js: 410 KB (loaded on demand)

Initial Load (Main + React + MUI + Utils):
Total: 1.175 MB (down from 4.2 MB = -72%)

Performance Metrics (After):
├── Initial Load (3G): 4.8 seconds (-74%)
├── Time to Interactive: 6.2 seconds (-71%)
├── Lighthouse Score: 88/100 (+283%)
├── First Contentful Paint: 2.1s (-74%)
└── Largest Contentful Paint: 3.6s (-75%)

User Impact:
├── Bounce rate: 54% → 21% (-61%)
├── Mobile bounce: 68% → 28% (-59%)
├── International bounce: 71% → 31% (-56%)
└── Conversion rate: 2.1% → 4.8% (+129%)
```

**Cost Savings:**

```
Bandwidth savings per user:
- Regular users (85%): 3.0 MB saved (never load admin/editor/PDF)
- Content creators (10%): 2.5 MB saved (never load admin/PDF)
- Admins (5%): 1.8 MB saved (optimized imports)

Average savings: 2.85 MB per user

Monthly active users: 250,000
Data saved: 250,000 × 2.85 MB = 712.5 GB/month
CDN cost: $0.08/GB
Monthly savings: $57/month
Annual savings: $684/year
```

**Developer Experience Impact:**

```javascript
// Build times improved due to smaller chunks
Before: 180 seconds full build
After: 95 seconds full build (-47%)

// Better debugging (isolated chunks)
Before: Debug 4.2 MB bundle (hard to find issues)
After: Debug specific 200-600 KB chunks (easy isolation)

// Faster deployments (selective invalidation)
Before: Any change invalidates 4.2 MB bundle
After: Only affected chunks invalidated (better caching)
```

---

### ⚖️ Trade-offs: Splitting Strategies and Granularity

**Trade-off 1: Route-Based vs Component-Based Splitting**

**Route-Based Splitting:**

```javascript
// Split at route boundaries
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));

Pros:
✅ Natural boundaries (users navigate between pages)
✅ Predictable chunk sizes
✅ Easy to reason about
✅ Aligns with user behavior
✅ Good caching (routes don't change often)
✅ Simple implementation

Cons:
❌ Large route chunks if not further split
❌ All route code loaded at once (even unused parts)
❌ Heavy shared components loaded per route
❌ May still have large bundles if routes are complex

When to use:
- Multi-page applications
- Clear navigation boundaries
- Routes with distinct functionality
- First optimization step (always start here)

Metrics:
├── Implementation time: 1-2 hours
├── Typical savings: 40-60% initial bundle
├── Complexity: Low
└── Maintenance: Easy
```

**Component-Based Splitting:**

```javascript
// Split individual components within pages
const Chart = lazy(() => import('./components/Chart'));
const Editor = lazy(() => import('./components/Editor'));
const Modal = lazy(() => import('./components/Modal'));

Pros:
✅ Fine-grained control
✅ Load only what user interacts with
✅ Better for conditional features
✅ Optimal bundle size
✅ Can combine with route splitting

Cons:
❌ More complex implementation
❌ Risk of over-splitting (too many small chunks)
❌ Potential loading waterfalls
❌ More loading states to manage
❌ Harder to debug

When to use:
- After route splitting is done
- For large, conditional components (>100 KB)
- Features used by <50% of users
- Heavy third-party libraries

Metrics:
├── Implementation time: 1-2 days
├── Typical savings: Additional 20-40%
├── Complexity: Medium
└── Maintenance: Medium
```

**Hybrid Approach (Recommended):**

```javascript
// Combine both strategies ✅
// 1. Split routes (coarse granularity)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));

// 2. Within heavy routes, split large components (fine granularity)
function Reports() {
  const Chart = lazy(() => import('./components/Chart'));
  const DataExporter = lazy(() => import('./features/DataExporter'));

  return (
    <div>
      <h1>Reports</h1>
      <Suspense fallback={<ChartLoader />}>
        {showChart && <Chart />}
      </Suspense>
      <Suspense fallback={null}>
        <DataExporter />
      </Suspense>
    </div>
  );
}

Decision Matrix:
├── Level 1 (Routes): Always split
├── Level 2 (Heavy features in route): Split if >100 KB
├── Level 3 (Conditional UI): Split if usage <50%
└── Level 4 (Small components): Don't split
```

---

**Trade-off 2: Aggressive vs Conservative Splitting**

**Aggressive Splitting:**

```javascript
// Split almost everything ❌
const Button = lazy(() => import('./Button'));
const Input = lazy(() => import('./Input'));
const Header = lazy(() => import('./Header'));
const Footer = lazy(() => import('./Footer'));
const Sidebar = lazy(() => import('./Sidebar'));

// Result: 100+ small chunks

Pros:
✅ Absolute minimum initial bundle
✅ Perfect code-on-demand
✅ Maximum cache granularity
✅ Each component independently deployable

Cons:
❌ Too many HTTP requests (overhead)
❌ Request waterfall (component imports component)
❌ HTTP/2 multiplexing still has limits
❌ Build complexity increases dramatically
❌ Debugging becomes nightmare
❌ Loading states everywhere (poor UX)

Performance Impact:
├── HTTP request overhead: ~50-100ms each
├── 100 chunks × 50ms = 5,000ms overhead!
├── Waterfall effect (serial loading)
└── Worse performance than larger chunks

Example Waterfall:
Page load → Header chunk → Logo chunk → Nav chunk → Button chunk
Total: 200ms + 50ms + 50ms + 50ms + 50ms = 400ms
(vs 220ms for single chunk containing all)
```

**Conservative Splitting:**

```javascript
// Split only routes ✅
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));

// Keep components bundled within routes

Pros:
✅ Simple mental model
✅ Fewer HTTP requests
✅ Predictable performance
✅ Easier debugging
✅ No waterfalls
✅ Fast implementation

Cons:
❌ Larger initial chunks
❌ May load unused code within route
❌ Less cache efficiency
❌ Not optimal for heavy features

Performance Impact:
├── Fewer requests: 5-10 chunks total
├── Larger chunks: 200-400 KB each
├── Predictable load times
└── No waterfall issues

Best for:
- Simple apps (<1 MB total)
- Fast networks
- Quick wins without complexity
```

**Balanced Splitting (Recommended):**

```javascript
// Strategic splitting ✅
// Routes: 5-10 chunks
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));

// Heavy features: 3-5 chunks
const Chart = lazy(() => import('./components/Chart')); // 250 KB
const Editor = lazy(() => import('./components/Editor')); // 500 KB

// Total: 8-15 chunks (manageable)

Decision Rules:
1. Always split routes
2. Split components >100 KB
3. Split features used by <30% users
4. Keep critical path in main bundle
5. Max 20 chunks for maintainability

Performance Impact:
├── Reasonable requests: 8-15 chunks
├── Balanced chunk sizes: 150-400 KB
├── Minimal overhead: <500ms total
└── Good cache efficiency: 70-80%
```

---

**Trade-off 3: Manual vs Automatic Splitting**

**Manual Splitting (React.lazy):**

```javascript
// You explicitly decide what to split
const Dashboard = lazy(() => import('./Dashboard'));
const Chart = lazy(() => import('./Chart'));

Pros:
✅ Full control over boundaries
✅ Intentional split points
✅ Predictable chunk sizes
✅ Easy to understand
✅ Explicit loading states

Cons:
❌ Manual work required
❌ Can forget to split new features
❌ Requires analysis and decisions
❌ Team needs discipline

Code Example:
// Clear, explicit, maintainable
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

**Automatic Splitting (Webpack splitChunks):**

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
      },
    },
  },
};

// Webpack decides splits based on size/usage

Pros:
✅ Zero manual work
✅ Automatically optimized
✅ Adapts to code changes
✅ Good for libraries
✅ No developer decisions needed

Cons:
❌ Less control over boundaries
❌ Unpredictable chunk names
❌ May split incorrectly
❌ Harder to debug splits
❌ Can't optimize based on user behavior

Generated Output:
// 0.chunk.js (mystery contents)
// 1.chunk.js (mystery contents)
// vendors~main.chunk.js (auto-generated)
```

**Hybrid (Recommended):**

```javascript
// Manual for routes and major features
const Dashboard = lazy(() => import('./Dashboard'));

// Automatic for libraries
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react-vendor',
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
        },
      },
    },
  },
};

Benefits:
✅ Control where it matters (routes, features)
✅ Automatic optimization for libraries
✅ Predictable app code splits
✅ Optimized vendor splits
✅ Best of both worlds
```

---

**Trade-off 4: Prefetch vs Pure Lazy Loading**

**Pure Lazy (Load Only When Needed):**

```javascript
const Reports = lazy(() => import('./Reports'));

// Loads when user navigates to /reports
// User sees loading spinner

Pros:
✅ Minimal bandwidth usage
✅ Never load unused features
✅ Best for low-usage features
✅ Good for mobile data savings

Cons:
❌ Visible delay on navigation
❌ Poor UX for expected routes
❌ Network dependency visible
❌ Feels slow

User Experience:
Click Reports → Spinner 500-2000ms → Content
```

**Prefetch (Load During Idle):**

```javascript
const Reports = lazy(() =>
  import(/* webpackPrefetch: true */ './Reports')
);

// Browser loads during idle time after main content
// When user navigates, already cached

Pros:
✅ Feels instant to users
✅ Uses idle network time
✅ No visible delay
✅ Better UX

Cons:
❌ Uses bandwidth for potentially unused features
❌ May compete with other resources
❌ Not good for limited data plans

User Experience:
Click Reports → Content immediately (already loaded)
```

**Intent-Based (Load on Hover):**

```javascript
<Link
  to="/reports"
  onMouseEnter={() => import('./Reports')}
>
  Reports
</Link>

// Loads when user hovers link (~300ms before click)

Pros:
✅ Feels instant (loads during hover)
✅ Only loads when user shows intent
✅ Best UX/bandwidth balance
✅ No wasted bandwidth

Cons:
❌ Manual implementation required
❌ Touch devices need touchstart event
❌ False positives (hover without click)

User Experience:
Hover Reports → Background load → Click → Instant content
```

**Decision Matrix:**

```
Feature Usage | Network Priority | Strategy
--------------|------------------|----------
<20%          | Don't care       | Pure lazy
20-50%        | Care about UX    | Intent-based
50-80%        | Care about UX    | Prefetch
>80%          | Critical         | Include in bundle

Data Sensitivity:
├── Unlimited WiFi → Prefetch aggressively
├── Mobile data → Intent-based or pure lazy
└── Offline support → Service worker caching
```

---

### 💬 Explain to Junior: Advanced Code Splitting Strategies Made Simple

**Simple Analogy: Building vs Streaming a Playlist**

Imagine you're creating a playlist for a road trip:

**Monolithic Bundle (Bad)**:
You download the ENTIRE Spotify library before starting your trip (4.2 million songs, 500 GB). Your phone runs out of space, it takes days to download, and you only listen to 20 songs during the trip.

**Route-Based Splitting (Good)**:
You create different playlists for different parts of the trip:
- Morning playlist (breakfast music)
- Driving playlist (upbeat)
- Evening playlist (relaxing)
- Late night playlist (calm)

You download each playlist **only when you reach that part of the trip**. Much more efficient!

**Component-Based Splitting (Better)**:
Within your "Driving" playlist, you split further:
- Rock songs (load when you want energy)
- Pop songs (load when you want singalongs)
- EDM (load when you want intensity)

You download songs **only when you want that specific mood**.

**Library Splitting (Best)**:
Music streaming services (React libraries) are separate from your playlists (app code). You don't re-download Spotify every time you create a playlist!

---

**Core Concepts for Interviews:**

**1. Three Main Splitting Strategies:**

**Strategy 1: Route-Based Splitting**

```javascript
// Split by page/route
import { lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Admin = lazy(() => import('./pages/Admin'));

<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/products" element={<Products />} />
  <Route path="/admin" element={<Admin />} />
</Routes>
```

**Why this matters**:
- Users might never visit Admin page (only 10% are admins)
- 90% of users save bandwidth by not downloading admin code
- Biggest wins with least effort

**Interview talking point**: "Route-based splitting is the foundation. It's the easiest and highest-impact optimization because it mirrors user behavior - users navigate to different pages, so we load code per page."

---

**Strategy 2: Component-Based Splitting**

```javascript
// Split heavy components within a page
import { lazy, Suspense } from 'react';

const Chart = lazy(() => import('./components/Chart'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => setShowChart(true)}>
        Show Chart
      </button>

      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <Chart data={data} />
        </Suspense>
      )}
    </div>
  );
}
```

**Why this matters**:
- Chart library is 250 KB
- If user never clicks "Show Chart", they never download it
- 50% of users don't view charts → Save 250 KB for half your users

**Interview talking point**: "After route splitting, I look for large conditional components - things like charts, rich text editors, or PDF exporters. If a component is over 100 KB and used by less than 50% of users, it's a good candidate for component-based splitting."

---

**Strategy 3: Library Splitting**

```javascript
// Keep big libraries separate from app code
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        // React in separate chunk
        react: {
          test: /[\\/]node_modules[\\/]react[\\/]/,
          name: 'react-vendor',
        },
        // All other libraries
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
        },
      },
    },
  },
};
```

**Why this matters**:
- React rarely changes (stable library)
- Your app code changes frequently
- If they're separate, users can cache React forever
- Only download your new app code when you deploy

**Interview talking point**: "Library splitting separates third-party code from application code. This improves caching because libraries like React change rarely, so users can cache them long-term, while your app code updates frequently."

---

**2. When to Use Each Strategy**

**Decision Tree (Simple Version):**

```
START: Is this a different page/route?
├── YES → Use route-based splitting (always)
└── NO → Continue to next question

Is the component/feature > 100 KB?
├── YES → Use component-based splitting
└── NO → Continue to next question

Is the component used by < 50% of users?
├── YES → Use component-based splitting
└── NO → Keep it in the bundle
```

**Examples:**

```javascript
// ✅ GOOD: Admin page used by 10% of users
const Admin = lazy(() => import('./pages/Admin'));

// ✅ GOOD: Chart library 250 KB, used conditionally
const Chart = lazy(() => import('./components/Chart'));

// ❌ BAD: Small button component 2 KB, used everywhere
const Button = lazy(() => import('./Button')); // Don't do this!

// ❌ BAD: Header component needed immediately
const Header = lazy(() => import('./Header')); // Don't do this!
```

---

**3. Handling Loading States (Important for UX)**

**Basic Loading:**

```javascript
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>

// User sees "Loading..." while component downloads
// Simple but works
```

**Better Loading (With Skeleton):**

```javascript
<Suspense fallback={<ChartSkeleton />}>
  <Chart data={data} />
</Suspense>

// ChartSkeleton shows an outline/shape of chart
// Better UX - user knows what's coming
```

**Best Loading (With Prefetch):**

```javascript
function ProductLink() {
  const prefetch = () => {
    // Start downloading when user hovers
    import('./ProductDetail');
  };

  return (
    <Link
      to="/product/123"
      onMouseEnter={prefetch}
    >
      View Product
    </Link>
  );
}

// Downloads during hover (~300ms)
// Feels instant when user clicks
// No visible loading state!
```

**Interview talking point**: "I prefer intent-based prefetching for better UX. When users hover over a link, we start downloading the chunk during that hover time. By the time they click, the content is usually ready, making navigation feel instant."

---

**4. Common Patterns and Anti-Patterns**

**Pattern 1: Tab Splitting**

```javascript
const tabs = {
  overview: lazy(() => import('./tabs/Overview')),
  settings: lazy(() => import('./tabs/Settings')),
  analytics: lazy(() => import('./tabs/Analytics')),
};

function TabbedView() {
  const [activeTab, setActiveTab] = useState('overview');
  const TabComponent = tabs[activeTab];

  return (
    <>
      <TabButtons onChange={setActiveTab} />
      <Suspense fallback={<TabLoader />}>
        <TabComponent />
      </Suspense>
    </>
  );
}

// Each tab loads only when clicked
// User viewing only "Overview" never downloads other tabs
```

**Pattern 2: Modal Splitting**

```javascript
function App() {
  const [showModal, setShowModal] = useState(false);
  const Modal = lazy(() => import('./Modal'));

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Open Settings
      </button>

      {showModal && (
        <Suspense fallback={<ModalLoader />}>
          <Modal onClose={() => setShowModal(false)} />
        </Suspense>
      )}
    </>
  );
}

// Modal code only loads when user clicks button
// Modal is 80 KB → Saved for users who never open it
```

**Anti-Pattern 1: Over-Splitting**

```javascript
// ❌ DON'T DO THIS
const Button = lazy(() => import('./Button'));
const Input = lazy(() => import('./Input'));
const Text = lazy(() => import('./Text'));

// Too many tiny chunks
// More HTTP overhead than benefit
// Loading states everywhere
// Poor UX
```

**Anti-Pattern 2: Splitting Critical Components**

```javascript
// ❌ DON'T DO THIS
const Navigation = lazy(() => import('./Navigation'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading nav...</div>}>
        <Navigation />
      </Suspense>
      <Content />
    </div>
  );
}

// Navigation is critical - user sees broken layout during load
// Keep critical components in main bundle
```

---

**5. Real-World Example for Interviews**

**Scenario**: "You're asked to optimize a React dashboard with a 3 MB bundle. How do you approach it?"

**Answer Template**:

"I'd tackle this in three phases:

**Phase 1 - Route Splitting** (Quick wins):
```javascript
// Split all major routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));
const Admin = lazy(() => import('./pages/Admin'));

// Expected savings: 40-50% of bundle (1.2-1.5 MB)
```

**Phase 2 - Component Splitting** (Targeted optimization):
```javascript
// Analyze which features are heavy but rarely used
// Bundle analyzer shows: Chart library 400 KB, used in Reports only
const Chart = lazy(() => import('./components/Chart'));

// Expected savings: Additional 400 KB for users not viewing charts
```

**Phase 3 - Library Optimization** (Polish):
```javascript
// Replace heavy libraries with lighter alternatives
// moment.js (288 KB) → date-fns (14 KB)
import { format } from 'date-fns';

// Configure Webpack to split vendors
// Expected savings: Better caching, faster updates
```

**Final result**: Main bundle reduced from 3 MB to ~600 KB (80% reduction), with chunks for individual features."

---

**6. Key Metrics to Discuss in Interviews**

When discussing code splitting, always mention these metrics:

```javascript
// Bundle size
Before: 3.2 MB
After: 640 KB main bundle + on-demand chunks
Savings: 80% reduction in initial load

// Performance
Time to Interactive: 12s → 3s (75% faster)
First Contentful Paint: 6s → 1.8s (70% faster)
Lighthouse Score: 35 → 88

// User impact
Bounce rate: 48% → 19% (60% reduction)
Mobile users: Especially benefit (3G/4G)
International users: 70% faster load times
```

---

**7. Interview Red Flags to Avoid**

❌ "I split every component into lazy chunks"
✅ "I strategically split routes and heavy features, keeping critical components in the main bundle"

❌ "Code splitting always improves performance"
✅ "Code splitting improves performance when done strategically, but over-splitting can actually hurt performance due to HTTP overhead"

❌ "React.lazy is all you need"
✅ "React.lazy handles component splitting, but you also need Webpack splitChunks for vendor splitting, error boundaries for failure handling, and prefetching for better UX"

---

**Summary for Interviews:**

**Three strategies**:
1. Route-based (always start here)
2. Component-based (for heavy/conditional features)
3. Library splitting (for better caching)

**Decision criteria**:
- Split if >100 KB OR used by <50% of users
- Don't split critical components
- Don't over-split small components

**Implementation**:
- React.lazy + Suspense for app code
- Webpack splitChunks for libraries
- Error boundaries for failures
- Prefetching for better UX

**Metrics matter**:
- Bundle size reduction
- Performance improvements (TTI, FCP)
- User impact (bounce rate, conversion)
