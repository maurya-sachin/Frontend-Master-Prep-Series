# React Server Components

## Question 1: What are React Server Components and how do they differ from client components?

**Answer:**

React Server Components (RSC) are a new paradigm introduced in React 18 that allows components to render on the server and send a serialized representation to the client, rather than sending JavaScript bundles. Unlike traditional Server-Side Rendering (SSR) which renders to HTML, Server Components produce a special format that preserves React's component tree structure while eliminating the need to ship component code to the browser.

The key difference from Client Components is **where the code executes and what gets sent to the browser**. Server Components run exclusively on the server during the request, can directly access backend resources (databases, file systems, APIs), and their code never reaches the client bundle. Client Components (marked with `"use client"`) behave like traditional React components—they run on both server (for initial SSR) and client (for hydration and interactivity), and their full code must be included in the JavaScript bundle.

Server Components can import and render Client Components, but not vice versa. This creates a unidirectional flow where Server Components act as the outer shell that can fetch data and compose Client Components as needed. Server Components cannot use state, effects, browser APIs, or event handlers since they don't run on the client. Client Components have full access to React's interactive features but lose the ability to directly access server-side resources.

The rendering model is fundamentally different: Server Components execute once per request and send a wire format (RSC payload) to the client, while Client Components hydrate and become interactive. This architectural shift enables **zero-bundle-size server logic**—all the data fetching, business logic, and heavy dependencies in Server Components stay on the server, dramatically reducing the JavaScript shipped to browsers.

---

### 🔍 Deep Dive

**RSC Protocol and Wire Format:**

The RSC payload is a special streaming format that represents the component tree. Instead of HTML or JSON, it's a line-delimited format where each line represents a chunk of the component tree. Here's an example:

```
M1:{"id":"./src/ClientCounter.js","chunks":["client1"],"name":"Counter"}
J0:["$","div",null,{"children":[["$","h1",null,{"children":"Products"}],["$","@1",null,{"count":0}]]}]
```

- `M` lines define module references (Client Components that need to be loaded)
- `J` lines contain JSON-serialized React elements
- `@1` references a Client Component boundary defined earlier
- The format is streamable, allowing progressive rendering

**Serialization Boundaries:**

Only serializable data can cross the Server-Client boundary. Valid types:
- Primitives (string, number, boolean, null)
- Plain objects and arrays
- Promises (which suspend and resolve)
- Server Components (which serialize to their output)
- Client Component references (which serialize to module references)

**Not serializable:**
- Functions (except Server Actions)
- Class instances
- Symbols
- Dates (serialize as strings, need client-side parsing)

Example of the serialization boundary:

```jsx
// ✅ Server Component - runs on server
async function ProductList() {
  // Direct database access - code never sent to client
  const products = await db.query('SELECT * FROM products');

  // This Date object will be serialized as ISO string
  const timestamp = new Date();

  return (
    <div>
      {products.map(product => (
        // Client Component receives serialized props
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
          // ❌ Cannot pass functions: onClick={() => {}}
          // ❌ Cannot pass class instances: userService={new UserService()}
        />
      ))}
      <ClientComponent timestamp={timestamp.toISOString()} />
    </div>
  );
}
```

**Component Composition Patterns:**

The "use client" directive creates a boundary. Everything imported by a Client Component becomes part of the client bundle:

```jsx
// app/page.jsx - Server Component (default)
import ClientNav from './ClientNav'; // This and ALL its imports go to client
import ServerSidebar from './ServerSidebar'; // Stays on server

export default function Page() {
  return (
    <div>
      {/* Client boundary starts here */}
      <ClientNav>
        {/* ✅ Can pass Server Components as children */}
        <ServerSidebar />
      </ClientNav>
    </div>
  );
}

// ClientNav.jsx
'use client';
import { useState } from 'react';
import { HeavyChart } from 'heavy-library'; // ⚠️ Goes to client bundle!

export default function ClientNav({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <nav>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {open && children} {/* Server Component rendered here */}
    </nav>
  );
}
```

**Streaming Architecture:**

Server Components enable streaming SSR by default. The server can start sending the response before all data is loaded:

```jsx
// Server Component with Suspense
export default function Dashboard() {
  return (
    <div>
      <Header /> {/* Renders immediately */}

      {/* Stream this boundary separately */}
      <Suspense fallback={<Skeleton />}>
        <AsyncProducts /> {/* Waits for data */}
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <AsyncReviews /> {/* Parallel data fetch */}
      </Suspense>
    </div>
  );
}

async function AsyncProducts() {
  const products = await fetchProducts(); // This doesn't block the initial response
  return <ProductList products={products} />;
}
```

The streaming output looks like:

```html
<!-- Initial chunk -->
<div><header>...</header><template id="B:0"></template></div>

<!-- Later chunk when data arrives -->
<div hidden id="S:0"><div class="products">...</div></div>
<script>$RC(document.getElementById("B:0"),document.getElementById("S:0"))</script>
```

**React Element Protocol:**

Server Components return a special format that preserves the React element tree structure while being JSON-serializable:

```javascript
// What Server Component returns internally
{
  $$typeof: Symbol.for('react.element'),
  type: 'div',
  props: {
    children: [
      { $$typeof: Symbol.for('react.element'), type: 'h1', props: { children: 'Hello' } },
      { $$typeof: Symbol.for('react.module.reference'), name: 'ClientComponent' }
    ]
  }
}
```

This format is then serialized to the RSC payload format that can be streamed to the client.

**Data Fetching Semantics:**

Server Components introduce automatic request deduplication and memoization:

```jsx
// This function is automatically memoized per request
async function getUser(id) {
  return fetch(`/api/users/${id}`).then(r => r.json());
}

// Both calls in the same request get deduplicated
async function Profile() {
  const user = await getUser(1); // First call
  return <div>{user.name}</div>;
}

async function Settings() {
  const user = await getUser(1); // Reuses first call's result
  return <div>{user.email}</div>;
}
```

---

### 🐛 Real-World Scenario

**Scenario: Migrating E-Commerce Product Page to Server Components**

**Context:**
A large e-commerce platform with 10M monthly visitors had performance issues:
- **Initial bundle size**: 847 KB (274 KB gzipped)
- **Time to Interactive (TTI)**: 4.2s on 4G
- **Lighthouse Performance Score**: 62/100
- **Product page** required heavy libraries (image processing, analytics, recommendation engine)

**Problem:**

The product page component tree looked like this:

