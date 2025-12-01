# Code Splitting and Dynamic Imports

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Google, Meta, Amazon, Netflix, Stripe, Figma
**Time:** 45-60 minutes

---

## Problem Statement

Implement a modern code splitting strategy to reduce initial bundle size and improve Time to Interactive (TTI) in a React application. The application should load only the code needed for the current route, feature, or component, with proper preloading strategies for frequently accessed features.

### Requirements

- ✅ Implement route-based code splitting
- ✅ Implement component-based (lazy) code splitting
- ✅ Handle Suspense boundaries and error states
- ✅ Optimize library/vendor code splitting
- ✅ Add webpack magic comments for chunk naming and prefetch/preload
- ✅ Measure bundle size reduction and performance improvement
- ✅ Implement prefetch and preload strategies
- ✅ Handle loading states gracefully
- ✅ Support TypeScript with lazy components
- ✅ Identify and fix common splitting mistakes

---

## Real-World Metrics: Before vs After

### Before Code Splitting
```
┌─────────────────────────────────────┐
│ Single Bundle: 1.2 MB               │
├─────────────────────────────────────┤
│ Main.js (500 KB)                    │
│  - React + React-DOM (150 KB)       │
│  - Router logic (80 KB)             │
│  - All routes (dashboard, admin,    │
│    profile, analytics - 200 KB)     │
│  - All UI components (70 KB)        │
│                                     │
│ Vendors.js (450 KB)                 │
│  - lodash, date-fns, chart.js, etc  │
│                                     │
│ Styles.css (250 KB)                 │
└─────────────────────────────────────┘

Initial Load Metrics:
- Time to Interactive: 3200ms (BAD)
- First Contentful Paint: 1800ms
- Largest Contentful Paint: 2400ms
- First Input Delay: 450ms (user frustrated)
```

### After Code Splitting
```
┌──────────────────────────────────────┐
│ Initial (Main Route Only)            │
├──────────────────────────────────────┤
│ main~[hash].js (150 KB) - 87% smaller│
│  - React + Router core (80 KB)       │
│  - Current route code (50 KB)        │
│  - Critical UI (20 KB)               │
│                                      │
│ vendors~[hash].js (120 KB) - 73%↓   │
│  - Only used dependencies            │
│                                      │
│ styles~[hash].css (60 KB) - 76%↓    │
│  - Critical CSS only                 │
└──────────────────────────────────────┘

│ Lazy Chunks (loaded on demand)       │
├──────────────────────────────────────┤
│ admin.chunk.js (280 KB) - prefetch  │
│ dashboard.chunk.js (320 KB) - lazy  │
│ analytics.chunk.js (150 KB) - lazy  │
│ charts.chunk.js (200 KB) - prefetch │
└──────────────────────────────────────┘

Initial Load Metrics:
- Time to Interactive: 900ms (72% faster!)
- First Contentful Paint: 450ms
- Largest Contentful Paint: 650ms
- First Input Delay: 80ms (smooth 60fps)

Route Navigation (lazy chunks):
- Admin route load: 200ms (already cached/prefetched)
- Dashboard: 150ms (prefetch during idle)
- Analytics: 280ms (lazy load on first access)
```

### Real Memory Impact
```
Page Load Before Splitting:
- Parse & Compile: 850ms
- Memory Used: 85 MB
- CPU % during load: 87%

Page Load After Splitting:
- Parse & Compile: 220ms (74% faster)
- Memory Used: 25 MB (70% less!)
- CPU % during load: 35%
- Remaining chunks loaded async: 500ms over 3-4 seconds
```

---

## Solution 1: Basic Route-Based Code Splitting

### Setup with React Router

```jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load route components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));

// Loading fallback component
function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <div className="spinner">Loading...</div>
    </div>
  );
}

// Error boundary for chunk loading failures
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chunk loading failed:', error, errorInfo);
    // Send to error tracking service
    reportErrorToService(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Failed to load page</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
```

**Bundle Result:**
```
✅ Main chunk: 180 KB (was 1200 KB)
✅ Dashboard chunk: 120 KB (lazy loaded)
✅ Admin chunk: 280 KB (lazy loaded)
✅ Analytics chunk: 150 KB (lazy loaded)
✅ Profile chunk: 95 KB (lazy loaded)

Initial Load:
- 180 KB (60% reduction!)
- TTI: 1200ms (down from 3200ms)
- No blocking JavaScript on other routes
```

**Time Complexity:** O(n) for n lazy routes
**Space Complexity:** O(n) for n chunks in memory

