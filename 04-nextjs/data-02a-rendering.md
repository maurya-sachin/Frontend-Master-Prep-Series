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

---

<details>
<summary><strong>🔍 Deep Dive: SSR/SSG/ISR Architecture & Internals</strong></summary>

### V8/Browser Rendering Pipeline for Each Strategy

#### SSG Execution Model

When you use `getStaticProps`, Next.js performs a sophisticated pre-rendering pipeline during the build phase:

**Build-time SSG Process:**

1. **Dependency Resolution (getStaticPaths):**
   - Next.js calls `getStaticPaths()` to determine which dynamic routes to generate
   - For example, a blog with `[slug].js` might return 5,000 post slugs
   - Each slug becomes a separate HTML file: `.next/server/pages/blog/post-1.html`, etc.
   - This happens sequentially or in parallel depending on Next.js configuration

2. **Data Fetching & Props Serialization:**
   - `getStaticProps()` executes in a Node.js environment (NOT the browser)
   - Promises resolve (database queries, API calls all complete before rendering)
   - Props must be serializable to JSON (no functions, Dates, undefined, Symbols)
   - **Critical constraint:** If you have 50,000 pages × 500ms per page = 416 minutes (7 hours!)
   - Next.js optimizes with parallel rendering (concurrent executions)

3. **React Rendering to HTML (SSR):**
   - React calls `ReactDOMServer.renderToString()` with props
   - Converts React component tree to static HTML string
   - **No hydration needed at this stage** (pure HTML generation)
   - Process: Component → JSX tree → Virtual DOM → HTML string
   - Output: `<div id="__next">[rendered HTML]</div><script id="__NEXT_DATA__">{...props...}</script>`

4. **HTML Asset Optimization:**
   - Inline critical CSS
   - Extract non-critical CSS to separate file
   - Minify HTML (remove whitespace, comments)
   - Generate source maps (if development mode)
   - Write to `.next/server/pages/blog/post-1.html`

5. **Static Asset Generation:**
   - Props cached in JSON: `.next/server/pages/blog/post-1.json`
   - Allows on-demand ISR without re-executing getStaticProps
   - Loaded during hydration: `<script id="__NEXT_DATA__" type="application/json">{...}</script>`

**Performance Characteristics:**

```
Total TTFB breakdown:
- Network latency (CDN → browser): 10-50ms (regional CDN)
- Browser HTML parsing: 20-100ms
- TCP connection + SSL: 10-50ms (cached on subsequent requests)
- Total: 40-200ms typical (10-20ms possible with edge caching)

Build time impact:
- 5,000 pages × 100ms average = 500 seconds (8.3 minutes)
- 50,000 pages × 100ms = 5,000 seconds (83 minutes)
- With parallel rendering (8 workers): 10 minutes
- ISR fallback: 'blocking' generates on first request
```

#### SSR Execution Model

**Request-time SSR Process:**

When user requests a page with `getServerSideProps`:

1. **Request Handler Invocation:**
   - Next.js server receives HTTP request
   - Route matching: `/user/[id]` matches `/user/123`
   - Allocates new execution context
   - Extracts params: `{ id: '123' }`

2. **getServerSideProps Execution:**
   - Runs in isolated Node.js context per request
   - Has access to `req` and `res` objects:
     - `req.headers` (including cookies, user-agent)
     - `req.cookies` (parsed from Cookie header)
     - `req.query` (URL params: `?sort=date`)
     - `req.method` ('GET', 'POST', etc.)
   - Async/await works normally
   - Typical execution: 100-500ms (database + API calls)

3. **Race Conditions & Concurrency:**
   - Multiple simultaneous requests spawn multiple executions
   - Each has independent database connections
   - Connection pool limits: PostgreSQL 500, MongoDB 500
   - Under load (10,000 req/sec):
     - Each request blocks for ~300ms
     - 10,000 × 0.3 = 3,000 concurrent executions needed
     - Memory: 3,000 × 50MB = 150GB required
     - Reality: crash at 500 concurrent (timeout)

4. **Props Serialization:**
   - Same as SSG: must be JSON-serializable
   - Large objects slow down serialization (complex graphs)
   - Serialization: typically <10ms, but can spike with large datasets

5. **React Rendering:**
   - `ReactDOMServer.renderToString()` with fresh props
   - Component tree renders with current request data
   - **Important:** Component tree is pure (no side effects during render)
   - Rendering itself: 20-100ms

6. **HTML Transmission:**
   - Send HTML with `Content-Type: text/html`
   - Include props in `<script id="__NEXT_DATA__">`
   - Browser starts parsing while still downloading (streaming)

**Performance Bottlenecks:**

```
Request timeline:
|0ms      |50ms    |200ms         |500ms          |600ms
Request  Network  DB Query      API Call      Render
Arrived  Latency  (150ms)      (200ms)       (100ms)
         (20ms)
         └─────────────────────────────────┘
         getServerSideProps execution time: 470ms

Total TTFB: ~550ms (20ms network + 530ms server processing)
At scale: 1000 req/sec × 550ms = 550 concurrent = pool exhaustion
```

#### ISR Execution Model

**Sophisticated Hybrid Approach:**

ISR uses a **stale-while-revalidate** pattern (RFC 5861):

```
Timeline (revalidate: 60):

User A Request (t=0s):
  │
  ├─ Cache lookup → MISS
  │
  ├─ Execute getStaticProps (2s)
  │
  ├─ Render HTML (200ms)
  │
  ├─ Set cache with:
  │   - HTML + props
  │   - expiry: t=60s
  │   - stale_after: t=60s
  │
  └─ Return to User A (2.2s total)

User B Request (t=30s):
  │
  ├─ Cache lookup → HIT (fresh)
  │
  └─ Return cached HTML (50ms)

User C Request (t=90s - AFTER revalidate window):
  │
  ├─ Cache lookup → HIT (but marked STALE)
  │
  ├─ Return STALE version immediately (50ms)
  │   ↓ Trigger background regeneration async
  │
  ├─ Execute getStaticProps in background
  │
  ├─ Update cache (new HTML + props)
  │
  └─ Next request gets fresh version

User D Request (t=92s):
  │
  ├─ Cache lookup → HIT (fresh, just regenerated)
  │
  └─ Return fresh HTML (50ms)
```

**Cache Implementation Details:**

```typescript
// How ISR caching works internally
const ISRCache = {
  '/product/123': {
    html: '<html>...</html>',
    json: { product: {...} },
    generatedAt: 1234567890,
    revalidateAt: 1234567890 + 60*1000, // 60 seconds
    isStale: false
  }
};

// On request:
function handleISRRequest(path, revalidate) {
  const cached = ISRCache[path];

  if (!cached) {
    // Cache miss - generate synchronously (slow)
    const { html, json } = generatePage();
    ISRCache[path] = { html, json, revalidateAt: now() + revalidate };
    return html; // 500-2000ms
  }

  if (cached.revalidateAt > now()) {
    // Cache fresh - return instantly
    return cached.html; // 10-50ms
  }

  // Cache stale - return stale but regenerate background
  scheduleRegeneration(path, revalidate);
  return cached.html; // 10-50ms (stale, but fast)
}
```

**On-Demand Revalidation (Webhooks):**

```typescript
// When CMS publishes new product
POST /api/revalidate
{ productId: 123, secret: "..." }

// Server-side:
export default async function handler(req, res) {
  // 1. Verify webhook signature
  if (req.headers['x-signature'] !== sign(req.body)) {
    return res.status(401).end();
  }

  // 2. Trigger revalidation
  await res.revalidate(`/product/${req.body.productId}`);
  // This operation:
  // - Removes entry from ISR cache
  // - Next request rebuilds page
  // - Serves fresh version

  // 3. Return immediately (async regeneration)
  return res.json({ revalidated: true });
}
```

**Vercel Edge Network Caching (Distributed):**

Vercel caches ISR pages at 150+ edge locations globally:

```
Edge Network Architecture:

User in Tokyo            User in London            User in São Paulo
    │                         │                           │
    └─ sg.vercel.sh ←─┬─ eu.vercel.sh ─┬─ br.vercel.sh ──┘
                      │                 │
                  [Cache sync - eventual consistency]
                      │                 │
                      └─ Origin Server ─┘
                      (single source of truth)

When origin regenerates:
1. Update origin cache
2. Propagate to all edges (takes 1-5 seconds)
3. All edges serve fresh version eventually

During propagation (eventual consistency):
- Tokyo edge still serves old version (30s old)
- London edge receives new version
- Users get different content (rare but possible)
```

### CSR Execution Model

**Browser-Centric Rendering:**

```
Initial Load Timeline:

Network        Browser         React
├─ 0ms: HTTP request
│       └─ 50ms: HTML shell received
│               ├─ 100ms: HTML parsing complete
│               │         (shows loading skeleton)
│               │
│               ├─ 150ms: Start downloading JS
│               │
│               ├─ 500ms: JS download complete (300KB)
│               │
│               ├─ 600ms: React bootstrap (init, mount)
│               │
│               ├─ 650ms: Initial render
│               │         └─ FCP (First Contentful Paint)
│               │
│               ├─ 700ms: Start data fetches
│               │
│               ├─ 1200ms: Data arrives from API
│               │
│               ├─ 1300ms: Re-render with data
│               │         └─ LCP (Largest Contentful Paint)
│               │
│               └─ 1500ms: TTI (Time to Interactive)

Total: 1.5 seconds (vs 200ms for SSG)
```

