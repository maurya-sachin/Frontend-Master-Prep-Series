# Essential 100 Flashcards

> **The top 100 questions that appear in 80%+ of frontend interviews**

**Time to review:** 50-55 minutes
**Best for:** Final review before interview, assessing your knowledge gaps

---

## Card 1: Closures
**Q:** What is a closure in JavaScript?

**A:** A function that has access to variables in its outer lexical scope, even after the outer function has returned. Used for data privacy and maintaining state.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #closures #fundamentals
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 2: Event Loop
**Q:** Explain the JavaScript event loop.

**A:** The event loop continuously checks the call stack and task queues. It executes synchronous code first, then processes microtasks (Promises), then macrotasks (setTimeout, setInterval).

**Difficulty:** 🟡 Medium
**Tags:** #javascript #async #event-loop
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 3: Promises
**Q:** What are the three states of a Promise?

**A:** Pending (initial state), Fulfilled (operation completed successfully), Rejected (operation failed).

**Difficulty:** 🟢 Easy
**Tags:** #javascript #promises #async
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 4: this Keyword
**Q:** How is the value of 'this' determined?

**A:** Determined by how a function is called: 1) Method call (object.method) - 'this' is the object, 2) Regular function - undefined (strict) or window, 3) Arrow function - lexical 'this', 4) new keyword - new object, 5) call/apply/bind - explicitly set.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #this #context
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 5: Prototypal Inheritance
**Q:** How does prototypal inheritance work in JavaScript?

**A:** Objects can inherit properties and methods from other objects through the prototype chain. When accessing a property, JavaScript looks up the chain until found or reaches null.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #prototypes #inheritance
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 6: Hoisting
**Q:** What is hoisting in JavaScript?

**A:** JavaScript's behavior of moving declarations to the top of their scope during compilation. var is hoisted and initialized with undefined; let/const are hoisted but in Temporal Dead Zone until declaration.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #hoisting #fundamentals
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 7: async/await
**Q:** What is async/await?

**A:** Syntactic sugar over Promises that makes asynchronous code look synchronous. async functions always return a Promise; await pauses execution until Promise resolves.

**Difficulty:** 🟢 Easy
**Tags:** #javascript #async #promises
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 8: Virtual DOM
**Q:** What is the Virtual DOM in React?

**A:** A lightweight JavaScript representation of the actual DOM. React uses it to calculate the minimal set of changes needed to update the real DOM efficiently (reconciliation).

**Difficulty:** 🟡 Medium
**Tags:** #react #virtual-dom #performance
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 9: React Hooks Rules
**Q:** What are the two main rules of React Hooks?

**A:** 1) Only call Hooks at the top level (not inside loops, conditions, or nested functions), 2) Only call Hooks from React function components or custom Hooks.

**Difficulty:** 🟢 Easy
**Tags:** #react #hooks #rules
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 10: useEffect
**Q:** When does useEffect run?

**A:** After every render by default. Runs after browser paint. Can be controlled with dependency array: [] (mount only), [deps] (when deps change), or no array (every render).

**Difficulty:** 🟡 Medium
**Tags:** #react #hooks #useEffect
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 11: useState
**Q:** Why use functional updates with useState?

**A:** When new state depends on previous state, use functional update setState(prev => prev + 1) to avoid stale closures and ensure correct value with batched updates.

**Difficulty:** 🟡 Medium
**Tags:** #react #hooks #useState
**Frequency:** ⭐⭐⭐⭐

---

## Card 12: useMemo vs useCallback
**Q:** What's the difference between useMemo and useCallback?

**A:** useMemo memoizes a computed value (returns the value), useCallback memoizes a function itself (returns the function). Both prevent unnecessary recalculations/recreations.

**Difficulty:** 🟡 Medium
**Tags:** #react #hooks #optimization
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 13: CSS Box Model
**Q:** Describe the CSS box model.

**A:** Every element is a box with: content, padding, border, and margin. box-sizing: border-box makes width include padding and border.

**Difficulty:** 🟢 Easy
**Tags:** #css #box-model #fundamentals
**Frequency:** ⭐⭐⭐⭐

---

## Card 14: Flexbox
**Q:** When would you use flexbox vs grid?

**A:** Flexbox: One-dimensional layouts (rows OR columns), content-driven sizing. Grid: Two-dimensional layouts (rows AND columns), layout-driven sizing.