```jsx
// ❌ BEFORE: Everything is Client Component
'use client';
import { useState, useEffect } from 'react';
import { ImageGallery } from 'heavy-image-lib'; // 180 KB
import { RecommendationEngine } from 'ml-recommender'; // 320 KB
import { AnalyticsTracker } from 'analytics-lib'; // 95 KB

export default function ProductPage({ productId }) {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Multiple client-side fetches causing waterfall
    fetch(`/api/products/${productId}`).then(r => r.json()).then(setProduct);
    fetch(`/api/reviews/${productId}`).then(r => r.json()).then(setReviews);
    fetch(`/api/recommendations/${productId}`).then(r => r.json()).then(setRecommendations);
  }, [productId]);

  if (!product) return <Spinner />;

  return (
    <div>
      {/* Heavy client bundle includes all these libraries */}
      <ImageGallery images={product.images} />
      <ProductDetails product={product} />
      <ReviewList reviews={reviews} />
      <RecommendationEngine items={recommendations} />
      <AddToCartButton productId={product.id} /> {/* Only interactive part */}
    </div>
  );
}
```

**Issues identified:**
1. **Bundle bloat**: Heavy libraries for image processing and ML that don't need client-side interactivity
2. **Data fetching waterfall**: Three sequential requests after component mounts
3. **Slow TTI**: Users wait 4+ seconds before they can click "Add to Cart"
4. **Unnecessary hydration**: Most components are static, don't need React interactivity

**Migration Strategy:**

```jsx
// ✅ AFTER: Server Component with Strategic Client Boundaries

// app/products/[id]/page.jsx - Server Component (no directive = server by default)
import { Suspense } from 'react';
import ImageGallery from './ImageGallery'; // Server Component
import ProductDetails from './ProductDetails'; // Server Component
import ReviewList from './ReviewList'; // Server Component
import RecommendationEngine from './RecommendationEngine'; // Server Component
import AddToCartButton from './AddToCartButton'; // Client Component

// ⚡ Parallel data fetching on server
async function getProduct(id) {
  return fetch(`${process.env.API_URL}/products/${id}`).then(r => r.json());
}

async function getReviews(id) {
  return fetch(`${process.env.API_URL}/reviews/${id}`).then(r => r.json());
}

async function getRecommendations(id) {
  return fetch(`${process.env.API_URL}/recommendations/${id}`).then(r => r.json());
}

export default async function ProductPage({ params }) {
  // Server Components can be async!
  const product = await getProduct(params.id);

  return (
    <div>
      {/* Static rendering on server - no JS bundle */}
      <ImageGallery images={product.images} />
      <ProductDetails product={product} />

      {/* Stream these sections separately */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={params.id} />
      </Suspense>

      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={params.id} />
      </Suspense>

      {/* 🎯 Only this needs client-side JS */}
      <AddToCartButton productId={product.id} />
    </div>
  );
}

// Separate async components for streaming
async function Reviews({ productId }) {
  const reviews = await getReviews(productId);
  return <ReviewList reviews={reviews} />;
}

async function Recommendations({ productId }) {
  const recommendations = await getRecommendations(productId);
  return <RecommendationEngine items={recommendations} />;
}

// AddToCartButton.jsx - ONLY Client Component
'use client';
import { useState } from 'react';

export default function AddToCartButton({ productId }) {
  const [adding, setAdding] = useState(false);

  const handleClick = async () => {
    setAdding(true);
    await fetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    setAdding(false);
  };

  return (
    <button onClick={handleClick} disabled={adding}>
      {adding ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

**Results After Migration:**

**Bundle Size Reduction:**
- **Before**: 847 KB total bundle
- **After**: 23 KB total bundle (97% reduction!)
- **Breakdown**:
  - React runtime: 15 KB
  - AddToCartButton component: 4 KB
  - Minimal hydration code: 4 KB

**Performance Metrics:**
- **TTI**: 4.2s → 0.9s (78% improvement)
- **First Contentful Paint**: 2.1s → 1.2s
- **Largest Contentful Paint**: 3.8s → 1.8s
- **Lighthouse Score**: 62 → 94

**Data Fetching Improvements:**
- **Before**: Sequential waterfall (client-side)
  - Component mount → fetch product (800ms)
  - Product renders → fetch reviews (600ms)
  - Reviews render → fetch recommendations (700ms)
  - **Total**: 2.1s + network overhead

- **After**: Parallel server-side fetching
  - All three requests start simultaneously on server
  - **Total**: 800ms (longest request) + streaming

**User Experience:**
- Product details visible in 1.2s (vs 2.1s)
- "Add to Cart" button interactive in 0.9s (vs 4.2s)
- Reviews and recommendations stream in progressively
- Skeleton states prevent layout shift

**Key Migration Lessons:**

1. **Identify static vs interactive**: 95% of the product page was static content
2. **Move heavy libraries server-side**: Image processing and ML libraries stayed on server
3. **Strategic client boundaries**: Only AddToCartButton needed "use client"
4. **Leverage streaming**: Suspense boundaries allowed progressive enhancement
5. **Parallel data fetching**: Server Components can fetch in parallel naturally

---

### ⚖️ Trade-offs

**Server Components vs Client Components: Decision Matrix**

| Criteria | Server Components | Client Components |
|----------|------------------|-------------------|
| **Bundle Size** | ✅ Zero—code never sent to client | ❌ Full component + dependencies in bundle |
| **Data Access** | ✅ Direct database/API access | ❌ Must use API routes |
| **Interactivity** | ❌ No state, effects, or event handlers | ✅ Full React features |
| **Performance** | ✅ Fast initial load, no hydration | ❌ Hydration cost, larger bundles |
| **SEO** | ✅ Content available immediately | ⚠️ Requires SSR for SEO |
| **Caching** | ✅ Cache on server/CDN | ⚠️ Client-side caching complexity |
| **Real-time Updates** | ❌ Requires page refresh/revalidation | ✅ WebSocket, polling, etc. |

**When to Use Server Components:**

✅ **Static Content:**
```jsx
// Perfect for Server Component
async function BlogPost({ slug }) {
  const post = await db.posts.findOne({ slug });
  return (
    <article>
      <h1>{post.title}</h1>
      <Markdown content={post.content} />
      <AuthorBio author={post.author} />
    </article>
  );
}
```

✅ **Heavy Dependencies:**
```jsx
// Server Component - markdown library stays on server
import { unified } from 'unified'; // 500 KB library
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';