**Smart Caching with SWR (Stale-While-Revalidate):**

```typescript
// SWR cache behavior
const cache = new Map(); // In-memory cache

async function useSWR(key, fetcher, options) {
  const cached = cache.get(key);

  if (cached && !isStale(cached)) {
    // Return cached immediately (fallback data)
    return { data: cached.data, error: null, isLoading: false };
  }

  // Schedule revalidation in background
  const promise = fetcher(key)
    .then(data => {
      cache.set(key, { data, timestamp: Date.now() });
      trigger(); // Re-render with fresh data
      return data;
    })
    .catch(err => {
      trigger(); // Re-render with error
      return err;
    });

  // Return stale data while fetching
  if (cached) {
    return { data: cached.data, isLoading: true };
  }

  // No cache - wait for promise
  return promise;
}
```

### Rendering Strategy Trade-offs Matrix

```
                      SSG      ISR      SSR      CSR
TTFB                 10ms     50ms    500ms    800ms
FCP                 100ms    200ms    700ms   1200ms
TTI                 500ms    800ms   1800ms   2500ms
Freshness          Stale    Minutes  Real-time Real-time
Build Time          ~5min    ~5min     None     None
Server Cost         $0/mo    $50/mo   $500/mo  $200/mo
SEO Score            100      100       95       40
Scalability        Infinite  Infinite Limited  Excellent
Cache Hit Rate      100%     98%      0%       Varies

Decision: SSG > ISR > SSR > CSR (in priority order)
Exception: Use what's needed, not what's fastest
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: YouTube-style Video Platform Performance Crisis</strong></summary>

### The Problem: Rendering Strategy Mismatch at Scale

**Company:** Video streaming platform (100 million videos, 50 million daily users)

**Initial Architecture:**
- Video pages: SSR (getServerSideProps) for "fresh metadata"
- Comment sections: SSR (fetch all comments on page load)
- Recommendations: SSR (personalized feed generation)

**Crisis Timeline:**

**Phase 1: Slow Degradation (Week 1)**

```
Metrics at 100K concurrent viewers:
- Video page TTFB: 850ms (concerns raised)
- P95 TTFB: 2100ms
- P99 TTFB: 5800ms
- Bounce rate: 15%
- Revenue loss: 3-5% daily

Engineers investigate: "Maybe it's the database?"
```

**Phase 2: Scale Event - World Cup Final (100M viewers spike)**

```
Spike to 500K concurrent viewers:
- Video page TTFB: 12000ms (TIMEOUT)
- Error rate: 25% (504 Gateway Timeout)
- Revenue loss: $2.1M/hour
- Engineers: PANIC MODE
- CEO: "Fix it NOW"

Timeline to crash:
├─ 12:00 PM: Game starts
├─ 12:02 PM: Traffic increases
├─ 12:05 PM: First errors appear
├─ 12:08 PM: 10% error rate
├─ 12:12 PM: Cascading failures (cache exhaustion)
└─ 12:15 PM: Manual intervention (rollback to cached version)
```

**Root Cause Analysis:**

```
Per-request processing breakdown:

getServerSideProps execution (1000ms total):
├─ Fetch video metadata DB (250ms)
├─ Fetch creator info (150ms)
├─ Fetch comment count (100ms)
├─ Fetch engagement metrics (200ms)
├─ Fetch recommendations (300ms)
│  └─ 10 API calls × 30ms each in series
└─ React render (50ms)

Database connection pool:
├─ Max connections: 500
├─ Connections per request: 1
├─ At 500K req/sec: 500,000 connections needed
├─ Actual capacity: 500
├─ Queue depth: 499,500
└─ Result: 999+ second wait times
```

**Memory explosion:**

```
Memory per request: 50MB (parsed JSON, buffers, etc.)
Concurrent requests: 500K
Total memory: 25TB required
Actual server: 128GB
Result: Out of memory → Page heap → Crash
```

### The Solution: Multi-Strategy Hybrid Architecture

**Phase 1: Separate Static & Dynamic Content (Day 1)**

```typescript
// OLD: Everything SSR (disaster)
export async function getServerSideProps({ params }) {
  const video = await db.videos.findById(params.id); // 250ms
  const creator = await db.creators.findById(video.creatorId); // 150ms
  const comments = await db.comments.findMany({ videoId: params.id }); // 1000ms
  const recommendations = await fetchRecommendations(params.id); // 300ms

  return { props: { video, creator, comments, recommendations } };
}

// NEW: ISR for static metadata
export async function getStaticProps({ params }) {
  const video = await db.videos.findById(params.id);
  const creator = await db.creators.findById(video.creatorId);

  return {
    props: { video, creator },
    revalidate: 3600 // 1 hour - metadata changes slowly
  };
}

export async function getStaticPaths() {
  // Pre-generate top 100K videos at build time
  const topVideos = await db.videos.findMany({
    where: { views: { gt: 1000000 } },
    take: 100000,
    select: { id: true }
  });

  return {
    paths: topVideos.map(v => ({ params: { id: v.id } })),
    fallback: 'blocking' // Generate others on first request
  };
}

function VideoPage({ video, creator }) {
  // Comments: CSR (fresh, user-generated)
  const { data: comments } = useSWR(
    `/api/comments?videoId=${video.id}`,
    fetcher,
    { refreshInterval: 5000 } // 5 second polling
  );

  // Recommendations: CSR (personalized per user)
  const { data: recommendations } = useSWR(
    `/api/recommendations?videoId=${video.id}`,
    fetcher,
    { refreshInterval: 300000 } // 5 minute updates
  );

  return (
    <div>
      {/* ISR: Video details (1 hour stale OK) */}
      <VideoPlayer video={video} creator={creator} />

      {/* CSR: Comments (real-time) */}
      <CommentsSection comments={comments} />

      {/* CSR: Recommendations (personalized) */}
      <RecommendationsList recommendations={recommendations} />
    </div>
  );
}
```

**Impact of Phase 1:**

```
Before ISR split:
- Every request: 1000ms (all dependencies)
- At 500K req/sec: 500K concurrent = CRASH
- Database: 500 connections exhausted

After ISR split:
- 99% of requests: 50ms (cache hit)
- 1% of requests: 2500ms (regeneration)
- Database: 5-10 connections needed
- Server CPU: 15% (vs 95%)
```

**Phase 2: API Route Optimization with Redis Caching**

```typescript
// pages/api/comments.ts
import { redis } from '@/lib/redis';

export default async function handler(req, res) {
  const { videoId } = req.query;

  // Aggressive caching
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=20'
  );

  // 1. Try Redis cache first (in-memory)
  const cacheKey = `comments:${videoId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    // Cache hit: serve from Redis (2ms)
    return res.json(JSON.parse(cached));
  }

  // 2. Cache miss - fetch from database
  try {
    const comments = await db.comments.findMany({
      where: { videoId },
      take: 50,
      orderBy: { createdAt: 'desc' }
    });

    // 3. Cache in Redis for 10 seconds
    await redis.setex(cacheKey, 10, JSON.stringify(comments));

    return res.json(comments);
  } catch (error) {
    // 4. Fail gracefully - serve stale data
    const stale = await redis.get(`${cacheKey}:stale`);
    if (stale) {
      return res.json(JSON.parse(stale));
    }

    return res.status(500).json({ error: 'Failed to load comments' });
  }
}
```

**Phase 3: Serverless Function Optimization**

```typescript
// Reduce cold start impact
// pages/api/recommendations.ts

// Keep connection warm
let dbConnection = null;

function getConnection() {
  if (!dbConnection) {
    dbConnection = createPooledConnection();
  }
  return dbConnection;
}

export default async function handler(req, res) {
  const { videoId, userId } = req.query;

  // Very aggressive caching
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=600'
  );

  try {
    const db = getConnection(); // Reuse warm connection

    const recommendations = await db.query(`
      SELECT v.* FROM videos v
      WHERE v.categoryId IN (
        SELECT categoryId FROM videos WHERE id = $1 LIMIT 5
      )
      AND v.id != $1
      LIMIT 20
    `, [videoId]);

    // Cache for 5 minutes
    await cache.setex(`recs:${videoId}`, 300, recommendations);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Recommendations unavailable' });
  }
}
```

### Results After Multi-Strategy Migration

**Same World Cup Final Event (500K concurrent):**

```
Performance Metrics:

Video Page TTFB:
├─ Before: 12000ms (TIMEOUT)
└─ After: 52ms (99.6% improvement!)

Error Rate:
├─ Before: 25%
└─ After: 0.3% (only API timeouts)

Concurrent Database Connections:
├─ Before: 500+ (exhausted)
└─ After: 12 (95% reduction!)

Server CPU:
├─ Before: 98% (saturated)
└─ After: 8% (plenty headroom)

Cache Hit Rate:
├─ ISR pages: 99.1%
├─ API routes: 94.7%
└─ Overall: 97.8%

Revenue Impact:
├─ Before: $2.1M loss/hour
└─ After: -$150K (minor API timeouts only)
```

**Infrastructure Cost:**

```
Before (SSR disaster):
├─ 500 servers: $100K/month
├─ Auto-scaling: $20K/month
├─ Database (high-tier): $50K/month
└─ Total: $170K/month

After (ISR + CSR):
├─ 40 servers: $8K/month
├─ Auto-scaling: $2K/month
├─ Database (standard): $15K/month
├─ Redis cache: $5K/month
├─ CDN (Vercel): $30K/month
└─ Total: $60K/month

Savings: $110K/month ($1.32M/year!)
```

