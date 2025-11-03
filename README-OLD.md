# Frontend Developer Interview Prep — 600+ Advanced Questions

Comprehensive preparation guide covering **JavaScript**, **React**, **Next.js**, **HTML**, **CSS**, **Accessibility**, **Performance**, and **Frontend Architecture** — designed for interviews up to 6 years of experience.

---

## 🧠 Stage 1 — JavaScript (Core, Advanced, ES6+, Async, Engine)

*(Includes: event loop, call stack, callback queue, micro/macro task queues, closures, hoisting, shadowing, prototypes, promises, async/await, modules, memory, performance, etc.)*

### 🧩 **Core Concepts**

1. What are primitive and non-primitive data types in JS?
2. Difference between `var`, `let`, and `const`.
3. What is the difference between declaration, initialization, and assignment?
4. What is hoisting in JavaScript?
5. What is the Temporal Dead Zone (TDZ)?
6. What are lexical scope and block scope?
7. What is global scope pollution?
8. What is variable shadowing and illegal shadowing?
9. What is scope chaining?
10. How does JavaScript resolve variable lookup?
11. What is closure and how does it work?
12. Real-world example of closure.
13. What is function currying and why use it?
14. What are higher-order functions?
15. What is a pure function?
16. What is referential transparency?
17. What is memoization? Implement custom memoize().
18. What is immutability? How to enforce it?
19. What are side effects in JS functions?
20. What is recursion and tail call optimization?

---

### ⚙️ **Execution Context & Event Loop**

21. What is the JS execution context?
22. Explain creation and execution phases.
23. What is the Call Stack?
24. What is the Execution Stack?
25. What is the difference between stack and heap memory?
26. How does JS handle function invocation?
27. What are the components of the execution context?
28. What are lexical environments?
29. How does variable environment differ from lexical environment?
30. What is a scope chain and how is it created?
31. What is the event loop and how does it work?
32. What are macro tasks and micro tasks?
33. What is the callback queue?
34. What is the microtask queue?
35. Order of execution between setTimeout, promises, async/await.
36. What is a rendering phase in the browser event loop?
37. What happens when a Promise resolves inside a setTimeout?
38. Explain the concept of message queue.
39. What is process.nextTick in Node.js?
40. What are requestAnimationFrame callbacks?

---

### ⏱ **Asynchronous JavaScript**

41. What is synchronous vs asynchronous code?
42. How does JS achieve async behavior on a single thread?
43. What are callbacks?
44. What is callback hell?
45. How do Promises solve callback hell?
46. What are the 3 states of a Promise?
47. What is the event loop’s role in promises?
48. What is `Promise.all()`?
49. Difference between `Promise.all`, `Promise.race`, `Promise.any`, `Promise.allSettled`.
50. What is a rejected Promise?
51. What is async/await syntax sugar for?
52. How does async/await work under the hood?
53. What happens when you forget `await`?
54. What is top-level await?
55. What are race conditions in JS async flows?
56. How do you cancel promises?
57. What are Observables (RxJS)?
58. What’s the difference between async iterators and generators?
59. How to chain async functions effectively?
60. Difference between microtasks and macrotasks in async/await?

---

### 🔁 **Functions, Binding & Context**

61. What is `this` keyword in JavaScript?
62. How is `this` determined in different contexts?
63. Difference between implicit, explicit, and default binding?
64. What is the value of `this` inside arrow functions?
65. What are call, apply, and bind methods?
66. Implement a custom `.bind()` polyfill.
67. What is the difference between normal function and arrow function scope?
68. What happens if you use `this` in a callback?
69. How does function borrowing work?
70. What is function composition?
71. What is partial application?
72. How does `new` operator work internally?
73. What happens when you return an object from a constructor?
74. What is function hoisting?
75. Difference between function declaration and function expression.
76. What is Immediately Invoked Function Expression (IIFE)?
77. Why is IIFE useful for modularity?
78. How to create private variables in JS?
79. What is a closure trap (loop + var)?
80. What is a higher-order function vs callback function?

---

### 🧱 **Objects, Prototypes & Classes**