async function MarkdownRenderer({ content }) {
  const html = await unified()
    .use(remarkParse)
    .use(remarkHtml)
    .process(content);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

✅ **Direct Backend Access:**
```jsx
// Server Component - no API route needed
async function UserProfile({ userId }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { posts: true, followers: true }
  });

  return <Profile user={user} />;
}
```

**When to Use Client Components:**

✅ **Interactivity:**
```jsx
// Must be Client Component
'use client';
export default function SearchBar() {
  const [query, setQuery] = useState('');

  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      onKeyPress={e => e.key === 'Enter' && handleSearch()}
    />
  );
}
```

✅ **Browser APIs:**
```jsx
// Must be Client Component
'use client';
import { useEffect } from 'react';

export default function GeolocationTracker() {
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      console.log(pos.coords);
    });
  }, []);

  return <div>Tracking location...</div>;
}
```

✅ **React Hooks:**
```jsx
// Must be Client Component
'use client';
export default function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCount(c => c + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return <div>{count}s elapsed</div>;
}
```

**Composition Strategies:**

**Pattern 1: Client Component Wrapping Server Components (Recommended)**

```jsx
// ✅ Best: Server Component as children
// ClientLayout.jsx
'use client';
export default function ClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>Toggle</button>
      {sidebarOpen && children} {/* Server Components passed as children */}
    </div>
  );
}

// Page.jsx (Server Component)
export default function Page() {
  return (
    <ClientLayout>
      <ServerSidebar /> {/* Stays Server Component */}
    </ClientLayout>
  );
}
```

**Pattern 2: Leaf Client Components (Recommended)**

```jsx
// ✅ Best: Keep Client Components at the leaves
// Page.jsx (Server Component)
export default async function Page() {
  const data = await fetchData();

  return (
    <div>
      <StaticHeader data={data} /> {/* Server Component */}
      <StaticContent data={data} /> {/* Server Component */}
      <InteractiveButton /> {/* Client Component - leaf node */}
    </div>
  );
}
```

**Pattern 3: Shared Client Wrapper (Anti-pattern)**

```jsx
// ❌ Bad: Don't wrap everything in Client Component
'use client';
export default function Page() {
  return (
    <div>
      <Header /> {/* Now Client Component unnecessarily */}
      <Content /> {/* Now Client Component unnecessarily */}
      <InteractiveButton /> {/* Only this needs client */}
    </div>
  );
}
```

**Performance Trade-offs:**

**Scenario: Image Gallery (200 images)**

**Option A: Server Component**
```jsx
// Server Component approach
async function ImageGallery() {
  const images = await db.images.findMany({ take: 200 });

  return (
    <div className="grid">
      {images.map(img => (
        <img key={img.id} src={img.url} alt={img.alt} />
      ))}
    </div>
  );
}
```
- **Bundle size**: 0 KB (HTML only)
- **TTI**: ~800ms
- **Limitation**: No lazy loading, no interactive lightbox

**Option B: Client Component with Lazy Loading**
```jsx
'use client';
import { LazyLoadImage } from 'react-lazy-load-image-component'; // 45 KB

export default function ImageGallery({ images }) {
  const [lightbox, setLightbox] = useState(null);

  return (
    <>
      <div className="grid">
        {images.map(img => (
          <LazyLoadImage
            src={img.url}
            onClick={() => setLightbox(img)}
          />
        ))}
      </div>
      {lightbox && <Lightbox image={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}
```
- **Bundle size**: 45 KB + React + component code = ~80 KB
- **TTI**: ~2.1s (hydration + bundle download)
- **Benefit**: Lazy loading, interactive lightbox

**Option C: Hybrid Approach (Best)**
```jsx
// Server Component renders initial HTML
async function ImageGallery() {
  const images = await db.images.findMany({ take: 200 });

  return (
    <div className="grid">
      {images.slice(0, 12).map(img => (
        // First 12 images as plain HTML (Server Component)
        <img key={img.id} src={img.url} alt={img.alt} />
      ))}
      {/* Progressive enhancement with Client Component */}
      <LazyImageGrid images={images.slice(12)} />
    </div>
  );
}

// LazyImageGrid.jsx (Client Component)
'use client';
export default function LazyImageGrid({ images }) {
  // Only loads for images beyond the fold
  return images.map(img => <LazyLoadImage src={img.url} />);
}
```
- **Bundle size**: 80 KB (but only for below-fold images)
- **TTI**: ~900ms (first 12 images interactive immediately)
- **Best of both**: Fast initial render + progressive enhancement

---

### 💬 Explain to Junior

**The Restaurant Kitchen Analogy:**

Imagine a restaurant with two types of workers:

**Server Components = Kitchen Staff (Back of House)**
- Work in the kitchen where customers can't see them
- Have access to all ingredients, ovens, databases of recipes
- Prepare the dish completely
- Only send the **finished plate** to the customer
- Customers never see the recipe, cooking process, or kitchen tools

**Client Components = Waiters (Front of House)**
- Interact directly with customers
- Carry tools with them (notepad, pen = JavaScript bundle)
- Can respond to customer requests in real-time (events, state)
- But they can't access the kitchen directly—must communicate through the pass

**Example:**

```jsx
// 🏪 Kitchen (Server Component) - runs in restaurant kitchen
async function MenuPage() {
  // Chef has direct access to inventory database
  const dishes = await database.query('SELECT * FROM menu WHERE available = true');

  // Chef prepares the dish description (HTML)
  return (
    <div>
      <h1>Today's Menu</h1>
      {dishes.map(dish => (
        <div>
          <h2>{dish.name}</h2>
          <p>{dish.description}</p>
          <p>${dish.price}</p>

          {/* 👨‍💼 Waiter handles ordering (Client Component) */}
          <OrderButton dishId={dish.id} />
        </div>
      ))}
    </div>
  );
}

// 👨‍💼 Waiter (Client Component) - works at customer's table
'use client';
function OrderButton({ dishId }) {
  const [ordering, setOrdering] = useState(false);

  // Waiter responds to customer clicking button
  const handleOrder = () => {
    setOrdering(true);
    // Waiter communicates order to kitchen via API
    fetch('/api/order', { method: 'POST', body: { dishId } });
  };

  return <button onClick={handleOrder}>Order Now</button>;
}
```

**Why This Architecture?**

**Problem Without Server Components:**
```jsx
// ❌ OLD WAY: Waiter carries entire kitchen in their pocket!
'use client';
import Database from 'database-library'; // 500 KB cookbook
import RecipeProcessor from 'recipe-lib'; // 300 KB cooking tools

function MenuPage() {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    // Waiter has to carry database and make query at customer's table
    const db = new Database();
    db.query('SELECT * FROM menu').then(setDishes);
  }, []);

  // ...
}
```

**Problems:**
1. **Waiter carries 800 KB of kitchen equipment** (slow)
2. **Customer waits for waiter to cook at their table** (slow)
3. **Security risk**: Customer can see database connection strings

**With Server Components:**
```jsx
// ✅ NEW WAY: Kitchen prepares, waiter delivers finished plate
async function MenuPage() {
  // Kitchen uses all the tools (database stays in kitchen)
  const dishes = await database.query('SELECT * FROM menu');

  // Customer receives finished HTML
  return <MenuDisplay dishes={dishes} />;
}
```

**Benefits:**
1. **Waiter carries nothing**: 0 KB bundle for menu display
2. **Food arrives pre-cooked**: Customer sees menu immediately
3. **Security**: Customer never sees kitchen tools or database

**When Do You Need a Waiter? (Client Component)**

Only when **customers need to interact**:

```jsx
// ❌ Don't need waiter for static menu board
async function StaticMenu() {
  const dishes = await getDishes();
  return <div>{dishes.map(d => <div>{d.name}</div>)}</div>;
}

// ✅ Need waiter for taking orders (interactivity)
'use client';
function OrderForm() {
  const [order, setOrder] = useState([]);
  return <input onChange={e => setOrder(e.target.value)} />;
}

// ✅ Need waiter for live order tracking (real-time updates)
'use client';
function OrderTracker() {
  const [status, setStatus] = useState('preparing');
  useEffect(() => {
    const ws = new WebSocket('/order-updates');
    ws.onmessage = e => setStatus(e.data);
  }, []);
  return <div>Status: {status}</div>;
}
```

**Interview Answer Template:**

> "React Server Components are a new architecture where components can run exclusively on the server and send only the rendered output to the client, eliminating the need to ship their JavaScript code to the browser. This differs from Client Components, which require their code in the browser bundle to enable interactivity.
>
> The key benefit is **zero-bundle-size server logic**. For example, if I have a product listing page that fetches data from a database and renders a list, I can do that entirely in a Server Component. The database library, data fetching code, and rendering logic all stay on the server. Only the final HTML-like output is sent to the client. This can reduce bundle sizes by 90% or more.
>
> I use Server Components for static content, heavy dependencies, and direct backend access. I use Client Components when I need interactivity—like forms with state, event handlers, or browser APIs. The composition pattern I follow is keeping Server Components at the root and using Client Components as leaves where needed. For example, a product page might be a Server Component that fetches data, with a small 'Add to Cart' Client Component for the interactive button.
>
> In a recent project, we migrated a product page from all Client Components to this hybrid approach and reduced the bundle from 847 KB to 23 KB, improving Time to Interactive from 4.2s to 0.9s."

**Key Points for Interviews:**
1. **What**: Components that run only on server, send serialized output (not JS)
2. **Why**: Reduce bundle size, direct backend access, faster TTI
3. **When**: Static content, heavy dependencies, server-side logic
4. **How**: Default in Next.js App Router, use "use client" for interactivity
5. **Composition**: Server Components wrap Client Components via props/children

---

## Question 2: How to use Server Components with Next.js App Router?

**Answer:**

Next.js 13+ App Router has **Server Components by default**—any component in the `app/` directory is a Server Component unless you add the `"use client"` directive. This is a fundamental shift from the Pages Router where everything was a Client Component that could be server-side rendered.

To use Server Components effectively in Next.js, you work within the `app/` directory structure where folders define routes and special files like `page.jsx`, `layout.jsx`, and `loading.jsx` control the UI. Server Components can be async functions, allowing you to fetch data directly using `await` without useEffect or client-side state management. You access server-side resources like databases, environment variables, and file systems directly—no API routes needed for data fetching.

When you need interactivity, you add `"use client"` at the top of the file to mark it as a Client Component. The boundary between Server and Client Components is important: Server Components can import and render Client Components, but Client Components cannot import Server Components directly. However, you can pass Server Components to Client Components as `children` or props, enabling powerful composition patterns.

Data fetching in Server Components uses standard `fetch()` with Next.js extensions for caching and revalidation. You can use `fetch(url, { cache: 'force-cache' })` for static data, `fetch(url, { cache: 'no-store' })` for dynamic data, or `fetch(url, { next: { revalidate: 60 } })` for Incremental Static Regeneration (ISR). Next.js automatically deduplicates fetch requests across Server Components in the same render pass.

Streaming and Suspense boundaries work seamlessly—you can wrap slow Server Components in `<Suspense>` to show fallback UI while data loads, and Next.js will stream the content to the client as it becomes available. This creates a progressive loading experience without any client-side JavaScript for the loading states.

---

### 🔍 Deep Dive

**Next.js App Router File Conventions:**

The App Router uses a file-system based routing with special file names:

```
app/
├── layout.jsx          # Root layout (wraps all pages)
├── page.jsx            # Home page (/)
├── loading.jsx         # Loading UI for page.jsx
├── error.jsx           # Error boundary for page.jsx
├── not-found.jsx       # 404 page
├── products/
│   ├── layout.jsx      # Products section layout
│   ├── page.jsx        # Products list (/products)
│   ├── loading.jsx     # Loading state for products
│   └── [id]/
│       ├── page.jsx    # Product detail (/products/123)
│       └── loading.jsx # Loading state for product detail
└── api/
    └── route.js        # API route (not a Server Component)
```

**All of these are Server Components by default** unless you add `"use client"`.

**Server Component Data Fetching Patterns:**

**Pattern 1: Async Server Components**

```jsx
// app/products/page.jsx - Server Component
export default async function ProductsPage() {
  // ✅ Direct async/await in component body
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // Cache for 1 hour
  }).then(r => r.json());

  return (
    <div>
      <h1>Products</h1>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// ✅ Direct database access in Server Component
import { prisma } from '@/lib/prisma';

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: { posts: true }
  });

  return <UserList users={users} />;
}
```

**Pattern 2: Parallel Data Fetching**

```jsx
// app/dashboard/page.jsx
async function getUser() {
  const res = await fetch('https://api.example.com/user');
  return res.json();
}

async function getStats() {
  const res = await fetch('https://api.example.com/stats');
  return res.json();
}

async function getPosts() {
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}

export default async function Dashboard() {
  // ✅ Parallel fetching using Promise.all
  const [user, stats, posts] = await Promise.all([
    getUser(),
    getStats(),
    getPosts()
  ]);

  return (
    <div>
      <UserInfo user={user} />
      <StatsWidget stats={stats} />
      <PostList posts={posts} />
    </div>
  );
}
```

**Pattern 3: Streaming with Suspense**

```jsx
// app/products/[id]/page.jsx
import { Suspense } from 'react';

async function Product({ id }) {
  // Fast: Product details
  const product = await fetch(`/api/products/${id}`).then(r => r.json());
  return <ProductDetails product={product} />;
}

async function Reviews({ productId }) {
  // Slow: Reviews might take time
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate slow query
  const reviews = await fetch(`/api/reviews/${productId}`).then(r => r.json());
  return <ReviewList reviews={reviews} />;
}

async function Recommendations({ productId }) {
  // Slow: ML recommendations
  const recs = await fetch(`/api/recommendations/${productId}`).then(r => r.json());
  return <RecommendationList items={recs} />;
}

export default function ProductPage({ params }) {
  return (
    <div>
      {/* Renders immediately */}
      <Suspense fallback={<ProductSkeleton />}>
        <Product id={params.id} />
      </Suspense>

      {/* Streams when ready */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={params.id} />
      </Suspense>

      {/* Streams when ready (parallel with Reviews) */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={params.id} />
      </Suspense>
    </div>
  );
}
```

**Fetch API Extensions in Next.js:**

Next.js extends the native `fetch()` API with caching and revalidation options:

```jsx
// Static Data Fetching (cached indefinitely)
const res = await fetch('https://api.example.com/data', {
  cache: 'force-cache' // Default behavior
});

// Dynamic Data Fetching (never cached)
const res = await fetch('https://api.example.com/data', {
  cache: 'no-store' // Fresh data every request
});

// Incremental Static Regeneration (revalidate after time)
const res = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 } // Revalidate every 60 seconds
});

// Tag-based Revalidation
const res = await fetch('https://api.example.com/data', {
  next: { tags: ['products'] } // Can revalidate by tag
});

// In API route or Server Action:
import { revalidateTag } from 'next/cache';
revalidateTag('products'); // Invalidates all fetches with this tag
```

**Request Deduplication:**

Next.js automatically deduplicates identical fetch requests in a single render pass:

```jsx
// utils/data.js
export async function getProduct(id) {
  console.log('Fetching product:', id);
  const res = await fetch(`/api/products/${id}`);
  return res.json();
}

// app/products/[id]/page.jsx
import { getProduct } from '@/utils/data';

async function ProductImage({ id }) {
  const product = await getProduct(id); // Call 1
  return <img src={product.image} />;
}

async function ProductTitle({ id }) {
  const product = await getProduct(id); // Call 2 (deduplicated!)
  return <h1>{product.name}</h1>;
}

async function ProductPrice({ id }) {
  const product = await getProduct(id); // Call 3 (deduplicated!)
  return <p>${product.price}</p>;
}

export default function ProductPage({ params }) {
  // Only ONE actual fetch happens despite three getProduct calls
  return (
    <div>
      <ProductImage id={params.id} />
      <ProductTitle id={params.id} />
      <ProductPrice id={params.id} />
    </div>
  );
}
```

Console output: `Fetching product: 123` (only once!)

**Client Component Integration:**

**Composition Pattern 1: Children Prop**

```jsx
// ClientTabs.jsx - Client Component
'use client';
import { useState } from 'react';

export default function ClientTabs({ children, tabs }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="tabs">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={activeTab === i ? 'active' : ''}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {/* Server Components rendered here */}
        {children[activeTab]}
      </div>
    </div>
  );
}

// app/dashboard/page.jsx - Server Component
import ClientTabs from '@/components/ClientTabs';

async function OverviewTab() {
  const data = await fetchOverview();
  return <div>{/* Server Component content */}</div>;
}

async function AnalyticsTab() {
  const data = await fetchAnalytics();
  return <div>{/* Server Component content */}</div>;
}

export default function Dashboard() {
  return (
    <ClientTabs tabs={['Overview', 'Analytics']}>
      {[<OverviewTab />, <AnalyticsTab />]}
    </ClientTabs>
  );
}
```

**Composition Pattern 2: Render Props**

```jsx
// ClientModal.jsx
'use client';
export default function ClientModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children} {/* Server Component as children */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// app/products/[id]/page.jsx
import ClientModal from '@/components/ClientModal';

async function ProductDetails({ id }) {
  const product = await fetchProduct(id);
  return <div>{product.description}</div>;
}

export default function ProductPage({ params, searchParams }) {
  const isModalOpen = searchParams.modal === 'true';

  return (
    <div>
      <h1>Product Page</h1>
      <ClientModal isOpen={isModalOpen} onClose={() => router.push('?modal=false')}>
        {/* Server Component rendered inside Client Component modal */}
        <ProductDetails id={params.id} />
      </ClientModal>
    </div>
  );
}
```

**Layouts and Templates:**

```jsx
// app/layout.jsx - Root Layout (Server Component)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Static parts stay Server Components */}
        <Header />

        {/* Dynamic navigation needs client-side routing */}
        <ClientNav />

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}

// app/products/layout.jsx - Nested Layout
export default async function ProductsLayout({ children }) {
  // Fetch data for sidebar (shared across all product pages)
  const categories = await fetchCategories();

  return (
    <div className="products-layout">
      <Sidebar categories={categories} />
      <div className="content">{children}</div>
    </div>
  );
}
```

**Loading and Error States:**

```jsx
// app/products/loading.jsx - Automatic loading state
export default function Loading() {
  return <ProductsSkeleton />;
}

// app/products/error.jsx - Error boundary (must be Client Component)
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

**Metadata API:**

```jsx
// app/products/[id]/page.jsx
import { Metadata } from 'next';

// Static metadata
export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our products'
};

// Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await fetchProduct(params.id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.id);
  return <ProductDetails product={product} />;
}
```

---

### 🐛 Real-World Scenario

**Scenario: Building a Blog Platform with Next.js App Router and Server Components**

**Context:**
A content publishing platform migrating from Next.js Pages Router to App Router with Server Components. Requirements:
- **10,000+ blog posts** with full-text search
- **Real-time commenting system** with optimistic updates
- **Personalized recommendations** based on reading history
- **Fast page loads** (<1s Time to Interactive)

**Initial Architecture (Pages Router - Before):**

```jsx
// pages/posts/[slug].jsx - Everything Client Component
import { useState, useEffect } from 'react';

export default function PostPage({ slug }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sequential waterfall fetching
    fetch(`/api/posts/${slug}`)
      .then(r => r.json())
      .then(postData => {
        setPost(postData);

        // Second request depends on first
        return fetch(`/api/comments/${postData.id}`);
      })
      .then(r => r.json())
      .then(setComments)
      .then(() => fetch(`/api/recommendations/${slug}`))
      .then(r => r.json())
      .then(setRecommendations)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Spinner />;

  return (
    <div>
      <Article post={post} />
      <CommentSection comments={comments} postId={post.id} />
      <Recommendations items={recommendations} />
    </div>
  );
}

