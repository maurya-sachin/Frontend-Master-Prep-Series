# JavaScript Primitive Types & Type System

> **Focus**: Deep understanding of JavaScript's type system, V8 internals, and production debugging

---

## Question 1: What is Symbol in JavaScript and when would you use it?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Netflix

### Question

Explain the Symbol primitive type. What problems does it solve? When would you use it in production code?

### Answer

**Symbol** is a unique, immutable primitive type introduced in ES6 (ES2015). Every Symbol is guaranteed to be unique, making it perfect for:
- Creating private object properties
- Avoiding property name collisions
- Defining object metadata
- Implementing well-known protocols (iterators, etc.)

**Key Characteristics:**
1. Every Symbol() call creates a unique value
2. Symbols are immutable
3. Can be used as object property keys
4. Not enumerable in for...in loops
5. Not serialized by JSON.stringify()
6. Hidden from Object.keys() but accessible via Object.getOwnPropertySymbols()

### Code Example

```javascript
// ============================================
// 1. CREATING SYMBOLS - UNIQUENESS
// ============================================

const sym1 = Symbol();
const sym2 = Symbol();

console.log(sym1 === sym2); // false (ALWAYS unique!)

// Description is just for debugging
const sym3 = Symbol("userId");
const sym4 = Symbol("userId");
console.log(sym3 === sym4); // false (still unique!)

console.log(sym3.toString());      // "Symbol(userId)"
console.log(sym3.description);     // "userId"

// ============================================
// 2. SYMBOLS AS OBJECT KEYS - PRIVATE PROPERTIES
// ============================================

const PASSWORD = Symbol("password");
const user = {
  username: "alice",
  email: "alice@example.com",
  [PASSWORD]: "secret123"  // Symbol property
};

// Regular property access
console.log(user.username);  // "alice"

// Symbol property access
console.log(user[PASSWORD]); // "secret123"

// Can't access without the symbol
console.log(user.password);  // undefined
console.log(user["password"]); // undefined

// Symbol properties are hidden from enumeration
console.log(Object.keys(user));        // ["username", "email"]
console.log(JSON.stringify(user));     // {"username":"alice","email":"alice@example.com"}

// But can be accessed if you have the symbol reference
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(password)]

// ============================================
// 3. AVOIDING NAME COLLISIONS
// ============================================

// Library A adds a method
const libraryA = {
  getData: Symbol("getData")
};

const obj = {
  name: "My Object",
  [libraryA.getData]() {
    return "Data from Library A";
  }
};

// Library B can add its own method without conflict
const libraryB = {
  getData: Symbol("getData")
};

obj[libraryB.getData] = function() {
  return "Data from Library B";
};

// No collision! Both methods coexist
console.log(obj[libraryA.getData]()); // "Data from Library A"
console.log(obj[libraryB.getData]()); // "Data from Library B"

// ============================================
// 4. GLOBAL SYMBOL REGISTRY
// ============================================

// Symbol.for() creates/retrieves global symbols
const globalSym1 = Symbol.for("app.userId");
const globalSym2 = Symbol.for("app.userId");

console.log(globalSym1 === globalSym2); // true (same symbol!)

// Get key from symbol
console.log(Symbol.keyFor(globalSym1)); // "app.userId"

// Regular symbols not in registry
const localSym = Symbol("local");
console.log(Symbol.keyFor(localSym)); // undefined

// ============================================
// 5. WELL-KNOWN SYMBOLS - ITERATOR
// ============================================

// Make object iterable with Symbol.iterator
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    return {
      current: this.from,
      last: this.to,

      next() {
        if (this.current <= this.last) {
          return { done: false, value: this.current++ };
        } else {
          return { done: true };
        }
      }
    };
  }
};

// Now works with for...of
for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

// And spread operator
console.log([...range]); // [1, 2, 3, 4, 5]

// ============================================
// 6. WELL-KNOWN SYMBOLS - TO PRIMITIVE
// ============================================

const money = {
  amount: 100,
  currency: "USD",

  // Custom type conversion
  [Symbol.toPrimitive](hint) {
    if (hint === "number") {
      return this.amount;
    }
    if (hint === "string") {
      return `${this.amount} ${this.currency}`;
    }
    return this.amount; // default
  }
};

console.log(+money);        // 100 (number context)
console.log(`${money}`);    // "100 USD" (string context)
console.log(money + 50);    // 150 (default context)

// ============================================
// 7. REAL-WORLD USE CASE: PRIVATE CLASS FIELDS
// ============================================

// Before private fields (#), Symbols were used
const _balance = Symbol("balance");
const _validateAmount = Symbol("validateAmount");

class BankAccount {
  constructor(initialBalance) {
    this[_balance] = initialBalance;
  }

  [_validateAmount](amount) {
    return amount > 0 && Number.isFinite(amount);
  }

  deposit(amount) {
    if (this[_validateAmount](amount)) {
      this[_balance] += amount;
      return true;
    }
    return false;
  }

  getBalance() {
    return this[_balance];
  }
}

const account = new BankAccount(1000);
account.deposit(500);

console.log(account.getBalance());  // 1500

// Can't access private fields directly
console.log(account._balance);      // undefined
console.log(account.balance);       // undefined

// Even Object.keys won't show them
console.log(Object.keys(account));  // []

// ============================================
// 8. WELL-KNOWN SYMBOLS - ALL OF THEM
// ============================================

console.log(Symbol.iterator);       // Define iteration behavior
console.log(Symbol.toStringTag);    // Customize Object.prototype.toString()
console.log(Symbol.toPrimitive);    // Custom type conversion
console.log(Symbol.hasInstance);    // Customize instanceof behavior
console.log(Symbol.isConcatSpreadable); // Control Array.prototype.concat()
console.log(Symbol.species);        // Control constructor for derived objects
console.log(Symbol.match);          // String.prototype.match() behavior
console.log(Symbol.replace);        // String.prototype.replace() behavior
console.log(Symbol.search);         // String.prototype.search() behavior
console.log(Symbol.split);          // String.prototype.split() behavior
console.log(Symbol.unscopables);    // Exclude properties from with statement

// ============================================
// 9. CUSTOM TO STRING TAG
// ============================================

class ValidatedData {
  constructor(data) {
    this.data = data;
  }

  get [Symbol.toStringTag]() {
    return 'ValidatedData';
  }
}

const vd = new ValidatedData({ name: "Alice" });
console.log(Object.prototype.toString.call(vd)); // "[object ValidatedData]"
console.log(vd.toString()); // "[object ValidatedData]"

// ============================================
// 10. SYMBOLS IN REFLECTION
// ============================================

const obj = {
  regular: "prop",
  [Symbol("sym1")]: "value1",
  [Symbol("sym2")]: "value2"
};

// Regular reflection
console.log(Object.keys(obj));                    // ["regular"]
console.log(Object.getOwnPropertyNames(obj));     // ["regular"]

// Symbol reflection
console.log(Object.getOwnPropertySymbols(obj));   // [Symbol(sym1), Symbol(sym2)]

// All properties (including symbols)
console.log(Reflect.ownKeys(obj));                // ["regular", Symbol(sym1), Symbol(sym2)]
```

