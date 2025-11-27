# React Router - Data Loaders and Actions

## Question 1: What are data loaders and actions in React Router v6.4+?

**Answer:**

Data loaders and actions are React Router v6.4+'s integrated solution for data fetching and mutations, introduced to simplify the common pattern of fetching data in components after navigation. **Loaders** are functions that run before a route renders, fetching data needed for that route and making it available to components via the useLoaderData hook. **Actions** are functions that handle form submissions and mutations, running when forms are submitted to a route and automatically revalidating loaders after completion.

This architecture enables several key benefits: data is fetched in parallel with navigation (not after), loading states are automatic via useNavigation hook, errors are caught declaratively with errorElement, and form submissions trigger automatic revalidation. Loaders receive route parameters and request information, enabling dynamic data fetching based on the URL. Actions receive FormData from submitted forms, process mutations, and can return redirects or data.

The loader/action pattern shifts data fetching from components to the routing layer, similar to Next.js getServerSideProps but client-side. This creates a cleaner separation of concerns: routes define what data they need, components consume that data, and React Router handles loading states and error boundaries. The useNavigation hook provides global navigation state (idle, loading, submitting), enabling optimistic UI and loading indicators.

Advanced features include deferred data loading with defer() for streaming non-critical data, navigation blocking with useBlocker, and automatic race condition handling. Loaders and actions integrate with the router's navigation lifecycle, making them ideal for applications with complex data requirements and form-heavy interfaces, though they require using createBrowserRouter instead of BrowserRouter.

---

### 🔍 Deep Dive: Loader and Action Internals

**Router Creation with Data APIs:**

React Router v6.4+ requires createBrowserRouter instead of BrowserRouter to enable loaders and actions:

```javascript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// ❌ Old way (no loaders/actions)
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/users/:id" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

// ✅ New way (with loaders/actions)
const router = createBrowserRouter([
  {
    path: '/users/:id',
    element: <UserProfile />,
    loader: async ({ params }) => {
      const user = await fetchUser(params.id);
      return { user };
    },
    action: async ({ request, params }) => {
      const formData = await request.formData();
      await updateUser(params.id, formData);
      return redirect(`/users/${params.id}`);
    },
    errorElement: <ErrorBoundary />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
```

**Loader Function Architecture:**

Loaders run before navigation completes, receiving route context:

```javascript
// Loader function signature
async function loader({ params, request }) {
  // params: Dynamic route parameters (:id, :slug, etc.)
  // request: Web Request object with URL, headers, etc.

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  return {
    data: await fetchData(params.id),
    filters: Object.fromEntries(searchParams),
  };
}

// Complete example with all features
const userLoader = async ({ params, request }) => {
  const { userId } = params;
  const url = new URL(request.url);
  const tab = url.searchParams.get('tab') || 'overview';

  try {
    // Fetch multiple resources in parallel
    const [user, posts, comments] = await Promise.all([
      fetchUser(userId),
      fetchUserPosts(userId),
      fetchUserComments(userId),
    ]);

    return {
      user,
      posts,
      comments,
      activeTab: tab,
    };
  } catch (error) {
    // Throw to trigger errorElement
    throw new Response('User not found', { status: 404 });
  }
};

// Route configuration
{
  path: '/users/:userId',
  element: <UserProfile />,
  loader: userLoader,
  errorElement: <ErrorPage />,
}

// Component accessing loader data
function UserProfile() {
  // Data from loader is available immediately
  const { user, posts, comments, activeTab } = useLoaderData();

  return (
    <div>
      <h1>{user.name}</h1>
      <Tabs active={activeTab}>
        <PostList posts={posts} />
        <CommentList comments={comments} />
      </Tabs>
    </div>
  );
}
```

**Action Function Architecture:**

Actions handle mutations (POST, PUT, DELETE) and form submissions:

```javascript
// Action function signature
async function action({ request, params }) {
  const formData = await request.formData();
  const intent = formData.get('intent'); // Multiple actions per route

  if (intent === 'delete') {
    await deleteUser(params.userId);
    return redirect('/users');
  }

  if (intent === 'update') {
    const updates = Object.fromEntries(formData);
    await updateUser(params.userId, updates);
    return { success: true };
  }
}

// Complete example with validation
const userAction = async ({ request, params }) => {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'update-profile') {
    const name = formData.get('name');
    const email = formData.get('email');

    // Validation
    const errors = {};
    if (!name || name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!email || !email.includes('@')) {
      errors.email = 'Valid email required';
    }

    if (Object.keys(errors).length > 0) {
      return { errors }; // Return errors to form
    }

    try {
      await updateUser(params.userId, { name, email });
      return redirect(`/users/${params.userId}`);
    } catch (error) {
      return { errors: { _form: error.message } };
    }
  }

  if (intent === 'delete-account') {
    await deleteUser(params.userId);
    return redirect('/');
  }

  return null;
};

// Form component using action
function UserEditForm() {
  const actionData = useActionData(); // Get action response
  const navigation = useNavigation(); // Get submission state

  const isSubmitting = navigation.state === 'submitting';

  return (
    <Form method="post">
      <input
        name="name"
        defaultValue={user.name}
        disabled={isSubmitting}
      />
      {actionData?.errors?.name && (
        <span className="error">{actionData.errors.name}</span>
      )}

      <input
        name="email"
        defaultValue={user.email}
        disabled={isSubmitting}
      />
      {actionData?.errors?.email && (
        <span className="error">{actionData.errors.email}</span>
      )}

      <button
        type="submit"
        name="intent"
        value="update-profile"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </Form>
  );
}
```

**Deferred Data Loading:**

Defer enables streaming non-critical data:

```javascript
import { defer, Await } from 'react-router-dom';
import { Suspense } from 'react';

// Loader with deferred data
const productLoader = async ({ params }) => {
  // Critical data: wait for it
  const product = await fetchProduct(params.id);

  // Non-critical data: don't wait (defer)
  const reviewsPromise = fetchReviews(params.id);
  const recommendationsPromise = fetchRecommendations(params.id);

  return defer({
    product,                          // Available immediately
    reviews: reviewsPromise,          // Streamed later
    recommendations: recommendationsPromise, // Streamed later
  });
};

// Component consuming deferred data
function ProductPage() {
  const { product, reviews, recommendations } = useLoaderData();

  return (
    <div>
      {/* Show immediately */}
      <ProductDetails product={product} />

      {/* Stream when ready */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Await resolve={reviews}>
          {(loadedReviews) => <Reviews reviews={loadedReviews} />}
        </Await>
      </Suspense>

      <Suspense fallback={<RecommendationsSkeleton />}>
        <Await resolve={recommendations}>
          {(loadedRecs) => <Recommendations items={loadedRecs} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

**Navigation State Management:**

useNavigation provides global navigation state:

```javascript
function GlobalLoadingBar() {
  const navigation = useNavigation();

  // navigation.state: "idle" | "loading" | "submitting"
  // navigation.location: Next location being navigated to
  // navigation.formData: Form data being submitted

  return (
    <div>
      {navigation.state === 'loading' && (
        <div className="loading-bar">Loading...</div>
      )}

      {navigation.state === 'submitting' && (
        <div className="loading-bar">Saving...</div>
      )}
    </div>
  );
}

// Optimistic UI example
function TodoList() {
  const { todos } = useLoaderData();
  const navigation = useNavigation();

  // Get optimistic todo from pending submission
  const optimisticTodo = navigation.formData?.get('title');

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}

      {/* Show optimistic item while submitting */}
      {optimisticTodo && (
        <TodoItem
          todo={{ title: optimisticTodo, id: 'temp' }}
          pending
        />
      )}
    </ul>
  );
}
```

**Revalidation Strategy:**

Loaders automatically revalidate after actions:

```javascript
// Automatic revalidation flow:
// 1. User submits form → action runs
// 2. Action completes → all active loaders revalidate
// 3. Fresh data → components re-render

