# Next.js Data Fetching

> getServerSideProps, getStaticProps, getStaticPaths, ISR, data fetching patterns, and caching strategies.

---

## Question 1: getServerSideProps vs getStaticProps

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Vercel, Meta, Google

### Question
What's the difference between getServerSideProps and getStaticProps? When to use each?

### Answer

**getStaticProps** - Generate pages at build time (SSG)
**getServerSideProps** - Generate pages on every request (SSR)

**Key Points:**
1. **Performance** - SSG is faster (served from CDN), SSR is per-request
2. **Data freshness** - SSG data can be stale, SSR always fresh
3. **ISR** - Hybrid approach: static + periodic rebuilds
4. **Use cases** - SSG for content, SSR for user-specific data
5. **SEO** - Both are great for SEO (pre-rendered HTML)

### Code Example

```typescript
// 1. getStaticProps - STATIC SITE GENERATION (SSG)
// Runs at BUILD TIME only
export async function getStaticProps() {
  // This code ONLY runs during build
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return {
    props: {
      posts
    }
  };
}

function BlogPage({ posts }) {
  // Posts were fetched at BUILD time
  // HTML is pre-generated and served from CDN
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// 2. getServerSideProps - SERVER-SIDE RENDERING (SSR)
// Runs on EVERY REQUEST
import type { GetServerSideProps } from 'next';

interface DashboardProps {
  user: User;
  recentActivity: Activity[];
}

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (context) => {
  // This code runs on EVERY page request
  const { req, res, params, query } = context;

  // Access cookies, headers, etc.
  const token = req.cookies.authToken;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }

  // Fetch user-specific data
  const user = await getUserByToken(token);
  const recentActivity = await getRecentActivity(user.id);

  return {
    props: {
      user,
      recentActivity
    }
  };
}

function Dashboard({ user, recentActivity }: DashboardProps) {
  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <ActivityFeed activities={recentActivity} />
    </div>
  );
}

// 3. INCREMENTAL STATIC REGENERATION (ISR)
// Best of both worlds: fast + fresh
export async function getStaticProps() {
  const products = await fetchProducts();

  return {
    props: { products },
    // Regenerate page every 60 seconds (on-demand when requested)
    revalidate: 60
  };
}

// ISR Behavior:
// 1. First request: Serve stale page
// 2. Trigger regeneration in background
// 3. Next request: Serve fresh page

// 4. getStaticPaths - Dynamic SSG Routes
export async function getStaticPaths() {
  const posts = await getAllPosts();

  return {
    // Generate these pages at build time
    paths: posts.map(post => ({
      params: { id: post.id }
    })),
    // fallback options:
    // false: 404 for unbuilt pages
    // true: show loading, then render
    // 'blocking': SSR on first request, then cache
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.id);

  if (!post) {
    return {
      notFound: true // Show 404 page
    };
  }

  return {
    props: { post },
    revalidate: 3600 // Regenerate every hour
  };
}

// 5. CACHING CONTROL
export async function getServerSideProps({ res }) {
  // Set cache headers for CDN/browser
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  );

  const data = await fetchData();

  return {
    props: { data }
  };
}

// 6. ERROR HANDLING
export async function getServerSideProps() {
  try {
    const data = await fetchData();

    return {
      props: { data }
    };
  } catch (error) {
    // Option 1: Show error page
    return {
      notFound: true
    };

    // Option 2: Redirect to error page
    return {
      redirect: {
        destination: '/error',
        permanent: false
      }
    };

    // Option 3: Pass error to page
    return {
      props: {
        error: error.message
      }
    };
  }
}

// 7. DECISION TREE
/*
When to use what?

getStaticProps (SSG):
✅ Content doesn't change often (blog, docs, marketing)
✅ Can be shared by all users
✅ Performance is critical
✅ Can be cached by CDN
❌ User-specific data
❌ Real-time data

getStaticProps + revalidate (ISR):
✅ E-commerce product pages
✅ News articles
✅ Content that updates periodically
✅ Need balance of speed + freshness

getServerSideProps (SSR):
✅ User-specific dashboards
✅ Real-time data (stock prices, scores)
✅ Need access to request (cookies, headers)
✅ Authentication required
❌ High traffic (expensive)
❌ Can tolerate stale data

Client-side (SWR/React Query):
✅ Private, user-specific data
✅ Data changes frequently
✅ SEO not important
✅ Interactive dashboards
*/
```

### Common Mistakes

- ❌ Using SSR for static content (slower, more expensive)
- ❌ Using SSG for user-specific data (security risk)
- ❌ Not using ISR when content updates periodically
- ❌ Forgetting to handle errors in data fetching
- ✅ Use SSG + ISR for most pages
- ✅ Use SSR only when absolutely needed
- ✅ Cache SSR responses when possible

### Follow-up Questions

1. What's the difference between `fallback: true` vs `fallback: 'blocking'`?
2. How does ISR work under the hood?
3. When would you use client-side fetching instead of SSR/SSG?

