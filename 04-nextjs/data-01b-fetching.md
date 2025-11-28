## Question 1: App Router Data Fetching (Next.js 13+)

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Vercel, Modern Next.js teams

### Question
How does data fetching work in Next.js App Router? What are Server Components and Server Actions?

### Answer

**App Router** - New paradigm where components are Server Components by default.

**Key Points:**
1. **Server Components** - Fetch data directly in component (async/await)
2. **No getServerSideProps** - Not needed, fetch in component
3. **Streaming** - Send UI progressively with Suspense
4. **Server Actions** - Call server functions from client
5. **Caching** - Automatic request deduplication

### Code Example

```typescript
// 1. SERVER COMPONENT - Fetch directly in component
// app/posts/page.tsx
async function PostsPage() {
  // This runs on the server!
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return (
    <div>
      <h1>Posts</h1>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// 2. PARALLEL DATA FETCHING
async function Dashboard() {
  // Fetch in parallel
  const [user, stats, activity] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/stats').then(r => r.json()),
    fetch('/api/activity').then(r => r.json())
  ]);

  return (
    <div>
      <UserProfile user={user} />
      <Stats data={stats} />
      <ActivityFeed items={activity} />
    </div>
  );
}

// 3. STREAMING WITH SUSPENSE
import { Suspense } from 'react';

function PostPage() {
  return (
    <div>
      {/* Show header immediately */}
      <Header />

      {/* Stream post content */}
      <Suspense fallback={<PostSkeleton />}>
        <PostContent />
      </Suspense>

      {/* Stream comments separately */}
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments />
      </Suspense>
    </div>
  );
}

async function PostContent() {
  // Slow fetch - but doesn't block header
  const post = await fetchPost();
  return <article>{post.content}</article>;
}

async function Comments() {
  // Even slower fetch - streams separately
  const comments = await fetchComments();
  return <CommentList comments={comments} />;
}

// 4. CACHING STRATEGIES
// Next.js automatically caches fetch requests

// Force cache (default for static pages)
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache'
});

// No caching (like getServerSideProps)
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
});

// Revalidate periodically (like ISR)
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 } // Revalidate every 60s
});

// 5. SERVER ACTIONS - Call server functions from client
// app/actions.ts
'use server';

export async function createPost(formData: FormData) {
  'use server'; // Mark as server action

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // This code runs on the server
  const post = await db.post.create({
    data: { title, content }
  });

  revalidatePath('/posts'); // Revalidate posts page
  return post;
}

// app/new-post/page.tsx
'use client';

import { createPost } from './actions';

function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">Create</button>
    </form>
  );
}

// 6. ON-DEMAND REVALIDATION
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const { path, tag } = await request.json();

  if (path) {
    revalidatePath(path); // Revalidate specific path
  }

  if (tag) {
    revalidateTag(tag); // Revalidate by tag
  }

  return Response.json({ revalidated: true });
}

// Tag fetch requests for revalidation
const data = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
});

// 7. CLIENT COMPONENT DATA FETCHING
'use client';

import { useEffect, useState } from 'react';

function ClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return <div>{data.value}</div>;
}

// Better: Use SWR or React Query
import useSWR from 'swr';

function ClientComponent() {
  const { data, error, isLoading } = useSWR('/api/data', fetcher);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>{data.value}</div>;
}

// 8. MIXING SERVER AND CLIENT COMPONENTS
// Server Component (default)
async function ParentServer() {
  const data = await fetchData(); // Server-side fetch

  return (
    <div>
      <ServerChild data={data} />
      <ClientChild initialData={data} />
    </div>
  );
}

// Client Component
'use client';

function ClientChild({ initialData }) {
  const [data, setData] = useState(initialData);

  // Can fetch more data client-side
  const updateData = async () => {
    const newData = await fetch('/api/data').then(r => r.json());
    setData(newData);
  };

  return <button onClick={updateData}>Refresh: {data}</button>;
}
```

### Common Mistakes

- ❌ Using `'use client'` unnecessarily (makes everything client-side)
- ❌ Not using Suspense for streaming (misses performance benefit)
- ❌ Fetching data client-side when it could be server-side
- ❌ Not using proper caching strategies
- ✅ Keep components as Server Components by default
- ✅ Use Suspense for progressive rendering
- ✅ Use Server Actions for mutations

### Follow-up Questions

1. What's the difference between Server Components and Server Actions?
2. How does Next.js deduplicate fetch requests?
3. When would you use `revalidatePath` vs `revalidateTag`?

