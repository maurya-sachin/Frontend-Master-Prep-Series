# React Build Optimization

> **Focus**: Webpack/Vite optimization, bundle analysis, and build performance

---

## Question 1: How do you optimize React bundle size?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 12-15 minutes
**Companies:** Meta, Google, Netflix, Amazon, Microsoft

### Question

What strategies can you use to reduce React bundle size? How do you implement tree-shaking, code splitting, and dependency optimization? What tools help analyze bundle composition?

### Answer

**Bundle Optimization Strategies:**

1. **Tree-Shaking** - Remove unused code at build time using ES modules
2. **Code Splitting** - Split bundle into chunks loaded on-demand (route-based, component-based)
3. **Dynamic Imports** - Load modules conditionally using `import()` syntax
4. **Dependency Analysis** - Identify and remove unused/duplicate dependencies
5. **Minification** - Compress code using Terser or esbuild
6. **Compression** - Gzip/Brotli compression at runtime
7. **Source Maps** - Optional production source maps
8. **Vendor Splitting** - Separate third-party code from app code
9. **Lazy Loading** - Load components/routes when needed
10. **Library Alternatives** - Use lighter alternatives (date-fns vs moment, preact vs react)

**Bundle Analysis Workflow:**
- Run webpack-bundle-analyzer to visualize dependencies
- Identify large libraries taking excessive space
- Check for duplicate dependencies (npm dedupe)
- Monitor bundle size in CI/CD pipeline
- Set bundle size budgets to prevent regression

### Code Example

```javascript
// ============================================
// 1. DYNAMIC IMPORTS (Code Splitting)
// ============================================

// ❌ Bad: Load everything upfront
import HeavyReport from './components/HeavyReport';
import Analytics from './components/Analytics';

function Dashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div>
      {tab === 'report' && <HeavyReport />}
      {tab === 'analytics' && <Analytics />}
    </div>
  );
}

// ✅ Good: Load on demand
import { lazy, Suspense } from 'react';

const HeavyReport = lazy(() => import('./components/HeavyReport'));
const Analytics = lazy(() => import('./components/Analytics'));

function Dashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div>
      <Suspense fallback={<Spinner />}>
        {tab === 'report' && <HeavyReport />}
        {tab === 'analytics' && <Analytics />}
      </Suspense>
    </div>
  );
}


// ============================================
// 2. WEBPACK CONFIGURATION
// ============================================

module.exports = {
  mode: 'production',

  entry: './src/index.js',

  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    path: path.resolve(__dirname, 'dist'),
  },

  optimization: {
    // Tree-shaking: Remove unused code
    usedExports: true,

    // Minification
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: true },
          format: { comments: false },
        },
      }),
    ],

    // Split vendor and app code
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          name: 'common',
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react-vendor',
          priority: 20,
        },
      },
    },
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new BundleAnalyzerPlugin(),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),
  ],
};


// ============================================
// 3. PACKAGE.JSON OPTIMIZATION
// ============================================

{
  "dependencies": {
    // ❌ Bad: moment.js is 67KB
    "moment": "^2.29.0",

    // ✅ Good: date-fns is 13KB (5x smaller)
    "date-fns": "^2.30.0"
  }
}

// In code:
import { format } from 'date-fns';
// Only imported functions are included (tree-shaked)


// ============================================
// 4. WEBPACK BUNDLE ANALYZER
// ============================================

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html',
      generateStatsFile: true,
      statsFilename: 'stats.json',
    }),
  ],
};

// Run: webpack --mode production
// Output: Opens interactive bundle visualization


// ============================================
// 5. VITE OPTIMIZATION
// ============================================

// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-library': ['@mui/material'],
          'utils': ['lodash-es', 'date-fns'],
        },
      },
    },

    // Minify configuration
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // Output analysis
    reportCompressedSize: true,
  },
});


// ============================================
// 6. IMPORT OPTIMIZATION
// ============================================

// ❌ Bad: Imports entire library even if using 1 function
import _ from 'lodash';
const reversed = _.reverse(arr);
// Includes 30KB of lodash

// ✅ Good: Named imports for tree-shaking
import { reverse } from 'lodash-es';
const reversed = reverse(arr);
// Only 1KB included

// ✅ Better: Direct import (10x smaller)
import reverse from 'lodash-es/reverse';
const reversed = reverse(arr);
// 0.5KB


// ============================================
// 7. CONDITIONAL IMPORTS
// ============================================

// ❌ Bad: Includes dev-only code in production
import devTools from './dev-tools'; // 50KB

function App() {
  if (process.env.NODE_ENV === 'development') {
    devTools.init();
  }
  return <div>App</div>;
}

// ✅ Good: Tree-shake dev-only code
if (process.env.NODE_ENV === 'development') {
  require('./dev-tools'); // Only included in dev build
}

// ✅ Better: Dynamic import
async function initDevTools() {
  if (process.env.NODE_ENV === 'development') {
    const devTools = await import('./dev-tools');
    devTools.init();
  }
}


// ============================================
// 8. ROUTE-BASED CODE SPLITTING
// ============================================

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));

// Each route = separate bundle chunk
// Loaded only when user navigates there

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}


// ============================================
// 9. PACKAGE ANALYSIS SCRIPT
// ============================================

// npm-check-updates: Find unused dependencies
npm outdated
npm prune  // Remove unused packages

// analyze-size: Detailed breakdown
npx package-size react react-dom lodash

// depcheck: Find unused imports
npx depcheck --ignores @types/node

// Output analysis:
// react: 42KB (gzipped)
// react-dom: 39KB (gzipped)
// lodash: 24KB (unused 15KB)


// ============================================
// 10. CI/CD BUNDLE SIZE MONITORING
// ============================================

// .github/workflows/bundle-check.yml
name: Bundle Size Check
on: [pull_request]

jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build
        run: npm run build

      - name: Analyze
        run: |
          size=$(stat --printf="%s" dist/main.*.js | awk '{print $1 / 1024}')
          echo "Bundle size: ${size}KB"

          if (( $(echo "$size > 500" | bc -l) )); then
            echo "Bundle too large (> 500KB)"
            exit 1
          fi

      - name: Generate Report
        run: webpack-bundle-analyzer dist/stats.json

      - name: Upload to PR
        uses: actions/upload-artifact@v3
        with:
          name: bundle-report
          path: dist/bundle-report.html
```

