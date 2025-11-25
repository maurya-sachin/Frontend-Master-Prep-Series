# Next.js Deployment

> Deploying Next.js apps to production: Vercel, environment variables, and deployment strategies

---

## Question 1: What Are the Essential Performance Optimizations for Next.js in Production?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Vercel, Meta, Netflix, Airbnb, Shopify

### Question
Explain the key performance optimizations you should implement before deploying a Next.js application to production. How do you optimize images, fonts, scripts, and bundles?

### Answer

**Next.js Production Optimization** - Systematic approach to minimizing bundle size, optimizing assets, and improving Core Web Vitals for production deployment.

**Key Points:**

1. **Image Optimization with next/image** - Automatic lazy loading, responsive images, WebP conversion, and blur placeholders
2. **Font Optimization** - Self-host Google Fonts, preload critical fonts, eliminate layout shift during font loading
3. **Code Splitting and Lazy Loading** - Automatic route-based splitting, dynamic imports for heavy components
4. **Bundle Analysis** - Identify and eliminate large dependencies, tree-shake unused code
5. **Script Loading Strategies** - Defer non-critical scripts, preconnect to third-party origins

### Code Example

```typescript
// ==========================================
// 1. IMAGE OPTIMIZATION WITH NEXT/IMAGE
// ==========================================

// ❌ BAD: Regular img tag (no optimization)
<img src="/hero.jpg" alt="Hero" />
// Problems: No lazy loading, no size optimization, no format conversion

// ✅ GOOD: Using next/image with optimization
import Image from 'next/image';

export default function HeroSection() {
  return (
    <div>
      {/* Priority image (above fold) - preloads for LCP */}
      <Image
        src="/hero.jpg"
        alt="Hero image"
        width={1920}
        height={1080}
        priority // Disables lazy loading, preloads image
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Blur placeholder
        quality={90} // Default is 75
      />

      {/* Lazy-loaded images (below fold) */}
      <Image
        src="/product.jpg"
        alt="Product"
        width={800}
        height={600}
        loading="lazy" // Default behavior
        sizes="(max-width: 768px) 100vw, 50vw" // Responsive sizes
      />

      {/* External images require domains config */}
      <Image
        src="https://example.com/image.jpg"
        alt="External image"
        width={500}
        height={300}
        unoptimized={false} // Allow optimization
      />
    </div>
  );
}

// next.config.js - Image optimization config
module.exports = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/avif', 'image/webp'], // Modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache optimized images for 60 seconds
  },
};

// ==========================================
// 2. FONT OPTIMIZATION
// ==========================================

// ❌ BAD: Loading fonts from CDN (extra request, FOUT/FOIT)
// _document.tsx
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
  rel="stylesheet"
/>

// ✅ GOOD: Self-hosted fonts with next/font
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

// Primary font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // FOUT strategy (better than FOIT)
  variable: '--font-inter', // CSS variable
  preload: true, // Preload font
  weight: ['400', '500', '700'], // Only weights you need
});

// Monospace font
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
  weight: ['400', '700'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

// Use in CSS
// styles/globals.css
body {
  font-family: var(--font-inter), sans-serif;
}

code {
  font-family: var(--font-roboto-mono), monospace;
}

// Custom/Local fonts
import localFont from 'next/font/local';

const myFont = localFont({
  src: [
    {
      path: './fonts/MyFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/MyFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom',
});

// ==========================================
// 3. SCRIPT OPTIMIZATION
// ==========================================

import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Critical analytics - load early */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"
          strategy="afterInteractive" // Load after page is interactive
        />

        {/* Non-critical scripts - load lazily */}
        <Script
          src="https://widget.intercom.io/widget/APP_ID"
          strategy="lazyOnload" // Load after everything else
          onLoad={() => console.log('Intercom loaded')}
        />

        {/* Inline script with strategy */}
        <Script id="analytics-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_TRACKING_ID');
          `}
        </Script>

        {/* Preconnect to third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cdn.example.com" />

        {children}
      </body>
    </html>
  );
}

// ==========================================
// 4. CODE SPLITTING & LAZY LOADING
// ==========================================

import dynamic from 'next/dynamic';

// ❌ BAD: Importing heavy component directly
import HeavyChart from '@/components/HeavyChart';
import VideoPlayer from '@/components/VideoPlayer';

// ✅ GOOD: Dynamic imports with loading states
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Don't render on server (if using client-only APIs)
});

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  loading: () => <Skeleton height={400} />,
  ssr: false,
});

// Conditional loading based on user interaction
export default function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>
        Show Chart
      </button>

      {/* Only load when needed */}
      {showChart && <HeavyChart data={chartData} />}
    </div>
  );
}

// Dynamic import with named exports
const DynamicComponent = dynamic(
  () => import('@/components/MyComponent').then(mod => mod.SpecificExport),
  { ssr: false }
);

// ==========================================
// 5. BUNDLE ANALYSIS
// ==========================================

// Install: npm install @next/bundle-analyzer

// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Your Next.js config
  reactStrictMode: true,

  // Tree shaking improvements
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console.logs
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Bundle size optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }

    return config;
  },
});

// Run bundle analyzer
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}

// Then run: npm run analyze

// ==========================================
// 6. OPTIMIZING DEPENDENCIES
// ==========================================

// ❌ BAD: Importing entire library
import _ from 'lodash'; // Imports all of lodash (~70kb)
import * as dateFns from 'date-fns'; // Imports all functions

// ✅ GOOD: Named imports (tree-shakeable)
import { debounce, throttle } from 'lodash-es'; // Only what you need
import { format, parseISO } from 'date-fns'; // Tree-shakeable

// Even better: Use lighter alternatives
import debounce from 'just-debounce-it'; // 1kb vs lodash 70kb
import { formatDistance } from 'date-fns/formatDistance'; // Direct import

// Replace moment.js (heavy) with date-fns or dayjs
// moment.js: ~70kb minified + gzipped
// date-fns: ~2-15kb (only what you import)
// dayjs: ~2kb

// ==========================================
// 7. COMPRESSION & CACHING
// ==========================================

// next.config.js
module.exports = {
  // Enable gzip/brotli compression
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // Asset prefix for CDN
  assetPrefix: process.env.NODE_ENV === 'production'
    ? 'https://cdn.example.com'
    : '',

  // Headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

// ==========================================
// 8. MEASURING PERFORMANCE
// ==========================================

// Enable Web Vitals reporting
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics /> {/* Automatic Web Vitals tracking */}
      </body>
    </html>
  );
}

// Custom Web Vitals tracking
// app/layout.tsx
export function reportWebVitals(metric) {
  const { id, name, label, value } = metric;

  // Send to analytics
  window.gtag?.('event', name, {
    event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js Metric',
    event_label: id,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    non_interaction: true,
  });

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
}

// Lighthouse CI configuration
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

### Common Mistakes

