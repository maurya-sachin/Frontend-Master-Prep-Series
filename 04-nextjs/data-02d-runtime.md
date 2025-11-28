# Next.js Runtime Environments

> Edge Runtime vs Node.js Runtime - when to use each and performance trade-offs.

---

## Question 1: Edge Runtime vs Node.js Runtime

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Vercel, Modern cloud-first teams

### Question
What are the differences between Edge Runtime and Node.js Runtime in Next.js? When should you use each?

### Answer

**Runtime Environments:**
1. **Node.js Runtime** - Full Node.js environment with complete API access
2. **Edge Runtime** - Lightweight runtime optimized for edge networks
3. **Key difference** - Trade capabilities for speed and global distribution
4. **Use case matters** - Choose based on requirements, not preference
5. **Can mix** - Different routes can use different runtimes

**Key Points:**
1. **Performance** - Edge faster globally (lower latency), Node.js faster for complex operations
2. **Capabilities** - Node.js full API, Edge restricted subset
3. **Cost** - Edge cheaper at scale (distributed), Node.js centralized
4. **Cold starts** - Edge minimal (<50ms), Node.js significant (300ms-1s)
5. **Global distribution** - Edge automatic, Node.js manual replication

### Code Example

```typescript
// 1. EDGE RUNTIME CONFIGURATION
// app/api/edge-handler/route.ts
export const runtime = 'edge'; // Run on edge network

export async function GET(request: Request) {
  // Edge Runtime - Restricted API
  const userAgent = request.headers.get('user-agent');
  const geo = request.headers.get('x-vercel-ip-country');

  // ✅ ALLOWED: Fetch, Response, Headers, URL
  const data = await fetch('https://api.example.com/data');

  // ❌ NOT ALLOWED: fs, path, crypto (Node.js APIs)
  // const fs = require('fs'); // ERROR

  return Response.json({
    location: geo,
    userAgent,
    data: await data.json()
  });
}

// 2. NODE.JS RUNTIME CONFIGURATION
// app/api/node-handler/route.ts
export const runtime = 'nodejs'; // Run on Node.js (default)

export async function GET() {
  // Full Node.js API available
  const fs = require('fs');
  const path = require('path');
  const crypto = require('crypto');

  // ✅ Complex operations allowed
  const data = fs.readFileSync(path.join(process.cwd(), 'data.json'));
  const hash = crypto.createHash('sha256').update(data).digest('hex');

  // ✅ Database connections, file system, etc.
  const dbResult = await db.query('SELECT * FROM users');

  return Response.json({ hash, users: dbResult });
}

// 3. EDGE MIDDLEWARE (always runs at edge)
// middleware.ts
export function middleware(request: Request) {
  // Automatically runs at edge
  const country = request.headers.get('x-vercel-ip-country');

  // Redirect based on location
  if (country === 'DE') {
    return Response.redirect(new URL('/de', request.url));
  }

  // A/B testing at edge
  const bucket = Math.random() > 0.5 ? 'A' : 'B';
  const response = NextResponse.next();
  response.cookies.set('bucket', bucket);

  return response;
}

// 4. MIXED RUNTIME APPROACH
// app/api/hybrid/route.ts

// Edge handler for fast initial response
export const runtime = 'edge';

export async function GET(request: Request) {
  const cache = await fetch('https://cdn.example.com/cache.json');

  if (cache.ok) {
    // Return cached response from edge
    return cache;
  }

  // If cache miss, redirect to Node.js handler
  return Response.redirect(new URL('/api/node-handler', request.url));
}

// 5. EDGE LIMITATIONS EXAMPLE
// ❌ BAD: Using Node.js APIs at edge
export const runtime = 'edge';

export async function GET() {
  // ERROR: fs is not available at edge
  const fs = require('fs');
  const data = fs.readFileSync('./data.json');
  return Response.json(data);
}

// ✅ GOOD: Use fetch or environment variables
export const runtime = 'edge';

export async function GET() {
  // Fetch data from external source
  const data = await fetch('https://api.example.com/data.json');

  // Or use environment variables
  const apiKey = process.env.API_KEY; // Available at edge

  return Response.json(await data.json());
}

// 6. PERFORMANCE COMPARISON
// pages/api/slow-node.ts
export default async function handler(req, res) {
  // Runs on Node.js (single region)
  const start = Date.now();

  // Database query
  const data = await db.query('SELECT * FROM products');

  const duration = Date.now() - start;
  console.log(`Node.js: ${duration}ms`); // 150-500ms typical

  res.json(data);
}

// pages/api/fast-edge.ts
export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Runs at edge (global distribution)
  const start = Date.now();

  // Fetch from cache or API
  const data = await fetch('https://api.example.com/products');

  const duration = Date.now() - start;
  console.log(`Edge: ${duration}ms`); // 10-50ms typical

  return Response.json(await data.json());
}

// 7. GEOLOCATION AT EDGE
// app/api/geo/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  // Access geolocation headers
  const geo = {
    country: request.headers.get('x-vercel-ip-country'),
    region: request.headers.get('x-vercel-ip-country-region'),
    city: request.headers.get('x-vercel-ip-city'),
    latitude: request.headers.get('x-vercel-ip-latitude'),
    longitude: request.headers.get('x-vercel-ip-longitude')
  };

  return Response.json(geo);
}

// 8. DATABASE AT EDGE (with connection pooling)
// app/api/edge-db/route.ts
export const runtime = 'edge';

import { createClient } from '@vercel/postgres';

export async function GET() {
  // Edge-compatible database client
  const client = createClient({
    connectionString: process.env.POSTGRES_URL
  });

  await client.connect();

  const result = await client.query('SELECT * FROM users LIMIT 10');

  await client.end();

  return Response.json(result.rows);
}

// 9. CACHING AT EDGE
// app/api/cached-edge/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  // Set aggressive cache headers
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  const response = new Response(JSON.stringify(await data.json()), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
    }
  });

  return response;
}

// 10. DECISION MATRIX

/*
Use Edge Runtime when:
├─ Need low latency globally
├─ Simple data transformations
├─ No Node.js-specific APIs needed
├─ Geolocation/personalization based on request headers
└─ High traffic (millions of requests)

Use Node.js Runtime when:
├─ Need full Node.js APIs (fs, crypto, child_process)
├─ Complex server-side operations
├─ Database connections (non-edge compatible)
├─ File uploads/processing
└─ Legacy code migration

Examples:
├─ Edge: A/B testing, redirects, geolocation, simple APIs
└─ Node.js: Image processing, PDF generation, complex business logic
*/
```