### Resources
- [Webpack: Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Vite: Build Optimization](https://vitejs.dev/guide/build.html)
- [Web.dev: JavaScript optimizations](https://web.dev/javascript/)
- [MDN: Using the Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

---

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**Tree-Shaking Mechanics:**

Tree-shaking requires ES modules (import/export, not CommonJS). Webpack's DCE (Dead Code Elimination) analyzes dependency graph:

1. **Mark** - Webpack marks exported symbols
2. **Analyze** - Tracks which exports are actually used
3. **Eliminate** - Removes unused exports
4. **Minify** - Terser removes dead code blocks

**Example:**
```javascript
// math.js
export function add(a, b) { return a + b; }  // Used
export function subtract(a, b) { return a - b; }  // Unused

// app.js
import { add } from './math';  // Only add imported
console.log(add(2, 3));

// Webpack analysis:
// subtract() never referenced → marked for removal
// Terser removes: "export function subtract..."
```

**Bundle Size Formula:**
```
Final Size = (Source Code + Dependencies) - (Unused Code) - (Compression)
           = Base JS - Tree-shaken - (Gzip/Brotli)

Example:
- React: 42KB (gzipped 13KB)
- Redux: 8KB (gzipped 2KB)
- Lodash: 24KB (gzipped 4KB, but 70% unused)
  → With tree-shaking: 7KB (gzipped 1.5KB)

Total: 74KB → 20.5KB final (4x smaller)
```

**Webpack vs Vite Performance:**

| Aspect | Webpack | Vite |
|--------|---------|------|
| **Dev Speed** | Slow (bundles everything) | Fast (ESM, lazy loading) |
| **Build Time** | 20-40s (small app) | 2-5s (smaller bundler) |
| **Bundle Size** | Optimized if configured | Similar to Webpack |
| **Config** | Complex (100+ lines) | Simple (10-20 lines) |
| **Ecosystem** | Huge (loaders, plugins) | Growing |

**Code Splitting Strategies:**

1. **Route-Based**: Separate chunk per route (fastest apparent load)
   - Home: 45KB
   - Dashboard: 120KB
   - Settings: 35KB
   - Users only load current route

2. **Component-Based**: Split heavy components
   - Large grids, editors, modals
   - Load when mounted or on-demand

3. **Vendor Splitting**: React, libraries separate
   - Browsers cache vendor bundles longer
   - App code updates without redownloading React

4. **Threshold-Based**: Split chunks > 50KB
   - Prevents any single chunk from being too large
   - Webpack can auto-split on file size

**Compression Algorithms:**

- **Gzip** - Standard HTTP compression
  - JavaScript: 60-70% reduction
  - CSS: 70-80% reduction
  - Browser support: 99%+

- **Brotli** - Newer, better compression
  - JavaScript: 65-75% reduction
  - CSS: 75-85% reduction
  - Browser support: 85%+ (modern browsers)

- **Strategy**: Serve both, let browser choose
  - Gzip: ~20KB for 50KB JS
  - Brotli: ~15KB for same JS

**Dependency Duplication Problem:**
```javascript
// npm list shows duplicates:
react@18.2.0
├── node_modules/react
redux-form
├── redux@4.0.0
├── node_modules/redux
redux-thunk
├── redux@4.0.1  // Different version!
└── node_modules/redux  // Takes extra space

// Fix: npm dedupe
// Before: 25KB × 2 = 50KB
// After: 25KB (single copy)
```

**Lazy Loading Waterfall:**

```
Initial Load:
1. main.js (50KB) - Downloaded
2. React app boots
3. User clicks "Dashboard"
4. dashboard.chunk.js (120KB) - Downloaded
5. Dashboard renders (adds ~300ms delay)

Improvement with prefetch:
1. main.js (50KB) - Downloaded
2. <link rel="prefetch" href="dashboard.chunk.js">
3. Browser downloads during idle time
4. User clicks "Dashboard"
5. dashboard.chunk.js - Already cached!
6. Dashboard renders instantly
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** E-commerce site bundle bloated to 800KB (gzipped 250KB).

**Symptoms:**
- First contentful paint: 6.2 seconds (target: < 1.5s)
- Page load users drop 40% at 3 second mark
- Mobile (3G): 15+ seconds (user bounces)
- Core Web Vitals: Failed (LCP > 4s)

**Root Cause Analysis:**
```bash
# Step 1: Generate bundle analysis
npm run build && webpack-bundle-analyzer dist/stats.json

# Results:
- moment.js: 68KB (gzipped 23KB) - Only used for 2 dates
- chart.js: 150KB (gzipped 45KB) - Imported but unused
- lodash: 24KB (gzipped 4KB) - Full lib, used 3 functions
- React DevTools: 15KB (gzipped 5KB) - Left in production
- Source maps: 400KB (not compressed in HTTP)
- Duplicate Redux: 16KB (gzipped 3KB) - Two versions
```

**Step-by-Step Fixes:**

1. **Replace moment.js with date-fns:**
```javascript
// Before (68KB)
import moment from 'moment';
const formatted = moment().format('YYYY-MM-DD');

// After (8KB library, 3KB gzipped)
import { format } from 'date-fns';
const formatted = format(new Date(), 'yyyy-MM-dd');

// Saving: 60KB uncompressed, 20KB gzipped
```

2. **Remove unused chart.js:**
```javascript
// Identified in bundle analyzer but never imported in code
// Webpack couldn't tree-shake (mixed CJS/ESM)
// Solution: Remove package entirely, use lightweight alternative

// Before
import ChartJS from 'chart.js';

// After - Use recharts (already in deps, smaller)
import { LineChart, Line } from 'recharts';
// Saving: 150KB uncompressed, 45KB gzipped
```

3. **Optimize lodash imports:**
```javascript
// Before: Full lodash (24KB)
import _ from 'lodash';
_.map(arr, x => x * 2);
_.uniq(arr);
_.debounce(fn, 300);

// After: Named imports
import map from 'lodash-es/map';
import uniq from 'lodash-es/uniq';
import debounce from 'lodash-es/debounce';

// With tree-shaking: Only 8KB included
// Saving: 16KB uncompressed, 3KB gzipped
```

4. **Remove DevTools from production:**
```javascript
// webpack.config.js
{
  plugins: [
    process.env.NODE_ENV === 'development'
      ? new ReduxDevTools()
      : null,
  ].filter(Boolean),
}

// Saving: 15KB uncompressed, 5KB gzipped
```

5. **Disable source maps in production:**
```javascript
// webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  devtool: process.env.NODE_ENV === 'development'
    ? 'source-map'
    : false,  // No source maps in prod
}

// Saving: 400KB uncompressed
```

6. **Implement code splitting by routes:**
```javascript
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));