// Control revalidation with shouldRevalidate
const route = {
  path: '/users',
  loader: usersLoader,
  shouldRevalidate: ({ currentUrl, nextUrl, defaultShouldRevalidate }) => {
    // Only revalidate if URL changed
    return currentUrl.pathname !== nextUrl.pathname;

    // Or use default behavior
    return defaultShouldRevalidate;
  },
};

// Manual revalidation
function RefreshButton() {
  const revalidator = useRevalidator();

  return (
    <button onClick={() => revalidator.revalidate()}>
      {revalidator.state === 'loading' ? 'Refreshing...' : 'Refresh'}
    </button>
  );
}
```

**Error Handling:**

errorElement catches loader/action errors:

```javascript
// Route configuration with error boundary
{
  path: '/users/:userId',
  element: <UserProfile />,
  loader: userLoader,
  errorElement: <ErrorPage />,
  children: [
    {
      path: 'posts',
      element: <UserPosts />,
      loader: postsLoader,
      // Inherits parent errorElement
    },
  ],
}

// Error component
function ErrorPage() {
  const error = useRouteError();

  if (error.status === 404) {
    return <h1>User not found</h1>;
  }

  if (error.status === 403) {
    return <h1>Access denied</h1>;
  }

  return <h1>Something went wrong: {error.message}</h1>;
}

// Throwing errors in loaders
const userLoader = async ({ params }) => {
  const user = await fetchUser(params.userId);

  if (!user) {
    throw new Response('Not Found', { status: 404 });
  }

  return { user };
};
```

This architecture provides a robust, declarative way to handle data fetching, mutations, and error states at the routing level.

---

### 🐛 Real-World Scenario: Loader Race Conditions and Stale Data

**Scenario:** E-commerce dashboard with loaders for product data. Issues reported: (1) Stale data shown after quick navigation, (2) Loading spinner never disappears on slow connections, (3) Form submissions don't update UI immediately, (4) Race conditions when filtering/sorting rapidly.

**Metrics:**
- Stale data displays: ~15% of navigations
- Infinite loading states: ~5% of slow connections
- UI update delays after mutations: ~800ms average
- Race condition data mismatches: ~10% of rapid filter changes

**Investigation:**

```javascript
// ❌ PROBLEMATIC CODE: Multiple loader/action issues

// Issue 1: Not handling loader errors
const productLoader = async ({ params }) => {
  const product = await fetchProduct(params.id);
  return { product }; // Throws unhandled error if fetch fails!
};

// Issue 2: Race conditions - no request cancellation
const productsLoader = async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get('search');

  // If user types fast, multiple requests in flight
  // Last request to finish wins (not necessarily last request sent!)
  const products = await searchProducts(search);
  return { products };
};

// Issue 3: No loading state handling
function ProductList() {
  const { products } = useLoaderData();

  // No spinner during navigation
  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}

// Issue 4: Action doesn't return proper response
const createProductAction = async ({ request }) => {
  const formData = await request.formData();
  await createProduct(Object.fromEntries(formData));
  // Missing redirect or return - UI doesn't update!
};

// Issue 5: Not preventing duplicate submissions
function ProductForm() {
  return (
    <Form method="post">
      <input name="name" />
      <button type="submit">Create</button>
      {/* Button enabled during submission - can double-submit! */}
    </Form>
  );
}

// Issue 6: Deferred data without error handling
const dashboardLoader = async () => {
  return defer({
    criticalData: fetchCritical(),
    slowData: fetchSlow(), // If this rejects, crashes app!
  });
};
```

**Debugging Steps:**

```javascript
// Step 1: Add loader timing instrumentation
const instrumentedLoader = async (loaderFn) => {
  return async (args) => {
    const start = performance.now();
    console.log('Loader started:', args.request.url);

    try {
      const result = await loaderFn(args);
      const duration = performance.now() - start;
      console.log('Loader completed in', duration, 'ms');
      return result;
    } catch (error) {
      console.error('Loader failed:', error);
      throw error;
    }
  };
};

// Step 2: Track concurrent requests
const requestTracker = new Map();