### Resources
- [Next.js App Router](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

<details>
<summary><strong>🔍 Deep Dive: Server Components and the New Data Fetching Model</strong></summary>

### The Mental Model: Server Components vs Client Components

The App Router introduced a paradigm shift: **all components are Server Components by default**. This is opposite to the Pages Router where everything was client-side by default.

**What this means:**

```typescript
// App Router: Components run on server by default
async function UserProfile({ userId }) {
  // This code runs on the SERVER, not in browser
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  return <div>{user.name}</div>;
}

// Result:
// - User data fetched on server (safe from XSS)
// - HTML sent to browser with user data
// - No API endpoint needed!
// - Zero JavaScript for data fetching

// Old Pages Router equivalent would need:
// 1. getServerSideProps({ params }) to fetch data
// 2. API route if doing client-side fetch
// 3. useEffect + useState for loading state
// This is now just one simple async component!
```

**Performance Implications:**

```typescript
// Server Component rendering timeline
async function Page() {
  const data = await fetch('/api/data'); // Server-side fetch (fast!)

  return <div>{data.value}</div>;
}

// Timeline:
// 0ms:    Request arrives at server
// 50ms:   fetch() completes (server is on same network!)
// 10ms:   React renders component
// 20ms:   HTML sent to browser
// Total TTFB: 80ms

// vs Client Component approach
'use client';

function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);

  return <div>{data?.value || 'Loading...'}</div>;
}

// Timeline:
// 0ms:    Request arrives at server
// 100ms:  Static HTML sent (no data)
// 200ms:  JavaScript loads in browser
// 250ms:  useEffect runs, fetch() starts
// 350ms:  API response arrives
// 360ms:  Component re-renders with data
// Total TTFB: 100ms (first render shows loading state)
// Total content visible: 360ms
// User sees loading spinner for 260ms!
```

### Request Deduplication: The Secret Sauce

Next.js 13+ implements automatic request deduplication at the render level. Multiple components fetching the same resource result in **only one network request**.

```typescript
// app/page.tsx
async function UserCard({ userId }) {
  const user = await fetch(`/api/users/${userId}`, {
    next: { revalidate: 60 }
  }).then(r => r.json());

  return <div>{user.name}</div>;
}

async function UserBio({ userId }) {
  const user = await fetch(`/api/users/${userId}`, {
    next: { revalidate: 60 }
  }).then(r => r.json());

  return <p>{user.bio}</p>;
}

async function Page() {
  const userId = '123';

  return (
    <div>
      <UserCard userId={userId} />  {/* fetch() call #1 */}
      <UserBio userId={userId} />   {/* fetch() call #2 - DEDUPLICATED! */}
    </div>
  );
}

// Network activity:
// ✅ Only 1 request to /api/users/123
// ✅ Both components get the same response
// ✅ Automatic, no extra code needed

// How it works internally (simplified):
class RequestDeduplicator {
  private requestCache = new Map<string, Promise<any>>();

  async fetch(url: string, init?: RequestInit) {
    const key = JSON.stringify({ url, init });

    if (this.requestCache.has(key)) {
      // Return pending promise from first request
      // All subsequent calls wait for same response
      return this.requestCache.get(key);
    }

    // First request: execute fetch
    const promise = originalFetch(url, init);
    this.requestCache.set(key, promise);

    return promise;
  }
}

// This deduplication ONLY works within a single render
// Different requests or server-side regenerations are separate
```

**Real-world impact:**

```typescript
// Example: Product page with multiple data needs
async function ProductPage({ params }) {
  // These all fetch the same endpoint
  const product1 = await fetch(`/api/products/${params.id}`, {
    next: { tags: ['product'] }
  });

  const product2 = await fetch(`/api/products/${params.id}`);

  const product3 = await fetch(`/api/products/${params.id}`, {
    cache: 'no-store'
  });

  // Reality check: ONLY fetch #1 executes!
  // #2 and #3 use cached result from #1
  // This is powerful but can cause subtle bugs...
}

// Gotcha: Different cache options don't prevent deduplication
// The cache option from the FIRST request wins
// This can lead to unexpected stale data!

// Solution: If you need fresh data, fetch in different render
async function ProductPage({ params }) {
  return (
    <div>
      <ProductHeader productId={params.id} />
      <ProductDetails productId={params.id} />
      <ProductReviews productId={params.id} /> {/* Fresh fetch */}
    </div>
  );
}

// ProductReviews is a separate component
// Its fetch() happens in different render context
// Can have different cache settings
```

### Streaming and Progressive Rendering

Next.js App Router supports streaming HTML with `Suspense`:

```typescript
import { Suspense } from 'react';

async function SlowComponent() {
  // This takes 3 seconds
  const data = await fetch('/api/slow-endpoint', {
    next: { revalidate: 60 }
  }).then(r => r.json());

  return <div>{data.value}</div>;
}

async function FastComponent() {
  // This takes 100ms
  const data = await fetch('/api/fast-endpoint').then(r => r.json());

  return <div>{data.value}</div>;
}

export default function Page() {
  return (
    <div>
      {/* This renders immediately */}
      <FastComponent />

      {/* This waits 3 seconds, blocking render */}
      <SlowComponent />
    </div>
  );
}

// Timeline (without Suspense):
// 0s:   Render starts
// 1s:   FastComponent fetches (100ms)
// 3s:   SlowComponent fetches (3000ms)
// 3s:   HTML sent to browser
// User sees nothing for 3 seconds (bad UX!)

// With Suspense (streaming):
export default function Page() {
  return (
    <div>
      <FastComponent />

      <Suspense fallback={<div>Loading slow data...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}

// Timeline (with Suspense):
// 0s:   Render starts
// 100ms: FastComponent completes
// 100ms: HTML sent to browser (with fallback placeholder)
// 100ms: Browser renders fast component + loading state
// 3s:   SlowComponent completes
// 3s:   Browser receives streaming update, renders component
// User sees fast content immediately, slow content appears later

// Real streaming example:
// Initial HTML chunk (100ms):
// <div>
//   <div>Fast data loaded!</div>
//   <div>Loading slow data...</div>
// </div>

// Final streaming chunk (after 3s):
// <script>
// // Replace placeholder with actual content
// document.querySelector('[data-fallback]').replaceWith(...);
// </script>
```

### Server Actions: Direct Database Mutations

Server Actions allow client components to call server-only functions directly:

```typescript
// app/actions.ts
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// This function ONLY runs on server
export async function createTodo(text: string) {
  // Database access (safe, no API key exposure)
  const todo = await db.todo.create({
    data: { text, completed: false }
  });

  // Revalidate ISR cache
  revalidatePath('/todos');

  return todo;
}

// app/todos/page.tsx
'use client';

import { createTodo } from './actions';

function TodoForm() {
  const [text, setText] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Call server action directly from client
    const newTodo = await createTodo(text);

    // Result comes back immediately
    setText('');
    console.log('Created:', newTodo);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Add a todo"
      />
      <button type="submit">Add</button>
    </form>
  );
}

// Network flow:
// 1. User clicks button
// 2. Client serializes args and sends to server
// 3. Server executes createTodo() with full database access
// 4. Server returns serialized result
// 5. Client receives result and updates UI

// Key benefits:
// ✅ No API routes needed
// ✅ Zero API surface (server code never exposed)
// ✅ Database access without credentials in browser
// ✅ Can use revalidatePath/revalidateTag directly
// ✅ Type-safe (TypeScript works end-to-end)

// Real-world comparison:

// Pages Router way:
// 1. Create API route: /api/todos.ts
// 2. Create form component
// 3. useEffect to fetch
// 4. Handle loading/error states
// 5. Manually revalidate cache
// ~150 lines of code

// App Router way:
// 1. Create Server Action
// 2. Call directly from form
// 3. Automatic error propagation
// 4. Automatic cache revalidation
// ~30 lines of code
```

**Server Action Limitations:**

```typescript
// ❌ Cannot pass functions
export async function processTodo(text: string, callback: () => void) {
  // ❌ callback cannot be serialized!
  await db.todo.create({ data: { text } });
  callback(); // Error!
}

// ❌ Cannot use browser APIs
export async function getCurrentLocation() {
  // ❌ navigator is browser API, not available on server
  const geo = navigator.geolocation;
}

// ✅ Can use server-only code
export async function createSecureTodo(text: string) {
  // ✅ Database access
  const todo = await db.todo.create({ data: { text } });

  // ✅ Environment variables
  console.log(process.env.DATABASE_URL);

  // ✅ File system
  const fs = require('fs');
  fs.writeFileSync('/data/log.txt', 'action executed');

  return todo;
}
```

### Caching Strategies in App Router

```typescript
// 1. Force cache (default for static pages)
const data = await fetch('/api/posts', {
  cache: 'force-cache'
});
// Behavior:
// - Built at build time
// - Cached indefinitely
// - No revalidation
// - Cost: CDN only (~$0.01 per 1M)

// 2. No store (like getServerSideProps)
const data = await fetch('/api/user', {
  cache: 'no-store'
});
// Behavior:
// - Fetched on every request
// - Never cached
// - Always fresh
// - Cost: Full serverless execution ($10-20 per 1M)

// 3. ISR with time-based revalidation
const data = await fetch('/api/products', {
  next: { revalidate: 3600 }
});
// Behavior:
// - Cache for 1 hour
// - Revalidate in background after 1 hour
// - First request after 1h pays revalidation cost
// - Cost: Hybrid (~$0.25 per 1M)

// 4. Tag-based revalidation (new in App Router)
const posts = await fetch('/api/blog/posts', {
  next: { tags: ['blog', 'posts'] }
});

// Later, in server action or API route:
export async function publishNewPost() {
  await createPost(...);
  revalidateTag('blog'); // Revalidate all blog posts
}

// Real-world example: Blog with comments
async function BlogPost({ slug }) {
  const post = await fetch(`/api/blog/${slug}`, {
    next: { tags: [`blog-${slug}`, 'blogs'] }
  }).then(r => r.json());

  return <article>{post.content}</article>;
}

// When comment is posted:
export async function addComment(slug: string, text: string) {
  const comment = await db.comment.create({
    data: { slug, text }
  });

  // Revalidate just this blog post
  revalidateTag(`blog-${slug}`);

  return comment;
}

// Result:
// - Blog list page: Revalidated when new post published
// - Individual post: Revalidated when comment added
// - Other posts: Not revalidated (efficient!)
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Migrating from Pages Router to App Router</strong></summary>

### The Challenge

**Company:** BlogCo, running Next.js 11 with Pages Router
**Content:** 50,000 blog posts
**Traffic:** 1M monthly users
**Problem:** Slow to add new features, Pages Router getting abandoned

**Migration Goals:**
1. Move to App Router for simpler code
2. Reduce API route boilerplate
3. Implement Server Actions for forms
4. Improve performance with streaming

### Before: Pages Router Data Flow

```typescript
// pages/blog/[slug].tsx (original)
export async function getStaticProps({ params }) {
  const post = await db.post.findUnique({
    where: { slug: params.slug }
  });

  return {
    props: { post },
    revalidate: 3600
  };
}

// pages/api/comments/[slug].ts (API route for mutations)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body;
    const { slug } = req.query;

    // Check auth manually
    const token = req.cookies.sessionId;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserFromToken(token);

    const comment = await db.comment.create({
      data: {
        text,
        slug,
        userId: user.id
      }
    });

    // Manual cache invalidation
    res.revalidateTag(`blog-${slug}`);

    return res.json(comment);
  }
}

