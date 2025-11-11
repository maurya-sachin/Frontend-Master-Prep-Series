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

## Question 2: App Router Data Fetching (Next.js 13+)

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

## Question 3: SWR and React Query for Client-Side Data Fetching

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

**[← Back to Next.js README](./README.md)**