### Resources
- [Next.js Data Fetching](https://nextjs.org/docs/basic-features/data-fetching)
- [ISR Documentation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)

---

<details>
<summary><strong>🔍 Deep Dive: SSG vs SSR - The V8 Engine Perspective</strong></summary>

## Deep Dive: SSG vs SSR - The V8 Engine Perspective

### Build-Time Code Execution and Serialization

When Next.js executes `getStaticProps` at build time, it doesn't run inside the browser—it runs in a Node.js environment with full access to databases, file systems, and APIs. This is fundamentally different from SSR, where code runs in a serverless function environment on every request.

**Build Process Architecture:**

```typescript
// Build time execution environment (Node.js, not V8 browser engine)
export async function getStaticProps() {
  // This code runs ONCE during build with full Node.js capabilities
  const db = await connectToDatabase(); // ✅ Works (direct DB connection)
  const products = await db.query('SELECT * FROM products');

  // Data is frozen at build time and serialized to JSON
  // This JSON becomes part of the compiled bundle
  return {
    props: { products },
    revalidate: false // Never stale
  };
}

// Result: .next/server/pages/products/index.html + .next/server/pages/products.json
// HTML: <script id="__NEXT_DATA__">{...json serialized props...}</script>
// Size: ~150KB static HTML + 50KB JSON
```

**Serialization Challenges (Critical for Interview):**

Next.js must serialize your props to JSON. This creates several limitations:

```typescript
// ❌ FAILS: Functions cannot be serialized to JSON
export async function getStaticProps() {
  return {
    props: {
      handler: () => console.log('Hi') // ❌ Error: Cannot serialize function
    }
  };
}

// ❌ FAILS: Class instances cannot be serialized
export async function getStaticProps() {
  const date = new Date(); // ✅ This works (gets serialized as ISO string)
  return {
    props: {
      date, // ✅ ISO string: "2025-11-15T10:30:00Z"
      regex: /test/ // ❌ Error: Cannot serialize RegExp
    }
  };
}

// ✅ WORKS: Primitive values and plain objects
export async function getStaticProps() {
  return {
    props: {
      string: "hello",
      number: 42,
      boolean: true,
      array: [1, 2, 3],
      object: { nested: "value" },
      null: null,
      date: new Date().toISOString() // Convert to string first!
    }
  };
}

// Interview tip: Next.js uses JSON.stringify() under the hood
// If your data doesn't serialize, the build fails!
```

### Request Deduplication Mechanism

Next.js 13+ implements request deduplication at the React level. When multiple components request the same data during server-side rendering, the framework intelligently caches and reuses responses.

```typescript
// Without deduplication (wasteful):
// Component A: fetch('/api/user') → 100ms
// Component B: fetch('/api/user') → 100ms
// Component C: fetch('/api/user') → 100ms
// Total: 300ms (3 identical requests)

// With Next.js deduplication:
// Component A: fetch('/api/user') → 100ms (first request)
// Component B: fetch('/api/user') → 0ms (cached from A)
// Component C: fetch('/api/user') → 0ms (cached from A)
// Total: 100ms (automatic memoization!)

// How it works internally:
// Next.js wraps the native fetch with a request cache
interface RequestCache {
  cache: Map<string, Promise<Response>>;

  async fetch(url: string) {
    if (this.cache.has(url)) {
      return this.cache.get(url); // Return pending or resolved promise
    }

    const promise = originalFetch(url);
    this.cache.set(url, promise); // Store promise for others
    return promise;
  }
}

// This deduplication persists across:
// - Multiple components in same page
// - Parent and child components
// - Parallel requests with Promise.all
// But it does NOT persist between different requests (no cross-request cache)
```

### ISR Cache Invalidation Strategies

ISR implements a sophisticated multi-tier caching strategy that balances freshness with performance:

```typescript
// The ISR state machine (what happens behind the scenes):
enum ISRState {
  CACHE_HIT,           // Serve cached page
  REVALIDATION_NEEDED, // Page is stale, regenerate
  REGENERATING,        // Background regeneration in progress
  CACHE_STALE,         // Serve stale while regenerating
}

// Real-world ISR behavior with metrics:
export async function getStaticProps() {
  return {
    props: { /* data */ },
    revalidate: 60 // ISR window
  };
}

// Timeline:
// 0s:   Request 1 → Cache hit (fresh, age 0s) → Response in 30ms
// 10s:  Request 2 → Cache hit (fresh, age 10s) → Response in 30ms
// 60s:  Request 3 → Cache miss (age 60s = revalidate) → Triggers rebuild
//       → Response in 30ms (serves STALE page while rebuilding)
//       → Background regeneration starts (takes 5-10s)
// 65s:  Request 4 → Cache hit (fresh new page) → Response in 30ms
// 120s: Request 5 → Revalidate again...

// Real numbers from Vercel Edge Network:
// - Serving from cache: 10-30ms (edge location)
// - Regeneration on origin: 2-5s (depends on data fetching)
// - Propagation to all edges: 10-30s

// Critical gotcha: The "stale" period behavior
// First request after revalidate time PAYS the cost
// Example with 100 req/sec hitting revalidate:
// - Request #3600 (at 60s): Pays 2000ms regeneration cost
// - Requests #3601-#3660: Get free ride on cached page
// - Result: 99% of users unaffected, 1% sees slow page
```

### Performance Metrics: Real Data from Production

```typescript
// Actual performance numbers from Vercel infrastructure:

// SSG (getStaticProps)
// ─────────────────────
// TTFB (Time to First Byte):
//   - Vercel Edge: 15-50ms
//   - Cloudflare: 20-60ms
//   - Origin server (cold): 100-200ms
//
// First Contentful Paint: 200-400ms (depends on JS bundle)
// Largest Contentful Paint: 400-800ms (depends on image optimization)
// Cumulative Layout Shift: 0.05 (stable, pre-rendered HTML)
//
// Cost analysis:
// - 1M requests: $0.12 (pure CDN bandwidth, no compute)
// - Build cost: $0.05/month (rebuilds)
// - Total: ~$0.15/month

// ISR (getStaticProps + revalidate)
// ──────────────────────────────────
// TTFB (cached): Same as SSG (15-50ms)
// TTFB (regenerating): 15-50ms (serves stale, regenerates background)
//
// Regeneration time breakdown:
// - Database query: 100-500ms (depends on query complexity)
// - External API: 100-1000ms (depends on API latency)
// - Rendering: 50-200ms (React to HTML)
// - Total regeneration: 250-1700ms
//
// Cost analysis (1M requests, 100 revalidations/day):
// - Cached requests (99.9%): $0.12
// - Regenerations (0.1%): $0.05 (serverless execution)
// - Total: ~$0.17/month

// SSR (getServerSideProps)
// ────────────────────────
// TTFB (warm start):
//   - Cold start: 900-1500ms
//   - Warm start: 200-700ms
//
// Request breakdown:
// - Lambda spin-up: 0-900ms (cold start penalty)
// - getServerSideProps execution: 200-1500ms
// - React rendering: 50-150ms
// - Total: 250-2550ms (depending on cold starts)
//
// Cost analysis (1M requests, average):
// - Serverless execution: $15-25
// - Lambda memory: 512-1024MB (standard)
// - Cold start rate: 5-20% (depends on traffic)
// - Total: ~$15-25/month (100x more than SSG!)
```

### The fetch() Extension and Caching

Next.js augments the native fetch API with intelligent caching that works at the request level:

```typescript
// Next.js fetch extension (App Router only, as of Next.js 13)
const response = await fetch('https://api.example.com/posts', {
  // Standard fetch options
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' },

  // Next.js extensions
  cache: 'force-cache',        // Cache forever (like getStaticProps)
  next: {
    revalidate: 3600,          // ISR: revalidate every 1 hour
    tags: ['posts', 'blog']    // Tag for selective revalidation
  }
});

// Cache behavior matrix:
// ┌─────────────────────┬──────────────────┬──────────────┐
// │ cache option        │ When revalidate  │ Cost model   │
// ├─────────────────────┼──────────────────┼──────────────┤
// │ 'force-cache'       │ Never (build)    │ CDN only     │
// │ 'no-store'          │ Every request    │ All requests │
// │ default (with ISR)  │ As specified     │ Hybrid       │
// └─────────────────────┴──────────────────┴──────────────┘

// Under the hood (simplified implementation):
class NextJSFetchCache {
  private store = new Map<string, CacheEntry>();

  async fetch(
    url: string,
    options: FetchOptions & { next?: NextOptions }
  ) {
    const { cache, next } = options;
    const cacheKey = url; // Simplified (real impl includes options)

    if (cache === 'no-store') {
      // Bypass cache entirely
      return originalFetch(url, options);
    }

    const cached = this.store.get(cacheKey);

    if (cache === 'force-cache') {
      if (cached) return cached.data;
      // Cache forever
      const data = await originalFetch(url, options);
      this.store.set(cacheKey, {
        data,
        tags: next?.tags || [],
        revalidateAt: Infinity // Never revalidate
      });
      return data;
    }

    if (next?.revalidate) {
      const now = Date.now();
      if (cached && now - cached.timestamp < next.revalidate * 1000) {
        // Fresh cache
        return cached.data;
      }
      // Stale cache: fetch and update
      const data = await originalFetch(url, options);
      this.store.set(cacheKey, {
        data,
        timestamp: now,
        tags: next?.tags || [],
        revalidateAt: now + (next.revalidate * 1000)
      });
      return data;
    }
  }

  revalidateTag(tag: string) {
    // Find all entries with this tag and mark as stale
    for (const [key, entry] of this.store) {
      if (entry.tags.includes(tag)) {
        entry.revalidateAt = 0; // Mark as stale
      }
    }
  }
}

// Real-world example: E-commerce product page
const product = await fetch(
  `https://api.example.com/products/${id}`,
  {
    next: {
      revalidate: 300, // 5 minutes
      tags: [`product-${id}`, 'products']
    }
  }
);

