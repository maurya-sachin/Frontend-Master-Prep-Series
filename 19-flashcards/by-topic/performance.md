# Performance Optimization Flashcards

> **40 essential performance concepts for web optimization**

**Time to review:** 20 minutes
**Best for:** Performance-focused interviews, optimization roles

---

## Card 1: Core Web Vitals
**Q:** What are the 3 Core Web Vitals and their thresholds?

**A:** LCP (Largest Contentful Paint < 2.5s), FID (First Input Delay < 100ms), CLS (Cumulative Layout Shift < 0.1). Google's key metrics for page experience.

**Difficulty:** 🟡 Medium
**Tags:** #performance #web-vitals #metrics
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Tell interviewer you monitor all three in production dashboards. Mention that pages with good Core Web Vitals see 24% lower bounce rates (Google data). Reference how you've reduced LCP from 3.2s to 2.1s through image optimization and code splitting.

---

## Card 2: LCP Optimization
**Q:** How to improve Largest Contentful Paint (LCP)?

**A:** 1) Optimize server response time, 2) Eliminate render-blocking resources, 3) Optimize images (WebP, lazy load), 4) Use CDN, 5) Preload key resources.

**Difficulty:** 🟡 Medium
**Tags:** #performance #lcp
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Share a real example: "On our ecommerce site, LCP was 4.2s. We preloaded hero image, used WebP (30% smaller), and optimized server TTFB from 800ms to 300ms. Final LCP: 1.8s." This shows metrics-driven approach interviewers value.

---

## Card 3: CLS Prevention
**Q:** How to prevent Cumulative Layout Shift (CLS)?

**A:** 1) Set explicit width/height on images/videos, 2) Reserve space for ads, 3) Avoid inserting content above existing, 4) Use transform instead of top/left, 5) Font loading strategies.

**Difficulty:** 🟡 Medium
**Tags:** #performance #cls
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Explain systematic approach: "We audit every dynamic content insertion. For ads, we reserve container space with min-height. For images, we use aspect-ratio CSS. Our CLS improved from 0.28 to 0.05." Mention checking performance dashboard regularly.

---

## Card 4: Critical Rendering Path
**Q:** What is the critical rendering path?

**A:** Steps browser takes to convert HTML/CSS/JS to pixels: DOM → CSSOM → Render Tree → Layout → Paint. Optimizing reduces time to first render.

**Difficulty:** 🟡 Medium
**Tags:** #performance #rendering
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Deep knowledge counts: "CSSOM construction is blocking—delay non-critical CSS loading. Inline critical CSS (3-5KB) and load rest async. JavaScript blocks parsing—use defer/async strategically. Every millisecond of TTFB matters."

---

## Card 5: Lazy Loading
**Q:** When should you lazy load?

**A:** Images/videos below fold, non-critical components, heavy libraries, route components. Use Intersection Observer or native loading="lazy". Improves initial load time.

**Difficulty:** 🟢 Easy
**Tags:** #performance #lazy-loading
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Mention both native and smart approaches: "We use native loading='lazy' for simplicity. For components, we use React.lazy() + Suspense boundaries. On a news site, this reduced initial JS from 280KB to 85KB, improving TTI by 60%."

---

## Card 6: Code Splitting
**Q:** What are code splitting strategies?

**A:** 1) Route-based (lazy load routes), 2) Component-based (lazy heavy components), 3) Library splitting (dynamic import), 4) Vendor splitting (separate bundle).

**Difficulty:** 🟡 Medium
**Tags:** #performance #code-splitting
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Show strategic thinking: "Route-based splitting is most effective—splits by user interaction points. Implement vendor bundle separately for better caching. Monitor chunk sizes in CI/CD with 200KB thresholds. Reduces main bundle from 500KB to 150KB typically."

---

## Card 7: Tree Shaking
**Q:** What is tree shaking and when does it work?

**A:** Removing unused code during build. Requires ES modules (import/export), not CommonJS. Side-effect-free code. Reduces bundle size significantly.