---

## Solution 2: Component-Level Code Splitting with Webpack Magic Comments

```jsx
import React, { Suspense, lazy } from 'react';

// Webpack magic comments for better control
const HeavyChart = lazy(() =>
  import(
    /* webpackChunkName: "charts" */
    /* webpackPrefetch: true */
    './components/HeavyChart'
  )
);

const ImageEditor = lazy(() =>
  import(
    /* webpackChunkName: "editor" */
    /* webpackPreload: true */
    './components/ImageEditor'
  )
);

const DataGrid = lazy(() =>
  import(
    /* webpackChunkName: "datagrid" */
    /* webpackPriority: "high" */
    './components/DataGrid'
  )
);

const ChatWidget = lazy(() =>
  import(
    /* webpackChunkName: "chat" */
    /* webpackPrefetch: true */
    './components/ChatWidget'
  )
);

// Lazy with retry logic (handle network failures)
function lazyWithRetry(componentImport, retries = 3) {
  return lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        if (i === retries - 1) throw error;
        // Exponential backoff: 200ms, 400ms, 800ms
        await new Promise(resolve =>
          setTimeout(resolve, 200 * Math.pow(2, i))
        );
      }
    }
  });
}

const ReportBuilder = lazyWithRetry(() =>
  import(
    /* webpackChunkName: "reports" */
    './components/ReportBuilder'
  )
);

// Usage in component
function Dashboard() {
  const [showChart, setShowChart] = React.useState(false);
  const [showGrid, setShowGrid] = React.useState(false);

  return (
    <div>
      <h1>Dashboard</h1>

      <button onClick={() => setShowChart(true)}>
        Load Chart
      </button>

      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <HeavyChart />
        </Suspense>
      )}

      <button onClick={() => setShowGrid(true)}>
        Load Data Grid
      </button>

      {showGrid && (
        <Suspense fallback={<div>Loading grid...</div>}>
          <DataGrid />
        </Suspense>
      )}
    </div>
  );
}

export default Dashboard;
```

**Webpack Magic Comments Explained:**

```javascript
import(
  /* webpackChunkName: "name" */           // Named chunk (instead of [number])
  /* webpackPreload: true */               // Preload during parent chunk load
  /* webpackPrefetch: true */              // Prefetch during browser idle
  /* webpackPriority: "high" */            // Priority for preload
  './module'
)

// Resulting chunks:
// - name.chunk.js (named)
// - name.preload.js (loaded immediately with parent)
// - name.prefetch.js (loaded during idle time)
```

**Magic Comments Behavior:**

| Comment | When? | Use Case |
|---------|-------|----------|
| `webpackPreload` | During parent chunk load | Critical components needed soon |
| `webpackPrefetch` | During browser idle (after main render) | Components likely to be used |
| Neither | On first interaction | Components rarely used |

---

## Solution 3: Advanced Library Code Splitting

### Problem: All dependencies bundled together

```javascript
// ❌ BAD: Everything in one bundle
import _ from 'lodash';              // 70 KB (full library)
import moment from 'moment';         // 65 KB
import { Chart } from 'chart.js';    // 180 KB
import * as d3 from 'd3';            // 240 KB
```

### Solution: Smart library splitting with dynamic imports

```jsx
// ✅ GOOD: Load libraries only when needed

// Utility function for lazy library loading
function lazyLibrary(importFunc, fallback = null) {
  let cachedModule = null;

  return async function() {
    if (!cachedModule) {
      try {
        cachedModule = await importFunc();
      } catch (error) {
        console.error('Failed to load library:', error);
        if (fallback) return fallback;
        throw error;
      }
    }
    return cachedModule;
  };
}

// Lazy load utility libraries
const loadLodash = lazyLibrary(() =>
  import(
    /* webpackChunkName: "lodash" */
    'lodash'
  )
);

const loadDateFns = lazyLibrary(() =>
  import(
    /* webpackChunkName: "date-fns" */
    'date-fns'
  )
);

const loadChartJs = lazyLibrary(() =>
  import(
    /* webpackChunkName: "charts" */
    'chart.js'
  )
);

// Usage in utilities
export async function sortData(data, key) {
  const lodash = await loadLodash();
  return lodash.sortBy(data, key);
}

export async function formatDate(date, format) {
  const dateFns = await loadDateFns();
  return dateFns.format(date, format);
}

// In React component - manual chunk loading
function AdvancedReporting() {
  const [chartData, setChartData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleRenderChart = async () => {
    setLoading(true);
    try {
      // Load library only when user clicks
      const ChartModule = await loadChartJs();
      const Chart = ChartModule.Chart;

      const ctx = document.getElementById('myChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: { /* ... */ },
        options: { /* ... */ }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleRenderChart} disabled={loading}>
        {loading ? 'Loading...' : 'Show Advanced Chart'}
      </button>
      <canvas id="myChart"></canvas>
    </div>
  );
}

export default AdvancedReporting;
```

