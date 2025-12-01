# Next.js Flashcards

> **40 Next.js concepts for modern React frameworks**

**Time to review:** 20 minutes
**Best for:** Next.js-focused roles, full-stack React positions

---

## Card 1: App Router vs Pages Router
**Q:** Key differences between App Router and Pages Router?

**A:** App Router (v13+): server components default, nested layouts, streaming, colocation. Pages Router: client components, file-based routing, getServerSideProps. App Router is future.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #routing
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Mention App Router adoption is the industry trend; discuss why you'd choose it (better bundle size, streaming support). Be ready to explain why Pages Router still exists (stable for enterprise). A good answer shows you understand both trade-offs and can migrate legacy codebases.

---

## Card 2: Server Components
**Q:** What are React Server Components in Next.js?

**A:** Components that render on server, don't ship JS to client. Default in App Router. Can't use hooks/browser APIs. Great for data fetching, reduce bundle size.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #rsc
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Interviewers want to know why this matters: "They let us fetch data securely on server, reduce JS payload to client, and improve performance." Mention security benefit (API keys stay server-side). Follow-up: "When would you NOT use them?" (Need interactivity, browser APIs).

---

## Card 3: Client Components
**Q:** When to use 'use client' directive?

**A:** When need: hooks (useState, useEffect), browser APIs, event handlers, Context, class components. Place as low as possible in tree.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #client-components
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Key insight: "Mark as client as close to leaves of tree as possible." Show you understand tree-shaking—if you mark entire page as client, you lose server component benefits. Example: Mark Button with onClick as client, keep parent Page as server.

---

## Card 4: Data Fetching Methods
**Q:** Data fetching in Next.js App Router?

**A:** async/await in server components, fetch with cache options, Server Actions for mutations. No getServerSideProps/getStaticProps in App Router.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #data-fetching
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Discuss caching tiers: "fetch() memoized within request, cached by default, revalidate with options." Show you understand different fetching times. Follow-up ready: "How do you handle errors in async server components?" (Error boundaries, error.js files).

---

## Card 5: Rendering Strategies
**Q:** What rendering strategies does Next.js support?

**A:** SSG (static), SSR (server-side), ISR (incremental static regeneration), CSR (client-side). Choose based on: data freshness, performance, SEO needs.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #rendering
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Decision framework: "SSG for static content (docs, blogs), SSR for dynamic user data, ISR for content that updates occasionally." Give real example: "Blog homepage SSG, individual blog posts ISR (revalidate every hour)."

---

## Card 6: ISR Revalidation
**Q:** How does ISR revalidation work?

**A:** revalidate: seconds in fetch or export. Regenerates page after time expires. Stale-while-revalidate pattern. Good for content that updates occasionally.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #isr
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Explain with timing: "First visitor after 60 seconds gets stale content while page regenerates in background." Mention limitation: "Initial deploy without hits won't regenerate." Follow-up: "Why not use ISR for everything?" (Adds complexity, unnecessary for static content).

---

## Card 7: Dynamic Routes
**Q:** How to create dynamic routes in App Router?

**A:** [param] folder for single, [...param] for catch-all, [[...param]] for optional catch-all. Access via params prop in page/layout.

**Difficulty:** 🟢 Easy
**Tags:** #nextjs #routing
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Show examples: "[id] for /products/123, [...slug] for /docs/guides/advanced/tips, [[...slug]] for optional catch-all." Be ready to explain params prop: "It's an async prop in server components, contains route parameters as object."

---

## Card 8: Layouts
**Q:** How do layouts work in App Router?

**A:** layout.js wraps pages, persists across navigation, maintains state. Nested layouts supported. Can't access route params. Root layout required.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #layouts
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Key benefit: "Layouts don't remount on navigation, so state persists—great for sidebars, player state." Common mistake: "Trying to access route params in layout (use page.js instead)." Mention nesting: "(admin)/layout.js wraps admin routes specifically.

---

## Card 9: Loading States
**Q:** How to show loading states in App Router?

**A:** loading.js for automatic loading UI, Suspense for granular control, streaming with loading.js. Shows while page/component loads.