**Difficulty:** 🟡 Medium
**Tags:** #performance #bundling
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Demonstrate deep understanding: "Tree shaking requires pure ESM modules and sideEffects: false in package.json. Common mistake: importing from barrels with side effects. Used lodash-es over lodash to save 50KB. Webpack/Rollup handle it, but you must structure code correctly."

---

## Card 8: Resource Hints
**Q:** Difference between preload, prefetch, and preconnect?

**A:** preload: fetch resource for current page (high priority). prefetch: fetch for future navigation (low priority). preconnect: establish early connection to origin.

**Difficulty:** 🔴 Hard
**Tags:** #performance #resource-hints
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Give concrete usage: "Preload hero image and critical font. Prefetch next route on mobile cautiously (data concerns). Preconnect to analytics, CDN. Measure actual impact—preload incorrect assets wastes bandwidth. We reduced FCP by 400ms with strategic preloads."

---

## Card 9: Image Optimization
**Q:** Best practices for image optimization?

**A:** 1) Use WebP/AVIF, 2) Responsive images (srcset), 3) Lazy load below fold, 4) Compress (TinyPNG), 5) Use CDN, 6) Set dimensions, 7) Blur-up placeholder.

**Difficulty:** 🟡 Medium
**Tags:** #performance #images
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Share data-driven results: "Images were 65% of page size. Switched to WebP (30% smaller), added srcset for responsive loading, lazy loaded below fold. Total savings: 2.4MB per user session. LCP improved 1.2s because hero image loaded faster."

---

## Card 10: Caching Strategies
**Q:** What are effective caching strategies?

**A:** 1) Cache-Control headers, 2) Service Worker caching, 3) CDN caching, 4) Immutable assets with hashes, 5) Stale-while-revalidate, 6) Cache API, 7) Memory caching (Map).

**Difficulty:** 🔴 Hard
**Tags:** #performance #caching
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Explain layered caching: "Set Cache-Control: public, max-age=31536000 for hashed assets (never change). max-age=3600 for HTML (check freshness). Use Service Worker with stale-while-revalidate. Each layer reduces server hits. Repeat users see 90% cache hit rate."

---

## Card 11: Bundle Size
**Q:** How to reduce JavaScript bundle size?

**A:** 1) Code splitting, 2) Tree shaking, 3) Minification, 4) Remove unused dependencies, 4) Use smaller alternatives, 5) Dynamic imports, 6) Analyze with webpack-bundle-analyzer.

**Difficulty:** 🟡 Medium
**Tags:** #performance #bundling
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Demonstrate audit skills: "Used webpack-bundle-analyzer to find moment.js (67KB minified). Replaced with date-fns (13KB). Found duplicate lodash in vendor bundle. Removed obsolete polyfills. Achieved 40% bundle reduction, TTI improved from 6.2s to 3.8s."

---

## Card 12: Render Blocking
**Q:** How to eliminate render-blocking resources?

**A:** 1) Inline critical CSS, 2) Async/defer scripts, 3) Preload key resources, 4) Extract critical path CSS, 5) Load non-critical CSS async.

**Difficulty:** 🟡 Medium
**Tags:** #performance #rendering
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Show practical knowledge: "Inline 3-5KB critical CSS for above-fold content. Load full CSS async with media queries. Scripts: defer for non-critical, async for analytics. Reduced render-blocking time from 2.8s to 400ms on mobile. Lighthouse improved from 35 to 85."

---

## Card 13: JavaScript Performance
**Q:** JavaScript performance optimization techniques?

**A:** 1) Debounce/throttle, 2) Web Workers for heavy tasks, 3) RequestAnimationFrame for animations, 4) Avoid memory leaks, 5) Use efficient algorithms, 6) Minimize DOM access.

**Difficulty:** 🟡 Medium
**Tags:** #performance #javascript
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Share optimization wins: "Search input used debounce(300ms)—reduced API calls 90%. Moved image processing to Web Worker—unblocked main thread. Used RAF for scroll animations. Profiled with DevTools and found O(n²) sort—switched to O(n log n). Response time from 450ms to 40ms."

---