const trackedLoader = async ({ request }) => {
  const url = request.url;
  const requestId = Date.now();

  console.log('Request started:', requestId, url);
  requestTracker.set(url, requestId);

  const data = await fetchData(url);

  // Check if this is still the latest request
  if (requestTracker.get(url) !== requestId) {
    console.warn('Stale request ignored:', requestId);
    throw new Error('Request cancelled');
  }

  return data;
};

// Step 3: Monitor navigation states
function NavigationMonitor() {
  const navigation = useNavigation();

  useEffect(() => {
    console.log('Navigation state:', {
      state: navigation.state,
      location: navigation.location?.pathname,
      formData: navigation.formData && Object.fromEntries(navigation.formData),
    });
  }, [navigation]);

  return null;
}
```

**Solution:**

```javascript
// ✅ FIXED: Proper loader/action implementation

// Fix 1: Comprehensive error handling in loaders
const productLoader = async ({ params }) => {
  try {
    const product = await fetchProduct(params.id);

    if (!product) {
      throw new Response('Product not found', {
        status: 404,
        statusText: 'Not Found',
      });
    }

    return { product };
  } catch (error) {
    if (error instanceof Response) throw error;

    console.error('Loader error:', error);
    throw new Response('Failed to load product', {
      status: 500,
      statusText: error.message,
    });
  }
};

// Fix 2: Request cancellation with AbortController
const productsLoader = async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';

  // Create abort controller for this request
  const controller = new AbortController();

  try {
    const products = await searchProducts(search, {
      signal: controller.signal,
    });

    return { products, search };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request cancelled');
      return { products: [], search };
    }
    throw error;
  }
};

// Fetch implementation with abort signal
async function searchProducts(query, { signal }) {
  const response = await fetch(`/api/products?q=${query}`, { signal });
  return response.json();
}

// Fix 3: Loading and error states
function ProductList() {
  const { products } = useLoaderData();
  const navigation = useNavigation();

  const isLoading = navigation.state === 'loading';

  return (
    <div>
      {isLoading && <LoadingSpinner overlay />}

      <ul className={isLoading ? 'dimmed' : ''}>
        {products.length === 0 ? (
          <li>No products found</li>
        ) : (
          products.map(p => <ProductItem key={p.id} product={p} />)
        )}
      </ul>
    </div>
  );
}

// Error boundary for loader errors
function ProductErrorBoundary() {
  const error = useRouteError();

  if (error.status === 404) {
    return (
      <div className="error-page">
        <h1>Product Not Found</h1>
        <Link to="/products">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="error-page">
      <h1>Error Loading Product</h1>
      <p>{error.statusText || error.message}</p>
      <button onClick={() => window.location.reload()}>
        Try Again
      </button>
    </div>
  );
}

// Fix 4: Proper action responses
const createProductAction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const productData = Object.fromEntries(formData);

    // Validate
    if (!productData.name || !productData.price) {
      return {
        errors: {
          name: !productData.name ? 'Name required' : null,
          price: !productData.price ? 'Price required' : null,
        },
      };
    }

    const newProduct = await createProduct(productData);

    // Redirect to new product (triggers loader revalidation)
    return redirect(`/products/${newProduct.id}`);
  } catch (error) {
    return {
      errors: { _form: error.message },
    };
  }
};