- ❌ **Not using next/image** - Missing automatic optimization, lazy loading, and format conversion
- ❌ **Loading heavy libraries entirely** - Importing whole lodash/moment instead of specific functions
- ❌ **Blocking scripts** - Loading analytics synchronously, blocking page render
- ❌ **No bundle analysis** - Shipping bloated bundles without knowing what's inside
- ✅ **Use next/image with priority flag** - Preload above-fold images for better LCP
- ✅ **Self-host fonts with next/font** - Eliminates external requests, improves performance
- ✅ **Lazy load non-critical components** - Use dynamic imports for heavy components
- ✅ **Analyze and optimize bundles** - Regular bundle analysis to catch size regressions

### Follow-up Questions

1. **What are Core Web Vitals and how do you optimize them in Next.js?** LCP (Largest Contentful Paint) - optimize with priority images and font preloading. FID (First Input Delay) - reduce JavaScript execution time. CLS (Cumulative Layout Shift) - use next/image with dimensions and font-display: swap.

2. **How do you reduce initial page load time?** Code splitting with dynamic imports, optimize images with next/image, defer non-critical scripts, enable compression, use CDN for static assets, implement proper caching headers.

3. **When should you use SSR vs SSG vs ISR for performance?** SSG for fastest performance (pre-rendered at build), ISR for dynamic content with caching (best of both worlds), SSR only when you need real-time data for every request.