**Debugging Process:**

```typescript
// Step 1: Performance monitoring
import Sentry from '@sentry/nextjs';

export async function getServerSideProps(context) {
  const transaction = Sentry.startTransaction({
    op: 'getServerSideProps',
    name: 'video-page'
  });

  const dbSpan = transaction.startChild({ op: 'db.query', description: 'fetch video' });
  const video = await db.videos.findById(context.params.id);
  dbSpan.end();

  const creatorSpan = transaction.startChild({ op: 'db.query', description: 'fetch creator' });
  const creator = await db.creators.findById(video.creatorId);
  creatorSpan.end();

  transaction.finish(); // Shows: 250ms + 150ms = 400ms

  return { props: { video, creator } };
}

// Result: Identified video + creator fetch as bottleneck (400ms / 1000ms = 40%)
```

```typescript
// Step 2: Load testing identified database exhaustion
artillery quick --count 1000 --num 10 https://video.example.com/v/123
// Showed: P95 latency spike at 100 concurrent users
// Root cause: DB connection pool (500 max, all exhausted)
```

```typescript
// Step 3: Trace database connections
// PostgreSQL monitoring showed:
// idle: 0 (all active)
// active: 497
// waiting: 500+
// Result: Confirmed pool exhaustion
```

### Key Lessons

1. **Avoid SSR at scale** - Use ISR first, SSR only when necessary
2. **Separate freshness requirements** - Different data has different needs
3. **Implement intelligent caching** - Redis + HTTP cache headers
4. **Monitor database connections** - Connection pooling is critical
5. **Test at 10x expected load** - Catch problems before production
6. **Graceful degradation** - Show stale data > show error > 500 timeout
7. **Use CDN aggressively** - ISR + CDN = infinite scalability

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: SSR vs SSG vs ISR - Advanced Decision Making</strong></summary>

### Performance-Freshness Spectrum

```
SSG (Static)         ISR (Hybrid)         SSR (Dynamic)       CSR (Browser)
│                    │                    │                   │
├─ TTFB: 10ms        ├─ TTFB: 50ms        ├─ TTFB: 500ms       ├─ TTFB: 800ms
├─ Cost: $0          ├─ Cost: $50         ├─ Cost: $500        ├─ Cost: $200
├─ Scalability: ∞    ├─ Scalability: ∞    ├─ Scalability: 100  ├─ Scalability: 10K
├─ Freshness: Days   ├─ Freshness: Min    ├─ Freshness: Real   ├─ Freshness: Real
└─ Build time: 5m    └─ Build time: 5m    └─ Build time: 0     └─ Build time: 0
```

### When Each Strategy Breaks Down

#### SSG Limitations

```
✅ Works well for:
- Blogs (post change every week)
- Documentation (change rarely)
- Landing pages (static copy)
- Product catalogs with 1-10K items

❌ Breaks when:
- 100K+ pages (build > 30 minutes)
  └─ Solution: ISR with fallback: 'blocking'

- Content updates multiple times/day
  └─ Solution: ISR with revalidate: 3600

- User-specific content
  └─ Solution: Hybrid (SSG shell + CSR data)

- Need request context (IP geolocation)
  └─ Solution: ISR + middleware
```

#### ISR Sweet Spot Analysis

ISR is optimal when:

```
Freshness requirement: 1 minute to 24 hours
   │
   ├─ < 1 minute → Use SSR or CSR with polling
   ├─ 1 min - 1 hour → ISR PERFECT
   ├─ 1 - 24 hours → ISR GOOD
   └─ > 24 hours → SSG with manual revalidation

Traffic volume: 1K - 1M requests/hour
   │
   ├─ < 1K/hour → Any strategy works
   ├─ 1K - 100K/hour → ISR OPTIMAL
   ├─ 100K - 1M/hour → ISR EXCELLENT (99%+ cache hit)
   └─ > 1M/hour → ISR STILL BEST but need edge caching

Content characteristics:
   ├─ Homogeneous (same for all users) → ISR GOOD
   ├─ Personalized (user-specific) → Use hybrid (ISR shell + CSR data)
   ├─ Real-time (< 5 seconds stale) → SSR or CSR
   └─ Mostly static → SSG better
```

#### SSR - When It's Actually Needed

```
Genuine SSR requirements (rare):
├─ User personalization required
│  Example: Showing "Welcome, Sarah" in <title> for SEO
│  Solution: Instead, use ISR with personalization in CSR
│
├─ Request headers critical (geoip redirects)
│  Example: /en vs /fr based on Accept-Language
│  Solution: Use middleware instead
│
├─ Authentication required
│  Example: Check session before rendering
│  Solution: SSR + CSR (show loading until auth verified)
│
└─ Real-time data < 1 second old
   Example: Stock prices updating constantly
   Solution: ISR + CSR polling, or just CSR

Most "SSR" use cases can be optimized with ISR + CSR hybrid.
```

### Cost-Benefit Analysis

```
Small blog (10K monthly users):
├─ SSG: $0/month (GitHub Pages)
├─ ISR: $10/month (Vercel Pro)
├─ SSR: $50/month (VPS)
└─ Decision: SSG OBVIOUS

E-commerce (100K monthly users):
├─ SSG: $50/month (CDN, but rebuild takes 1 hour)
├─ ISR: $200/month (Vercel, 99% cache hit)
├─ SSR: $2000/month (VPS, constant compute)
└─ Decision: ISR OBVIOUS

SaaS dashboard (50K monthly users, all authenticated):
├─ SSG: N/A (personalized content)
├─ ISR: $100/month (ISR shell) + $300/month (CSR APIs)
├─ SSR: $1500/month (per-request rendering)
├─ CSR: $100/month (static + CSR data fetching)
└─ Decision: CSR or ISR+CSR HYBRID

Video platform (100M content items):
├─ SSG: N/A (too many items to build)
├─ ISR: $500/month (Vercel) + edge (Cloudflare): $200
├─ SSR: $50K/month (massive compute needs)
├─ Hybrid (ISR+CSR): $700/month
└─ Decision: ISR + CSR MANDATORY
```

### Risk Analysis Matrix

```
Strategy    Build Risk    Cache Risk    Cost Risk    Performance Risk
─────────────────────────────────────────────────────────────────────
SSG         HIGH          LOW           LOW          NONE
            (long builds) (always valid)(cheap)      (fastest)

ISR         MEDIUM        MEDIUM        LOW          LOW
            (periodic)    (stale-while)(cheap)       (fast 99% of time)

SSR         NONE          NONE          HIGH         HIGH
            (no builds)   (no caching)  (expensive)  (slow, unpredictable)

CSR         NONE          NONE          LOW          MEDIUM
            (no builds)   (client mgd)  (cheap)      (slow initial, fast after)
```

### Advanced Hybrid Patterns

**Pattern 1: SEO-First E-commerce**

```
Public pages: ISR (product pages, category pages)
Private pages: CSR (user cart, checkout, account)
API routes: Cached with Redis

Product page load:
├─ HTML: ISR cached (50ms)
├─ Reviews: CSR polling (fresh)
├─ Stock: CSR polling (real-time)
└─ Recommendations: CSR personalized

Result: SEO friendly + real-time features
```

**Pattern 2: Real-time Dashboard**

```
Layout: SSR (once per session)
Data: CSR with WebSocket

Initial load: Fast (SSR shell renders quickly)
Live updates: Real-time via WebSocket
Personalization: Server-rendered in SSR

Result: Fast initial + real-time + personalized
```

**Pattern 3: News Website**