---

<details>
<summary><strong>🔍 Deep Dive: Edge Runtime Architecture & Global Distribution</strong></summary>

### What is Edge Runtime?

**Edge Runtime** is a lightweight JavaScript runtime optimized for running at the edge of cloud networks (close to users globally). Unlike traditional Node.js servers that run in centralized data centers, Edge Runtime distributes your code across 150+ global locations.

#### Architecture Comparison

**Node.js Runtime (Traditional):**

```
User (Tokyo) → 150ms network latency → Server (US-East) → 50ms processing → 150ms return
Total: 350ms

Scaling:
├─ Vertical: Add more CPU/RAM to server
├─ Horizontal: Add more servers in same region
└─ Multi-region: Manually deploy to different regions
```

**Edge Runtime (Distributed):**

```
User (Tokyo) → 10ms network latency → Edge (Tokyo) → 5ms processing → 10ms return
Total: 25ms (14x faster!)

Scaling:
├─ Automatic distribution to 150+ locations
├─ No manual replication needed
└─ Cold start: <50ms (vs 300ms Node.js)
```

### Edge Runtime Internals

**V8 Isolates Architecture:**

Edge Runtime uses **V8 Isolates** instead of full Node.js processes. This is the key to its performance:

```
Node.js Process (traditional):
├─ Full V8 engine instance
├─ Complete Node.js API
├─ Process overhead: ~50MB memory
├─ Cold start: 300-1000ms
└─ Concurrent limit: 100-500 processes per server

V8 Isolate (Edge Runtime):
├─ Lightweight V8 context
├─ Restricted API (Web Standards)
├─ Memory overhead: ~2-5MB
├─ Cold start: <50ms
└─ Concurrent limit: Thousands per server
```

