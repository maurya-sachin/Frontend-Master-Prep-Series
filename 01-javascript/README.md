# JavaScript Interview Preparation

> **200+ questions with comprehensive answers covering core concepts, async patterns, engine internals, and modern JavaScript**

Master JavaScript from fundamentals to advanced topics. This section covers everything you need for mid to senior level frontend interviews.

---

## 📚 Table of Contents

### 1️⃣ Fundamentals

| File | Topics | Questions | Difficulty |
|------|--------|-----------|------------|
| [01a. Primitives & Types](./01a-primitives-types.md) | Data types, Symbol, BigInt, typeof/instanceof | 4 | 🟢 🟡 |
| [01b. Variables & Declarations](./01b-variables-declarations.md) | var/let/const, hoisting, TDZ, strict mode | 4 | 🟢 🟡 |
| [01c. Scope & Closures](./01c-scope-closures.md) | Lexical scope, shadowing, closures, lexical environment | 4 | 🟡 |

### 2️⃣ Operators & Syntax

| File | Topics | Questions | Difficulty |
|------|--------|-----------|------------|
| [02a. Type Checking & Equality](./02a-type-checking-equality.md) | ==, ===, truthy/falsy, type coercion | 5 | 🟢 🟡 |
| [02b. Modern Operators](./02b-operators-modern.md) | Optional chaining, nullish coalescing, spread, templates | 5 | 🟢 🟡 |
| [02c. Destructuring & Params](./02c-destructuring-params.md) | Destructuring, rest parameters, default parameters | 3 | 🟢 |

### 3️⃣ Functions

| File | Topics | Questions | Difficulty |
|------|--------|-----------|------------|
| [03a. Functions Basics](./03a-functions-basics.md) | Higher-order functions, pure functions, arrow functions | 3 | 🟡 |
| [03b. 'this' & Binding](./03b-this-binding.md) | this keyword, implicit/explicit binding, bind polyfill | 5 | 🟡 🔴 |
| [03c. Advanced Functions](./03c-advanced-functions.md) | Memoization, advanced patterns | 1 | 🔴 |

### 4️⃣ Objects

| File | Topics | Questions | Difficulty |
|------|--------|-----------|------------|
| [04a. Objects Basics](./04a-objects-basics.md) | Object methods, Map vs Object | 2 | 🟢 🟡 |
| [04b. Prototypes & Inheritance](./04b-prototypes-inheritance.md) | Prototypal inheritance, prototype chain, Object.create | 3 | 🟡 🔴 |

### 5️⃣ Arrays

| File | Topics | Questions | Difficulty |
|------|--------|-----------|------------|
| [05a. Arrays Basics](./05a-arrays-basics.md) | Array methods - map, filter, reduce, find, some, every | 2 | 🟢 🟡 |

### 6️⃣ Asynchronous JavaScript

| File | Topics | Questions | Difficulty |
|------|--------|-----------|------------|
| [06a. Async Fundamentals](./06a-async-fundamentals.md) | Sync vs async, event loop, microtasks/macrotasks | 3 | 🟡 🔴 |
| [06b. Promises](./06b-promises.md) | Promises, Promise.all/race/allSettled, error handling | 3 | 🟡 🔴 |
| [06c. Async/Await](./06c-async-await.md) | async/await, async iteration | 2 | 🟡 🔴 |
| [06d. Async Patterns](./06d-async-patterns.md) | Patterns, AbortController, debounce/throttle, memory | 4 | 🔴 |

### 7️⃣ Engine & Performance

| File | Topics | Questions | Difficulty |
|------|--------|-----------|------------|
| [07a. Execution Context](./07a-execution-context.md) | Execution context, creation/execution phases, call stack | 4 | 🟡 🔴 |
| [07b. Memory Management](./07b-memory-management.md) | Stack/heap, memory management, GC, memory leaks | 4 | 🔴 |

### 8️⃣ Modules & Patterns

| File | Topics | Questions | Difficulty |
|------|--------|-----------|------------|
| [08a. Modules & Patterns](./08a-modules-patterns.md) | ES6 modules, CommonJS, IIFE, Singleton | 4 | 🟡 🔴 |

### 9️⃣ Error Handling

| File | Topics | Questions | Difficulty |
|------|--------|-----------|------------|
| [09a. Error Handling](./09a-error-handling.md) | try-catch-finally, error patterns | 1 | 🟢 |

---

**Total: 66 Q&A across 20 topic-focused files** (will expand to 200+ with future additions)

---

## 🎯 Learning Path

### For Beginners (1-2 years experience)

**Start Here (Weeks 1-2):**

1. **01a-01c: Fundamentals** - Primitives, variables, scope, closures
2. **02a-02c: Operators** - Equality, modern operators, destructuring
3. **03a: Functions Basics** - Higher-order, pure functions
4. **05a: Arrays Basics** - Essential array methods

**Skip for now:**
- Execution Context & Memory (too advanced)
- Advanced Functions & Patterns

**Goal:** Build strong foundation in core JavaScript concepts

### For Intermediate (3-4 years experience)

**Focus Areas (Weeks 1-3):**