// components/CommentForm.tsx
'use client';

function CommentForm({ slug }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/comments/${slug}`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const comment = await response.json();
      setText('');
      // Have to manually refresh comments...
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={text} onChange={e => setText(e.target.value)} />
      <button disabled={loading}>{loading ? 'Loading...' : 'Post'}</button>
    </form>
  );
}

// Summary: ~200 lines of code spread across 3 files
```

### After: App Router Data Flow

```typescript
// app/blog/[slug]/page.tsx (simplified)
import { Suspense } from 'react';

export const revalidate = 3600;

async function BlogPost({ params }) {
  const post = await db.post.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      content: true,
      author: true,
      createdAt: true
    }
  });

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>

      {/* Comments with streaming */}
      <Suspense fallback={<div>Loading comments...</div>}>
        <CommentSection slug={params.slug} />
      </Suspense>
    </article>
  );
}

// app/blog/[slug]/actions.ts (Server Actions)
'use server';

import { revalidateTag } from 'next/cache';
import { auth } from '@/lib/auth';

export async function addComment(slug: string, text: string) {
  // Authentication built-in with middleware
  const user = await auth();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const comment = await db.comment.create({
    data: {
      text,
      slug,
      userId: user.id
    }
  });

  // Automatic cache revalidation
  revalidateTag(`blog-${slug}`);

  return comment;
}

// app/blog/[slug]/comment-form.tsx
'use client';

import { addComment } from './actions';

function CommentForm({ slug }) {
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e) {
    e.preventDefault();

    startTransition(async () => {
      await addComment(slug, text);
      setText('');
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={text} onChange={e => setText(e.target.value)} />
      <button disabled={isPending}>
        {isPending ? 'Loading...' : 'Post'}
      </button>
    </form>
  );
}

// Summary: ~100 lines of code (50% reduction!)
```

### Performance Improvements

**Before (Pages Router):**
```
TTFB: 280ms (SSR every request)
FCP:  600ms
LCP:  1200ms

Costs:
- Static pages: $0.15/1M
- API routes: $5/1M
- Total: $5.15/1M
```

**After (App Router):**
```
TTFB: 45ms (cached from CDN)
FCP:  320ms (streaming helps)
LCP:  680ms

Costs:
- Cached pages: $0.12/1M
- Server Actions: $0.50/1M (minimal execution)
- Total: $0.62/1M (92% cheaper!)
```

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Server Components vs Client Components</strong></summary>

### Decision Matrix

```
Metric                Server Component    Client Component
────────────────────────────────────────────────────────────
TTFB                  50-200ms           200-500ms
Bundle size           Small (no JS)      Large (with JS)
Database access       ✅ Direct          ❌ Via API
Environment vars      ✅ Access          ❌ No access
State management      ❌ Not available   ✅ useState/useReducer
Interactivity        ❌ No listeners     ✅ onClick, onChange
```

### When to Use Server Components

```typescript
// ✅ Perfect: Fetching data
async function UserList() {
  const users = await db.user.findMany();
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// ✅ Perfect: Protecting API keys
async function ApiKey() {
  const apiKey = process.env.DATABASE_URL;
  return <div>{apiKey}</div>; // Safe! Never exposed to client
}

// ✅ Perfect: Large dependencies
async function MarkdownBlogPost({ content }) {
  const marked = require('marked'); // 50KB library
  const html = marked(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// ❌ Bad: Handling clicks
// This won't work in Server Component!
async function Button() {
  const handleClick = () => alert('Clicked!'); // Error: onClick not available

  return <button onClick={handleClick}>Click me</button>;
}

// Fix: Use client component for interactivity
'use client';

function Button() {
  const handleClick = () => alert('Clicked!');
  return <button onClick={handleClick}>Click me</button>;
}
```

### When to Use Client Components

```typescript
// ✅ Perfect: Interactive forms
'use client';

function SearchBox() {
  const [query, setQuery] = useState('');

  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}

// ✅ Perfect: Real-time updates
'use client';

function LiveStats() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Poll for updates
      fetch('/api/stats').then(r => r.json()).then(d => setCount(d.count));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>Count: {count}</div>;
}

// ❌ Bad: Client-only fetching for SEO content
// This will fail because content isn't in initial HTML
'use client';

function BlogPost() {
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`/api/blog/${slug}`).then(r => r.json()).then(setPost);
  }, []);

  return <article>{post?.content}</article>;
}

// Fix: Server-render for SEO
async function BlogPost({ slug }) {
  const post = await db.post.findUnique({ where: { slug } });
  return <article>{post.content}</article>;
}
```

### The Hybrid Pattern (Recommended)

```typescript
// app/blog/[slug]/page.tsx (Server Component)
async function BlogPage({ params }) {
  // Fetch critical data on server
  const post = await db.post.findUnique({
    where: { slug: params.slug },
    select: { id: true, title: true, content: true, image: true }
  });

  return (
    <article>
      <h1>{post.title}</h1>
      <img src={post.image} alt={post.title} />
      {/* Server-rendered for SEO */}
      <div>{post.content}</div>

      {/* Non-critical: Client component for interactivity */}
      <CommentSection postId={post.id} />
    </article>
  );
}

// app/blog/[slug]/comment-section.tsx (Client Component)
'use client';

import useSWR from 'swr';

function CommentSection({ postId }) {
  // Client-side fetching for non-critical data
  const { data: comments } = useSWR(
    `/api/posts/${postId}/comments`,
    fetcher
  );

  return (
    <section>
      {comments?.map(c => <Comment key={c.id} comment={c} />)}
      <CommentForm postId={postId} />
    </section>
  );
}

// Benefits:
// - Blog content in HTML for SEO ✅
// - Comments load dynamically (users not blocked) ✅
// - Small bundle size (blog + comment JS only) ✅
// - High interactivity (form works smoothly) ✅
// - Fast TTFB (content visible before comments load) ✅
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Server Components Demystified</strong></summary>

### Think of It Like a Restaurant

**Server Component = Cook Preparing Your Meal**

- Chef gets the order (component mount)
- Chef retrieves ingredients from storage (database query)
- Chef cooks in kitchen (server-side processing)
- Food arrives on your plate (HTML with data)
- You eat immediately (no waiting for cooking)

**Client Component = Self-Service Salad Bar**

- Customer gets empty plate (HTML)
- Customer walks to fridge (browser fetches API)
- Customer builds salad (JavaScript runs)
- Takes time to prepare, but they control it (interactivity)

### Common Mistakes Juniors Make

**Mistake 1: Using 'use client' for everything**

```typescript
// ❌ Wrong: Marked as client but doesn't need it
'use client';

export default function HomePage() {
  return <h1>Welcome to our site</h1>;
}

// Problem:
// - All component as client component
// - Sends JavaScript to browser for no reason
// - Misses performance benefits of server-side rendering
```

Fix: Leave it as server component

```typescript
// ✅ Correct: Server component (default)
export default function HomePage() {
  return <h1>Welcome to our site</h1>;
}

// Benefits:
// - No JavaScript sent to browser
// - Faster page load
// - Smaller bundle
```

**Mistake 2: Fetching in useEffect when you could fetch on server**

```typescript
// ❌ Wrong: Client-side fetch for SEO content
'use client';

function BlogPost({ slug }) {
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(r => r.json())
      .then(setPost);
  }, [slug]);

  return <article>{post?.content}</article>;
}