// getServerSideProps alternative (still slower than RSC)
export async function getServerSideProps({ params }) {
  // Runs on server but sends full component bundle to client
  const post = await fetchPost(params.slug);
  const comments = await fetchComments(post.id);
  const recommendations = await fetchRecommendations(params.slug);

  return { props: { post, comments, recommendations } };
}
```

**Problems:**
1. **Bundle size**: 340 KB for markdown rendering library + syntax highlighting
2. **Client-side fetching**: Waterfall requests causing 2-3s delay
3. **getServerSideProps**: Blocks entire page until all data ready (no streaming)
4. **Hydration cost**: 1.8s to make page interactive

**Migrated Architecture (App Router - After):**

```jsx
// app/posts/[slug]/page.jsx - Server Component (default)
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ReactMarkdown from 'react-markdown'; // Stays on server!
import ClientCommentSection from './ClientCommentSection';

// ✅ Metadata for SEO (runs on server)
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.coverImage] }
  };
}

// ✅ Static params for static generation
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    select: { slug: true }
  });
  return posts.map(post => ({ slug: post.slug }));
}

// Data fetching functions with caching
async function getPost(slug) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true }
  });
  return post;
}

async function getComments(postId) {
  // Simulate slow query
  await new Promise(resolve => setTimeout(resolve, 1500));

  return prisma.comment.findMany({
    where: { postId },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });
}

