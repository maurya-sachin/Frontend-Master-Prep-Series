# Next.js Rendering Strategies

> SSR, SSG, ISR, CSR, streaming, and when to use each rendering method.

---

## Question 1: Next.js Rendering Methods Comparison

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Vercel, Meta

### Question
Explain SSR, SSG, ISR, and CSR in Next.js. When to use each?

### Answer

**Rendering Methods:**
1. **SSG** - Static Site Generation (build time)
2. **SSR** - Server-Side Rendering (request time)
3. **ISR** - Incremental Static Regeneration (hybrid)
4. **CSR** - Client-Side Rendering (browser)

**Key Points:**
1. **Performance** - SSG fastest (CDN), SSR slower (per-request), CSR initial load slow
2. **SEO** - SSG/SSR excellent, CSR requires work
3. **Data freshness** - SSR always fresh, SSG stale, ISR periodic, CSR real-time
4. **Cost** - SSG cheapest, SSR expensive at scale
5. **Use case matters** - No one-size-fits-all solution

### Code Example

```jsx
// 1. SSG (STATIC SITE GENERATION)
// ✅ Best for: Blog posts, documentation, marketing pages
// Pros: Fastest, cheapest, SEO perfect
// Cons: Stale data until rebuild

export async function getStaticProps() {
  const posts = await fetchPosts();

  return {
    props: { posts }
    // No revalidate = pure static
  };
}

function BlogPage({ posts }) {
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// When to use SSG:
// - Content doesn't change often
// - Same content for all users
// - SEO critical
// - Performance critical

// 2. SSR (SERVER-SIDE RENDERING)
// ✅ Best for: User dashboards, personalized pages, real-time data
// Pros: Always fresh data, SEO good
// Cons: Slower, expensive at scale

export async function getServerSideProps(context) {
  const { req } = context;
  const user = await getUserFromCookie(req.cookies);
  const dashboard = await fetchUserDashboard(user.id);

  return {
    props: { user, dashboard }
  };
}

function DashboardPage({ user, dashboard }) {
  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <DashboardStats stats={dashboard} />
    </div>
  );
}

// When to use SSR:
// - User-specific data
// - Real-time data
// - Need request context (cookies, headers)
// - Can't be cached

// 3. ISR (INCREMENTAL STATIC REGENERATION)
// ✅ Best for: E-commerce, news, frequently updated content
// Pros: Fast + relatively fresh, best of both worlds
// Cons: Data can be slightly stale

export async function getStaticProps() {
  const products = await fetchProducts();

  return {
    props: { products },
    revalidate: 60 // Regenerate every 60 seconds
  };
}

// ISR Flow:
// 1. User requests page
// 2. Serve cached version (fast)
// 3. Check if revalidate time passed
// 4. If yes, regenerate in background
// 5. Next user gets fresh version

// When to use ISR:
// - Content updates periodically
// - Can tolerate slightly stale data
// - Need good performance
// - E-commerce product pages

// 4. CSR (CLIENT-SIDE RENDERING)
// ✅ Best for: Admin panels, interactive dashboards, private data
// Pros: Highly interactive, real-time updates
// Cons: SEO poor, slower initial load

function AdminDashboard() {
  const { data, error, isLoading } = useSWR('/api/admin/stats', fetcher, {
    refreshInterval: 3000 // Refresh every 3 seconds
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error />;

  return (
    <div>
      <Stats data={data} />
      <LiveChart data={data.chart} />
    </div>
  );
}

// When to use CSR:
// - Private, user-specific data
// - SEO not important
// - Highly interactive
// - Real-time updates

// 5. HYBRID APPROACH (Recommended)
// Mix strategies based on page requirements

// Layout: SSG (static)
// Header/Footer are static
export async function getStaticProps() {
  const navigation = await fetchNavigation();
  return { props: { navigation } };
}

function Layout({ navigation, children }) {
  return (
    <div>
      <Header nav={navigation} /> {/* SSG */}
      <main>{children}</main>
      <Footer /> {/* SSG */}
    </div>
  );
}

// Page content: ISR
function ProductPage({ product }) {
  // Product data from ISR
  const [cart, setCart] = useState([]);

  // Reviews: CSR (real-time)
  const { data: reviews } = useSWR(`/api/reviews/${product.id}`, fetcher);

  return (
    <div>
      <ProductDetails product={product} /> {/* ISR */}
      <Reviews reviews={reviews} /> {/* CSR */}
      <AddToCart onAdd={setCart} /> {/* CSR */}
    </div>
  );
}

// 6. COMPARISON TABLE
/*
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│   Feature   │     SSG     │     SSR     │     ISR     │     CSR     │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ Performance │   Fastest   │    Slow     │    Fast     │   Medium    │
│   (TTFB)    │   ~10ms     │  ~500ms     │   ~50ms     │   ~200ms    │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│     SEO     │  Perfect    │   Great     │   Great     │    Poor     │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│    Fresh    │    Stale    │   Always    │  Periodic   │  Real-time  │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│    Cost     │   Lowest    │  Highest    │    Low      │    Medium   │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│   Scaling   │  Infinite   │  Limited    │  Excellent  │   Excellent │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
*/

// 7. DECISION FLOWCHART
function chooseRenderingMethod(page) {
  // Is it public content?
  if (isPublicContent) {
    // Does it change frequently?
    if (changesFrequently) {
      return 'ISR'; // E-commerce, news
    } else {
      return 'SSG'; // Blog, docs
    }
  } else {
    // Is SEO important?
    if (needsSEO) {
      return 'SSR'; // User profiles
    } else {
      return 'CSR'; // Admin dashboards
    }
  }
}

// 8. REAL-WORLD EXAMPLES

// Blog: SSG
// pages/blog/[slug].js
export async function getStaticPaths() {
  const posts = await getAllPosts();
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);
  return {
    props: { post },
    revalidate: 3600 // Rebuild every hour
  };
}

// E-commerce: ISR
export async function getStaticProps() {
  const products = await getProducts();
  return {
    props: { products },
    revalidate: 300 // Rebuild every 5 minutes
  };
}

// Dashboard: SSR + CSR
export async function getServerSideProps({ req }) {
  const user = await getUser(req.cookies.token);
  return { props: { user } };
}

function Dashboard({ user }) {
  // User from SSR
  // Stats from CSR (real-time)
  const { data: stats } = useSWR('/api/stats', fetcher, {
    refreshInterval: 5000
  });

  return <DashboardView user={user} stats={stats} />;
}
```

