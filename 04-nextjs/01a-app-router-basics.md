# Next.js App Router - Basics

> Master the App Router basics: routing, layouts, and Server Components

---

## Question 1: What is the App Router and how does it differ from Pages Router?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Vercel, Airbnb, Netflix, Shopify

### Question
Explain Next.js App Router. How does it differ from the Pages Router? What are the key benefits?

### Answer

The App Router is Next.js 13+'s new routing system built on React Server Components, offering enhanced performance and developer experience.

1. **Key Differences**
   - `app/` directory vs `pages/` directory
   - Server Components by default vs Client Components by default
   - Layouts and nested routes vs _app.js wrapper
   - Built-in loading and error states
   - Streaming and Suspense support

2. **File Conventions**
   - `page.js` - Route segment UI
   - `layout.js` - Shared UI for route segment
   - `loading.js` - Loading UI with Suspense
   - `error.js` - Error boundary UI
   - `template.js` - Re-rendered layout
   - `not-found.js` - 404 UI

3. **Benefits**
   - Better performance (Server Components reduce bundle size)
   - Improved data fetching (fetch in Server Components)
   - Automatic code splitting
   - Better TypeScript support
   - Nested layouts without prop drilling

4. **Migration Path**
   - App Router and Pages Router can coexist
   - Gradual migration route by route
   - `app/` takes precedence over `pages/`

### Code Example

```javascript
// Pages Router (OLD) - pages/dashboard/settings.js
import { useRouter } from 'next/router';

export default function Settings({ user }) {
  const router = useRouter();

  return (
    <div>
      <h1>Settings for {user.name}</h1>
    </div>
  );
}

export async function getServerSideProps() {
  const user = await fetchUser();
  return { props: { user } };
}

// App Router (NEW) - app/dashboard/settings/page.js
import { fetchUser } from '@/lib/api';

export default async function SettingsPage() {
  // Fetch directly in Server Component
  const user = await fetchUser();

  return (
    <div>
      <h1>Settings for {user.name}</h1>
    </div>
  );
}

// App Router with Layout - app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <nav>
        <a href="/dashboard">Home</a>
        <a href="/dashboard/settings">Settings</a>
      </nav>
      <main>{children}</main>
    </div>
  );
}
```

### File Structure Comparison

```
Pages Router:
pages/
├── _app.js          # Global wrapper
├── index.js         # /
├── about.js         # /about
└── blog/
    ├── index.js     # /blog
    └── [slug].js    # /blog/:slug

App Router:
app/
├── layout.js        # Root layout
├── page.js          # /
├── about/
│   └── page.js      # /about
└── blog/
    ├── layout.js    # Blog layout
    ├── page.js      # /blog
    └── [slug]/
        ├── page.js  # /blog/:slug
        └── loading.js # Loading state
```

### Common Mistakes

❌ **Mistake:** Using Client Component for everything
```javascript
'use client'; // Don't add this everywhere!

export default function Page() {
  // This could be a Server Component
  const data = await fetch('/api/data'); // Error: can't use async in Client Component
}
```

✅ **Correct:** Use Server Components by default
```javascript
// No 'use client' - this is a Server Component
export default async function Page() {
  const data = await fetch('/api/data'); // Works!
  return <div>{data.title}</div>;
}
```

### Follow-up Questions

- "When would you use Pages Router over App Router?"
- "How do you handle client-side interactivity in App Router?"
- "What's the performance impact of Server Components?"
- "How does data fetching work differently in App Router?"

### Resources