// Problems:
// - Content not in HTML (SEO = 0)
// - Users see "Loading..." spinner (bad UX)
// - Extra network hop (fetch from client)
```

Fix: Fetch on server

```typescript
// ✅ Correct: Server-side fetch
async function BlogPost({ slug }) {
  const post = await db.post.findUnique({
    where: { slug }
  });

  return <article>{post.content}</article>;
}

// Benefits:
// - Content in HTML (SEO = 100)
// - Users see content immediately
// - Faster database queries (server is closer to DB)
```

**Mistake 3: Not using server actions for mutations**

```typescript
// ❌ Wrong: Manual API route for form submission
'use client';

function TodoForm() {
  async function handleSubmit(e) {
    e.preventDefault();

    // Manual API call
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ text: e.target.text.value })
    });

    // Manual refresh
    router.refresh();
  }

  return <form onSubmit={handleSubmit}>...</form>;
}

// Problems:
// - Boilerplate code
// - Need separate API route
// - Manual cache management
```

Fix: Use server actions

```typescript
// app/actions.ts
'use server';

export async function addTodo(text: string) {
  const todo = await db.todo.create({ data: { text } });
  revalidatePath('/');
  return todo;
}

// app/components/TodoForm.tsx
'use client';

import { addTodo } from '@/app/actions';

function TodoForm() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e) {
    e.preventDefault();
    startTransition(async () => {
      await addTodo(e.target.text.value);
      e.target.reset();
    });
  }

  return <form onSubmit={handleSubmit}>...</form>;
}

