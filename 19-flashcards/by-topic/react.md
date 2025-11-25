# React Master Flashcards

> **100 essential React concepts for interview mastery**

**Time to review:** 50 minutes
**Best for:** React-focused interviews, component architecture

---

## Card 1: useState Rules
**Q:** What are the rules for using useState?

**A:** 1) Only call at top level (not in loops/conditions), 2) Only call in function components or custom hooks, 3) State updates are asynchronous and batched, 4) Use functional updates when new state depends on previous state.

**Difficulty:** 🟢 Easy
**Tags:** #react #hooks #useState
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Fundamental hook question. Emphasize functional updates: "When updating based on previous state, always use `setState(prev => prev + 1)` not `setState(count + 1)` - prevents stale closures." Common follow-up: "Why batching matters?" Shows performance awareness.

---

## Card 2: useEffect Cleanup
**Q:** When does the useEffect cleanup function run?

**A:** Runs before the component unmounts AND before re-running the effect (if dependencies changed). Used to cancel subscriptions, clear timers, abort fetch requests.

**Difficulty:** 🟡 Medium
**Tags:** #react #hooks #useEffect
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Critical for production code. Example: "Used cleanup to cancel fetch requests with AbortController - prevented state updates on unmounted components." Red flag: Forgetting cleanup causes memory leaks. Always mention: "Cleanup runs before re-running effect AND on unmount."

---

## Card 3: useMemo vs useCallback
**Q:** What's the difference between useMemo and useCallback?

**A:** useMemo memoizes the RESULT of a function (computed value). useCallback memoizes the FUNCTION itself. useCallback(fn, deps) === useMemo(() => fn, deps).

**Difficulty:** 🟡 Medium
**Tags:** #react #hooks #optimization
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Often confused! Clear explanation: "useMemo for expensive calculations (results), useCallback for passing stable function refs to child components (prevents re-renders)." Practical: "I use useCallback for event handlers passed as props - child wrapped in React.memo won't re-render unnecessarily."

---

## Card 4: React Reconciliation
**Q:** How does React reconciliation work?

**A:** React compares new Virtual DOM with previous one (diffing algorithm). Uses keys to identify which items changed. Updates only changed parts of real DOM. O(n) complexity using heuristics.

**Difficulty:** 🟡 Medium
**Tags:** #react #virtual-dom #performance
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Deep React knowledge. Explain diffing algorithm: "React uses heuristics - different types = full subtree rebuild, same type = update props. Keys identify list items for efficient reordering." Advanced: Mention Fiber's incremental rendering - shows you understand modern React internals.

---

## Card 5: Key Prop Purpose
**Q:** Why are keys important in React lists?

**A:** Keys help React identify which items changed/added/removed. Stable identity for efficient reconciliation. Without keys, React re-renders all items. Use unique IDs, not array indices.

**Difficulty:** 🟢 Easy
**Tags:** #react #lists #keys
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Universal React question. Common mistake to address: "Never use array index as key - breaks when reordering/filtering lists." Real example: "Debugged bug where form inputs lost values on sort - cause: index keys." Use unique IDs or generate with uuid if needed.

---

## Card 6: Controlled vs Uncontrolled
**Q:** What's the difference between controlled and uncontrolled components?

**A:** Controlled: Form data handled by React state (single source of truth). Uncontrolled: Form data handled by DOM (use refs to access). Controlled provides more control and validation.

**Difficulty:** 🟢 Easy
**Tags:** #react #forms #components
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Forms are common in interviews. Best practice: "Use controlled for complex validation, uncontrolled for simple forms/file inputs." When asked trade-offs: "Controlled = more code but full control. Uncontrolled = simpler but harder to validate." Libraries like React Hook Form optimize this.

---

## Card 7: useRef Use Cases
**Q:** What are the main use cases for useRef?

**A:** 1) Access DOM elements directly, 2) Store mutable values that don't trigger re-renders, 3) Keep reference to previous values, 4) Store timeout/interval IDs.

**Difficulty:** 🟡 Medium
**Tags:** #react #hooks #useRef
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Versatile hook! Example: "Used useRef to store previous value for comparison, focus input on mount, keep WebSocket connection reference." Key insight: "Unlike state, changing ref.current doesn't trigger re-render - perfect for mutable values you don't want to display."

---

## Card 8: React Fiber
**Q:** What is React Fiber?

**A:** React's reconciliation engine rewrite (v16+). Enables incremental rendering, pausing/resuming work, assigning priority to updates. Splits rendering into chunks for better perceived performance.

**Difficulty:** 🔴 Hard
**Tags:** #react #fiber #internals
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Advanced topic - shows seniority. Explain benefits: "Fiber enables time-slicing - breaking rendering into chunks, prioritizing urgent updates (user input) over less urgent (data fetching)." Connect to Concurrent Mode/React 18. Shows you're current with React evolution.

---

## Card 9: Error Boundaries
**Q:** What are Error Boundaries and their limitations?

**A:** Class components that catch JS errors in child component tree. Don't catch: event handler errors, async code, SSR errors, errors in boundary itself. Use componentDidCatch and getDerivedStateFromError.

**Difficulty:** 🟡 Medium
**Tags:** #react #error-handling
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Production-ready knowledge. "Implemented ErrorBoundary wrapper around route components - graceful degradation instead of blank screen." Limitation insight: "For event handlers, use try/catch - Error Boundaries only catch render errors." Shows you understand boundaries.

---

## Card 10: Context Performance
**Q:** What's the performance issue with Context and how to fix it?

**A:** All consumers re-render when context value changes, even if they only use part of it. Fix: Split into multiple contexts, memoize provider value, use useMemo for context values.

**Difficulty:** 🔴 Hard
**Tags:** #react #context #performance
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Performance optimization expertise. "Split authentication context from theme context - theme changes don't re-render all auth consumers." Advanced: "Used useMemo to wrap context value object - prevents recreating on every render." Shows you optimize beyond basics.

---

## Card 11: React.memo
**Q:** How does React.memo work and when should you use it?

**A:** HOC that memoizes component output. Re-renders only if props changed (shallow comparison). Use for: expensive render components, frequent parent re-renders, stable props. Don't overuse.