### Resources
- [Next.js Production Optimization](https://nextjs.org/docs/going-to-production)
- [next/image Documentation](https://nextjs.org/docs/api-reference/next/image)
- [next/font Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

---

<details>
<summary><strong>🔍 Deep Dive: Next.js Performance Optimization Internals</strong></summary>

### Image Optimization Architecture

Next.js's Image Optimization API is a sophisticated image processing pipeline that runs on-demand:

**How next/image Works Internally:**

1. **Request Flow:**
   - Browser requests image with srcset for responsive sizing
   - Next.js Image Optimization API intercepts the request
   - Checks cache for previously optimized version
   - If not cached, fetches original image
   - Processes image (resize, format conversion, quality compression)
   - Returns optimized image with appropriate caching headers
   - Stores optimized version in cache for future requests

2. **Format Selection Algorithm:**
   ```
   if (browser supports AVIF && formats includes 'image/avif') {
     return AVIF (best compression, ~30% smaller than WebP)
   } else if (browser supports WebP && formats includes 'image/webp') {
     return WebP (good compression, widely supported)
   } else {
     return original format (JPEG/PNG)
   }
   ```

3. **Lazy Loading Implementation:**
   - Uses Intersection Observer API to detect when image enters viewport
   - Sets placeholder with blurDataURL (base64-encoded 10px version)
   - Loads full image when within 200px of viewport
   - Prevents layout shift by reserving space with width/height
   - Automatically generates responsive srcset based on deviceSizes config

4. **Priority Images (LCP Optimization):**
   - Disables lazy loading for above-fold images
   - Adds `<link rel="preload" as="image">` to HTML head
   - Ensures image loads before JavaScript executes
   - Critical for Largest Contentful Paint (LCP) metric
   - Should only be used for hero images or first viewport content

**Image Optimization Performance Metrics:**

```typescript
// next/image automatic optimizations:
// - 40-60% size reduction with WebP/AVIF
// - Lazy loading saves 200-400kb initial page load
// - Blur placeholder prevents CLS (Cumulative Layout Shift)
// - Responsive srcset reduces mobile data usage by 70%

// Example: 2MB JPEG → 400kb WebP (80% reduction)
// LCP improvement: 4.2s → 1.8s (desktop), 8.5s → 3.2s (mobile 3G)
```

### Font Optimization Deep Dive

**next/font Self-Hosting Mechanism:**

1. **Build-Time Font Processing:**
   - Downloads Google Fonts at build time (not runtime)
   - Stores fonts in `.next/static/fonts/` directory
   - Generates optimized CSS with font-face declarations
   - Inlines critical font CSS in HTML head (no external requests)
   - Automatically subsets fonts to include only used characters

2. **Font Display Strategies:**
   ```typescript
   // display: 'swap' (FOUT - Flash of Unstyled Text)
   // - Shows fallback font immediately
   // - Swaps to custom font when loaded
   // - Best for performance (FCP < 1s)
   // - May cause layout shift if metrics differ

   // display: 'optional'
   // - Shows fallback font immediately
   // - Only swaps if font loads within 100ms
   // - Prevents layout shift on slow connections
   // - Best for Core Web Vitals optimization

   // display: 'block' (FOIT - Flash of Invisible Text)
   // - Hides text until font loads (up to 3s)
   // - Prevents layout shift
   // - Worst for FCP (First Contentful Paint)
   ```

3. **Variable Fonts Optimization:**
   - Single file contains all weights/styles (200kb vs 800kb for 4 weights)
   - Reduces HTTP requests by 75%
   - Enables fine-grained weight control (font-weight: 437)
   - Better compression with modern formats (woff2)

**Font Loading Performance Impact:**

```
Traditional Google Fonts (CDN):
- DNS lookup: 50-100ms
- TCP connection: 100-200ms
- TLS handshake: 100-200ms
- Font download: 200-500ms
Total: 450-1000ms

next/font (self-hosted):
- No external requests (0ms)
- Font preloaded with page (parallel download)
- CSS inlined in HTML (0 extra requests)
Total: 0ms blocking time
```

### Code Splitting Algorithm

Next.js uses advanced code splitting strategies:

1. **Automatic Route-Based Splitting:**
   - Each page is a separate chunk
   - Common dependencies extracted to shared chunks
   - Framework code (React, Next.js) in separate vendor chunk
   - Prefetches chunks for visible `<Link>` components

2. **Chunk Splitting Strategy:**
   ```typescript
   // Next.js automatically creates these chunks:
   // 1. pages/[route].js - Route-specific code
   // 2. chunks/framework-[hash].js - React, React-DOM
   // 3. chunks/main-[hash].js - Next.js runtime
   // 4. chunks/commons-[hash].js - Shared dependencies
   // 5. chunks/[id]-[hash].js - Dynamic imports

   // Chunk size thresholds:
   // - Target: 244kb per chunk (compressed)
   // - Max: 512kb (splits into multiple chunks)
   // - Min shared code: 20kb (minimum to extract common chunk)
   ```

3. **Dynamic Import Webpack Magic Comments:**
   ```typescript
   // Preload chunk (downloads in parallel with page)
   const Component = dynamic(() => import(/* webpackPreload: true */ './Heavy'), {
     ssr: false,
   });

   // Prefetch chunk (downloads after page load, during idle time)
   const Component = dynamic(() => import(/* webpackPrefetch: true */ './Heavy'));

   // Custom chunk name for better debugging
   const Component = dynamic(() => import(/* webpackChunkName: "chart-library" */ './Chart'));
   ```

### Bundle Analysis Deep Dive

**Understanding Bundle Analyzer Output:**

1. **Stat Size:** Uncompressed size before minification (largest)
2. **Parsed Size:** Minified size after Terser/SWC (20-30% smaller)
3. **Gzipped Size:** Compressed size sent over network (60-70% smaller)

```typescript
// Example breakdown:
// lodash (full library):
// - Stat size: 531kb
// - Parsed size: 71kb (minified)
// - Gzipped: 25kb (compressed)

// lodash-es (tree-shakeable, only 2 functions):
// - Stat size: 12kb
// - Parsed size: 3kb
// - Gzipped: 1.2kb

// Savings: 95% smaller by using ES modules
```

**Critical Dependencies to Audit:**

```typescript
// Replace heavy libraries with lighter alternatives:

// 1. moment.js (289kb) → date-fns (2-15kb) or dayjs (7kb)
// 2. lodash (531kb) → lodash-es (tree-shakeable) or native methods
// 3. axios (15kb) → fetch API (native, 0kb)
// 4. jQuery (90kb) → native DOM APIs
// 5. core-js (400kb) → only polyfills you need (browserslist)
// 6. material-ui (1.2mb) → shadcn/ui or native CSS
```

### Script Loading Strategy Deep Dive

**Script Strategy Performance Impact:**

```typescript
// beforeInteractive: Loads before page hydration
// - Use for: Critical scripts (polyfills, A/B testing)
// - Blocks: Page hydration (use sparingly)
// - Performance impact: +500ms to TBT (Total Blocking Time)

// afterInteractive: Loads after page is interactive (default)
// - Use for: Analytics, tag managers
// - Blocks: Nothing
// - Performance impact: Minimal (~50ms)

// lazyOnload: Loads after all other resources
// - Use for: Chat widgets, social embeds
// - Blocks: Nothing
// - Performance impact: None (loads during idle time)

// worker: Loads in Web Worker (experimental)
// - Use for: Heavy computations
// - Blocks: Nothing (runs in background thread)
```

**Script Loading Timeline:**

```
beforeInteractive:
HTML parse → Script download → Script execute → Hydration → Interactive

afterInteractive:
HTML parse → Hydration → Interactive → Script download → Script execute

lazyOnload:
HTML parse → Hydration → Interactive → All resources loaded → Script download
```

### Advanced Optimization Techniques

**1. Module Federation (Micro-frontends):**
```typescript
// Share dependencies across multiple Next.js apps
// Reduces duplication, improves cache hit rate
// Example: Main app (500kb) + Dashboard app (200kb) sharing React (100kb)
// Without federation: 700kb total
// With federation: 600kb total (14% reduction)
```

**2. Partial Hydration (React Server Components):**
```typescript
// Only hydrate interactive components
// Static content remains as HTML (no JavaScript)
// Reduces bundle size by 40-60% for content-heavy sites
```

**3. Edge Runtime Optimization:**
```typescript
// Edge Functions use lightweight runtime (no Node.js APIs)
// Cold start: <10ms (vs 100-500ms for Node.js runtime)
// Reduces bundle size by excluding Node.js polyfills
// Use for: API routes, middleware, simple SSR
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Performance Optimization Debugging</strong></summary>

### Production Performance Crisis

**Context:** E-commerce platform experiencing slow page loads and poor Core Web Vitals scores after feature launch.

**Initial Metrics (Production - 1 week after deploy):**

```typescript
// Core Web Vitals (Field Data - Real Users):
LCP (Largest Contentful Paint): 6.2s (Poor - target: <2.5s)
FID (First Input Delay): 320ms (Needs Improvement - target: <100ms)
CLS (Cumulative Layout Shift): 0.42 (Poor - target: <0.1)
FCP (First Contentful Paint): 3.8s (Poor - target: <1.8s)
TBT (Total Blocking Time): 1,200ms (Poor - target: <200ms)

// Business Impact:
- Bounce rate: 62% (up from 38%)
- Conversion rate: 1.2% (down from 3.8%)
- Revenue impact: -$180,000/week
- Mobile users: 78% (primary affected segment)
- Google Search ranking: Dropped 15 positions

// User Complaints:
- "Images take forever to load"
- "Page jumps around when loading"
- "Can't click anything for several seconds"
```

### Investigation Process

**Step 1: Lighthouse Audit Analysis**

```bash
# Run Lighthouse CI locally
npm run build
npm start
lighthouse http://localhost:3000 --view

# Key findings:
# 1. Performance score: 38/100
# 2. Opportunities (potential savings):
#    - Properly size images: 4.2s
#    - Defer offscreen images: 3.1s
#    - Eliminate render-blocking resources: 1.8s
#    - Reduce unused JavaScript: 2.4s
#    - Serve images in next-gen formats: 1.9s
```

**Step 2: Bundle Analysis**

```bash
# Generate bundle report
ANALYZE=true npm run build

# Findings:
# Total bundle size: 2.4MB (parsed)
# Top issues:
# 1. moment.js: 289kb (only using .format())
# 2. lodash: 531kb (importing entire library)
# 3. chart.js + dependencies: 420kb (loaded on homepage)
# 4. material-ui icons: 680kb (importing all icons)
# 5. Duplicate dependencies: react-query (2 versions)
```

**Step 3: Network Analysis**

```typescript
// Chrome DevTools → Network tab findings:

// Images (Homepage):
// - 24 product images (average 800kb each = 19.2MB total)
// - Using <img> tags instead of next/image
// - No lazy loading, all images load immediately
// - Serving PNG instead of WebP/AVIF
// - No responsive sizing (serving 4K images to mobile)

// Fonts:
// - Loading 8 Google Fonts from CDN (6 requests)
// - FOIT (Flash of Invisible Text) on slow connections
// - No preloading, fonts load after CSS

// Third-Party Scripts:
// - Google Analytics (blocking, 47kb)
// - Intercom chat widget (blocking, 234kb)
// - Facebook Pixel (blocking, 89kb)
// - All loaded with strategy="beforeInteractive"
```

**Step 4: Coverage Analysis**

```typescript
// Chrome DevTools → Coverage tab:

// Unused JavaScript: 68% (1.6MB of 2.4MB)
// Unused CSS: 82% (340kb of 412kb)

// Specific issues:
// - All Material-UI components loaded on every page
// - Chart library loaded on homepage (only used in /dashboard)
// - Entire lodash library when only using 3 functions
```

### Root Cause Analysis

**Primary Issues Identified:**

1. **Image Optimization Failure:**
   - Developer bypassed next/image for "quick implementation"
   - No automatic format conversion (PNG → WebP/AVIF)
   - No lazy loading causing 19.2MB initial load
   - No responsive sizing (4K images to mobile phones)

2. **Bundle Size Explosion:**
   - Heavy dependencies imported without tree-shaking
   - Dynamic imports missing for non-critical components
   - Duplicate dependencies due to version mismatches

3. **Render-Blocking Scripts:**
   - All third-party scripts using beforeInteractive
   - Blocking main thread for 1.2 seconds
   - No prioritization of critical vs non-critical scripts

4. **Font Loading Issues:**
   - External font requests causing layout shift
   - No preloading of critical fonts
   - Using display: block (FOIT) instead of swap

### Solution Implementation

**Fix 1: Image Optimization (LCP improvement: 6.2s → 2.1s)**

```typescript
// Before (❌ Poor LCP: 6.2s):
<img src="/products/image1.png" alt="Product" />

// After (✅ Good LCP: 2.1s):
import Image from 'next/image';

<Image
  src="/products/image1.png"
  alt="Product"
  width={800}
  height={600}
  priority // Above-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Results after fix:
// - Image size: 800kb PNG → 120kb WebP (85% reduction)
// - Initial page load: 19.2MB → 2.4MB (87.5% reduction)
// - LCP: 6.2s → 2.1s (66% improvement)
// - Mobile LCP: 12.4s → 3.8s (69% improvement)
```

**Fix 2: Bundle Optimization (TBT improvement: 1,200ms → 280ms)**

```typescript
// Before (❌ 2.4MB bundle):
import _ from 'lodash'; // 531kb
import moment from 'moment'; // 289kb
import { Chart } from 'chart.js'; // 420kb (on homepage!)
import * as Icons from '@mui/icons-material'; // 680kb

// After (✅ 680kb bundle - 72% reduction):
import { debounce, throttle } from 'lodash-es'; // 12kb
import { format, parseISO } from 'date-fns'; // 8kb
// Chart loaded dynamically only on dashboard
const Chart = dynamic(() => import('chart.js'), { ssr: false });
import SearchIcon from '@mui/icons-material/Search'; // 3kb

// Dynamic import for heavy components:
const ProductChart = dynamic(() => import('@/components/ProductChart'), {
  loading: () => <Skeleton height={400} />,
  ssr: false,
});

// Results after fix:
// - Main bundle: 2.4MB → 680kb (72% reduction)
// - TBT: 1,200ms → 280ms (77% improvement)
// - FID: 320ms → 85ms (73% improvement)
```

**Fix 3: Script Loading Strategy (FCP improvement: 3.8s → 1.2s)**

```typescript
// Before (❌ All blocking):
<Script src="analytics.js" strategy="beforeInteractive" />
<Script src="intercom.js" strategy="beforeInteractive" />
<Script src="facebook-pixel.js" strategy="beforeInteractive" />

// After (✅ Prioritized loading):
// Critical analytics (minimal impact)
<Script src="analytics.js" strategy="afterInteractive" />

// Non-critical widgets (load last)
<Script src="intercom.js" strategy="lazyOnload" />
<Script src="facebook-pixel.js" strategy="lazyOnload" />

// Results after fix:
// - Blocking time: 1,200ms → 50ms (96% improvement)
// - FCP: 3.8s → 1.2s (68% improvement)
// - TTI: 4.2s → 1.6s (62% improvement)
```

**Fix 4: Font Optimization (CLS improvement: 0.42 → 0.05)**

```typescript
// Before (❌ External fonts with FOIT):
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=block"
  rel="stylesheet"
/>

// After (✅ Self-hosted with swap):
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // FOUT instead of FOIT
  preload: true,
  variable: '--font-inter',
  weight: ['400', '700'],
});

// Results after fix:
// - Font requests: 6 external → 0 (inlined)
// - CLS: 0.42 → 0.05 (88% improvement)
// - FCP: 1.2s → 0.9s (25% improvement)
```

### Post-Fix Metrics

**Core Web Vitals (After Optimization):**

```typescript
// Production metrics (2 weeks after fixes):
LCP: 2.1s ✅ (was 6.2s - 66% improvement)
FID: 85ms ✅ (was 320ms - 73% improvement)
CLS: 0.05 ✅ (was 0.42 - 88% improvement)
FCP: 0.9s ✅ (was 3.8s - 76% improvement)
TBT: 280ms (was 1,200ms - 77% improvement)

// Lighthouse scores:
Performance: 38 → 94 (+147%)
Accessibility: 87 → 95
Best Practices: 79 → 92
SEO: 90 → 98

// Business impact (2 weeks after):
Bounce rate: 62% → 34% (45% improvement)
Conversion rate: 1.2% → 4.1% (+242%)
Revenue: +$240,000/week (compared to low point)
Mobile conversion: 0.8% → 3.6% (+350%)
Google ranking: Recovered 12 positions
Page views per session: 2.1 → 4.3 (+105%)
```

### Lessons Learned

**What Went Wrong:**

1. **Lack of performance budgets** - No alerts when bundle exceeded thresholds
2. **No performance testing in CI/CD** - Changes deployed without Lighthouse checks
3. **Developer workarounds** - Bypassing next/image "to move faster"
4. **No monitoring** - Took 1 week to discover issues in production

**Preventive Measures Implemented:**

```typescript
// 1. Performance budgets in next.config.js
module.exports = {
  experimental: {
    bundlePagesRouterDependencies: true,
  },
  // Fail build if bundle exceeds limits
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

// 2. Lighthouse CI in GitHub Actions
// .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  run: |
    npm run build
    npm run start &
    npx @lhci/cli@0.12.x autorun
  env:
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

// 3. Bundle size checks
// package.json
{
  "scripts": {
    "size-check": "size-limit",
    "precommit": "npm run size-check"
  }
}

// .size-limit.js
module.exports = [
  {
    path: '.next/static/chunks/*.js',
    limit: '300 kb', // Fail if any chunk exceeds 300kb
  },
  {
    path: '.next/static/css/*.css',
    limit: '50 kb',
  },
];

// 4. Real User Monitoring (RUM)
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics /> {/* Track real user metrics */}
        <SpeedInsights /> {/* Performance monitoring */}
      </body>
    </html>
  );
}
```

**Key Takeaways:**

1. **Always use next/image** - Automatic optimization saves months of manual work
2. **Bundle analysis is mandatory** - Run before every major release
3. **Performance budgets prevent regressions** - Fail builds that exceed limits
4. **Prioritize script loading** - Most third-party scripts can be lazyOnload
5. **Monitor production metrics** - Set up alerts for performance degradation
6. **Test on real devices** - Lighthouse on fast hardware doesn't reflect user experience

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Next.js Performance Optimization Strategies</strong></summary>

### 1. Image Optimization: next/image vs Manual Optimization

**Using next/image (Recommended for most cases):**

**Pros:**
- ✅ **Zero configuration** - Works out of the box with sensible defaults
- ✅ **Automatic format conversion** - WebP/AVIF based on browser support (40-60% smaller)
- ✅ **Built-in lazy loading** - Saves bandwidth, improves initial load time
- ✅ **Responsive images** - Automatic srcset generation for different screen sizes
- ✅ **Blur placeholders** - Prevents CLS (Cumulative Layout Shift)
- ✅ **On-demand optimization** - Images optimized when first requested, then cached
- ✅ **CDN integration** - Works seamlessly with Vercel Edge Network

**Cons:**
- ❌ **Vercel dependency** - Self-hosted requires custom image optimization server
- ❌ **Build complexity** - Additional caching and CDN configuration for non-Vercel
- ❌ **Limited art direction** - Harder to use different images for different breakpoints
- ❌ **API route overhead** - Optimization happens server-side (cold starts possible)

**Manual Optimization (Custom solutions):**

**Pros:**
- ✅ **Full control** - Complete flexibility over image processing pipeline
- ✅ **Art direction** - Easy to serve different images for mobile/desktop/tablet
- ✅ **No vendor lock-in** - Works on any hosting platform
- ✅ **Build-time optimization** - No runtime overhead, images optimized during build

**Cons:**
- ❌ **Manual setup** - Configure sharp, ImageMagick, or external services (Cloudinary, imgix)
- ❌ **Maintenance burden** - Handle format conversion, responsive images, lazy loading yourself
- ❌ **No automatic optimization** - Must manually optimize each image or build custom pipeline
- ❌ **Cache management** - Manual cache invalidation and CDN configuration

**When to Use Each:**

```typescript
// Use next/image when:
// - Standard image requirements (product images, avatars, blog posts)
// - Deploying to Vercel (zero config)
// - Team lacks image optimization expertise
// - Want automatic WebP/AVIF conversion
// - Need lazy loading and responsive images