## Card 14: Memory Leaks
**Q:** Common causes of memory leaks in JavaScript?

**A:** 1) Forgotten timers/intervals, 2) Closures holding references, 3) Detached DOM nodes, 4) Global variables, 5) Event listeners not removed, 6) Large caches without limits.

**Difficulty:** 🔴 Hard
**Tags:** #performance #memory
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Demonstrate debugging skills: "Found memory leak in React component—interval not cleared on unmount. Heap snapshot showed detached DOM nodes growing (1000 listeners added, never removed). Added cleanup logic. Memory stabilized at 45MB instead of growing to 300MB."

---

## Card 15: Reflow vs Repaint
**Q:** Difference between reflow and repaint?

**A:** Reflow: recalculate layout (position/size changes, expensive). Repaint: redraw pixels (color changes, cheaper). Minimize by batching DOM changes, use transform/opacity.

**Difficulty:** 🟡 Medium
**Tags:** #performance #rendering
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Give specific examples: "Reading offsetHeight in loop triggers forced reflow—slow. Use classList for batch style changes. Animations: use transform/opacity (GPU accelerated) not top/left (layout thrashing). One animation: 60fps; bad approach: drops to 15fps."

---

## Card 16: requestAnimationFrame
**Q:** When to use requestAnimationFrame?

**A:** For animations and visual updates. Syncs with browser repaint (~60fps). Better than setTimeout. Pauses when tab inactive. Use for smooth animations.

**Difficulty:** 🟡 Medium
**Tags:** #performance #animation
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Explain the advantage: "RAF syncs with monitor refresh, naturally 60fps. setTimeout unpredictable—might batch updates wrong timing. Pausing inactive tab saves battery. Our scroll animations used to jank at 30fps, RAF made them silky smooth at 60fps consistently."

---

## Card 17: Web Workers
**Q:** When to use Web Workers?

**A:** For CPU-intensive tasks: image processing, data parsing, calculations, encryption. Runs in separate thread, no DOM access. Prevents blocking main thread.

**Difficulty:** 🟡 Medium
**Tags:** #performance #workers
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Share real use case: "Image compression took 2.5s on main thread. Moved to Web Worker—main thread stayed responsive during processing. User could scroll freely. Processing time same, but perceived performance excellent. Shipped for mobile image upload feature."

---

## Card 18: Service Workers
**Q:** What are Service Worker use cases?

**A:** 1) Offline support, 2) Background sync, 3) Push notifications, 4) Cache management, 5) Network request interception, 6) Performance optimization.

**Difficulty:** 🔴 Hard
**Tags:** #performance #service-workers
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Demonstrate strategic thinking: "Service Workers enable offline mode and cache-first strategies. Implemented stale-while-revalidate pattern for APIs. App loads 800ms faster (offline). Background sync queues offline actions. 92% of repeat users benefit from Service Worker caching."

---

## Card 19: Font Loading
**Q:** Best practices for font loading?

**A:** 1) font-display: swap/optional, 2) Preload fonts, 3) Self-host fonts, 4) Use system fonts, 5) Subset fonts, 6) WOFF2 format, 7) Avoid FOIT/FOUT.

**Difficulty:** 🟡 Medium
**Tags:** #performance #fonts
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Mention specific optimizations: "Switched from Google Fonts to self-hosted WOFF2 (saved 400ms roundtrip). Used font-display: swap to show system font during load. Subset fonts to Latin only (70% size reduction). Text visible at FCP, custom font loads after. CLS impact: 0.01."

---

## Card 20: Compression
**Q:** What compression techniques improve performance?

**A:** 1) Gzip/Brotli (text), 2) Image compression (lossy/lossless), 3) Minification (JS/CSS), 4) Video compression, 5) Asset optimization, 6) Enable in server config.

**Difficulty:** 🟢 Easy
**Tags:** #performance #compression
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Show knowledge: "Brotli compresses JavaScript 20% better than Gzip. Nginx config: gzip_comp_level 6, Accept-Encoding headers. Minification + Brotli combined: 78KB JS becomes 21KB. Always verify Content-Encoding header with curl."

