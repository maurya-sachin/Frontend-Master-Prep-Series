# Next.js App Router - Advanced

> Advanced App Router patterns: parallel routes, intercepting routes, and advanced patterns

---

## Question 4: How do loading and error states work?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 6-8 minutes
**Companies:** Vercel, Netflix, Airbnb

### Question
Explain loading.js and error.js in App Router. How do they integrate with React Suspense and Error Boundaries?

### Answer

App Router provides built-in UI states with automatic Error Boundaries and Suspense integration.

1. **loading.js**
   - Automatic Suspense boundary
   - Shows while page/layout loads
   - Instant loading states
   - Streaming friendly

2. **error.js**
   - Automatic Error Boundary
   - Catches errors in page and children
   - Must be Client Component
   - Can recover from errors

3. **not-found.js**
   - 404 UI
   - Triggered by notFound() function
   - Can be nested

4. **Benefits**
   - No manual Suspense/ErrorBoundary setup
   - Better UX with loading states
   - Graceful error handling

### Code Example

```javascript
// LOADING STATE - app/dashboard/loading.js
export default function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>Loading dashboard...</p>
    </div>
  );
}

// PAGE - app/dashboard/page.js
export default async function DashboardPage() {
  // While this fetches, loading.js shows
  const data = await fetchDashboardData();

  return <div>{data.title}</div>;
}

// ERROR BOUNDARY - app/dashboard/error.js
'use client'; // Must be Client Component

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="error">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

// NOT FOUND - app/blog/[slug]/not-found.js
import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>Post Not Found</h2>
      <p>Could not find the requested post.</p>
      <Link href="/blog">Back to Blog</Link>
    </div>
  );
}

// PAGE WITH NOT FOUND - app/blog/[slug]/page.js
import { notFound } from 'next/navigation';
import { getPost } from '@/lib/api';

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound(); // Triggers not-found.js
  }

  return <article>{post.content}</article>;
}

// NESTED LOADING STATES
// app/dashboard/loading.js - Dashboard loading
export default function DashboardLoading() {
  return <div>Loading dashboard...</div>;
}

// app/dashboard/analytics/loading.js - More specific loading
export default function AnalyticsLoading() {
  return <div>Loading analytics...</div>;
}

// STREAMING WITH SUSPENSE
import { Suspense } from 'react';
import { Analytics } from '@/components/Analytics';
import { RecentSales } from '@/components/RecentSales';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* This loads immediately */}
      <div>Static content</div>

      {/* These stream in when ready */}
      <Suspense fallback={<div>Loading analytics...</div>}>
        <Analytics />
      </Suspense>

      <Suspense fallback={<div>Loading sales...</div>}>
        <RecentSales />
      </Suspense>
    </div>
  );
}

// GLOBAL ERROR - app/global-error.js
'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <h2>Application Error</h2>
        <button onClick={() => reset()}>Reset</button>
      </body>
    </html>
  );
}

// SKELETON LOADING - app/products/loading.js
export default function ProductsLoading() {
  return (
    <div className="grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton">
          <div className="skeleton-image" />
          <div className="skeleton-title" />
          <div className="skeleton-price" />
        </div>
      ))}
    </div>
  );
}

// ERROR WITH RETRY LOGIC
'use client';

import { useRouter } from 'next/navigation';

export default function Error({ error, reset }) {
  const router = useRouter();

  return (
    <div>
      <h2>Error loading data</h2>
      <div className="actions">
        <button onClick={() => reset()}>
          Retry
        </button>
        <button onClick={() => router.back()}>
          Go Back
        </button>
        <button onClick={() => router.push('/')}>
          Home
        </button>
      </div>
    </div>
  );
}
```

### File Hierarchy for Errors/Loading

```
app/
├── layout.js
├── loading.js         # Root loading (all routes)
├── error.js           # Root error boundary
├── global-error.js    # Catches errors in root layout
├── not-found.js       # Global 404
└── dashboard/
    ├── layout.js
    ├── loading.js     # Dashboard loading (overrides root)
    ├── error.js       # Dashboard errors (scoped)
    ├── page.js
    └── analytics/
        ├── loading.js # Most specific loading
        ├── error.js   # Most specific error
        └── page.js
```