**Difficulty:** 🟢 Easy
**Tags:** #css #flexbox #grid #layout
**Frequency:** ⭐⭐⭐⭐

---

## Card 15: Semantic HTML
**Q:** Why use semantic HTML?

**A:** Improves accessibility (screen readers), SEO (search engines understand structure), maintainability (clearer code intent), and default styling.

**Difficulty:** 🟢 Easy
**Tags:** #html #semantic #accessibility
**Frequency:** ⭐⭐⭐⭐

---

## Card 16: REST vs GraphQL
**Q:** Main differences between REST and GraphQL?

**A:** REST: Multiple endpoints, over/under-fetching, versioning needed. GraphQL: Single endpoint, request exactly what you need, strongly typed schema, no versioning.

**Difficulty:** 🟡 Medium
**Tags:** #api #rest #graphql
**Frequency:** ⭐⭐⭐⭐

---

## Card 17: HTTP Methods
**Q:** When to use POST vs PUT vs PATCH?

**A:** POST: Create new resource, PUT: Replace entire resource, PATCH: Partial update. POST is not idempotent; PUT and PATCH are idempotent.

**Difficulty:** 🟢 Easy
**Tags:** #http #api #methods
**Frequency:** ⭐⭐⭐⭐

---

## Card 18: CORS
**Q:** What is CORS and why does it exist?

**A:** Cross-Origin Resource Sharing. Browser security feature that blocks requests to different origins unless server explicitly allows it via Access-Control-Allow-Origin header.

**Difficulty:** 🟡 Medium
**Tags:** #security #cors #browser
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 19: JWT
**Q:** What is a JWT token structure?

**A:** Three base64-encoded parts separated by dots: Header (algorithm), Payload (claims/data), Signature (verification). Format: xxxxx.yyyyy.zzzzz

**Difficulty:** 🟡 Medium
**Tags:** #security #jwt #auth
**Frequency:** ⭐⭐⭐⭐

---

## Card 20: LocalStorage vs SessionStorage
**Q:** Difference between localStorage and sessionStorage?

**A:** localStorage persists across browser sessions (no expiration), sessionStorage clears when tab closes. Both have ~5-10MB limit and are synchronous.

**Difficulty:** 🟢 Easy
**Tags:** #browser #storage #api
**Frequency:** ⭐⭐⭐⭐

---

## Card 21: Critical Rendering Path
**Q:** What is the critical rendering path?

**A:** Sequence of steps browser takes to render page: DOM construction, CSSOM construction, Render tree, Layout, Paint. Blocking resources delay rendering.

**Difficulty:** 🟡 Medium
**Tags:** #performance #browser #rendering
**Frequency:** ⭐⭐⭐⭐

---

## Card 22: Core Web Vitals
**Q:** Name the three Core Web Vitals.

**A:** LCP (Largest Contentful Paint - loading performance), FID (First Input Delay - interactivity), CLS (Cumulative Layout Shift - visual stability).

**Difficulty:** 🟢 Easy
**Tags:** #performance #web-vitals #seo
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 23: Debounce vs Throttle
**Q:** What's the difference?

**A:** Debounce delays execution until after inactivity period. Throttle executes at most once per time interval. Debounce for search input, throttle for scroll events.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #performance #patterns
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 24: Pure Functions
**Q:** What makes a function pure?