```
Archive articles: SSG (never change)
Recent articles: ISR (revalidate every 10 min)
Breaking news: CSR (every 30 seconds)
Comments: CSR (real-time)

Load pattern:
├─ Old articles: Instant (SSG)
├─ Recent: 50ms (ISR cache)
├─ Breaking: Shows immediately (CSR updates)
└─ Comments: Real-time polling

Result: Performance + freshness + SEO
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Rendering Strategies - Advanced Interview Perspective</strong></summary>

### The Core Mental Model

Think of Next.js rendering like a restaurant **kitchen staffing decision**:

**SSG = Pre-prepared food (cook once, serve many)**
- Chef cooks dinner at 5pm (build time)
- Customers arrive anytime, get instant food
- Cost: One chef per day
- Problem: Food gets cold if no customers for 2 hours
- **When to use:** Popular dishes, same recipe for everyone

**ISR = Smart hot-holding (cook, then refresh)**
- Chef cooks dinner at 5pm
- Serves customers all evening
- At 7pm, tosses old food and cooks fresh batch
- New customers get warmer food
- Cost: One chef, occasional refreshes
- **When to use:** Popular dishes with time-sensitive ingredients

**SSR = Cook-to-order (every order gets custom cooking)**
- Customer orders, chef cooks from scratch (15 min)
- Food is perfect but customer waits
- If 50 orders arrive at once: impossible to fulfill
- Cost: One chef per customer (hire 50 chefs!)
- **When to use:** Custom requests only, rare items

**CSR = Customer cooks themselves**
- Customer gets raw ingredients, recipe, kitchen
- Takes time to cook (10 minutes)
- But can keep cooking more dishes (updates)
- Restaurant pays nothing
- Problem: Customers don't know how to cook well
- **When to use:** Adventurous customers, no waiters needed

### Interview-Ready Explanation (The "Aha" Moment)

**When interviewer asks: "Why would you choose ISR over SSR?"**

**Your answer:**

> "Great question. Let me explain with math:
>
> If I use SSR for an e-commerce product page with 50K products and 1000 concurrent users:
> - Each request: 500ms (database + API calls)
> - 1000 concurrent users × 500ms = need 500 concurrent executions
> - Each execution: 50MB memory
> - Total memory: 25GB (but server has 16GB)
> - Result: Out of memory, crashes
>
> With ISR (revalidate: 300):
> - 99% of requests: 50ms (cache hit) - instant
> - 1% of requests: 800ms (regeneration in background)
> - All requests served from cache first, then regenerated
> - Database: 1-2 concurrent connections (vs 500)
> - Memory: 100MB (one regeneration at a time)
> - Server happy, users happy
>
> ISR is the sweet spot for scale because you get:
> - SSG performance (99% of the time)
> - SSR freshness (periodic updates)
> - Cost-effectiveness (cheap scale)
>
> I'd choose ISR over SSR any day unless data absolutely must be fresh every second."

### Common Interview Pitfalls (What to Avoid)

**❌ Mistake 1:** "SSR is always better because it's fresh"

**✅ Correct:** SSR is expensive and slow. Only use when you really need real-time data. Most "fresh" requirements can be handled with ISR + CSR hybrid.

**❌ Mistake 2:** "I don't understand the difference between ISR and SSR"

**✅ Correct:**
- SSR: Every request rebuilds the page (slow)
- ISR: Build once, rebuild periodically (fast + fresh)

**❌ Mistake 3:** "I'll just use CSR, it's simpler"

**✅ Correct:** CSR has terrible SEO and slow initial load. Only use for authenticated apps or real-time interactive dashboards.

**❌ Mistake 4:** "Caching is complicated, I'll just use SSR"

**✅ Correct:** ISR is actually simpler than SSR - just add `revalidate: 60` and you're done!

**❌ Mistake 5:** "I must choose one strategy for my entire app"

**✅ Correct:** Modern apps use multiple strategies. Homepage = SSG, products = ISR, dashboard = SSR, reviews = CSR.

### Decision Framework (What Interviewers Actually Test)

**Question: "You're building a feature - which rendering strategy would you use?"**

**Your decision process:**

```
1. Is the content the same for all users?
   NO → Need personalization → SSR or CSR
   YES → Continue to question 2

2. How often does content change?
   Every second → CSR (polling/WebSocket)
   Every minute → SSR (real-time)
   Every hour → ISR (periodic refresh)
   Once a week → SSG (rebuild on publish)

3. Is SEO important?
   NO → CSR (auth-required apps)
   YES → Server rendering required (SSG/ISR/SSR)

4. What's the traffic level?
   < 1K/hour → Any strategy works
   1K - 100K/hour → ISR OPTIMAL
   > 100K/hour → ISR MANDATORY (SSR would cost $$$$)

5. Budget constraints?
   $ → SSG or ISR (cheap)
   $$ → ISR + CSR (balanced)
   $$$ → SSR acceptable (but ISR still better)
```

### Real Interview Examples

**Example 1: "Design the rendering strategy for a video platform like YouTube"**

Your answer:
> "I'd use a hybrid approach:
>
> Video metadata page (title, description, creator):
> - ISR (revalidate: 3600) - stale for 1 hour OK
> - This handles 99% of traffic instantly
> - Build time: minimal (background regeneration)
>
> Real-time data (like count, views):
> - CSR with polling (refresh every 10 seconds)
> - Server-rendered initial value
> - Updates independently without full page refresh
>
> Comments (user-generated, real-time):
> - CSR only (WebSocket for live updates)
> - Don't cache user content
>
> Recommendations (personalized):
> - CSR based on viewing history
> - API cached in Redis (5 minute TTL)
>
> Results:
> - TTFB: 50ms (ISR cache)
> - Live updates: Real-time (CSR)
> - Cost: $300/month (CDN + minimal compute)
> - Scales to 100M+ concurrent viewers"

**Example 2: "You're building a SaaS dashboard. How do you approach rendering?"**

Your answer:
> "Since it's authenticated and personalized:
>
> Two options:
>
> Option 1 (Recommended): SSR + CSR hybrid
> - SSR: Load user identity (fast)
> - CSR: Load dashboard data (real-time)
> - User sees "Welcome, [name]" + loading skeleton
> - Data loads independently
>
> Option 2 (Simpler): Pure CSR
> - Just render static shell
> - Client fetches everything
> - Simpler to build, same user experience
>
> Option 3 (Avoid): Pure SSR
> - Every request rebuilds entire dashboard
> - Expensive at scale
> - Slow and doesn't scale
>
> I'd pick Option 1 because:
> - Fast initial paint (user sees their name immediately)
> - Real-time data updates (via CSR polling)
> - Scales well (dashboard logic on client)
> - Best UX (feels snappy)"

---

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

</details>

---

<details>
<summary><strong>🔍 Deep Dive: Next.js Rendering Internals</strong></summary>

### SSG (Static Site Generation) Architecture

**Build-time Process:**

At build time, Next.js executes `getStaticProps` for each page and generates static HTML files. This process involves several optimization layers:

1. **Page Pre-rendering Pipeline:**
   - Next.js calls `getStaticProps` during `next build`
   - Data is fetched and serialized to JSON
   - React components are rendered to HTML strings using `ReactDOMServer.renderToString()`
   - HTML is written to `.next/server/pages/` directory
   - JSON props are stored in `.next/static/<BUILD_ID>/` for client-side hydration

2. **Hydration Process:**
   - Browser downloads HTML (instant FCP - First Contentful Paint)
   - JavaScript bundle loads in background
   - React "hydrates" the static HTML, attaching event listeners
   - Page becomes interactive (TTI - Time to Interactive)

3. **CDN Distribution:**
   - Static files can be deployed to edge CDN (Vercel Edge Network, CloudFront, Cloudflare)
   - Served from closest geographical location
   - Zero origin server requests
   - TTFB (Time to First Byte) typically 10-50ms globally

**Performance Characteristics:**
- **TTFB:** 10-50ms (CDN edge)
- **FCP:** 100-300ms (includes HTML parse + CSS)
- **TTI:** 500-1500ms (depends on JS bundle size)
- **Lighthouse Score:** 95-100 (excellent performance)

### SSR (Server-Side Rendering) Architecture

**Request-time Process:**

Every request triggers a server-side render cycle:

1. **Request Handling:**
   - User requests page → hits Next.js server/serverless function
   - Server executes `getServerSideProps` function
   - Data is fetched from database/API (blocking operation)
   - Server waits for all promises to resolve

2. **Rendering Pipeline:**
   - React renders components to HTML string on server
   - HTML includes serialized props in `<script>` tag for hydration
   - Response sent to browser (Status 200)
   - Browser parses HTML and displays content

3. **Hydration:**
   - JavaScript bundle downloads
   - React hydrates the server-rendered HTML
   - Event handlers attach, page becomes interactive

**Performance Bottlenecks:**
- **Database latency:** 20-100ms (internal network)
- **API calls:** 50-500ms (external services)
- **Server processing:** 10-50ms (React rendering)
- **Network RTT:** 20-300ms (user → server → user)
- **Total TTFB:** 100-1000ms (cumulative)

**Scalability Challenges:**
At scale (100,000+ requests/minute), SSR becomes expensive:
- Each request requires CPU cycles for rendering
- Memory usage spikes during concurrent renders
- Database connections pool exhaustion
- Need horizontal scaling (more servers)
- Cold start penalties on serverless (300-1000ms)

### ISR (Incremental Static Regeneration) Architecture

**Hybrid Model - The Sweet Spot:**

ISR combines benefits of SSG (speed) with SSR (freshness) using a sophisticated caching mechanism:

1. **Initial Request (Cache Miss):**
   - First user hits page after deployment
   - Next.js generates page like SSG (slow)
   - Page cached in Next.js cache layer
   - Subsequent users get cached version (fast)

2. **Stale-While-Revalidate Pattern:**
```
Time: 0s     → User A requests page
             → Cache MISS → Generate HTML (2s)
             → Serve to User A + Cache (revalidate: 60)

Time: 30s    → User B requests page
             → Cache HIT → Serve instantly (50ms)

Time: 90s    → User C requests page (after 60s revalidate)
             → Cache STALE but still valid
             → Serve stale version instantly (50ms)
             → Trigger background regeneration
             → New version ready for next request

Time: 92s    → Regeneration complete
             → Cache updated with fresh data

Time: 95s    → User D requests page
             → Cache HIT (fresh) → Serve instantly (50ms)