// If product price changes via webhook:
// POST /api/revalidate-product
export async function POST(req: Request) {
  const { productId } = await req.json();

  // Invalidate specific product + all products cache
  revalidateTag(`product-${productId}`);
  revalidateTag('products');

  // All pages with this fetch request will regenerate
}
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: E-Commerce Product Page Performance Crisis</strong></summary>

## Real-World Scenario: E-Commerce Product Page Performance Crisis

### The Problem at Scale

**Company:** FastCart (mid-size e-commerce, ₹10Cr annual revenue)
**Scale:** 50M monthly users, 2M daily active
**Traffic Pattern:** Uneven (peak hours: 10x baseline)

**Crisis Metrics:**

```
BEFORE FIX (Pre-Holiday Season):
├─ Product page TTFB: 280ms (good)
├─ Page load time: 1.2s (acceptable)
├─ Bounce rate: 8% (normal)
├─ Conversion rate: 3.2%
└─ Infrastructure cost: ₹40,000/month

DURING CRISIS (Black Friday):
├─ Product page TTFB: 4.2s (catastrophic, 15x increase!)
├─ Page load time: 8.5s
├─ Bounce rate: 44% (5.5x increase!)
├─ Conversion rate: 0.7% (78% drop = ₹15L lost revenue!)
├─ Infrastructure cost: ₹8,50,000/month (21x increase!)
├─ Error rate: 18% (timeout errors)
└─ Database connections: Exhausted (max 200, got 3000 queue)
```