**A:** 1) Same inputs always return same output, 2) No side effects (doesn't modify external state), 3) Doesn't depend on external mutable state.

**Difficulty:** 🟢 Easy
**Tags:** #javascript #functional #patterns
**Frequency:** ⭐⭐⭐⭐

---

## Card 25: Memoization
**Q:** What is memoization?

**A:** Optimization technique that caches function results based on inputs. Subsequent calls with same inputs return cached result instead of recalculating.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #optimization #caching
**Frequency:** ⭐⭐⭐⭐

---

## Card 26: Event Delegation
**Q:** What is event delegation and why use it?

**A:** Attach single event listener to parent instead of multiple listeners on children. Uses event bubbling. Benefits: Better performance, handles dynamically added elements.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #events #dom
**Frequency:** ⭐⭐⭐⭐

---

## Card 27: SSR vs CSR
**Q:** Server-Side Rendering vs Client-Side Rendering?

**A:** SSR: HTML generated on server, better SEO and initial load. CSR: HTML generated in browser, better interactivity and subsequent navigation. Next.js offers both.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #react #rendering
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 28: Static Generation vs SSR
**Q:** Difference in Next.js?

**A:** Static: HTML generated at build time (getStaticProps), cached and reused. SSR: HTML generated on each request (getServerSideProps). Static is faster but less dynamic.

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #rendering #performance
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 29: TypeScript Interface vs Type
**Q:** When to use interface vs type?

**A:** Interface: Object shapes, can be extended, declaration merging. Type: Unions, intersections, primitives, tuples. Prefer interface for objects, type for everything else.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #types #interfaces
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 30: TypeScript Generics
**Q:** Why use generics?

**A:** Create reusable components that work with multiple types while maintaining type safety. Like function parameters but for types.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #generics #patterns
**Frequency:** ⭐⭐⭐⭐

---

## Card 31: Git Rebase vs Merge
**Q:** When to use rebase vs merge?

**A:** Merge: Preserves history, creates merge commit, use for public branches. Rebase: Linear history, rewrites commits, use for feature branches before merging.

**Difficulty:** 🟡 Medium
**Tags:** #git #version-control
**Frequency:** ⭐⭐⭐

---

## Card 32: Accessibility ARIA
**Q:** When should you use ARIA attributes?

**A:** Only when native HTML semantics don't exist (complex widgets). First rule of ARIA: Don't use ARIA if native HTML works. Examples: aria-label, aria-live, role.

**Difficulty:** 🟡 Medium
**Tags:** #accessibility #aria #a11y
**Frequency:** ⭐⭐⭐⭐

---

## Card 33: Webpack vs Vite
**Q:** Main advantages of Vite over Webpack?

**A:** Vite: Faster dev server (ESM, no bundling), faster HMR, simpler config. Uses esbuild for deps. Webpack: More mature, larger ecosystem, better for complex configs.

**Difficulty:** 🟡 Medium
**Tags:** #tooling #bundlers #build
**Frequency:** ⭐⭐⭐

---

## Card 34: React Keys
**Q:** Why are keys important in React lists?

**A:** Help React identify which items changed, added, or removed. Keys should be stable, unique among siblings. Using index as key can cause bugs with reordering.

**Difficulty:** 🟡 Medium
**Tags:** #react #performance #lists
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 35: Controlled vs Uncontrolled
**Q:** Difference in React forms?

**A:** Controlled: React state is source of truth (value + onChange). Uncontrolled: DOM is source of truth (useRef). Controlled gives more control, uncontrolled is simpler.

**Difficulty:** 🟡 Medium
**Tags:** #react #forms #state
**Frequency:** ⭐⭐⭐⭐

---

## Card 36: React Context
**Q:** When to use Context vs props?

**A:** Context: Data needed by many components at different nesting levels (theme, user, language). Props: Most data passing, keeps component reusable and testable.

**Difficulty:** 🟡 Medium
**Tags:** #react #context #state-management
**Frequency:** ⭐⭐⭐⭐

---

## Card 37: useRef
**Q:** What are the two main uses of useRef?

**A:** 1) Access DOM elements directly (like document.querySelector), 2) Store mutable values that persist across renders without causing re-renders.

**Difficulty:** 🟡 Medium
**Tags:** #react #hooks #useRef
**Frequency:** ⭐⭐⭐⭐

---

## Card 38: React Fiber
**Q:** What is React Fiber?

**A:** React's reconciliation algorithm. Breaks rendering work into chunks, can pause/resume work, prioritize updates. Enables Concurrent Mode and Suspense.

**Difficulty:** 🔴 Hard
**Tags:** #react #fiber #internals
**Frequency:** ⭐⭐⭐

---

## Card 39: CSS Specificity
**Q:** How is CSS specificity calculated?

**A:** Count: inline styles (1000), IDs (100), classes/attributes/pseudo-classes (10), elements (1). Higher total wins. !important overrides all.

**Difficulty:** 🟡 Medium
**Tags:** #css #specificity #fundamentals
**Frequency:** ⭐⭐⭐⭐

---

## Card 40: Position Values
**Q:** Explain CSS position values.

**A:** static (default, normal flow), relative (offset from normal position), absolute (offset from positioned ancestor), fixed (offset from viewport), sticky (relative until threshold, then fixed).

**Difficulty:** 🟡 Medium
**Tags:** #css #position #layout
**Frequency:** ⭐⭐⭐⭐

---

## Card 41: JavaScript Modules
**Q:** ESM vs CommonJS?

