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