async function getRecommendations(slug) {
  // ML-based recommendations (slow)
  await new Promise(resolve => setTimeout(resolve, 2000));

  return fetch(`${process.env.ML_API_URL}/recommendations/${slug}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  }).then(r => r.json());
}

// Main component
export default async function PostPage({ params }) {
  const post = await getPost(params.slug);

  if (!post) notFound();

  return (
    <article>
      {/* ✅ Server Component - markdown lib stays on server */}
      <header>
        <h1>{post.title}</h1>
        <AuthorBio author={post.author} />
        <time>{post.publishedAt}</time>
      </header>

      {/* ✅ Heavy markdown rendering on server (340 KB lib not sent to client) */}
      <div className="prose">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* ✅ Streaming: Show post immediately, load comments progressively */}
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments postId={post.id} />
      </Suspense>

      {/* ✅ Streaming: Recommendations load separately */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations slug={params.slug} />
      </Suspense>
    </article>
  );
}

// Server Component for comments (initial load)
async function Comments({ postId }) {
  const comments = await getComments(postId);

  return (
    <div>
      <h2>{comments.length} Comments</h2>
      {/* Client Component for interactivity */}
      <ClientCommentSection initialComments={comments} postId={postId} />
    </div>
  );
}

// Server Component for recommendations
async function Recommendations({ slug }) {
  const recommendations = await getRecommendations(slug);

  return (
    <aside>
      <h2>You Might Also Like</h2>
      <ul>
        {recommendations.map(rec => (
          <li key={rec.id}>
            <a href={`/posts/${rec.slug}`}>{rec.title}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

**Client Component for Interactive Comments:**

```jsx
// app/posts/[slug]/ClientCommentSection.jsx
'use client';
import { useState, useOptimistic } from 'react';

export default function ClientCommentSection({ initialComments, postId }) {
  const [comments, setComments] = useState(initialComments);
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment) => [...state, { ...newComment, pending: true }]
  );

  const handleSubmit = async (formData) => {
    const newComment = {
      id: Date.now(),
      text: formData.get('text'),
      user: { name: 'Current User' },
      createdAt: new Date()
    };

    // Optimistic update
    addOptimisticComment(newComment);

    // Server action
    const savedComment = await fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ postId, text: newComment.text })
    }).then(r => r.json());

    setComments([...comments, savedComment]);
  };

  return (
    <div>
      <ul>
        {optimisticComments.map(comment => (
          <li key={comment.id} className={comment.pending ? 'pending' : ''}>
            <strong>{comment.user.name}</strong>
            <p>{comment.text}</p>
            <time>{comment.createdAt.toLocaleString()}</time>
          </li>
        ))}
      </ul>

      <form action={handleSubmit}>
        <textarea name="text" required />
        <button type="submit">Post Comment</button>
      </form>
    </div>
  );
}
```

**Layout for Shared UI:**

```jsx
// app/posts/layout.jsx - Shared layout for all posts
export default async function PostsLayout({ children }) {
  // Fetch data once for all post pages
  const categories = await prisma.category.findMany();

  return (
    <div className="posts-layout">
      {/* Server Component sidebar */}
      <aside className="sidebar">
        <nav>
          <h3>Categories</h3>
          <ul>
            {categories.map(cat => (
              <li key={cat.id}>
                <a href={`/posts/category/${cat.slug}`}>{cat.name}</a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content area */}
      <main>{children}</main>
    </div>
  );
}
```

**Results:**

**Bundle Size:**
- **Before (Pages Router)**: 485 KB (React + markdown library + syntax highlighting + component code)
- **After (App Router)**: 48 KB (React runtime + ClientCommentSection only)
- **Reduction**: 90%

**Performance Metrics:**
- **Time to First Byte (TTFB)**: 180ms → 120ms (parallel data fetching)
- **First Contentful Paint (FCP)**: 1.8s → 0.7s
- **Largest Contentful Paint (LCP)**: 3.2s → 1.1s (post content visible immediately)
- **Time to Interactive (TTI)**: 4.1s → 0.9s (only comment form needs hydration)

**Streaming Behavior:**
1. **0-120ms**: Server starts rendering, fetches post data
2. **120ms**: Initial HTML with post content streams to client (Server Component)
3. **600ms**: User sees full article (LCP)
4. **900ms**: Comment form becomes interactive (TTI for ClientCommentSection)
5. **1,500ms**: Comments section streams in (Suspense boundary resolves)
6. **2,000ms**: Recommendations stream in (separate Suspense boundary)

**User Experience Improvements:**
- **Progressive loading**: Post visible in <1s while comments/recommendations load
- **No layout shift**: Suspense fallbacks prevent CLS
- **Instant interactivity**: Comment form ready in 0.9s (vs 4.1s before)
- **SEO perfect**: Full post content in initial HTML (no client-side rendering)

**Key Migration Insights:**

1. **Split concerns early**: Identify what needs interactivity (comments form) vs static content (article)
2. **Use Suspense generously**: Each slow data fetch should be in its own Suspense boundary
3. **Keep heavy libraries server-side**: Markdown rendering stayed on server (340 KB saved)
4. **Leverage parallel fetching**: Post, comments, and recommendations fetch in parallel
5. **Optimize for perceived performance**: Show article fast, stream secondary content later

---

### ⚖️ Trade-offs

**Server Components in Next.js App Router: When to Use vs Alternatives**

| Scenario | Server Components | Alternative | Winner |
|----------|------------------|-------------|---------|
| **Static content blog** | Perfect—zero JS bundle | getStaticProps in Pages Router | ✅ Server Components (smaller bundle) |
| **Dynamic dashboard** | Good for data fetching | Client-side SWR/React Query | ⚖️ Hybrid (Server for initial, client for updates) |
| **Real-time chat** | Poor—needs WebSocket | Client Component with WebSocket | ❌ Client Component |
| **Form with validation** | Server for submission | Client for instant feedback | ⚖️ Hybrid (client validation + server action) |
| **Heavy data tables** | Server for initial data | Client with virtualization | ⚖️ Depends on table size |

**Next.js App Router vs Pages Router:**

**App Router Advantages:**
```jsx
// ✅ App Router: Async components
export default async function Page() {
  const data = await fetch('/api/data').then(r => r.json());
  return <div>{data.title}</div>;
}

// ❌ Pages Router: Requires getServerSideProps
export default function Page({ data }) {
  return <div>{data.title}</div>;
}

export async function getServerSideProps() {
  const data = await fetch('/api/data').then(r => r.json());
  return { props: { data } };
}
```

**App Router**: 11 lines of code, zero client bundle for data fetching
**Pages Router**: 13 lines, full component in bundle even if static

**App Router Streaming:**
```jsx
// ✅ App Router: Progressive rendering
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>

// ❌ Pages Router: All-or-nothing rendering
// Either entire page loads or user sees nothing
```

**Pages Router Advantages:**

1. **Mature ecosystem**: More libraries support Pages Router patterns
2. **Simpler mental model**: Everything is a Client Component
3. **Easier debugging**: Client-side rendering is more familiar
4. **Incremental adoption**: Can mix with existing pages

**When to Avoid Server Components:**

**Scenario 1: Frequent Client-Side Updates**
```jsx
// ❌ Bad: Server Component for real-time data
export default async function LiveScores() {
  const scores = await fetchScores(); // Stale immediately
  return <ScoreBoard scores={scores} />;
}

// ✅ Good: Client Component with polling/WebSocket
'use client';
export default function LiveScores() {
  const { data: scores } = useSWR('/api/scores', {
    refreshInterval: 1000 // Poll every second
  });
  return <ScoreBoard scores={scores} />;
}
```

**Scenario 2: Complex Client-Side State**
```jsx
// ❌ Bad: Server Component can't handle this
export default async function MultiStepForm() {
  // Cannot use useState, useReducer, or form libraries
  return <FormWizard />; // Needs client state!
}

// ✅ Good: Client Component
'use client';
import { useForm } from 'react-hook-form';

export default function MultiStepForm() {
  const { register, handleSubmit, formState } = useForm();
  const [step, setStep] = useState(1);
  // Full form control
}
```

**Scenario 3: Browser-Specific APIs**
```jsx
// ❌ Bad: Server Component can't access browser APIs
export default async function GeolocationMap() {
  // navigator is undefined on server
  const position = navigator.geolocation.getCurrentPosition();
  return <Map position={position} />;
}

// ✅ Good: Client Component
'use client';
import { useEffect, useState } from 'react';

export default function GeolocationMap() {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      setPosition(pos.coords);
    });
  }, []);

  return <Map position={position} />;
}
```

**Hybrid Patterns:**

**Pattern 1: Server Component with Client Interactivity**
```jsx
// Server Component fetches data
export default async function ProductPage({ params }) {
  const product = await db.product.findUnique({ where: { id: params.id } });

  return (
    <div>
      {/* Static content (Server Component) */}
      <h1>{product.name}</h1>
      <img src={product.image} alt={product.name} />
      <p>{product.description}</p>

      {/* Interactive part (Client Component) */}
      <AddToCartButton productId={product.id} />
    </div>
  );
}
```

**Pattern 2: Client Component with Server Component Children**
```jsx
// Client wrapper for interactivity
'use client';
export default function Accordion({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {open && <div>{children}</div>}
    </div>
  );
}