**How V8 Isolates work:**

```typescript
// Multiple requests running in parallel in same V8 engine
V8 Engine
├─ Isolate 1 (Request from Tokyo)
│  └─ Running your edge function
├─ Isolate 2 (Request from London)
│  └─ Running your edge function
├─ Isolate 3 (Request from New York)
│  └─ Running your edge function
└─ ... (thousands more)

Each isolate:
├─ Isolated memory space
├─ Cannot access other isolates
├─ Shares same V8 engine (efficient)
└─ Minimal startup cost
```

### Edge Runtime Limitations

**API Restrictions:**

Edge Runtime only supports **Web Standard APIs** (not full Node.js):

```typescript
// ✅ ALLOWED (Web Standards)
├─ fetch() - HTTP requests
├─ Response, Request - Web APIs
├─ Headers, URL, URLSearchParams
├─ crypto (Web Crypto API, not Node.js crypto)
├─ TextEncoder, TextDecoder
├─ atob, btoa
├─ setTimeout, setInterval (limited)
├─ console.log

// ❌ NOT ALLOWED (Node.js specific)
├─ fs (file system)
├─ path
├─ os
├─ child_process
├─ net, http (Node.js modules)
├─ crypto (Node.js version)
├─ Buffer (use ArrayBuffer instead)
```

**Example: What you CAN'T do at edge:**

```typescript
// ❌ File system access
export const runtime = 'edge';

export async function GET() {
  const fs = require('fs'); // ERROR: fs not available
  const data = fs.readFileSync('./data.json');
  return Response.json(data);
}

// ❌ Node.js crypto
export const runtime = 'edge';

export async function GET() {
  const crypto = require('crypto'); // ERROR: Not the Web Crypto API
  const hash = crypto.createHash('sha256'); // Won't work
}

// ✅ Web Crypto instead
export const runtime = 'edge';

export async function GET() {
  const encoder = new TextEncoder();
  const data = encoder.encode('hello world');

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return Response.json({ hash });
}
```

### Global Distribution & Routing

**How requests are routed to edge:**

```
User request flow:

1. User (Tokyo) requests https://example.com/api/data
   ↓
2. DNS resolves to nearest edge location
   ↓
3. Edge (Tokyo) receives request
   ↓
4. Edge executes function in V8 Isolate
   ↓
5. Function returns response
   ↓
6. Response sent to user (10-20ms total)

If edge doesn't have function cached:
   ↓
1. Edge fetches function code from origin
   ↓
2. Caches function code locally
   ↓
3. Executes function
   ↓
4. Future requests use cached code
```

**Cold start comparison:**

```
Node.js (Serverless):
├─ Container startup: 200-500ms
├─ Node.js initialization: 100-300ms
├─ Code loading: 50-200ms
└─ Total cold start: 350-1000ms

Edge Runtime:
├─ V8 Isolate creation: 1-5ms
├─ Code loading (if not cached): 10-50ms
├─ Execution: 1-10ms
└─ Total cold start: 12-65ms (15x faster!)
```

### Performance Characteristics

**Latency breakdown by region:**

```
Node.js (single region US-East):
User Location    Network RTT    Processing    Total TTFB
Tokyo            150ms          50ms          200ms
London           80ms           50ms          130ms
São Paulo        120ms          50ms          170ms
Sydney           180ms          50ms          230ms

Edge Runtime (global distribution):
User Location    Network RTT    Processing    Total TTFB
Tokyo            10ms           5ms           15ms
London           8ms            5ms           13ms
São Paulo        12ms           5ms           17ms
Sydney           9ms            5ms           14ms

Improvement: 10-15x faster globally!
```