// main.js: 80KB → 40KB (split to 4 chunks)
// User only downloads Checkout when needed
```

**Results After Fixes:**

| Metric | Before | After | Improvement |
|--------|--------|-------|------------|
| **Bundle Size (uncompressed)** | 800KB | 280KB | **65% reduction** |
| **Bundle Size (gzipped)** | 250KB | 85KB | **66% reduction** |
| **First Contentful Paint** | 6.2s | 1.8s | **71% faster** |
| **Largest Contentful Paint** | 8.5s | 2.1s | **75% faster** |
| **Cumulative Layout Shift** | 0.15 (poor) | 0.03 (good) | **80% improvement** |
| **Mobile (3G) Load Time** | 15.2s | 4.8s | **68% faster** |
| **Bounce Rate** | 38% | 12% | **68% drop** |
| **Page Load Conversions** | +0% | +45% | **Business impact** |

**Metrics Tracked in Monitoring:**
```javascript
// Track bundle size in CI/CD
sizes = {
  'main.js': 45KB,
  'react-vendor.js': 40KB,
  'pages/products.js': 120KB,
  'pages/checkout.js': 75KB,
  'total': 280KB
}

// Alert if any chunk grows > 10%
// Blocks PR if total > 320KB
```

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

| Factor | Bundle Size | Load Time | Development | Complexity |
|--------|-------------|-----------|-------------|-----------|
| **Tree-Shaking** | ⬇️⬇️ (removes unused) | ⬇️ (smaller JS) | ✅ Easy | ✅ Low |
| **Code Splitting** | → (same total) | ⬇️⬇️ (parallel) | ⚠️ More chunks | 🔴 High |
| **Lazy Loading** | → (deferred) | ⬇️⬇️ (initial load) | 🔴 More async | 🔴 High |
| **Minification** | ⬇️⬇️ (30-40% smaller) | ⬇️ (smaller JS) | ⚠️ Debug harder | ✅ Low |
| **Compression (Gzip)** | ⬇️⬇️⬇️ (60-70%) | ⬇️⬇️ (network) | ✅ Same code | ✅ Zero |
| **Brotli Compression** | ⬇️⬇️⬇️⬇️ (70-75%) | ⬇️⬇️⬇️ (best) | ✅ Same code | ⚠️ Setup |
| **Library Alternation** | ⬇️⬇️ (smaller lib) | ⬇️ (smaller JS) | ⚠️ Learn new API | ⚠️ Medium |
| **Vendor Splitting** | → (same total) | ⬇️ (caching) | ⚠️ More chunks | ⚠️ Medium |
| **Remove DevTools** | ⬇️ (5-15% less) | ⬇️ (less JS) | 🔴 No debugging | 🔴 High |

**Decision Matrix:**

**When to use Tree-Shaking (Low Cost):**
- ✅ Always enabled by default
- ✅ Requires ES modules only
- ✅ No tradeoffs, only benefits

**When to use Code Splitting (Medium Cost):**
- ✅ Routes are distinct (products, checkout)
- ✅ Components are >50KB
- ⚠️ Adds async loading complexity
- ⚠️ Risk: More HTTP requests

**When to use Compression (High Benefit, Zero Cost):**
- ✅ Always enable Gzip (browser default)
- ✅ Enable Brotli if 85%+ browser support
- ✅ No dev impact, server-side only

**When to Lazy Load (Only if Needed):**
- ✅ Component user won't see immediately
- ⚠️ Creates network waterfall
- ⚠️ Adds loading state complexity
- ❌ Don't lazy load critical path

**Production Checklist:**
- [ ] Gzip enabled on server
- [ ] Source maps disabled
- [ ] Tree-shaking verified
- [ ] Bundle < 200KB gzipped
- [ ] Vendor separately from app
- [ ] LCP < 2.5s on 4G
- [ ] CI/CD monitors bundle size
- [ ] Unused dependencies removed

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Bundle Optimization Like Shipping a Package:**

**Unoptimized (Wasteful):**
You're shipping a store full of items to customers.
- Customer ordered 2 shirts but you ship entire inventory (1000 shirts = 800KB)
- Takes 1 week to arrive (6.2 seconds)
- Customer waits so long they leave

**Tree-Shaking (Removing Packaging Waste):**
Only pack what customer ordered.
- Remove 100 unused shirts → 800KB → 280KB
- Removes "packaging fluff" (unused code)

**Code Splitting (Breaking into Smaller Boxes):**
Send different boxes as customer needs them.
- Main box (essential items): 40KB - Arrives immediately
- Product box: Arrives when customer browses products
- Checkout box: Arrives when customer checks out
- Customer never waits for entire inventory

**Compression (Vacuum-Sealing):**
Compress boxes to save space.
- Gzip: Shrink by 60% (like vacuum sealing)
- Brotli: Shrink by 75% (better compression)
- Same contents, just smaller package

**Library Alternatives (Choosing Smaller Tools):**
- Moment.js = Full toolbox (68KB)
- date-fns = Just the screwdriver you need (8KB)
- Same job, 8x smaller

**Interview Answer Template:**

"I optimize React bundle size through multiple strategies:

1. **Tree-Shaking** - Use ES modules so Webpack removes unused code. For example, when I import only `format` from date-fns, unused functions are stripped from the bundle.

2. **Code Splitting** - Split by routes. Home, Dashboard, and Settings are separate chunks, so users only download what they view. Using React.lazy() and route-based splitting reduces initial load from 250KB to 50KB.

3. **Dependency Optimization** - Replace heavy libraries. I switched from moment (68KB) to date-fns (8KB), saving 60KB. Used webpack-bundle-analyzer to identify unused dependencies.

4. **Minification & Compression** - Configure Webpack to minify with Terser and enable Gzip (60% reduction) or Brotli (75% reduction).

5. **Monitoring** - Set bundle size budget in CI/CD. Alert if main bundle exceeds 200KB gzipped. Track in Lighthouse and Core Web Vitals.

Real-world example: Reduced an e-commerce bundle from 800KB to 280KB (65% reduction), improving FCP from 6.2s to 1.8s and increasing conversions by 45%."

**Common Follow-up Questions:**
- "How do you handle large libraries you must use?" → Async load, separate bundle, tree-shake
- "What's the difference between tree-shaking and minification?" → Tree-shaking removes functions, minification compresses code
- "How do code splitting and lazy loading differ?" → Code splitting creates chunks, lazy loading defers their download
- "When should you split code?" → Routes, heavy components, feature flags
- "How do you prevent bundle regression?" → CI/CD size checks, automated alerts

</details>

---

## Question 2: How do you analyze and improve build performance?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Meta, Google, Amazon, Shopify, Microsoft

### Question

How do you measure and improve React build performance? What tools and metrics do you use? How do you optimize webpack/Vite build speed? What's the difference between build time and runtime performance?

### Answer

**Build Performance Fundamentals:**

1. **Build Time** - How long compilation takes (dev experience)
   - Development: Should be < 2s for changes (HMR)
   - Production: Should be < 5 minutes

2. **Bundle Size** - Final output size (runtime impact)
   - Initial load: Should be < 200KB gzipped
   - Per-chunk: < 150KB each

3. **Runtime Performance** - How fast app runs (UX)
   - FCP (First Contentful Paint): < 1.5s
   - LCP (Largest Contentful Paint): < 2.5s

4. **Key Metrics to Track:**
   - Build time (seconds)
   - Bundle size (KB)
   - Number of modules/chunks
   - Time spent in parsing/compilation
   - Memory usage during build

**Analysis Tools:**
- webpack-bundle-analyzer (visualize bundle)
- speed-measure-webpack-plugin (build time breakdown)
- node --inspect (profile Node.js build process)
- Lighthouse (runtime performance)
- WebPageTest (real-world performance)

### Code Example

```javascript
// ============================================
// 1. SPEED MEASUREMENT PLUGIN
// ============================================