**Difficulty:** 🟢 Easy
**Tags:** #nextjs #loading
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Explain streaming benefit: "User sees loading skeleton while data fetches, improves perceived performance." Show knowledge: "loading.js is a Suspense boundary wrapper that makes streaming work automatically." Mention: "Use Suspense in server components for more granular control."

---

## Card 10: Error Handling
**Q:** Error boundaries in Next.js App Router?

**A:** error.js for automatic error UI, must be client component ('use client'). Catches errors in child components/pages. global-error.js for root errors.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #error-handling
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Explain scope: "error.js catches errors below it, not siblings." Mention reset function: "Component gets reset() function to clear error state without page reload." Follow-up: "What about async server component errors?" (Use loading.js or Suspense + error boundary).

---

## Card 11: Route Handlers
**Q:** What are Route Handlers (API routes in App Router)?

**A:** route.js in app directory. Export GET, POST, etc functions. Replace pages/api. Can be in any folder. Support streaming, cookies, headers.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #api
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Show flexibility: "You can put route.js at any level: /api/route.js or /api/users/[id]/route.js." Mention context parameter gives request, response-like access. Difference from pages/api: "More flexible, returns Response object, works with streaming."

---

## Card 12: Server Actions
**Q:** What are Server Actions?

**A:** 'use server' functions for mutations. Called from client components. Alternative to API routes. Built-in form support. Automatic revalidation.

**Difficulty:** 🔴 Hard
**Tags:** #nextjs #server-actions
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Sell the benefit: "No API route boilerplate, direct DB access, automatic form handling." Important: "Serialization only works with primitives, need to convert Date/BigInt." Ready for: "How do you handle errors?" (throw error, catch in client with try-catch or useTransition).

---

## Card 13: Metadata
**Q:** How to add metadata in App Router?

**A:** Export metadata object or generateMetadata function. Static or dynamic. Supports: title, description, Open Graph, Twitter, icons, viewport.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #seo
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Show expertise: "Use static for common pages, generateMetadata() for dynamic (product pages use params). Metadata cascades from layout to page." Mention Open Graph for social sharing. Follow-up: "How do you handle dynamic routes with generateMetadata?" (Access params, fetch data if needed).

---

## Card 14: Image Optimization
**Q:** Benefits of next/image?

**A:** Automatic optimization, responsive, lazy loading, WebP/AVIF, blur placeholder, prevents CLS. Required width/height or fill. Use priority for LCP images.

**Difficulty:** 🟢 Easy
**Tags:** #nextjs #images #performance
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** This is performance—emphasize Core Web Vitals: "Prevents CLS with required width/height, improves LCP with priority prop on hero images." Show you understand srcset behavior. Mention common mistake: "Forgetting to set width/height on responsive images" (use fill + sizes instead).

---

## Card 15: Font Optimization
**Q:** How does next/font work?

**A:** Automatic font optimization, self-hosting, zero layout shift, variable fonts support. Import from next/font/google or next/font/local.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #fonts #performance
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Performance angle: "Prevents layout shift by preloading fonts during build, self-hosts to avoid external requests." Show you know the setup: "Import in layout.js, apply className to html or use CSS variable." Mention: "Variable fonts allow multiple weights in single request."

---

## Card 16: Middleware
**Q:** Use cases for Next.js middleware?

**A:** Auth checks, redirects, rewrites, A/B testing, geolocation, rate limiting. Runs before request completes. Edge runtime. Use matcher for specific paths.

**Difficulty:** 🔴 Hard
**Tags:** #nextjs #middleware
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Give a real scenario: "Check auth token, redirect to login if missing, before page loads." Mention edge runtime limitation: "No Node.js APIs, smaller bundle." Matcher example: "matcher: ['/admin/:path*'] runs only on admin routes." Follow-up ready: "Can it access database?" (No, edge runtime).

---

## Card 17: Environment Variables
**Q:** How to use env variables in Next.js?

**A:** .env.local for secrets. NEXT_PUBLIC_ prefix for client-side. process.env.VAR_NAME. Different files for production/development.

