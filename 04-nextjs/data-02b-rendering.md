# Next.js App Router Rendering

> Server Components, streaming, and the new rendering paradigm in Next.js 13+.

---

## Question 1: App Router Rendering (Next.js 13+)

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

---

<details>
<summary><strong>🔍 Deep Dive: App Router Architecture & Server Components</strong></summary>

### Server Components vs Pages Router Architecture

**Fundamental Shift:** App Router changes how rendering works at a structural level.

#### Pages Router (getServerSideProps) Model

```
User Request
    ↓
┌─────────────────────────────────────┐
│ Node.js Server Process              │
│                                     │
│ 1. getServerSideProps executes      │
│    - Has access to req, res         │
│    - Fetches data synchronously     │
│    - Returns props                  │
│                                     │
│ 2. React renders component          │
│    - With server-fetched props      │
│    - Converts to HTML string        │
│                                     │
│ 3. HTML + props sent to client      │
└─────────────────────────────────────┘
    ↓
Browser
    ├─ Parse HTML
    ├─ Download JS bundle
    ├─ Hydrate (re-render component with props)
    └─ Component is interactive
```

#### App Router (Server Components) Model

```
User Request
    ↓
┌─────────────────────────────────────┐
│ Server (Node.js or Edge Runtime)    │
│                                     │
│ Server Component (async allowed)    │
│ ├─ Fetch data on server             │
│ ├─ Render to HTML + RSC payload     │
│ ├─ Stream to client                 │
│ │                                   │
│ └─ Client Component (use client)    │
│    └─ Hydrate with data             │
└─────────────────────────────────────┘
    ↓
Browser
    ├─ Receive HTML + RSC stream
    ├─ Display HTML immediately
    ├─ Download JS for Client Components only
    ├─ Hydrate Client Components
    └─ Interactive
```

**Key Difference:** App Router can send HTML + data as a stream, not just HTML + props string.

### Server Component Rendering Internals

**Server Components = RSC (React Server Components)**

When a Server Component renders:

```typescript
// app/posts/page.tsx
async function PostsPage() {
  // This code runs on SERVER (Node.js)
  const posts = await db.posts.findMany(); // Database query OK

  // This JSX is converted to RSC payload, not HTML strings
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// RSC Payload sent to client (NOT traditional HTML):
// ├─ Component tree metadata
// ├─ Props (serialized)
// ├─ Which components are Client Components
// └─ Boundaries for Suspense fallbacks
```

**Rendering Process:**

1. **Server-side render (streaming):**
   - Execute async functions (fetch data)
   - Convert JSX to RSC format
   - Stream chunks to client as ready
   - Fallback: Suspense boundaries show loading state

2. **Client-side hydration:**
   - Receive RSC chunks
   - Render to DOM
   - Download JS for Client Components
   - Hydrate interactive elements

**Performance benefit:**
```
Traditional SSR:
Wait for all data → Render HTML → Send → Parse → Hydrate
├─ Blocking: User waits for all data
└─ TTI: After all JS loads

App Router Streaming:
Start sending HTML early → Data loads → Stream updates → Hydrate incrementally
├─ Non-blocking: User sees content faster
└─ TTI: Much earlier (JS hydrates incrementally)
```

### Static vs Dynamic Rendering Decision

**Next.js automatically decides:**

```typescript
// STATIC (generated at build time)
async function StaticPage() {
  const posts = await fetch('https://api.example.com/posts', {
    cache: 'force-cache' // or no cache tag = default
  });

  return <div>{posts.length} posts</div>;
}
// Decision: Static if fetch is cacheable + no dynamic functions used

// DYNAMIC (rendered per request)
async function DynamicPage() {
  // Using cookies() = dynamic function
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  const user = await fetch(`https://api.example.com/user/${token.value}`, {
    cache: 'no-store'
  });

  return <div>Welcome {user.name}</div>;
}
// Decision: Dynamic because cookies() used + no-store cache
```

**Dynamic functions trigger dynamic rendering:**
- `cookies()`
- `headers()`
- `searchParams` in page props
- `getRequestIdleCallback()`

### Route Segment Config & Caching

**How caching works in App Router:**

```typescript
// app/product/[id]/page.tsx
export const dynamic = 'auto'; // default - let Next.js decide

// Force static rendering
export const dynamic = 'force-static';
// OR
export const dynamicParams = false; // Only pregenerated params

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// ISR-style revalidation
export const revalidate = 3600; // Revalidate every hour

// Fetch caching
export const fetchCache = 'auto'; // default

async function ProductPage({ params }) {
  // Fetch caching based on export const above
  const product = await fetch(
    `https://api.example.com/products/${params.id}`,
    {
      next: { revalidate: 300 } // Can override per-fetch
    }
  );

  return <ProductCard product={product} />;
}
```

**Caching precedence:**
1. Fetch-level `next: { revalidate: X }`
2. Route-level `revalidate`
3. Global `revalidate` in layout
4. Fetch-level `cache: 'no-store'`
5. Default: `cache: 'force-cache'`

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Migration from Pages to App Router</strong></summary>

### The Problem: Migration Complexity at Scale

**Company:** Legacy Next.js app (1000+ pages, Pages Router)

**Initial State:**
- `pages/` directory with getServerSideProps everywhere
- Slow builds (15 minutes for full static generation)
- No streaming, no Suspense
- TTI: 3-5 seconds

**Migration Challenge:**

```
Old approach:
├─ Every page uses getServerSideProps
├─ Fetch all data before rendering
├─ Large HTML files sent to browser
└─ Long TTI (wait for hydration)

