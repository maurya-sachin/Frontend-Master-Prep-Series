# JavaScript Fundamentals - Coding Problems

> **18 essential JavaScript implementation problems asked in interviews** (Growing to 30+)

Master core JavaScript patterns and polyfills that appear in every frontend interview.

---

## 📚 Problems List

| # | Problem | Difficulty | Frequency | Companies |
|---|---------|------------|-----------|-----------|
| 1 | [Array Chunk](./array-chunk.md) | 🟢 Easy | ⭐⭐⭐⭐ | All |
| 2 | [Array Prototype Methods](./array-prototype-methods.md) | 🟡 Medium | ⭐⭐⭐⭐⭐ | All |
| 3 | [Async Retry Logic](./async-retry.md) | 🟡 Medium | ⭐⭐⭐⭐⭐ | All |
| 4 | [Call/Apply/Bind Polyfill](./bind-polyfill.md) | 🟡 Medium | ⭐⭐⭐⭐⭐ | Meta, Amazon |
| 5 | [Compose & Pipe](./compose-pipe.md) | 🟡 Medium | ⭐⭐⭐⭐⭐ | Google, Meta, Airbnb |
| 6 | [Curry Function](./curry-function.md) | 🟡 Medium | ⭐⭐⭐⭐ | Meta, Google |
| 7 | [Debounce](./debounce.md) | 🟡 Medium | ⭐⭐⭐⭐⭐ | Google, Meta, Amazon |
| 8 | [Deep Clone](./deep-clone.md) | 🟡 Medium | ⭐⭐⭐⭐⭐ | All |
| 9 | [Event Emitter](./event-emitter.md) | 🟡 Medium | ⭐⭐⭐⭐ | Meta, Netflix |
| 10 | [Flatten Array](./flatten-array.md) | 🟢 Easy | ⭐⭐⭐⭐ | Google, Amazon |
| 11 | [Memoize](./memoize.md) | 🟡 Medium | ⭐⭐⭐⭐⭐ | Meta, Amazon |
| 12 | [Object Get by Path](./object-get-path.md) | 🟡 Medium | ⭐⭐⭐⭐⭐ | Google, Meta, Amazon |
| 13 | [Object Set by Path](./object-set-path.md) | 🟡 Medium | ⭐⭐⭐⭐ | Google, Meta |
| 14 | [Promise.all Polyfill](./promise-all.md) | 🟡 Medium | ⭐⭐⭐⭐⭐ | Google, Amazon |
| 15 | [Promise.allSettled Polyfill](./promise-allsettled.md) | 🟡 Medium | ⭐⭐⭐⭐ | Google, Microsoft |
| 16 | [Promise.any Polyfill](./promise-any.md) | 🟡 Medium | ⭐⭐⭐⭐ | Google, Meta |
| 17 | [Promise.race Polyfill](./promise-race.md) | 🟡 Medium | ⭐⭐⭐⭐ | Google, Microsoft |
| 18 | [Throttle](./throttle.md) | 🟡 Medium | ⭐⭐⭐⭐⭐ | Google, Meta, Netflix |

---

## 🎯 Study Approach

### 1. Start with Core Utilities
**Week 1:** Debounce, Throttle, Memoize (most common)

### 2. Master Promises
**Week 2:** Promise.all, Promise.race, Promise.allSettled, Promise.any, Async Retry

### 3. Deep Dive Fundamentals
**Week 3:** Deep Clone, Curry, Compose/Pipe, Bind Polyfill

### 4. Object Manipulation
**Week 4:** Object get/set by path, Array methods, Flatten, Chunk

---

## 💡 Problem-Solving Template

```javascript
// 1. Understand Requirements
// - What are the inputs/outputs?
// - What edge cases exist?
// - What's the expected behavior?

// 2. Write Basic Solution
function solution(input) {
  // Get it working first
}

// 3. Add Error Handling
function solution(input) {
  if (!input) throw new Error('Invalid input');
  // Handle edge cases
}

// 4. Optimize
function solution(input) {
  // Improve time/space complexity
  // Consider caching, early returns, etc.
}

// 5. Write Tests
describe('solution', () => {
  test('handles normal case', () => {});
  test('handles edge cases', () => {});
});
```

---

## 🔥 Most Commonly Asked

Based on interview frequency:

1. **Debounce** - Rate limiting user input
2. **Throttle** - Controlling event frequency
3. **Deep Clone** - Copying nested objects
4. **Promise.all** - Concurrent operations
5. **Memoize** - Function result caching
6. **Object Get/Set** - Nested property access
7. **Curry** - Function transformation
8. **Compose/Pipe** - Function composition

---

## 📊 Difficulty Breakdown

- **🟢 Easy (2):** array-chunk, flatten-array
- **🟡 Medium (16):** All others
- **🔴 Hard (0):** Coming soon (advanced implementations)

---

## ⏱️ Time Estimates

- Easy: 10-15 minutes
- Medium: 20-25 minutes
- Hard: 30-40 minutes

Practice timing yourself in interview conditions!

---

## 🎓 Learning Path

**Beginner (1-2 years):**
1. Array Chunk, Flatten Array
2. Debounce, Throttle
3. Deep Clone

**Intermediate (3-4 years):**
1. All Promise polyfills
2. Memoize, Curry
3. Object get/set by path

**Advanced (5-6 years):**
1. Compose/Pipe
2. Async Retry with exponential backoff
3. Event Emitter with wildcards

---

[← Back to Coding Problems](../README.md)