- [Next.js Docs: App Router](https://nextjs.org/docs/app)
- [Server Components Explained](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

---

## Question 2: How does file-based routing work in App Router?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Vercel, Shopify, Meta, Airbnb

### Question
Explain file-based routing in App Router. How do dynamic routes, route groups, and parallel routes work?

### Answer

App Router uses folder structure to define routes, with special file conventions for different UI segments.

1. **Basic Routing**
   - Each folder = route segment
   - `page.js` makes route publicly accessible
   - Nested folders = nested routes

2. **Dynamic Routes**
   - `[slug]` - Single dynamic segment
   - `[...slug]` - Catch-all segment
   - `[[...slug]]` - Optional catch-all

3. **Route Groups**
   - `(folder)` - Group routes without affecting URL
   - Organize without adding path segments
   - Multiple root layouts

4. **Parallel Routes**
   - `@folder` - Render multiple pages in same layout
   - Useful for dashboards, modals
   - Independent navigation

5. **Intercepting Routes**
   - `(.)folder` - Intercept same level
   - `(..)folder` - Intercept one level up
   - Useful for modals

### Code Example

```javascript
// BASIC ROUTING
// app/blog/page.js → /blog
export default function BlogPage() {
  return <h1>Blog</h1>;
}

// app/blog/[slug]/page.js → /blog/post-1
export default function BlogPost({ params }) {
  return <h1>Post: {params.slug}</h1>;
}

// DYNAMIC ROUTES
// app/shop/[category]/[product]/page.js → /shop/electronics/laptop
export default function ProductPage({ params }) {
  const { category, product } = params;
  return (
    <div>
      <h1>{product}</h1>
      <p>Category: {category}</p>
    </div>
  );
}

// CATCH-ALL ROUTES
// app/docs/[...slug]/page.js → /docs/a/b/c
export default function DocsPage({ params }) {
  const path = params.slug.join('/'); // "a/b/c"
  return <h1>Docs: {path}</h1>;
}

// OPTIONAL CATCH-ALL
// app/shop/[[...slug]]/page.js → /shop OR /shop/a/b
export default function ShopPage({ params }) {
  const segments = params.slug || [];
  return <div>Segments: {segments.length}</div>;
}

// ROUTE GROUPS (URL not affected)
// app/(marketing)/about/page.js → /about (NOT /marketing/about)
// app/(marketing)/layout.js - Layout only for marketing pages
export default function MarketingLayout({ children }) {
  return (
    <div className="marketing">
      <header>Marketing Header</header>
      {children}
    </div>
  );
}

// app/(shop)/layout.js - Different layout for shop
export default function ShopLayout({ children }) {
  return (
    <div className="shop">
      <header>Shop Header</header>
      {children}
    </div>
  );
}

// PARALLEL ROUTES
// app/dashboard/layout.js
export default function DashboardLayout({ children, analytics, team }) {
  return (
    <div>
      <div>{children}</div>
      <div>{analytics}</div>
      <div>{team}</div>
    </div>
  );
}

// app/dashboard/@analytics/page.js
export default function Analytics() {
  return <div>Analytics Panel</div>;
}

// app/dashboard/@team/page.js
export default function Team() {
  return <div>Team Panel</div>;
}

// INTERCEPTING ROUTES (Modals)
// app/photos/page.js - Photo grid
export default function PhotosPage() {
  return (
    <div className="grid">
      <Link href="/photos/1">Photo 1</Link>
      <Link href="/photos/2">Photo 2</Link>
    </div>
  );
}

// app/photos/(..)photos/[id]/page.js - Intercept and show modal
export default function PhotoModal({ params }) {
  return (
    <dialog open>
      <h1>Photo {params.id}</h1>
      <img src={`/photos/${params.id}.jpg`} />
    </dialog>
  );
}

// app/photos/[id]/page.js - Full page when directly accessed
export default function PhotoPage({ params }) {
  return (
    <div>
      <h1>Photo {params.id}</h1>
      <img src={`/photos/${params.id}.jpg`} />
    </div>
  );
}
```

### File Structure Examples

```
Advanced routing structure:

app/
├── (marketing)/              # Route group - URL: /
│   ├── layout.js            # Marketing layout
│   ├── page.js              # Home page
│   └── about/
│       └── page.js          # /about
├── (shop)/                   # Route group - URL: /
│   ├── layout.js            # Shop layout
│   ├── products/
│   │   ├── page.js          # /products
│   │   └── [id]/
│   │       └── page.js      # /products/:id
├── dashboard/
│   ├── layout.js
│   ├── page.js              # /dashboard
│   ├── @analytics/          # Parallel route
│   │   └── page.js
│   └── @team/               # Parallel route
│       └── page.js
├── blog/
│   ├── [slug]/
│   │   └── page.js          # /blog/:slug
│   └── [...catchAll]/
│       └── page.js          # /blog/a/b/c
└── photos/
    ├── page.js              # /photos (grid)
    ├── (..)photos/          # Intercept
    │   └── [id]/
    │       └── page.js      # Modal when navigating from grid
    └── [id]/
        └── page.js          # /photos/:id (full page)
```

### Common Mistakes

❌ **Mistake:** Forgetting page.js
```
app/
└── blog/
    └── [slug]/
        └── layout.js  # ❌ Route not accessible without page.js
```

❌ **Mistake:** Wrong catch-all syntax
```javascript
// app/docs/[...]/page.js  ❌ Wrong
// app/docs/[...slug]/page.js  ✅ Correct
```

✅ **Correct:** Include page.js for accessible routes
```
app/
└── blog/
    └── [slug]/
        ├── page.js    # ✅ Route is accessible
        └── layout.js  # Optional
```

### Follow-up Questions

- "How do you generate static params for dynamic routes?"
- "What's the difference between catch-all and optional catch-all?"
- "When would you use route groups?"
- "How do parallel routes affect data fetching?"

### Resources

- [Next.js Docs: Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)

---

## Question 3: What are layouts and how do they work?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Vercel, Shopify, Netflix

### Question
Explain layouts in App Router. How do nested layouts work? What's the difference between layout and template?

### Answer

Layouts are UI that's shared between multiple pages, maintaining state across navigations.

1. **Layout Characteristics**
   - Preserve state across route changes
   - Don't re-render on navigation
   - Can be nested
   - Can't access route params (use page.js)

2. **Root Layout**
   - Required at app root
   - Must include <html> and <body>
   - Applied to all routes

3. **Nested Layouts**
   - Each route segment can have layout
   - Layouts nest automatically
   - Child layout wraps page

4. **Templates vs Layouts**
   - Templates re-render on navigation
   - Layouts preserve state
   - Templates useful for animations, resetting state

### Code Example

```javascript
// ROOT LAYOUT - app/layout.js (REQUIRED)
export const metadata = {
  title: 'My App',
  description: 'App description'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>Global Header</header>
        {children}
        <footer>Global Footer</footer>
      </body>
    </html>
  );
}

// NESTED LAYOUT - app/dashboard/layout.js
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}

// PAGE - app/dashboard/analytics/page.js
export default function AnalyticsPage() {
  return <h1>Analytics</h1>;
}

// Rendering hierarchy:
// RootLayout
//   └─ DashboardLayout
//       └─ AnalyticsPage

// TEMPLATE (re-renders) - app/dashboard/template.js
'use client';
import { motion } from 'framer-motion';

export default function DashboardTemplate({ children }) {
  // This re-renders on every navigation
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}

// LAYOUT WITH SHARED STATE
'use client';
import { useState } from 'react';

export default function ShopLayout({ children }) {
  const [cart, setCart] = useState([]);

  // Cart state persists across /shop routes
  return (
    <div>
      <nav>Cart: {cart.length} items</nav>
      {children}
    </div>
  );
}

// MULTIPLE LAYOUTS (Route Groups)
// app/(marketing)/layout.js
export default function MarketingLayout({ children }) {
  return (
    <div className="marketing">
      <nav>Marketing Nav</nav>
      {children}
    </div>
  );
}

// app/(app)/layout.js
export default function AppLayout({ children }) {
  return (
    <div className="app">
      <nav>App Nav</nav>
      {children}
    </div>
  );
}

// LAYOUT WITH DATA FETCHING
import { fetchCategories } from '@/lib/api';

export default async function ShopLayout({ children }) {
  const categories = await fetchCategories();

  return (
    <div>
      <nav>
        {categories.map(cat => (
          <a key={cat.id} href={`/shop/${cat.slug}`}>
            {cat.name}
          </a>
        ))}
      </nav>
      {children}
    </div>
  );
}

// CONDITIONAL LAYOUT CONTENT
export default function DashboardLayout({ children }) {
  return (
    <div>
      <aside>
        {/* Sidebar visible on all dashboard routes */}
      </aside>
      <main>{children}</main>
    </div>
  );
}
```

### Layout Composition Example

```
URL: /shop/products/123

Renders:
├─ app/layout.js (Root Layout)
│   └─ <html><body>
│       ├─ Global Header
│       └─ [children] ↓
│
├─ app/(shop)/layout.js (Shop Layout)
│   └─ <div className="shop">
│       ├─ Shop Nav
│       └─ [children] ↓
│
├─ app/(shop)/products/layout.js (Products Layout)
│   └─ <div>
│       ├─ Filters Sidebar
│       └─ [children] ↓
│
└─ app/(shop)/products/[id]/page.js (Product Page)
    └─ <div>Product 123 Details</div>
```

### Common Mistakes

❌ **Mistake:** Trying to access params in layout
```javascript
// app/blog/[slug]/layout.js
export default function Layout({ params }) {
  // ❌ params not available in layout
  return <div>{params.slug}</div>;
}
```

❌ **Mistake:** Missing root layout
```
app/
├── page.js  # ❌ No layout.js - Error!
```

❌ **Mistake:** Not including html/body in root layout
```javascript
// app/layout.js
export default function RootLayout({ children }) {
  return <div>{children}</div>; // ❌ Missing <html><body>
}
```

✅ **Correct:** Use params in page, pass to client components
```javascript
// app/blog/[slug]/page.js
import { ClientComponent } from './ClientComponent';

export default function BlogPost({ params }) {
  return <ClientComponent slug={params.slug} />;
}
```

### Layout vs Template

| Feature | Layout | Template |
|---------|--------|----------|
| Re-renders on navigation | ❌ No | ✅ Yes |
| Preserves state | ✅ Yes | ❌ No |
| Shares UI | ✅ Yes | ✅ Yes |
| Best for | Navigation, sidebars | Animations, form resets |

### Follow-up Questions

- "How do you share data between layouts and pages?"
- "Can layouts be client components?"
- "How do you handle authentication in layouts?"
- "What happens when you nest multiple layouts?"

### Resources

- [Next.js Docs: Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Templates](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#templates)

---

