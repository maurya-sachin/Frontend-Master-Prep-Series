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

## 🔍 Deep Dive: Loading and Error States Architecture

<details>
<summary><strong>🔍 Deep Dive: Loading and Error States Architecture</strong></summary>

### React Suspense Integration with Next.js

Next.js `loading.js` files are syntactic sugar over React Suspense boundaries. Understanding how Suspense works internally helps you optimize loading states:

**How loading.js Works Under the Hood:**

```typescript
// What you write:
// app/dashboard/loading.js
export default function Loading() {
  return <div>Loading dashboard...</div>;
}

// What Next.js compiles to internally:
import { Suspense } from 'react';
import DashboardPage from './page';
import Loading from './loading';

export default function DashboardLayout() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardPage /> {/* Server Component that fetches data */}
    </Suspense>
  );
}

// Suspense behavior:
// 1. DashboardPage starts rendering (Server Component)
// 2. Hits async data fetch (await fetchDashboardData())
// 3. React "suspends" component rendering
// 4. Suspense boundary catches suspension, shows Loading fallback
// 5. Data fetch completes, React resumes rendering DashboardPage
// 6. Suspense swaps Loading fallback with actual content
```

**Streaming SSR (Server-Side Rendering) with Suspense:**

Traditional SSR: Server waits for ALL data before sending HTML
```typescript
// Traditional SSR (slow):
// 1. Server fetches all data: 2000ms
//    - User data: 50ms
//    - Dashboard stats: 1500ms (slow database query)
//    - Recent activity: 450ms
// 2. Server renders HTML: 100ms
// 3. Server sends HTML: 50ms
// Total Time to First Byte (TTFB): 2150ms
// User sees blank screen for 2.15 seconds
```

Streaming SSR with Suspense: Server sends HTML in chunks
```typescript
// Streaming SSR (fast):
// 1. Server starts rendering: 0ms
// 2. Sends HTML shell with layout: 50ms (TTFB: 50ms!)
//    User sees navigation, sidebar immediately
// 3. Streams loading states: 0ms
//    User sees skeleton loaders
// 4. Streams data as it arrives:
//    - User data ready at 100ms → Stream user widget
//    - Recent activity ready at 500ms → Stream activity feed
//    - Dashboard stats ready at 1550ms → Stream stats widgets
// Total time: Same 2150ms, but perceived as much faster
// User sees content progressively, not all-or-nothing
```

**React 18 Concurrent Features:**

Suspense leverages React 18's concurrent rendering to prioritize updates:

```typescript
// High-priority update: User clicks button
startTransition(() => {
  setTab('analytics'); // Wrapped in startTransition (low priority)
});

// React prioritizes:
// 1. Show loading state immediately (high priority)
// 2. Fetch analytics data (background)
// 3. User can still interact with page (doesn't block)
// 4. When data ready, swap to analytics tab
```

### Error Boundary Deep Dive

Next.js `error.js` implements React Error Boundaries with additional features:

**Error Boundary Lifecycle:**

```typescript
// error.js compiles to:
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to Sentry, Rollbar, etc.
    Sentry.captureException(error);
  }

  reset = () => {
    // Reset error state to retry
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Render custom error UI
      return <ErrorComponent error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

// Your error.js:
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Error Propagation Hierarchy:**

```typescript
// Error propagation flow:
app/
├── error.js              // Catches errors in root layout + all pages
├── layout.js
├── page.js
└── dashboard/
    ├── error.js          // Catches errors in dashboard layout + pages
    ├── layout.js
    ├── page.js
    └── analytics/
        ├── error.js      // Catches errors only in analytics page
        └── page.js

// Example error propagation:
// 1. Error thrown in app/dashboard/analytics/page.js
// 2. Caught by nearest error.js: app/dashboard/analytics/error.js
// 3. If no error.js there, bubble up to app/dashboard/error.js
// 4. If no error.js there, bubble up to app/error.js
// 5. If error in root layout, caught by app/global-error.js (replaces entire HTML)
```

**Why error.js Must Be Client Component:**

```typescript
// error.js needs client-side features:
// 1. useState for error state
// 2. Event handlers (onClick for reset button)
// 3. useEffect for logging (useEffect only runs on client)