// Use manual optimization when:
// - Complex art direction needs (different crops per breakpoint)
// - Already using external image service (Cloudinary, imgix)
// - Self-hosting with specific image processing requirements
// - Need custom watermarking or image transformations
// - Want build-time optimization (no runtime overhead)
```

**Example Decision Matrix:**

```typescript
// Scenario 1: E-commerce product images (100,000+ images)
// Decision: next/image + Cloudinary
// Reason: Offload storage to Cloudinary, use next/image for automatic optimization

// next.config.js
module.exports = {
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/demo/image/upload/',
  },
};

// Scenario 2: Marketing landing page (10 hero images, heavy art direction)
// Decision: Manual optimization with picture element
// Reason: Need different crops for mobile/desktop, build-time optimization

<picture>
  <source media="(min-width: 1024px)" srcSet="/hero-desktop.webp" />
  <source media="(min-width: 640px)" srcSet="/hero-tablet.webp" />
  <img src="/hero-mobile.webp" alt="Hero" />
</picture>

// Scenario 3: Blog with 1,000 articles (simple images)
// Decision: next/image (default)
// Reason: Perfect fit, automatic optimization, lazy loading
```

### 2. Font Loading: Self-Hosted vs CDN

**Self-Hosted Fonts (next/font - Recommended):**

**Pros:**
- ✅ **Zero external requests** - No DNS lookup, TLS handshake (saves 300-500ms)
- ✅ **No GDPR concerns** - Google Fonts CDN logs IP addresses
- ✅ **Inlined CSS** - Font declarations in HTML head (one less request)
- ✅ **Guaranteed availability** - No third-party dependency
- ✅ **Build-time subsetting** - Only include used characters (30-50% smaller)
- ✅ **Prevents layout shift** - Font metrics included, no FOUT/FOIT

**Cons:**
- ❌ **Larger HTML** - Font CSS inlined in every page (3-5kb)
- ❌ **No browser cache sharing** - Each site downloads fonts (CDN would be shared)
- ❌ **Build time increase** - Fonts downloaded during build (adds 5-10s)

**CDN Fonts (Google Fonts, Adobe Fonts):**

**Pros:**
- ✅ **Browser cache sharing** - If user visited another site with same font, it's cached
- ✅ **Latest versions** - Automatic updates when Google releases font improvements
- ✅ **Smaller HTML** - One link tag vs inlined CSS
- ✅ **No build overhead** - Fonts loaded at runtime

**Cons:**
- ❌ **External dependency** - If CDN down, fonts fail to load
- ❌ **Privacy concerns** - Google logs IP addresses (GDPR violation in some countries)
- ❌ **Extra requests** - DNS lookup + TLS handshake + font download (300-800ms)
- ❌ **FOUT/FOIT** - Flash of unstyled/invisible text during loading
- ❌ **Layout shift** - Text renders, then shifts when custom font loads

**Performance Comparison:**

```typescript
// Scenario: Loading Inter font (Regular + Bold)