### Common Mistakes

- ❌ Using SSR for everything (expensive, slow)
- ❌ Using SSG for user-specific data (security risk)
- ❌ Not using ISR when appropriate (missing sweet spot)
- ❌ Using CSR for public content (poor SEO)
- ✅ Start with SSG + ISR, add SSR only when needed
- ✅ Use CSR for interactive features on SSG/SSR pages
- ✅ Mix strategies within same page

### Follow-up Questions

1. How does ISR work under the hood?
2. What happens when ISR revalidation fails?
3. Can you mix SSG and SSR in the same app?

### Resources
- [Next.js Rendering](https://nextjs.org/docs/basic-features/pages)
- [ISR Guide](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)

---

## Question 2: App Router Rendering (Next.js 13+)

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Vercel, Modern Next.js teams

### Question
How does rendering work in Next.js App Router? What are the differences from Pages Router?

### Answer

**App Router** - New default rendering model with React Server Components.

**Key Points:**
1. **Server Components by default** - Everything server-rendered unless marked `'use client'`
2. **Streaming** - Progressive rendering with Suspense
3. **Automatic code splitting** - Better performance out of the box
4. **No getServerSideProps** - Fetch directly in components
5. **Static by default** - Generates static HTML when possible

### Code Example

```typescript
// 1. SERVER COMPONENT (default)
// app/posts/page.tsx
// This is a Server Component (no 'use client')
async function PostsPage() {
  // Fetch on server
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// Equivalent Pages Router code:
// export async function getServerSideProps() {
//   const posts = await fetch('...').then(r => r.json());
//   return { props: { posts } };
// }

// 2. STATIC RENDERING (default)
// app/blog/[slug]/page.tsx
async function BlogPost({ params }) {
  const post = await fetchPost(params.slug);

  return <article>{post.content}</article>;
}

// Generate static pages at build time
export async function generateStaticParams() {
  const posts = await fetchAllPosts();

  return posts.map(post => ({
    slug: post.slug
  }));
}

// Equivalent Pages Router:
// export async function getStaticPaths() { ... }
// export async function getStaticProps() { ... }

// 3. DYNAMIC RENDERING (opt-in)
// Force dynamic rendering by using dynamic functions

import { cookies, headers } from 'next/headers';

async function UserProfile() {
  // Using cookies() forces dynamic rendering
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  const user = await fetchUser(token);

  return <Profile user={user} />;
}

// Or using headers()
async function Page() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent');

  return <div>User Agent: {userAgent}</div>;
}

// 4. STREAMING WITH SUSPENSE
// app/dashboard/page.tsx
import { Suspense } from 'react';

function DashboardPage() {
  return (
    <div>
      {/* Render instantly */}
      <Header />

      {/* Stream user info */}
      <Suspense fallback={<UserSkeleton />}>
        <UserInfo />
      </Suspense>

      {/* Stream stats independently */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      {/* Stream activity feed */}
      <Suspense fallback={<ActivitySkeleton />}>
        <ActivityFeed />
      </Suspense>
    </div>
  );
}

async function UserInfo() {
  const user = await fetchUser(); // Slow
  return <UserCard user={user} />;
}

async function Stats() {
  const stats = await fetchStats(); // Even slower
  return <StatsGrid stats={stats} />;
}

// 5. CLIENT COMPONENTS
// app/components/Counter.tsx
'use client'; // Mark as Client Component

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

// Mix Server and Client Components
async function Page() {
  const data = await fetchData(); // Server

  return (
    <div>
      <ServerComponent data={data} />
      <Counter /> {/* Client Component */}
    </div>
  );
}

// 6. CACHING BEHAVIOR
// Static rendering (default)
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache' // Default
  });

  return <div>{data.title}</div>;
}

// Dynamic rendering (opt-out of caching)
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store' // Fetch on every request
  });

  return <div>{data.title}</div>;
}

// Revalidate periodically (ISR)
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 } // Revalidate every 60s
  });

  return <div>{data.title}</div>;
}

// 7. ROUTE SEGMENT CONFIG
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic'; // Always SSR
export const revalidate = 3600; // Revalidate every hour

async function Dashboard() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Other options:
// export const dynamic = 'auto'; // Default
// export const dynamic = 'force-static'; // Force static
// export const dynamicParams = true; // Allow dynamic params
// export const fetchCache = 'auto'; // Cache fetch requests

// 8. PARALLEL ROUTES & INTERCEPTING
// app/@modal/(.)photo/[id]/page.tsx
export default function PhotoModal({ params }) {
  return (
    <Modal>
      <Photo id={params.id} />
    </Modal>
  );
}

// app/layout.tsx
export default function Layout({ children, modal }) {
  return (
    <div>
      {children}
      {modal}
    </div>
  );
}

// 9. PAGES ROUTER VS APP ROUTER

// Pages Router (old)
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}

function Page({ data }) {
  return <div>{data}</div>;
}

// App Router (new)
async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// 10. LOADING STATES
// app/dashboard/loading.tsx
export default function Loading() {
  return <Spinner />;
}

// app/dashboard/page.tsx
async function Dashboard() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// loading.tsx shows while page.tsx loads
```

### Common Mistakes

- ❌ Using `'use client'` everywhere (loses Server Component benefits)
- ❌ Not using Suspense for streaming (misses performance gains)
- ❌ Forgetting that Server Components can't use hooks/event handlers
- ❌ Not understanding default caching behavior
- ✅ Keep components as Server Components by default
- ✅ Use Suspense boundaries for independent data fetching
- ✅ Understand when components are static vs dynamic

### Follow-up Questions

1. What's the difference between Server and Client Components?
2. How does Next.js decide when to use static vs dynamic rendering?
3. What are Parallel Routes used for?

### Resources
- [App Router Documentation](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

---

## Question 3: Performance Optimization Strategies

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** All companies

### Question
How do you optimize Next.js application performance? What are the key techniques?

### Answer

**Performance Optimizations:**
1. **Image optimization** - Next.js Image component
2. **Code splitting** - Automatic and manual
3. **Font optimization** - next/font
4. **Bundle analysis** - Identify large dependencies
5. **Caching strategies** - Maximize cache hits

**Key Points:**
1. **Use built-in optimizations** - Image, Font, Script components
2. **Minimize JavaScript** - Use Server Components when possible
3. **Lazy load** - Load components/images on demand
4. **Measure** - Use Lighthouse, Web Vitals
5. **Cache aggressively** - CDN, ISR, browser cache

### Code Example

```typescript
// 1. IMAGE OPTIMIZATION
import Image from 'next/image';

function ProductCard({ product }) {
  return (
    <div>
      {/* ❌ BAD: Regular img tag */}
      <img src={product.image} alt={product.name} />

      {/* ✅ GOOD: Next.js Image */}
      <Image
        src={product.image}
        alt={product.name}
        width={300}
        height={200}
        placeholder="blur"
        blurDataURL={product.blurHash}
        loading="lazy"
        quality={85}
      />
    </div>
  );
}

// 2. FONT OPTIMIZATION
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono'
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

// 3. DYNAMIC IMPORTS (Code Splitting)
import dynamic from 'next/dynamic';

// Load component only when needed
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false // Don't render on server
});

function Page() {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button onClick={() => setShow(true)}>Load</button>
      {show && <HeavyComponent />}
    </div>
  );
}

// Load library only on client
const ChartComponent = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Line),
  { ssr: false }
);

// 4. SCRIPT OPTIMIZATION
import Script from 'next/script';

function Page() {
  return (
    <div>
      {/* ❌ BAD */}
      <script src="https://example.com/script.js"></script>

      {/* ✅ GOOD: Deferred loading */}
      <Script
        src="https://example.com/analytics.js"
        strategy="lazyOnload" // Load after page interactive
      />

      {/* Critical script */}
      <Script
        src="https://example.com/critical.js"
        strategy="beforeInteractive"
      />
    </div>
  );
}

// 5. BUNDLE ANALYSIS
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}

// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  // your config
});

// 6. PREFETCHING
import Link from 'next/link';

function Navigation() {
  return (
    <nav>
      {/* Prefetch on hover (default) */}
      <Link href="/products">Products</Link>

      {/* Disable prefetch for less important links */}
      <Link href="/terms" prefetch={false}>
        Terms
      </Link>
    </nav>
  );
}

// Programmatic prefetch
import { useRouter } from 'next/router';

function Component() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch likely next page
    router.prefetch('/checkout');
  }, [router]);
}

// 7. API ROUTE OPTIMIZATION
// pages/api/data.ts
export default async function handler(req, res) {
  // Set cache headers
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=120'
  );

  const data = await fetchData();
  res.json(data);
}

// 8. COMPRESSION
// next.config.js
module.exports = {
  compress: true, // Enable gzip compression (default: true)

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96]
  },

  // Minify JavaScript
  swcMinify: true // Use SWC for faster minification
};

// 9. REDUCING JAVASCRIPT
// Use Server Components (App Router)
async function ProductList() {
  const products = await fetchProducts();

  return (
    <div>
      {products.map(product => (
        // No JS sent to client for static content
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// 10. WEB VITALS MONITORING
// pages/_app.tsx
export function reportWebVitals(metric) {
  // Send to analytics
  if (metric.label === 'web-vital') {
    console.log(metric); // { id, name, label, value }

    // Send to analytics service
    analytics.track('Web Vital', {
      name: metric.name,
      value: metric.value,
      id: metric.id
    });
  }
}

// 11. REDUCE BUNDLE SIZE
// Import only what you need
// ❌ BAD
import _ from 'lodash';

// ✅ GOOD
import debounce from 'lodash/debounce';

// Or use tree-shakeable alternative
import { debounce } from 'lodash-es';

// 12. EDGE MIDDLEWARE
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Run at edge (faster)
  const response = NextResponse.next();

  // Add cache headers
  response.headers.set(
    'Cache-Control',
    'public, max-age=31536000, immutable'
  );

  return response;
}
```

### Common Mistakes

- ❌ Not using Next.js Image component
- ❌ Loading all JavaScript upfront
- ❌ Not analyzing bundle size
- ❌ Ignoring Web Vitals metrics
- ✅ Use built-in optimization components
- ✅ Lazy load non-critical resources
- ✅ Monitor and measure performance regularly

### Follow-up Questions

1. How does Next.js Image component optimize images?
2. What's the difference between `prefetch` and `preload`?
3. How do you optimize for Core Web Vitals?

### Resources
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Font Optimization](https://nextjs.org/docs/basic-features/font-optimization)

---

**[← Back to Next.js README](./README.md)**