// Benefits:
// - Less boilerplate
// - Automatic error handling
// - Cache revalidation built-in
// - Type-safe end-to-end
```

### Interview Answer Template

**Q: "How do you fetch data in Next.js App Router?"**

**A:** "In App Router, the default is Server Components, so I can fetch data directly in the component using async/await:

```typescript
async function BlogPost({ params }) {
  const post = await db.post.findUnique({ where: { slug: params.slug } });
  return <article>{post.content}</article>;
}
```

This is simpler than the old Pages Router's getServerSideProps pattern.

For non-critical data or real-time updates, I use Client Components with SWR:

```typescript
'use client';
const { data } = useSWR('/api/comments', fetcher);
```

For forms, I use Server Actions, which let me call server functions directly from the client without needing an API route:

```typescript
'use server';
export async function addComment(text) {
  await db.comment.create({ data: { text } });
  revalidatePath('/');
}
```

For static or semi-static pages, I set `revalidate` on the page to use ISR."

**Why this works:**
- Explains the new model (async components)
- Shows knowledge of different data needs
- Mentions Server Actions (modern approach)
- References caching strategy



</details>

---

## Question 2: SWR and React Query for Client-Side Data Fetching

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Vercel, All Next.js companies

### Question
How do you use SWR or React Query for client-side data fetching in Next.js? What are the benefits?

### Answer

**SWR (Stale-While-Revalidate)** - Vercel's React data fetching library
**React Query** - Popular alternative with similar features

**Key Points:**
1. **Caching** - Automatic request caching
2. **Revalidation** - Auto-refetch on focus/reconnect
3. **Mutations** - Optimistic updates
4. **Pagination** - Built-in support
5. **SSR Support** - Works with Next.js SSR/SSG

### Code Example

```typescript
// 1. BASIC SWR USAGE
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function Profile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>Hello {data.name}</div>;
}

// 2. GLOBAL CONFIGURATION
// pages/_app.tsx
import { SWRConfig } from 'swr';

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url) => fetch(url).then(r => r.json()),
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: 30000 // Refetch every 30s
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
}

// 3. MUTATIONS WITH SWR
import useSWR, { mutate } from 'swr';

function TodoList() {
  const { data: todos } = useSWR('/api/todos', fetcher);

  const addTodo = async (text: string) => {
    // Optimistic update
    mutate(
      '/api/todos',
      [...todos, { id: Date.now(), text, done: false }],
      false // Don't revalidate yet
    );

    // Send to server
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ text })
    });

    // Revalidate to get server data
    mutate('/api/todos');
  };

  return (
    <div>
      {todos?.map(todo => <TodoItem key={todo.id} todo={todo} />)}
      <button onClick={() => addTodo('New task')}>Add</button>
    </div>
  );
}

// 4. PAGINATION WITH SWR
import useSWR from 'swr';

function PostList() {
  const [page, setPage] = useState(1);
  const { data, error } = useSWR(`/api/posts?page=${page}`, fetcher, {
    // Keep previous data while loading new page
    keepPreviousData: true
  });

  return (
    <div>
      {data?.posts.map(post => <PostCard key={post.id} post={post} />)}
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(p => p + 1)}>
        Next
      </button>
    </div>
  );
}

// 5. REACT QUERY BASICS
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function Profile() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => fetch('/api/user').then(r => r.json())
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Hello {data.name}</div>;
}

// 6. MUTATIONS WITH REACT QUERY
function TodoList() {
  const queryClient = useQueryClient();

  const { data: todos } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(r => r.json())
  });

  const addTodoMutation = useMutation({
    mutationFn: (text: string) =>
      fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text })
      }).then(r => r.json()),
    onMutate: async (newTodo) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData(['todos']);

      // Optimistically update
      queryClient.setQueryData(['todos'], old => [...old, newTodo]);

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      queryClient.setQueryData(['todos'], context.previousTodos);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });

  return (
    <div>
      {todos?.map(todo => <TodoItem key={todo.id} todo={todo} />)}
      <button onClick={() => addTodoMutation.mutate('New task')}>
        Add
      </button>
    </div>
  );
}

// 7. SSR WITH REACT QUERY
// pages/posts.tsx
import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query';

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  // Prefetch data on server
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  });

  return {
    props: {
      // Dehydrated state sent to client
      dehydratedState: dehydrate(queryClient)
    }
  };
}

function PostsPage() {
  // This will use prefetched data from server
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  });

  return <div>{data.map(post => <PostCard post={post} />)}</div>;
}

// 8. DEPENDENT QUERIES
function UserPosts({ userId }) {
  // Fetch user first
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  });

  // Then fetch posts (only when user exists)
  const { data: posts } = useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchUserPosts(userId),
    enabled: !!user // Only run when user is loaded
  });

  return <div>{posts?.map(post => <PostCard post={post} />)}</div>;
}
```

### Common Mistakes

- ❌ Not setting up global SWR config
- ❌ Forgetting to handle loading and error states
- ❌ Not using optimistic updates for better UX
- ❌ Over-fetching (not using proper query keys)
- ✅ Use SWR/React Query for client-side data
- ✅ Implement optimistic updates for mutations
- ✅ Prefetch data on server for better UX

### Follow-up Questions

1. What's the difference between SWR and React Query?
2. How do optimistic updates work?
3. When would you use SWR vs fetching in getServerSideProps?

### Resources
- [SWR Documentation](https://swr.vercel.app/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [SWR with Next.js](https://swr.vercel.app/docs/with-nextjs)

---

<details>
<summary><strong>🔍 Deep Dive: Client-Side Data Fetching Architecture</strong></summary>

### The Caching Problem That SWR/React Query Solve

Without a data fetching library, client-side React apps suffer from multiple fetching issues:

```typescript
// ❌ Basic approach - multiple problems
'use client';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/user')
      .then(r => r.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return <div>{loading ? 'Loading...' : user.name}</div>;
}

// Problems with this approach:
// 1. No automatic refetching on focus
// 2. No caching between components
// 3. No deduplication (5 components = 5 requests)
// 4. Manual loading/error states
// 5. No retry logic
// 6. No offline support
// 7. No optimistic updates
// This is exactly what SWR solves!
```

### How SWR Works Internally

**Stale-While-Revalidate Strategy:**

```typescript
// SWR's caching strategy (simplified implementation)
class SWRCache {
  private cache = new Map<string, {
    data: any;
    error: any;
    isStale: boolean;
    timestamp: number;
  }>();