**A:** ESM: import/export, static analysis, tree-shaking, async loading. CommonJS: require/module.exports, dynamic, synchronous. ESM is modern standard.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #modules #import
**Frequency:** ⭐⭐⭐⭐

---

## Card 42: Lazy Loading
**Q:** How to lazy load images?

**A:** Use loading="lazy" attribute (native), Intersection Observer API, or libraries. Defers loading until near viewport. Improves initial page load.

**Difficulty:** 🟢 Easy
**Tags:** #performance #images #optimization
**Frequency:** ⭐⭐⭐⭐

---

## Card 43: Web Workers
**Q:** What are Web Workers?

**A:** Run JavaScript in background threads, don't block main thread. No DOM access. Use for heavy computations. Communicate via postMessage.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #performance #threading
**Frequency:** ⭐⭐⭐

---

## Card 44: Service Workers
**Q:** What do Service Workers enable?

**A:** Offline functionality, push notifications, background sync, caching strategies. Acts as proxy between app and network. Required for PWAs.

**Difficulty:** 🟡 Medium
**Tags:** #pwa #service-workers #offline
**Frequency:** ⭐⭐⭐

---

## Card 45: XSS Attack
**Q:** What is XSS and how to prevent it?

**A:** Cross-Site Scripting: Injecting malicious scripts into web pages. Prevent: Sanitize user input, escape output, use Content Security Policy, avoid innerHTML with user data.

**Difficulty:** 🟡 Medium
**Tags:** #security #xss #vulnerabilities
**Frequency:** ⭐⭐⭐⭐

---

## Card 46: CSRF Attack
**Q:** What is CSRF and how to prevent it?

**A:** Cross-Site Request Forgery: Trick user into unwanted actions on authenticated site. Prevent: CSRF tokens, SameSite cookies, verify origin headers.

**Difficulty:** 🟡 Medium
**Tags:** #security #csrf #vulnerabilities
**Frequency:** ⭐⭐⭐

---

## Card 47: HTTP Status Codes
**Q:** Common status codes?

**A:** 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable.

**Difficulty:** 🟢 Easy
**Tags:** #http #status-codes #api
**Frequency:** ⭐⭐⭐⭐

---

## Card 48: Responsive Design
**Q:** Mobile-first vs desktop-first?

**A:** Mobile-first: Start with mobile styles, add complexity for larger screens (min-width). Desktop-first: Start with desktop, simplify for mobile (max-width). Mobile-first is recommended.

**Difficulty:** 🟢 Easy
**Tags:** #css #responsive #mobile
**Frequency:** ⭐⭐⭐⭐

---

## Card 49: REST API Design
**Q:** Best practices for REST APIs?

**A:** Use nouns for resources, HTTP methods for actions, proper status codes, versioning, pagination, filtering, consistent naming, HATEOAS (optional).

**Difficulty:** 🟡 Medium
**Tags:** #api #rest #design
**Frequency:** ⭐⭐⭐⭐

---

## Card 50: Testing Types
**Q:** Unit vs Integration vs E2E tests?

**A:** Unit: Test individual functions in isolation. Integration: Test multiple components together. E2E: Test entire user flows. Pyramid: Lots of unit, some integration, few E2E.

**Difficulty:** 🟢 Easy
**Tags:** #testing #quality #types
**Frequency:** ⭐⭐⭐⭐

---

## Card 51: Async/Await Error Handling
**Q:** What are the best practices for error handling with async/await?

**A:** 1) Use try/catch blocks for each async operation, 2) Handle errors at appropriate level (don't catch too early), 3) Consider using wrapper functions for consistent error handling, 4) Always handle promise rejections to avoid unhandled rejection warnings.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #async #error-handling
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 52: Promise.all vs Promise.allSettled
**Q:** When to use Promise.all vs Promise.allSettled?

**A:** Promise.all: Fails fast if any promise rejects, returns array of all results. Promise.allSettled: Waits for all promises, returns array with status (fulfilled/rejected) for each. Use allSettled when you need all results regardless of failures.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #promises #async
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 53: Promise.race vs Promise.any
**Q:** Difference between Promise.race and Promise.any?

**A:** Promise.race: Returns first settled promise (fulfilled OR rejected). Promise.any: Returns first fulfilled promise, only rejects if all reject. Use race for timeouts, any for fallback patterns.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #promises #async
**Frequency:** ⭐⭐⭐⭐

---

## Card 54: Microtasks vs Macrotasks
**Q:** What's the difference between microtasks and macrotasks?

**A:** Microtasks: Promise callbacks, queueMicrotask, run after current script but before rendering. Macrotasks: setTimeout, setInterval, I/O, run after microtask queue is empty. Event loop processes all microtasks before next macrotask.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #event-loop #async
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 55: Event Loop Execution Order
**Q:** What is the order of execution in the event loop?

**A:** 1) Call stack (synchronous code), 2) Microtask queue (Promises, queueMicrotask), 3) Render (if needed), 4) Macrotask queue (setTimeout, setInterval), 5) Repeat. All microtasks run before ANY macrotask.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #event-loop #async
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 56: Async/Await vs Promises
**Q:** When should you prefer async/await over .then()?