// Self-hosted (next/font):
// Build time: +8s (one-time)
// Runtime: 0ms external requests
// HTML size: +4kb (inlined CSS)
// Total time to font render: 200ms (parallel with page load)

// Google Fonts CDN:
// Build time: 0s
// Runtime: 450ms (DNS: 80ms, TLS: 120ms, download: 250ms)
// HTML size: +120 bytes (<link> tag)
// Total time to font render: 650ms

// Winner: Self-hosted (450ms faster, 69% improvement)
```

**When to Use Each:**

```typescript
// Use self-hosted (next/font) when:
// - Performance is critical (Core Web Vitals optimization)
// - GDPR compliance required
// - Guaranteed font availability needed
// - Targeting markets with slow connections (emerging markets)

// Use CDN when:
// - Rapid prototyping (no build setup needed)
// - Using fonts not available in next/font (obscure fonts)
// - Multiple external font providers (Adobe Fonts, Font Awesome)
// - Legacy app migration (gradual transition)
```

### 3. Code Splitting: Automatic vs Manual Dynamic Imports

**Automatic Route-Based Splitting (Default):**

**Pros:**
- ✅ **Zero configuration** - Next.js does this automatically
- ✅ **Optimal for most apps** - Each page is separate chunk
- ✅ **Prefetching** - Visible Link components prefetch chunks
- ✅ **Shared dependencies** - Common code extracted automatically

**Cons:**
- ❌ **No fine-grained control** - Can't split within a page
- ❌ **Large page bundles** - If page imports many components, all load together
- ❌ **Prefetch overhead** - May prefetch chunks user never visits

**Manual Dynamic Imports:**

**Pros:**
- ✅ **Fine-grained control** - Split any component into separate chunk
- ✅ **On-demand loading** - Load only when component renders
- ✅ **Conditional loading** - Load based on user interaction or feature flags
- ✅ **Reduces TBT** - Defer non-critical JavaScript

**Cons:**
- ❌ **Manual effort** - Must identify and implement splits
- ❌ **Loading states** - Need to handle loading UI for every split
- ❌ **Over-splitting risk** - Too many chunks increases HTTP requests
- ❌ **Debugging complexity** - Harder to trace issues across chunks

**Performance Trade-offs:**

```typescript
// Scenario: Dashboard page with heavy chart library (420kb)

// Approach 1: No splitting (❌ Poor FCP)
import Chart from 'chart.js';

export default function Dashboard() {
  return <Chart data={data} />; // 420kb loaded upfront
}
// FCP: 2.8s, TBT: 800ms

// Approach 2: Dynamic import (✅ Good FCP, slightly slower chart render)
const Chart = dynamic(() => import('chart.js'), {
  loading: () => <Skeleton height={400} />,
  ssr: false,
});