  async fetch(key: string, fetcher: () => Promise<any>) {
    const cached = this.cache.get(key);

    // Return cached data immediately (even if stale)
    if (cached) {
      // Mark as stale after 30s
      if (Date.now() - cached.timestamp > 30000) {
        cached.isStale = true;
      }

      // Return immediately, revalidate in background
      setTimeout(() => this.revalidate(key, fetcher), 0);

      return cached.data;
    }

    // No cache: fetch new data
    try {
      const data = await fetcher();
      this.cache.set(key, {
        data,
        error: null,
        isStale: false,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      this.cache.set(key, {
        data: null,
        error,
        isStale: false,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  private async revalidate(key: string, fetcher: () => Promise<any>) {
    try {
      const data = await fetcher();
      const cached = this.cache.get(key);
      if (cached) {
        cached.data = data;
        cached.isStale = false;
        // Trigger UI update in React
      }
    } catch (error) {
      // Keep old data on error (resilience)
    }
  }
}

// Real usage:
import useSWR from 'swr';

function UserProfile() {
  const { data: user, isLoading } = useSWR(
    '/api/user',
    (url) => fetch(url).then(r => r.json())
  );

  return <div>{isLoading ? 'Loading...' : user.name}</div>;
}

// Timeline:
// 0ms:    Component mounts
// 1ms:    Check cache for /api/user
// 2ms:    Cache miss, start fetch
// 100ms:  fetch() completes
// 101ms:  Update state, component re-renders
// Total: 100ms to first data
// All subsequent mounts: return cached data instantly
```

**Request Deduplication (The Magic):**

```typescript
// Multiple components requesting same data
function Header() {
  const { data } = useSWR('/api/user', fetcher);
  return <div>{data?.name}</div>;
}

function Sidebar() {
  const { data } = useSWR('/api/user', fetcher); // Same key!
}

function ProfileCard() {
  const { data } = useSWR('/api/user', fetcher); // Same key!
}

// Network activity:
// ✅ Only 1 request to /api/user
// ✅ All 3 components get same response
// ✅ Automatic, built-in deduplication

// How SWR deduplicates:
// 1. Component 1 calls useSWR('/api/user')
// 2. SWR checks cache: MISS
// 3. SWR starts fetch, stores pending promise
// 4. Component 2 calls useSWR('/api/user')
// 5. SWR checks cache: HIT (pending promise)
// 6. Component 2 waits for same promise
// 7. Component 3 calls useSWR('/api/user')
// 8. SWR checks cache: HIT (pending promise)
// 9. fetch() completes
// 10. All 3 components update with same data

// This is at the SWR library level, not React level
// Much faster than relay/apollo which require setup
```

**Revalidation Triggers:**

```typescript
// SWR automatically revalidates on:
const { data, mutate } = useSWR('/api/user', fetcher, {
  // 1. Interval-based revalidation
  refreshInterval: 5000, // Poll every 5 seconds

  // 2. Window focus revalidation
  revalidateOnFocus: true, // Refetch when tab regains focus

  // 3. Network reconnection
  revalidateOnReconnect: true, // Refetch when internet returns

  // 4. Manual revalidation
  // mutate() // Force revalidate immediately

  // 5. Visibility change
  revalidateOnMount: true // Fetch when component mounts
});

// Real-world example: Live stock prices
const { data: price } = useSWR('/api/stock/AAPL', fetcher, {
  refreshInterval: 1000, // Update every 1 second
  revalidateOnFocus: true, // Immediately when user returns to tab
  revalidateOnReconnect: true // Update when network returns
});

// Timeline (user switches tabs and back):
// 0s:  User viewing page, price updates every 1s
// 5s:  User switches to other tab
// 5s:  SWR stops polling (background tab)
// 8s:  User switches back to our tab
// 8s:  SWR immediately refetches (revalidateOnFocus triggers)
// 9s:  Data updated, user sees fresh price
```

### React Query's Advanced Features

React Query (TanStack Query) is more powerful than SWR:

```typescript
// React Query's approach: Query keys + Background sync
import { useQuery, useQueryClient } from '@tanstack/react-query';

function UserProfile({ userId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId], // Composite key!
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
    staleTime: 60000, // Consider fresh for 1 minute
    gcTime: 300000, // Keep cache for 5 minutes (was cacheTime)
  });

  return <div>{isLoading ? 'Loading...' : data.name}</div>;
}

// Advanced feature 1: Composite keys with automatic invalidation
function TodoList() {
  const { data: todos } = useQuery({
    queryKey: ['todos', 'list'],
    queryFn: fetchTodos
  });

  const queryClient = useQueryClient();

  async function addTodo(text: string) {
    // Optimistic update
    const newTodo = { id: Date.now(), text, done: false };

    queryClient.setQueryData(['todos', 'list'], (old: any) => [
      ...old,
      newTodo
    ]);

    try {
      const created = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text })
      }).then(r => r.json());

      // Update with real data from server
      queryClient.setQueryData(['todos', 'list'], (old: any) =>
        old.map(t => t.id === newTodo.id ? created : t)
      );
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(['todos', 'list'], (old: any) =>
        old.filter(t => t.id !== newTodo.id)
      );
    }
  }
}

// Advanced feature 2: Dependent queries
function TodoDetails({ todoId }: { todoId: string }) {
  // Fetch todo first
  const { data: todo } = useQuery({
    queryKey: ['todos', todoId],
    queryFn: () => fetch(`/api/todos/${todoId}`).then(r => r.json())
  });

  // Only fetch comments after todo is loaded
  const { data: comments } = useQuery({
    queryKey: ['todos', todoId, 'comments'],
    queryFn: () => fetch(`/api/todos/${todoId}/comments`).then(r => r.json()),
    enabled: !!todo // Only run when todo exists
  });

  if (!todo) return <div>Loading todo...</div>;

  return (
    <div>
      <h1>{todo.title}</h1>
      {comments?.map(c => <Comment key={c.id} comment={c} />)}
    </div>
  );
}

// Advanced feature 3: Mutations with rollback
function TodoForm() {
  const queryClient = useQueryClient();

  const { mutate: addTodo, isPending } = useMutation({
    mutationFn: (text: string) =>
      fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text })
      }).then(r => r.json()),

    // Called before mutation (optimistic update)
    onMutate: async (newText) => {
      // Cancel any ongoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot old data for rollback
      const previousTodos = queryClient.getQueryData(['todos']);

      // Optimistically update
      queryClient.setQueryData(['todos'], (old: any) => [
        ...old,
        { id: Date.now(), text: newText, done: false }
      ]);

      return { previousTodos };
    },

    // Called on error (rollback)
    onError: (err, newText, context: any) => {
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },

    // Called on success (always refetch fresh)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      addTodo('New todo');
    }}>
      <button disabled={isPending}>
        {isPending ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
}
```

### Performance Metrics: SWR vs React Query

```typescript
// Scenario: App with 10 components using same API
// Network: 3G (slow)