**A:** async/await: Better for sequential operations, easier error handling with try/catch, cleaner code. .then(): Better for parallel operations with Promise.all, chaining multiple operations, working with non-async code.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #async #promises
**Frequency:** ⭐⭐⭐⭐

---

## Card 57: Function Currying
**Q:** What is function currying?

**A:** Transform function with multiple arguments into sequence of functions each taking single argument. f(a,b,c) becomes f(a)(b)(c). Benefits: Partial application, reusable specialized functions, better composition.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #functional #currying
**Frequency:** ⭐⭐⭐⭐

---

## Card 58: bind vs call vs apply
**Q:** What's the difference between bind, call, and apply?

**A:** call: Invokes function immediately with specified 'this' and individual arguments. apply: Same but arguments as array. bind: Returns new function with bound 'this', doesn't invoke immediately. Use bind for event handlers.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #this #methods
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 59: Partial Application
**Q:** What is partial application?

**A:** Fixing some arguments of a function and producing a new function with fewer parameters. Similar to currying but fixes multiple args at once. Use bind or closures to implement. Useful for creating specialized functions from generic ones.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #functional #patterns
**Frequency:** ⭐⭐⭐

---

## Card 60: Async Iterator
**Q:** How do async iterators work?

**A:** Objects with async next() method that returns Promise resolving to {value, done}. Use with for await...of loops. Useful for paginated API calls, streaming data, or sequential async operations.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #async #iterators
**Frequency:** ⭐⭐⭐

---

## Card 61: Common Async Pitfall - Sequential vs Parallel
**Q:** What's wrong with: await fetch(url1); await fetch(url2)?

**A:** Runs sequentially (waits for first before starting second). Use Promise.all([fetch(url1), fetch(url2)]) to run in parallel. Sequential doubles the time. Always parallelize independent async operations.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #async #performance
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 62: Async Pitfall - forEach
**Q:** Why doesn't async/await work with forEach?

**A:** forEach doesn't wait for promises, callback isn't awaited. Use for...of loop, map with Promise.all, or for await...of for async iterables. forEach ignores promise returns.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #async #arrays
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 63: Promise Constructor Anti-pattern
**Q:** When should you avoid creating new Promise?

**A:** Don't wrap existing promises (return existing promise directly). Don't use for synchronous code. Only use constructor when integrating callback-based APIs (fs, setTimeout) with promises.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #promises #patterns
**Frequency:** ⭐⭐⭐⭐

---

## Card 64: Top-level await
**Q:** What is top-level await?

**A:** Using await outside async function at module top level. ES2022 feature. Blocks module execution until promise resolves. Useful for dynamic imports, resource initialization. Can delay app startup if overused.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #async #modules
**Frequency:** ⭐⭐⭐

---

## Card 65: Promise Memory Leaks
**Q:** How can promises cause memory leaks?

**A:** 1) Uncaught rejections that keep references, 2) Long-running promises never settling, 3) Circular references in promise chains, 4) Not cleaning up resources in finally block. Always handle rejections and use cleanup logic.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #promises #memory
**Frequency:** ⭐⭐⭐

---

## Card 66: Async Function Return Value
**Q:** What does an async function always return?

**A:** Always returns a Promise, even if you return a non-promise value. Return value is wrapped in Promise.resolve(). Throwing error is equivalent to Promise.reject(). You can't return non-promise from async function.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #async #promises
**Frequency:** ⭐⭐⭐⭐

---

## Card 67: Race Condition in Async Code
**Q:** How do race conditions occur with async/await?