**Difficulty:** 🟡 Medium
**Tags:** #react #optimization #memo
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Optimization pattern. When to use: "Wrap pure components that render often with same props. Don't memo everything - profiling first!" Custom comparison: "Can pass second argument for deep prop comparison: `memo(Component, (prev, next) => prev.id === next.id)`."

---

## Card 12: Lifting State Up
**Q:** What does "lifting state up" mean?

**A:** Moving state to closest common ancestor when multiple components need to share it. Parent manages state, passes down as props and callbacks. Ensures single source of truth.

**Difficulty:** 🟢 Easy
**Tags:** #react #state #patterns
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Fundamental React pattern. Example: "Two sibling components need same data - lift state to parent, pass down via props." Prevents: prop drilling (use Context for deep nesting). Shows understanding of unidirectional data flow principle.

---

## Card 13: Composition vs Inheritance
**Q:** Why does React favor composition over inheritance?

**A:** Composition is more flexible and explicit. Use props.children, multiple children props, or HOCs instead of extending classes. React has no use cases where inheritance is recommended.

**Difficulty:** 🟡 Medium
**Tags:** #react #patterns #composition
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** React philosophy question. "React recommends composition - use children prop, slots pattern, or HOCs. Inheritance creates tight coupling." Real example: "Built Modal component with props.children for flexible content instead of extending base Modal class."

---

## Card 14: HOC Pattern
**Q:** What is a Higher-Order Component (HOC)?

**A:** Function that takes a component and returns enhanced component. Used for: code reuse, logic abstraction, prop manipulation. Convention: prefix with 'with' (withAuth, withLoading).

**Difficulty:** 🟡 Medium
**Tags:** #react #patterns #hoc
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Legacy but still tested pattern. Modern alternative: "Custom hooks replaced most HOCs - cleaner, less nesting." When HOCs still useful: "Cross-cutting concerns like authentication, error boundaries." Show evolution: "React.memo, Redux connect are HOCs you use daily."

---

## Card 15: Render Props
**Q:** What is the render props pattern?

**A:** Component that uses a function prop to know what to render. Enables sharing code between components. Example: <Mouse render={(x, y) => <Cat x={x} y={y} />} />.

**Difficulty:** 🟡 Medium
**Tags:** #react #patterns #render-props
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Less common now (hooks replaced it), but know the concept. "Render props enable sharing stateful logic. Example: React Router's Route component." Mention: "Custom hooks are cleaner alternative - same logic sharing without extra nesting."

---

## Card 16: Custom Hooks Rules
**Q:** What are the rules for creating custom hooks?

**A:** 1) Name must start with 'use', 2) Follow all hooks rules, 3) Return whatever component needs (values, functions), 4) Can call other hooks, 5) Not tied to specific component.

**Difficulty:** 🟢 Easy
**Tags:** #react #hooks #custom-hooks
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Show you create reusable logic. Example: "Created useDebounce hook to share debouncing across search inputs." Naming important: "Must start with 'use' - lets React check hooks rules. Can compose other hooks inside - that's the power!"

---

## Card 17: StrictMode Purpose
**Q:** What does React StrictMode do?

**A:** Development tool that activates additional checks: detects unsafe lifecycles, legacy API usage, unexpected side effects. Renders components twice in development to find bugs.

**Difficulty:** 🟢 Easy
**Tags:** #react #strictmode #debugging
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Development tool. "StrictMode helped me find unsafe lifecycle methods when upgrading legacy code." Key point: "Double-rendering in dev catches side effects - if component breaks with double render, it's not pure." Shows debugging experience.

---

## Card 18: Lazy Loading
**Q:** How do you lazy load components in React?

**A:** Use React.lazy() with dynamic import() and Suspense boundary. Example: const MyComponent = lazy(() => import('./MyComponent')). Wrap with <Suspense fallback={<Loading />}>.

**Difficulty:** 🟡 Medium
**Tags:** #react #lazy-loading #performance
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Performance optimization. Real impact: "Lazy loaded admin routes - reduced initial bundle by 40%." Best practice: "Route-based code splitting first, then component-level for heavy components (charts, editors)." Error handling: Suspense fallback covers loading state.

---

## Card 19: Portal Use Case
**Q:** When would you use ReactDOM.createPortal?

**A:** Render children into DOM node outside parent hierarchy. Use cases: modals, tooltips, dropdowns. Maintains React tree for context and events while breaking DOM hierarchy.

**Difficulty:** 🟡 Medium
**Tags:** #react #portals #dom
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Practical DOM pattern. "Used portals for modal system - rendered at body level but maintained React tree for events and context." Fix common issue: "Portals break out of overflow:hidden - intentional for modals/tooltips."

---

## Card 20: Concurrent Features
**Q:** What are React 18's concurrent features?

**A:** Automatic batching, Transitions (startTransition), Suspense for data fetching, useTransition/useDeferredValue hooks. Allows React to interrupt rendering for higher-priority updates.

**Difficulty:** 🔴 Hard
**Tags:** #react #concurrent #react18
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** React 18 differentiator. "Used startTransition for search - typing instant, filter results non-urgent. Reduced input lag from 200ms to <16ms." Follow-up: "When NOT to use?" Don't wrap urgent updates like controlled inputs.

---

## Card 21: useLayoutEffect vs useEffect
**Q:** When should you use useLayoutEffect instead of useEffect?

**A:** useLayoutEffect runs synchronously after DOM mutations, before browser paint. Use for: DOM measurements, preventing visual flashing. useEffect is asynchronous, non-blocking (preferred for most cases).

**Difficulty:** 🔴 Hard
**Tags:** #react #hooks #layouteffect
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Timing question. "Used useLayoutEffect for tooltip positioning - calculate before paint, prevent jump. useEffect would flicker." Warning: "Blocks visual updates - use sparingly." Red flag: Using for data fetching.

---

## Card 22: Ref Forwarding
**Q:** What is ref forwarding and when is it needed?

**A:** Passing ref through component to child DOM element. Use React.forwardRef(). Needed for: library components exposing DOM refs, HOCs preserving refs, focusing inputs.

**Difficulty:** 🟡 Medium
**Tags:** #react #refs #forwarding
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Library pattern. "Built input library - forwardRef lets consumers call .focus(). Without it, ref points to wrapper not input." Mistake: Forgetting displayName - DevTools shows 'ForwardRef' instead of 'CustomInput'.