81. How does prototypal inheritance work?
82. What is the prototype chain?
83. How does `Object.create()` work?
84. Difference between classical and prototypal inheritance.
85. How does `instanceof` check inheritance?
86. What is constructor property?
87. What is `Object.getPrototypeOf()`?
88. Difference between `__proto__` and `prototype`.
89. How to achieve multiple inheritance?
90. What are static methods in classes?
91. What is a mixin?
92. What are getters and setters?
93. What are Symbols and when to use them?
94. What are Maps and WeakMaps?
95. What is the difference between WeakMap and Map?
96. What is the difference between shallow and deep copy?
97. How to deep clone an object safely?
98. What is structuredClone()?
99. What is JSON.parse(JSON.stringify()) limitation?
100. How to merge two objects immutably?

---

### 💾 **Memory, Engine, and Optimization**

101. How does JavaScript manage memory?
102. What is garbage collection?
103. What are reference-counting and mark-and-sweep algorithms?
104. What is memory leak?
105. What causes memory leaks in closures?
106. What is heap and stack difference?
107. What is inline caching?
108. What is hidden class optimization (V8)?
109. What is JIT compilation?
110. What is de-optimization in V8?
111. What is event delegation?
112. What is debouncing? Implement custom debounce().
113. What is throttling? Implement custom throttle().
114. How does JS engine optimize loops?
115. How does garbage collector detect unused references?
116. What is memory fragmentation?
117. What is the role of “hidden classes” in V8 optimization?
118. Why are closures memory-heavy?
119. How to debug memory leaks in Chrome DevTools?
120. How to avoid blocking the main thread?

---

### 🔍 **Modules, Imports & Patterns**

121. Difference between ES6 modules and CommonJS.
122. What are default and named exports?
123. What happens when you mix import/export styles?
124. What is dynamic import()?
125. How to lazy load modules in JS?
126. What are module scopes and singletons?
127. What is the module pattern?
128. What is revealing module pattern?
129. How to create a namespace in JS?
130. What are IIFEs used for in modularity?
131. What are bundlers like Webpack/Vite doing with imports?
132. What is tree shaking?
133. What is sideEffects flag in package.json?
134. What are circular dependencies and how to resolve them?
135. What are ESM vs CJS differences in Node.js?
136. What are top-level awaits used for?
137. How does static analysis of imports enable tree shaking?
138. What is dynamic chunking?
139. How does Next.js perform code splitting using ESM?
140. What is dead code elimination?

---

### 🧠 **Advanced JS Behavior**

141. What is type coercion?
142. Difference between `==` and `===`.
143. How does JavaScript handle NaN?
144. Why `typeof null` returns object?
145. What are falsy values?
146. Difference between `undefined` and `null`.
147. What is optional chaining (`?.`)?
148. What is nullish coalescing (`??`)?
149. What are tagged template literals?
150. What is destructuring?
151. What is rest and spread operator difference?
152. What is default parameter in functions?
153. What are template literals used for?
154. What are iterables and iterators?
155. How does for..of differ from for..in?
156. What is generator function?
157. What is yield and next()?
158. Difference between generator and async function?
159. What are proxies and reflect APIs?
160. What are intercept traps in Proxy?
161. How can Proxy be used for validation?
162. What is Reflect.construct()?
163. What is custom iterator protocol?
164. How does async iterator differ from sync iterator?
165. What are tagged template literal real-world use cases?

---

### 🧮 **Data Structures, Algorithms & Performance**

166. How to implement debounce?
167. How to implement throttle?
168. How to flatten nested arrays?
169. How to deep compare two objects?
170. How to remove duplicates from an array?
171. How to find unique values using Set()?
172. How to group items by property?
173. How to chunk an array?
174. How to implement reduce manually?
175. How to polyfill Promise?
176. How to polyfill bind/call/apply?
177. How to polyfill map/filter/reduce?
178. How to polyfill Object.assign()?
179. How to clone array efficiently?
180. Difference between Array.slice() and Array.splice().
181. Difference between forEach() and map().
182. What is event delegation and bubbling?
183. What is event capturing vs bubbling phase?
184. What is stopPropagation vs preventDefault?
185. What are passive event listeners?
186. How to improve rendering performance using requestAnimationFrame?
187. How to defer long-running tasks?
188. What are web workers?
189. What are shared workers?
190. What is offscreenCanvas?
191. How does IndexedDB differ from localStorage?
192. What are cookies vs localStorage vs sessionStorage differences?
193. What is CORS?
194. What is preflight request?
195. What is CSP (Content Security Policy)?
196. What is JSONP and how does it bypass CORS?
197. What are service workers?
198. What are push notifications via service workers?
199. What is main thread blocking?
200. How to monitor main thread activity in performance tab?