**A:** Multiple async operations modifying shared state, with unpredictable completion order. Solution: Serialize operations with await, use request IDs to ignore stale responses, use cancellation tokens, or mutex patterns.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #async #concurrency
**Frequency:** ⭐⭐⭐⭐

---

## Card 68: Curry Implementation
**Q:** How do you implement a basic curry function?

**A:** Collect arguments until reaching original function's arity, then invoke. Check if enough args collected (curried.length), if yes call original, if no return new function collecting more args. Use closures to accumulate arguments.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #currying #implementation
**Frequency:** ⭐⭐⭐⭐

---

## Card 69: AbortController with Fetch
**Q:** How does AbortController work with async operations?

**A:** Create AbortController, pass signal to fetch/async operation. Call abort() to cancel. Listen for 'abort' event. Promise rejects with AbortError. Clean up resources on abort. Useful for canceling stale requests.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #async #fetch
**Frequency:** ⭐⭐⭐⭐

---

## Card 70: Async Stack Traces
**Q:** Why are async stack traces difficult to debug?

**A:** Stack trace is lost across async boundaries. Each await creates new call stack. Error stack only shows immediate context, not original caller. Use async_hooks (Node.js), browser DevTools async mode, or error monitoring tools for better traces.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #async #debugging
**Frequency:** ⭐⭐⭐

---

## Card 71: TypeScript Type vs Interface
**Q:** When should you use type vs interface in TypeScript?

**A:** Use interface for object shapes, especially when extending or implementing. Use type for unions, intersections, primitives, tuples, and complex type logic. Interfaces can be merged (declaration merging), types cannot. Performance is similar.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #types #interfaces
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 72: TypeScript Generics
**Q:** What are generics in TypeScript?

**A:** Type variables that allow writing flexible, reusable code that works with multiple types. Like function parameters for types. Use `<T>` syntax. Common in arrays, promises, functions, and React components.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #generics #types
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 73: React FC vs Function Component
**Q:** Should you use React.FC for typing components?

**A:** React.FC is discouraged (removed from Create React App). It has implicit children, restricts generics, adds unused defaultProps. Better: Use regular function with typed props: `function Component(props: Props) { }`

**Difficulty:** 🟡 Medium
**Tags:** #react #typescript #components
**Frequency:** ⭐⭐⭐⭐

---

## Card 74: TypeScript Utility Types
**Q:** Name 5 common TypeScript utility types.

**A:** 1) Partial<T> (all optional), 2) Required<T> (all required), 3) Pick<T, K> (select properties), 4) Omit<T, K> (exclude properties), 5) Record<K, T> (create object type). Also: ReturnType, Parameters, Awaited, NonNullable.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #utility-types
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 75: React Props with Children
**Q:** How do you type children prop in TypeScript?

**A:** Use `React.ReactNode` for any renderable content (elements, strings, numbers, null). For specific types: `React.ReactElement` (only elements), `React.ComponentType` (component itself), or specific JSX types.

**Difficulty:** 🟡 Medium
**Tags:** #react #typescript #props
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 76: TypeScript Mapped Types
**Q:** What are mapped types in TypeScript?

**A:** Transform properties of existing type. Syntax: `{[K in keyof T]: ...}`. Iterate over keys, modify property types, add/remove modifiers (readonly, optional). Used in Partial, Required, Pick, etc.

**Difficulty:** 🔴 Hard
**Tags:** #typescript #mapped-types #advanced
**Frequency:** ⭐⭐⭐⭐

---

## Card 77: React useState with TypeScript
**Q:** How do you type useState with objects?

**A:** TypeScript infers type from initial value. For complex types: `useState<User | null>(null)` or `useState<User>({} as User)`. Use union with null for loading states. Inference works for primitives.

**Difficulty:** 🟢 Easy
**Tags:** #react #typescript #hooks
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 78: TypeScript Conditional Types
**Q:** What are conditional types?

**A:** Types that select types based on conditions: `T extends U ? X : Y`. Like ternary operator for types. Used with `infer` to extract types. Foundation for ReturnType, Parameters, Awaited.

**Difficulty:** 🔴 Hard
**Tags:** #typescript #conditional-types #advanced
**Frequency:** ⭐⭐⭐⭐

---

## Card 79: React useRef with TypeScript
**Q:** How do you type useRef in TypeScript?

**A:** For DOM elements: `useRef<HTMLDivElement>(null)`. For mutable values: `useRef<number>(0)`. Ref.current is nullable for DOM refs, non-null for mutable refs. Use non-null assertion or check before accessing.