// Without library:
// 10 components × (fetch + parse) = 10 requests
// Time: 10 * 1000ms = 10 seconds
// UX: Very slow, components load one by one

// With SWR:
// Request deduplication: 1 request
// Time: 1 * 100ms = 100ms
// All 10 components update simultaneously
// 100x faster!

// Memory usage (React Query vs SWR):
// React Query: ~500KB (more features, heavier)
// SWR: ~8KB (minimal, lighter)

// For simple apps: SWR wins
// For complex apps with mutations: React Query wins
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Building a Real-Time Dashboard</strong></summary>

### The Challenge

**Product:** Sales Dashboard for e-commerce
**Requirements:**
- Real-time sales metrics
- Inventory updates every 10 seconds
- User interactions trigger updates
- Offline support (show cached data)

### Implementation with SWR

```typescript
// hooks/useLiveMetrics.ts
import useSWR from 'swr';

export function useLiveMetrics() {
  const { data: sales, mutate: mutateSales } = useSWR(
    '/api/metrics/sales',
    fetcher,
    {
      refreshInterval: 10000, // Update every 10 seconds
      revalidateOnFocus: true // Immediate update on focus
    }
  );

  const { data: inventory } = useSWR(
    '/api/metrics/inventory',
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true
    }
  );

  const { data: topProducts } = useSWR(
    '/api/metrics/top-products',
    fetcher,
    {
      refreshInterval: 30000, // Less frequent updates
    }
  );

  return { sales, inventory, topProducts, mutateSales };
}

// components/SalesDashboard.tsx
'use client';

function SalesDashboard() {
  const { sales, inventory, topProducts } = useLiveMetrics();

  return (
    <div>
      <SalesCard data={sales} />
      <InventoryCard data={inventory} />
      <TopProductsList data={topProducts} />
    </div>
  );
}

// components/UpdateSaleButton.tsx
'use client';

function UpdateSaleButton() {
  const { mutateSales } = useLiveMetrics();

  async function recordSale() {
    try {
      // Optimistic update
      mutateSales((current) => ({
        ...current,
        total: (current?.total || 0) + 100,
        count: (current?.count || 0) + 1
      }), { revalidate: false });

      // Send to server
      await fetch('/api/sales', { method: 'POST' });

      // Revalidate after
      mutateSales();
    } catch (error) {
      // Error handled, cache shows old data
      mutateSales(); // Revalidate to get fresh data
    }
  }

  return <button onClick={recordSale}>Record Sale</button>;
}

// Global SWR config for offline support
// app/layout.tsx
'use client';

import { SWRConfig } from 'swr';

export default function RootLayout({ children }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url) => fetch(url).then(r => r.json()),
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        // Offline-first: return stale data on network error
        fallbackData: {},
      }}
    >
      {children}
    </SWRConfig>
  );
}

// Results:
// - 10 dashboard components: 1 network request (deduplication)
// - Updates every 10s: automatic refetch
// - User interaction: instant optimistic update
// - Network error: shows cached data
// - User returns to tab: immediate refresh
```

### Comparison: SWR vs React Query

```typescript
// Same dashboard with React Query

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      gcTime: 300000,
      refetchOnWindowFocus: true,
    },
  },
});

function SalesDashboard() {
  const { data: sales } = useQuery({
    queryKey: ['metrics', 'sales'],
    queryFn: () => fetch('/api/metrics/sales').then(r => r.json()),
  });

  const { data: inventory } = useQuery({
    queryKey: ['metrics', 'inventory'],
    queryFn: () => fetch('/api/metrics/inventory').then(r => r.json()),
  });

  return (
    <div>
      <SalesCard data={sales} />
      <InventoryCard data={inventory} />
    </div>
  );
}

// Advantages of React Query for this use case:
// 1. Better mutation handling with rollback
// 2. Composite keys: easier to invalidate groups
// 3. Better offline support with more control
// 4. More debugging tools (DevTools)

// But for simple read-only dashboard: SWR is lighter
```

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: SWR vs React Query vs Plain Fetch</strong></summary>

### Decision Matrix

```
Metric                    SWR         React Query    Plain Fetch
─────────────────────────────────────────────────────────────────
Bundle size               8KB         40KB           0KB
Setup complexity          Minimal     Medium         None
Data caching              ✅          ✅✅           ❌
Deduplication             ✅          ✅             ❌
Auto-refetch              ✅          ✅             ❌
Optimistic updates        ✅          ✅✅           ❌
Offline support           ✅          ✅✅           ❌
Debugging tools           Basic       Excellent      None
Learning curve            Easy        Steep          None
Best for                  Simple      Complex        Trivial
Maintenance burden        Low         Medium         High
```

### When to Use SWR

```typescript
// ✅ Perfect for SWR
// - Simple read-only dashboards
// - Real-time metrics (with polling)
// - Lightweight apps
// - Team familiar with Vercel ecosystem

'use client';
import useSWR from 'swr';

function WeatherApp() {
  const { data: weather } = useSWR('/api/weather', fetcher, {
    refreshInterval: 300000 // 5 minute updates
  });

  return <div>{weather?.temperature}°C</div>;
}

// Cost: +8KB bundle size (worth it for caching)
```

### When to Use React Query

```typescript
// ✅ Perfect for React Query
// - Complex state management
// - Form submissions with mutations
// - Optimistic updates required
// - Sophisticated caching needs
// - Team willing to learn new concepts

'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

function TodoApp() {
  const queryClient = useQueryClient();

  const { data: todos } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos
  });

  const { mutate: addTodo } = useMutation({
    mutationFn: createTodo,
    onMutate: optimisticAdd,
    onError: rollbackAdd,
    onSettled: invalidateTodos
  });

  return (
    <div>
      {todos?.map(t => <Todo key={t.id} todo={t} />)}
      <button onClick={() => addTodo('New')}>Add</button>
    </div>
  );
}

// Cost: +40KB bundle (but handles complexity elegantly)
```

### When to Use Plain fetch()