// Server Component as content
// app/page.jsx
export default async function Page() {
  const content = await fetchContent();

  return (
    <Accordion>
      {/* Server Component passed as children */}
      <HeavyServerContent data={content} />
    </Accordion>
  );
}
```

**Caching Trade-offs:**

| Cache Strategy | Use Case | Freshness | CDN-able |
|---------------|----------|-----------|----------|
| `cache: 'force-cache'` | Static content (docs, blog) | Stale until revalidate | ✅ Yes |
| `cache: 'no-store'` | User-specific data | Always fresh | ❌ No |
| `revalidate: 60` | Product listings | Fresh every 60s | ✅ Yes |
| `tags: ['products']` | On-demand revalidation | Fresh on trigger | ✅ Yes |

**Example: Product Catalog Caching Strategy**

```jsx
// Static product list (changes rarely)
async function getProducts() {
  return fetch('/api/products', {
    next: { revalidate: 3600, tags: ['products'] } // 1 hour cache
  }).then(r => r.json());
}

// User's cart (user-specific, always fresh)
async function getUserCart(userId) {
  return fetch(`/api/cart/${userId}`, {
    cache: 'no-store' // Never cache
  }).then(r => r.json());
}

// Inventory (needs to be fresh, but can tolerate slight staleness)
async function getInventory(productId) {
  return fetch(`/api/inventory/${productId}`, {
    next: { revalidate: 10 } // 10 second cache
  }).then(r => r.json());
}
```

**Performance Comparison:**

**Test: Blog Post Page (2000 word article with markdown)**

**Setup:**
- Pages Router with getServerSideProps
- App Router with Server Components
- Pure client-side rendering (SPA)

**Results (4G connection, mobile device):**

| Metric | Pages Router | App Router (RSC) | Client SPA |
|--------|-------------|------------------|------------|
| **Bundle Size** | 340 KB | 18 KB | 380 KB |
| **TTFB** | 200ms | 120ms | 50ms |
| **FCP** | 1.8s | 0.8s | 2.3s |
| **LCP** | 2.9s | 1.2s | 3.8s |
| **TTI** | 3.1s | 1.0s | 4.2s |
| **Lighthouse** | 78 | 96 | 65 |

**Analysis:**
- **App Router wins** for content-heavy pages
- **Client SPA fastest TTFB** but worst overall (large bundle)
- **Pages Router middle ground** but no streaming benefit

---

### 💬 Explain to Junior

**The Restaurant Menu Analogy:**

Imagine you're building a restaurant menu system:

**Pages Router = Traditional Menu Book**
```jsx
// pages/menu.jsx
export default function Menu({ dishes }) {
  // Every customer gets a photocopier with the menu
  // They photocopy the menu themselves at their table
  return <div>{dishes.map(d => <Dish dish={d} />)}</div>;
}

export async function getServerSideProps() {
  // Chef prepares the ingredients list
  const dishes = await fetchDishes();
  // But customer still needs to "cook" the visual menu
  return { props: { dishes } };
}
```

**App Router with Server Components = Professional Menu Printing**
```jsx
// app/menu/page.jsx
export default async function Menu() {
  // Chef prepares the full menu (no photocopier needed)
  const dishes = await fetchDishes();

  // Customer receives beautifully printed menu
  // No work required on their end
  return <div>{dishes.map(d => <Dish dish={d} />)}</div>;
}
```

**Key Difference:**
- **Pages Router**: Customer gets ingredients + instructions to build menu themselves (JavaScript bundle)
- **App Router**: Customer gets finished printed menu (HTML from Server Components)

**When Do You Need Interactive Parts?**

```jsx
// app/menu/page.jsx - Server Component
export default async function Menu() {
  const dishes = await fetchDishes();

  return (
    <div>
      {/* 📄 Static menu - Server Component (no JS needed) */}
      {dishes.map(dish => (
        <div key={dish.id}>
          <h3>{dish.name}</h3>
          <p>{dish.description}</p>
          <p>${dish.price}</p>

          {/* 🎯 Interactive button - Client Component (needs JS) */}
          <OrderButton dishId={dish.id} />
        </div>
      ))}
    </div>
  );
}