**Root Cause Analysis (Investigation Process):**

```bash
# Step 1: Vercel Analytics Dashboard
# Function duration histograms revealed:
p50 TTFB:  1.2s (baseline)
p95 TTFB:  3.8s (spike)
p99 TTFB:  6.2s (crisis)

# Cold start rate: 68% (critical indicator!)
# Normally: 5%, Black Friday: 68%

# Step 2: Database logs (PostgreSQL monitoring)
# Slow query log showed:
SELECT p.*, c.* FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.id = $1

Query time:
- Baseline: 45ms
- Black Friday: 2.8s (62x slower!)

# Root cause: N+1 query problem
# Each product query was also fetching related data
# With 50 reqs/sec = 50 database queries/sec
# Pool had 10 connections, all exhausted

# Step 3: APM Trace Analysis (Datadog/Sentry)
# getServerSideProps waterfall:
getServerSideProps (4200ms total)
├─ getProduct (database query): 2800ms ← BOTTLENECK!
├─ getReviews (second query): 800ms
├─ getInventory (third query): 400ms
├─ calculateDiscount (CPU): 200ms
└─ render (React): 0ms (already slow from DB)
```

**The Problematic Code:**

```typescript
// pages/products/[id].tsx - Original implementation
export async function getServerSideProps({ params, res }) {
  // This runs on EVERY request during Black Friday

  // Problem 1: No caching headers
  res.setHeader('Cache-Control', 'public, max-age=0');

  // Problem 2: Multiple sequential queries (N+1)
  const product = await db.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,      // Extra query
      reviews: { take: 10 }, // Extra query
      inventory: true,      // Extra query
      images: true          // Extra query
    }
  });

  // Problem 3: External API calls
  const reviews = await fetch(
    `https://reviews-api.fastcart.com/products/${params.id}`
  ).then(r => r.json()); // 800ms on good days, 3s on Black Friday

  // Problem 4: No timeout or fallback
  const recommendations = await fetch(
    `https://recommendations-engine.fastcart.com/products/${params.id}`
  ).then(r => r.json()); // This service went down!

  return {
    props: {
      product,
      reviews,
      recommendations
    },
    revalidate: 3600 // Only revalidates hourly (too slow to adapt)
  };
}

// Actual execution breakdown during Black Friday:
// Total requests/sec: 500 (50x normal)
// SSR execution time: 4.2s average
// Concurrent executions: 500 * 4.2s = 2100 "virtual" executions
// Available Lambda instances: 150
// Queue depth: 1950 requests (massive backlog!)
// User experience: 95% of requests timeout or get 500 errors
```

### The Solution: Multi-Phase Optimization

**Phase 1: Immediate Fix (1 hour deployment)**

Switch to ISR with aggressive caching:

```typescript
// pages/products/[id].tsx - ISR solution
export async function getStaticProps({ params }) {
  // Only fetch what's NECESSARY for SEO + immediate render
  const product = await db.product.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      rating: true,
      image: true
      // SKIP: reviews, inventory, recommendations (fetch client-side)
    }
  });

  if (!product) {
    return { notFound: true };
  }

  return {
    props: { product },
    revalidate: 300 // 5-minute ISR window (not hourly!)
  };
}

export async function getStaticPaths() {
  // Pre-generate top 500 products (top 1% of traffic)
  const topProducts = await db.product.findMany({
    where: { archived: false },
    orderBy: { monthlyViews: 'desc' },
    take: 500,
    select: { id: true }
  });

  return {
    paths: topProducts.map(p => ({ params: { id: p.id } })),
    fallback: 'blocking' // Generate others on-first-request
  };
}

// Results immediately:
// - Pre-generated (top 500): 50ms TTFB (from CDN)
// - On-demand (others): 1.5s (first request only, then cached)
// - 95% of traffic served from CDN in < 100ms
```

**Phase 2: Optimize Database Queries (4 hours)**

```typescript
// Fix 1: Split into focused queries
export async function getStaticProps({ params }) {
  // Single optimized query
  const product = await db.product.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      rating: true,
      image: true,
      category: { select: { id: true, name: true } } // Lean join
    }
  });

  // Query time: 45ms → 15ms (3x faster!)
  return { props: { product }, revalidate: 300 };
}

// Fix 2: Add database indexes
// Before: SEQUENTIAL query analysis showed missing index
// Query: WHERE id = $1
// Execution time: 45ms (full table scan on poor index)
// Plan: Seq Scan on products (cost 0..50000)

// Solution: Ensure index exists (it probably does but stats stale)
CREATE INDEX CONCURRENTLY idx_products_id ON products(id);
ANALYZE products; // Update table statistics

// After index stats update:
// Query time: 45ms → 8ms (5.6x faster!)

// Fix 3: Database connection pooling
// Before: 200 max connections, 1000s queued during spike
// After: PgBouncer with connection pooling
// PgBouncer config:
[databases]
fastcart_prod = host=db.internal port=5432

[pgbouncer]
pool_mode = transaction
max_client_conn = 10000
default_pool_size = 100
reserve_pool_size = 20
server_lifetime = 3600