**Difficulty:** 🟡 Medium
**Tags:** #react #typescript #hooks
**Frequency:** ⭐⭐⭐⭐

---

## Card 80: TypeScript Type Narrowing
**Q:** What is type narrowing in TypeScript?

**A:** Refining type to more specific type within conditional block. Using: typeof, instanceof, in operator, truthiness checks, equality, type predicates. TypeScript tracks control flow to narrow types.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #narrowing #types
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 81: React Event Handlers TypeScript
**Q:** How do you type event handlers in React?

**A:** Use React.ChangeEvent<HTMLInputElement> for inputs, React.MouseEvent<HTMLButtonElement> for clicks, React.FormEvent<HTMLFormElement> for forms. Generic parameter specifies element type.

**Difficulty:** 🟢 Easy
**Tags:** #react #typescript #events
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 82: TypeScript Union vs Intersection
**Q:** What's the difference between union (|) and intersection (&)?

**A:** Union: value can be one of several types (A | B). Intersection: value must satisfy all types (A & B). Union is "OR", intersection is "AND". Intersection merges object types.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #unions #intersections
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 83: React Custom Hook TypeScript
**Q:** How do you type a custom React hook?

**A:** Return type is inferred from return statement. For tuple returns, use `as const` or explicit type. Example: `function useToggle(): [boolean, () => void]`. Generics for reusable hooks.

**Difficulty:** 🟡 Medium
**Tags:** #react #typescript #hooks
**Frequency:** ⭐⭐⭐⭐

---

## Card 84: TypeScript Type Guards
**Q:** What are type guards in TypeScript?

**A:** Functions that perform runtime check and narrow type. Return type: `value is Type`. Example: `function isString(x: unknown): x is string { return typeof x === 'string'; }`. TypeScript narrows type after check.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #type-guards #narrowing
**Frequency:** ⭐⭐⭐⭐

---

## Card 85: React Props Spreading TypeScript
**Q:** How do you type component with spread props?

**A:** Extend from React.ComponentProps or React.HTMLAttributes: `interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> { label: string }`. Allows passing any button props.

**Difficulty:** 🟡 Medium
**Tags:** #react #typescript #props
**Frequency:** ⭐⭐⭐⭐

---

## Card 86: TypeScript never Type
**Q:** When is the never type used?

**A:** Represents values that never occur. Uses: 1) Function that never returns (throws/infinite loop), 2) Exhaustiveness checking in switch, 3) Filtering in conditional types, 4) Impossible intersections.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #never #types
**Frequency:** ⭐⭐⭐

---

## Card 87: React Context TypeScript
**Q:** How do you type React Context?

**A:** Create type/interface for context value. Use `React.createContext<ContextType | undefined>(undefined)` for optional, or throw in provider if undefined. Use generic: `createContext<Type>(defaultValue)`.

**Difficulty:** 🟡 Medium
**Tags:** #react #typescript #context
**Frequency:** ⭐⭐⭐⭐

---

## Card 88: TypeScript const Assertions
**Q:** What is const assertion (as const)?

**A:** Narrows type to literal values, makes properties readonly, converts array to readonly tuple. `as const` tells TypeScript value won't change. Example: `const colors = ['red', 'blue'] as const` gives readonly tuple type.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #const #literals
**Frequency:** ⭐⭐⭐⭐

---

## Card 89: React useReducer TypeScript
**Q:** How do you type useReducer?

**A:** Define State and Action types. Union for action types: `Action = {type: 'increment'} | {type: 'set', payload: number}`. Reducer: `(state: State, action: Action) => State`. TypeScript infers from reducer.

**Difficulty:** 🟡 Medium
**Tags:** #react #typescript #hooks
**Frequency:** ⭐⭐⭐⭐

---

## Card 90: TypeScript Index Signatures
**Q:** What are index signatures in TypeScript?

**A:** Define types for object with unknown keys: `{ [key: string]: Type }`. Used for dictionaries, maps. Key can be string, number, symbol. All properties must match signature type.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #index-signatures #objects
**Frequency:** ⭐⭐⭐⭐

---

## Card 91: React Component Props Inference
**Q:** How do you extract props type from a component?

**A:** Use React.ComponentProps: `type ButtonProps = React.ComponentProps<typeof Button>`. For class: `React.ComponentProps<typeof ClassComponent>`. Gets all props including HTML attributes.