### When to Use Each Runtime

**Decision Matrix:**

```
Feature                     Node.js    Edge
─────────────────────────────────────────────
Global latency              ❌ Slow    ✅ Fast
Cold start                  ❌ Slow    ✅ Fast
Full Node.js API            ✅ Yes     ❌ No
File system access          ✅ Yes     ❌ No
Database (traditional)      ✅ Yes     ⚠️  Limited
Complex processing          ✅ Yes     ⚠️  Limited
Memory limits               ✅ High    ❌ Low (128MB)
Execution time limits       ✅ 60s+    ❌ 30s max
Cost at scale               ❌ High    ✅ Low
```

**Real-world scenarios:**

```
Use Edge Runtime:
├─ A/B testing redirects
├─ Geolocation-based routing
├─ Authentication token validation
├─ Simple API proxying
├─ Header manipulation
├─ Caching strategies
└─ Rate limiting

Use Node.js Runtime:
├─ Image processing (sharp, jimp)
├─ PDF generation
├─ File uploads
├─ Complex database queries
├─ Legacy code with Node.js dependencies
├─ Long-running operations (>30s)
└─ High memory requirements (>128MB)
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Migrating API Routes to Edge Runtime</strong></summary>

### The Problem: High Global Latency

**Company:** E-commerce platform (global users, 50 countries)

**Initial Architecture:**

```
Node.js API routes deployed to US-East only:
├─ US users: 50-100ms TTFB (good)
├─ Europe users: 150-200ms TTFB (acceptable)
├─ Asia users: 300-500ms TTFB (BAD)
├─ Australia users: 400-600ms TTFB (TERRIBLE)
└─ Bounce rate (Asia/AU): 35%
```

**Business Impact:**

```
Lost revenue (2023):
├─ Asia market: $2.1M (slow checkout flow)
├─ Australia: $850K (abandoned carts)
├─ Total: $2.95M annually
└─ Customer satisfaction (Asia): 2.8/5 stars
```

### The Solution: Migrate to Edge Runtime

**Phase 1: Identify Edge-Compatible Routes**

```typescript
// pages/api/products.ts (Node.js)
// Can be migrated to edge (no Node.js APIs used)
export default async function handler(req, res) {
  const products = await fetch('https://api.example.com/products')
    .then(r => r.json());

  res.json(products);
}

// pages/api/upload.ts (Node.js)
// CANNOT migrate to edge (uses fs and formidable)
import formidable from 'formidable';
import fs from 'fs';

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();
  const file = await form.parse(req);

  // Save to disk
  fs.writeFileSync(`./uploads/${file.name}`, file.data);

  res.json({ success: true });
}
```

**Analysis:**

```
Total API routes: 45
├─ Edge-compatible: 32 (71%)
│  └─ Simple data fetching, transformations
└─ Node.js only: 13 (29%)
   └─ File operations, image processing, PDF generation
```

**Phase 2: Migrate Compatible Routes**

```typescript
// OLD: pages/api/products.ts (Node.js)
export default async function handler(req, res) {
  const products = await fetch('https://api.example.com/products')
    .then(r => r.json());

  res.json(products);
}

// NEW: app/api/products/route.ts (Edge)
export const runtime = 'edge';