const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();

const webpackConfig = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,  // Speed up babel
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    // Speed measure plugin shows time per loader/plugin
  ],
};

module.exports = smp.wrap(webpackConfig);

// Output:
// SMP ⚡ [General output time]: 23.456 s
//  SMP  ⚡ [babel-loader]: 12.345 s
//  SMP  ⚡ [css-loader]: 4.123 s
//  SMP  ⚡ [TerserPlugin]: 5.234 s
//  SMP  ⚡ [other]: 1.754 s


// ============================================
// 2. WEBPACK CONFIGURATION OPTIMIZATION
// ============================================

module.exports = {
  // 1. Use production mode (enables optimizations)
  mode: 'production',

  // 2. Parallel compilation
  parallelism: 4,  // Default is os.cpus().length

  // 3. Cache builds (v5+, huge speed improvement)
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },

  // 4. Module federation (share code between apps)
  // Reduces build time for monorepos

  // 5. Exclude node_modules from compilation
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            cacheCompression: false,  // Faster
          },
        },
      },
    ],
  },

  // 6. Optimize dependencies
  optimization: {
    nodeEnv: 'production',
    sideEffects: true,  // Important for tree-shaking
    usedExports: true,
    concatenateModules: true,  // Scope hoisting
  },

  // 7. Use esbuild (faster than Terser)
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: 4,
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },

  plugins: [
    // 8. Avoid unnecessary plugins
    // Remove BundleAnalyzer from production build
    process.env.ANALYZE ? new BundleAnalyzerPlugin() : null,

    // 9. Use ThreadLoader for expensive operations
    // Only in Webpack dev config, not needed in prod
  ].filter(Boolean),
};