**Bundle Comparison:**

```
❌ WITHOUT splitting (all libraries):
main.js: 1100 KB
- lodash: 70 KB (always loaded)
- date-fns: 65 KB (always loaded)
- chart.js: 180 KB (always loaded)
- d3: 240 KB (always loaded)

✅ WITH splitting (lazy libraries):
main.js: 550 KB (50% reduction!)
- lodash: 70 KB (loaded on demand)
- date-fns: 65 KB (loaded on demand)
- charts.js: 180 KB (loaded on demand)
- d3.js: 240 KB (loaded on demand)

Initial load: 550 KB instead of 1100 KB!
```

---

## Solution 4: TypeScript Support with Lazy Components

```typescript
import React, { Suspense, lazy, ComponentType } from 'react';

// Type-safe lazy loading
function lazyLoad<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback: React.ReactNode = null
) {
  const Component = lazy(importFunc);

  return (props: P) => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <Component {...props} />
    </Suspense>
  );
}

// Example usage with TypeScript
interface ChartProps {
  data: number[];
  title: string;
}

// Lazy load with proper typing
const LazyChart = lazyLoad<ChartProps>(
  () => import('./components/Chart'),
  <div>Loading chart...</div>
);

function Dashboard() {
  return (
    <div>
      <LazyChart data={[1, 2, 3]} title="Sales" />
    </div>
  );
}

// Advanced: Route-based splitting with types
import { RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
  {
    path: '/',
    element: lazy(() => import('./pages/Home')),
    errorElement: <ErrorFallback />,
  },
  {
    path: '/admin',
    element: lazy(() => import('./pages/Admin')),
  },
];
```

---

## Solution 5: Prefetch and Preload Strategies

### Intelligent Prefetching Based on User Behavior

```jsx
import { useEffect, useRef } from 'react';

/**
 * Hook: Prefetch chunks based on user interaction patterns
 * Prefetch happens during browser idle time (requestIdleCallback)
 */
function usePrefetch() {
  // Load charts when user hovers over "Analytics" button
  const analyticsBtnRef = useRef(null);

  useEffect(() => {
    const btnElement = analyticsBtnRef.current;
    if (!btnElement) return;

    const handleMouseEnter = () => {
      // Prefetch the analytics chunk
      if (document.readyState === 'complete') {
        // Browser is idle
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'script';
        link.href = '/static/js/analytics.chunk.js';
        document.head.appendChild(link);
      }
    };

    btnElement.addEventListener('mouseenter', handleMouseEnter);
    return () => btnElement.removeEventListener('mouseenter', handleMouseEnter);
  }, []);

  return { analyticsBtnRef };
}

/**
 * Manual prefetch with priority
 */
function prefetchChunk(chunkName, priority = 'low') {
  // Only prefetch if it will actually be used
  const link = document.createElement('link');
  link.rel = priority === 'high' ? 'preload' : 'prefetch';
  link.as = 'script';
  link.href = `/static/js/${chunkName}.chunk.js`;
  document.head.appendChild(link);
}

/**
 * Route prediction: Prefetch likely next routes
 */
function usePredictiveRouting() {
  const handlePrediction = (currentRoute) => {
    const routePredictions = {
      '/dashboard': ['/analytics', '/reports'],    // From dashboard, users go to analytics
      '/admin': ['/admin/users', '/admin/settings'], // From admin, users go to sub-routes
      '/profile': ['/settings'],                    // From profile, users go to settings
    };

    const nextRoutes = routePredictions[currentRoute] || [];

    // Prefetch with lower priority
    nextRoutes.forEach((route) => {
      prefetchChunk(route, 'low');
    });
  };

  return { handlePrediction };
}

/**
 * Real example: E-commerce prefetch strategy
 */
function EcommerceApp() {
  const [currentRoute, setCurrentRoute] = useState('/');

  useEffect(() => {
    // Prefetch strategy based on user journey
    const prefetchStrategy = {
      '/products': () => {
        // User browsing products → likely to view product detail
        prefetchChunk('product-detail', 'high');
        // User might add to cart
        prefetchChunk('cart', 'medium');
      },
      '/cart': () => {
        // In cart → likely to checkout
        prefetchChunk('checkout', 'high');
        // Might want to continue shopping
        prefetchChunk('products', 'low');
      },
      '/checkout': () => {
        // At checkout → will need payment
        prefetchChunk('payment', 'high');
        // Might need address validation
        prefetchChunk('address-validator', 'medium');
      },
    };

    const strategy = prefetchStrategy[currentRoute];
    if (strategy) {
      strategy();
    }
  }, [currentRoute]);

  return (
    <div>
      {/* App content */}
    </div>
  );
}

export default EcommerceApp;
```