// Result: Can handle 10,000 concurrent clients with 100 connections
```

**Phase 3: Move Non-Critical Data Client-Side (Day 2)**

```typescript
// pages/products/[id].tsx
function ProductPage({ product }) {
  // Server-rendered: Essential data (SEO)
  return (
    <div>
      <ProductHeader product={product} />

      {/* Non-critical: Load client-side */}
      <Suspense fallback={<InventorySkeleton />}>
        <InventoryStatus productId={product.id} />
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsSection productId={product.id} />
      </Suspense>

      <Suspense fallback={<RecommendationsSkeleton />}>
        <RecommendedProducts productId={product.id} />
      </Suspense>
    </div>
  );
}

// app/components/InventoryStatus.tsx
'use client';

import useSWR from 'swr';

function InventoryStatus({ productId }) {
  const { data: inventory } = useSWR(
    `/api/inventory/${productId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Update every 30s
      fallbackData: { status: 'In Stock' } // Optimistic
    }
  );

  return <div>Status: {inventory?.status}</div>;
}

// API Route: api/inventory/[id].ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN
});

export async function GET(req: Request, { params }) {
  const { id } = params;
  const cacheKey = `inventory:${id}`;

  // Check Redis cache first (100x faster than DB)
  const cached = await redis.get(cacheKey);
  if (cached) return Response.json(cached);

  // Fetch from database
  const inventory = await db.inventory.findUnique({
    where: { productId: id },
    select: { quantity: true, status: true, reorderDate: true }
  });

  // Cache for 1 minute
  await redis.setex(cacheKey, 60, inventory);

  return Response.json(inventory);
}

// Results:
// - API response time: 500-800ms → 50-100ms (8x faster!)
// - Database queries: 50,000/min → 10,000/min (80% reduction)
// - Page load (FCP): 4.2s → 1.8s (2.3x faster)
```

**Phase 4: Implement Proper Caching Headers**

```typescript
// Middleware for caching
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.match(/^\/products\/\d+$/)) {
    // Cache static assets long-term
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable' // 1 year
    );
  }

  return response;
}

// ISR header strategy
export async function GET(req: Request) {
  // Tell CDN to cache the response
  const response = new Response(html, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
      // s-maxage: CDN caches for 5 minutes
      // stale-while-revalidate: CDN can serve stale for 1 hour while revalidating
    }
  });

  return response;
}
```

### Results After Multi-Phase Fix

**Performance Metrics:**

```
AFTER OPTIMIZATION (Black Friday):
├─ Product page TTFB: 85ms (was 4.2s) - 49x faster!
├─ Page load time: 1.5s (was 8.5s) - 5.7x faster!
├─ Bounce rate: 9% (was 44%) - 78% reduction
├─ Conversion rate: 3.1% (was 0.7%) - 343% increase!
├─ Infrastructure cost: ₹2,15,000/month (was ₹8,50,000) - 75% reduction
├─ Error rate: 0.05% (was 18%)
└─ Database connections: 45 active (was 200+, queue was 1000s)
```

**Business Impact:**

```
Revenue Recovery: ₹30L lost revenue recovered
Infrastructure Savings: ₹6,35,000/month
Customer Experience: ASIN went from 2.1/5 to 4.8/5
Marketing: Positive PR instead of "FastCart is slow" trending topic
```

**Key Learnings:**

1. **ISR is the default**: For 95% of pages that need SEO but not real-time data
2. **Move non-critical data client-side**: Reduces server render time significantly
3. **Database indexes matter**: A single missing index caused 62x slowdown
4. **Connection pooling is essential**: Protects from connection exhaustion
5. **Monitor cold start rates**: 68% cold starts signals over-provisioning

</details>

<details>
<summary><strong>⚖️ Trade-offs: Choosing the Right Strategy</strong></summary>

## Trade-offs: Choosing the Right Strategy

### Decision Matrix with Real Costs

```
METRIC              SSG         ISR         SSR         CSR
─────────────────────────────────────────────────────────────
TTFB               20-50ms     20-50ms     300-1800ms  50-200ms
Cost per 1M        $0.15       $0.25       $20         $0.50
Reqs/Sec/Instance  50,000      5,000       100         N/A
Freshness          Days        Minutes     Real-time   Real-time
Cold Starts        0%          0%          68%         0%
SEO Quality        Perfect     Perfect     Perfect     Poor
Stale Potential    High        Low         None        None
Build Time         10+ min     10+ min     Instant     Instant
```

### When to Choose Each (With Examples)

**Choose SSG When:**
```typescript
// Blog posts - Update frequency: 0-2x/day
export async function getStaticProps() {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  });

  return {
    props: { posts }
    // No revalidate: Update manually on new publish
  };
}

// Metrics:
// - Build time per 1000 pages: 5-10 minutes
// - TTFB: 25ms (CDN)
// - Cost: $0.10 per 1M requests
// ✅ Perfect: Static content, SEO-critical, low update frequency
```

**Choose ISR When:**
```typescript
// E-commerce product pages - Update frequency: 100/day, 50M products
export async function getStaticProps({ params }) {
  const product = await db.product.findUnique({ where: { id: params.id } });

  return {
    props: { product },
    revalidate: 300 // 5 minutes
  };
}

export async function getStaticPaths() {
  return {
    paths: [], // Don't pre-generate all 50M
    fallback: 'blocking' // Generate on-demand
  };
}

// Metrics:
// - Initial TTFB: 50ms (CDN cache)
// - Regeneration: 2s (happens once per 5min)
// - Cost: $0.25 per 1M (mostly CDN)
// ✅ Perfect: Semi-dynamic, high volume, can tolerate 5-min stale window
```

**Choose SSR When:**
```typescript
// User dashboard - Update frequency: Real-time, small audience
export async function getServerSideProps({ req, res }) {
  // Implement SWR pattern to reduce cost
  res.setHeader(
    'Cache-Control',
    'private, max-age=10, stale-while-revalidate=60'
  );

  const user = await getUser(req.cookies.sessionId);
  const stats = await getUserStats(user.id);

  return { props: { user, stats } };
}

// Metrics (with SWR caching):
// - TTFB (cached): 40ms (10% of reqs)
// - TTFB (uncached): 500ms (90% of reqs)
// - Cost: $2/1M (was $20, saved by caching)
// ✅ OK: User-specific, real-time, can afford per-request execution
```

**Choose CSR When:**
```typescript
// Admin panel - Update frequency: Real-time, low traffic, no SEO
'use client';

import useSWR from 'swr';

function AdminDashboard() {
  const { data: analytics } = useSWR('/api/analytics', fetcher, {
    refreshInterval: 5000 // Poll every 5 seconds
  });

  const { data: users } = useSWR('/api/users', fetcher);

  return (
    <div>
      <AnalyticsChart data={analytics} />
      <UsersList users={users} />
    </div>
  );
}

// Metrics:
// - Initial page load: 500ms (static HTML)
// - Data load: 1-2s (API calls)
// - Cost: $0.50/1M (API only)
// ✅ OK: No SEO, high interactivity, frequent updates acceptable
```

### The Hybrid Approach (Best for Most Cases)

```typescript
// Optimal for most websites:
// 1. Core content: ISR (static + periodic updates)
// 2. Non-critical data: Client-side SWR
// 3. User-specific: SSR with heavy caching

export async function getStaticProps({ params }) {
  // Critical for SEO, doesn't change often
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    select: { id: true, title: true, content: true, image: true }
  });

  return {
    props: { article },
    revalidate: 3600 // Daily updates fine
  };
}

function ArticlePage({ article }) {
  return (
    <div>
      {/* Server-rendered for SEO */}
      <ArticleContent article={article} />

      {/* Client-side for non-essential */}
      <Suspense fallback={<SidebarSkeleton />}>
        <RelatedArticles articleId={article.id} />
      </Suspense>

      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsSection articleId={article.id} />
      </Suspense>
    </div>
  );
}

// Performance:
// - FCP: 300ms (article visible immediately)
// - LCP: 500ms (hero image)
// - Comments load: 2-3s (non-blocking)
//
// Cost: ~$0.30 per 1M (hybrid approach)
// Freshness: Article (hourly), Comments (real-time)
// UX: Perfect balance
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Data Fetching Demystified</strong></summary>

## Explain to Junior: Data Fetching Demystified

### The Mental Model: What's Happening Behind the Scenes

Think of Next.js data fetching as three different kitchen workflows:

**SSG = Meal Prep Service**
- Chef cooks all meals Sunday (build time)
- Meals frozen and sent to customers' homes
- Customer just reheats (CDN serves static HTML)
- Time: 30 seconds to eat
- Cost: $1 per meal
- Freshness: 1 week old
- Perfect for: Same meal everyone wants

**ISR = Buffet Catering**
- Chef prepares main buffet dishes at noon (build time)
- Fresh roll-outs every 30 minutes (revalidate period)
- Customers always get decent freshness
- Time: 1 minute to get food
- Cost: $2 per meal
- Freshness: 0-30 minutes old
- Perfect for: High volume, periodic updates

**SSR = Fine Dining Restaurant**
- Chef cooks each customer's meal fresh (on-request)
- Perfectly fresh, fully customized
- Customer waits 15 minutes (TTFB penalty)
- Time: 15 minutes to eat (after waiting)
- Cost: $20 per meal
- Freshness: 0 seconds (piping hot)
- Perfect for: VIP customers, personalization

**CSR = Self-Serve Buffet**
- Guest serves themselves (client-side fetch)
- Fast to start (empty plate), but they do work
- Items constantly replenished (real-time data)
- Time: 3 minutes to build salad
- Cost: $1 per meal (ingredients only)
- Freshness: Always fresh
- Perfect for: Flexible consumers, tools

### Common Rookie Mistakes and Fixes

**Mistake 1: SSR Everything**

```typescript
// ❌ WRONG: Treating SSR like default
export async function getServerSideProps() {
  const staticContent = await fetchStaticBlogPosts();
  return { props: { staticContent } };
}

// Problem: Like ordering a steak custom-cooked
// when you always want the same thing.
// Cost: 100x more expensive for same result
```

Fix: Identify if data is **user-specific**

```typescript
// ✅ CORRECT: Static content uses SSG
export async function getStaticProps() {
  const posts = await fetchStaticBlogPosts();
  return { props: { posts } };
}

// Cost: 100x cheaper, 50x faster, same result
```

**Mistake 2: Client-Side Rendering for SEO Content**

```typescript
// ❌ WRONG: No content in HTML for Google
'use client';

function BlogPost() {
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetchPost(id).then(setPost);
  }, []);

  return <article>{post?.content}</article>;
}