export default function Dashboard() {
  return <Chart data={data} />; // Loads after page interactive
}
// FCP: 1.2s (57% faster), TBT: 200ms (75% faster)
// Chart render delay: +300ms (trade-off)

// Approach 3: Conditional loading (✅ Best for non-essential features)
export default function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      {showChart && <Chart data={data} />} // Only loads when clicked
    </div>
  );
}
// Initial FCP: 1.0s, TBT: 150ms
// Chart loads only when user needs it (zero overhead if unused)
```

**When to Use Each:**

```typescript
// Use automatic splitting when:
// - Standard multi-page app with distinct routes
// - Each page has reasonable bundle size (<200kb)
// - Prefetching improves UX (fast navigation)

// Use manual dynamic imports when:
// - Large components (>50kb) not immediately visible
// - Conditional features (admin panel, premium features)
// - Third-party widgets (chat, analytics dashboards)
// - Components with heavy dependencies (charts, editors, maps)

// Over-splitting example (❌ Too granular):
const Button = dynamic(() => import('./Button')); // 2kb component, not worth splitting
const Modal = dynamic(() => import('./Modal')); // 5kb component, not worth splitting

// Good splitting example (✅ Appropriate granularity):
const RichTextEditor = dynamic(() => import('./RichTextEditor')); // 120kb
const VideoPlayer = dynamic(() => import('./VideoPlayer')); // 85kb
const ChartLibrary = dynamic(() => import('./ChartLibrary')); // 420kb
```

### 4. Bundle Optimization: Replace Dependencies vs Tree-Shaking

**Replacing Heavy Dependencies:**

**Pros:**
- ✅ **Immediate size reduction** - Can achieve 80-95% reduction
- ✅ **No configuration** - Just swap imports
- ✅ **Better performance** - Lighter alternatives often faster
- ✅ **Modern code** - Newer libraries use better algorithms

**Cons:**
- ❌ **API differences** - May need to refactor code
- ❌ **Feature gaps** - Lighter alternatives may lack features
- ❌ **Migration effort** - Time-consuming for large codebases
- ❌ **Risk of bugs** - Different implementations may behave differently

**Tree-Shaking with ES Modules:**

**Pros:**
- ✅ **Keep existing API** - No code changes needed
- ✅ **Incremental improvement** - Replace imports one at a time
- ✅ **Automatic optimization** - Webpack removes unused code
- ✅ **Type safety preserved** - No API changes, no type errors

**Cons:**
- ❌ **Limited reduction** - Only removes unused exports, not implementation size
- ❌ **Side effects** - Some libraries not fully tree-shakeable
- ❌ **Still heavy** - Even tree-shaken lodash-es larger than alternatives

**Comparison:**

```typescript
// Scenario: Need date formatting and debounce function

// Option 1: Heavy libraries (❌ 304kb total)
import moment from 'moment'; // 289kb
import _ from 'lodash'; // 15kb (just debounce)

// Option 2: Tree-shakeable versions (⚠️ 20kb total, 93% reduction)
import { format } from 'date-fns'; // 8kb
import { debounce } from 'lodash-es'; // 12kb

// Option 3: Lightweight alternatives (✅ 3kb total, 99% reduction)
import dayjs from 'dayjs'; // 2kb
import debounce from 'just-debounce-it'; // 1kb

// Trade-off analysis:
// Option 1: Full features, huge bundle, familiar API
// Option 2: Good compromise, moderate reduction, familiar API
// Option 3: Best performance, minimal features, learning curve

// When to use each:
// - Heavy moment.js: Never (deprecated, always use alternative)
// - date-fns: Complex date operations (timezone, formatting, parsing)
// - dayjs: Simple date formatting (smaller, faster)

// - Full lodash: Never (always use lodash-es or alternatives)
// - lodash-es: Need multiple utilities (10+ functions)
// - just-* libraries: Need 1-3 utilities (95% smaller)
```

**Decision Framework:**

```typescript
// Step 1: Identify heavy dependencies (npm run analyze)
// Step 2: Check usage (How many functions do you use?)
// Step 3: Evaluate alternatives

// If using 1-3 functions: Replace with lightweight alternative
// - moment → dayjs (2kb vs 289kb)
// - lodash → just-* libraries (1kb vs 531kb)
// - axios → fetch (native, 0kb vs 15kb)

// If using 5-10 functions: Tree-shakeable version
// - lodash → lodash-es
// - date-fns (already tree-shakeable)

// If using 15+ functions: Keep library OR re-evaluate if you need all features
// - Do you really need all Material-UI components? (Consider shadcn/ui)
// - Do you need entire icon pack? (Use specific icons only)
```

### 5. Script Loading: beforeInteractive vs afterInteractive vs lazyOnload

**beforeInteractive (Highest Priority):**

**Use for:**
- Polyfills required before React hydration
- Critical A/B testing scripts (avoid layout shift)
- Bot detection (must run before user interaction)

**Pros:**
- ✅ Guaranteed execution before page interactive
- ✅ No layout shift for critical UI changes

**Cons:**
- ❌ Blocks hydration (delays TTI by 200-500ms)
- ❌ Increases TBT (Total Blocking Time)

**afterInteractive (Default - Recommended for most scripts):**

**Use for:**
- Analytics (Google Analytics, Segment)
- Tag managers (Google Tag Manager)
- Error tracking (Sentry)

**Pros:**
- ✅ Doesn't block hydration
- ✅ Loads quickly after page interactive
- ✅ Minimal impact on Core Web Vitals

**Cons:**
- ❌ May miss very early events (page view timing slightly off)

**lazyOnload (Lowest Priority):**

**Use for:**
- Chat widgets (Intercom, Zendesk)
- Social media embeds (Twitter, Facebook)
- Marketing pixels (Facebook Pixel, LinkedIn Insight)
- Non-critical third-party tools

**Pros:**
- ✅ Zero impact on page load performance
- ✅ Loads during browser idle time
- ✅ Best for Core Web Vitals

**Cons:**
- ❌ May not load immediately on slow connections
- ❌ User might interact before script loads

**Performance Comparison:**

```typescript
// Test scenario: Homepage with Google Analytics + Intercom chat

// All beforeInteractive (❌ Poor performance):
<Script src="analytics.js" strategy="beforeInteractive" /> // 47kb
<Script src="intercom.js" strategy="beforeInteractive" /> // 234kb
// TTI: 3.2s, TBT: 1,100ms, FID: 280ms

// All afterInteractive (⚠️ Okay performance):
<Script src="analytics.js" strategy="afterInteractive" />
<Script src="intercom.js" strategy="afterInteractive" />
// TTI: 1.8s, TBT: 400ms, FID: 120ms

// Prioritized (✅ Best performance):
<Script src="analytics.js" strategy="afterInteractive" />
<Script src="intercom.js" strategy="lazyOnload" />
// TTI: 1.4s, TBT: 180ms, FID: 65ms