**Difficulty:** 🟢 Easy
**Tags:** #nextjs #config
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Security angle: "NEXT_PUBLIC_ vars are bundled, so only use public data. Secrets stay in .env.local." Show you know priorities: ".env.local > .env.production > .env." Mention deployment: "Vercel loads from dashboard, self-hosted needs CI/CD setup."

---

## Card 18: Caching Strategies
**Q:** What caching does Next.js provide?

**A:** Request memoization, Data Cache (fetch), Full Route Cache (SSG), Router Cache (client). Control with: cache, revalidate, no-store options.

**Difficulty:** 🔴 Hard
**Tags:** #nextjs #caching #performance
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** This is sophisticated—show layered understanding: "Request memoization within single render, Data Cache persists across requests, Full Route Cache happens at build time for SSG." Mention cache options: "cache: 'force-cache' vs 'no-store' vs revalidate timing." Follow-up: "How do you debug caching issues?" (Check headers, use dev tools).

---

## Card 19: Parallel Routes
**Q:** What are parallel routes?

**A:** @folder notation for simultaneous route rendering. Independent loading/error states. Use slots in layout. Good for modals, dashboards.

**Difficulty:** 🔴 Hard
**Tags:** #nextjs #routing
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Practical example: "@modal and @sidebar slots in layout load independently, each has own loading/error state." Advanced feature—show you understand when to use: "E-commerce: @cart and @product slots." Mention navigation: "Soft nav updates one slot, hard refresh shows all."

---

## Card 20: Intercepting Routes
**Q:** What are intercepting routes?

**A:** (..) notation to intercept routes. Show modal on soft navigation, full page on hard refresh. Good for photo modals, login forms.

**Difficulty:** 🔴 Hard
**Tags:** #nextjs #routing
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Show understanding: "(..) intercepts /photos/123, shows in modal, but /photos/123 is full page on hard refresh." Real use case: "Photo gallery—click thumbnail shows modal, direct link shows full page." Notation: "(.) same, (..) parent, (...) root, (...)(...) many levels.

---

## Card 21: Streaming
**Q:** How does streaming work in Next.js?

**A:** Send UI in chunks with Suspense. loading.js enables streaming. Improves TTFB and perceived performance. Shows content progressively.

**Difficulty:** 🔴 Hard
**Tags:** #nextjs #streaming #performance
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Performance benefit: "TTFB is faster because HTML starts sending before data fetches. User sees skeleton while content loads." Mention requirement: "Only works with async components and Suspense." Explain technically: "HTTP chunked transfer encoding sends chunks progressively."

---

## Card 22: Revalidation
**Q:** Types of revalidation in Next.js?

**A:** Time-based (revalidate: seconds), On-demand (revalidatePath/Tag), Automatic (Server Actions). Choose based on data update frequency.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #revalidation
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Show decision-making: "Blog posts: on-demand when CMS publishes. E-commerce: time-based every hour for price changes." Code example: "revalidateTag() in Server Action after mutation." Mention limitation: "Time-based ISR doesn't work for App Router SSR."

---

## Card 23: generateStaticParams
**Q:** What is generateStaticParams?

**A:** Replacement for getStaticPaths. Generate params for dynamic routes at build. Used with SSG. Can generate more at runtime with dynamicParams.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #ssg
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Optimization: "Pregenerate popular products at build, fallback to SSR for long tail." Example code pattern: "generateStaticParams returns [{ id: '1' }, { id: '2' }]." Set dynamicParams: false to 404 unlisted params, true to generate on-demand."

---

## Card 24: Route Groups
**Q:** What are route groups ()?

**A:** (folder) notation to organize without affecting URL. Multiple root layouts, route organization. Parentheses not in URL.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #routing
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real use case: "(auth)/login, (auth)/register, (app)/dashboard, (app)/settings—each group has own layout." Benefit: "Organize by feature, separate concerns, even different designs." Show you understand: "URL is /login not /(auth)/login—parentheses are organizational only."

---

## Card 25: Not Found
**Q:** How to handle 404s in App Router?

**A:** not-found.js for custom 404 UI. notFound() function to trigger. Automatic for unmatched routes. Can have per-route 404s.