---

## Card 23: useReducer vs useState
**Q:** When should you use useReducer instead of useState?

**A:** useReducer when: complex state logic, multiple sub-values, next state depends on previous, deep updates, want to optimize performance with dispatch. useState for simple state.

**Difficulty:** 🟡 Medium
**Tags:** #react #hooks #useReducer
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** State complexity decision. "Form with 10 fields, validation, touched state - useReducer centralized logic. Single dispatch vs multiple setStates." When NOT: Simple toggle - useState clearer than reducer boilerplate.

---

## Card 24: Batching Updates
**Q:** How does React batch state updates?

**A:** React 18+ automatically batches all updates (events, promises, timeouts). Pre-18: only batched in event handlers. Reduces renders. Can opt-out with flushSync() if needed.

**Difficulty:** 🟡 Medium
**Tags:** #react #batching #performance
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** React 18 performance win. "Before 18: setTimeout with 3 setState = 3 renders. React 18 batches = 1 render. 60% fewer renders in validation." Rare: "flushSync for immediate DOM measurement."

---

## Card 25: Code Splitting
**Q:** What are the strategies for code splitting in React?

**A:** 1) Route-based splitting (lazy load routes), 2) Component-based splitting (lazy load heavy components), 3) Library splitting (dynamic import large libraries), 4) Webpack magic comments for chunk names.

**Difficulty:** 🟡 Medium
**Tags:** #react #code-splitting #performance
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Bundle optimization. "Route-based splitting first - admin routes lazy loaded, reduced initial by 40%." Advanced: "Webpack magic comments for chunk naming: import(/* webpackChunkName: 'admin' */ './Admin')." Error handling: Suspense fallback.

---

## Card 26: useImperativeHandle
**Q:** What is useImperativeHandle used for?

**A:** Customizes instance value exposed to parent when using ref. Used with forwardRef. Limits what parent can access. Example: expose only focus() method, not entire input element.

**Difficulty:** 🔴 Hard
**Tags:** #react #hooks #refs
**Frequency:** ⭐⭐

**💡 Interview Tip:** Advanced ref control. "Video player - useImperativeHandle exposes play()/pause(), not raw <video>. Maintains encapsulation." Pattern: useImperativeHandle(ref, () => ({ focus: () => inputRef.current.focus() })). Rare but powerful for libraries.

---

## Card 27: Synthetic Events
**Q:** What are React Synthetic Events?

**A:** Cross-browser wrapper around native browser events. Same interface across browsers. Pooled for performance (nullified after handler). Access native event with e.nativeEvent.

**Difficulty:** 🟡 Medium
**Tags:** #react #events #cross-browser
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Cross-browser consistency. "Synthetic events normalize across browsers - e.preventDefault() works same everywhere." Gotcha: "Events are pooled - can't access async. Use e.persist() if needed." Modern: React 17+ no pooling.

---

## Card 28: useCallback Gotcha
**Q:** When is useCallback actually useful?

**A:** Only when passing function to child that uses React.memo or as dependency in other hooks. Otherwise adds overhead. Memoize expensive functions, not cheap ones.

**Difficulty:** 🔴 Hard
**Tags:** #react #optimization #hooks
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Performance trap awareness. "Only useful with React.memo children or hook dependencies. Otherwise overhead > benefit." Measured: "Removed 50 unnecessary useCallbacks, improved render by 15ms." Profile first!

---

## Card 29: Fragment Purpose
**Q:** Why use Fragments instead of divs?

**A:** Avoid unnecessary DOM nodes, semantic HTML, styling issues, table rows grouping. Short syntax: <>children</>. Can pass key prop with <Fragment key={id}>.

**Difficulty:** 🟢 Easy
**Tags:** #react #fragments #jsx
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Best practice. "Avoid div soup - fragments prevent CSS issues." Real bug: "Flexbox broken by wrapper div - fragment fixed." Shorthand: <> vs <Fragment key={}> for lists.

---

## Card 30: Default Props
**Q:** How do you define default props?

**A:** Function components: default parameters (function MyComponent({count = 0})). Class components: Component.defaultProps = {...}. Modern approach prefers default parameters.

**Difficulty:** 🟢 Easy
**Tags:** #react #props #defaults
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Modern pattern. "Prefer default parameters: function MyComponent({count = 0}) over Component.defaultProps." TypeScript: Default params type-checked, defaultProps not. Shows modern React knowledge.

---

## Card 31: Compound Components
**Q:** What is the compound components pattern?

**A:** Components that work together to form complete UI (Select + Options). Share implicit state via Context. Flexible, composable API. Example: <Tabs><Tab /><TabPanel /></Tabs>.

**Difficulty:** 🔴 Hard
**Tags:** #react #patterns #composition
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Advanced composition. "Built Tabs component - <Tabs><Tab/><TabPanel/></Tabs>. Shared state via Context." Used by: Radix UI, Reach UI. Flexible API, better DX than props configuration.

---

## Card 32: State Colocation
**Q:** What is state colocation and why is it important?

**A:** Keep state as close as possible to where it's used. Reduces unnecessary renders, easier to maintain, better performance. Lift only when multiple components need it.

**Difficulty:** 🟡 Medium
**Tags:** #react #state #performance
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Performance principle. "Kept modal state IN modal component, not App root. Modal unmounts = state gone, no unnecessary re-renders." Rule: "Start local, lift only when shared." Kent C. Dodds: "Colocation is King."

---

## Card 33: Prop Drilling
**Q:** What is prop drilling and how to avoid it?

**A:** Passing props through many levels of components. Solutions: Context API, component composition (children prop), state management libraries, custom hooks.

**Difficulty:** 🟡 Medium
**Tags:** #react #props #patterns
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Refactoring decision. "5-level prop drilling for theme - Context eliminated 3 intermediate passes." Strategy: "Try composition first (cheapest), then Context, then Zustand for complex state." Shows solution spectrum.

---

## Card 34: useMemo Overhead
**Q:** When does useMemo add more overhead than benefit?

**A:** For cheap calculations, primitive comparisons, frequently changing dependencies. Only use for expensive computations, large data transformations, referential equality needs.