New approach:
├─ Server Components by default (no 'use client')
├─ Stream data as it loads
├─ Separate Client Components for interactivity
└─ Faster TTI (stream HTML, hydrate incrementally)
```

### Migration Strategy (Phase by Phase)

**Phase 1: Move Layout & Common Components**

```typescript
// OLD: app/_app.tsx (global wrapper)
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

// NEW: app/layout.tsx (Server Component)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}

// Header: Server Component (no interactivity)
async function Header() {
  const nav = await fetchNavigation();

  return (
    <header>
      {nav.items.map(item => (
        <a key={item.id} href={item.href}>
          {item.label}
        </a>
      ))}
    </header>
  );
}

// Theme Toggle: Client Component (interactivity)
'use client';
function ThemeToggle() {
  const [dark, setDark] = useState(false);

  return (
    <button onClick={() => setDark(!dark)}>
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}
```

**Phase 2: Convert Page Data Fetching**

```typescript
// OLD: pages/blog/[slug].js
export async function getStaticPaths() {
  const posts = await getPosts();
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);
  return { props: { post }, revalidate: 3600 };
}

function BlogPage({ post }) {
  return <article>{post.content}</article>;
}

// NEW: app/blog/[slug]/page.tsx
export const revalidate = 3600; // ISR equivalent

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(p => ({ slug: p.slug }));
}

async function BlogPage({ params }) {
  const post = await getPost(params.slug);
  return <article>{post.content}</article>;
}
```

**Phase 3: Add Streaming with Suspense**

```typescript
// OLD: All data fetched at once
export async function getServerSideProps({ params }) {
  const post = await getPost(params.id); // Wait
  const comments = await getComments(params.id); // Then wait
  const similar = await getSimilarPosts(params.id); // Then wait

  return { props: { post, comments, similar } };
}

// NEW: Stream data as it loads
async function PostPage({ params }) {
  return (
    <div>
      {/* Immediate render */}
      <Suspense fallback={<PostSkeleton />}>
        <PostContent params={params} />
      </Suspense>

      {/* Stream separately */}
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsSection params={params} />
      </Suspense>

      {/* Stream independently */}
      <Suspense fallback={<SimilarSkeleton />}>
        <SimilarPosts params={params} />
      </Suspense>
    </div>
  );
}

// Each Suspense boundary can fetch independently
async function PostContent({ params }) {
  const post = await getPost(params.id);
  return <article>{post.content}</article>;
}

async function CommentsSection({ params }) {
  const comments = await getComments(params.id);
  return <div>{comments.length} comments</div>;
}

async function SimilarPosts({ params }) {
  const similar = await getSimilarPosts(params.id);
  return <div>{similar.length} similar posts</div>;
}
```

**Results:**

```
Before (Pages Router):
├─ TTFB: 850ms (wait for all data)
├─ FCP: 950ms (wait for HTML)
├─ TTI: 2200ms (hydrate entire page)
└─ User waits 2.2s before interaction

After (App Router + Streaming):
├─ TTFB: 150ms (stream starts immediately)
├─ FCP: 250ms (post HTML received)
├─ TTI: 450ms (post hydrated, other Suspense still loading)
├─ TTI (full page): 1200ms (all Suspense resolved)
└─ User can interact at 450ms (75% faster!)
```

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Server Components vs Client Components</strong></summary>

### Performance Impact

```
Server Components:
├─ Less JavaScript sent to client (good)
├─ Can't use useState, hooks (bad for interactivity)
├─ Database queries safe (secure)
└─ No re-fetching on client-side navigation (good)

Client Components:
├─ More JavaScript sent (bad for bundle size)
├─ Can use hooks, interactivity (good for UI)
├─ API keys exposed (bad for security)
└─ Refetch on component remount (bad for performance)
```

### Decision Matrix: When to Use What

```
Use Server Components when:
├─ Fetching data (directly from DB)
├─ Keeping secrets (API keys, credentials)
├─ Large dependencies (markdown, ORM)
└─ Need SEO meta tags

Use Client Components when:
├─ Using hooks (useState, useEffect)
├─ Need interactivity (click handlers)
├─ Using browser APIs (localStorage, geolocation)
└─ Need real-time updates (WebSocket)
```

### Streaming Benefits

```
Traditional: Wait for all data → Render → Send → Display
├─ User sees nothing for 500ms
└─ Skeleton screen frustrating

Streaming: Send HTML → Data loads → Update → Display
├─ User sees content immediately
├─ Feels faster (perceived performance)
└─ 60% improvement in Time to Interactive
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: App Router Mental Model</strong></summary>

### Key Concept: Shifting Complexity from Browser to Server

**Old way (Pages Router):**
```
Heavy client-side: Download big JS bundle → Execute → Fetch data → Render
Result: Slow initial load, fast after hydration
```

**New way (App Router):**
```
Heavy server-side: Fetch data → Render to HTML → Stream → Hydrate Client Components
Result: Fast initial load, instant partial interactivity
```

### Interview Example

**"Explain the difference between Server Components and Client Components"**

```
Server Components:
- Run on server only
- Can access database directly
- Code never sent to browser
- Great for: Fetching data, keeping secrets
- Bad for: Interactivity, hooks

Client Components:
- Run on server (for initial render)
- Then also run in browser (for updates)
- Can use hooks and interactivity
- Great for: Interactive UI, real-time updates
- Bad for: Keeping secrets, large dependencies

Example:
- Form layout: Server Component (just HTML)
- Submit button: Client Component (onClick handler)
- Result: Secure + interactive!
```

---

</details>

### Common Mistakes

- ❌ Using `'use client'` everywhere (defeats Server Component benefits)
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