**Difficulty:** 🟢 Easy
**Tags:** #nextjs #error-handling
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Show structure knowledge: "Root not-found.js handles all unmatched routes. Use notFound() in dynamic routes if param not found (e.g., product ID doesn't exist)." Difference from error.js: "not-found is for missing resources, error.js is for exceptions."

---

## Card 26: Deployment
**Q:** Best practices for Next.js deployment?

**A:** Vercel (optimal), self-hosting (Node.js/Docker), static export, edge runtime. Use ISR for dynamic, SSG for static. Configure caching headers.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #deployment
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Show flexibility: "Vercel for full-stack with best defaults. Self-host for control/cost. Static export for edge hosting." Mention caching: "immutable assets (with hash) have long ttl, HTML pages shorter ttl." Follow-up ready: "Docker setup?" (next build, expose 3000, healthcheck).

---

## Card 27: Performance Monitoring
**Q:** How to monitor Next.js performance?

**A:** Built-in Web Vitals reporting, Vercel Analytics, custom instrumentation.ts, OpenTelemetry support. Monitor: LCP, FID, CLS, TTFB.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #performance
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Show you care about metrics: "Track LCP (image/large text load), CLS (layout stability), FID (interaction). Vercel Analytics built-in, or use custom instrumentation." Mention: "instrumentationHook runs during build and start for setup."

---

## Card 28: Static Export
**Q:** When to use static export?

**A:** next export for pure static sites. No server features: API routes, ISR, SSR, middleware. Good for: blogs, docs, simple marketing sites.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #export
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** When to choose: "Blogs, documentation, marketing sites—no dynamic content. Can deploy to any static host (GitHub Pages, Netlify, S3)." Limitation awareness: "No API routes, no server-dependent features, no ISR." Show trade-off thinking.

---

## Card 29: Turbopack
**Q:** What is Turbopack?

**A:** Next.js's Rust-based bundler (successor to Webpack). Faster dev builds, HMR. Use with --turbo flag. Still beta but production-ready soon.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #tooling
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Future awareness: "Enables faster dev iteration, targets eventual default. Currently opt-in with --turbo flag in dev mode." Show you're informed: "Part of Next.js Conf 2024 roadmap, replaces Webpack." Mention limitation: "Still in development, some edge cases may not work."

---

## Card 30: Draft Mode
**Q:** What is Draft Mode?

**A:** Preview unpublished content. draftMode() in route handlers. Bypasses cache. Good for CMS integration. Replace Preview Mode from Pages Router.

**Difficulty:** 🔴 Hard
**Tags:** #nextjs #cms
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** CMS workflow: "Editors access preview token, see unpublished content before publish. draftMode() bypasses Data Cache." Example: "Contentful webhook generates token, editors use preview link." Mention security: "Token should be short-lived, validated server-side."

---

## Card 31: Cookies & Headers
**Q:** How to access cookies/headers in App Router?

**A:** Import from next/headers: cookies(), headers(). Only in Server Components/Actions/Route Handlers. Makes route dynamic.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #server
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Auth pattern: "Use cookies() to read session token in server component, validate user." Dynamic side effect: "Reading cookies/headers makes page dynamic—loses SSG benefit." Show you understand: "Avoid in layout for performance, read in specific pages."

---

## Card 32: Redirects & Rewrites
**Q:** Difference between redirects and rewrites?

**A:** Redirect: changes URL, user sees new URL. Rewrite: proxies to different URL, user sees original. Configure in next.config.js or use redirect() function.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #routing
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Use cases: "Redirect for moved pages (301), rewrite for API proxying. Use redirect() in Server Components for dynamic checks (auth)." Pattern: "Rewrite /api/* to external API without exposing URL to client." Show you understand headers impact: "Redirects require new request."

---

## Card 33: Internationalization
**Q:** How to implement i18n in Next.js?

**A:** App Router: middleware + route groups. Pages Router: next.config.js i18n. Use next-intl or similar. Dynamic segments for locales.