```typescript
// ✅ Perfect for plain fetch
// - API-driven (no client-side mutations)
// - Server-side rendering (Next.js App Router)
// - Simple read-only pages
// - Minimal bundle size critical

// Example: Server component (no client JS needed)
async function BlogList() {
  const posts = await fetch('/api/blog').then(r => r.json());

  return (
    <ul>
      {posts.map(p => <li key={p.id}>{p.title}</li>)}
    </ul>
  );
}

// Cost: 0KB extra (already using fetch for server-side)
```

### Hybrid Approach (Recommended)

```typescript
// Best of all worlds: Server-side + client-side

// app/blog/page.tsx (Server Component)
async function BlogPage() {
  // Static content fetched on server
  const posts = await db.post.findMany();

  return (
    <div>
      <PostList initialPosts={posts} />
      <RealtimeActivity />
    </div>
  );
}

// app/components/PostList.tsx (Server Component)
async function PostList({ initialPosts }) {
  return (
    <ul>
      {initialPosts.map(p => <li key={p.id}>{p.title}</li>)}
    </ul>
  );
}

// app/components/RealtimeActivity.tsx (Client Component with SWR)
'use client';

function RealtimeActivity() {
  const { data: activity } = useSWR('/api/activity', fetcher, {
    refreshInterval: 5000
  });

  return <div>Latest: {activity?.message}</div>;
}

// Result:
// - Static content: From server (no JS overhead)
// - Real-time data: From SWR (efficient polling)
// - Bundle size: Minimal (only real-time needs SWR)
// - Performance: Optimal for both use cases
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Data Fetching Libraries Demystified</strong></summary>

### The Manual Way vs Smart Way

**Manual Fetching (Tedious):**

```typescript
'use client';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/user')
      .then(r => r.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // What if user navigates away and back? Fetches again!
  // What if 10 components need same data? 10 requests!
  // What if network is slow? No retry logic!

  return <div>{loading ? 'Loading...' : user?.name}</div>;
}
```

**Smart Way (with SWR):**

```typescript
'use client';
import useSWR from 'swr';

function UserProfile() {
  const { data: user, isLoading, error } = useSWR('/api/user', fetcher);

  // Automatic deduplication: if 10 components use this, only 1 request!
  // Automatic caching: navigate away and back? Shows cached instantly!
  // Automatic refetch: user focus? Updates automatically!
  // Error retry: network error? Retries automatically!
  // Type-safe: data is properly typed!

  return <div>{isLoading ? 'Loading...' : user?.name}</div>;
}
```

### Common Mistakes Juniors Make

**Mistake 1: Ignoring library benefits (using SWR wrong)**

```typescript
// ❌ Wrong: Defeats purpose of SWR
'use client';

function UserProfile() {
  const { data: user, mutate } = useSWR('/api/user', fetcher);

  useEffect(() => {
    // Manually refetching defeats SWR caching
    mutate();
  }, []);

  // SWR already auto-refetches on focus/reconnect
  // This manual trigger is redundant
}
```

Fix: Let SWR handle it

```typescript
// ✅ Correct: Trust SWR
'use client';

function UserProfile() {
  const { data: user } = useSWR('/api/user', fetcher);
  // SWR handles refetching automatically

  return <div>{user?.name}</div>;
}

// If you need to force refresh:
// const { mutate } = useSWR(...);
// <button onClick={() => mutate()}>Refresh</button>
```

**Mistake 2: Fetching in useEffect with dependencies**

```typescript
// ❌ Wrong: Manual refetching is fragile
'use client';

function TodoList({ userId }) {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetch(`/api/todos?userId=${userId}`)
      .then(r => r.json())
      .then(setTodos);
  }, [userId]); // When userId changes, refetch

  // What if component re-mounts?
  // What if network fails?
  // What if user navigates away?
}
```

Fix: Use SWR with dynamic keys

```typescript
// ✅ Correct: SWR handles dependencies
'use client';
import useSWR from 'swr';

function TodoList({ userId }) {
  const { data: todos } = useSWR(
    `/api/todos?userId=${userId}`,
    fetcher
  );

  // Automatically refetches when userId changes
  // Caches per userId
  // Deduplicates requests
  // Error retry
}
```

**Mistake 3: Not using optimistic updates**

```typescript
// ❌ Wrong: Bad UX - users wait for response
function AddTodoForm() {
  const { data: todos, mutate } = useSWR('/api/todos', fetcher);
  const [isLoading, setIsLoading] = useState(false);

  async function addTodo(text: string) {
    setIsLoading(true);

    // User waits for server response
    const newTodo = await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ text })
    }).then(r => r.json());

    setIsLoading(false);

    // Only then update UI
    mutate([...todos, newTodo]);
  }

  return <button disabled={isLoading}>Add Todo</button>;
}
```

Fix: Use optimistic updates

```typescript
// ✅ Correct: Instant feedback to user
function AddTodoForm() {
  const { data: todos, mutate } = useSWR('/api/todos', fetcher);

  async function addTodo(text: string) {
    // Immediately update UI
    const optimisticTodo = { id: Date.now(), text };
    mutate([...todos, optimisticTodo], false); // Don't refetch yet

    try {
      // Send to server
      const newTodo = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text })
      }).then(r => r.json());

      // Update with real data
      mutate([...todos, newTodo]);
    } catch (error) {
      // Error? Revert
      mutate(todos);
    }
  }

  return <button>Add Todo</button>;
}

// User experience:
// Before: Click button → wait 500ms → see result
// After: Click button → instant response (local) → 500ms updates from server
```

### Interview Answer Template

**Q: "When would you use SWR vs React Query?"**

**A:** "I'd use **SWR** for simple dashboards or read-only apps where I just need data fetching and caching. It's lightweight (8KB), easy to set up, and Vercel built it specifically for Next.js.

For complex apps with lots of mutations, form interactions, and optimistic updates, I'd use **React Query**. It's heavier (40KB) but has better mutation handling, debugging tools, and more sophisticated cache management.

For purely server-rendered content or API-driven pages, I'd use plain `fetch()` since Next.js App Router deduplicates requests automatically.

I'd combine all three: Server-side rendering for critical content, SWR for real-time client updates, and plain fetch for simple API calls. The goal is minimal bundle size while solving the specific problem."

**Why this works:**
- Shows understanding of trade-offs
- Explains when to use each approach
- Demonstrates real-world thinking
- Shows experience with both libraries

---

</details>

---

**[← Back to Next.js README](./README.md)**