// Google sees: <article></article>
// Score: 0/100 (no content!)
// User sees: "Loading..." for 2+ seconds
```

Fix: Server-render SEO-critical content

```typescript
// ✅ CORRECT: Server-side for SEO
export async function getStaticProps({ params }) {
  const post = await fetchPost(params.id);
  return { props: { post }, revalidate: 3600 };
}

function BlogPost({ post }) {
  return <article>{post.content}</article>;
}

// Google sees: Full content in HTML
// Score: 95/100 (perfect)
// User sees: Content immediately
```

**Mistake 3: Using Static When You Need Dynamic**

```typescript
// ❌ WRONG: Stale user data
export async function getStaticProps() {
  const user = await getCurrentUser(); // Gets whoever was logged in at build time!
  return { props: { user } };
}

// Problem: All 1M users see the same "user"
// Your mom's account visible to everyone!
```

Fix: Use SSR for user-specific data

```typescript
// ✅ CORRECT: Fresh user data
export async function getServerSideProps({ req, res }) {
  // Add cache headers to reduce cost
  res.setHeader('Cache-Control', 'private, max-age=10');

  const user = await getCurrentUser(req.cookies.sessionId);
  return { props: { user } };
}

// Data is fresh, secure, cached per-user
```

### Interview Answer Template

**Q: "When would you use SSG vs SSR?"**

**A:** "I'd use **SSG (getStaticProps)** for content that's the same for everyone and doesn't change often—like blog posts, documentation, or product pages. It's pre-built at deployment and served from a CDN, so it's super fast (20-50ms) and cheap.

For content that updates occasionally, I'd add **ISR (revalidate: 300)** to get fresh data every 5 minutes without full rebuilds. Perfect for e-commerce or news sites.

I'd only use **SSR (getServerSideProps)** for user-specific data where I need the request object—like dashboards or authentication. It's slower (300-1800ms) and more expensive, so I'd minimize it. I'd also add cache headers to reduce the cost.

For non-SEO content like admin panels, I'd use **client-side SWR** for real-time updates without server overhead."

**Why this works:**
- Shows understanding of trade-offs
- Mentions performance and cost
- Demonstrates real-world thinking
- Explains the "why," not just "what"

</details>

<details>
<summary><strong>🔍 Deep Dive: How Next.js Data Fetching Works Under the Hood</strong></summary>

## Deep Dive: How Next.js Data Fetching Works Under the Hood

### Build-time vs Runtime: The Fundamental Difference

**getStaticProps Build Process:**

When you run `next build`, Next.js creates static HTML files for pages using getStaticProps. Here's the step-by-step process:

1. **Analysis Phase**: Next.js analyzes all pages and identifies which ones export getStaticProps
2. **Data Fetching Phase**: For each static page, Next.js executes getStaticProps in a Node.js environment
3. **HTML Generation**: The returned props are serialized to JSON and passed to the page component
4. **Static Files Creation**: Next.js generates `.html` files and `.json` files in `.next/server/pages/`
5. **CDN Distribution**: These static files are deployed to a CDN (Vercel Edge Network, Cloudflare, etc.)

**Example Build Output:**
```bash
.next/server/pages/
  blog/
    [slug].html          # Pre-rendered HTML
    [slug].json          # Props data
  index.html
  index.json
