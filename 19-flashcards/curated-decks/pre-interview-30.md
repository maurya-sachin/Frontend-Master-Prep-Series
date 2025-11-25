# Pre-Interview 30 Flashcards

> **30 critical questions to review 30 minutes before your interview**

**Time to review:** 15 minutes
**Best for:** Final review, confidence boost before interview

---

## Card 1: Closures Quick
**Q:** Explain closures in one sentence.

**A:** A function that remembers and accesses variables from its outer scope even after outer function has returned.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #closures
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 2: Event Loop Quick
**Q:** What's the order: microtasks or macrotasks first?

**A:** Microtasks (Promises, queueMicrotask) execute before macrotasks (setTimeout, setInterval). All microtasks run before next macrotask.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #event-loop
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 3: this Binding Quick
**Q:** How is 'this' determined?

**A:** 1) new keyword → new object, 2) call/apply/bind → explicit, 3) obj.method() → obj, 4) Arrow function → lexical, 5) Default → undefined (strict) or window.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #this
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 4: Promises Quick
**Q:** What are Promise states?

**A:** Pending (initial), Fulfilled (success with value), Rejected (failure with reason). Can only transition once.

**Difficulty:** 🟢 Easy
**Tags:** #javascript #promises
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 5: Virtual DOM Quick
**Q:** Why is Virtual DOM fast?

**A:** Batches updates, minimal DOM operations, efficient diffing algorithm. Updating real DOM is expensive, virtual DOM is just JavaScript objects.

**Difficulty:** 🟢 Easy
**Tags:** #react #virtual-dom
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 6: Hooks Rules Quick
**Q:** Two main rules of hooks?

**A:** 1) Only call at top level (not in loops/conditions/nested functions), 2) Only call from React functions (components or custom hooks).

**Difficulty:** 🟢 Easy
**Tags:** #react #hooks
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 7: useEffect Deps Quick
**Q:** Empty array [] vs no array in useEffect?

**A:** Empty [] → runs once (mount only). No array → runs after every render. Dependency array → runs when dependencies change.

**Difficulty:** 🟢 Easy
**Tags:** #react #useEffect
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 8: Keys in Lists Quick
**Q:** Why are keys important?

**A:** Help React identify which items changed. Enable efficient reconciliation. Must be stable, unique, not array index.

**Difficulty:** 🟢 Easy
**Tags:** #react #keys
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 9: CSS Specificity Quick
**Q:** Specificity order from highest to lowest?

**A:** !important > inline styles > IDs > Classes/attributes/pseudo-classes > Elements > Universal selector.

**Difficulty:** 🟢 Easy
**Tags:** #css #specificity
**Frequency:** ⭐⭐⭐⭐

---

## Card 10: Flexbox Quick
**Q:** Main axis vs cross axis?

**A:** Main axis → direction of flex-direction (row=horizontal, column=vertical). Cross axis → perpendicular to main axis.

**Difficulty:** 🟢 Easy
**Tags:** #css #flexbox
**Frequency:** ⭐⭐⭐⭐

---

## Card 11: Box Model Quick
**Q:** CSS box model layers from outside to inside?

**A:** Margin → Border → Padding → Content. box-sizing: border-box includes padding/border in width.

**Difficulty:** 🟢 Easy
**Tags:** #css #box-model
**Frequency:** ⭐⭐⭐⭐

---

## Card 12: HTTP Methods Quick
**Q:** Difference between PUT and PATCH?

**A:** PUT → replace entire resource. PATCH → partial update. Both are idempotent.

**Difficulty:** 🟢 Easy
**Tags:** #http #api
**Frequency:** ⭐⭐⭐⭐

---

## Card 13: CORS Quick
**Q:** What is CORS?

**A:** Cross-Origin Resource Sharing. Browser security that blocks requests to different origins unless server allows it via headers.

**Difficulty:** 🟢 Easy
**Tags:** #security #cors
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 14: XSS Quick
**Q:** How to prevent XSS?

**A:** Sanitize user input, escape output, use Content Security Policy, validate on server, use textContent not innerHTML.

**Difficulty:** 🟡 Medium
**Tags:** #security #xss
**Frequency:** ⭐⭐⭐⭐

---

## Card 15: TypeScript Benefits Quick
**Q:** Top 3 benefits of TypeScript?

**A:** 1) Catch errors at compile time, 2) Better IDE autocomplete/IntelliSense, 3) Self-documenting code with types.

**Difficulty:** 🟢 Easy
**Tags:** #typescript
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 16: SSR vs CSR Quick
**Q:** SSR vs CSR difference?

**A:** SSR → server renders HTML, faster FCP, better SEO. CSR → client renders, slower initial load, better interactivity.

**Difficulty:** 🟢 Easy
**Tags:** #nextjs #rendering
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 17: useMemo Quick
**Q:** When to use useMemo?