---

## Card 21: CDN Benefits
**Q:** How does CDN improve performance?

**A:** 1) Reduces latency (geographically closer), 2) Caching at edge, 3) Reduces origin load, 4) DDoS protection, 5) HTTP/2, 6) Compression, 7) Image optimization.

**Difficulty:** 🟢 Easy
**Tags:** #performance #cdn
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Give metrics: "CDN reduced Asia access latency from 450ms to 120ms (origin in US). Cache hit ratio: 85%. Edge compression for static assets. Image optimization at edge (format conversion, resizing). $12K/month cost saved 2.3s page load globally."

---

## Card 22: HTTP/2 Benefits
**Q:** What are HTTP/2 performance benefits?

**A:** 1) Multiplexing (parallel requests), 2) Header compression, 3) Server push, 4) Binary protocol (faster parsing), 5) Stream prioritization. Eliminates need for domain sharding.

**Difficulty:** 🟡 Medium
**Tags:** #performance #http
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Explain trade-offs: "HTTP/2 multiplexing eliminates need for domain sharding (outdated with HTTP/1.1). Header compression saves 80% on repeated headers. Careful with Server Push—can hurt if sends unsolicited resources. Prioritizes critical streams. TTL improves 15-20% vs HTTP/1.1."

---

## Card 23: Lighthouse Score
**Q:** What does Lighthouse measure?

**A:** Performance (FCP, LCP, TBT, CLS, TTI), Accessibility, Best Practices, SEO, PWA. Scores 0-100. Run in Chrome DevTools or CI/CD.

**Difficulty:** 🟢 Easy
**Tags:** #performance #lighthouse
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Show monitoring discipline: "We run Lighthouse in CI/CD on every PR with thresholds: Performance >85, Accessibility >90. Logs all metrics. Tracks trends in dashboard. Improved from avg 58 to 92 over 3 quarters through systematic optimization."

---

## Card 24: Time to Interactive
**Q:** What is Time to Interactive (TTI)?

**A:** Time until page is fully interactive (main thread idle for 5s). Measures when user can reliably interact. Improve by reducing JavaScript execution time.

**Difficulty:** 🟡 Medium
**Tags:** #performance #metrics
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Connect to user experience: "TTI was 8.2s (mobile), buttons appeared but weren't clickable. Reduced JS by 45% through code splitting. Main thread idle achieved faster. New TTI: 3.9s. User research showed clicks before TTI caused frustration."

---

## Card 25: Total Blocking Time
**Q:** What is Total Blocking Time (TBT)?

**A:** Sum of blocking time of long tasks (>50ms) between FCP and TTI. Measures responsiveness during load. Lower is better. Optimize by code splitting.

**Difficulty:** 🟡 Medium
**Tags:** #performance #metrics
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Discuss real numbers: "TBT was 850ms (very bad). Identified large analytics bundle blocking main thread. Async-loaded it. Moved JSON parsing to Web Worker. Broke initialization into smaller tasks. New TBT: 120ms. Page feels snappy immediately after FCP."

---

## Card 26: Throttling vs Debouncing
**Q:** When to use throttling vs debouncing for performance?

**A:** Throttle: Execute at regular intervals (scroll, mouse move, resize). Debounce: Execute after inactivity (search input, window resize completion). Both reduce function calls.

**Difficulty:** 🟡 Medium
**Tags:** #performance #optimization
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Code wisely: "Scroll events fired 100x/second. Throttled to 16ms interval (60fps budget). Reduced layout recalculation calls 98%. Search input debounced 300ms—eliminates excessive API calls. 10,000 inputs without debounce, 33 with. Cost: server load reduction."

---

## Card 27: Virtual Scrolling
**Q:** What is virtual scrolling and when to use it?

**A:** Render only visible items in large lists. Recycle DOM nodes. Use for 1000+ items. Libraries: react-window, react-virtualized. Improves render performance dramatically.