'use client'; // REQUIRED

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log to monitoring service (runs on client only)
    console.error(error);
  }, [error]);

  return (
    <button onClick={reset}> {/* Event handlers need client JS */}
      Try again
    </button>
  );
}

// Server Components can't have:
// - onClick handlers
// - useState/useEffect hooks
// - Browser APIs (localStorage, window, etc.)
```

### not-found.js Special Handling

`not-found()` function and `not-found.js` work together for 404 handling:

```typescript
// app/blog/[slug]/page.js
import { notFound } from 'next/navigation';

export default async function BlogPost({ params }) {
  const post = await db.post.findUnique({ where: { slug: params.slug } });

  if (!post) {
    notFound(); // Triggers nearest not-found.js
  }

  return <article>{post.content}</article>;
}

// What notFound() does internally:
// 1. Throws special error: NEXT_NOT_FOUND
// 2. Next.js catches this error
// 3. Searches for not-found.js in current route segment
// 4. If found, renders not-found.js
// 5. If not found, searches parent segments
// 6. Falls back to app/not-found.js (default 404)

// Sets HTTP status:
// - notFound() sets response status to 404
// - Regular error.js sets status to 500
```

### Performance Optimization with Streaming

**Selective Hydration:**

Streaming enables React to hydrate components as HTML arrives:

```typescript
// Without streaming:
// 1. Wait for full HTML (2000ms)
// 2. Load ALL JavaScript (500ms)
// 3. Hydrate entire page (300ms)
// Total Time to Interactive (TTI): 2800ms

// With streaming:
// 1. HTML shell arrives (50ms)
// 2. Hydrate shell (50ms) - Interactive at 100ms!
// 3. Analytics HTML arrives (500ms)
// 4. Hydrate analytics (100ms) - Analytics interactive at 600ms
// 5. Stats HTML arrives (1550ms)
// 6. Hydrate stats (150ms) - Stats interactive at 1700ms
// Shell interactive in 100ms vs 2800ms (28x faster!)
```

**Progressive Enhancement:**

```typescript
// Page structure for optimal streaming:
export default async function DashboardPage() {
  // Static content renders immediately (no Suspense needed)
  return (
    <div>
      <h1>Dashboard</h1> {/* Sent in initial HTML */}
      <nav>...</nav> {/* Sent in initial HTML */}

      {/* Slow data wrapped in Suspense */}
      <Suspense fallback={<Skeleton />}>
        <Analytics /> {/* Server Component with await fetch */}
      </Suspense>

      {/* Fast data can be outside Suspense */}
      <QuickStats /> {/* Server Component with cached data */}

      {/* Very slow data in separate Suspense */}
      <Suspense fallback={<Skeleton />}>
        <ComplexChart /> {/* Heavy computation */}
      </Suspense>
    </div>
  );
}

// Streaming order:
// 1. Shell (h1, nav): 50ms
// 2. QuickStats (cached): 100ms
// 3. Analytics (API call): 500ms
// 4. ComplexChart (heavy): 2000ms
// Total: 2000ms, but shell interactive at 50ms
```

</details>

---

## 🐛 Real-World Scenario: Error Boundary Production Incident

<details>
<summary><strong>🐛 Real-World Scenario: Error Boundary Production Incident</strong></summary>

### Production Crisis: Infinite Error Loop

**Context:** Dashboard application crashed in production, showing error page, "Try again" button causes infinite loop.

**Initial Symptoms (Production - User reports):**

```typescript
// Error monitoring (Sentry):
Error: Failed to fetch dashboard data
URL: https://example.com/dashboard
Count: 15,000 errors in 10 minutes
Affected users: 3,500 (all dashboard visitors)