**Difficulty:** 🔴 Hard
**Tags:** #nextjs #i18n
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Architecture: "Use middleware to detect locale from header/cookie, redirect to /en/* or /es/*. Store preference in cookie." Route groups: "(en), (es) for separate content. Use next-intl library for translations." Mention SEO: "Each locale needs proper hreflang tags."

---

## Card 34: Edge Runtime
**Q:** When to use Edge Runtime?

**A:** For: middleware, some API routes, fast global responses. Limitations: no Node.js APIs, smaller bundle, different environment. Deploy to edge locations.

**Difficulty:** 🔴 Hard
**Tags:** #nextjs #edge
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Geography benefit: "Edge runtime deploys to global locations, faster for users worldwide. Great for middleware (auth, redirects)." Limitation: "No fs, database connections, Node.js modules." Trade-off: "Speed vs capability—use for lightweight logic only."

---

## Card 35: Bundle Analysis
**Q:** How to analyze Next.js bundle?

**A:** @next/bundle-analyzer package. Visualize bundle size, identify large dependencies. Run with ANALYZE=true. Optimize imports, lazy load, code split.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #performance
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Performance debugging: "Find unexpectedly large dependencies, fix imports (lodash vs lodash.get), lazy load routes with dynamic()." Show workflow: "npm install --save-dev @next/bundle-analyzer, wrap config, run ANALYZE=true next build." Mention: "Check for duplicate dependencies, polyfills."

---

## Card 36: Authentication
**Q:** Auth strategies in Next.js?

**A:** Middleware for protected routes, Server Actions for login, cookies for sessions. Libraries: NextAuth.js, Auth0. Check auth in Server Components.

**Difficulty:** 🔴 Hard
**Tags:** #nextjs #auth
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Full pattern: "Middleware checks session cookie, redirects unauthenticated users to /login. Login action sets httpOnly cookie. Server Components read cookie with cookies()." Show you know security: "httpOnly prevents JS access, sameSite prevents CSRF." Libraries: "NextAuth.js simplifies OAuth, Auth0 for enterprise."

---

## Card 37: Database Integration
**Q:** Best practices for database in Next.js?

**A:** Use in Server Components/Actions/Route Handlers. Connection pooling (Prisma, Drizzle). Never expose DB credentials client-side. Use ORMs.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #database
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Architecture: "Database access only in server code, not client. Use ORMs for type safety. Connection pooling prevents connection limit issues on serverless." Example: "Prisma in Server Action for mutation, fetch in async Server Component for reads." Security: ".env.local holds DATABASE_URL, never expose to client."

---

## Card 38: Testing Next.js
**Q:** How to test Next.js apps?

**A:** Jest + React Testing Library for components, Playwright/Cypress for E2E, API route testing with supertest. Mock next/router, next/navigation.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #testing
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Layered approach: "Unit tests for utilities, component tests with React Testing Library, E2E for user flows. Mock next/navigation for routing." Show knowledge: "MSW for API mocking, test in Node environment for Server Components." Mention: "E2E catches real Next.js edge cases (middleware, revalidation)."

---

## Card 39: Migration Strategies
**Q:** How to migrate Pages Router to App Router?

**A:** Incremental adoption (both routers coexist), start with new features, move pages gradually. Use compatibility mode, update imports, refactor data fetching.

**Difficulty:** 🔴 Hard
**Tags:** #nextjs #migration
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Practical approach: "App and pages coexist—migrate incrementally. Start with new pages in app/, move complex ones last. Update data fetching: no getStaticProps, use async components. Update imports: next/router → next/navigation." Show maturity: "This avoids risky big-bang rewrites, reduces bugs."

---

## Card 40: Configuration
**Q:** Common next.config.js options?

**A:** reactStrictMode, images config, redirects/rewrites, headers, env variables, webpack config, experimental features, output: 'export'.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #config
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Show you've shipped: "Configure images (domains for external hosts), enable reactStrictMode (catches bugs), set up redirects for moved routes, adjust webpack for special cases." Mention experimental: "Careful with experimental flags—may change." Performance option: "reactStrictMode: true helps during dev, logs extra renders."

---

[← Back to Flashcards](../README.md)