**Difficulty:** 🔴 Hard
**Tags:** #performance #virtualization
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Show advanced skills: "Rendering 10,000 items took 5s, memory 200MB. Virtual scrolling renders ~20 visible items. 800ms initial load, 5MB memory. Implemented with react-window. Scroll smooth at 60fps. Reduced time to interactive from 6s to 1.2s."

---

## Card 28: Memoization
**Q:** When to use memoization in React?

**A:** React.memo for components, useMemo for expensive calculations, useCallback for function identity. Don't overuse - adds memory overhead. Profile first.

**Difficulty:** 🟡 Medium
**Tags:** #performance #react
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Show measured approach: "Profiled with React DevTools. Component re-rendered 100x unnecessarily—React.memo reduced to 1x. useMemo on expensive calculation: 40ms to 2ms. useCallback prevented child re-renders. Caveat: memoization has cost. Profile always before adding."

---

## Card 29: Bundle Analysis
**Q:** How to analyze bundle size?

**A:** webpack-bundle-analyzer, source-map-explorer, Next.js Bundle Analyzer. Identify large dependencies, duplicate code, unused exports. Optimize imports.

**Difficulty:** 🟡 Medium
**Tags:** #performance #bundling
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Show audit discipline: "webpack-bundle-analyzer revealed moment.js (67KB), date-picker (45KB) bundled twice. Replaced with lightweight alternatives. Found unused code from old features. Removed. Bundle: 512KB → 280KB. Added monitoring to CI/CD to prevent growth."

---

## Card 30: Critical CSS
**Q:** What is critical CSS?

**A:** CSS needed for above-the-fold content. Inline in <head> to prevent render blocking. Extract with tools like critical, criticalCSS. Load rest async.

**Difficulty:** 🟡 Medium
**Tags:** #performance #css
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Explain workflow: "Extract 3.2KB critical CSS with criticalCSS tool. Inline in HTML head. Load full stylesheet async with link media tricks. FCP improved 600ms. CSS delivery optimized from blocking to async. Monitor inlined CSS size—if >5KB, revisit critical path."

---

## Card 31: DNS Prefetch
**Q:** When to use dns-prefetch?

**A:** For third-party domains used later. `<link rel="dns-prefetch" href="//example.com">`. Resolves DNS early. Low overhead. Use for analytics, fonts, APIs.

**Difficulty:** 🟢 Easy
**Tags:** #performance #optimization
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Share practical example: "Added dns-prefetch for Google Analytics, Stripe, CDN domains. DNS resolution typically 100-200ms. Prefetch in parallel, saves 100ms each. Minimal overhead. Stripe API calls 100ms faster. Low-cost high-reward optimization."

---

## Card 32: RAIL Model
**Q:** What is the RAIL performance model?

**A:** Response (<100ms), Animation (60fps = 16ms/frame), Idle (use idle time for work), Load (<5s). Google's user-centric performance model.

**Difficulty:** 🟡 Medium
**Tags:** #performance #metrics
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Show alignment with Google: "RAIL guides our optimization priorities. Response: debounce handlers to <100ms. Animation: use transform, 60fps. Idle: background work in requestIdleCallback. Load: critical resources first. This framework improved perceived performance significantly."

---

## Card 33: Long Tasks
**Q:** What are long tasks and how to fix?

**A:** Tasks >50ms that block main thread. Fix: code splitting, Web Workers, break into smaller tasks, use requestIdleCallback, async/await to yield.

**Difficulty:** 🔴 Hard
**Tags:** #performance #optimization
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Demonstrate profiling: "Performance tab showed 400ms long task during initialization. Identified JSON parsing (300ms). Moved to Web Worker—main thread free. Long tasks >50ms: none now. Broke remaining tasks into 30ms chunks with async/await yields between."

---

## Card 34: Asset Optimization
**Q:** How to optimize static assets?

**A:** 1) Minify JS/CSS, 2) Compress images, 3) Use modern formats (WebP, AVIF), 4) Add cache headers, 5) Use CDN, 6) Version/hash filenames.