**Difficulty:** 🟡 Medium
**Tags:** #react #typescript #props
**Frequency:** ⭐⭐⭐

---

## Card 92: TypeScript Template Literal Types
**Q:** What are template literal types?

**A:** Create types from string literals using template syntax: `type Greeting = \`hello ${string}\``. Combine with unions for permutations. Used in mapped types for key transformation. ES6 template syntax at type level.

**Difficulty:** 🔴 Hard
**Tags:** #typescript #template-literals #advanced
**Frequency:** ⭐⭐⭐

---

## Card 93: React Async Component TypeScript
**Q:** How do you type async data in components?

**A:** Use union for loading states: `data: User | null | undefined`. Or explicit state: `{ data: User | null; loading: boolean; error: Error | null }`. Discriminated union for better checks.

**Difficulty:** 🟡 Medium
**Tags:** #react #typescript #async
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 94: TypeScript infer Keyword
**Q:** What is the infer keyword in TypeScript?

**A:** Extract type from complex type in conditional type. Syntax: `T extends infer U ? ... : ...`. Common in ReturnType: `T extends (...args: any[]) => infer R ? R : never`. Extracts matched type.

**Difficulty:** 🔴 Hard
**Tags:** #typescript #infer #advanced
**Frequency:** ⭐⭐⭐

---

## Card 95: React Render Props TypeScript
**Q:** How do you type render props pattern?

**A:** Function prop that receives data and returns JSX: `render: (data: Data) => React.ReactNode`. Or children function: `children: (data: Data) => React.ReactNode`. Pass typed data to function.

**Difficulty:** 🟡 Medium
**Tags:** #react #typescript #patterns
**Frequency:** ⭐⭐⭐

---

## Card 96: TypeScript Discriminated Unions
**Q:** What are discriminated unions?

**A:** Union types with common literal property (discriminant). Example: `{type: 'success', data: T} | {type: 'error', error: Error}`. TypeScript narrows type based on discriminant. Pattern matching alternative.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #unions #patterns
**Frequency:** ⭐⭐⭐⭐

---

## Card 97: React forwardRef TypeScript
**Q:** How do you type forwardRef?

**A:** Two type parameters: props and ref: `forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => ...)`. Ref type matches DOM element. Props type is component props interface.

**Difficulty:** 🟡 Medium
**Tags:** #react #typescript #refs
**Frequency:** ⭐⭐⭐⭐

---

## Card 98: TypeScript Type Assertions
**Q:** When should you use type assertions (as)?

**A:** When you know more than TypeScript about a type. Use sparingly: after DOM queries, in type conversions, with any. Prefer type guards. `as const` for literal types. ! for non-null assertion.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #assertions #casting
**Frequency:** ⭐⭐⭐⭐

---

## Card 99: React Higher-Order Component TypeScript
**Q:** How do you type Higher-Order Components?

**A:** Generic function: `function withHOC<P>(Component: React.ComponentType<P>): React.ComponentType<P>`. Intersect injected props: `P & InjectedProps`. Omit if HOC adds props: `Omit<P, 'injectedProp'> & {...}`.

**Difficulty:** 🔴 Hard
**Tags:** #react #typescript #hoc
**Frequency:** ⭐⭐⭐

---

## Card 100: TypeScript unknown vs any
**Q:** What's the difference between unknown and any?

**A:** any disables type checking (escape hatch). unknown is type-safe any - must narrow type before use. unknown can't be assigned to anything without check. Use unknown for truly unknown values, never use any.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #unknown #any
**Frequency:** ⭐⭐⭐⭐⭐

---

## 🎯 How to Use These Cards

1. **First Pass:** Go through all 100, mark the ones you struggle with
2. **Focus on Weak Areas:** Review marked cards daily
3. **Spaced Repetition:** Review Day 1, 3, 7, 14, 30
4. **Before Interview:** Quick 50-minute review of all 100
5. **Explain Out Loud:** Teaching solidifies understanding

---

## 📊 Your Progress

- [ ] Reviewed all 100 cards once
- [ ] Can explain 75+ without looking
- [ ] Reviewed weak cards 3+ times
- [ ] Can explain all 100 confidently
- [ ] Ready for interview!

---

[← Back to Flashcards](../README.md) | [Next: Pre-Interview 30 →](./pre-interview-30.md)