1. **03b: 'this' & Binding** - Critical for interviews
2. **06a-06c: Async JavaScript** - Event loop, promises, async/await
3. **04a-04b: Objects** - Object methods, prototypes, inheritance
4. **07a: Execution Context** - Call stack, scope chain

**Goal:** Master asynchronous patterns and execution model

### For Senior (5+ years experience)

**Deep Dive (Ongoing):**

1. **07b: Memory Management** - GC, memory leaks, optimization
2. **06d: Async Patterns** - Advanced patterns, performance
3. **08a: Modules & Patterns** - Design patterns, code architecture
4. **03c: Advanced Functions** - Memoization, advanced techniques

**Goal:** Expert-level understanding of JavaScript internals

---

## ⭐ Most Frequently Asked Questions

These questions appear in 80%+ of JavaScript interviews:

1. **Closures** - What they are and how they work (⭐⭐⭐⭐⭐)
2. **Event Loop** - Macro vs micro tasks (⭐⭐⭐⭐⭐)
3. **Promises** - States, chaining, error handling (⭐⭐⭐⭐⭐)
4. **this binding** - How this is determined (⭐⭐⭐⭐⭐)
5. **Prototypal Inheritance** - How it works (⭐⭐⭐⭐⭐)
6. **Hoisting** - var, let, const behavior (⭐⭐⭐⭐⭐)
7. **Async/Await** - How it works under the hood (⭐⭐⭐⭐⭐)
8. **Debounce/Throttle** - Implementation (⭐⭐⭐⭐⭐)
9. **Event Delegation** - Pattern and benefits (⭐⭐⭐⭐)
10. **Modules** - ESM vs CommonJS (⭐⭐⭐⭐)

---

## 🔥 Company-Specific Focus

### Google

- Event loop deep dive
- Performance optimization
- Async patterns
- Algorithm complexity

### Meta (Facebook)

- Closures and scope
- Prototypal inheritance
- Functional programming
- React-specific JS patterns

### Amazon

- Promises and async/await
- Error handling
- Data structures
- Code organization

### Microsoft

- TypeScript fundamentals
- OOP patterns
- Modern ES features
- Performance

---

## 📖 How to Use This Section

### 1. Sequential Learning

Read files in order (01 → 09) for systematic understanding.

### 2. Topic-Based Learning

Jump to specific topics based on your weak areas.

### 3. Interview Prep (Quick Review)

Focus on ⭐⭐⭐⭐⭐ questions in each file.

### 4. Deep Dive

Read every question, run every code example, solve follow-ups.

---

## 💻 Code Examples

Each file includes:

- ✅ Working code examples
- ✅ Console output
- ✅ Common mistakes (❌ vs ✅)
- ✅ Real-world use cases
- ✅ Performance considerations

**Run examples in:**

- Browser DevTools Console (F12)
- Node.js REPL
- CodeSandbox / StackBlitz
- Your code editor with Node

---

## 🎓 Difficulty Breakdown

| Difficulty | Count | Description |
|------------|-------|-------------|
| 🟢 Easy | ~60 questions | Fundamentals, must-know concepts |
| 🟡 Medium | ~100 questions | Interview-level, requires practice |
| 🔴 Hard | ~40 questions | Advanced, senior-level topics |

---

## ⏱ Time Estimates

| Study Mode | Time Required |
|------------|---------------|
| **Quick Review** (⭐⭐⭐⭐⭐ only) | 6-8 hours |
| **Intermediate** (🟢 + 🟡) | 15-20 hours |
| **Complete Mastery** (all 200+) | 30-40 hours |

---

## 🔗 Related Resources

- **[JavaScript Coding Problems](../18-coding-challenges/01-javascript-fundamentals/)** - Practice implementations
- **[JavaScript Flashcards](../19-flashcards/by-topic/javascript.md)** - Quick review
- **[Code Examples Directory](./examples/)** - Runnable code samples

---

## 📊 Progress Tracking

Track your progress through each file:

- [ ] 01. Core Concepts (30+ questions)
- [ ] 02. Asynchronous JavaScript (25+ questions)
- [ ] 03. Execution Context & Event Loop (25+ questions)
- [ ] 04. Functions & Binding (25+ questions)
- [ ] 05. Objects & Prototypes (25+ questions)
- [ ] 06. Memory & Engine (20+ questions)
- [ ] 07. Modules & Patterns (20+ questions)
- [ ] 08. Advanced Behavior (20+ questions)
- [ ] 09. Data Structures & Algorithms (20+ questions)

**Total:** 200+ questions

---

## 🎯 Quick Start

**New to this section?** → Start with [Core Concepts](./01-core-concepts.md)

**Interview tomorrow?** → Review ⭐⭐⭐⭐⭐ questions in each file

**Mastering JavaScript?** → Go through sequentially, complete all exercises

---

## 💡 Study Tips

1. **Don't just read - code!** Type every example, modify it, break it
2. **Use active recall** - Cover answers and try to explain concepts
3. **Teach someone else** - Best way to solidify understanding
4. **Review spaced repetition** - Revisit topics after 1, 3, 7, 14 days
5. **Build projects** - Apply concepts in real applications

---

[← Back to Main README](../README.md) | [Start Learning →](./01-core-concepts.md)