**Difficulty:** 🟢 Easy
**Tags:** #performance #assets
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Show comprehensive approach: "Minified JS/CSS with Webpack. Images: converted to WebP (30% smaller), added srcset. Cache headers: 1yr for hashed assets, 1day for HTML. CDN edge caching. Combined: 8.5MB → 2.1MB. Load time: 9.2s → 2.8s on slow 3G."

---

## Card 35: Intersection Observer
**Q:** How does Intersection Observer improve performance?

**A:** Efficiently detect element visibility without scroll listeners. Use for: lazy loading, infinite scroll, analytics, animations. Better than getBoundingClientRect polling.

**Difficulty:** 🟡 Medium
**Tags:** #performance #api
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Explain efficiency: "Replaced scroll listener polling with Intersection Observer. getBoundingClientRect checked 60x/sec on scroll. Observer callback fires only when visibility changes. Reduced scroll handler CPU from 15% to 0.5%. Smooth scrolling, no jank. Implemented infinite scroll efficiently."

---

## Card 36: Memory Profiling
**Q:** How to find memory leaks?

**A:** Chrome DevTools Memory profiler. Take heap snapshots, compare. Look for detached DOM, growing arrays/objects. Use Performance Monitor for real-time.

**Difficulty:** 🔴 Hard
**Tags:** #performance #debugging
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Share debugging process: "Memory grew 50MB over 5min usage. Heap snapshots showed 2000 event listeners on removed elements. Found unmounting component didn't cleanup listeners. Added cleanup logic. Memory stable at 15MB. Now monitor with DevTools Performance Monitor in staging."

---

## Card 37: Network Optimization
**Q:** Network performance optimization techniques?

**A:** 1) Reduce requests, 2) Use HTTP/2, 3) Enable compression, 4) CDN, 5) Connection pooling, 6) Reduce payload size, 7) Caching headers.

**Difficulty:** 🟡 Medium
**Tags:** #performance #network
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Discuss multiple layers: "Bundled similar requests (16 → 4 requests). HTTP/2 multiplexing. Brotli compression. CDN reduced origin requests 85%. Keep-alive connection pooling. Payload 4.2MB → 1.1MB. Network waterfall: 3.5s → 800ms. Every optimization compounds."

---

## Card 38: Server-Side Rendering
**Q:** How does SSR improve performance?

**A:** Faster First Contentful Paint, better SEO, content visible before JS loads. Trade-off: longer TTFB, more server load. Use for content-heavy apps.

**Difficulty:** 🟡 Medium
**Tags:** #performance #ssr
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Explain trade-offs: "SSR: FCP 1.2s (fast), but TTFB 300ms. Client: FCP 3.5s, TTFB 100ms. SSR better for SEO and perceived performance. Trade longer server time for faster perceived load. Hybrid: SSR homepage (content-heavy), CSR dashboard (interaction-heavy)."

---

## Card 39: Incremental Static Regeneration
**Q:** What is ISR in Next.js?

**A:** Regenerate static pages after deployment. Best of SSG (fast) and SSR (fresh). Set revalidate time. Good for content that updates occasionally.

**Difficulty:** 🟡 Medium
**Tags:** #performance #nextjs
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Show strategic decision-making: "Blog articles: SSG with ISR (revalidate: 3600). Always fast, regenerates hourly. Product catalog: revalidate: 60 (near real-time). Reduced server load 90% vs SSR. Delivers static HTML at edge. Combines speed of SSG with freshness of SSR."

---

## Card 40: Performance Budget
**Q:** What is a performance budget?

**A:** Limits on metrics: bundle size, load time, LCP, etc. Enforced in CI/CD. Prevents performance regression. Example: JS bundle <200KB, LCP <2.5s.

**Difficulty:** 🟢 Easy
**Tags:** #performance #metrics
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Show quality discipline: "Set performance budgets in CI/CD: JS <200KB, CSS <50KB, LCP <2.5s, CLS <0.1. PR fails if exceeded. Prevents regressions. Bundle grew 15KB? Blocked. Forced optimization discussions early. Team improved performance culture from reactive to proactive."

---

[← Back to Flashcards](../README.md)