```

3. **Cache Implementation (Vercel Platform):**
   - Cached in Vercel Edge Network (150+ locations globally)
   - Each edge location maintains its own cache
   - Cache invalidation propagates globally (eventual consistency)
   - Manual revalidation via API: `res.revalidate('/path')`

4. **On-Demand Revalidation (Next.js 12.2+):**
```typescript
// API Route: pages/api/revalidate.ts
export default async function handler(req, res) {
  // Verify request (webhook from CMS)
  if (req.query.secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    // Revalidate specific path
    await res.revalidate('/blog/my-post');

    // Revalidate multiple paths
    await Promise.all([
      res.revalidate('/'),
      res.revalidate('/blog'),
      res.revalidate('/blog/my-post')
    ]);

    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).send('Error revalidating');
  }
}
```

**ISR Cache Invalidation Strategies:**
- **Time-based:** Automatic after `revalidate` seconds
- **Event-based:** Webhook from CMS triggers on-demand revalidation
- **Manual:** API call to revalidate endpoint
- **Conditional:** Only regenerate if data actually changed

### CSR (Client-Side Rendering) Architecture

**Browser-based Rendering:**

1. **Initial Load:**
   - Server sends minimal HTML shell (loading state)
   - JavaScript bundle downloads (can be large: 200KB-2MB)
   - React initializes and mounts
   - Data fetching begins (API calls)

2. **Data Fetching Pattern (SWR/React Query):**
```typescript
// Smart caching with SWR
const { data, error, isLoading, mutate } = useSWR(
  '/api/user/dashboard',
  fetcher,
  {
    refreshInterval: 3000,        // Poll every 3s
    revalidateOnFocus: true,      // Refetch on tab focus
    revalidateOnReconnect: true,  // Refetch on reconnect
    dedupingInterval: 2000,       // Prevent duplicate requests
    errorRetryCount: 3,           // Retry failed requests
    fallbackData: cachedData      // Show stale data instantly
  }
);
```

3. **Performance Characteristics:**
   - **Initial HTML:** 5-10KB (nearly empty)
   - **JavaScript Bundle:** 200KB-2MB (framework + app code)
   - **First Render:** After JS downloads + executes (500-2000ms)
   - **Data Available:** After API calls complete (+200-1000ms)
   - **Total TTI:** 1000-3000ms (highly variable)

**SEO Implications:**
- Google bot executes JavaScript but with limitations:
  - Timeout after 5 seconds of processing
  - No support for real-time data fetching
  - Crawl budget wasted on JavaScript execution
- Other bots (Facebook, Twitter, LinkedIn) don't execute JS
- Result: Poor social media previews, incomplete indexing

### Rendering Strategy Decision Matrix

**When SSG is Optimal:**
- Content changes infrequently (blog posts, documentation)
- Same content for all users (marketing pages, landing pages)
- SEO is critical (public-facing content)
- Maximum performance needed (Core Web Vitals)
- Cost optimization priority (minimize server compute)

**Example Metrics (Real Blog Site):**
- Lighthouse Score: 100/100
- TTFB: 28ms (global average)
- FCP: 180ms
- LCP: 420ms
- CLS: 0.01
- Cost: $0/month (served from CDN)

**When SSR is Necessary:**
- User-specific content (personalized dashboards)
- Real-time data requirements (stock prices, live sports)
- Request context needed (cookies, headers, geolocation)
- Cannot be cached (different for every user)
- SEO + freshness both critical

**Example Metrics (Dashboard):**
- TTFB: 650ms (includes DB query)
- FCP: 850ms
- LCP: 1200ms
- Cost: $250/month (serverless functions)

**When ISR is the Sweet Spot:**
- Content updates periodically (product catalogs, news)
- Can tolerate slight staleness (5-60 seconds old)
- High traffic with cacheable content
- Need both performance AND freshness
- E-commerce, news sites, social platforms

**Example Metrics (E-commerce):**
- TTFB: 45ms (cached), 800ms (regeneration)
- FCP: 220ms
- LCP: 580ms
- Cache Hit Rate: 99.2% (excellent performance)
- Cost: $45/month (occasional regenerations)

**When CSR is Appropriate:**
- Private, authenticated content (admin panels)
- Highly interactive applications (dashboards, tools)
- SEO not important (behind login)
- Real-time updates essential (live chat, collaborative editing)
- Native app-like experience

**Example Metrics (Admin Panel):**
- Initial Load: 1800ms
- Interactive: 2200ms
- Subsequent Navigation: <100ms (SPA routing)
- SEO: Not applicable (requires authentication)

### Advanced Optimization: Hybrid Rendering

Modern Next.js apps use **multiple strategies per page**:

```typescript
// Layout: SSG (static shell)
export async function getStaticProps() {
  const navigation = await fetchNavigation(); // Changes rarely
  return { props: { navigation }, revalidate: 3600 }; // 1 hour ISR
}

function Layout({ navigation, children }) {
  return (
    <>
      <Header nav={navigation} /> {/* SSG */}
      {children}
    </>
  );
}

// Product Page: ISR (product data)
export async function getStaticProps({ params }) {
  const product = await fetchProduct(params.id);
  return {
    props: { product },
    revalidate: 300 // 5 minutes
  };
}

function ProductPage({ product }) {
  // CSR: Reviews (real-time, user-generated)
  const { data: reviews } = useSWR(`/api/reviews/${product.id}`, fetcher, {
    refreshInterval: 10000 // 10 seconds
  });

  // CSR: Inventory (real-time stock)
  const { data: stock } = useSWR(`/api/stock/${product.id}`, fetcher, {
    refreshInterval: 5000 // 5 seconds
  });

  return (
    <div>
      {/* ISR: Product details (5 min stale) */}
      <ProductDetails product={product} />

      {/* CSR: Real-time stock */}
      <StockIndicator stock={stock} />

      {/* CSR: User reviews (10s polling) */}
      <Reviews reviews={reviews} />
    </div>
  );
}
```

**Performance Result:**
- TTFB: 50ms (ISR cache hit)
- FCP: 250ms (static product HTML)
- LCP: 600ms (product image loads)
- Reviews appear: 850ms (parallel CSR fetch)
- Stock updates: Every 5 seconds (CSR polling)

This hybrid approach delivers:
- Fast initial load (ISR)
- SEO-friendly product content (server-rendered)
- Real-time dynamic features (CSR)
- Cost-effective (99% cache hit rate)

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Rendering Strategy Disaster</strong></summary>

### The Problem: E-commerce Site Performance Collapse

**Company:** Mid-size online retailer (50,000 products, 500K monthly users)

**Initial Architecture (Naive Approach):**
All product pages using SSR (`getServerSideProps`) for "always fresh" data.

**Symptoms Observed:**

**Week 1 - Slow Degradation:**
```
Metrics (1000 concurrent users):
- Average TTFB: 850ms (acceptable)
- P95 TTFB: 1800ms (concerning)
- P99 TTFB: 4500ms (poor)
- Error Rate: 0.2%
- Server CPU: 60% average
```

**Week 4 - Flash Sale Event (10,000 concurrent users):**
```
Metrics (10x traffic spike):
- Average TTFB: 4200ms (TERRIBLE)
- P95 TTFB: 12000ms (TIMEOUT)
- P99 TTFB: 30000ms (TIMEOUT)
- Error Rate: 15% (504 Gateway Timeout)
- Server CPU: 98% sustained
- Revenue Loss: $45,000/hour (checkout failures)
- Database Connections: 495/500 (pool exhaustion)
```

**Root Cause Analysis:**

1. **SSR Overhead Per Request:**
   - Database query: 120ms (product data)
   - API call (inventory): 180ms
   - API call (pricing): 150ms
   - React rendering: 45ms
   - **Total server time: 495ms** (per request)

2. **Scaling Math:**
   - 1000 req/sec × 495ms = 495 concurrent renders
   - Each render: 150MB memory
   - Total memory: 74GB required
   - Actual server capacity: 32GB
   - Result: Memory thrashing, swap usage, slowdown

3. **Database Connection Pool Exhaustion:**
   - Max connections: 500 (PostgreSQL limit)
   - Each SSR request holds connection for 300ms average
   - At 1000 req/sec: requires 300 concurrent connections
   - Spike to 10,000 req/sec: requires 3000 connections
   - Result: Connection queue buildup, timeouts

4. **Cascading Failures:**
   - Slow responses → users retry → more load
   - Serverless cold starts: 1200ms additional latency
   - No caching → every request hits database
   - Database slow queries trigger circuit breakers
   - Payment processor timeouts (30s max)

**Business Impact:**
- Bounce rate: 32% → 68% (users abandon slow pages)
- Conversion rate: 3.2% → 0.8% (checkout failures)
- Revenue loss: $45K/hour during 6-hour flash sale = **$270K total**
- Customer complaints: 2,300 emails
- Refund requests: 450 (angry customers)

### The Solution: ISR + Strategic Caching

**New Architecture:**

**Phase 1: Convert to ISR (Week 1)**
```typescript
// OLD: SSR (disaster)
export async function getServerSideProps({ params }) {
  const product = await db.product.findUnique({ where: { id: params.id } });
  const inventory = await inventoryAPI.getStock(params.id);
  const pricing = await pricingAPI.getPrice(params.id);

  return { props: { product, inventory, pricing } };
}

// NEW: ISR (optimized)
export async function getStaticProps({ params }) {
  // Fetch only semi-static data
  const product = await db.product.findUnique({ where: { id: params.id } });
  const basePrice = await pricingAPI.getBasePrice(params.id);

  return {
    props: { product, basePrice },
    revalidate: 300 // 5 minutes - acceptable staleness for product details
  };
}

export async function getStaticPaths() {
  // Pre-generate top 5000 products at build time
  const topProducts = await db.product.findMany({
    where: { views: { gt: 100 } },
    take: 5000,
    select: { id: true }
  });

  return {
    paths: topProducts.map(p => ({ params: { id: p.id } })),
    fallback: 'blocking' // Generate other pages on-demand
  };
}