// ============================================
// 3. VITE OPTIMIZATION (Much Faster)
// ============================================

// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // 1. Optimize dependencies pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'lodash-es'],
    exclude: ['my-large-lib'],  // Don't pre-bundle
  },

  // 2. Source map strategy
  build: {
    sourcemap: process.env.ANALYZE ? true : false,
    // Production: No source maps (faster build, smaller)
    // Analysis: Include for debugging
  },

  // 3. esbuild options (faster than webpack)
  esbuild: {
    drop: ['console', 'debugger'],  // Remove logs
    legalComments: 'none',  // Remove license comments
  },

  // 4. Rollup configuration
  build: {
    rollupOptions: {
      // Don't inline everything (smaller chunks)
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
});

// Build time comparison:
// Webpack: 45 seconds
// Vite: 8 seconds (5.6x faster!)


// ============================================
// 4. BUILD TIME MEASUREMENT SCRIPT
// ============================================

// measure-build.js
const { performance } = require('perf_hooks');
const { spawn } = require('child_process');

const start = performance.now();

spawn('webpack', ['--mode', 'production']).on('close', () => {
  const duration = performance.now() - start;
  console.log(`Build time: ${(duration / 1000).toFixed(2)}s`);

  // Log to metrics service
  const metrics = {
    buildTime: duration,
    timestamp: new Date().toISOString(),
    branch: process.env.BRANCH,
  };

  fetch('https://metrics.example.com/build-time', {
    method: 'POST',
    body: JSON.stringify(metrics),
  });
});

// package.json
{
  "scripts": {
    "build": "node measure-build.js",
    "build:analyze": "ANALYZE=true webpack --mode production"
  }
}


// ============================================
// 5. LIGHTHOUSE CI SETUP
// ============================================

// lighthouse-ci.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/"],
      "numberOfRuns": 3,
      "settings": {
        "configPath": "./lighthouserc.json"
      }
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}

// CI/CD Pipeline
// 1. Build bundle
// 2. Run Lighthouse on production build
// 3. Compare against baseline
// 4. Fail if regression > 10%


// ============================================
// 6. WEBPACK BUNDLE ANALYSIS SCRIPT
// ============================================

// analyze-bundle.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpack = require('webpack');
const config = require('./webpack.config.js');

// Add analyzer plugin
config.plugins.push(
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    reportFilename: 'bundle-report.html',
    openAnalyzer: process.env.OPEN !== 'false',
  })
);

webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(stats.toJson().errors);
    process.exit(1);
  }

  console.log(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }));

  // Extract bundle size metrics
  const assets = stats.toJson().assets;
  let totalSize = 0;
  let totalGzipped = 0;

  assets.forEach(asset => {
    totalSize += asset.size;
    totalGzipped += asset.gzipSize || 0;
  });

  console.log(`\nTotal size: ${(totalSize / 1024).toFixed(2)}KB`);
  console.log(`Total gzipped: ${(totalGzipped / 1024).toFixed(2)}KB`);
  console.log(`Compression ratio: ${(100 - (totalGzipped / totalSize * 100)).toFixed(1)}%`);
});


// ============================================
// 7. DEVELOPMENT BUILD OPTIMIZATION
// ============================================

// webpack.dev.js
module.exports = {
  mode: 'development',

  // 1. Fast source maps for debugging
  devtool: 'cheap-module-source-map',
  // Alternative: eval-cheap-source-map (even faster)

  // 2. Watch mode with --watch
  // Only recompile changed files

  // 3. Webpack dev server
  devServer: {
    hot: true,  // Hot Module Replacement
    port: 3000,
    compress: false,  // Skip compression in dev
    client: {
      overlay: true,  // Show errors in browser
    },
  },

  // 4. Skip optimization in dev
  optimization: {
    minimize: false,  // Skip minification
    usedExports: false,  // Skip tree-shaking
  },

  // 5. Cache configuration
  cache: {
    type: 'memory',  // Faster than filesystem in dev
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            cacheCompression: false,  // 2x faster
          },
        },
      },
    ],
  },
};

// HMR (Hot Module Replacement) workflow:
// 1. User changes component
// 2. Webpack detects change (< 100ms)
// 3. Compiles changed module (~500ms)
// 4. Sends update to browser (< 100ms)
// 5. App rerenders without reload
// Total: ~700ms (vs 3-5s for full reload)


// ============================================
// 8. MONITORING BUILD METRICS
// ============================================