// Savings: 1.8s faster TTI (56% improvement), 915ms less blocking time
```

**Decision Matrix:**

```typescript
// beforeInteractive (use sparingly):
// - Polyfills for unsupported browsers
// - Critical feature flags (must load before hydration)
// - Anti-bot scripts (must verify before user interaction)

// afterInteractive (default for analytics/tracking):
// - Google Analytics, Mixpanel, Segment
// - Error monitoring (Sentry, Rollbar)
// - Tag managers (Google Tag Manager)

// lazyOnload (default for non-critical tools):
// - Chat widgets (Intercom, Drift, Zendesk)
// - Social embeds (Twitter, Facebook, Instagram)
// - Marketing pixels (Facebook, LinkedIn, TikTok)
// - Heatmap tools (Hotjar, FullStory)
// - Feedback widgets (UserVoice, Canny)
```

### 6. Deployment Platform: Vercel vs Self-Hosted vs AWS/Cloudflare

**Vercel (Recommended for Next.js apps):**

**Pros:**
- ✅ **Zero-config deployment** - Git push to deploy
- ✅ **Edge Network** - Automatic CDN, globally distributed
- ✅ **Image Optimization API** - Built-in, no setup
- ✅ **Serverless functions** - Auto-scaling, no server management
- ✅ **Preview deployments** - Every PR gets unique URL
- ✅ **Analytics included** - Web Vitals tracking built-in

**Cons:**
- ❌ **Cost** - Can get expensive at scale ($20/mo → $2,000+/mo)
- ❌ **Vendor lock-in** - Hard to migrate away
- ❌ **Function limits** - 10s timeout on Hobby, 60s on Pro, 900s on Enterprise
- ❌ **Limited customization** - Can't customize server/runtime

**Self-Hosted (Docker/PM2/Node.js):**

**Pros:**
- ✅ **Full control** - Custom server, middleware, database on same machine
- ✅ **Cost-effective** - $5-50/mo VPS vs $200+/mo Vercel
- ✅ **No vendor lock-in** - Easy to migrate between hosts
- ✅ **Custom optimizations** - Nginx caching, load balancing

**Cons:**
- ❌ **Manual setup** - Configure Docker, PM2, Nginx, SSL yourself
- ❌ **No Image Optimization API** - Must set up sharp/ImageMagick
- ❌ **DevOps burden** - Handle scaling, monitoring, updates
- ❌ **No edge network** - Single server location (higher latency)

**AWS/Cloudflare (Enterprise-grade):**

**Pros:**
- ✅ **Scalability** - Handle millions of requests
- ✅ **Global edge network** - Low latency worldwide
- ✅ **Advanced features** - WAF, DDoS protection, custom routing
- ✅ **Integration** - Works with existing AWS services (RDS, S3, Lambda)

**Cons:**
- ❌ **Complexity** - Steep learning curve (CloudFront, Lambda@Edge, S3)
- ❌ **Cost** - Unpredictable, can spike unexpectedly
- ❌ **Setup time** - Days/weeks vs minutes on Vercel

**Cost Comparison (10,000 monthly visitors):**

```typescript
// Vercel:
// - Hobby: Free (non-commercial)
// - Pro: $20/mo (1 user, 100GB bandwidth)
// - Above limits: $0.40/GB bandwidth, $2/1000 Serverless Functions

// Self-hosted (DigitalOcean):
// - $12/mo Droplet (2GB RAM, 50GB SSD, 2TB transfer)
// - +$5/mo Managed Database (if needed)
// - Total: $17/mo (fixed cost)

// AWS (100,000+ monthly visitors):
// - CloudFront: $50-200/mo
// - Lambda: $10-50/mo
// - S3: $5-20/mo
// - Total: $65-270/mo (variable cost)
```

**When to Use Each:**

```typescript
// Use Vercel when:
// - Early-stage startup (focus on product, not DevOps)
// - Small-medium traffic (<100k visitors/mo)
// - Need preview deployments for every PR
// - Team lacks DevOps expertise
// - Want automatic Core Web Vitals monitoring

// Use self-hosted when:
// - Cost-sensitive ($200/mo Vercel → $20/mo VPS)
// - Need custom server logic (WebSockets, custom middleware)
// - Want full control over infrastructure
// - High traffic with predictable patterns

// Use AWS/Cloudflare when:
// - Enterprise-scale (millions of users)
// - Need advanced security (WAF, DDoS protection)
// - Global audience requiring edge network
// - Existing AWS infrastructure (RDS, S3, etc.)
// - Compliance requirements (SOC 2, HIPAA)
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Next.js Performance Optimization</strong></summary>

### The Restaurant Kitchen Analogy

Imagine Next.js performance optimization is like running an efficient restaurant kitchen:

**Image Optimization (next/image) = Food Prep Station**

Think of next/image like a smart food prep station:

- **Without optimization (regular `<img>` tag):** Chef serves a whole watermelon to every customer, even if they only want a slice. Customer waits 10 minutes for the watermelon to arrive at their table.

- **With next/image:** Chef cuts watermelon into appropriate slices based on table size (responsive sizing), wraps them in plastic wrap (compression), and only brings them out when customer finishes appetizer (lazy loading). Customer gets their slice in 2 minutes.

```typescript
// ❌ Bad: Serving whole watermelon (2MB PNG to mobile phone)
<img src="/hero.jpg" alt="Hero" />

// ✅ Good: Serving appropriate slice (200kb WebP to mobile)
<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw" // Different sizes for different "table sizes"
/>
```

**Why it matters:** A 2MB image on mobile 3G takes 12 seconds to load. A 200kb optimized image takes 1.2 seconds. That's 10 seconds of staring at a blank screen avoided!

**Font Optimization (next/font) = Pre-made Sauces**

Think of fonts like sauces in a restaurant:

- **CDN fonts (Google Fonts):** Chef orders sauce from supplier across town. Customer waits for delivery truck (300-500ms). Sometimes truck is late or delivery fails.

- **Self-hosted fonts (next/font):** Chef makes sauce in advance and stores it in the kitchen fridge. Instant access, no waiting, guaranteed availability.

```typescript
// ❌ Bad: Ordering from Google Fonts supplier
<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet" />
// Wait for: DNS lookup (80ms) + TLS handshake (120ms) + download (250ms) = 450ms

// ✅ Good: Pre-made sauce in kitchen
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
// Total wait: 0ms (loaded with page, parallel)
```

**Code Splitting = Menu Planning**

Think of code splitting like planning a restaurant menu:

- **No splitting:** Bringing all 200 menu items to every table at once. Customer gets overwhelmed, table collapses under weight.

- **Route-based splitting (automatic):** Each course (page) has its own menu. Appetizer menu first, then main course menu, then dessert menu.

- **Dynamic imports (manual):** Bring dessert menu only if customer asks for it. Why show dessert menu if they're just getting coffee?