function ProductPage({ product, basePrice }) {
  // CSR: Real-time inventory (only what needs to be fresh)
  const { data: stock } = useSWR(`/api/inventory/${product.id}`, fetcher, {
    refreshInterval: 5000, // 5 seconds
    fallbackData: { inStock: true, quantity: 10 } // Optimistic default
  });

  // CSR: Dynamic pricing (flash sale prices)
  const { data: currentPrice } = useSWR(`/api/pricing/${product.id}`, fetcher, {
    refreshInterval: 10000, // 10 seconds
    fallbackData: { price: basePrice } // Use ISR base price as fallback
  });

  return (
    <div>
      {/* ISR: Product content (5 min stale OK) */}
      <ProductDetails product={product} />

      {/* CSR: Real-time price */}
      <PriceDisplay price={currentPrice} />

      {/* CSR: Real-time stock */}
      <StockIndicator stock={stock} />

      {/* ISR: Reviews (5 min stale OK) */}
      <Reviews reviews={product.reviews} />
    </div>
  );
}
```

**Phase 2: API Route Optimization**
```typescript
// pages/api/inventory/[id].ts
export default async function handler(req, res) {
  const { id } = req.query;

  // Aggressive caching for inventory API
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=5, stale-while-revalidate=10'
  );

  try {
    // Read from Redis cache first
    const cached = await redis.get(`inventory:${id}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Cache miss - fetch from inventory service
    const stock = await inventoryAPI.getStock(id);

    // Cache for 5 seconds
    await redis.setex(`inventory:${id}`, 5, JSON.stringify(stock));

    res.json(stock);
  } catch (error) {
    // Fail gracefully
    res.status(200).json({ inStock: true, quantity: 10 }); // Optimistic fallback
  }
}
```

**Phase 3: On-Demand Revalidation**
```typescript
// Webhook from product management system
// pages/api/revalidate-product.ts
export default async function handler(req, res) {
  const { productId, secret } = req.body;

  // Verify webhook
  if (secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ error: 'Invalid secret' });
  }

  try {
    // Trigger ISR regeneration immediately
    await res.revalidate(`/product/${productId}`);

    // Clear inventory cache
    await redis.del(`inventory:${productId}`);

    // Clear price cache
    await redis.del(`pricing:${productId}`);

    return res.json({ revalidated: true, productId });
  } catch (err) {
    return res.status(500).json({ error: 'Revalidation failed' });
  }
}
```

### Results After Migration

**Same Flash Sale Event (10,000 concurrent users):**
```
ISR Performance Metrics:
- Average TTFB: 42ms (95% improvement!)
- P95 TTFB: 95ms (99% improvement!)
- P99 TTFB: 380ms (99% improvement!)
- Error Rate: 0.05% (97% reduction)
- Server CPU: 12% average (87% reduction)
- Cache Hit Rate: 98.7% (excellent!)
- Database Connections: 25/500 (95% reduction)
```

**Business Impact:**
- Bounce rate: 68% → 8% (massive improvement)
- Conversion rate: 0.8% → 4.1% (higher than before!)
- Revenue: **+$180K** compared to previous flash sale
- Customer satisfaction: 4.8/5 stars (up from 2.1)
- Infrastructure cost: -40% (fewer servers needed)

**Cost Breakdown:**

**Before (SSR):**
- Compute: $4,500/month (20 servers @ $225/month)
- Database: $800/month (high-tier instance)
- Total: **$5,300/month**

**After (ISR):**
- Compute: $1,800/month (8 servers @ $225/month)
- Database: $400/month (lower-tier sufficient)
- Redis Cache: $100/month
- CDN: $200/month (Vercel Edge Network)
- Total: **$2,500/month**

**Savings: $2,800/month ($33,600/year)**

### Debugging Process (How We Found the Issue)

**Step 1: Performance Monitoring (New Relic)**
```javascript
// Added instrumentation
export async function getServerSideProps(context) {
  const transaction = newrelic.startTransaction('getServerSideProps');

  const dbSegment = newrelic.startSegment('database');
  const product = await db.product.findUnique(...);
  dbSegment.end();

  const inventorySegment = newrelic.startSegment('inventory-api');
  const inventory = await inventoryAPI.getStock(...);
  inventorySegment.end();

  const pricingSegment = newrelic.startSegment('pricing-api');
  const pricing = await pricingAPI.getPrice(...);
  pricingSegment.end();

  transaction.end();

  return { props: { product, inventory, pricing } };
}
```

**Findings:**
- Database: 120ms (24% of time)
- Inventory API: 180ms (36% of time)
- Pricing API: 150ms (30% of time)
- React Render: 45ms (9% of time)
- **Total: 495ms per request**

**Step 2: Load Testing (Artillery)**
```yaml
config:
  target: 'https://shop.example.com'
  phases:
    - duration: 60
      arrivalRate: 100  # 100 req/sec
    - duration: 60
      arrivalRate: 500  # Ramp to 500
    - duration: 60
      arrivalRate: 1000 # Ramp to 1000

scenarios:
  - flow:
      - get:
          url: '/product/{{ $randomNumber(1, 50000) }}'
```

**Results:**
- At 100 req/sec: P95 = 800ms (OK)
- At 500 req/sec: P95 = 2400ms (BAD)
- At 1000 req/sec: P95 = 12000ms (DISASTER)

**Step 3: Database Monitoring**
```sql
-- Check slow queries
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Results showed:
-- Product query: 120ms average (acceptable)
-- BUT: 350 concurrent connections during spike
-- Connection pool: 500 max
-- Queue wait time: 2-5 seconds (PROBLEM!)
```

**Step 4: Identified Core Issue**
- Every request requires database connection
- SSR prevents caching
- No request deduplication
- High latency API calls on critical path
- Zero fault tolerance (API failures = page failures)

### Key Lessons Learned

1. **Default to Static, Add Dynamic Selectively**
   - Start with SSG/ISR for page shell
   - Add CSR for truly dynamic pieces
   - Minimize SSR usage (last resort)

2. **Measure Cache Hit Rates**
   - Target: >95% for ISR pages
   - Monitor: CloudWatch, Vercel Analytics
   - Alert: <90% indicates problem

3. **Graceful Degradation**
   - Always provide fallback data
   - Don't fail page if API fails
   - Show stale data > show error

4. **Load Test Before Production**
   - Test at 10x expected traffic
   - Test with cold caches
   - Test API failures

5. **Monitor Real User Metrics**
   - TTFB, FCP, LCP (Core Web Vitals)
   - Error rates by page type
   - Database connection pool usage
   - API latency percentiles

---

## ⚖️ Trade-offs: Rendering Strategy Decision Framework

### SSR vs SSG vs ISR: The Fundamental Trade-offs

**Performance vs Freshness Spectrum:**
```
Static (SSG)          Hybrid (ISR)         Dynamic (SSR)          Real-time (CSR)
     ↓                     ↓                      ↓                       ↓
  FASTEST               FAST                   SLOW                  VARIES
  STALE                SEMI-FRESH             FRESH                REAL-TIME
  CHEAPEST             CHEAP                  EXPENSIVE            MEDIUM
  BEST SEO             GREAT SEO              GREAT SEO            POOR SEO
```

### Trade-off Matrix: When to Choose What

#### SSG Trade-offs

**✅ WINS:**
1. **Performance** - Unbeatable TTFB (10-50ms from CDN)
2. **Cost** - Cheapest possible (pay for storage, not compute)
3. **Scalability** - Infinite (CDN handles millions req/sec)
4. **Reliability** - No server required, can't go down
5. **SEO** - Perfect crawlability and indexing

**❌ LOSSES:**
1. **Data Freshness** - Stale until next build/revalidation
2. **Build Time** - Large sites slow to build (10K pages = 5-30 min)
3. **Personalization** - Can't show user-specific content
4. **Dynamic Routes** - Must know all paths at build time
5. **Real-time Updates** - Requires manual revalidation

**⚠️ WHEN IT BREAKS:**
- Site grows beyond 50,000 pages (build time >30 minutes)
- Content updated every minute (constant rebuilds)
- User-specific content needed (personalization)
- Need to react to external events instantly

**Example Decision:**
```
Blog with 5,000 posts, updated 10 times/day:
- SSG with ISR (revalidate: 3600) ✅ PERFECT
- Build time: 3 minutes (acceptable)
- Cost: $10/month (CDN only)
- TTFB: 25ms average

News site with 500,000 articles, updated 1000 times/day:
- Pure SSG ❌ BAD (build time hours)
- ISR with on-demand revalidation ✅ BETTER
- CSR for breaking news widget ✅ HYBRID APPROACH
```

#### SSR Trade-offs

**✅ WINS:**
1. **Data Freshness** - Always current (fetch on every request)
2. **Personalization** - User-specific content easy
3. **Request Context** - Access to cookies, headers, IP
4. **No Build Step** - Deploy instantly, no pre-rendering
5. **Dynamic Routes** - Any URL works without pre-generation

**❌ LOSSES:**
1. **Performance** - Slow TTFB (200-2000ms typical)
2. **Cost** - Expensive at scale (compute for every request)
3. **Scalability** - Limited by server capacity
4. **Reliability** - Server downtime = site downtime
5. **Database Load** - Every request hits database

**⚠️ WHEN IT BREAKS:**
- Traffic exceeds 10,000 concurrent users (server overload)
- External API slow/unreliable (slow page loads)
- Database connection pool exhausted (timeouts)
- Cold start penalties on serverless (1-3s latency spikes)

**Example Decision:**
```
User dashboard (10K daily users, authenticated):
- SSR ✅ CORRECT
- Performance: 400ms TTFB (acceptable for dashboard)
- Cost: $200/month (serverless functions)
- Alternative (CSR): Worse UX, poor SEO

Public product catalog (100K daily users):
- SSR ❌ WRONG - $5000/month, slow
- ISR ✅ CORRECT - $300/month, fast
```

#### ISR Trade-offs

**✅ WINS:**
1. **Performance** - Near-static speed (30-100ms TTFB)
2. **Freshness** - Periodic updates (configurable staleness)
3. **Cost** - Low (mostly CDN, occasional regenerations)
4. **Scalability** - Excellent (CDN + background regeneration)
5. **SEO** - Perfect (static HTML)

**❌ LOSSES:**
1. **Staleness Window** - Data can be outdated (seconds to minutes)
2. **First User Penalty** - Slow for user triggering regeneration
3. **Complexity** - Must handle cache invalidation
4. **Eventual Consistency** - Edge caches sync takes time
5. **Build Requirements** - Still need getStaticPaths for dynamic routes

**⚠️ WHEN IT BREAKS:**
- Need <1 second data freshness (use CSR or SSR)
- First-page load must be instant (fallback: 'blocking' slows it)
- Cache invalidation events extremely frequent (defeats caching)
- Global consistency critical (edge caches may be out of sync)

**Example Decision:**
```
E-commerce product page (1M daily users):
- ISR (revalidate: 300) ✅ OPTIMAL
- 99.5% requests served from cache (50ms)
- 0.5% trigger regeneration (800ms - acceptable)
- Product data 5 minutes stale (acceptable for most products)
- Cost: $400/month

Stock trading dashboard:
- ISR ❌ WRONG - 5 min stale data unacceptable
- SSR + CSR polling ✅ CORRECT - real-time critical
```

#### CSR Trade-offs

**✅ WINS:**
1. **Real-time Updates** - Live data via polling/WebSockets
2. **Interactivity** - Rich, app-like experience
3. **No Server Rendering** - Simple deployment (static files)
4. **Offline Support** - Service workers enable offline mode
5. **State Management** - Easy to maintain client state

**❌ LOSSES:**
1. **SEO** - Poor for public content (bots may not execute JS)
2. **Initial Load** - Slow FCP (blank screen until JS loads)
3. **Performance** - Large JavaScript bundles (200KB-2MB)
4. **Accessibility** - Requires JavaScript enabled
5. **Social Sharing** - No server-rendered meta tags (poor previews)

**⚠️ WHEN IT BREAKS:**
- Public content requiring SEO (use SSG/ISR)
- Slow networks (huge JS bundle downloads)
- Low-powered devices (JS execution slow)
- Aggressive ad blockers (may block API calls)

**Example Decision:**
```
Admin dashboard (private, authenticated):
- CSR ✅ PERFECT
- SEO not needed (behind auth)
- Real-time updates critical
- Rich interactivity expected

Marketing landing page (public):
- CSR ❌ DISASTER - no SEO, slow FCP
- SSG ✅ CORRECT - fast, SEO perfect
```

### Decision Framework: Systematic Approach

**Step 1: Public or Private?**
```
Is content publicly accessible?
├─ YES → Proceed to Step 2 (SEO considerations)
└─ NO (requires auth) → Proceed to Step 3 (freshness requirements)
```

**Step 2: SEO Critical?**
```
Is SEO important for this page?
├─ YES → Server rendering required (SSG/ISR/SSR)
│   └─ Proceed to Step 3
└─ NO → CSR acceptable
    └─ Proceed to Step 3
```

**Step 3: Data Freshness Requirements**
```
How fresh must data be?
├─ Static (changes rarely) → SSG
├─ Periodic (minutes-hours) → ISR
├─ Always fresh (seconds) → SSR or CSR
└─ Real-time (<1 second) → CSR with WebSockets/polling
```

**Step 4: Personalization Needs**
```
Is content user-specific?
├─ YES → SSR (server-side personalization) or CSR (client-side)
├─ NO → SSG/ISR perfect
└─ PARTIAL → Hybrid (static shell + CSR for personal bits)
```

**Step 5: Traffic Scale**
```
Expected concurrent users?
├─ <1,000 → Any strategy works
├─ 1,000-10,000 → Prefer SSG/ISR (SSR acceptable)
├─ 10,000-100,000 → SSG/ISR (SSR expensive)
└─ >100,000 → SSG/ISR mandatory (SSR prohibitively expensive)
```

**Step 6: Cost Constraints**
```
Monthly budget?
├─ <$100 → SSG/ISR (CDN-based)
├─ $100-$1000 → ISR/SSR hybrid
├─ $1000-$5000 → SSR acceptable at scale
└─ >$5000 → Any strategy, optimize for performance
```

### Real-World Decision Examples

#### Example 1: SaaS Marketing Website

**Requirements:**
- 20 pages (Home, Features, Pricing, Blog with 50 posts)
- Public, SEO critical
- Content updated weekly
- 50,000 monthly visitors
- Budget: $50/month

**Decision Process:**
1. Public? YES → SEO important
2. SEO critical? YES → Server rendering required
3. Data freshness? Weekly → SSG perfect
4. Personalization? NO
5. Traffic? Moderate → SSG scales infinitely
6. Budget? Low → SSG cheapest

**Chosen Strategy: SSG**
```typescript
// Rebuild automatically on content changes (Vercel Git integration)
export async function getStaticProps() {
  const posts = await fetchBlogPosts();
  return {
    props: { posts }
    // No revalidate - rebuild on git push
  };
}
```

**Results:**
- TTFB: 18ms (Vercel Edge)
- Lighthouse: 100/100
- Cost: $0 (Vercel free tier)

#### Example 2: E-commerce Product Catalog

**Requirements:**
- 50,000 products
- Prices/inventory change frequently
- SEO critical
- 500,000 monthly visitors
- Budget: $500/month

**Decision Process:**
1. Public? YES → SEO important
2. SEO critical? YES → Server rendering required
3. Data freshness? Minutes → ISR perfect
4. Personalization? Partial (cart is CSR)
5. Traffic? High → ISR scales well
6. Budget? Medium → ISR cost-effective

**Chosen Strategy: ISR + CSR Hybrid**
```typescript
// Product details: ISR (5 min stale acceptable)
export async function getStaticProps({ params }) {
  const product = await fetchProduct(params.id);
  return {
    props: { product },
    revalidate: 300 // 5 minutes
  };
}

// Inventory/pricing: CSR (real-time)
function ProductPage({ product }) {
  const { data: liveData } = useSWR(`/api/product/${product.id}/live`, {
    refreshInterval: 10000 // 10 seconds
  });

  return (
    <div>
      <ProductDetails product={product} /> {/* ISR */}
      <PricingWidget price={liveData?.price} stock={liveData?.stock} /> {/* CSR */}
    </div>
  );
}
```

**Results:**
- TTFB: 52ms (99% cache hit)
- Cache hit rate: 99.2%
- Cost: $380/month (Vercel Pro + Redis)

#### Example 3: Real-time Analytics Dashboard

**Requirements:**
- User-specific data
- Private (behind authentication)
- Real-time updates (every 5 seconds)
- 10,000 daily active users
- Budget: $2000/month

**Decision Process:**
1. Public? NO → SEO not important
2. SEO critical? NO → CSR acceptable
3. Data freshness? Real-time → CSR ideal
4. Personalization? YES (user-specific)
5. Traffic? Moderate → CSR scales well
6. Budget? High → Can afford real-time infrastructure

**Chosen Strategy: SSR (shell) + CSR (data)**
```typescript
// Initial user data: SSR (for faster first paint)
export async function getServerSideProps({ req }) {
  const user = await getUserFromCookie(req.cookies.auth);
  return { props: { user } };
}

// Live dashboard data: CSR with polling
function Dashboard({ user }) {
  const { data } = useSWR('/api/dashboard/live', fetcher, {
    refreshInterval: 5000, // 5 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });

  return <DashboardView user={user} liveData={data} />;
}
```

**Results:**
- Initial load: 650ms (SSR)
- Live updates: Every 5 seconds (CSR)
- Cost: $1,200/month (serverless + WebSocket connections)

#### Example 4: News Website

**Requirements:**
- 1,000 articles/day published
- Breaking news must appear instantly
- SEO critical
- 2 million daily visitors
- Budget: $3000/month

**Decision Process:**
1. Public? YES → SEO critical
2. SEO critical? YES → Server rendering required
3. Data freshness? Mixed (breaking=instant, archive=hours)
4. Personalization? NO
5. Traffic? Very high → Must use caching
6. Budget? High → Can afford sophisticated setup

**Chosen Strategy: ISR + On-Demand Revalidation + CSR Breaking News**
```typescript
// Article pages: ISR with on-demand revalidation
export async function getStaticProps({ params }) {
  const article = await fetchArticle(params.slug);
  return {
    props: { article },
    revalidate: 3600 // 1 hour default
  };
}

// CMS webhook triggers immediate revalidation
// pages/api/revalidate.ts
export default async function handler(req, res) {
  await res.revalidate(`/article/${req.body.slug}`);
  return res.json({ revalidated: true });
}

// Breaking news banner: CSR
function Layout({ children }) {
  const { data: breaking } = useSWR('/api/breaking-news', fetcher, {
    refreshInterval: 15000 // 15 seconds
  });

  return (
    <>
      {breaking && <BreakingNewsBanner news={breaking} />}
      {children}
    </>
  );
}
```

**Results:**
- TTFB: 38ms (ISR cache)
- Breaking news latency: <15 seconds
- Cost: $2,400/month (Vercel Enterprise + Redis)
- Cache hit rate: 98.8%

### Trade-off Summary Table

| Strategy | TTFB | Cost | Scalability | Freshness | SEO | Best For |
|----------|------|------|-------------|-----------|-----|----------|
| **SSG** | 10-50ms | $ | ⭐⭐⭐⭐⭐ | Stale | ⭐⭐⭐⭐⭐ | Blogs, docs, marketing |
| **ISR** | 30-100ms | $$ | ⭐⭐⭐⭐⭐ | Minutes | ⭐⭐⭐⭐⭐ | E-commerce, news |
| **SSR** | 200-2000ms | $$$$ | ⭐⭐ | Real-time | ⭐⭐⭐⭐⭐ | Dashboards, personalized |
| **CSR** | 500-3000ms | $$ | ⭐⭐⭐⭐ | Real-time | ⭐ | Admin panels, apps |

**Key Insight:** Modern Next.js apps rarely use one strategy. The best approach is **strategic hybridization** - combining multiple strategies within the same application, or even the same page, to optimize for each specific use case.

---

## 💬 Explain to Junior: Rendering Strategies Simplified

### The Restaurant Analogy

Imagine you're running a restaurant. How do you serve customers efficiently?

#### SSG = Pre-Made Meals (Buffet)

**How it works:**
- Every morning, you cook 100 portions of each dish
- Store them in warmers
- When customers arrive, serve instantly from pre-made stock
- Reheat throughout the day

**Pros:**
- Customer gets food INSTANTLY (fastest service)
- Cheap to operate (cook once, serve many times)
- Can handle massive lunch rush (500 customers? No problem!)
- Consistent quality (all dishes prepared carefully)

**Cons:**
- Food might get stale by evening
- Can't customize orders ("no onions please" = sorry!)
- If you run out, must cook more (slow)
- What if only 10 customers show up? (wasted food)

**Real web example:**
- Your blog posts (they don't change often)
- Documentation site (static content)
- Landing pages (same for everyone)

**When to use:** Content that's the same for everyone and doesn't change often.

#### SSR = Cook to Order (Fine Dining)

**How it works:**
- Customer orders dish
- Chef cooks it fresh
- Takes 15 minutes
- Delivered hot and customized

**Pros:**
- Always FRESH (just cooked)
- Fully customized (vegetarian? No problem!)
- Adapts to customer preferences
- No waste (cook only what's ordered)

**Cons:**
- SLOW (customer waits 15 minutes)
- Expensive (chef's time for every order)
- Limited capacity (chef can only cook 10 dishes/hour)
- What if 100 customers arrive? (disaster!)

**Real web example:**
- Your personalized dashboard ("Welcome, Sarah!")
- Bank account page (shows YOUR balance)
- Shopping cart (your items, your prices)

**When to use:** User-specific content that must be fresh.

#### ISR = Smart Buffet (Best of Both Worlds)

**How it works:**
- Pre-make dishes like buffet
- Every 30 minutes, throw away old food and cook fresh batch
- Customers get food instantly (from buffet)
- But it's refreshed regularly (so not too stale)

**Pros:**
- Fast service (instant from buffet)
- Reasonably fresh (refreshed every 30 min)
- Cheap to operate (not cooking per-order)
- Handles huge crowds easily

**Cons:**
- Food might be 29 minutes old (slightly stale)
- First customer after refresh waits (while cooking)
- Still can't customize individual orders

**Real web example:**
- Amazon product pages (price updates every 5 minutes)
- News articles (updated hourly)
- Restaurant menu (dishes updated daily)

**When to use:** Content that changes periodically but can tolerate being slightly out of date.

#### CSR = DIY Kitchen (Self-Service)

**How it works:**
- Give customer ingredients and recipe
- Customer cooks at their table
- You just provide the raw materials

**Pros:**
- Fully customizable (customer makes it however they want)
- No chef needed (cheap for restaurant)
- Customer can keep cooking more (refills)
- Very interactive experience

**Cons:**
- SLOW initial experience (customer must cook first)
- Customer needs cooking skills (JavaScript enabled)
- Can't tell what they're eating from outside (bad for reviews/SEO)
- Ingredients might be heavy to carry to table (large download)

**Real web example:**
- Gmail (loads shell, then fetches your emails)
- Google Sheets (loads app, then data)
- Admin dashboards (loads UI, then stats)

**When to use:** Interactive apps where SEO doesn't matter and you need real-time updates.

### The Newspaper Analogy

Let's try another angle:

**SSG** = Printed newspaper
- Printed at 5am, delivered to your doorstep
- INSTANT to read (just pick it up)
- But news is already few hours old
- Everyone gets the same newspaper

**SSR** = Personal news reporter
- Calls sources right when you ask
- Gathers latest info custom for you
- Takes 10 minutes to prepare
- Always fresh, but you WAIT

**ISR** = Newspaper with updates
- Printed at 5am (like SSG)
- Reprinted every 30 minutes with latest news
- Still instant to read
- Reasonably fresh (at most 29 min old)

**CSR** = Twitter feed
- Nothing when you first open app (blank screen)
- Then app loads and fetches tweets
- Live updates keep coming
- Fully personalized to you

### Interview Answer Template

**When interviewer asks: "Explain Next.js rendering strategies"**

**Template Answer:**
> "Next.js offers four main rendering strategies, each with different trade-offs:
>
> **SSG** (Static Site Generation) pre-renders pages at build time. It's the fastest option with excellent SEO, perfect for blogs and marketing pages. The downside is content can become stale between builds.
>
> **ISR** (Incremental Static Regeneration) is like SSG but with periodic updates. It regenerates pages in the background after a set time, giving you both speed and freshness. I'd use this for e-commerce product pages where prices update every few minutes.
>
> **SSR** (Server-Side Rendering) generates pages on each request. It's always fresh and can show user-specific content, but it's slower and more expensive at scale. Best for dashboards and personalized pages.
>
> **CSR** (Client-Side Rendering) loads a minimal shell and fetches data in the browser. Great for highly interactive apps behind authentication, but poor for SEO.
>
> In practice, I combine these strategies. For example, an e-commerce page might use ISR for product details, CSR for real-time inventory, and SSG for the header/footer. The key is choosing the right strategy for each piece of content based on its freshness requirements and whether SEO matters."

### Common Misconceptions (Junior Developers Make These Mistakes)

**❌ Misconception 1:** "SSR is always better because it's always fresh"
**✅ Reality:** SSR is expensive and slow. Only use when you actually NEED real-time data.

**❌ Misconception 2:** "SSG can't handle dynamic content"
**✅ Reality:** SSG + CSR hybrid works great. Static shell, dynamic data via client-side fetch.

**❌ Misconception 3:** "ISR is complicated, I'll just use SSR"
**✅ Reality:** ISR is just SSG with a `revalidate` number. It's actually simpler than SSR!

**❌ Misconception 4:** "CSR is bad, never use it"
**✅ Reality:** CSR is perfect for authenticated, interactive apps. Just not for public SEO pages.

**❌ Misconception 5:** "I must choose one strategy for my entire app"
**✅ Reality:** Mix strategies! Home page = SSG, product pages = ISR, dashboard = SSR, chat = CSR.

### Quick Decision Cheat Sheet (For Juniors)

Ask yourself these questions:

**1. Does everyone see the same content?**
- YES → Consider SSG/ISR
- NO → Consider SSR/CSR

**2. How often does content change?**
- Never/Rarely → SSG
- Every few minutes/hours → ISR
- Every second → SSR or CSR

**3. Is it public and needs SEO?**
- YES → Must use SSG/ISR/SSR (server-rendered)
- NO → CSR is fine

**4. Will you have high traffic?**
- YES → Prefer SSG/ISR (scales infinitely)
- NO → Any strategy works

**5. Is it behind authentication?**
- YES → CSR or SSR (user-specific)
- NO → SSG/ISR (public)

### Simple Code Examples (For Interview Practice)

**SSG Example:**
```jsx
// This runs at BUILD TIME (once)
export async function getStaticProps() {
  const posts = await fetchBlogPosts();
  return { props: { posts } };
}

// Results in super fast HTML pages
function BlogPage({ posts }) {
  return <PostList posts={posts} />;
}
```

**ISR Example:**
```jsx
// Runs at build time, then regenerates every 60 seconds
export async function getStaticProps() {
  const products = await fetchProducts();
  return {
    props: { products },
    revalidate: 60 // ← This makes it ISR!
  };
}
```

**SSR Example:**
```jsx
// This runs on EVERY REQUEST (slow but fresh)
export async function getServerSideProps({ req }) {
  const user = await getUserFromCookie(req.cookies);
  return { props: { user } };
}

function Dashboard({ user }) {
  return <div>Welcome {user.name}!</div>;
}
```

**CSR Example:**
```jsx
function Dashboard() {
  // Fetch data in browser (after page loads)
  const { data } = useSWR('/api/user', fetcher);

  if (!data) return <Loading />;
  return <div>Welcome {data.name}!</div>;
}
```

**Remember:**
- **SSG** = Build time (fastest, static)
- **ISR** = Build time + refresh (fast, semi-fresh)
- **SSR** = Request time (slow, always fresh)
- **CSR** = Browser time (slow initial, real-time updates)

Choose based on your specific needs, and don't be afraid to mix strategies within the same app!

</details>

---