---

## ⚛️ Stage 2 — React & Next.js (Fiber, Reconciliation, Routing, SSR, Hooks, State Management, Performance)

*(Includes: React lifecycle, concurrent rendering, reconciliation, diffing, React Fiber, hooks deep dive, Suspense, error boundaries, parallel routing, Next.js architecture, ISR, middleware, server actions, performance optimization, etc.)*

### ⚛️ **REACT FUNDAMENTALS (Concepts + Rendering)**

1. What is React and why was it created?
2. What are the main features of React?
3. What is the Virtual DOM?
4. How does Virtual DOM differ from Real DOM?
5. How does React reconcile DOM updates efficiently?
6. What are React Elements and React Components?
7. Difference between Functional and Class Components.
8. What is JSX and how is it transformed under the hood?
9. Why is JSX not mandatory in React?
10. What happens when JSX is compiled?
11. Why do we use keys in React lists?
12. What happens if keys are not unique?
13. What are fragments in React and why use them?
14. What are controlled vs uncontrolled components?
15. What is the difference between props and state?
16. What are prop drilling and state lifting?
17. How to avoid prop drilling?
18. What is React’s render phase vs commit phase?
19. What triggers a re-render in React?
20. How does React decide whether to re-render a component?

---

### ⚙️ **REACT COMPONENT LIFECYCLE (CLASS + FUNCTIONAL)**

21. What are lifecycle methods in class components?
22. Difference between `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`.
23. How do lifecycle methods map to hooks in functional components?
24. What is the order of hook execution on mount/update/unmount?
25. How can you mimic `componentDidCatch` using hooks?
26. How does React batch state updates?
27. What is the difference between legacy and concurrent rendering lifecycles?
28. How do side effects differ between `useEffect` and `useLayoutEffect`?
29. Why should `useLayoutEffect` be used carefully?
30. What happens if you set state inside render?

---

### 🧩 **REACT HOOKS (In-depth)**

31. What are React Hooks and why were they introduced?
32. Why can’t hooks be used in class components?
33. What are the rules of hooks?
34. What is `useState()` and how does it work internally?
35. What is lazy initialization in useState()?
36. What happens if you update state with the same value?
37. What is batching in React state updates?
38. What is `useEffect()` and when does it run?
39. Difference between `useEffect` and `useLayoutEffect`.
40. What is cleanup function in useEffect?
41. What is dependency array and how does it work?
42. What happens when dependency array is empty?
43. What are stale closures in useEffect?
44. What is `useMemo()` and why use it?
45. Difference between `useMemo` and `useCallback`.
46. When should you not use `useMemo`?
47. What is `useCallback()`?
48. What are referential equality and memoization traps?
49. What is `useRef()` used for?
50. What is the difference between ref and state?
51. How does `useImperativeHandle()` work?
52. What is `forwardRef()`?
53. What is `useContext()` and how does it work?
54. How does Context API trigger re-renders?
55. How to prevent unnecessary re-renders in Context consumers?
56. What is `useReducer()` and how does it differ from useState?
57. How does reducer pattern improve state logic?
58. What is `useTransition()` and concurrent rendering?
59. What is `useDeferredValue()` and how does it optimize UX?
60. What is `useId()` used for?
61. What are custom hooks?
62. When should you create custom hooks?
63. Can a custom hook call another hook conditionally?
64. How do you share logic between components using hooks?
65. Why is it important to avoid calling hooks inside loops?

---

### ⚙️ **REACT FIBER & RECONCILIATION**

66. What is React Fiber?
67. Why was Fiber introduced?
68. What problem did the old stack reconciler have?
69. How does Fiber enable interruption and resuming of work?
70. What are the three main phases of reconciliation?
71. What is the render phase?
72. What is the commit phase?
73. What are effect tags in Fiber?
74. How does React perform diffing between trees?
75. How does React identify minimal updates?
76. Why does React compare elements using keys?
77. What is time slicing in React?
78. How does React handle priority-based updates?
79. What is concurrent rendering?
80. What are lanes in React Fiber architecture?
81. What is Suspense in React?
82. How does Suspense work with concurrent rendering?
83. How does React handle interruptions in rendering?
84. What are the main goals of React Fiber?
85. What is lazy loading and how does React.lazy work?
86. How does React handle async boundaries (Suspense boundaries)?
87. What is hydration?
88. Difference between client-side render, server render, and hydration.
89. What is partial hydration?
90. What happens when hydration fails?