<details>
<summary><strong>🔍 Deep Dive: How V8 Implements Symbols</strong></summary>

### Symbol Implementation in V8

**Memory Structure:**
```cpp
// Simplified V8 internal structure
class Symbol : public Name {
  private:
    int32_t hash_field_;  // Cached hash
    Object description_;  // Optional description string
    int32_t flags_;       // Private, well-known, etc.
};
```

**Uniqueness Guarantee:**
- Each Symbol gets unique memory address
- Equality check is pointer comparison (O(1))
- No hash collisions possible

**Global Symbol Registry:**
```
Global Registry (Hash Table):
┌────────────────┬──────────────┐
│ "app.userId"   │ → Symbol@0x1 │
│ "app.sessionId"│ → Symbol@0x2 │
└────────────────┴──────────────┘
```

**Property Storage:**
- Symbol properties stored in separate "symbol table"
- Not included in fast property access paths
- Allows for true privacy (until Reflect/getOwnPropertySymbols)

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Library Conflicts</strong></summary>

### Production Problem: Third-Party Library Collision

**Scenario:** Two analytics libraries both add `track` method to objects.

```javascript
// ❌ PROBLEM: Name collision
const user = { name: "Alice" };

// Library A
user.track = function(event) {
  console.log("Library A tracking:", event);
};

// Library B overwrites it!
user.track = function(event) {
  console.log("Library B tracking:", event);
};

user.track("click"); // Only Library B works!
```