// .github/workflows/build-metrics.yml
name: Build Metrics
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: |
          time npm run build > /tmp/build.log 2>&1
          wc -c dist/main.*.js | tail -1 > /tmp/bundle-size.txt

      - name: Parse metrics
        run: |
          BUILD_TIME=$(grep real /tmp/build.log | awk '{print $2}')
          BUNDLE_SIZE=$(cat /tmp/bundle-size.txt | awk '{print $1}')

          echo "Build Time: $BUILD_TIME"
          echo "Bundle Size: $((BUNDLE_SIZE / 1024))KB"

      - name: Compare with baseline
        run: |
          # Store in artifact or database
          # Alert if regression > 10%

      - name: Generate HTML report
        run: npm run analyze

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: bundle-report
          path: dist/bundle-report.html


// ============================================
// 9. PERFORMANCE BUDGET
// ============================================

// performance-budget.json
{
  "bundles": [
    {
      "name": "main",
      "maxSize": "150kb"
    },
    {
      "name": "vendor",
      "maxSize": "100kb"
    },
    {
      "name": "pages/*",
      "maxSize": "75kb"
    }
  ],
  "metrics": [
    {
      "name": "FCP",
      "maxValue": 1500
    },
    {
      "name": "LCP",
      "maxValue": 2500
    }
  ]
}

// Enforce budget in CI/CD
// Fail build if:
// - main.js > 150KB
// - FCP > 1.5s
// - Any page chunk > 75KB


// ============================================
// 10. PROFILE NODE BUILD PROCESS
// ============================================

// npm run build -- --profile
// node --inspect ./node_modules/.bin/webpack

// In Chrome DevTools:
// 1. Visit chrome://inspect
// 2. Connect to Node.js process
// 3. Record profile during webpack build
// 4. Analyze call tree
//    - Which loaders take longest?
//    - Which files are slowest?
//    - Memory leaks during build?
```

### Resources
- [Webpack: Build Performance](https://webpack.js.org/guides/build-performance/)
- [Vite: Build Optimization](https://vitejs.dev/guide/build.html)
- [Speed Measure Plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web.dev: Performance](https://web.dev/performance/)

---

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**Build Performance Components:**

The webpack compilation pipeline has distinct phases:

1. **Entry Resolution** (100-500ms)
   - Locate entry files
   - Parse package.json
   - Resolve aliases and extensions

2. **Module Compilation** (1-5s depending on codebase size)
   - Each .js/.jsx file: ~1-5ms per file
   - Babel transformation (largest overhead)
   - 1000 files × 2ms = 2 seconds
   - Babel cache reduces to 100ms on second build

3. **Bundling/Linking** (500ms-2s)
   - Create dependency graph
   - Split into chunks
   - Optimize (tree-shake, concat)

4. **Minification** (1-3s)
   - Terser processes all code
   - Parallel workers (4 CPUs = 4x faster)

5. **Emit** (100-500ms)
   - Write to disk
   - Generate source maps
   - Hash calculation

**Build Time Formula:**
```
Total Build Time =
  Entry Resolution (100ms) +
  Module Compilation (2-5s) +
  Bundling (1s) +
  Minification (2s) +
  Emit (500ms) +
  IO (500ms)
  = 6-9 seconds for typical app
```

**Webpack vs Vite Comparison:**

| Phase | Webpack | Vite |
|-------|---------|------|
| **Cold start** | 15-30s | 500ms-2s |
| **Dev HMR** | 2-5s | 100-300ms |
| **Prod build** | 20-45s | 5-15s |
| **Mechanism** | Bundles everything | Uses native ESM |

**Why Vite is Faster:**

```javascript
// Webpack approach:
1. Read all source files
2. Parse all modules
3. Create dependency graph (for entire app)
4. Minify all code
5. Serve bundled file
= Slow for large apps, slow HMR

// Vite approach (ESM-first):
1. Serve source files as-is in development
2. Browser loads via native ES modules
3. Only transform on-demand (changed file)
4. HMR only updates changed module
= Fast for all app sizes, blazing HMR
```

**Babel Caching Impact:**

Without cache:
- 1000 JS files × 2ms = 2000ms

With cache:
- Cache miss on 10 files: 10 × 2ms = 20ms
- Cache hit on 990 files: ~10ms (disk read)
- Total: ~30ms (66x faster!)

**Module Federation (Advanced):**

Used in monorepos to avoid rebuilding shared code:

```javascript
// app1/webpack.config.js
{
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button.jsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
}