```

When a user requests `/blog/hello-world`:
- CDN serves `blog/[slug].html` instantly (no Node.js execution)
- Client-side navigation fetches `blog/[slug].json` for client-side routing
- Time to First Byte (TTFB): ~20-50ms (pure CDN response)

**getServerSideProps Runtime Process:**

Every request triggers server-side execution:

1. **Request Arrives**: User requests `/dashboard`
2. **Lambda/Server Activation**: Next.js serverless function (or Node.js server) spins up
3. **getServerSideProps Execution**: Code runs with full request context (cookies, headers, query params)
4. **Data Fetching**: API calls, database queries execute on the server
5. **HTML Rendering**: React renders to HTML string with fetched data
6. **Response**: HTML sent to client with embedded JSON payload
7. **Hydration**: Client-side React takes over for interactivity

**Performance Implications:**
```typescript
// SSG: Request flow
User → CDN (20ms) → Browser renders

// SSR: Request flow
User → Server spin-up (50-200ms) → getServerSideProps (100-500ms)
    → Data fetching (100-1000ms) → Rendering (50-100ms) → Browser renders

// SSG TTFB: 20-50ms
// SSR TTFB: 300-1800ms (6-36x slower!)
```

### ISR: The Hybrid Architecture

**Incremental Static Regeneration** combines static generation with on-demand updates using a sophisticated caching mechanism:

**How ISR Works (with `revalidate: 60`):**

1. **Initial Build**: Page is statically generated at build time
2. **First Request**: Serves cached static page (fast!)
3. **Stale-While-Revalidate**: After 60 seconds:
   - Request 1: Serves stale page, triggers background regeneration
   - Request 2 (after regeneration): Serves fresh page
4. **Cache Update**: New static page replaces old one

**The ISR Cache Mechanism:**

Next.js uses a multi-tier caching system:

```typescript
// Simplified ISR cache logic
class ISRCache {
  private cache = new Map<string, { html: string, timestamp: number }>();