// Fix 5: Prevent duplicate submissions
function ProductForm() {
  const navigation = useNavigation();
  const actionData = useActionData();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <Form method="post">
      {actionData?.errors?._form && (
        <div className="error">{actionData.errors._form}</div>
      )}

      <div>
        <input
          name="name"
          disabled={isSubmitting}
          aria-invalid={!!actionData?.errors?.name}
        />
        {actionData?.errors?.name && (
          <span className="error">{actionData.errors.name}</span>
        )}
      </div>

      <div>
        <input
          name="price"
          type="number"
          disabled={isSubmitting}
          aria-invalid={!!actionData?.errors?.price}
        />
        {actionData?.errors?.price && (
          <span className="error">{actionData.errors.price}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Product'}
      </button>
    </Form>
  );
}

// Fix 6: Deferred data with error boundaries
const dashboardLoader = async () => {
  // Critical data - wait for it
  const criticalData = await fetchCritical();

  // Deferred data - handle errors gracefully
  const slowData = fetchSlow().catch(error => {
    console.error('Slow data failed:', error);
    return null; // Fallback value
  });

  return defer({
    criticalData,
    slowData,
  });
};

function Dashboard() {
  const { criticalData, slowData } = useLoaderData();

  return (
    <div>
      <CriticalSection data={criticalData} />

      <Suspense fallback={<SlowDataSkeleton />}>
        <Await
          resolve={slowData}
          errorElement={<div>Failed to load optional data</div>}
        >
          {(data) => data ? <SlowDataSection data={data} /> : null}
        </Await>
      </Suspense>
    </div>
  );
}

// Fix 7: Optimistic UI for better UX
function TodoList() {
  const { todos } = useLoaderData();
  const navigation = useNavigation();

  // Get optimistic data from pending submission
  const optimisticTodo = navigation.formData
    ? {
        id: 'temp-' + Date.now(),
        title: navigation.formData.get('title'),
        completed: false,
        pending: true,
      }
    : null;

  const displayTodos = optimisticTodo
    ? [optimisticTodo, ...todos]
    : todos;

  return (
    <ul>
      {displayTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          dimmed={todo.pending}
        />
      ))}
    </ul>
  );
}
```

**Results After Fix:**
- Stale data displays: 15% → 0.2%
- Loading state reliability: 95% → 100%
- UI update latency: 800ms → 50ms (optimistic UI)
- Race condition errors: 10% → 0%

**Key Takeaways:**
1. Always handle loader errors with try/catch and throw Response objects
2. Use AbortController to cancel stale requests
3. Leverage useNavigation for loading states
4. Return redirect() or data from actions, never undefined
5. Disable form submissions during submission
6. Handle deferred data errors gracefully
7. Implement optimistic UI for instant feedback

---

### ⚖️ Trade-offs: Loader Patterns and Data Fetching Strategies

**Loaders vs Component Data Fetching:**

| Aspect | Loaders (v6.4+) | Component Hooks (useEffect) | When to Choose |
|--------|-----------------|----------------------------|----------------|
| **Fetch Timing** | Before navigation | After component mounts | Loaders for critical data |
| **Loading State** | Automatic (useNavigation) | Manual (useState) | Loaders for simpler code |
| **Error Handling** | Declarative (errorElement) | Manual (try/catch) | Loaders for consistency |
| **Code Colocation** | Route configuration | Component logic | Hooks for component-specific |
| **Parallel Fetching** | Automatic | Manual Promise.all | Loaders for route data |
| **SSR Compatible** | With Remix | No | Loaders if planning SSR |

```javascript
// ✅ Loader approach (route-level data)
const userLoader = async ({ params }) => {
  const user = await fetchUser(params.id);
  return { user };
};

<Route path="/users/:id" element={<User />} loader={userLoader} />

function User() {
  const { user } = useLoaderData(); // Data ready immediately
  return <div>{user.name}</div>;
}

// Pros: Data ready before render, automatic loading, error boundaries
// Cons: Router-specific, requires v6.4+, less flexible

// ✅ Component fetch (component-level data)
function User() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(id).then(setUser).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  return <div>{user.name}</div>;
}

// Pros: Flexible, works anywhere, familiar pattern
// Cons: Manual loading state, fetch after render, no error boundary
```

**Deferred vs Await All Data:**

```javascript
// ✅ Defer (stream non-critical data)
const productLoader = async ({ params }) => {
  const product = await fetchProduct(params.id); // Critical - wait

  return defer({
    product,
    reviews: fetchReviews(params.id), // Non-critical - stream
    recommendations: fetchRecs(params.id),
  });
};

function Product() {
  const { product, reviews, recommendations } = useLoaderData();

  return (
    <div>
      <ProductInfo product={product} /> {/* Shows immediately */}

      <Suspense fallback={<Skeleton />}>
        <Await resolve={reviews}>
          {(data) => <Reviews data={data} />}
        </Await>
      </Suspense>
    </div>
  );
}