---

## Solution 6: Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js', // Named chunks
    clean: true,
  },

  optimization: {
    moduleIds: 'deterministic', // Consistent chunk IDs
    runtimeChunk: 'single',      // Extract runtime into separate chunk

    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Separate vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },

        // Separate React
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react-vendors',
          priority: 20,
          reuseExistingChunk: true,
        },

        // Common code between chunks
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          name: 'common',
        },

        // Large heavy libraries
        charts: {
          test: /[\\/]node_modules[\\/](chart\.js|d3)[\\/]/,
          name: 'charts',
          priority: 15,
          minSize: 50000,
          reuseExistingChunk: true,
        },
      },
    },
  },

  performance: {
    hints: 'warning',
    maxEntrypointSize: 300000,  // Main chunk < 300KB
    maxAssetSize: 300000,        // Each chunk < 300KB
  },
};
```

**Resulting Output:**

```
dist/
├── runtime.[hash].js           (10 KB)
├── vendors.[hash].chunk.js     (120 KB)
├── react-vendors.[hash].js     (85 KB)
├── main.[hash].js              (95 KB) - Initial bundle
├── dashboard.[hash].chunk.js   (120 KB)
├── admin.[hash].chunk.js       (280 KB)
└── charts.[hash].chunk.js      (180 KB)

Initial Load: 310 KB (runtime + vendors + react + main)
Lazy chunks: Loaded on demand
```

---

## Real-World Test Cases

```javascript
describe('Code Splitting', () => {

  test('lazy component loads only when rendered', async () => {
    const { container } = render(
      <Suspense fallback={<div>Loading</div>}>
        <LazyComponent />
      </Suspense>
    );

    // Initially shows loading
    expect(container.textContent).toContain('Loading');

    // After component loads
    await waitFor(() => {
      expect(container.textContent).not.toContain('Loading');
    });
  });

  test('handles chunk loading errors gracefully', async () => {
    // Mock failed chunk load
    jest.spyOn(require, 'ensure').mockRejectedValueOnce(
      new Error('Failed to load chunk')
    );

    const { container } = render(
      <ErrorBoundary>
        <Suspense fallback={<div>Loading</div>}>
          <LazyComponent />
        </Suspense>
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Failed to load');
    });
  });

  test('reuses same module instance across imports', async () => {
    const { default: firstImport } = await import('./module');
    const { default: secondImport } = await import('./module');

    expect(firstImport).toBe(secondImport); // Same instance
  });

  test('prefetch creates link element', () => {
    prefetchChunk('dashboard');

    const link = document.querySelector('link[rel="prefetch"]');
    expect(link).toBeTruthy();
    expect(link.href).toContain('dashboard');
  });

  test('multiple lazy components load independently', async () => {
    const { container } = render(
      <>
        <Suspense fallback={<div>Loading A</div>}>
          <LazyComponentA />
        </Suspense>
        <Suspense fallback={<div>Loading B</div>}>
          <LazyComponentB />
        </Suspense>
      </>
    );

    // Both load independently
    await waitFor(() => {
      expect(container.textContent).not.toContain('Loading');
    });
  });
});
```

---

## Common Mistakes

### ❌ Mistake 1: Lazy Loading Too Aggressively

```javascript
// ❌ BAD: Every tiny component is lazy
const Button = lazy(() => import('./Button'));
const Text = lazy(() => import('./Text'));
const Spacer = lazy(() => import('./Spacer'));
const Icon = lazy(() => import('./Icon'));

// Creates 4 extra chunks, adds overhead!
// Chunk loading cost > component size
```

### ✅ Correct: Only lazy load when necessary

```javascript
// ✅ GOOD: Only heavy components are lazy
const ReportBuilder = lazy(() => import('./ReportBuilder')); // 180 KB
const DataVisualization = lazy(() => import('./DataViz'));    // 220 KB
const AdvancedEditor = lazy(() => import('./Editor'));        // 150 KB