export async function GET(request: Request) {
  // Same logic, but runs at edge globally
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 } // Cache for 1 minute
  }).then(r => r.json());

  return Response.json(products, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  });
}
```

**Phase 3: Add Geolocation Routing**

```typescript
// app/api/geo-products/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  // Access user's country from edge headers
  const country = request.headers.get('x-vercel-ip-country') || 'US';

  // Fetch region-specific products
  const products = await fetch(
    `https://api.example.com/products?country=${country}`,
    { next: { revalidate: 300 } }
  ).then(r => r.json());

  return Response.json({
    country,
    products,
    message: `Showing products for ${country}`
  });
}
```

**Phase 4: Edge Middleware for A/B Testing**

```typescript
// middleware.ts (automatically runs at edge)
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  // Run A/B test at edge (no origin server hit)
  const bucket = Math.random() > 0.5 ? 'A' : 'B';

  const response = NextResponse.next();
  response.cookies.set('ab-test', bucket);

  // Redirect to variant
  if (bucket === 'B' && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/variant-b', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/', '/products/:path*']
};
```

### Results After Migration

**Performance Metrics:**

```
TTFB by region (P95):

                Before (Node.js)    After (Edge)    Improvement
US              100ms               15ms            85% faster
Europe          180ms               12ms            93% faster
Asia            450ms               18ms            96% faster
Australia       550ms               20ms            96% faster

Global average: 320ms → 16ms (95% improvement!)
```

**Business Impact:**

```
Revenue recovery (6 months post-migration):
├─ Asia market: +$1.8M (recovered 86%)
├─ Australia: +$720K (recovered 85%)
├─ Total: +$2.52M (recovered 85% of lost revenue)

Customer satisfaction:
├─ Asia: 2.8 → 4.6 stars (64% increase)
├─ Australia: 3.1 → 4.7 stars (52% increase)

Bounce rate:
├─ Asia: 35% → 8% (77% reduction)
├─ Australia: 32% → 7% (78% reduction)
```

**Infrastructure Cost:**

```
Before (Node.js multi-region):
├─ US-East: $1,200/month
├─ EU-West: $1,200/month
├─ AP-Southeast: $1,400/month
├─ Auto-scaling: $800/month
└─ Total: $4,600/month

After (Edge Runtime):
├─ Edge Functions: $800/month
├─ Bandwidth: $400/month
├─ Origin (Node.js for uploads): $600/month
└─ Total: $1,800/month

Savings: $2,800/month ($33,600/year!)
```

### Key Lessons

1. **Not everything needs Node.js** - 71% of routes were edge-compatible
2. **Global distribution matters** - Latency improved 10-15x for distant users
3. **Migration is incremental** - Start with simple routes, keep complex ones on Node.js
4. **Measure impact** - Track TTFB, conversion rates, bounce rates
5. **Geolocation is powerful** - Serve region-specific content at edge
6. **Cost scales better** - Edge cheaper at high traffic volumes

---

---

<details>
<summary><strong>⚖️ Trade-offs: Edge Runtime vs Node.js Runtime</strong></summary>

### Performance vs Capabilities

```
Edge Runtime:
├─ Pros: 10-15x faster globally, <50ms cold start, infinite scale
├─ Cons: Limited API, 128MB memory limit, 30s execution time
└─ Best for: Simple transformations, proxying, geolocation

Node.js Runtime:
├─ Pros: Full Node.js API, high memory, long execution (60s+)
├─ Cons: Slower globally, 300-1000ms cold start, expensive scale
└─ Best for: Complex operations, file processing, legacy code
```

### Cost Analysis

```
Traffic: 10M requests/month

Edge Runtime:
├─ Compute: $200
├─ Bandwidth: $100
└─ Total: $300/month

Node.js Runtime (multi-region):
├─ Servers (3 regions): $3,600
├─ Auto-scaling: $800
├─ Bandwidth: $200
└─ Total: $4,600/month

Savings: $4,300/month with edge (93% cheaper!)
```

### When Each Makes Sense

```
Edge Runtime wins:
├─ High traffic (>1M requests/month)
├─ Global user base
├─ Simple operations (fetch, transform, return)
├─ Low latency critical
└─ Cost-sensitive