// Pros: Faster initial render, progressive enhancement
// Cons: More complex, waterfall effect possible

// ✅ Await all (wait for everything)
const productLoader = async ({ params }) => {
  const [product, reviews, recommendations] = await Promise.all([
    fetchProduct(params.id),
    fetchReviews(params.id),
    fetchRecs(params.id),
  ]);

  return { product, reviews, recommendations };
};

// Pros: Simpler code, all data ready together
// Cons: Slower navigation, blocked by slowest request
```

**Form vs useFetcher for Mutations:**

```javascript
// ✅ Form (causes navigation)
function EditProduct() {
  return (
    <Form method="post" action="/products/123">
      <input name="name" />
      <button type="submit">Save</button>
    </Form>
  );
}

// After submission → navigates → loader runs → page updates
// Pros: Simple, automatic revalidation, works without JS
// Cons: Navigation required, page-level mutation

// ✅ useFetcher (no navigation)
function EditProduct() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action="/products/123">
      <input name="name" />
      <button type="submit" disabled={fetcher.state === 'submitting'}>
        {fetcher.state === 'submitting' ? 'Saving...' : 'Save'}
      </button>
    </fetcher.Form>
  );
}

// After submission → stays on page → relevant loaders revalidate
// Pros: No navigation, component-level mutation, multiple per page
// Cons: More complex, requires JS
```

**Client-Side Loaders vs Server Components (Next.js):**

```javascript
// ✅ React Router Loader (client-side)
const postLoader = async ({ params }) => {
  const post = await fetch(`/api/posts/${params.id}`).then(r => r.json());
  return { post };
};

// Runs in browser, requires API endpoint
// Pros: Works with any backend, simple deployment
// Cons: Extra network hop, no server-side rendering

// ✅ Next.js Server Component (server-side)
async function Post({ params }) {
  const post = await db.posts.findOne(params.id);
  return <article>{post.content}</article>;
}

// Runs on server, direct database access
// Pros: No API needed, better performance, SEO
// Cons: Requires Node server, more complex deployment
```

**Loader Revalidation Strategies:**

```javascript
// ✅ Automatic (default - revalidate after all actions)
{
  path: '/products',
  loader: productsLoader,
  // Revalidates after any action in the app
}

// Pros: Always fresh data
// Cons: Unnecessary fetches

// ✅ Manual control (shouldRevalidate)
{
  path: '/products',
  loader: productsLoader,
  shouldRevalidate: ({ currentUrl, nextUrl, formAction }) => {
    // Only revalidate if URL changed or form submitted to products
    return currentUrl.pathname !== nextUrl.pathname ||
           formAction?.includes('/products');
  },
}

// Pros: Optimized fetching, less network usage
// Cons: More complex, risk of stale data

// ✅ Manual trigger (useRevalidator)
function RefreshButton() {
  const revalidator = useRevalidator();

  return (
    <button onClick={() => revalidator.revalidate()}>
      Refresh
    </button>
  );
}

// Pros: User control, explicit
// Cons: Manual, user must know to refresh
```

**Error Handling Strategies:**

```javascript
// ✅ Route-level error boundary
{
  path: '/users/:id',
  loader: userLoader,
  errorElement: <UserError />,
}

// Catches all errors in loader and component
// Pros: Declarative, catches all errors, isolated
// Cons: Coarse-grained, entire route replaced