// app2/webpack.config.js
{
  plugins: [
    new ModuleFederationPlugin({
      name: 'app2',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
}

// Benefits:
// - app1 rebuilt: 3 seconds
// - app2 built ONCE, reuses app1's Button
// - app2 rebuild: 2 seconds (not 3s)
```

**Profiling webpack with Node Inspector:**

```bash
# Start webpack with inspector
node --inspect-brk ./node_modules/.bin/webpack

# In separate terminal, open Chrome DevTools
# chrome://inspect

# Profiler reveals:
// Top functions by time:
// 1. babel-loader: 65% (2.6s)
// 2. sass-loader: 15% (600ms)
// 3. TerserPlugin: 12% (480ms)
// 4. webpack resolve: 8% (320ms)

// Bottleneck: Babel is slow on 1000 files
// Solution: babel-loader cacheDirectory
```

**Bundle Size Metrics:**

```javascript
// From webpack stats:
{
  "assets": [
    {
      "name": "main.abc123.js",
      "size": 150000,        // Uncompressed
      "gzipSize": 45000,     // Gzipped (30%)
      "brotliSize": 38000    // Brotli (25%)
    }
  ]
}

// Optimization opportunities:
// - 150KB → 45KB (Gzip)
// - 150KB → 38KB (Brotli, 75% smaller)
// - 150KB → 60KB (with tree-shaking, 60% smaller)
// - 60KB → 18KB (Brotli + tree-shaking, 88% smaller!)
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Build pipeline taking 8 minutes, blocking CI/CD. Developers frustrated with 5-second HMR delays.

**Initial Diagnosis:**
```bash
# Measure build time
$ npm run build
webpack 5.0.0 compiled with warnings in 480000ms (8 minutes!)

# What's taking so long?
$ webpack --profile --json > stats.json
$ webpack-bundle-analyzer stats.json

Results:
- Babel compilation: 280 seconds (58%)
- Minification (Terser): 120 seconds (25%)
- Webpack operations: 80 seconds (17%)
```

**Root Causes Found:**

1. **No Babel Caching:**
```javascript
// webpack.config.js (BEFORE)
{
  test: /\.jsx?$/,
  use: 'babel-loader',
}
// Every build recompiles 1000 files

// (AFTER)
{
  test: /\.jsx?$/,
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      cacheCompression: false,  // Avoid compression overhead
    },
  },
}

// Impact: 280s → 15s (18x faster)
// From 90% CPU to 20% CPU during Babel phase
```

2. **Serial Minification (Single-threaded):**
```javascript
// webpack.config.js (BEFORE)
optimization: {
  minimize: true,
  minimizer: [new TerserPlugin()],
}
// Terser uses 1 CPU core

// (AFTER)
optimization: {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      parallel: 4,  // Use 4 CPU cores
    }),
  ],
}

// Impact: 120s → 35s (3.4x faster)
// From 25% CPU usage to 90% CPU (utilizing all cores)
```

3. **Unnecessary Source Maps in CI:**
```javascript
// webpack.config.js (BEFORE)
devtool: 'source-map',  // Always generated
// Adds 400KB + 40s computation time

// (AFTER)
devtool: process.env.CI ? false : 'source-map',
// Only in local development

// Impact: 40s saved
```

4. **Missing Webpack Cache (v5+):**
```javascript
// webpack.config.js (BEFORE)
// No cache configuration
// Every build parses all modules from scratch

// (AFTER)
cache: {
  type: 'filesystem',
  buildDependencies: {
    config: [__filename],
  },
}
// Stores compiled modules to disk

// Impact:
// - First build: 475s (no change)
// - Second build: 8s (95% faster!)
// - Incremental: 2-3s (only changed files)
```

5. **Inefficient Code Splitting:**
```javascript
// webpack.config.js (BEFORE)
optimization: {
  splitChunks: {
    chunks: 'all',
    minSize: 30000,
  }
}
// Creates 47 chunks, webpack spends time optimizing

// (AFTER)
optimization: {
  splitChunks: {
    chunks: 'async',  // Only split dynamic imports
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10,
      },
    },
  },
}
// Creates 5 chunks only

// Impact: Webpack linking phase 15s → 2s
```

**Performance Fixes Applied:**

| Fix | Before | After | Improvement |
|-----|--------|-------|------------|
| **Babel caching** | 280s | 15s | 18.6x |
| **Parallel Terser** | 120s | 35s | 3.4x |
| **Remove source maps** | 40s | 0s | - |
| **Webpack cache** | 8m (rebuilds) | 8s | 60x |
| **Code split simplification** | 15s | 2s | 7.5x |
| **Total** | **8 min** | **30s** (first build) / **8s** (incremental) | **16x** |

**Final Build Metrics:**

```bash
# Production builds
$ npm run build
webpack compiled in 32 seconds
├─ main: 45KB (gzipped)
├─ vendor: 40KB (gzipped)
├─ pages: 120KB (gzipped)
└─ Total: 205KB (gzipped)

# HMR during development
$ npm run dev
webpack compiled in 2.3s
✅ App ready at localhost:3000

# File save → HMR update
$ Edit src/Button.jsx
webpack compiled in 380ms
✅ Module updated (no page reload)
```

**CI/CD Pipeline Impact:**

Before:
- Build job: 8m 45s
- Lighthouse: 2m 30s
- Tests: 5m 20s
- Total: 16m 35s
- Blocker: Developers wait 16+ minutes per commit

After:
- Build job: 30s
- Lighthouse: 2m 30s
- Tests: 5m 20s
- Total: 8m 20s
- Result: 50% faster feedback loop

**Developer Experience Improvement:**

```
Before (5s HMR delay):
Edit component
  ↓ (wait 5s)
See change in browser

After (380ms HMR):
Edit component
  ↓ (instant, 380ms)
See change in browser

Developer can work in flow state
(no context-switching to wait for tools)
```

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

| Optimization | Build Time | Dev HMR | Bundle Size | Complexity | Risk |
|--------------|-----------|---------|-------------|-----------|------|
| **Babel Cache** | ⬇️⬇️⬇️ (18x) | ⬇️⬇️⬇️ | → | ✅ Low | ✅ Low |
| **Parallel Minify** | ⬇️⬇️ (3x) | → | → | ✅ Low | ✅ Low |
| **Webpack Cache** | ⬇️⬇️⬇️ (60x rebuild) | → | → | ✅ Low | ⚠️ Can stale |
| **Remove Dev Tools** | ⬇️ | → | ⬇️⬇️ | ✅ Low | 🔴 Less debugging |
| **Code Splitting** | ⬇️ | ⬇️ | → (chunks) | ⚠️ Medium | ⚠️ Complexity |
| **Switch to Vite** | ⬇️⬇️⬇️ | ⬇️⬇️⬇️⬇️ | → | 🔴 High | 🔴 Ecosystem risk |
| **Skip minification dev** | ⬇️⬇️⬇️ | ⬇️⬇️⬇️ | ⬆️⬆️ (local only) | ✅ Low | ✅ Low |

**Decision Framework:**

**Fast-win optimizations (do these first):**
- ✅ Babel caching (~10min → 1min)
- ✅ Parallel minification (~2min faster)
- ✅ Webpack cache (rebuilds only ~10s)
- ✅ Skip source maps in CI

**Medium-effort optimizations:**
- ⚠️ Simplify code splitting
- ⚠️ Profile to find bottlenecks
- ⚠️ Upgrade webpack/tools to latest

**Large-effort optimizations (only if critical):**
- 🔴 Migrate from Webpack to Vite (weeks of work)
- 🔴 Module federation for monorepos
- 🔴 Custom build tool (rare, unless Meta-scale)

**Build Time Targets:**

| Stage | Target | Good | Acceptable | Poor |
|-------|--------|------|-----------|------|
| **First build** | < 30s | < 30s | 30-60s | > 60s |
| **Incremental build (HMR)** | < 1s | < 500ms | 500ms-2s | > 2s |
| **CI/CD build** | < 2m | < 1m | 1-3m | > 3m |
| **Bundle size (gzipped)** | < 150KB | < 150KB | 150-300KB | > 300KB |

**When to Optimize Build Performance:**

| Symptom | Action |
|---------|--------|
| Developers waiting 5+ seconds for HMR | Urgent - Babel cache, skip minification |
| CI/CD taking 10+ minutes | Urgent - Parallel builds, webpack cache |
| Bundle size > 500KB gzipped | Urgent - Tree-shake, code split, analyze |
| Build times slowly increasing | Proactive - Measure, set budget, monitor |
| Build works but slow | Defer - If cycle < 5s and bundle < 200KB |

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Build Optimization Like Factory Assembly:**

**Unoptimized Factory:**
- Each worker does every step sequentially
- Product takes 8 minutes
- Workers frustrated, coffee cold before next product

**Optimized Factory (Parallel Processing):**
- Worker 1: Cuts wood (2 min)
- Worker 2: Stains wood (2 min)
- Worker 3: Assembles (2 min)
- Worker 4: Packaging (2 min)
- All 4 work simultaneously → Final product in 2 minutes!

**Applying to Webpack:**

1. **Babel Caching = Remembering Completed Work**
   - First time cutting wood: 5 minutes
   - Second time: "I remember this wood pattern!" → 10 seconds
   - Webpack remembers compiled JavaScript

2. **Parallel Minification = Multiple Workers**
   - 1 worker: 2 minutes (minifying slowly)
   - 4 workers: 30 seconds (4x faster, same job)
   - Use `parallel: 4` in Terser config

3. **Webpack Cache = Inventory System**
   - Without cache: "Is this module changed? Let me check... compiling..."
   - With cache: "Yep, it's the same, here's the cached version" (disk lookup)
   - 60 times faster on incremental builds

4. **Code Splitting = Breaking into Smaller Boxes**
   - Ship whole factory output at once: 8 minutes
   - Ship only what customer needs today: 2 minutes
   - Bundle size smaller = faster network

**Interview Answer Template:**

"Build performance has two aspects: build time and bundle size.

**Build Time Optimization:**
First, I profile the build. Using speed-measure-webpack-plugin, I found Babel was taking 60% of time. I enabled `cacheDirectory: true` on babel-loader, which reduced build time from 8 minutes to 15 seconds by caching compiled modules.

Second, I parallelize. Terser was running single-threaded. Adding `parallel: 4` reduced minification from 120s to 35s.

Third, I enable Webpack's cache (v5+). The first build is the same, but rebuilds drop from 8 minutes to 8 seconds because Webpack remembers what it already compiled.

**Bundle Size Optimization:**
I use webpack-bundle-analyzer to visualize dependencies. Found moment.js was 68KB for 2 date formats. Switched to date-fns, saving 60KB.

I implement code splitting by routes. Home, Dashboard, Settings become separate chunks. Users only download the page they're viewing.

**Monitoring:**
In CI/CD, I set bundle size budget. If main.js exceeds 150KB, the build fails. Run Lighthouse on each PR to catch performance regressions.

Result: 8-minute builds became 30 seconds. HMR improved from 5 seconds to 380ms, improving developer experience significantly."

**Key Takeaways for Interview:**

1. **Always measure first** - Profile before optimizing (speed-measure-webpack-plugin)
2. **Target the bottleneck** - Fix the slowest part (usually Babel or minification)
3. **Parallelize everything** - Use all CPU cores (parallel workers in Terser)
4. **Cache aggressively** - Babel cache and Webpack cache are huge wins
5. **Monitor in CI/CD** - Set size budgets to prevent regression
6. **Know your tools** - Webpack vs Vite tradeoffs, when to use each

</details>

---

**[← Back to React README](./README.md)**