Node.js Runtime wins:
├─ Complex operations (image/PDF processing)
├─ Node.js dependencies required
├─ File system access needed
├─ Legacy code migration
└─ Long-running tasks (>30s)
```

### Hybrid Approach (Best of Both)

```
Smart distribution:
├─ Edge: 90% of routes (simple APIs, redirects, auth checks)
├─ Node.js: 10% of routes (file uploads, PDF generation, complex logic)
└─ Result: Fast globally + full capabilities where needed
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Runtime Environments - Simple Mental Model</strong></summary>

### The Restaurant Analogy

**Node.js Runtime = Full Restaurant Kitchen**
```
Features:
├─ Complete appliances (oven, stove, fridge, freezer)
├─ Can cook anything (complex recipes)
├─ Chefs have all tools needed
├─ Located in one place (single region)

Trade-offs:
├─ Customers far away wait longer (high latency)
├─ Expensive to run (rent, staff, utilities)
├─ Setup time (heat oven, prep ingredients)
└─ Limited customers served (capacity constraints)
```

**Edge Runtime = Food Truck Network**
```
Features:
├─ Simple cooking setup (microwave, grill)
├─ Limited menu (simple recipes only)
├─ 150+ trucks globally (near every customer)
├─ Instant setup (always ready)

Trade-offs:
├─ Customers nearby (low latency everywhere)
├─ Cheap to run (small trucks, distributed)
├─ No setup time (always hot)
├─ Can serve millions (infinite scale)
└─ But can't cook complex dishes
```

### Interview-Ready Explanation

**When interviewer asks: "Why would you use Edge Runtime over Node.js?"**

**Your answer:**

> "Great question. Let me explain with a real example:
>
> Imagine an e-commerce API with users globally. With Node.js in US-East:
> - US users: 50ms latency (good)
> - Asia users: 400ms latency (bad)
> - Result: High bounce rate in Asia
>
> With Edge Runtime:
> - All users: 10-20ms latency (excellent)
> - Code runs in 150+ locations automatically
> - Users in Tokyo hit Tokyo edge, London users hit London edge
> - Result: Fast everywhere, higher conversion
>
> But Edge has limitations:
> - No file system (can't save uploads)
> - No full Node.js APIs (no fs, crypto, child_process)
> - Memory limited (128MB)
> - Execution time limited (30s)
>
> So I'd use a hybrid approach:
> - Edge: Simple APIs (90% of routes)
> - Node.js: Complex operations (file uploads, image processing)
> - Result: Fast globally + full capabilities where needed
>
> The decision comes down to: Do I need Node.js APIs? If not, edge is almost always better."

### Common Interview Pitfalls

**❌ Mistake 1:** "I'll use Node.js for everything because it's familiar"

**✅ Correct:** Node.js is familiar, but edge is 10-15x faster globally. Migrate what you can, keep what you must.

**❌ Mistake 2:** "Edge is always faster, so I'll use it everywhere"

**✅ Correct:** Edge is faster for simple operations. Complex operations (image processing) might be slower at edge due to memory limits.

**❌ Mistake 3:** "I can't use databases at edge"

**✅ Correct:** You CAN use edge-compatible databases (Vercel Postgres, PlanetScale, Supabase). Traditional databases need Node.js.

**❌ Mistake 4:** "Migrating to edge is all-or-nothing"

**✅ Correct:** Migrate incrementally. Start with simple routes, keep complex ones on Node.js.

---

### Common Mistakes

- ❌ Using Node.js APIs at edge (will fail)
- ❌ Not considering global latency when choosing runtime
- ❌ Trying to run long tasks at edge (30s limit)
- ❌ Ignoring memory limits at edge (128MB)
- ✅ Start with edge for simple routes
- ✅ Use Node.js for complex operations
- ✅ Monitor latency and adjust
- ✅ Use hybrid approach (best of both)

### Follow-up Questions

1. What APIs are available in Edge Runtime?
2. How does cold start differ between edge and Node.js?
3. When would you choose Node.js over edge?

### Resources
- [Edge Runtime](https://nextjs.org/docs/api-reference/edge-runtime)
- [Runtime Configuration](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)

</details>

</details>

---