// ✅ Component-level try/catch
async function userLoader({ params }) {
  try {
    const user = await fetchUser(params.id);
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
}

function User() {
  const { user, error } = useLoaderData();

  if (error) return <div>Error: {error}</div>;
  return <div>{user.name}</div>;
}

// Pros: Fine-grained control, partial rendering
// Cons: Manual handling, not automatic
```

**Decision Matrix:**

Choose **Loaders** when:
- Data is route-specific
- Want automatic loading states
- Need error boundaries
- Building with React Router v6.4+

Choose **useEffect** when:
- Data is component-specific
- Need fine-grained control
- Supporting older React Router
- Component-level mutations

Choose **defer()** when:
- Have slow, non-critical data
- Want progressive enhancement
- Optimizing perceived performance

Choose **Promise.all** when:
- All data equally important
- Simpler code preferred
- Acceptable to wait for slowest

Choose **Form** when:
- Page-level mutations
- Want navigation after submit
- Need progressive enhancement

Choose **useFetcher** when:
- Component-level mutations
- Stay on same page
- Multiple mutations per page

---

### 💬 Explain to Junior: Understanding Loaders and Actions

**Simple Analogy:**

Think of loaders and actions like a **restaurant ordering system**:

1. **Loader** = Kitchen preparing your meal BEFORE you sit down at the table
   - You don't wait at the table staring at an empty plate
   - Food arrives as soon as you sit down

2. **Action** = Placing an order (form submission)
   - Waiter takes your order to the kitchen
   - Kitchen makes the food
   - Fresh menu appears after your order completes

3. **useLoaderData** = The plate of food delivered to your table

4. **useActionData** = Response from kitchen (order confirmation or error)

5. **useNavigation** = Knowing if your food is being prepared or delivered

Traditional component fetching is like sitting down first, THEN ordering, THEN waiting at the table watching the kitchen. Loaders start cooking before you sit down!

**Basic Implementation Walkthrough:**

```javascript
// Step 1: Create a loader function
// This runs BEFORE the page loads
async function userLoader({ params }) {
  // params.id comes from :id in the route
  const response = await fetch(`/api/users/${params.id}`);
  const user = await response.json();
  return { user }; // This data goes to the component
}

// Step 2: Create an action function (for forms)
// This runs when a form is submitted
async function userAction({ request, params }) {
  const formData = await request.formData();
  const name = formData.get('name');

  await fetch(`/api/users/${params.id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });

  return redirect(`/users/${params.id}`); // Go back to user page
}

// Step 3: Add loader and action to route
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/users/:id',
    element: <UserProfile />,
    loader: userLoader,      // Runs before page loads
    action: userAction,      // Runs on form submit
    errorElement: <ErrorPage />, // Shows if loader/action fails
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

// Step 4: Use data in your component
function UserProfile() {
  // Get data from loader
  const { user } = useLoaderData();

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>

      {/* Form submits to the action */}
      <Form method="post">
        <input name="name" defaultValue={user.name} />
        <button type="submit">Update</button>
      </Form>
    </div>
  );
}
```

**Common Interview Questions & Answers:**

**Q: What are loaders in React Router v6.4+?**

**A:** "Loaders are functions that fetch data before a route renders. Instead of showing a component and then fetching data inside it, loaders fetch the data first, so when the component appears, the data is already there. You access the data using useLoaderData hook. Loaders receive route params and request info, making them perfect for route-level data fetching."

```javascript
// Loader runs first, then component renders with data ready
const loader = async ({ params }) => {
  const product = await fetchProduct(params.id);
  return { product };
};

<Route path="/products/:id" element={<Product />} loader={loader} />

function Product() {
  const { product } = useLoaderData(); // Data already loaded!
  return <h1>{product.name}</h1>;
}
```

**Q: What are actions and when do you use them?**

**A:** "Actions handle form submissions and mutations. When you submit a Form component, React Router calls the action function for that route. Actions receive the form data, process it (like creating or updating a record), and can return a redirect or validation errors. After an action completes, React Router automatically reloads loaders to get fresh data."

```javascript
const action = async ({ request }) => {
  const formData = await request.formData();
  const title = formData.get('title');

  await createPost({ title });
  return redirect('/posts'); // Go to posts list
};

<Route path="/posts/new" element={<NewPost />} action={action} />

function NewPost() {
  return (
    <Form method="post">
      <input name="title" />
      <button type="submit">Create</button>
    </Form>
  );
}
```

**Q: How do you show loading states with loaders?**

**A:** "Use the useNavigation hook to check if navigation is in progress. navigation.state can be 'idle' (nothing happening), 'loading' (loader running), or 'submitting' (action running). You can show spinners or disable buttons based on this state."

```javascript
function ProductList() {
  const { products } = useLoaderData();
  const navigation = useNavigation();

  const isLoading = navigation.state === 'loading';

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      <ul className={isLoading ? 'dimmed' : ''}>
        {products.map(p => <li key={p.id}>{p.name}</li>)}
      </ul>
    </div>
  );
}
```

**Q: How do you handle validation errors from actions?**

**A:** "Return an object with errors from the action instead of redirecting. In the component, use useActionData to access the returned errors and display them next to form fields. The component re-renders with the error data without losing user input."

```javascript
const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');

  if (!email.includes('@')) {
    return { errors: { email: 'Invalid email' } }; // Return errors
  }

  await saveUser({ email });
  return redirect('/users');
};

function UserForm() {
  const actionData = useActionData(); // Get errors from action

  return (
    <Form method="post">
      <input name="email" />
      {actionData?.errors?.email && (
        <span className="error">{actionData.errors.email}</span>
      )}
      <button type="submit">Save</button>
    </Form>
  );
}
```

**Q: What's the difference between Form and regular <form>?**

**A:** "Form (capital F) from React Router intercepts the submission and calls the action function instead of making a browser request. It prevents the page reload and keeps you in the React app. Regular <form> causes a full page refresh. Form also works with useNavigation to show loading states and supports data attributes for better UX."

```javascript
// ❌ Regular form - full page reload
<form method="post" action="/users">
  <input name="name" />
  <button>Save</button>
</form>

// ✅ React Router Form - stays in React app
<Form method="post">
  <input name="name" />
  <button>Save</button>
</Form>
```

**Common Beginner Mistakes:**

```javascript
// ❌ Mistake 1: Using BrowserRouter instead of createBrowserRouter
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} loader={homeLoader} />
    {/* Loaders don't work with BrowserRouter! */}
  </Routes>
</BrowserRouter>

// ✅ Fix: Use createBrowserRouter
const router = createBrowserRouter([
  { path: '/', element: <Home />, loader: homeLoader },
]);
<RouterProvider router={router} />;

// ❌ Mistake 2: Not handling loader errors
const loader = async ({ params }) => {
  const user = await fetchUser(params.id);
  return { user }; // Crashes if fetchUser fails!
};

// ✅ Fix: Add try/catch and throw Response
const loader = async ({ params }) => {
  try {
    const user = await fetchUser(params.id);
    return { user };
  } catch (error) {
    throw new Response('User not found', { status: 404 });
  }
};

// ❌ Mistake 3: Action doesn't return anything
const action = async ({ request }) => {
  const formData = await request.formData();
  await createPost(formData);
  // No return - UI doesn't update!
};

// ✅ Fix: Return redirect or data
const action = async ({ request }) => {
  const formData = await request.formData();
  await createPost(formData);
  return redirect('/posts'); // Navigate after success
};

// ❌ Mistake 4: Fetching in component AND loader
const loader = async () => {
  const users = await fetchUsers();
  return { users };
};

function Users() {
  const { users } = useLoaderData();
  const [users2, setUsers2] = useState([]);

  useEffect(() => {
    fetchUsers().then(setUsers2); // Fetching twice!
  }, []);

  return <ul>{users.map(...)}</ul>;
}

// ✅ Fix: Only fetch in loader
const loader = async () => {
  const users = await fetchUsers();
  return { users };
};

function Users() {
  const { users } = useLoaderData(); // Use loader data
  return <ul>{users.map(...)}</ul>;
}
```

**Interview Answer Template:**

*"Loaders and actions are React Router v6.4+ features for handling data fetching and mutations at the routing level. Loaders run before a route renders, fetching data that components can access via useLoaderData. This means data is ready immediately when the component appears. Actions handle form submissions - when a Form component is submitted, the action receives the form data, processes it, and can return redirects or validation errors. After actions complete, loaders automatically revalidate to get fresh data. This pattern provides automatic loading states via useNavigation, declarative error handling with errorElement, and cleaner component code since data logic lives at the route level."*

---
