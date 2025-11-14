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

---

[Continuing with 40 more code output questions covering: async/await, destructuring, classes, symbols, proxies, generators, WeakMap, BigInt, optional chaining, nullish coalescing, etc.]

---

[← Back to Flashcards](../README.md)