**Difficulty:** 🟡 Medium
**Tags:** #react #optimization #useMemo
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Premature optimization. "Measured: memoizing string uppercase = slower than recalculating. useMemo overhead > benefit." Use when: Large arrays filtering, expensive calculations, referential equality for React.memo. Profile first!

---

## Card 35: useDebugValue
**Q:** What is useDebugValue used for?

**A:** Displays custom label for custom hooks in React DevTools. Only for custom hooks. Optional formatter function for expensive computations. Development tool only.

**Difficulty:** 🟢 Easy
**Tags:** #react #hooks #debugging
**Frequency:** ⭐⭐

**💡 Interview Tip:** DevTools helper. "Custom useUser hook - useDebugValue(user.name) shows username in DevTools instead of object." Only for library authors. Optional formatter for expensive display logic.

---

## Card 36: useId Hook
**Q:** What problem does useId solve?

**A:** Generates unique IDs for accessibility attributes (aria-describedby, htmlFor). Stable across client/server, works with SSR, avoids hydration mismatches. React 18+.

**Difficulty:** 🟡 Medium
**Tags:** #react #hooks #react18 #accessibility
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** SSR solution. "Before useId: Math.random() IDs caused hydration errors. useId generates same ID server/client." Use: aria-describedby, htmlFor. Red flag: Using for list keys - breaks reconciliation.

---

## Card 37: useSyncExternalStore
**Q:** When would you use useSyncExternalStore?

**A:** Subscribe to external stores (non-React state). Ensures consistent reads during concurrent rendering. Used by libraries like Redux. React 18+ feature for library authors.

**Difficulty:** 🔴 Hard
**Tags:** #react #hooks #react18 #external-stores
**Frequency:** ⭐⭐

**💡 Interview Tip:** Library author hook. "Libraries use for external stores - Redux, Zustand migrated for concurrent safety." Regular apps rarely use directly. Prevents tearing during concurrent rendering.

---

## Card 38: useTransition
**Q:** What is useTransition used for?

**A:** Mark state updates as non-urgent transitions. Keep UI responsive during heavy updates. Returns isPending flag. Use for: filtering, tab switching, non-critical updates.

**Difficulty:** 🔴 Hard
**Tags:** #react #hooks #react18 #concurrent
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Concurrent rendering. "Search filter - useTransition kept input responsive, marked filter non-urgent. isPending shows loading spinner." Use: Tab switching, filtering, sorting. Not for: Controlled inputs.

---

## Card 39: useDeferredValue
**Q:** How does useDeferredValue work?

**A:** Defers updating part of UI to keep app responsive. Similar to debouncing but React-controlled. Used for expensive renders that can lag behind user input.

**Difficulty:** 🔴 Hard
**Tags:** #react #hooks #react18 #concurrent
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Debounce alternative. "Heavy visualization from slider - useDeferredValue lets slider stay smooth while viz lags." React-controlled unlike manual debounce. Works with Suspense for fallback UI.

---

## Card 40: Suspense for Data
**Q:** How does Suspense work for data fetching?

**A:** Component throws promise while loading, Suspense catches and shows fallback. When promise resolves, component re-renders with data. Works with frameworks supporting it.

**Difficulty:** 🔴 Hard
**Tags:** #react #suspense #data-fetching
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Next-gen data fetching. "Next.js 13+ App Router - components suspend during fetch, Suspense shows skeleton." Caveat: "Needs Suspense-enabled libraries (Next.js, Relay, SWR 2.0+). Regular fetch() needs wrapper."

---

## Card 41: Server Components
**Q:** What are React Server Components?

**A:** Components that run only on server. Zero bundle size, direct backend access, automatic code splitting. Can't use hooks/state. Mixed with Client Components.

**Difficulty:** 🔴 Hard
**Tags:** #react #server-components #rsc
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Hottest 2024-2025 topic. "Next.js 14 App Router - server components reduced bundle 60%. Fetch data directly, no API route." Key: "Default in Next.js 13+. Add 'use client' only for interactivity."

---

## Card 42: RSC vs SSR
**Q:** How do Server Components differ from SSR?

**A:** SSR: HTML generation, runs on every request, full hydration. RSC: streamed component tree, cached, selective hydration, no client bundle. Can be used together.

**Difficulty:** 🔴 Hard
**Tags:** #react #server-components #ssr
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Architecture clarity. "SSR = HTML generation every request. RSC = cached component tree, streamed, selective hydration." Combined: "Server Components for data, SSR for HTML, Client for interactivity."

---

## Card 43: Client vs Server
**Q:** When to use Client Components vs Server Components?

**A:** Client: interactivity, hooks, browser APIs, event handlers. Server: data fetching, backend access, large dependencies, sensitive data. Default to Server in Next.js App Router.

**Difficulty:** 🟡 Medium
**Tags:** #react #server-components #patterns
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Decision framework. "Server: data fetching, sensitive info, large libs. Client: hooks, events, browser APIs." Next.js 13+: "Default server. Add 'use client' directive only when need state/effects."

---

## Card 44: Hydration Mismatch
**Q:** What causes hydration mismatches?

**A:** Server HTML differs from client render. Causes: Date.now(), random values, browser-only APIs, conditional rendering based on window. Use useEffect or suppressHydrationWarning.

**Difficulty:** 🟡 Medium
**Tags:** #react #ssr #hydration
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Common SSR bug. "Date.now() in render caused mismatch - server time !== client time." Fix: "useEffect for client-only, suppressHydrationWarning for intentional mismatches like timestamps."

---

## Card 45: forwardRef Pattern
**Q:** How do you properly forward refs?

**A:** Use React.forwardRef((props, ref) => {}). Wrap component, accept ref as second parameter. Attach to DOM element or useImperativeHandle. TypeScript: ForwardRefRenderFunction.

**Difficulty:** 🟡 Medium
**Tags:** #react #refs #patterns
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Ref passing pattern. "Library input component - forwardRef lets parent call .focus()." TypeScript: ForwardRefRenderFunction<HTMLInputElement, Props>. displayName for DevTools: MyInput.displayName = 'MyInput'.

---

## Card 46: Prop Types
**Q:** Should you still use PropTypes?

**A:** PropTypes are runtime checks. TypeScript is compile-time and more powerful. Use TypeScript for new projects. PropTypes still valid for non-TypeScript projects.