  async getPage(path: string, revalidate: number) {
    const cached = this.cache.get(path);

    if (!cached) {
      // Cache miss: Generate page
      return this.generateAndCache(path);
    }

    const age = Date.now() - cached.timestamp;

    if (age < revalidate * 1000) {
      // Fresh cache: Return immediately
      return cached.html;
    }

    // Stale cache: Return stale + regenerate in background
    this.regenerateInBackground(path);
    return cached.html;
  }

  private async regenerateInBackground(path: string) {
    // Non-blocking: Next request gets fresh content
    const newHtml = await this.generatePage(path);
    this.cache.set(path, { html: newHtml, timestamp: Date.now() });
  }
}
```

**On-Demand ISR** (Next.js 12.2+):

With `revalidatePath()` and `revalidateTag()`, you can trigger regeneration on specific events:

```typescript
// Webhook from CMS when content updates
export async function POST(request: Request) {
  const { slug } = await request.json();

  // Immediately regenerate specific page
  revalidatePath(`/blog/${slug}`);

  // Or revalidate all pages with tag
  revalidateTag('blog-posts');

  return Response.json({ revalidated: true });
}

// Tagged fetch for granular revalidation
const posts = await fetch('https://cms.example.com/posts', {
  next: {
    tags: ['blog-posts'],
    revalidate: 3600
  }
});
```

**ISR at Scale:**

On Vercel's infrastructure, ISR uses a distributed cache:

1. **Edge Cache**: Cloudflare/Vercel Edge caches static pages globally
2. **Origin Cache**: Main server cache (SSD-backed, persistent)
3. **Background Regeneration**: Happens on origin, then propagates to edge

**Cache Propagation:**
```
Content Update → Origin regenerates (5s)
              → Edge cache purge (10s globally)
              → All users get fresh content (15s total)
```

### The fetch() API Extension

Next.js extends the native fetch API with caching capabilities:

```typescript
// Native fetch (no caching)
const data = await fetch('https://api.example.com/data');

// Next.js extended fetch (automatic caching)
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache',        // Default: cache forever
  next: {
    revalidate: 60,            // ISR: revalidate every 60s
    tags: ['products']         // Tag for selective revalidation
  }
});
```

**How Next.js Implements This:**

Next.js patches the global fetch function during server-side rendering:

```typescript
// Simplified Next.js fetch implementation
const originalFetch = global.fetch;

global.fetch = function nextFetch(url, options = {}) {
  const cacheKey = `fetch-cache:${url}`;
  const { cache, next } = options;

  if (cache === 'no-store') {
    // Bypass cache (like getServerSideProps)
    return originalFetch(url, options);
  }

  // Check cache
  const cached = getCachedResponse(cacheKey);

  if (cached && !isStale(cached, next?.revalidate)) {
    return Promise.resolve(cached.data);
  }

  // Fetch and cache
  return originalFetch(url, options).then(response => {
    cacheResponse(cacheKey, response, next?.revalidate);
    return response;
  });
};
```

**Request Deduplication:**

Next.js automatically deduplicates identical fetch requests within the same render:

```typescript
async function Page() {
  // These three fetches only execute ONCE
  const [data1, data2, data3] = await Promise.all([
    fetch('https://api.example.com/user'),
    fetch('https://api.example.com/user'),  // Deduplicated
    fetch('https://api.example.com/user')   // Deduplicated
  ]);

  // Same request in child component: still deduplicated
  return <ChildComponent />;
}

async function ChildComponent() {
  const user = await fetch('https://api.example.com/user'); // Uses cached result
  return <div>{user.name}</div>;
}
```

### Performance Characteristics: Real Numbers

**Static Site Generation (SSG):**
- TTFB: 20-50ms (CDN edge)
- FCP: 300-500ms
- LCP: 500-800ms
- Cost: $0.10 per 1M requests (pure CDN)
- Scalability: Infinite (no server execution)

**Server-Side Rendering (SSR):**
- TTFB: 300-1800ms (cold start + execution)
- FCP: 800-2000ms
- LCP: 1200-2500ms
- Cost: $5-20 per 1M requests (serverless execution time)
- Scalability: Limited by function concurrency (1000-3000 concurrent on Vercel)

**Incremental Static Regeneration (ISR):**
- TTFB (cached): 20-50ms
- TTFB (regenerating): 20-50ms (serves stale)
- FCP: 300-500ms
- LCP: 500-800ms
- Cost: $0.15 per 1M requests (CDN + occasional regeneration)
- Scalability: High (mostly CDN, periodic regeneration)

**Real-World Example (E-commerce Product Page):**

```typescript
// ❌ BAD: SSR for product page (expensive at scale)
export async function getServerSideProps({ params }) {
  const product = await db.product.findUnique({
    where: { id: params.id }
  });

  return { props: { product } };
}

// At 100,000 requests/hour:
// - Cost: ~$10/hour in serverless execution
// - TTFB: 500-1500ms
// - Database load: 100,000 queries/hour

// ✅ GOOD: ISR for product page (cheap + fast)
export async function getStaticProps({ params }) {
  const product = await db.product.findUnique({
    where: { id: params.id }
  });

  return {
    props: { product },
    revalidate: 300 // 5 minutes
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking' // Generate on-demand
  };
}

// At 100,000 requests/hour:
// - Cost: ~$0.50/hour (mostly CDN)
// - TTFB: 20-50ms (cached)
// - Database load: ~20 queries/hour (revalidation only)
// - Savings: 95% cost reduction, 20x faster
```

</details>

---