// Keep small components in main bundle
import Button from './Button';       // 2 KB
import Text from './Text';           // 1 KB
```

**Rule of Thumb:** Lazy load components > 30-50 KB only

---

### ❌ Mistake 2: Lazy + Debounce = Waterfall Loading

```javascript
// ❌ BAD: Creates loading waterfall
const Component1 = lazy(() => import('./C1'));
const Component2 = lazy(() => import('./C2'));

function Parent() {
  const [show, setShow] = useState(false);

  return (
    <button onClick={() => setShow(true)}>Show</button>
    {show && (
      <Suspense fallback={<div>Loading C1...</div>}>
        <Component1 />
        <Suspense fallback={<div>Loading C2...</div>}>
          <Component2 /> {/* Waits for C1 to load first! */}
        </Suspense>
      </Suspense>
    )}
  );
}

// Loading sequence:
// Button click → Load C1 chunk → Wait 200ms
// C1 renders → Load C2 chunk → Wait 200ms
// Total: 400ms for both!
```

### ✅ Correct: Parallel loading with separate Suspense

```javascript
// ✅ GOOD: Loads components in parallel
const Component1 = lazy(() => import('./C1'));
const Component2 = lazy(() => import('./C2'));

function Parent() {
  const [show, setShow] = useState(false);

  return (
    <button onClick={() => setShow(true)}>Show</button>
    {show && (
      <>
        <Suspense fallback={<div>Loading C1...</div>}>
          <Component1 />
        </Suspense>
        <Suspense fallback={<div>Loading C2...</div>}>
          <Component2 /> {/* Loads simultaneously with C1 */}
        </Suspense>
      </>
    )}
  );
}

// Loading sequence:
// Button click → Load C1 + C2 in parallel
// Both load at ~200ms (not 400ms!)
```

---

### ❌ Mistake 3: Forgetting to Preload Critical Routes

```javascript
// ❌ BAD: No preloading
const AdminPanel = lazy(() => import('./Admin'));

function App() {
  const [route, setRoute] = useState('dashboard');

  return (
    <Routes>
      <Route path="/admin" element={<AdminPanel />} />
      {/* First time admin route loaded = 500ms delay */}
    </Routes>
  );
}

// User navigates to /admin
// → Chunk starts loading
// → User waits 500ms
// → Admin panel appears
```

### ✅ Correct: Preload likely routes during idle

```javascript
// ✅ GOOD: Preload admin panel during idle
const AdminPanel = lazy(() =>
  import(
    /* webpackChunkName: "admin" */
    /* webpackPreload: true */
    './Admin'
  )
);

function App() {
  useEffect(() => {
    // Preload after initial render completes
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Chunk already loaded by webpack preload hint
      });
    }
  }, []);

  return (
    <Routes>
      <Route path="/admin" element={<AdminPanel />} />
      {/* Admin panel loads instantly - already preloaded! */}
    </Routes>
  );
}

// User navigates to /admin
// → Chunk already loaded during idle
// → Admin panel appears instantly
```

---

### ❌ Mistake 4: Suspense Fallback Too Heavy

```javascript
// ❌ BAD: Fallback is heavier than actual component
const DataGrid = lazy(() => import('./DataGrid'));

function Page() {
  return (
    <Suspense fallback={
      <div>
        <SkeletonTable rows={50} /> {/* 50 rows of skeleton loading! */}
        <SkeletonChart /> {/* Extra charts */}
        <SkeletonChart />
      </div>
    }>
      <DataGrid />
    </Suspense>
  );
}

// Fallback HTML is bigger than the actual component!
```

### ✅ Correct: Minimal, lightweight fallback

```javascript
// ✅ GOOD: Simple loading state
const DataGrid = lazy(() => import('./DataGrid'));

function Page() {
  return (
    <Suspense fallback={
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    }>
      <DataGrid />
    </Suspense>
  );
}

// Fallback is < 2KB
// Actual component is 150KB
// Good tradeoff!
```

---

## Performance Monitoring

### Measuring Code Splitting Impact

```javascript
import { reportWebVitals } from 'web-vitals';