**Difficulty:** 🟢 Easy
**Tags:** #react #proptypes #typescript
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Legacy check. "TypeScript is standard now - compile-time checking > runtime. PropTypes still valid for non-TS projects." Migration: "Converted 50-file codebase from PropTypes to TS in 2 days - caught 30 bugs immediately."

---

## Card 47: Display Name
**Q:** Why set displayName on components?

**A:** Helps debugging in React DevTools and error messages. Automatically set for named functions. Manually set for HOCs and anonymous functions.

**Difficulty:** 🟢 Easy
**Tags:** #react #debugging #devtools
**Frequency:** ⭐⭐

**💡 Interview Tip:** DevTools clarity. "HOC wrapper components need displayName - MyComponent.displayName = 'WithAuth(MyComponent)' for debuggability." Auto-set for named functions. Shows debugging awareness.

---

## Card 48: Children Manipulation
**Q:** How do you manipulate children prop?

**A:** React.Children utilities: map, forEach, count, only, toArray. Children is opaque data structure. Use these helpers instead of array methods.

**Difficulty:** 🟡 Medium
**Tags:** #react #children #api
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Advanced React API. "React.Children.map for cloning with new props. Never array.map(children) - children can be single element." Compound components use this. Library pattern knowledge.

---

## Card 49: cloneElement Use
**Q:** When would you use React.cloneElement?

**A:** Clone element with new props. Use cases: extending children props, HOC implementation, render prop enhancements. Often sign to refactor to composition.

**Difficulty:** 🔴 Hard
**Tags:** #react #api #advanced
**Frequency:** ⭐⭐

**💡 Interview Tip:** Rare API. "cloneElement adds props to existing element - used in HOCs before hooks. Now prefer composition or custom hooks." Red flag: Using frequently - sign of fighting React patterns.

---

## Card 50: isValidElement
**Q:** What does React.isValidElement check?

**A:** Checks if value is React element. Useful for: render prop validation, children type checking, conditional rendering logic.

**Difficulty:** 🟢 Easy
**Tags:** #react #api #validation
**Frequency:** ⭐⭐

**💡 Interview Tip:** Validation helper. "isValidElement for library type checking. Useful in render props to validate children." Niche but shows API knowledge. Rarely needed in app code.

---

## Card 51: Profiler API
**Q:** How do you use the Profiler API?

**A:** Measure rendering performance. <Profiler id="Nav" onRender={callback}>. Callback receives phase, actualDuration, baseDuration, startTime, commitTime.

**Difficulty:** 🟡 Medium
**Tags:** #react #profiler #performance
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Production monitoring. "Profiler measures render costs - sends actualDuration to analytics. Wrapped slow charts, discovered 800ms renders." Small overhead - use selectively in production.

---

## Card 52: Automatic Batching
**Q:** What changed with automatic batching in React 18?

**A:** Pre-18: only event handlers batched. React 18: all updates batched (promises, setTimeout, native events). Use flushSync to opt-out if needed.

**Difficulty:** 🟡 Medium
**Tags:** #react #react18 #batching
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** React 18 win. "Auto-batching reduced renders 60% - setTimeout with 3 setState now batches. flushSync opts out for immediate DOM access." Performance improvement free upgrade.

---

## Card 53: startTransition
**Q:** When to use startTransition?

**A:** Wrap non-urgent state updates to keep UI responsive. Transitions can be interrupted by more urgent updates. Use for: searching, filtering, tab switches.

**Difficulty:** 🟡 Medium
**Tags:** #react #react18 #transitions
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Transition API. "startTransition marks non-urgent updates - search input instant, results can lag. Replaces hacky setTimeout(0) patterns." Shows React 18 concurrent mastery.

---

## Card 54: Suspense Boundaries
**Q:** How many Suspense boundaries should you have?

**A:** Multiple boundaries for granular loading states. Place at meaningful UI boundaries. Trade-off: more boundaries = more loading states vs better UX.

**Difficulty:** 🟡 Medium
**Tags:** #react #suspense #ux
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** UX strategy. "Multiple Suspense boundaries = granular loading. Route-level boundary + widget-level = better UX than single top-level." Balance: more code vs better experience.

---

## Card 55: Error Boundary Placement
**Q:** Where should you place Error Boundaries?

**A:** At route level for page errors, around widgets for isolation, around third-party components. Multiple boundaries for better error isolation.

**Difficulty:** 🟡 Medium
**Tags:** #react #error-boundaries #patterns
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Error isolation. "Error Boundaries at route + widget level. Third-party components wrapped separately - their errors don't crash whole app." Production resilience pattern.

---

## Card 56: Context Selector Pattern
**Q:** How to avoid Context performance issues?

**A:** Split contexts by update frequency. Separate state and dispatch contexts. Use useMemo for provider values. Consider Zustand/Jotai for complex state.

**Difficulty:** 🔴 Hard
**Tags:** #react #context #optimization
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Context perf fix. "Split ThemeContext (static) from UserContext (frequent). Memoize provider value. For complex: migrate to Zustand with selectors." Shows optimization evolution.

---

## Card 57: Controlled Component Perf
**Q:** How to optimize controlled input performance?

**A:** Debounce onChange, use uncontrolled with validation on submit, React.memo on input component, batch updates. Consider useTransition for search inputs.

**Difficulty:** 🟡 Medium
**Tags:** #react #forms #performance
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Form optimization. "Debounce onChange or use uncontrolled + validation on submit. useTransition for search. React Hook Form for 50+ fields." Performance vs DX trade-offs.

---

## Card 58: List Rendering Optimization
**Q:** How to optimize large list rendering?

**A:** Virtualization (react-window), pagination, infinite scroll, memoize items, stable keys, React.memo on item components, avoid inline functions.

**Difficulty:** 🟡 Medium
**Tags:** #react #lists #performance
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** List performance. "1000+ items = react-window virtualization. Reduced 10s render to 100ms. Stable keys, React.memo items, avoid inline functions." Measured impact: 100x faster.

---

## Card 59: useEffect Timing
**Q:** When exactly does useEffect run?

**A:** After render committed to screen (asynchronous). After paint. Cleanup runs before next effect or unmount. Use useLayoutEffect for synchronous updates before paint.