// User experience:
// 1. Navigate to /dashboard
// 2. See "Something went wrong!" error page
// 3. Click "Try again" button
// 4. Error page shows again immediately
// 5. Click "Try again" again
// 6. Infinite loop, dashboard never loads

// Business impact:
// - 3,500 users unable to access dashboard
// - Support tickets: 280 in 10 minutes
// - Bounce rate: 95% (users give up after 3 tries)
```

### Investigation Process

**Step 1: Reproduce Error**

```typescript
// app/dashboard/page.js
export default async function DashboardPage() {
  // This fetch fails due to API outage
  const data = await fetch('https://api.example.com/dashboard');

  if (!data.ok) {
    throw new Error('Failed to fetch dashboard data');
  }

  const dashboard = await data.json();

  return <div>{dashboard.title}</div>;
}

// app/dashboard/error.js
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// What happens when user clicks "Try again":
// 1. reset() called
// 2. Error boundary resets, re-renders page component
// 3. page.js runs again: await fetch(...)
// 4. Fetch fails again (API still down)
// 5. Error thrown again
// 6. Caught by same error boundary
// 7. Shows same error page
// 8. Infinite loop! User sees error → clicks reset → error → repeat
```

**Step 2: Root Cause Analysis**

```typescript
// Problem 1: reset() doesn't fix the underlying issue
// - reset() re-renders component
// - But API is still down
// - Fetch fails again immediately
// - No retry delay, no fallback, no escape hatch

// Problem 2: No error recovery strategy
// - No exponential backoff
// - No maximum retry attempts
// - No fallback content when retries exhausted

// Problem 3: Poor UX during API outages
// - Users don't know API is down (generic error message)
// - No alternative actions (go back, contact support)
// - No estimated time to fix
```

### Solution Implementation

**Fix 1: Add Retry Logic with Exponential Backoff**

```typescript
// app/dashboard/error.js
'use client';

import { useState } from 'react';

export default function Error({ error, reset }) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    // Maximum 3 retries
    if (retryCount >= 3) {
      alert('Maximum retries reached. Please contact support.');
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    // Exponential backoff: 2^retry seconds
    // Retry 1: 2s, Retry 2: 4s, Retry 3: 8s
    const delayMs = Math.pow(2, retryCount) * 1000;

    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Try again
    reset();
    setIsRetrying(false);
  };

  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>

      {retryCount < 3 ? (
        <button onClick={handleRetry} disabled={isRetrying}>
          {isRetrying
            ? `Retrying in ${Math.pow(2, retryCount)}s...`
            : `Try again (${retryCount}/3)`}
        </button>
      ) : (
        <div>
          <p>Maximum retries reached. The service may be temporarily down.</p>
          <a href="/support">Contact Support</a>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      )}
    </div>
  );
}

// User experience after fix:
// 1. Error occurs
// 2. Click "Try again (0/3)"
// 3. Waits 2 seconds, retries
// 4. If still fails, click "Try again (1/3)"
// 5. Waits 4 seconds, retries
// 6. If still fails, click "Try again (2/3)"
// 7. Waits 8 seconds, retries
// 8. After 3 failed retries, shows support options
```

**Fix 2: Implement Fallback UI for API Failures**

```typescript
// app/dashboard/page.js
import { Suspense } from 'react';
import { DashboardContent } from './DashboardContent';
import { DashboardSkeleton } from './DashboardSkeleton';
import { DashboardFallback } from './DashboardFallback';

export default async function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Wrap data-fetching in Suspense for better error isolation */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