// OrderButton.jsx
'use client'; // This part needs to be interactive

export default function OrderButton({ dishId }) {
  const [ordered, setOrdered] = useState(false);

  return (
    <button onClick={() => setOrdered(true)}>
      {ordered ? 'Ordered!' : 'Order Now'}
    </button>
  );
}
```

**Real Example: Blog Post Page**

Let's build a blog post page step by step:

**Step 1: Create the file structure**
```
app/
└── posts/
    └── [slug]/
        ├── page.jsx          # Main page (Server Component)
        └── CommentForm.jsx   # Interactive form (Client Component)
```

**Step 2: Main page (Server Component - default)**
```jsx
// app/posts/[slug]/page.jsx
// No 'use client' = Server Component by default!

export default async function PostPage({ params }) {
  // ✅ Can use async/await directly in component
  const post = await fetch(`https://api.example.com/posts/${params.slug}`)
    .then(r => r.json());

  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author}</p>

      {/* Static content - no JavaScript needed */}
      <div dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* Import Client Component for comments */}
      <CommentForm postId={post.id} />
    </article>
  );
}
```

**Step 3: Comment form (Client Component - interactive)**
```jsx
// app/posts/[slug]/CommentForm.jsx
'use client'; // This directive makes it a Client Component!

import { useState } from 'react';

export default function CommentForm({ postId }) {
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ postId, comment })
    });

    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <button type="submit">Submit</button>
      {submitted && <p>Comment submitted!</p>}
    </form>
  );
}
```

**What Gets Sent to Browser?**

**Server Component (PostPage):**
- HTML: `<article><h1>Post Title</h1>...</article>`
- JavaScript: **0 KB** (stays on server!)

**Client Component (CommentForm):**
- HTML: `<form>...</form>` (from SSR)
- JavaScript: ~8 KB (React + form logic)

**Total bundle**: 15 KB (React runtime) + 8 KB (CommentForm) = **23 KB**

Compare to traditional approach:
- All React components + dependencies: **180 KB+**

**Streaming with Suspense:**

Think of it like a restaurant serving courses:

```jsx
// app/products/[id]/page.jsx
import { Suspense } from 'react';

export default async function ProductPage({ params }) {
  return (
    <div>
      {/* Course 1: Arrives immediately */}
      <Suspense fallback={<p>Loading product...</p>}>
        <ProductDetails id={params.id} />
      </Suspense>

      {/* Course 2: Arrives when ready (separate from Course 1) */}
      <Suspense fallback={<p>Loading reviews...</p>}>
        <ProductReviews id={params.id} />
      </Suspense>

      {/* Course 3: Arrives when ready (separate from Courses 1 & 2) */}
      <Suspense fallback={<p>Loading recommendations...</p>}>
        <Recommendations id={params.id} />
      </Suspense>
    </div>
  );
}

// Each component fetches independently
async function ProductDetails({ id }) {
  const product = await fetch(`/api/products/${id}`).then(r => r.json());
  return <div>{product.name}</div>;
}

async function ProductReviews({ id }) {
  // Slow query (2 seconds)
  const reviews = await fetch(`/api/reviews/${id}`).then(r => r.json());
  return <ul>{reviews.map(r => <li>{r.text}</li>)}</ul>;
}

async function Recommendations({ id }) {
  // Very slow query (3 seconds)
  const recs = await fetch(`/api/recommendations/${id}`).then(r => r.json());
  return <ul>{recs.map(r => <li>{r.title}</li>)}</ul>;
}
```

**Timeline:**
- **0.5s**: User sees "Loading product..."
- **0.8s**: Product details appear, "Loading reviews..." and "Loading recommendations..." visible
- **2.8s**: Reviews appear
- **3.8s**: Recommendations appear

Without streaming, user waits **3.8s** to see anything!

**Interview Answer Template:**

> "Next.js App Router has Server Components by default—any component in the `app/` directory is a Server Component unless I add `'use client'`. Server Components can be async functions, so I can fetch data directly using `await` without useEffect or getServerSideProps.
>
> The key benefit is **zero bundle size for server-side logic**. For example, if I'm building a blog post page, the markdown rendering library (300+ KB) stays on the server. Only the interactive parts like the comment form need to be Client Components with `'use client'`.
>
> I use Suspense boundaries to enable streaming—the fast parts of the page (like the article title) render immediately while slower parts (like comments) stream in progressively. This gives users a much better perceived performance.
>
> For composition, I pass Server Components to Client Components via props or children. For instance, a Client Component accordion can receive Server Component content as children, keeping the heavy data fetching on the server while maintaining interactivity.
>
> In a recent project, we migrated a product page from Pages Router to App Router with Server Components. Bundle size dropped from 485 KB to 48 KB (90% reduction), and Time to Interactive improved from 4.1s to 0.9s because only the 'Add to Cart' button needed client-side JavaScript."

**Common Mistakes to Avoid:**

```jsx
// ❌ MISTAKE 1: Adding 'use client' to everything
'use client';
export default function Page() {
  // This doesn't need client-side JS!
  return <div>Static content</div>;
}

// ✅ CORRECT: Let it be Server Component
export default function Page() {
  return <div>Static content</div>;
}

// ❌ MISTAKE 2: Trying to use hooks in Server Component
export default async function Page() {
  const [state, setState] = useState(0); // Error!
  return <div>{state}</div>;
}

// ✅ CORRECT: Move stateful logic to Client Component
'use client';
export default function Counter() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}

// ❌ MISTAKE 3: Importing Server Component into Client Component
// ClientComponent.jsx
'use client';
import ServerComponent from './ServerComponent'; // Error!

// ✅ CORRECT: Pass as children
// app/page.jsx (Server Component)
import ClientComponent from './ClientComponent';
import ServerComponent from './ServerComponent';

export default function Page() {
  return (
    <ClientComponent>
      <ServerComponent /> {/* Passed as children */}
    </ClientComponent>
  );
}
```

**Quick Reference:**

| Task | Use Server Component | Use Client Component |
|------|---------------------|---------------------|
| Fetch data from API | ✅ Yes | ❌ Use Server Component instead |
| Fetch from database | ✅ Yes | ❌ Impossible (no DB access) |
| Render markdown | ✅ Yes | ⚠️ Only if library supports client |
| Handle form input | ❌ No state/events | ✅ Yes |
| Use localStorage | ❌ No browser APIs | ✅ Yes |
| Use useState/useEffect | ❌ No hooks | ✅ Yes |
| Heavy computations | ✅ Yes (stays on server) | ⚠️ Blocks main thread |
| Real-time updates | ❌ No WebSocket | ✅ Yes |
