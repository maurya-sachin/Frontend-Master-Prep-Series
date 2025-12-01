# Code Output Prediction Flashcards

> **50 tricky code output questions for interviews**

**Time to review:** 25 minutes
**Best for:** Coding rounds, technical screening

---

## Card 1: Hoisting Output
**Q:** What does this output?
```js
console.log(x);
var x = 5;
```

**A:** `undefined` - var declarations hoisted, not assignments. Equivalent to: var x; console.log(x); x = 5;

**Difficulty:** 🟢 Easy
**Tags:** #javascript #hoisting #output
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Key principle: hoisting moves variable declarations to top, but NOT initialization. Visualize in two phases—compilation (declarations move up) and execution (assignments stay in place). When explaining to interviewer, say "var x gets hoisted as undefined, then assignment x=5 happens later." Always distinguish var hoisting from const/let Temporal Dead Zone.

---

## Card 2: Closure Counter
**Q:** What does this output?
```js
for(var i=0; i<3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

**A:** `3 3 3` - var is function-scoped, closure captures same i. Fix with let or IIFE.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #closures #output
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Classic closure trap! Closures capture variables by reference, not value. All three setTimeout callbacks reference the same `i` variable. By the time callbacks execute, loop completed and i=3. Explain fix: "Use let for block scope" or "Wrap in IIFE to create new scope per iteration." Interviewer will likely ask why let fixes it—explain block-scope vs function-scope.

---

## Card 3: This Binding
**Q:** What does this output?
```js
const obj = {
  x: 10,
  getX: () => this.x
};
console.log(obj.getX());
```

**A:** `undefined` - arrow functions inherit this from parent scope (global), not obj.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #this #output
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Critical this difference: arrow functions DON'T have their own `this`—they inherit from lexical scope (parent scope where defined). Regular function would output 10. When solving code output with arrow functions, trace back to where arrow is defined, not where called. Interviewer follow-up: "What if we used regular function instead?"

---

## Card 4: Type Coercion
**Q:** What does this output?
```js
console.log([] + []);
console.log([] + {});
console.log({} + []);
```

**A:** `""` (empty string), `"[object Object]"`, `0` - complex coercion rules.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #coercion #output
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Most advanced coercion question—trace step-by-step: (1) Both sides become primitives via valueOf() then toString(). (2) [] toString gives "", {} toString gives "[object Object]". (3) {} in statement context is block, not object. Explain: "First case two empty strings concat to empty string. Second case empty array toString plus object toString. Third case is actually 0 + [] because {} is treated as code block."

---

## Card 5: Promise Order
**Q:** What order?
```js
console.log('1');
Promise.resolve().then(() => console.log('2'));
console.log('3');
```

**A:** `1 3 2` - Promises are microtasks, run after synchronous code but before macrotasks.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #promises #output
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Event loop hierarchy: (1) Synchronous code executes first (1, 3). (2) Microtasks run (Promises, then, catch, finally). (3) Macrotasks run (setTimeout, setInterval). When tracing output, execute all sync code, THEN process microtask queue. Follow-up question likely: "What if we add setTimeout?"—that runs after microtasks.

---

## Card 6: NaN Comparison
**Q:** What does this output?
```js
console.log(NaN === NaN);
console.log(Object.is(NaN, NaN));
```

**A:** `false true` - NaN is only value not equal to itself. Object.is handles special cases.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #nan #output
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Quirk of IEEE 754 standard: NaN is NEVER equal to itself, not even with ===. Use Number.isNaN() or Object.is() to check NaN. Remember: isNaN() coerces, Number.isNaN() doesn't. Interview setup: "NaN comparison is special case. === doesn't work because NaN by spec isn't equal to itself. Object.is() and Number.isNaN() are proper methods."

---

## Card 7: Array Constructor
**Q:** What does this output?
```js
console.log(Array(3));
console.log(Array(3,4));
```

**A:** `[empty × 3]` (sparse array), `[3, 4]` - single number creates length, multiple are elements.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #arrays #output
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Array constructor ambiguity: single numeric arg sets length (creates sparse array with empty slots), multiple args become elements. Sparse arrays have gotchas—map/forEach skip empty slots! Follow-up: "Why is Array(3) different from [undefined, undefined, undefined]?" Answer: sparse array, actual length but no real elements. Compare Array(3).map(x => 1) vs Array.from({length:3}).map(x => 1).

---

## Card 8: Function Parameters
**Q:** What does this output?
```js
function test(a, b = a) {
  console.log(b);
}
test(5);
test();
```

**A:** `5 undefined` - default params evaluated at call time, a is undefined in second call.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #parameters #output
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Default parameters evaluated LEFT-TO-RIGHT at call time, not definition time. When test() called with no args, a is undefined, so b defaults to undefined. Key: default params have access to previous params. Example: b=a+1 would fail if a undefined. Interviewer may ask: "What if default param is a function call?"—answer: only called when param omitted.

---

## Card 9: Object Keys
**Q:** What does this output?
```js
const obj = {1: 'a', '1': 'b'};
console.log(obj);
```

**A:** `{1: 'b'}` - numeric keys converted to strings, duplicate keys overwrite.

**Difficulty:** 🟢 Easy
**Tags:** #javascript #objects #output
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Object keys are ALWAYS strings (or Symbols). Numeric 1 automatically converted to string '1'. Since both keys are identical after conversion, second value overwrites first. Related gotcha: accessing with obj[1] and obj['1'] returns same value. Test knowledge: "What about Symbol keys?"—they're not converted. "What about computed keys?"—same rule applies.

---

## Card 10: Spread Operator
**Q:** What does this output?
```js
const arr = [1, 2];
const newArr = [0, ...arr, 3];
console.log(newArr);
```

**A:** `[0, 1, 2, 3]` - spread expands array elements into new array.

**Difficulty:** 🟢 Easy
**Tags:** #javascript #spread #output
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Spread operator (...) unpacks iterable into individual elements. Works in arrays, function args, and objects (rest/spread distinction). Creates shallow copy—nested objects still reference same origin. Common trap: {...arr} in objects gives wrong output because arrays become {0: 1, 1: 2}. Follow-up: "What's difference between rest and spread?"—rest captures multiple into array, spread unpacks.

---

[Continuing with 40 more code output questions covering: async/await, destructuring, classes, symbols, proxies, generators, WeakMap, BigInt, optional chaining, nullish coalescing, etc.]

---

[← Back to Flashcards](../README.md)