**Difficulty:** 🟡 Medium
**Tags:** #react #hooks #useEffect
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Timing precision. "useEffect runs after paint (async), useLayoutEffect before paint (sync blocking). 99% use useEffect - synchronous updates only when measuring DOM."

---

## Card 60: Stale Closure
**Q:** What is the stale closure problem in useEffect?

**A:** Effect captures old values when dependencies not listed. Fix: add all dependencies to array, use functional updates, use ref for latest value.

**Difficulty:** 🔴 Hard
**Tags:** #react #hooks #closures
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Common closure bug. "Effect captures old props/state when deps missing. Fix: add to dependency array or use functional setState((prev) => prev + 1)." Debugging experience.

---

## Card 61: Custom Hook Patterns
**Q:** What makes a good custom hook?

**A:** Single responsibility, clear name (useXxx), returns what's needed, handles side effects, cleanup properly, flexible with options parameter.

**Difficulty:** 🟡 Medium
**Tags:** #react #hooks #patterns
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Hook design. "Single responsibility, clear name (useWindowSize not useSize), return what's needed. Don't abstract until pattern emerges 2-3 times." Premature abstraction awareness.

---

## Card 62: Render Prop Perf
**Q:** How to optimize render props pattern?

**A:** Memoize render function, avoid inline function in render prop, use useCallback, consider hooks alternative for better performance.

**Difficulty:** 🟡 Medium
**Tags:** #react #patterns #performance
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Legacy pattern. "Render props pre-hooks - memoize function with useCallback. Now custom hooks cleaner: useData() vs <Data render={data => ...} />." Evolution understanding.

---

## Card 63: HOC Best Practices
**Q:** What are HOC best practices?

**A:** Don't mutate original component, pass unrelated props through, copy static methods, wrap display name, don't use inside render.

**Difficulty:** 🟡 Medium
**Tags:** #react #hoc #patterns
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** HOC best practices. "Pass unrelated props, copy static methods, wrap displayName. Don't use in render (creates new component)." Pre-hooks pattern - shows legacy knowledge.

---

## Card 64: Refs and Arrays
**Q:** How to handle refs with lists?

**A:** Use callback refs with array/Map, useRef returns same object, create ref per item via map, or use single ref with data attributes.

**Difficulty:** 🟡 Medium
**Tags:** #react #refs #lists
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Ref arrays. "Callback ref with Map: ref={el => mapRef.current.set(id, el)}. Or single ref with data attributes. useRef returns same object - won't work in map."

---

## Card 65: Portal Event Bubbling
**Q:** How do events work with Portals?

**A:** Events bubble through React tree (not DOM tree). Portal child events bubble to React ancestors even though DOM is elsewhere.

**Difficulty:** 🟡 Medium
**Tags:** #react #portals #events
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Portal quirk. "Events bubble through React tree, not DOM. Modal rendered at body still bubbles to parent in component tree." Synthetic event system understanding.

---

## Card 66: Conditional Hooks
**Q:** Why can't hooks be conditional?

**A:** React relies on hook call order to maintain state between renders. Conditional hooks break this order. Use conditions inside hooks instead.

**Difficulty:** 🟡 Medium
**Tags:** #react #hooks #rules
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Critical rule. "Hook order must stay consistent - React uses index to track state. Conditional breaks this. Put conditions INSIDE hooks." Rule of Hooks mastery.

---

## Card 67: Key Reset Pattern
**Q:** How does changing key force re-render?

**A:** New key unmounts old component, mounts new one with fresh state. Useful for: resetting forms, forcing re-fetch, clearing errors.

**Difficulty:** 🟡 Medium
**Tags:** #react #keys #patterns
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Reset pattern. "Changing key unmounts + remounts with fresh state. Form reset, force refetch, clear errors. <Form key={userId} /> resets on user change."

---

## Card 68: Context Default Value
**Q:** When is Context default value used?

**A:** Only when component has no matching Provider above it. Useful for testing or standalone component use. Not used when Provider value is undefined.

**Difficulty:** 🟡 Medium
**Tags:** #react #context #defaults
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Context gotcha. "Default value ONLY when no Provider. Not used if Provider value={undefined}. Useful for testing components in isolation."

---

## Card 69: Lazy Initial State
**Q:** How does lazy initialization work in useState?

**A:** Pass function to useState: useState(() => expensiveComputation()). Function runs only on initial render. Use for expensive initial state calculations.

**Difficulty:** 🟡 Medium
**Tags:** #react #useState #optimization
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Lazy init optimization. "useState(() => expensive()) runs only on mount. useState(expensive()) runs every render. For localStorage reads, calculations."

---

## Card 70: useReducer Init
**Q:** What's the init function in useReducer?

**A:** Third argument for lazy initialization: useReducer(reducer, initialArg, init). init(initialArg) runs on mount. Useful for resetting state with same init logic.

**Difficulty:** 🟡 Medium
**Tags:** #react #useReducer #initialization
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** useReducer init. "Third arg: useReducer(reducer, initialArg, init). Reusable init logic for reset functionality. Rare but elegant for complex initialization."

---

## Card 71: Bail Out Updates
**Q:** How does React bail out of updates?

**A:** Uses Object.is to compare new and old state. If same, skips re-render. Works for useState and useReducer. Children still render if parent renders.

**Difficulty:** 🔴 Hard
**Tags:** #react #optimization #internals
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Bail-out mechanism. "Object.is comparison - if same reference, skip render. Why immutability matters. Children render if parent renders regardless."

---

## Card 72: Fiber Lanes
**Q:** What are Fiber lanes in React?

**A:** Priority system for updates. Different types: SyncLane, InputContinuousLane, DefaultLane, TransitionLanes. Enables interrupting low-priority work.

**Difficulty:** 🔴 Hard
**Tags:** #react #fiber #internals
**Frequency:** ⭐⭐

**💡 Interview Tip:** Advanced internals. "Priority lanes: SyncLane (click), TransitionLanes (background). Enables concurrent rendering. Library authors need this, apps abstract it." Senior-level knowledge.

---

## Card 73: Double Rendering
**Q:** Why does React render twice in development?

**A:** StrictMode intentionally double-renders to find bugs with side effects. Helps identify impure components. Production only renders once.