**A:** Expensive calculations, avoid recreating objects/arrays that cause re-renders, optimize child component props.

**Difficulty:** 🟡 Medium
**Tags:** #react #useMemo
**Frequency:** ⭐⭐⭐⭐

---

## Card 18: useCallback Quick
**Q:** When to use useCallback?

**A:** Pass stable function reference to child components (prevent unnecessary re-renders), dependency in useEffect, event handlers passed as props.

**Difficulty:** 🟡 Medium
**Tags:** #react #useCallback
**Frequency:** ⭐⭐⭐⭐

---

## Card 19: Debounce vs Throttle Quick
**Q:** Debounce vs Throttle?

**A:** Debounce → execute after user stops (search). Throttle → execute at intervals (scroll). Debounce waits for pause.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #performance
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 20: REST vs GraphQL Quick
**Q:** Key difference REST vs GraphQL?

**A:** REST → multiple endpoints, over/under fetching. GraphQL → single endpoint, request exactly what you need, strongly typed.

**Difficulty:** 🟢 Easy
**Tags:** #api #graphql
**Frequency:** ⭐⭐⭐⭐

---

## Card 21: Web Vitals Quick
**Q:** Name 3 Core Web Vitals.

**A:** LCP (Largest Contentful Paint < 2.5s), FID (First Input Delay < 100ms), CLS (Cumulative Layout Shift < 0.1).

**Difficulty:** 🟡 Medium
**Tags:** #performance #web-vitals
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 22: Semantic HTML Quick
**Q:** Why use semantic HTML?

**A:** Better accessibility (screen readers), improved SEO, cleaner code, default styling, clearer document structure.

**Difficulty:** 🟢 Easy
**Tags:** #html #semantics
**Frequency:** ⭐⭐⭐⭐

---

## Card 23: ARIA Quick
**Q:** What is ARIA?

**A:** Accessible Rich Internet Applications. Attributes that make web content accessible to people with disabilities (aria-label, role, etc).

**Difficulty:** 🟢 Easy
**Tags:** #accessibility #aria
**Frequency:** ⭐⭐⭐⭐

---

## Card 24: Testing Library Quick
**Q:** Testing Library philosophy?

**A:** Test how users interact with app, not implementation details. Query by accessible attributes (role, label), not CSS classes/IDs.

**Difficulty:** 🟢 Easy
**Tags:** #testing #rtl
**Frequency:** ⭐⭐⭐⭐

---

## Card 25: Redux vs Context Quick
**Q:** When to use Redux over Context?

**A:** Redux for: complex state logic, frequent updates, large apps, dev tools needed. Context for: simple shared state, theme, auth.

**Difficulty:** 🟡 Medium
**Tags:** #react #state-management
**Frequency:** ⭐⭐⭐⭐

---

## Card 26: Git Rebase vs Merge Quick
**Q:** Rebase vs Merge difference?

**A:** Merge → creates merge commit, preserves history. Rebase → replays commits on top, linear history. Don't rebase public branches.

**Difficulty:** 🟡 Medium
**Tags:** #git #workflow
**Frequency:** ⭐⭐⭐

---

## Card 27: HTTP Status Quick
**Q:** Common HTTP status codes?

**A:** 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error.

**Difficulty:** 🟢 Easy
**Tags:** #http #status
**Frequency:** ⭐⭐⭐⭐

---

## Card 28: LocalStorage vs SessionStorage Quick
**Q:** LocalStorage vs SessionStorage?

**A:** LocalStorage → persists until cleared. SessionStorage → cleared when tab closes. Both ~5MB limit, same-origin only.

**Difficulty:** 🟢 Easy
**Tags:** #browser #storage
**Frequency:** ⭐⭐⭐⭐

---

## Card 29: Hoisting Quick
**Q:** What gets hoisted?

**A:** var (hoisted, initialized undefined), function declarations (hoisted, initialized). let/const hoisted but in TDZ. Classes hoisted but not initialized.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #hoisting
**Frequency:** ⭐⭐⭐⭐

---

## Card 30: Async/Await Quick
**Q:** Async/await vs Promises?

**A:** Async/await is syntactic sugar over Promises. Makes async code look synchronous. async function always returns Promise. await pauses execution.

**Difficulty:** 🟢 Easy
**Tags:** #javascript #async
**Frequency:** ⭐⭐⭐⭐⭐

---

## 🎯 Quick Mental Checklist

Before interview starts, ensure you can explain:
- ✅ Closures (why they matter)
- ✅ Event loop (order of execution)
- ✅ this binding (5 rules)
- ✅ React hooks (rules, useEffect, useMemo)
- ✅ Performance optimization (debounce, memoization)
- ✅ One project deeply (architecture, challenges, solutions)

**You've got this! 🚀**

---

[← Back to Flashcards](../README.md) | [View Essential 50 →](./essential-50.md)
