# Performance Coding Challenges

Advanced performance optimization challenges for frontend interviews.

## Challenges

### 1. Request Batching and Deduplication
**Difficulty:** 🔴 Hard | **Frequency:** ⭐⭐⭐⭐⭐ | **Time:** 60 minutes

Optimize network performance by batching multiple API calls and deduplicating in-flight requests. Includes:
- Request batching with setTimeout/microtask scheduling
- Request deduplication with in-flight promise caching
- DataLoader pattern (Facebook) implementation
- React hook (useBatchedRequest) for component integration
- Advanced features: retries, timeouts, statistics, hooks
- GraphQL batch query optimization
- Real-world autocomplete example with both techniques
- Network waterfall diagrams showing 80%+ optimization
- Performance metrics (request reduction, latency improvement)
- Common mistakes: race conditions, memory leaks, stale data
- Follow-up: HTTP/2 multiplexing, GraphQL vs REST strategies

[Read Challenge](./request-batching.md)

---

### 2. Memoization and Caching Strategies
**Difficulty:** 🔴 Hard | **Frequency:** ⭐⭐⭐⭐ | **Time:** 45 minutes

Implement advanced memoization and caching to prevent redundant computations. Includes:
- Basic memoization with closure and Map storage
- Advanced memoization with timeout and dependency tracking
- LRU cache implementation for bounded memory
- Memoization in React (useMemo, useCallback patterns)
- Performance profiling and benchmarking
- Real-world example: Fibonacci optimization
- Common mistakes: stale closures, memory leaks
- Interview answer templates

[Read Challenge](./memoization.md)

---

### 3. Web Workers for Heavy Computations
**Difficulty:** 🔴 Hard | **Frequency:** ⭐⭐⭐⭐ | **Time:** 60 minutes

Offload CPU-intensive tasks from the main thread using Web Workers. Includes:
- Basic worker implementation with worker pool pattern
- TypeScript integration with typed workers
- React hook (useWebWorker) for ergonomic usage
- Comlink library for RPC-style communication
- Transferable Objects optimization (10-100x faster for large data)
- Real-world CSV parsing example (100K rows)
- Performance metrics and timing breakdown
- Common mistakes and optimization strategies

[Read Challenge](./web-workers.md)

---

### 4. Code Splitting and Dynamic Imports
**Difficulty:** 🔴 Hard | **Frequency:** ⭐⭐⭐⭐⭐ | **Time:** 45-60 minutes

Optimize bundle size and Time to Interactive through intelligent code splitting. Includes:
- Route-based code splitting with React.lazy() and Suspense
- Component-level lazy loading with Suspense boundaries
- Webpack magic comments (prefetch, preload, chunkName)
- Library code splitting strategies (lazy load heavy dependencies)
- TypeScript support with type-safe lazy components
- Prefetch and preload strategies (predictive, route-based)
- Webpack 5 configuration and optimization
- Real metrics: 60-80% bundle reduction, 3.5x TTI improvement
- Common mistakes: over-splitting, waterfalls, missing preload hints
- Error handling and chunk loading failures
- Performance monitoring and bundle analysis tools

[Read Challenge](./code-splitting.md)

---

### 5. Lazy Image Loading and Optimization
**Difficulty:** 🟡 Medium | **Frequency:** ⭐⭐⭐⭐ | **Time:** 45 minutes

Optimize image delivery through lazy loading, responsive images, and format optimization. Includes:
- Native lazy loading (loading="lazy")
- Intersection Observer API implementation
- LQIP (Low Quality Image Placeholder) technique
- Responsive images with srcset and picture element
- Modern image formats (WebP, AVIF) with fallbacks
- Progressive enhancement strategies
- Lighthouse score improvement (from 40 to 95+)
- Real-world e-commerce optimization
- Common mistakes and best practices

[Read Challenge](./lazy-images.md)

---

## Topics Covered

| Challenge | Concepts | Skills |
|-----------|----------|--------|
| Request Batching | Batch scheduling, Deduplication, Promise handling, GraphQL patterns | Network optimization, Async, Systems design |
| Memoization | Caching strategies, LRU cache, React hooks, Memory management | Algorithms, Performance, React |
| Web Workers | Threading, Message passing, Worker pool, Transferable Objects | Architecture, Async, TypeScript |
| Code Splitting | Dynamic imports, Lazy loading, Chunk strategy, Webpack config | Build tools, Performance, Architecture |
| Lazy Images | Intersection Observer, Responsive design, Image formats | Web APIs, Optimization, Accessibility |

## Interview Tips

### Request Batching & Network Optimization
1. **Batch size matters** - 5-20 items typical; balance throughput vs latency
2. **Know deduplication patterns** - In-flight promise caching prevents redundant requests
3. **Understand DataLoader** - Facebook's pattern solves N+1 problem elegantly
4. **Handle race conditions** - Preserve request order; prevent stale data
5. **Measure impact** - Show before/after metrics (requests, bandwidth, latency)
6. **Consider GraphQL** - Native batching; better than REST pagination hacks
7. **Memory discipline** - Clean up in-flight cache; prevent leaks in SPAs
8. **Production features** - Retries, timeouts, statistics tracking matter in real systems

### Memoization & Caching
1. **Cache invalidation is hard** - Two hardest problems in CS: naming, cache invalidation, off-by-one errors
2. **Know your structures** - Map for size tracking, Object for simplicity
3. **LRU pattern** - Common interview follow-up; practice Doubly Linked List + Map
4. **React-specific** - useMemo dependencies, useCallback stale closures
5. **Measure overhead** - Cache lookup cost vs computation cost; break even point
6. **TTL matters** - Time-based expiration prevents stale data in long-running apps

### Web Workers & Threading
1. **Understand the threading model** - Web Workers run in separate threads, not async/await
2. **Know when to use workers** - Computation > 100ms is the sweet spot
3. **Master data transfer** - Transferable Objects are critical for performance
4. **Build worker pool** - Reusing workers is more efficient than creating new ones
5. **Test responsiveness** - Prove UI stays responsive during heavy computation
6. **Optimize serialization** - JSON.stringify is slow, use typed arrays when possible

### Code Splitting & Dynamic Imports
1. **Know what to split** - Routes are primary; heavy components (>50KB) secondary
2. **Avoid over-splitting** - Too many small chunks creates overhead (many HTTP requests, duplicated code)
3. **Master prefetch vs preload** - Preload = now (critical), Prefetch = later (nice-to-have)
4. **Handle errors gracefully** - Use Error Boundary for chunk load failures; implement retry logic
5. **Measure impact** - Show before/after bundle size, TTI, FCP metrics
6. **Understand waterfalls** - Multiple Suspense boundaries can create sequential loading instead of parallel
7. **TypeScript matters** - Type-safe lazy components prevent runtime errors in team environments

### Image Optimization
1. **Lazy load everything except hero image** - Above-fold only needs eager loading
2. **Use modern formats** - WebP (30% smaller), AVIF (20% smaller than WebP)
3. **Responsive design** - srcset attributes reduce bandwidth by 40-60%
4. **LQIP strategy** - Low Quality Image Placeholder improves perceived performance
5. **Intersection Observer** - More efficient than scroll listeners for lazy loading
6. **Progressive enhancement** - Support old browsers with fallbacks

---

[← Back to Coding Challenges](../README.md)
