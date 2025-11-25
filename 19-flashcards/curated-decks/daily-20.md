# Daily Review 20 Flashcards

> **20 cards to review every morning - keeps concepts fresh**

**Time to review:** 10 minutes
**Best for:** Daily habit, long-term retention

---

## Card 1: Closure Example
**Q:** What does this return? `function outer() { let x = 1; return function() { return ++x; } } const fn = outer(); fn(); fn();`

**A:** Returns 2, then 3. Inner function closes over x, maintains reference even after outer returns.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #closures
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 2: Promise Chain
**Q:** What executes first? `Promise.resolve().then(() => console.log('A')); console.log('B');`

**A:** 'B' then 'A'. console.log('B') is synchronous. Promise.then is microtask, runs after current execution.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #promises
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 3: useState Functional Update
**Q:** Why use `setCount(c => c + 1)` instead of `setCount(count + 1)`?

**A:** Functional update ensures you get latest state value. Important when multiple updates in same render or async updates.

**Difficulty:** 🟡 Medium
**Tags:** #react #useState
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 4: useEffect Infinite Loop
**Q:** Why does this cause infinite loop? `useEffect(() => setCount(count + 1), [count])`

**A:** setCount updates count → triggers effect → updates count → infinite. Need exit condition or remove from deps.

**Difficulty:** 🟡 Medium
**Tags:** #react #useEffect
**Frequency:** ⭐⭐⭐⭐

---

## Card 5: Array Index Keys
**Q:** Why not use array index as key?

**A:** Breaks when items reorder/insert/delete. React can't track identity. Causes bugs with state and re-renders.

**Difficulty:** 🟢 Easy
**Tags:** #react #keys
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 6: CSS Centering
**Q:** Three ways to center a div?

**A:** 1) Flexbox: `display: flex; justify-content: center; align-items: center`, 2) Grid: `display: grid; place-items: center`, 3) Position: `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)`.

**Difficulty:** 🟢 Easy
**Tags:** #css #layout
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 7: == vs ===
**Q:** What's `0 == '0'` and `0 === '0'`?

**A:** `true` (== coerces types), `false` (=== strict equality). Always use === unless you specifically need coercion.

**Difficulty:** 🟢 Easy
**Tags:** #javascript #operators
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 8: Async/Await Error
**Q:** How to catch errors in async/await?

**A:** Wrap in try/catch block. Or use `.catch()` on the returned Promise. async functions always return Promise.

**Difficulty:** 🟢 Easy
**Tags:** #javascript #async
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 9: Memoization Value
**Q:** When does React.memo help?

**A:** When component re-renders often with same props. Expensive render cost. Parent re-renders frequently but props don't change.

**Difficulty:** 🟡 Medium
**Tags:** #react #optimization
**Frequency:** ⭐⭐⭐⭐

---

## Card 10: HTTP GET vs POST
**Q:** Can GET have body? Can POST be cached?

**A:** GET technically can have body but shouldn't (ignored by many servers). POST can be cached with proper headers but rarely is.

**Difficulty:** 🟡 Medium
**Tags:** #http #api
**Frequency:** ⭐⭐⭐⭐

---

## Card 11: Event Bubbling
**Q:** What is event bubbling?

**A:** Events propagate from target element up through ancestors. Use stopPropagation() to stop. Capturing is opposite direction.

**Difficulty:** 🟢 Easy
**Tags:** #javascript #events
**Frequency:** ⭐⭐⭐⭐

---

## Card 12: Semantic Tags
**Q:** Name 5 semantic HTML5 tags.

**A:** `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`. Better than generic `<div>`.

**Difficulty:** 🟢 Easy
**Tags:** #html #semantics
**Frequency:** ⭐⭐⭐⭐

---

## Card 13: LocalStorage Limit
**Q:** What's the storage limit for localStorage?

**A:** ~5-10MB per origin (varies by browser). Synchronous API. Strings only. Use IndexedDB for larger data.

**Difficulty:** 🟢 Easy
**Tags:** #browser #storage
**Frequency:** ⭐⭐⭐

---

## Card 14: Git Reset vs Revert
**Q:** Difference between git reset and git revert?

**A:** reset → moves branch pointer, rewrites history. revert → creates new commit that undoes changes, preserves history.

**Difficulty:** 🟡 Medium
**Tags:** #git
**Frequency:** ⭐⭐⭐

---

## Card 15: HTTPS Purpose
**Q:** What does HTTPS provide?

**A:** Encryption (confidentiality), Authentication (identity verification), Integrity (data not tampered). Uses TLS/SSL.

**Difficulty:** 🟢 Easy
**Tags:** #security #https
**Frequency:** ⭐⭐⭐⭐

---

## Card 16: TypeScript any vs unknown
**Q:** Difference between any and unknown?

**A:** any → disables type checking completely. unknown → requires type checking before use (safer). Prefer unknown.

**Difficulty:** 🟡 Medium
**Tags:** #typescript
**Frequency:** ⭐⭐⭐⭐

---

## Card 17: Mobile-First CSS
**Q:** What is mobile-first approach?

**A:** Write base styles for mobile, use min-width media queries to add styles for larger screens. Easier to scale up than down.

**Difficulty:** 🟢 Easy
**Tags:** #css #responsive
**Frequency:** ⭐⭐⭐⭐

---

## Card 18: Next.js getStaticProps
**Q:** When does getStaticProps run?

**A:** At build time for static generation. Never runs client-side. Data fetched once, reused for all requests (until revalidate).

**Difficulty:** 🟡 Medium
**Tags:** #nextjs #ssr
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 19: RESTful Principles
**Q:** Name 3 RESTful principles.

**A:** 1) Stateless (no client context stored), 2) Resource-based URLs, 3) HTTP methods (GET, POST, PUT, DELETE), 4) JSON/XML representations.

**Difficulty:** 🟢 Easy
**Tags:** #api #rest
**Frequency:** ⭐⭐⭐⭐

---

## Card 20: Web Accessibility
**Q:** What's alt text for?

**A:** Describes images for screen readers. Displayed if image fails to load. Improves SEO. Required for accessibility compliance.

**Difficulty:** 🟢 Easy
**Tags:** #accessibility #html
**Frequency:** ⭐⭐⭐⭐

---

## 🌅 Morning Routine

1. **Review these 20 cards** (10 min)
2. **Explain 3 cards out loud** (practice articulation)
3. **Mark difficult cards** (review again tomorrow)
4. **Solve 1 easy coding problem** (warm up brain)

**Consistency is key - review daily for best results!**

---

[← Back to Flashcards](../README.md)