```typescript
// ❌ Bad: All menu items upfront (2.4MB bundle on homepage)
import Chart from 'chart.js';
import VideoPlayer from 'video-player';
import RichTextEditor from 'rich-text-editor';
// Customer waits 8 seconds to see menu because it's so heavy

// ✅ Good: Bring menus as needed
const Chart = dynamic(() => import('chart.js'));
// Only loads when customer visits /dashboard page (300ms delay, but only when needed)

// Even better: Only if customer asks
{showChart && <Chart data={data} />}
// Customer clicks "Show Chart" button, then chart loads (zero overhead if not used)
```

**Script Loading Strategies = Service Timing**

Think of third-party scripts like different restaurant services:

- **beforeInteractive:** Lighting and air conditioning (must be ready before customers arrive)
- **afterInteractive:** Background music (turn on after customers seated)
- **lazyOnload:** Dessert cart (bring out only after main course finished)

```typescript
// ❌ Bad: All services blocking the entrance
<Script src="analytics.js" strategy="beforeInteractive" /> // Turn on music before doors open
<Script src="intercom.js" strategy="beforeInteractive" /> // Bring dessert cart to entrance
// Customers wait 3 seconds at locked door while staff sets up

// ✅ Good: Prioritize service
<Script src="analytics.js" strategy="afterInteractive" /> // Music after seating
<Script src="intercom.js" strategy="lazyOnload" /> // Dessert cart after main course
// Customers enter immediately, enjoy experience
```

### Core Web Vitals = Restaurant Reviews

Think of Core Web Vitals like Yelp reviews for your restaurant:

**LCP (Largest Contentful Paint) = "How long until I see my main course?"**

- **Good (<2.5s):** Main course arrives within 2 minutes. Customer happy.
- **Poor (>4.0s):** Main course takes 6 minutes. Customer frustrated, considers leaving.

```typescript
// Optimize LCP:
// 1. Serve main course fast (optimize hero image with priority flag)
<Image src="/hero.jpg" priority /> // Preload main course

// 2. Don't make customer wait for all courses at once (code splitting)
// 3. Use pre-made sauces (self-hosted fonts, no external requests)
```

**FID (First Input Delay) = "How long until waiter responds to my order?"**

- **Good (<100ms):** Waiter takes order immediately when you raise your hand.
- **Poor (>300ms):** Waiter ignores you for 5 seconds while juggling plates (too much JavaScript blocking main thread).

```typescript
// Optimize FID:
// 1. Don't overload waiters (reduce JavaScript bundle size)
const HeavyComponent = dynamic(() => import('./Heavy')); // Send some waiters to break

// 2. Defer non-essential tasks (lazyOnload scripts)
<Script src="chat-widget.js" strategy="lazyOnload" /> // Clean tables later, take orders first
```

**CLS (Cumulative Layout Shift) = "Does the table keep moving?"**

- **Good (<0.1):** Table stays stable, you can eat comfortably.
- **Poor (>0.25):** Table keeps shifting, drinks spill, frustrating experience.

```typescript
// Optimize CLS:
// 1. Set table dimensions in advance (width/height on images)
<Image src="/hero.jpg" width={1920} height={1080} /> // Reserve table space

// 2. Don't rearrange table when plates arrive (font-display: swap)
const inter = Inter({ display: 'swap' }); // Show placeholder until custom plates ready

// 3. Don't insert new tables above customer (avoid dynamic content above fold)
```

### Interview Answer Template

**Question:** "How do you optimize a Next.js app for production?"

**Answer Structure:**

**1. Start with the "Why":**
"Performance directly impacts user experience and business metrics. A 1-second delay in load time can decrease conversions by 7%. I focus on Core Web Vitals: LCP, FID, and CLS."

**2. Cover the Main Strategies:**

**Images (LCP improvement):**
"I always use next/image with the priority flag for above-fold images. This enables automatic lazy loading, WebP/AVIF conversion, and responsive sizing. For a typical e-commerce homepage, this reduces image payload from 5MB to 800kb—an 84% reduction."

**Fonts (CLS improvement):**
"I use next/font to self-host Google Fonts. This eliminates external requests, prevents layout shift, and improves FCP by 300-500ms compared to CDN fonts."

**Code Splitting (FID improvement):**
"I use dynamic imports for heavy components like charts, video players, and rich text editors. This reduces initial bundle size by 40-60% and improves TBT from 1,200ms to 300ms."

**Scripts (TBT reduction):**
"I prioritize script loading: afterInteractive for analytics, lazyOnload for chat widgets. This prevents render-blocking JavaScript and improves TTI by 50-70%."

**3. Mention Monitoring:**
"I set up Lighthouse CI in the deployment pipeline to catch performance regressions. We also use Vercel Analytics to track real user Core Web Vitals and set alerts for degradation."

**4. Give Specific Metrics (if possible):**
"In my last project, these optimizations improved Lighthouse performance score from 42 to 94, reduced LCP from 5.8s to 2.1s, and increased mobile conversion rate by 180%."

### Common Mistakes to Avoid (ELI5)

**Mistake 1: Not using next/image**
- **Bad:** Using `<img>` tags (like serving uncut watermelons)
- **Good:** Using `<Image>` with priority flag (pre-sliced, optimized portions)

**Mistake 2: Loading all JavaScript upfront**
- **Bad:** Importing chart.js on homepage (bringing dessert cart to entrance)
- **Good:** Dynamic import only on /dashboard (bring dessert cart when needed)

**Mistake 3: Blocking scripts**
- **Bad:** All scripts beforeInteractive (locking doors while staff sets up)
- **Good:** afterInteractive for analytics, lazyOnload for widgets (prioritized service)

**Mistake 4: No performance monitoring**
- **Bad:** Deploying without Lighthouse checks (no Yelp reviews, no idea if customers unhappy)
- **Good:** Lighthouse CI + Vercel Analytics (real-time feedback, catch issues early)

### Quick Win Checklist

If you only have 30 minutes to optimize a Next.js app:

**1. Replace all `<img>` with `<Image>` (10 mins):**
```typescript
// Find all: <img src=
// Replace with: <Image src= width={} height={}
// Add priority to hero images
```

**2. Add next/font (5 mins):**
```typescript
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });
// Add to layout: className={inter.className}
```

**3. Change script strategies (5 mins):**
```typescript
// Change all strategy="beforeInteractive" to:
// - afterInteractive (analytics)
// - lazyOnload (chat widgets, social embeds)
```

**4. Run bundle analyzer (10 mins):**
```bash
ANALYZE=true npm run build
# Find heavy dependencies (>50kb), replace with lighter alternatives
# moment → date-fns, lodash → lodash-es
```

**Expected Results:**
- LCP: 40-60% improvement
- FID: 50-70% improvement
- CLS: 70-90% improvement
- Bundle size: 30-50% reduction
- Lighthouse score: +20-40 points

These quick wins take 30 minutes but deliver massive performance improvements!

</details>

---