**Fix: Use Symbols for namespacing**
```javascript
// ✅ SOLUTION: Each library uses its own symbol
// Library A
const TRACK_A = Symbol("track");
user[TRACK_A] = function(event) {
  console.log("Library A tracking:", event);
};

// Library B
const TRACK_B = Symbol("track");
user[TRACK_B] = function(event) {
  console.log("Library B tracking:", event);
};

// Both methods coexist!
user[TRACK_A]("click"); // Library A
user[TRACK_B]("click"); // Library B
```

**Real Example: React Internal Properties**
```javascript
// React uses Symbols for internal properties
const element = <div>Hello</div>;

console.log(Object.getOwnPropertySymbols(element));
// Includes Symbol(react.element) and others
// Prevents user code from accidentally overwriting
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Symbols vs Other Privacy Methods</strong></summary>

### Comparison Matrix

**Symbols:**
- ✅ True uniqueness guarantee
- ✅ No string-based access
- ✅ Hidden from JSON serialization
- ❌ Discoverable via `Object.getOwnPropertySymbols()`
- ❌ Must pass symbol reference around
- ❌ Not truly private

**Private Fields (#):**
- ✅ Truly private (not accessible outside class)
- ✅ Clean syntax
- ❌ Only works in classes
- ❌ Can't be added dynamically
- ❌ Browser support (newer)

**Closures:**
- ✅ Truly private
- ✅ Works everywhere
- ❌ Memory overhead
- ❌ Can't add to existing objects
- ❌ No reflection possible

**WeakMap:**
- ✅ Truly private
- ✅ Garbage collection friendly
- ❌ Extra object needed
- ❌ More complex syntax
- ❌ Can't serialize

**When to Use Symbols:**
- Need unique property keys
- Avoid naming collisions (libraries)
- Implement well-known protocols
- Want discoverable "private" properties
- Working with plain objects (not classes)

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

"Think of Symbols as **special VIP badges** that are impossible to duplicate.

Imagine a nightclub where multiple companies are hosting events. Each company gives their guests a unique badge:

```javascript
const companyA_Badge = Symbol("VIP");
const companyB_Badge = Symbol("VIP");

// Even though both say "VIP", they're completely different badges!
console.log(companyA_Badge === companyB_Badge); // false
```

Now guests (objects) can have multiple \"VIP\" properties without confusion:

```javascript
const guest = {
  name: "Alice",
  [companyA_Badge]: "Gold Access",
  [companyB_Badge]: "Platinum Access"
};

// Each company's badge works independently
console.log(guest[companyA_Badge]); // "Gold Access"
console.log(guest[companyB_Badge]); // "Platinum Access"
```

**Why is this useful?**

If you write a library and add a method to user objects, you don't want to accidentally overwrite their existing methods:

```javascript
// Your library
const MY_LIBRARY_METHOD = Symbol("getData");
userObject[MY_LIBRARY_METHOD] = function() { };

// No collision with user's own 'getData' method!
```

**Key insight:** Symbols guarantee uniqueness without checking if a name is already taken."

</details>

### Common Mistakes

❌ **Mistake 1:** Trying to use new Symbol()
```javascript
const sym = new Symbol(); // ❌ TypeError: Symbol is not a constructor
```

✅ **Correct:** Call Symbol() directly
```javascript
const sym = Symbol();
```

❌ **Mistake 2:** Expecting Symbol properties in JSON
```javascript
const obj = {
  [Symbol("id")]: 123
};
console.log(JSON.stringify(obj)); // "{}" (symbol property ignored!)
```

❌ **Mistake 3:** Using Symbol.for() for privacy
```javascript
const SECRET = Symbol.for("secret"); // ❌ Global! Anyone can access
obj[SECRET] = "password";

// Anyone can do:
console.log(obj[Symbol.for("secret")]); // "password"
```

✅ **Better:** Use local Symbol for privacy
```javascript
const SECRET = Symbol("secret"); // Only accessible in this scope
```

### Follow-up Questions

1. "How are Symbols different from strings as object keys?"
2. "What are well-known Symbols? Name 3 and their use cases."
3. "How would you implement true privacy without Symbols?"
4. "Can Symbols be garbage collected?"
5. "What is Symbol.for() and when would you use it?"
6. "How do Symbols help with metaprogramming?"

### Resources

- [MDN: Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [JavaScript.info: Symbol Type](https://javascript.info/symbol)
- [Exploring ES6: Symbols](https://exploringjs.com/es6/ch_symbols.html)