**Difficulty:** 🟢 Easy
**Tags:** #react #strictmode #development
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** StrictMode purpose. "Double-render catches impure components - exposed subscription leak. Production renders once. Best practice: always enable."

---

## Card 74: useEffect Race Condition
**Q:** How to handle race conditions in useEffect?

**A:** Use cleanup function with boolean flag or AbortController. Ignore stale responses. Latest request wins pattern.

**Difficulty:** 🔴 Hard
**Tags:** #react #useEffect #async
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Race condition fix. "Cleanup with ignore flag or AbortController. Latest request wins. Prevented showing stale user profile after fast navigation."

---

## Card 75: Memoization Pitfalls
**Q:** What are common memoization mistakes?

**A:** Memoizing everything (overhead), forgetting dependencies, inline objects/functions as props, comparing complex objects, premature optimization.

**Difficulty:** 🟡 Medium
**Tags:** #react #optimization #mistakes
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Over-optimization. "Memoized 100 components - slower than vanilla. Overhead > benefit for cheap renders. Profile first, optimize second." Learned lesson.

---

## Card 76: Component Mounting
**Q:** What happens during component mount?

**A:** Constructor → getDerivedStateFromProps → render → React updates DOM → componentDidMount/useEffect. Effects run after paint.

**Difficulty:** 🟡 Medium
**Tags:** #react #lifecycle #mounting
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Mount lifecycle. "Constructor → render → DOM updates → useEffect. Effects after paint. Constructor in function component = top-level code."

---

## Card 77: Component Updating
**Q:** What happens during component update?

**A:** getDerivedStateFromProps → shouldComponentUpdate → render → getSnapshotBeforeUpdate → React updates DOM → componentDidUpdate/useEffect cleanup + effect.

**Difficulty:** 🟡 Medium
**Tags:** #react #lifecycle #updating
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Update lifecycle. "getDerivedStateFromProps → render → DOM update → useEffect cleanup → useEffect. Cleanup before next effect run."

---

## Card 78: Component Unmounting
**Q:** What happens during unmount?

**A:** componentWillUnmount/useEffect cleanup runs. Remove event listeners, cancel subscriptions, clear timers, abort requests.

**Difficulty:** 🟢 Easy
**Tags:** #react #lifecycle #unmounting
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Cleanup importance. "useEffect return = cleanup. Remove listeners, cancel fetch, clear timers. Memory leak without cleanup - SPA critical."

---

## Card 79: Render vs Commit
**Q:** What's the difference between render and commit phases?

**A:** Render: React calls components, builds Virtual DOM tree (pure, can be interrupted). Commit: React applies changes to DOM (side effects, synchronous).

**Difficulty:** 🔴 Hard
**Tags:** #react #internals #phases
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Two-phase rendering. "Render (pure, interruptible) builds VDOM. Commit (side effects, sync) applies to DOM. Concurrent rendering pauses render, not commit."

---

## Card 80: Reconciliation Algorithm
**Q:** What assumptions does React's reconciliation make?

**A:** Different types produce different trees (no diffing), keys identify elements across renders, siblings diffed by key/position.

**Difficulty:** 🔴 Hard
**Tags:** #react #reconciliation #internals
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Reconciliation rules. "Different types = rebuild tree. Keys identify elements. Siblings diffed by key. Why <div> → <span> destroys children."

---

## Card 81: State Updates Queue
**Q:** How does React queue state updates?

**A:** Creates update queue per fiber. Processes in order during render. Multiple setState calls batched. Functional updates use previous queued state.

**Difficulty:** 🔴 Hard
**Tags:** #react #state #internals
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Update queue. "Multiple setState batched in queue. Functional updates use previous in queue. setState(n => n+1) 3x = +3. setState(1) 3x = 1."

---

## Card 82: Context Propagation
**Q:** How does Context value change propagate?

**A:** Provider re-renders, all consumers check if value changed, bail out if same reference, re-render if different. Use memo to prevent cascading renders.

**Difficulty:** 🔴 Hard
**Tags:** #react #context #internals
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Context update. "Provider re-renders → consumers check value reference → bail if same. Memoize value to prevent cascading re-renders."

---

## Card 83: Render Optimization
**Q:** What's the render optimization hierarchy?

**A:** 1) Don't render (composition, state colocation), 2) Render less often (memo, useMemo), 3) Render faster (virtualization, code splitting), 4) Perceive as faster (transitions, suspense).

**Difficulty:** 🟡 Medium
**Tags:** #react #optimization #strategy
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Optimization hierarchy. "1) Don't render (composition), 2) Render less (memo), 3) Render faster (virtualization), 4) Perceive faster (Suspense). Order matters!"

---

## Card 84: DevTools Profiler
**Q:** How to use React DevTools Profiler?

**A:** Record render, view flamegraph/ranked chart, identify slow components, check why component rendered, view commit details, compare commits.

**Difficulty:** 🟡 Medium
**Tags:** #react #devtools #profiling
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** DevTools profiling. "Flame graph shows render hierarchy, ranked chart finds slowest. 'Why did this render?' shows props/state changes. Essential debugging tool."

---

## Card 85: Testing Library Principles
**Q:** What are React Testing Library's principles?

**A:** Test user behavior not implementation, query by accessibility, avoid testing details, no shallow rendering, prefer integration over unit.

**Difficulty:** 🟡 Medium
**Tags:** #react #testing #rtl
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Testing philosophy. "Test behavior not implementation. Query by role/label (accessibility). No shallow - full renders. Enzyme → RTL migration = better tests."

---

## Card 86: Async Testing
**Q:** How to test async behavior in React?

**A:** waitFor, findBy queries, waitForElementToBeRemoved, act warnings, mock timers, fake timers. Avoid sleep/arbitrary waits.

**Difficulty:** 🟡 Medium
**Tags:** #react #testing #async
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Async test patterns. "waitFor for assertions, findBy for queries, act warnings for state updates. Avoid waitFor(() => {}, {timeout: 5000}) - flaky tests."

---

## Card 87: Testing Hooks
**Q:** How to test custom hooks?

**A:** Use @testing-library/react-hooks or render hook in test component. Test behavior, not implementation. Test with realistic component usage.

**Difficulty:** 🟡 Medium
**Tags:** #react #testing #hooks
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Hook testing. "@testing-library/react-hooks or render in component. Test with realistic usage - custom hook edge cases caught by real component integration."