// Measure chunk loading performance
function measureChunkLoading() {
  const chunkLoadingMetrics = {};

  // Observe chunk scripts
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('.chunk.js')) {
        const chunkName = entry.name.split('/').pop();
        chunkLoadingMetrics[chunkName] = {
          duration: entry.duration,
          size: entry.transferSize,
          downloadTime: entry.transferSize / (1024 * 100), // Estimate
        };

        console.log(`Chunk "${chunkName}" loaded:`, {
          duration: `${entry.duration.toFixed(0)}ms`,
          size: `${(entry.transferSize / 1024).toFixed(1)} KB`,
        });
      }
    }
  });

  observer.observe({ entryTypes: ['resource'] });
  return chunkLoadingMetrics;
}

// Log web vitals
reportWebVitals((metric) => {
  console.log('Web Vital:', metric);
  // Send to analytics service
  if (metric.value > 2500 && metric.name === 'LCP') {
    console.warn('⚠️  LCP is slow - check code splitting!');
  }
});

// Example output
measureChunkLoading();
// ✓ Chunk "admin.chunk.js" loaded: 320 KB, 480ms
// ✓ Chunk "charts.chunk.js" loaded: 210 KB, 310ms
// ✓ Chunk "analytics.chunk.js" loaded: 150 KB, 220ms
```

---

## Bundle Analysis Tools

### Using source-map-explorer

```bash
npm install --save-dev source-map-explorer

# Generate bundle analysis
npm run build
npx source-map-explorer 'build/static/js/main.*.js'
```

### Using webpack-bundle-analyzer

```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static', // Generate HTML file
      reportFilename: 'bundle-report.html',
      openAnalyzer: false, // Don't auto-open in browser
    })
  ]
};
```

### CLI to check bundle size

```bash
npm run build
npx webpack-bundle-analyzer dist/stats.json

# Output example:
# ├─ main.js (320 KB)
# │  ├─ react (150 KB)
# │  ├─ router (40 KB)
# │  └─ app code (130 KB)
# ├─ admin.chunk.js (280 KB)
# ├─ charts.chunk.js (210 KB)
# └─ vendors.js (120 KB)
```

---

## Interview Answer Template

**Question: "Explain code splitting and why it's important"**

**Answer Structure:**

"Code splitting is a technique where you divide a large JavaScript bundle into smaller chunks that load only when needed.

**Why it matters:**
- Reduces initial bundle size (usually by 60-80%)
- Improves Time to Interactive (TTI) - how fast users can interact with the page
- Better caching - if admin code changes, user code cache stays valid
- Reduces memory usage - only loaded code stays in memory

**How it works:**
1. Route-based splitting: Different routes load different chunks
2. Component-based splitting: Lazy load heavy components
3. Library splitting: Load large libraries only when needed

**Real metrics:**
I recently saw a case where initial bundle went from 1.2 MB to 350 KB, and TTI improved from 3.2 seconds to 900ms - a 3.5x improvement.

**Implementation:**
In React, I use React.lazy() and Suspense for component splitting, and webpack magic comments for prefetch/preload hints. For routes, React Router's lazy loading is standard.

**Common pitfalls:**
- Over-splitting (too many tiny chunks)
- Forgetting preload/prefetch hints
- No error handling for chunk load failures
- Suspense fallbacks that are too heavy"

---

## Follow-up Questions

1. **"What's the difference between prefetch and preload?"**
   - `preload`: Load resource now (higher priority)
   - `prefetch`: Load during idle time (lower priority)

2. **"How would you measure if code splitting is actually helping?"**
   - Monitor bundle size (webpack-bundle-analyzer)
   - Track TTI and FCP with web vitals
   - Check Real User Monitoring (RUM) data
   - Monitor chunk loading times in performance tab

3. **"What happens if a chunk fails to load?"**
   - Use Error Boundary to catch chunk errors
   - Implement retry logic with exponential backoff
   - Show user-friendly error message
   - Provide reload button

4. **"Can you lazy load with SSR?"**
   - React 18+ supports Suspense on server
   - Use `lazy()` with dynamic imports
   - Chunks stream to client as they render
   - Requires server-side streaming

5. **"How to optimize which chunks to prefetch?"**
   - Analyze user journey data
   - Use ML to predict next route
   - A/B test different prefetch strategies
   - Monitor prefetch hit rates vs unnecessary downloads

---

## Resources

- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Bundle Analysis Tools](https://webpack.js.org/plugins/bundle-analyzer/)
- [Dynamic Imports (ES2020)](https://tc39.es/proposal-dynamic-import/)
- [requestIdleCallback API](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)

---

[← Back to Performance Challenges](./README.md)