---

### ⚡ **REACT PERFORMANCE & OPTIMIZATION**

91. What causes React components to re-render?
92. How to prevent unnecessary re-renders?
93. What is React.memo()?
94. When should you not use React.memo()?
95. What are pure components?
96. How does shallow comparison work in React.memo?
97. What is key reconciliation and how it impacts performance?
98. What is virtualization?
99. What are libraries like React Window or React Virtualized?
100. What is code splitting in React?
101. What is dynamic import() used for?
102. How does lazy + Suspense help with bundle size?
103. What is React profiler and how to use it?
104. How does React detect wasted renders?
105. What are render props and HOCs?
106. Which is better: render props or custom hooks?
107. What are controlled vs uncontrolled inputs and their impact on performance?
108. How does event delegation work in React synthetic events?
109. What are synthetic events?
110. What are portals in React?
111. When to use React portals?
112. What is StrictMode?
113. What is concurrent React and what’s new in React 18?
114. What is Automatic Batching?
115. What are transitions in React 18?
116. What are startTransition and useTransition differences?
117. How does React concurrent mode affect UI responsiveness?
118. How does React use scheduler to prioritize tasks?
119. What are React Server Components (RSC)?
120. How do RSCs differ from normal components?

---

### 🌍 **NEXT.JS FUNDAMENTALS**

121. What is Next.js and how is it different from React?
122. Why use Next.js over CRA or Vite?
123. What problems does Next.js solve?
124. What is the App Router in Next.js 13+?
125. What are the main directories in App Router (`app/`, `components/`, `lib/`)?
126. Difference between `pages/` and `app/` directory structure.
127. What is server-side rendering (SSR)?
128. What is static site generation (SSG)?
129. What is incremental static regeneration (ISR)?
130. What is on-demand ISR revalidation?
131. What are server components vs client components in Next.js?
132. How to mark a component as client-side?
133. How does hydration work in Next.js?
134. What are layout.tsx and template.tsx files used for?
135. What is metadata API in Next.js?
136. How to add SEO metadata dynamically?
137. How does Next.js handle routing under the hood?
138. What are parallel routes in Next.js?
139. What are intercepting routes?
140. How do you use `@modal` and `@slot` routes?
141. What is nested routing?
142. What is route grouping `(folder)` syntax?
143. How to use middleware in Next.js?
144. What is the difference between middleware and API routes?
145. What is edge middleware?
146. What are Next.js API routes?
147. How does Next.js handle API route caching?
148. What is the difference between `fetch()` in client vs server components?
149. What is caching behavior of `fetch()` in Next.js?
150. What are revalidation strategies (`force-cache`, `no-store`, `revalidate`)?
151. What are Next.js static and dynamic rendering modes?
152. What is `generateStaticParams()` used for?
153. What are dynamic routes and catch-all routes?
154. How does prefetching work in Next.js links?
155. What is `next/link` prefetch behavior?
156. What is dynamic import() in Next.js?
157. How to disable SSR for certain components?
158. What is client-side navigation?
159. How does Next.js manage bundle splitting automatically?
160. How does Next.js optimize fonts and images?
161. What is the `next/image` component and why use it?
162. How does `next/font` work?
163. What is route-based code splitting?
164. How does Next.js handle redirects and rewrites?
165. How does Next.js integrate with CDN and caching layers?
166. What is Next.js middleware execution order?
167. How does middleware differ between Edge and Node runtimes?
168. What is the difference between Edge API Routes and Serverless Functions?
169. What is the default runtime in Next.js 14+?
170. What is RSC payload and how is it streamed?
171. What are React Server Actions?
172. How do Server Actions differ from API routes?
173. How to handle form submissions using Server Actions?
174. What are the limitations of Server Components?
175. What are cookies and headers in Next.js server context?
176. How to access environment variables securely?
177. What is dynamic rendering in Next.js?
178. What is partial revalidation?
179. How does Next.js support internationalization (i18n)?
180. How to implement authentication in Next.js (middleware + route protection)?
181. How does Next.js integrate with NextAuth?
182. How does Next.js handle streaming SSR with React 18?
183. What are Edge Functions?
184. Difference between Vercel Edge Functions and Node Lambdas.
185. What are the performance benefits of RSC + Edge?
186. What is route segment config (`export const dynamic = "force-dynamic"`) used for?
187. How to debug caching and revalidation in Next.js?
188. How to measure performance using Lighthouse in Next.js?
189. What is hybrid rendering?
190. What are patterns for combining SSR + SSG pages?
191. What are App Router pitfalls when mixing client components?
192. What are the new image optimization APIs in Next.js 15?
193. What are static exports and how to deploy them?
194. How to use `next build` and analyze bundle size?
195. What is `next/script` and how does it optimize loading?
196. What are the best practices for performance in Next.js?
197. How to handle environment separation (dev, staging, prod)?
198. What are security headers in Next.js?
199. What is CSP and how to configure it in Next.js?
200. Why choose Next.js over React for production-grade apps?