### Common Mistakes

❌ **Mistake:** error.js as Server Component
```javascript
// app/error.js
export default function Error({ error }) {
  // ❌ Missing 'use client'
  return <div>{error.message}</div>;
}
```

❌ **Mistake:** Not using loading for async pages
```javascript
// Slow page with no loading state
export default async function Page() {
  const data = await slowFetch(); // User sees blank page
  return <div>{data}</div>;
}
```

✅ **Correct:** Add loading.js for better UX
```javascript
// app/error.js
'use client'; // ✅ Must be client component

export default function Error({ error, reset }) {
  return <div>{error.message}</div>;
}

// app/loading.js
export default function Loading() {
  return <div>Loading...</div>;
}
```

### Follow-up Questions

- "How do you handle errors in layouts?"
- "Can you have multiple Suspense boundaries on one page?"
- "What's the difference between error.js and global-error.js?"
- "How do you test error boundaries in App Router?"

### Resources

- [Next.js Docs: Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

---

## Question 5: What are Server Components and Client Components?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 12-15 minutes
**Companies:** Vercel, Meta, Netflix, Airbnb

### Question
Explain Server Components and Client Components. When should you use each? How do they interact? What are the constraints?

### Answer

React Server Components (RSC) render on the server and send minimal JavaScript to the client. Client Components render in the browser.

1. **Server Components (Default)**
   - Render on server
   - Can access backend directly
   - Zero JavaScript sent to client
   - Can't use hooks or browser APIs
   - Async by default

2. **Client Components**
   - Marked with 'use client'
   - Render on client
   - Can use hooks, event handlers
   - Access to browser APIs
   - Interactive

3. **When to Use Each**
   - Server: Data fetching, backend access, large dependencies
   - Client: Interactivity, hooks, browser APIs, event handlers

4. **Interaction Rules**
   - Server Components can import Client Components
   - Client Components CAN'T import Server Components directly
   - Pass Server Components as children to Client Components

### Code Example

```javascript
// SERVER COMPONENT (default) - app/page.js
import { db } from '@/lib/database';

export default async function HomePage() {
  // Direct database access - runs on server
  const posts = await db.post.findMany();

  return (
    <div>
      <h1>Posts</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}

// CLIENT COMPONENT - components/SearchBar.js
'use client'; // This directive makes it a Client Component

import { useState } from 'react';

export function SearchBar() {
  const [query, setQuery] = useState('');

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}

// MIXING SERVER AND CLIENT - app/blog/page.js
import { db } from '@/lib/database';
import { SearchBar } from '@/components/SearchBar';
import { PostList } from '@/components/PostList';

export default async function BlogPage() {
  // Server Component - fetch on server
  const posts = await db.post.findMany();

  return (
    <div>
      {/* Client Component - interactive */}
      <SearchBar />

      {/* Pass server data to client */}
      <PostList posts={posts} />
    </div>
  );
}

// CLIENT COMPONENT WITH SERVER CHILDREN
'use client';

export function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="tabs">
        <button onClick={() => setActiveTab(0)}>Tab 1</button>
        <button onClick={() => setActiveTab(1)}>Tab 2</button>
      </div>
      {/* children can be Server Components! */}
      {children}
    </div>
  );
}

// USAGE - app/dashboard/page.js
import { Tabs } from '@/components/Tabs';
import { fetchData } from '@/lib/api';

export default async function DashboardPage() {
  const data = await fetchData(); // Server Component

  return (
    <Tabs>
      {/* This runs on server even though wrapped by client component */}
      <div>{data.title}</div>
    </Tabs>
  );
}

// WRONG: Can't import Server Component in Client Component
'use client';

import { ServerComponent } from './ServerComponent'; // ❌ Error!

export function ClientComponent() {
  return <ServerComponent />; // Won't work
}

// RIGHT: Pass as children
'use client';

export function ClientWrapper({ children }) {
  return <div className="wrapper">{children}</div>;
}

// Usage in Server Component:
export default function Page() {
  return (
    <ClientWrapper>
      <ServerComponent /> {/* ✅ Works! */}
    </ClientWrapper>
  );
}

// SERVER COMPONENT BENEFITS
import fs from 'fs'; // Can import Node.js modules
import { sql } from '@/lib/db';

export default async function DataPage() {
  // Direct file system access
  const file = fs.readFileSync('./data.txt', 'utf-8');

  // Direct database query
  const users = await sql`SELECT * FROM users`;

  // Environment variables (server-only)
  const apiKey = process.env.SECRET_API_KEY;

  return <div>{file}</div>;
}

// CLIENT COMPONENT FOR INTERACTIVITY
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function InteractiveForm() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Browser APIs
    localStorage.setItem('count', count);
  }, [count]);

  return (
    <form>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      <button onClick={() => router.push('/success')}>
        Submit
      </button>
    </form>
  );
}

// ASYNC CLIENT COMPONENT (for data fetching)
'use client';

import { useEffect, useState } from 'react';

export function ClientDataFetcher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Client-side fetch
    fetch('/api/data')
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;
  return <div>{data.title}</div>;
}

// BETTER: Fetch in Server Component
export default async function ServerDataFetcher() {
  // Runs on server - more efficient
  const data = await fetch('http://localhost:3000/api/data')
    .then(r => r.json());

  return <div>{data.title}</div>;
}
```

### Decision Tree: Server vs Client Component

```
Need interactivity (onClick, onChange, hooks)?
├─ YES → Client Component ('use client')
└─ NO → Continue

Need browser APIs (localStorage, window, document)?
├─ YES → Client Component
└─ NO → Continue

Need to fetch data or access backend?
├─ YES → Server Component (default)
└─ NO → Continue

Static UI with no state?
└─ Server Component (default)
```

### Common Mistakes

❌ **Mistake:** Using 'use client' everywhere
```javascript
'use client'; // ❌ Don't add this by default

export default function StaticPage() {
  // This doesn't need client
  return <h1>Hello</h1>;
}
```

❌ **Mistake:** Trying to use hooks in Server Component
```javascript
// Server Component (no 'use client')
export default function Page() {
  const [count, setCount] = useState(0); // ❌ Error!
  return <div>{count}</div>;
}
```

❌ **Mistake:** Importing Server Component in Client Component
```javascript
'use client';
import { ServerComponent } from './ServerComponent'; // ❌ Error

export function Client() {
  return <ServerComponent />;
}
```

✅ **Correct:** Use composition pattern
```javascript
// Client Component
'use client';
export function Client({ children }) {
  return <div>{children}</div>;
}

// Server Component
export default function Page() {
  return (
    <Client>
      <ServerComponent /> {/* ✅ Works */}
    </Client>
  );
}
```

### Server vs Client Component Comparison

| Feature | Server Component | Client Component |
|---------|-----------------|------------------|
| Default in App Router | ✅ Yes | ❌ No (needs 'use client') |
| Can be async | ✅ Yes | ❌ No |
| Can use hooks | ❌ No | ✅ Yes |
| Can access backend directly | ✅ Yes | ❌ No |
| JavaScript to client | ❌ None | ✅ Full component |
| Can have event handlers | ❌ No | ✅ Yes |
| Can use browser APIs | ❌ No | ✅ Yes |
| SEO friendly | ✅ Yes | ⚠️ Depends |

### Follow-up Questions

- "How do you pass data from Server to Client Components?"
- "What's the performance impact of Client Components?"
- "Can you use Context API with Server Components?"
- "How do you handle authentication in Server Components?"
- "What happens when you import a Client Component in a Server Component?"

### Resources

- [Next.js Docs: Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [React Docs: Server Components](https://react.dev/reference/rsc/server-components)

---

[← Back to Next.js README](./README.md)

**Progress:** 5 of 6 Next.js questions

_More questions (API Routes, Middleware, Deployment) will be added..._