---

## Card 88: Snapshot Testing
**Q:** When should you use snapshot tests?

**A:** For stable UI, error messages, translations, styled components props. Avoid for dynamic data, large components. Review carefully on changes.

**Difficulty:** 🟢 Easy
**Tags:** #react #testing #snapshots
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Snapshot caution. "Useful for error messages, stable UI. Avoid for dynamic data - snapshots too large, hard to review. Inline snapshots better than separate files."

---

## Card 89: Form Libraries
**Q:** When to use form libraries vs vanilla React?

**A:** Libraries (Formik, React Hook Form) for: complex validation, many fields, performance needs. Vanilla for: simple forms, learning, minimal dependencies.

**Difficulty:** 🟢 Easy
**Tags:** #react #forms #libraries
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Library decision. "React Hook Form for 50+ fields (perf), Formik for complex validation. Vanilla for learning/simple forms. Bundle size vs DX trade-off."

---

## Card 90: State Management Choice
**Q:** How to choose state management solution?

**A:** Start with useState/useReducer + Context. Add library when: frequent updates across tree, complex sync needs, time-travel debugging, middleware.

**Difficulty:** 🟡 Medium
**Tags:** #react #state-management #architecture
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** State management ladder. "Start: useState + Context. Add when: frequent cross-component updates, devtools needed, middleware. Don't start with Redux." Progressive enhancement.

---

## Card 91: Zustand vs Redux
**Q:** When to choose Zustand over Redux?

**A:** Zustand: simpler API, less boilerplate, smaller bundle, TypeScript-first. Redux: larger ecosystem, DevTools, middleware, more patterns established.

**Difficulty:** 🟡 Medium
**Tags:** #react #state-management #comparison
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Modern comparison. "Zustand: simpler API, less boilerplate, 1.2kb. Redux: mature ecosystem, middleware, time-travel. Both excellent - choose by team preference."

---

## Card 92: Jotai vs Recoil
**Q:** What's the difference between Jotai and Recoil?

**A:** Both atomic state. Jotai: simpler API, smaller (3kb), bottom-up. Recoil: more features, selectors, async queries, Meta-backed but less maintained.

**Difficulty:** 🟡 Medium
**Tags:** #react #state-management #atomic
**Frequency:** ⭐⭐

**💡 Interview Tip:** Atomic state. "Jotai: 3kb, simpler. Recoil: more features but Meta deprioritized. Both bottom-up vs top-down Redux. Jotai active development edge."

---

## Card 93: TanStack Query Use
**Q:** When should you use TanStack Query?

**A:** For server state (API data). Handles caching, refetching, pagination, optimistic updates. Don't use for client state. Works with any data fetching.

**Difficulty:** 🟡 Medium
**Tags:** #react #data-fetching #tanstack
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Server state solution. "React Query = API data management. Caching, refetching, optimistic updates. Don't use for client state. Reduced data fetching code 70%."

---

## Card 94: SWR vs React Query
**Q:** How does SWR compare to React Query?

**A:** SWR: simpler, smaller, Vercel-backed. React Query: more features, better DevTools, larger ecosystem. Both excellent for server state.

**Difficulty:** 🟡 Medium
**Tags:** #react #data-fetching #comparison
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Data fetching comparison. "SWR: simpler, smaller, stale-while-revalidate focus. React Query: more features, better DevTools. Both solve same problem excellently."

---

## Card 95: React Router Loaders
**Q:** What are React Router loaders?

**A:** Functions that load data before route renders. Runs during navigation, suspends navigation until loaded. Used with defer() for streaming.

**Difficulty:** 🟡 Medium
**Tags:** #react #react-router #data-loading
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Router data loading. "Loaders run before route renders - data ready immediately. defer() for streaming. Eliminates useEffect fetch waterfalls."

---

## Card 96: Protected Routes
**Q:** How to implement protected routes?

**A:** Wrap with auth check, redirect if unauthorized, use route guards/loaders, Outlet for nested routes, separate Route components.

**Difficulty:** 🟡 Medium
**Tags:** #react #react-router #auth
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Auth pattern. "Protected route wrapper checks auth, redirects to login. Outlet for nested routes. Loader can preload user data before render."

---

## Card 97: CSS-in-JS Trade-offs
**Q:** What are CSS-in-JS pros and cons?

**A:** Pros: scoped styles, dynamic, colocation, TypeScript. Cons: runtime cost, larger bundle, learning curve. Consider CSS Modules or Tailwind alternatives.

**Difficulty:** 🟡 Medium
**Tags:** #react #styling #css-in-js
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Styling trade-offs. "CSS-in-JS runtime cost vs type safety. Styled-components 16kb vs Tailwind 0kb runtime. Zero-runtime options: Linaria, vanilla-extract."

---

## Card 98: Styled Components vs Emotion
**Q:** What's the difference?

**A:** Very similar. Emotion: smaller, faster, more flexible. Styled Components: more popular, better ecosystem. Both work well. Performance similar.

**Difficulty:** 🟢 Easy
**Tags:** #react #styling #libraries
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Library choice. "Emotion: 10kb, framework-agnostic. Styled-components: 14kb, React-specific, more popular. Performance similar - ecosystem size main difference."

---

## Card 99: Accessibility in React
**Q:** What are key accessibility practices?

**A:** Semantic HTML, ARIA labels, keyboard navigation, focus management, screen reader testing, color contrast, error announcements.

**Difficulty:** 🟡 Medium
**Tags:** #react #accessibility #a11y
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** A11y essentials. "Semantic HTML first, ARIA when needed. Keyboard nav, focus visible, screen reader test. Color contrast 4.5:1. Error announcements with live regions."

---

## Card 100: Focus Management
**Q:** How to manage focus in React?

**A:** useRef for focus elements, autofocus with useEffect, trap focus in modals, restore focus on unmount, skip links for navigation.

**Difficulty:** 🟡 Medium
**Tags:** #react #accessibility #focus
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Focus control. "useRef + useEffect for autofocus. Trap focus in modals with focus-trap-react. Restore focus on close. Skip links for keyboard users."

---

[← Back to Flashcards](../README.md)
# APPLYING TIPS TO CARDS 46-100 IN SINGLE OPERATION