---

## 🧱 Stage 3 — HTML • CSS • Accessibility • Performance • Architecture

### 🧱 **HTML Essentials (Structure + Semantics)**

1. What is the difference between `<div>` and `<section>`?
2. What is semantic HTML and why does it matter?
3. Name five semantic HTML5 tags and their purposes.
4. How do `<header>`, `<nav>`, `<main>`, `<article>`, and `<footer>` differ?
5. What is the role of the `<aside>` element?
6. How does semantic markup improve accessibility and SEO?
7. What are global attributes in HTML?
8. Difference between `id` and `class`.
9. What are `data-*` attributes used for?
10. What is the difference between `<strong>` and `<b>`?
11. Difference between `<em>` and `<i>`?
12. What is the difference between inline and block elements?
13. What are void elements in HTML?
14. What is the DOCTYPE declaration and why is it needed?
15. What are self-closing tags?
16. Difference between HTML and XHTML?
17. What is the difference between `<link>` and `<a>`?
18. What is the `<base>` tag used for?
19. Difference between `<script defer>` and `<script async>`?
20. What is preloading vs prefetching resources?
21. What are meta tags and how do they affect SEO?
22. What are Open Graph meta tags?
23. What are favicons and where to include them?
24. What is the difference between `<picture>` and `<img>`?
25. How does the `<source>` element work inside `<picture>`?
26. What is the `<template>` element used for?
27. What are custom elements / Web Components?
28. How does the Shadow DOM work?
29. What is the difference between Light DOM and Shadow DOM?
30. What are slots in Web Components?
31. What are the advantages of Web Components?
32. How do you make HTML responsive?
33. What is the difference between `meta viewport` and `width=device-width`?
34. What are progressive enhancement and graceful degradation?
35. What is critical-path HTML rendering?
36. What is hydration in SSR apps from an HTML standpoint?
37. What are inline scripts and CSP concerns?
38. How to lazy-load images in HTML?
39. What is the loading attribute (`loading="lazy"`)?
40. What is the difference between defer and module scripts?

---

### 🎨 **CSS Fundamentals (Layout + Selectors + Specificity)**

41. What is the CSS Box Model?
42. Explain `content`, `padding`, `border`, and `margin`.
43. Difference between `box-sizing: content-box` and `border-box`.
44. What are CSS selectors?
45. What is specificity hierarchy in CSS?
46. How to calculate specificity weight?
47. Difference between `>` and space in selectors.
48. Difference between `:nth-child()` and `:nth-of-type()`.
49. What are pseudo-classes and pseudo-elements?
50. Difference between `::before` and `:before`.
51. What is the difference between relative and absolute positioning?
52. How does `position: sticky` work?
53. How does stacking context work?
54. What is `z-index` and how is it calculated?
55. What are CSS variables (custom properties)?
56. How do CSS variables differ from preprocessor variables?
57. What are combinators in CSS?
58. What are attribute selectors?
59. What is the difference between visibility hidden and display none?
60. Difference between opacity 0 and visibility hidden?
61. What is the difference between inline, block, and inline-block display?
62. What are float and clear properties?
63. How does clearfix hack work?
64. What is `overflow` property used for?
65. Difference between auto, hidden, scroll values.
66. What are media queries?
67. How to target dark mode with media queries?
68. How to use `prefers-reduced-motion` media query?
69. What are CSS units (px, em, rem, vw, vh)?
70. Difference between `em` and `rem`.
71. What are percentage units relative to?
72. What are absolute vs relative units?
73. What are viewport units?
74. What is CSS cascade order?
75. What is inheritance in CSS?
76. Which properties are not inherited by default?
77. What are shorthand properties?
78. What are logical properties (e.g. margin-inline)?
79. How does writing-mode affect layout?
80. What are CSS resets and normalizers?