// app/dashboard/DashboardContent.js
export async function DashboardContent() {
  try {
    const data = await fetch('https://api.example.com/dashboard', {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!data.ok) {
      throw new Error(`API error: ${data.status}`);
    }

    const dashboard = await data.json();

    return <div>{dashboard.content}</div>;
  } catch (error) {
    // Instead of throwing, render fallback content
    console.error('Dashboard API error:', error);

    // Return fallback UI instead of throwing
    return (
      <div className="fallback">
        <h2>Unable to load latest data</h2>
        <p>Showing cached content from previous session.</p>
        <CachedDashboard /> {/* Show stale data */}
        <button onClick={() => window.location.reload()}>
          Refresh to try again
        </button>
      </div>
    );
  }
}

// Benefits:
// - Page doesn't completely break
// - Users see something useful (cached data)
// - Graceful degradation vs complete failure
```

**Fix 3: Add Error Monitoring and Alerting**

```typescript
// app/dashboard/error.js
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error to monitoring service
    Sentry.captureException(error, {
      tags: {
        page: 'dashboard',
        component: 'error-boundary',
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      },
    });

    // Check if it's a widespread issue (>100 errors in 5 min)
    // Trigger PagerDuty alert if critical
    if (isWidespreadOutage(error)) {
      alertOncall({
        severity: 'critical',
        message: 'Dashboard API down, 3,500 users affected',
        page: 'dashboard',
      });
    }
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// Automated response:
// 1. Error occurs
// 2. Logged to Sentry
// 3. Sentry detects spike in errors (>100/min)
// 4. Triggers PagerDuty alert
// 5. On-call engineer paged
// 6. Team investigates API outage
// 7. Mean time to detection (MTTD): 2 minutes (vs 10 minutes with manual reports)
```

### Post-Fix Metrics

**Incident Resolution:**

```typescript
// Timeline:
// 14:00 - API outage begins
// 14:02 - Sentry alerts fire automatically
// 14:03 - On-call engineer paged
// 14:05 - Identify API server crash (database connection pool exhausted)
// 14:08 - Restart API servers
// 14:10 - API recovered, dashboard loads normally
// Total outage: 10 minutes (vs 30+ minutes with manual detection)

// User impact (with error boundary improvements):
// - 3,500 users affected (same as before)
// - But: Users saw cached data instead of complete failure
// - Bounce rate: 40% (down from 95%)
// - 2,100 users (60%) stayed and used cached dashboard
// - Revenue loss: $8,000 (vs $28,000 without fallback UI)

// Post-fix metrics (24 hours after improvements):
// - Error recovery rate: 75% (3 out of 4 errors resolve after retry)
// - Average retries per error: 1.8 (most resolve on first or second retry)
// - Support tickets during outages: Reduced by 65%
// - User frustration: Down significantly (feedback improved)
```

### Lessons Learned

**What Went Wrong:**

1. **No retry strategy** - reset() immediately retries, causing infinite loop
2. **No fallback content** - Complete failure vs graceful degradation
3. **Poor error messages** - Generic "Something went wrong" doesn't help users
4. **Manual error detection** - Took 10 minutes to discover widespread outage
5. **No escape hatch** - Users stuck in error loop with no alternative actions

**Preventive Measures Implemented:**

```typescript
// 1. Error boundary best practices
// app/dashboard/error.js
'use client';

export default function Error({ error, reset }) {
  const [retryCount, setRetryCount] = useState(0);

  return (
    <div>
      {/* Specific error message */}
      <h2>
        {error.message.includes('fetch')
          ? 'Connection Error'
          : 'Something went wrong'}
      </h2>

      {/* Retry with backoff */}
      {retryCount < 3 && (
        <button onClick={handleRetryWithBackoff}>
          Try again ({retryCount}/3)
        </button>
      )}

      {/* Escape hatches */}
      <button onClick={() => router.back()}>Go Back</button>
      <button onClick={() => router.push('/')}>Home</button>
      <a href="/support">Contact Support</a>

      {/* Error details for debugging (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <pre>{error.stack}</pre>
      )}
    </div>
  );
}

// 2. Comprehensive error monitoring
// lib/monitoring.ts
export function setupErrorMonitoring() {
  // Sentry for error tracking
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    beforeSend(event) {
      // Add custom context
      event.tags = {
        ...event.tags,
        deployment: process.env.VERCEL_ENV,
        region: process.env.VERCEL_REGION,
      };
      return event;
    },
  });

  // Alert rules in Sentry:
  // - >100 errors in 5 minutes → PagerDuty alert
  // - >50% error rate → Slack notification
  // - API errors → Email to backend team
}
```

**Key Takeaways:**

1. **Add retry logic with exponential backoff** - Prevents infinite loops, gives transient errors time to resolve
2. **Implement fallback UI** - Show cached/stale data instead of complete failure
3. **Provide escape hatches** - Go back, go home, contact support (don't trap users)
4. **Monitor errors actively** - Auto-alert on error spikes, don't wait for user reports
5. **Test error states** - Simulate API failures in staging to verify error handling works

</details>

---

## ⚖️ Trade-offs: Loading and Error State Strategies

<details>
<summary><strong>⚖️ Trade-offs: Loading and Error State Strategies</strong></summary>

### 1. loading.js vs Manual Suspense Boundaries

**Using loading.js (Automatic Suspense):**

**Pros:**
- ✅ **Zero configuration** - Just export default function, Next.js handles Suspense
- ✅ **Convention over configuration** - Clear file structure, easy to find loading states
- ✅ **Automatic code splitting** - Loading UI split into separate chunk
- ✅ **Nested support** - Each route segment can have its own loading state

**Cons:**
- ❌ **All-or-nothing** - Entire route shows loading, can't split loading within page
- ❌ **No fine-grained control** - Can't prioritize which parts load first
- ❌ **One loading state per route** - Can't have multiple loading indicators on one page

**Manual Suspense Boundaries:**

**Pros:**
- ✅ **Fine-grained control** - Wrap specific components, not entire routes
- ✅ **Progressive loading** - Show fast data immediately, slow data loads separately
- ✅ **Better UX** - Users see partial content instead of full-page skeleton
- ✅ **Prioritization** - Critical content loads first, non-critical can wait

**Cons:**
- ❌ **More boilerplate** - Must wrap every async component in Suspense manually
- ❌ **Complex code** - Harder to understand with many Suspense boundaries
- ❌ **Over-splitting risk** - Too many loading indicators can look janky

**Decision Matrix:**

```typescript
// Use loading.js when:
// - Simple pages with one main data source
// - All data takes similar time to load
// - Entire page depends on single API call
// Example: Blog post page (post content is the only data needed)

// app/blog/[slug]/loading.js
export default function Loading() {
  return <div>Loading post...</div>;
}

// app/blog/[slug]/page.js
export default async function BlogPost({ params }) {
  const post = await fetchPost(params.slug); // Single fetch, ~200ms
  return <article>{post.content}</article>;
}

// Use manual Suspense when:
// - Complex pages with multiple data sources
// - Different data has different loading times
// - Want progressive loading (show fast content first)
// Example: Dashboard with multiple widgets

// app/dashboard/page.js
export default function DashboardPage() {
  return (
    <div>
      {/* Critical content: no Suspense, loads immediately */}
      <h1>Dashboard</h1>
      <nav>...</nav>

      {/* Fast data: loads in 100ms */}
      <Suspense fallback={<Skeleton />}>
        <UserWidget /> {/* Cached user data */}
      </Suspense>

      {/* Slow data: loads in 2000ms */}
      <Suspense fallback={<Skeleton />}>
        <AnalyticsChart /> {/* Complex database query */}
      </Suspense>

      {/* User sees header+nav immediately (0ms)
          User widget appears at 100ms
          Analytics chart appears at 2000ms
          Much better UX than waiting 2000ms for everything */}
    </div>
  );
}
```

### 2. Error Boundaries: Route-Level vs Component-Level

**Route-Level Error Boundaries (error.js):**

**Pros:**
- ✅ **Catches all errors in route** - One error boundary protects entire page
- ✅ **Consistent error UI** - Same error style across all pages
- ✅ **Less boilerplate** - Don't need to wrap every component manually
- ✅ **SEO friendly** - Sets proper HTTP status codes (500 for errors, 404 for not-found)

**Cons:**
- ❌ **Coarse-grained** - Error in small widget crashes entire page
- ❌ **Lost context** - User loses all page content when error occurs
- ❌ **Poor UX for partial failures** - One broken widget shouldn't break everything

**Component-Level Error Boundaries:**

**Pros:**
- ✅ **Fine-grained failure** - Error in one component doesn't affect others
- ✅ **Partial degradation** - Rest of page still works even if one part fails
- ✅ **Better UX** - Users see most content, only broken part shows error
- ✅ **Easier debugging** - Clear which component failed

**Cons:**
- ❌ **More code** - Must create custom ErrorBoundary components
- ❌ **Inconsistent UI** - Different error styles if not standardized
- ❌ **Complexity** - Many error boundaries can be hard to manage

**Hybrid Approach (Recommended):**

```typescript
// Route-level error.js for catastrophic failures
// app/dashboard/error.js
export default function Error({ error, reset }) {
  return (
    <div>
      <h1>Dashboard Error</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// Component-level boundaries for non-critical features
// app/dashboard/page.js
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DashboardPage() {
  return (
    <div>
      {/* Critical content: No error boundary, let it bubble to error.js */}
      <h1>Dashboard</h1>

      {/* Non-critical widget: Component-level error boundary */}
      <ErrorBoundary fallback={<WidgetError />}>
        <AnalyticsWidget />
      </ErrorBoundary>

      {/* If AnalyticsWidget fails:
          - Shows WidgetError (small error box)
          - Rest of dashboard still works
          - User can continue using other features */}

      {/* More widgets with their own boundaries */}
      <ErrorBoundary fallback={<WidgetError />}>
        <RecentActivityWidget />
      </ErrorBoundary>
    </div>
  );
}
```

### 3. not-found.js vs 404 API Responses

**Using notFound() + not-found.js:**

**Pros:**
- ✅ **Better SEO** - Proper 404 status code sent to search engines
- ✅ **Nested 404 pages** - Different 404 UI for different sections
- ✅ **Type-safe** - TypeScript knows resource doesn't exist
- ✅ **Server-side** - No client-side JavaScript needed

**Cons:**
- ❌ **Must be called in Server Component** - Can't use in Client Components
- ❌ **Throws exception** - Uses exception control flow (some consider anti-pattern)

**Returning null + Client-Side Handling:**

**Pros:**
- ✅ **Works in Client Components** - Can handle 404 anywhere
- ✅ **No exceptions** - Normal control flow
- ✅ **Flexible** - Can show different UI without separate file

**Cons:**
- ❌ **Wrong status code** - Returns 200 (success) instead of 404
- ❌ **Bad SEO** - Search engines think page exists
- ❌ **Inconsistent UI** - Easy to forget 404 handling

**When to Use Each:**

```typescript
// Use notFound() for:
// - Dynamic routes ([slug], [id], etc.)
// - When resource doesn't exist in database
// - SEO-critical pages (blog posts, products)

// app/products/[id]/page.js
export default async function ProductPage({ params }) {
  const product = await db.product.findUnique({ where: { id: params.id } });

  if (!product) {
    notFound(); // Returns 404 status, renders not-found.js
  }

  return <div>{product.name}</div>;
}

// Use client-side handling for:
// - Conditional features (premium content for paid users)
// - Client-only routes
// - When you want to show partial content

// components/PremiumContent.js
'use client';

export function PremiumContent({ user }) {
  if (!user.isPremium) {
    // Don't use notFound() (Server Component only)
    return (
      <div>
        <h2>Premium Content</h2>
        <p>Upgrade to view this content</p>
        <button>Upgrade Now</button>
      </div>
    );
  }

  return <PremiumArticle />;
}
```

</details>

---

## 💬 Explain to Junior: Loading and Error States in Next.js

<details>
<summary><strong>💬 Explain to Junior: Loading and Error States in Next.js</strong></summary>

### The Restaurant Order Analogy

Think of loading.js and error.js like a restaurant order system:

**loading.js = "Your food is being prepared"**

When you order food at a restaurant:
- **Without loading state:** You sit at an empty table staring at nothing, wondering if your order was placed
- **With loading state:** Waiter brings bread basket and says "Your meal will be ready in 10 minutes"

```typescript
// ❌ No loading.js: User sees blank page
export default async function MenuPage() {
  const menu = await fetchMenu(); // Takes 3 seconds
  return <div>{menu}</div>;
}
// User stares at white screen for 3 seconds (did the page break?)

// ✅ With loading.js: User sees skeleton loader
// app/menu/loading.js
export default function Loading() {
  return <div>Loading menu...</div>;
}
// User knows something is happening, stays patient
```

**error.js = "Sorry, kitchen is out of this dish"**

Sometimes orders fail:
- **Without error handling:** Waiter disappears, you sit there confused
- **With error.js:** Waiter says "Sorry, we're out of that dish. Would you like something else?"

```typescript
// ❌ No error.js: User sees crash page or blank screen
export default async function OrderPage() {
  const order = await placeOrder(); // Might fail
  return <div>{order.details}</div>;
}
// If API fails, user sees Next.js error page (scary for users!)

// ✅ With error.js: User sees friendly error + retry
// app/order/error.js
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Oops! Kitchen ran into an issue</h2>
      <p>We couldn't process your order: {error.message}</p>
      <button onClick={reset}>Try again</button>
      <button onClick={() => router.push('/menu')}>Back to menu</button>
    </div>
  );
}
```

### The Progressive Web Page Analogy

Think of loading states like building a house:

**Traditional loading (all-or-nothing):**
- Construction crew works for 2 hours
- You can't see anything during construction (giant tarp covers everything)
- After 2 hours, tarp removed, entire house appears at once
- Problem: You wait 2 hours before seeing ANYTHING

**Progressive loading (with Suspense):**
- Foundation appears in 10 minutes (page shell)
- Walls appear in 30 minutes (user data)
- Roof appears in 1 hour (dashboard stats)
- Furniture appears in 2 hours (complex charts)
- Benefit: You see progress, not a black box

```typescript
// Traditional: All-or-nothing (slow!)
export default async function DashboardPage() {
  const userdata = await fetchUser(); // 100ms
  const stats = await fetchStats(); // 1500ms
  const charts = await fetchCharts(); // 2000ms

  return (
    <div>
      <UserWidget data={user} />
      <StatsWidget data={stats} />
      <ChartsWidget data={charts} />
    </div>
  );
}
// User waits 3.6s (100+1500+2000) to see anything!

// Progressive: Show content as it arrives (fast!)
export default function DashboardPage() {
  return (
    <div>
      {/* Shell appears immediately (0ms) */}
      <h1>Dashboard</h1>

      {/* User widget appears at 100ms */}
      <Suspense fallback={<Skeleton />}>
        <UserWidget />
      </Suspense>

      {/* Stats appear at 1500ms */}
      <Suspense fallback={<Skeleton />}>
        <StatsWidget />
      </Suspense>

      {/* Charts appear at 2000ms */}
      <Suspense fallback={<Skeleton />}>
        <ChartsWidget />
      </Suspense>
    </div>
  );
}
// User sees header at 0ms, user widget at 100ms, progressive loading!
```

### Common Mistakes and How to Avoid Them

**Mistake 1: No Loading State (Blank Page Syndrome)**

Bad analogy: Waiting at restaurant with no waiter, no bread, nothing
- User doesn't know if site is broken or loading
- Anxiety builds, user might leave

```typescript
// ❌ BAD: No loading.js
// User sees blank page for 3 seconds (feels broken)

// ✅ GOOD: Add loading.js
// app/dashboard/loading.js
export default function Loading() {
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="skeleton" /> {/* Skeleton loader */}
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
// User sees layout immediately, knows content is coming
```

**Mistake 2: Generic Error Messages**

Bad analogy: Waiter says "Something went wrong" (not helpful!)
- User doesn't know what failed
- Doesn't know if they can fix it
- Doesn't know who to contact

```typescript
// ❌ BAD: Vague error
export default function Error({ error }) {
  return <div>Something went wrong!</div>;
}

// ✅ GOOD: Specific error with actionable steps
export default function Error({ error, reset }) {
  // Parse error type
  const isNetworkError = error.message.includes('fetch');
  const isAuthError = error.message.includes('401');

  return (
    <div>
      <h2>
        {isNetworkError && 'Connection Problem'}
        {isAuthError && 'Session Expired'}
        {!isNetworkError && !isAuthError && 'Something went wrong'}
      </h2>

      <p>
        {isNetworkError && 'Check your internet connection'}
        {isAuthError && 'Please log in again'}
        {!isNetworkError && !isAuthError && error.message}
      </p>

      {isAuthError ? (
        <button onClick={() => router.push('/login')}>Log in</button>
      ) : (
        <button onClick={reset}>Try again</button>
      )}
    </div>
  );
}
```

**Mistake 3: error.js as Server Component**

This won't work:

```typescript
// ❌ ERROR: This will crash
// app/error.js (missing 'use client')
export default function Error({ error, reset }) {
  return (
    <button onClick={reset}> {/* onClick needs client JS! */}
      Try again
    </button>
  );
}
// Error: onClick is not supported in Server Components

// ✅ CORRECT: Add 'use client'
'use client';

export default function Error({ error, reset }) {
  return <button onClick={reset}>Try again</button>;
}
```

### Interview Answer Template

**Question:** "How do you handle loading and error states in Next.js App Router?"

**Answer Structure:**

**1. Start with the built-in file conventions:**
"Next.js provides three special files for UI states: loading.js for loading states, error.js for error boundaries, and not-found.js for 404 pages."

**2. Explain loading.js:**
"loading.js is automatically wrapped in a React Suspense boundary. When a Server Component fetches data, Next.js shows the loading.js component while waiting. This enables streaming SSR - the page shell loads immediately while data streams in progressively."

**Example:**
```typescript
// app/dashboard/loading.js
export default function Loading() {
  return <Skeleton />;
}

// app/dashboard/page.js
export default async function Dashboard() {
  const data = await fetchData(); // loading.js shows during this
  return <div>{data}</div>;
}
```

**3. Explain error.js:**
"error.js creates an Error Boundary that catches errors in the route segment and its children. It must be a Client Component to support reset functionality and event handlers."

**Example:**
```typescript
'use client'; // Required!

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**4. Mention advanced patterns:**
"For complex pages, I use manual Suspense boundaries for fine-grained control. This allows different parts of the page to load independently, improving perceived performance."

**5. Share metrics (if possible):**
"In my last project, adding streaming with multiple Suspense boundaries reduced Time to First Byte from 2.1s to 0.3s and improved user engagement by 45%."

### Quick Reference Checklist

**Before deploying a Next.js page:**

✅ **Loading states:**
- [ ] Add loading.js to routes with async data
- [ ] Show skeleton loaders, not spinners (better UX)
- [ ] Use multiple Suspense boundaries for complex pages
- [ ] Test loading states with slow 3G throttling

✅ **Error handling:**
- [ ] Add error.js to all dynamic routes
- [ ] Include 'use client' directive in error.js
- [ ] Provide specific error messages (not "Something went wrong")
- [ ] Add retry button with error count limit (max 3 retries)
- [ ] Include escape hatches (Go back, Go home, Contact support)
- [ ] Log errors to monitoring service (Sentry, etc.)

✅ **404 handling:**
- [ ] Add not-found.js to dynamic routes ([id], [slug])
- [ ] Call notFound() when resource doesn't exist
- [ ] Provide helpful links (Go home, Search, Browse categories)

✅ **Testing:**
- [ ] Test loading states (throttle network to slow 3G)
- [ ] Test error states (simulate API failures)
- [ ] Test 404 pages (try invalid slugs/IDs)
- [ ] Verify retry button doesn't cause infinite loops
- [ ] Check HTTP status codes (404 for not-found, 500 for errors)

</details>

---

## Question 5: What are Server Components and Client Components?

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