---

### 🧩 **Modern Layouts (Flexbox + Grid)**

81. What is Flexbox and why was it introduced?
82. What are the main axes in Flexbox?
83. Difference between justify-content and align-items.
84. What are flex-grow, flex-shrink, flex-basis?
85. What is the shorthand for flex property?
86. How to center a div using Flexbox?
87. How does `align-self` differ from `align-items`?
88. What is the difference between `gap` and `margin`?
89. What are order and flex-wrap used for?
90. What is CSS Grid?
91. Difference between implicit and explicit grid.
92. What is `grid-template-areas` used for?
93. Difference between `auto-fill` and `auto-fit`.
94. What is fractional unit (fr)?
95. How to create responsive layouts using Grid?
96. Difference between `place-items` and `align-content`.
97. Can you mix Flexbox and Grid?
98. What is subgrid?
99. What is `minmax()` function?
100. How to make a fluid grid layout?

---

### ✨ **CSS Animation & Transitions**

101. Difference between transition and animation.
102. How does CSS transition timing-function work?
103. What are keyframes?
104. Difference between `animation-fill-mode` values.
105. How to pause and resume CSS animations?
106. What is will-change property?
107. How does hardware acceleration affect animations?
108. What are compositing and painting steps?
109. What properties trigger layout vs paint vs composite?
110. How to optimize animations for performance?

---

### 🧠 **Responsive Design & Architecture**

111. What is Mobile First design?
112. What is fluid vs adaptive layout?
113. What is the difference between min-width and max-width queries?
114. How does container query differ from media query?
115. How does CSS clamp() help in responsive typography?
116. What are design tokens?
117. What is CSS-in-JS?
118. Difference between styled-components and CSS modules.
119. What are pros / cons of CSS-in-JS?
120. How does server-side rendering affect CSS-in-JS?
121. What are atomic / utility-first CSS frameworks?
122. What are BEM, OOCSS, SMACSS methodologies?
123. How does BEM naming improve scalability?
124. What is the 7-1 Sass architecture?
125. What is Critical CSS?
126. How to extract above-the-fold CSS?
127. What are CSS layers (`@layer`)?
128. How does cascade layering affect specificity?
129. What is PostCSS and what does it do?
130. How do autoprefixers work?

---

### ♿ **Accessibility (WCAG + ARIA)**

131. What is web accessibility (a11y)?
132. What is WCAG 2.1 AA standard?
133. What is POUR principle?
134. What are semantic roles?
135. What are ARIA attributes and when to use them?
136. What is the difference between role and aria-label?
137. What is aria-hidden?
138. What is aria-live region?
139. What are skip links?
140. How to make keyboard-navigable UI?
141. How to ensure focus visibility?
142. What is tabindex and how does it work?
143. Difference between tabindex 0, -1, and positive values.
144. How to trap focus in a modal?
145. What is focus management on route change?
146. How to test accessibility with DevTools and Lighthouse?
147. What are screen readers and how do they parse DOM?
148. What are landmark roles (banner, main, complementary)?
149. Difference between button and div with onClick?
150. How to ensure accessible form labels?
151. What is the difference between aria-describedby and aria-labelledby?
152. What are accessible error messages?
153. How to test color contrast?
154. What is sufficient color contrast ratio per WCAG?
155. How to design for reduced motion?
156. How to use prefers-reduced-motion?
157. What are accessible tables?
158. What are caption and summary elements?
159. How to ensure heading hierarchy accessibility?
160. How to test accessibility with Axe or Lighthouse?

---

### 🔍 **SEO & Web Performance**

161. What is the difference between SEO on SPA and SSR apps?
162. What is crawling vs indexing?
163. What are sitemaps and robots.txt?
164. What are canonical URLs?
165. What is duplicate content penalty?
166. What are meta robots directives?
167. Difference between `<meta name="description">` and Open Graph tags.
168. What are structured data and schema.org?
169. How does SSR improve SEO?
170. How does Next.js ISR affect SEO freshness?
171. What is the Core Web Vitals?
172. What are LCP, FID, CLS?
173. How to optimize LCP?
174. How to reduce CLS?
175. How to improve FID/TBT?
176. What are performance budgets?
177. What is lazy loading and code splitting?
178. How does prefetching work?
179. What is DNS prefetch and preconnect?
180. What are resource hints (`<link rel=preload>`, `prefetch`)?
181. How to optimize images for performance?
182. Difference between JPEG, WebP, AVIF.
183. How does font loading affect FOUT/FOIT?
184. What are critical requests chains?
185. How to reduce JavaScript bundle size?
186. What is tree shaking in bundlers?
187. What is dynamic import() used for?
188. How does caching policy (Cache-Control) affect performance?
189. What is CDN and how does it help?
190. What are service workers and offline strategies?
191. What is precaching vs runtime caching?
192. What is HTTP/2 and HTTP/3 multiplexing?
193. What is compression (Gzip/Brotli)?
194. How to analyze bundle size (Webpack Analyzer)?
195. What are code splitting strategies (route / component / vendor)?
196. How to avoid main-thread blocking in JS?
197. What is web worker vs service worker?
198. How to measure performance in Lighthouse?
199. What are cumulative layout shift causes?
200. What are security headers (CSP, HSTS)?

---

### 🏗️ **Frontend Architecture & System Design**

201. What is component driven development?
202. What is Atomic Design Methodology?
203. What is the difference between a design system and component library?
204. What is Storybook and why use it?
205. How to manage themes (dark / light) architecture-wise?
206. What is micro-frontend architecture?
207. Pros and cons of micro-frontends?
208. How to share state between micro-frontends?
209. What are Webpack Module Federation and its use?
210. How does authentication flow work in SPAs?
211. What are CSRF and XSS attacks?
212. How to prevent XSS in React / Next.js?
213. What is content security policy?
214. How to sanitize user input safely?
215. How does React escape HTML by default?
216. What is SSR hydration mismatch and how to fix it?
217. What are stale props / state bugs in React?
218. How to implement infinite scroll efficiently?
219. How to paginate efficiently on large datasets?
220. What are debouncing and throttling in search UIs?
221. How to implement optimistic UI updates?
222. What is suspense for data fetching?
223. Difference between caching and memoization?
224. What is SWR and React Query?
225. How does React Query handle background revalidation?
226. What are global error boundaries?
227. What is logging / monitoring setup for frontend apps?
228. What are Sentry / LogRocket / Datadog used for?
229. What is frontend observability?
230. How to handle feature flags in React apps?
231. What is A/B testing implementation on frontend?
232. What is performance profiling and how to measure it?
233. How to handle race conditions in React fetch flows?
234. What is idempotent UI operation?
235. How to ensure accessibility and performance coexist?
236. What are CI/CD pipelines for frontend apps?
237. What are code review best practices for UI teams?
238. What is testing pyramid (frontend)?
239. Difference between unit, integration, and E2E tests.
240. What are Jest and React Testing Library?
241. What is mocking and stubbing?
242. How to test async components?
243. What is Cypress and Playwright?
244. How to run E2E tests in CI?
245. How to ensure accessibility testing in CI?
246. What is visual regression testing?
247. What are snapshot tests and why to avoid over-use?
248. How to implement feature toggle testing?
249. How to architect large-scale React / Next.js projects?
250. What are folder structure best practices (feature-based / domain-driven)?


---

## ✅ Total Coverage Summary

| Area | Topics Covered | Approx. Questions |
|------|----------------|-------------------|
| JavaScript | Core, Advanced, ES6+, Async, Engine | 400+ |
| React | Hooks, Fiber, Reconciliation, Architecture | 120+ |
| Next.js | SSR, ISR, Routing, Optimization | 60+ |
| HTML & CSS | Structure, Layout, Responsive | 130 |
| Accessibility | WCAG, ARIA, Testing | 30 |
| SEO & Performance | Core Web Vitals, Rendering, Caching | 40 |
| Architecture | Design Systems, Testing, CI/CD | 50 |
| **Total** | — | **650+ Questions** |

---

### 💡 Notes

This collection is ideal for:
- Interview prep for Mid → Senior Frontend Developer roles
- Deep learning roadmap aligned with your React/Next specialization
- Creating blog ideas or flashcards for review

---

**Author:** Sachin Maurya  
**Focus:** UI / Frontend / React / Next.js Engineer  
**Goal:** Mastery-level understanding of frontend ecosystem (Performance + Accessibility + Architecture)

---
