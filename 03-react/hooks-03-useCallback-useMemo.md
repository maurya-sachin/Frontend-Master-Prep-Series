# React Advanced Hooks

> useCallback, useMemo, useRef, useImperativeHandle, useLayoutEffect, useId, and performance optimization hooks.

---

## Question 1: useCallback vs useMemo

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Amazon, Airbnb

### Question
Explain the difference between useCallback and useMemo. When should you use each?

### Answer

**useCallback** - Memoizes functions
**useMemo** - Memoizes values

```jsx
// useCallback - Memoize function reference
const handleClick = useCallback(() => {
  console.log('Clicked', count);
}, [count]); // New function only when count changes

// useMemo - Memoize computed value
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]); // Recompute only when a or b changes

// When to use:
// useCallback: Passing callbacks to optimized child components
// useMemo: Expensive calculations, avoiding re-renders
```

**Practical Example:**

```jsx
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // ❌ Without useCallback - new function every render
  const handleClick = () => {
    console.log('Clicked');
  };

  // ✅ With useCallback - same function reference
  const memoizedHandleClick = useCallback(() => {
    console.log('Clicked');
  }, []); // No dependencies - same function always

  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <MemoizedChild onClick={memoizedHandleClick} />
    </>
  );
}

const MemoizedChild = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});
// Without useCallback: Child re-renders on every Parent render
// With useCallback: Child only renders when callback actually changes
```

### 🔍 Deep Dive: Memoization Internals in React

React's memoization hooks (`useCallback` and `useMemo`) are fundamental performance optimization primitives that leverage referential equality checking to prevent unnecessary work. Understanding their internal implementation reveals critical insights about React's reconciliation algorithm and the JavaScript object identity model.

**How React Implements Memoization:**

React stores memoized values in the component's fiber node data structure within a linked list called the "hook queue". Each hook call creates a hook object containing:
1. **memoizedState**: The cached value (function reference for useCallback, computed value for useMemo)
2. **baseState**: The initial value when the hook was first called
3. **queue**: Update queue for pending changes
4. **next**: Pointer to the next hook in the linked list

When `useCallback` or `useMemo` executes during a re-render, React performs a shallow comparison of the dependency array using `Object.is()` equality:

```javascript
// Simplified React internal logic
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) return false;

  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
```

If dependencies haven't changed (`Object.is()` returns true for all), React returns the memoized value from `hook.memoizedState`. If any dependency changed, React executes the callback (for `useMemo`) or creates a new function reference (for `useCallback`), stores the new value, and updates the dependency array.

**Memory Implications:**

Each memoized hook maintains two pieces of memory:
- The memoized value itself (function or computed result)
- The dependency array (array of primitives or object references)

For `useCallback`, this typically consumes 100-200 bytes per instance (function reference + deps array). For `useMemo`, memory usage depends on the computed value's size - a simple number costs 50 bytes, but a large array or object could consume kilobytes.

**Performance Characteristics:**

- **Dependency check cost**: O(n) where n = number of dependencies. Typically 1-10 microseconds for arrays with 1-5 dependencies.
- **Memoization hit rate**: Only valuable when hit rate > 70%. Below this threshold, the dependency checking overhead exceeds the benefit.
- **Re-render prevention**: When combined with `React.memo`, prevents child component reconciliation entirely, saving 5-50ms per avoided re-render depending on component complexity.

**Critical Edge Case - Empty Dependency Array:**

```javascript
const memoizedCallback = useCallback(() => {
  console.log('Never changes');
}, []); // Empty dependencies - function reference never changes
```

With an empty dependency array, React creates the function once and returns the same reference forever (for that component instance). This is equivalent to storing the function in a `useRef`, but useCallback's semantic intent is clearer for callbacks.

**The Object.is() Gotcha:**

```javascript
const config = { filter: 'active' };

const memoizedValue = useMemo(() => {
  return expensiveComputation(config);
}, [config]); // ❌ config is a new object every render!

// Fix: Destructure primitive values
const { filter } = config;
const memoizedValue = useMemo(() => {
  return expensiveComputation({ filter });
}, [filter]); // ✅ Primitive comparison works
```

Since objects are compared by reference identity, passing object literals or new object instances as dependencies causes memoization to fail every render. This is one of the most common memoization bugs.

**When React Ignores Memoization:**

During concurrent rendering features (Suspense, useTransition), React may intentionally discard memoized values and recalculate them to maintain consistency. The memoization is a performance hint, not a guarantee - React reserves the right to recalculate on every render if needed for correctness.

### 🐛 Real-World Scenario: Fixing Performance Degradation in Dashboard

**Context:** E-commerce admin dashboard with 500+ product listings experiencing severe performance issues during typing in search input.

**Production Metrics (Before Fix):**
- Input lag: 800-1200ms per keystroke
- Frame rate: 8-12 FPS during typing (target: 60 FPS)
- Lighthouse Performance score: 32/100
- Time to Interactive (TTI): 8.2 seconds
- Total Blocking Time (TBT): 2,850ms
- Main thread blocking: 95% during search interactions

**Symptoms:**
Users reported the dashboard felt "frozen" when typing in the search box. Chrome DevTools Performance profiler showed massive React reconciliation work on every keystroke - 500+ components re-rendering despite only the search input text changing.

**Root Cause Investigation:**

```javascript
// BEFORE: Performance killer
function ProductDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);

  // ❌ Problem 1: Creates new function on every render
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // ❌ Problem 2: Filters entire array on every render (even when typing)
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ❌ Problem 3: Creates new configuration object every render
  const tableConfig = {
    onRowClick: handleProductClick,
    sortable: true,
    pagination: { pageSize: 50 }
  };

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {/* Re-renders all 500 rows on every keystroke */}
      <ProductTable products={filteredProducts} config={tableConfig} />
    </div>
  );
}

const ProductTable = React.memo(({ products, config }) => {
  return products.map(p => (
    <ProductRow key={p.id} product={p} onClick={config.onRowClick} />
  ));
});

const ProductRow = React.memo(({ product, onClick }) => {
  return <tr onClick={() => onClick(product.id)}>{product.name}</tr>;
});
```

**Debugging Process:**

1. **React DevTools Profiler**: Showed ProductTable re-rendering on every keystroke despite React.memo
2. **Props comparison**: Logged props in ProductTable - `config` object reference changed every render
3. **Function identity check**: `handleProductClick` was a new function every render
4. **Performance bottleneck**: 500 ProductRow components reconciling even though data unchanged

**The Fix - Strategic Memoization:**

```javascript
// AFTER: Optimized with useCallback and useMemo
function ProductDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);

  // ✅ Fix 1: Stable function reference with useCallback
  const handleProductClick = useCallback((productId) => {
    navigate(`/products/${productId}`);
  }, []); // No dependencies - navigate is stable

  // ✅ Fix 2: Only recompute filtered products when inputs change
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...'); // Only logs when needed
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]); // Recompute only when these change

  // ✅ Fix 3: Stable config object reference
  const tableConfig = useMemo(() => ({
    onRowClick: handleProductClick,
    sortable: true,
    pagination: { pageSize: 50 }
  }), [handleProductClick]); // Only changes if handleProductClick changes (never)

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {/* Now only re-renders when filteredProducts actually changes */}
      <ProductTable products={filteredProducts} config={tableConfig} />
    </div>
  );
}
```

**Production Metrics (After Fix):**
- Input lag: 16-32ms per keystroke (50x improvement)
- Frame rate: 58-60 FPS during typing (target achieved)
- Lighthouse Performance score: 89/100
- Time to Interactive (TTI): 2.1 seconds (75% improvement)
- Total Blocking Time (TBT): 180ms (94% reduction)
- Main thread blocking: 12% during search interactions
- Bundle size impact: +0.3KB (negligible)

**Key Learnings:**

1. **React.memo is useless without stable props**: Memoizing child components requires memoizing their props
2. **Measure before optimizing**: Use React DevTools Profiler to identify actual bottlenecks
3. **Dependency arrays are critical**: Missing dependencies cause stale closures; excess dependencies negate memoization
4. **Filtering should be memoized**: Array operations on large datasets (500+ items) should always use useMemo
5. **Object props kill memoization**: Any object/array/function prop must be memoized or child will re-render

<details>
<summary><strong>⚖️ Trade-offs: When Memoization Hurts Performance</strong></summary>

**The Memoization Paradox:**

Memoization isn't free - it adds memory overhead and comparison costs. Blindly wrapping everything in `useCallback`/`useMemo` often degrades performance rather than improving it. The key is understanding when the benefits outweigh the costs.

**Cost-Benefit Analysis:**

| Scenario | useCallback/useMemo Benefit | Cost | Verdict |
|----------|---------------------------|------|---------|
| Primitive state (strings, numbers) | 0ms saved | 1-2μs comparison | ❌ Don't memoize |
| Small arrays (< 10 items) | 0.01-0.1ms saved | 1-2μs comparison | ❌ Don't memoize |
| Medium arrays (10-100 items) | 0.5-2ms saved | 2-5μs comparison | ⚖️ Context-dependent |
| Large arrays (100-1000 items) | 5-50ms saved | 5-10μs comparison | ✅ Memoize |
| Expensive computations (> 10ms) | 10-500ms saved | 1-5μs comparison | ✅ Memoize |
| Callbacks to memoized children | Entire child re-render saved (5-100ms) | 1-2μs comparison | ✅ Memoize |

**Trade-off 1: Memory vs Speed**

```javascript
// Scenario: Rendering 1000 dashboard cards
function Dashboard({ cards }) {
  // Option A: No memoization (re-filter every render)
  const activeCards = cards.filter(c => c.active);
  // Memory: 0 bytes extra
  // CPU: 2-5ms per render
  // Total cost: 2-5ms × renders/second

  // Option B: Memoization (cache filtered result)
  const activeCards = useMemo(
    () => cards.filter(c => c.active),
    [cards]
  );
  // Memory: ~8KB for cached array + 24 bytes for dependency array
  // CPU: 2μs comparison cost if cards unchanged, 2-5ms if changed
  // Total cost: 8KB RAM + (2μs × renders/second) + occasional 2-5ms
}
```

**When to choose Option A (no memoization):**
- Component re-renders infrequently (< 1 per second)
- Cards array is small (< 50 items)
- Memory constrained environment (mobile devices with < 2GB RAM)
- Filter operation is trivial (< 1ms)

**When to choose Option B (memoization):**
- Component re-renders frequently (> 5 per second)
- Cards array is large (> 100 items)
- Filter operation is expensive (> 5ms)
- Memory is abundant (desktop, modern mobile)

**Trade-off 2: Readability vs Performance**

```javascript
// Complex dependency management reduces code clarity
function ComplexComponent({ userId, filters, sorting, pagination }) {
  // Readable but not optimized
  const data = fetchAndProcess(userId, filters, sorting, pagination);

  // Optimized but harder to understand
  const processedData = useMemo(() => {
    return fetchAndProcess(userId, filters, sorting, pagination);
  }, [userId, filters, sorting, pagination]);

  // Even more complex - nested memoization
  const normalizedFilters = useMemo(
    () => normalizeFilters(filters),
    [filters]
  );

  const normalizedSorting = useMemo(
    () => normalizeSorting(sorting),
    [sorting]
  );

  const processedData = useMemo(() => {
    return fetchAndProcess(userId, normalizedFilters, normalizedSorting, pagination);
  }, [userId, normalizedFilters, normalizedSorting, pagination]);
}
```

**Rule of Thumb:** Only add memoization if:
1. Profiling shows a measurable performance issue (> 16ms blocking)
2. The component re-renders frequently (> 3 times per user interaction)
3. The computation is demonstrably expensive (> 5ms)

**Trade-off 3: Premature Optimization Risk**

The React team's official guidance: *"You should only rely on useCallback/useMemo as a performance optimization. If your code doesn't work without it, find the underlying problem and fix it first."*

**Common Anti-Pattern:**

```javascript
// ❌ Premature optimization - no measurable benefit
function SimpleButton({ label }) {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // Adds complexity with zero benefit

  return <button onClick={handleClick}>{label}</button>;
}

// ✅ Simple and clear - optimization unnecessary
function SimpleButton({ label }) {
  const handleClick = () => {
    console.log('clicked');
  };

  return <button onClick={handleClick}>{label}</button>;
}
```

**When Optimization Backfires:**

A real example from a production codebase: A team wrapped every function in useCallback and every calculation in useMemo "just in case". Result:
- Bundle size increased by 8KB (wrapper code)
- Initial render time increased by 15ms (hook initialization overhead)
- Code review time doubled (complex dependency tracking)
- Bug count increased 3x (stale closure bugs from incorrect dependencies)
- **No measurable performance improvement** - the app already rendered in < 16ms

**Decision Framework:**

```javascript
// Use this mental model:
const shouldMemoize = (
  (computationCost > 5ms) ||
  (renderFrequency > 3/sec && computationCost > 1ms) ||
  (isCallbackPassedToMemoizedChild)
) && !isStaleClosureBug;
```

**The Goldilocks Zone:**

- **Too little memoization**: Performance issues, janky UI
- **Too much memoization**: Code complexity, memory bloat, maintenance burden
- **Just right**: Memoize expensive computations and callbacks to memoized children

### 💬 Explain to Junior: useCallback vs useMemo

**The Coffee Shop Analogy:**

Imagine you're a barista at a busy coffee shop. `useMemo` and `useCallback` are like two different strategies for dealing with repeat customers:

**useMemo = Remembering the drink**

Think of useMemo like a barista who remembers what drink a regular customer ordered last time:

```javascript
// Customer Alice orders a complex drink
const alicesDrink = useMemo(() => {
  // This takes 5 minutes to make (expensive!)
  return makeComplexLatte({
    espresso: 'double',
    milk: 'oat',
    temperature: '140°F',
    foam: 'extra',
    flavor: ['vanilla', 'caramel']
  });
}, [alice.preferences]); // Only remake if preferences change
```

When Alice comes back the next day with the same preferences, you don't remake the entire drink - you just serve the one you already prepared (or the recipe you remember). You only make a new drink if her preferences change.

**useCallback = Remembering the recipe**

Think of useCallback like keeping the instruction card for how to make a drink:

```javascript
// The recipe for Alice's drink
const makeAlicesDrink = useCallback(() => {
  return mixIngredients('double espresso', 'oat milk', 'vanilla');
}, []); // The recipe card never changes

// Now you can give this recipe to any barista
<NewBarista makeCustomDrink={makeAlicesDrink} />
```

The recipe itself doesn't change, but you can hand it to different baristas. Without useCallback, you'd write a new recipe card every time, even though the instructions are identical.

**When You're Wasting Time (Don't Memoize):**

```javascript
// ❌ This is like "remembering" that 1 + 1 = 2
const two = useMemo(() => 1 + 1, []); // Silly!

// ✅ Just calculate it - it's instant
const two = 1 + 1;

// ❌ This is like keeping a recipe for "pour water in cup"
const pourWater = useCallback(() => {
  cup.fill('water');
}, []); // Unnecessary!

// ✅ Just write the simple instruction
const pourWater = () => cup.fill('water');
```

**When You Should Definitely Memoize:**

```javascript
// ✅ Complex drink that takes 5 minutes to make
const complexDrink = useMemo(() => {
  return grindBeans() +
         brewEspresso() +
         steamMilk() +
         createLatteart() +
         addFlavors();
}, [ingredients]); // Only remake when ingredients change

// ✅ Recipe card you're giving to another barista
const makeDrinkRecipe = useCallback(() => {
  return processOrder(customer);
}, [customer]);

// This other barista won't remake drinks unnecessarily
<EfficientBarista recipe={makeDrinkRecipe} />
```

**The "Why" Behind Both Hooks:**

JavaScript has a quirk: every time you create an object, array, or function, it's treated as "brand new" even if the contents are identical:

```javascript
// These look the same but JavaScript sees them as different
const recipe1 = { steps: ['grind', 'brew', 'pour'] };
const recipe2 = { steps: ['grind', 'brew', 'pour'] };

console.log(recipe1 === recipe2); // false - different "recipe cards"
```

React uses this equality check to decide if something changed. Without memoization:

```javascript
function CoffeeShop() {
  // Every render creates a NEW recipe (new object in memory)
  const recipe = { steps: ['grind', 'brew', 'pour'] };

  // EfficientBarista thinks this is a different recipe every time!
  // So it remakes the drink even though the recipe is identical
  return <EfficientBarista recipe={recipe} />;
}
```

With memoization:

```javascript
function CoffeeShop() {
  // Create the recipe once, reuse the same "recipe card"
  const recipe = useMemo(
    () => ({ steps: ['grind', 'brew', 'pour'] }),
    [] // Never changes
  );

  // EfficientBarista sees it's the same recipe card
  // Doesn't remake the drink unnecessarily
  return <EfficientBarista recipe={recipe} />;
}
```

**Interview Answer Template:**

*"useCallback and useMemo are both memoization hooks in React, but they serve different purposes:*

*useCallback returns a memoized function - it gives you back the same function reference unless dependencies change. This is useful when passing callbacks to child components that are wrapped in React.memo, because it prevents unnecessary re-renders.*

*useMemo returns a memoized value - it caches the result of an expensive computation and only recalculates when dependencies change. This is useful for expensive calculations like filtering large arrays or complex transformations.*

*The key difference: useCallback memoizes the function itself, useMemo memoizes what the function returns.*

*For example, if you have a search feature filtering 10,000 products, you'd use useMemo to cache the filtered results. If you're passing a callback to a memoized child component, you'd use useCallback to keep the function reference stable.*

*Both hooks should be used judiciously - only when you've identified an actual performance problem through profiling. Overuse adds complexity and memory overhead without meaningful benefits."*

**Common Mistake - Forgetting Dependencies:**

```javascript
function SearchComponent({ initialQuery }) {
  const [query, setQuery] = useState(initialQuery);

  // ❌ Wrong: Missing 'query' dependency
  const searchResults = useMemo(() => {
    return expensiveSearch(query);
  }, []); // This creates a stale closure!

  // searchResults will ALWAYS use initialQuery value, never update!
}
```

**Fix:**

```javascript
// ✅ Correct: Include all dependencies
const searchResults = useMemo(() => {
  return expensiveSearch(query);
}, [query]); // Now it recalculates when query changes
```

**Mental Model for Dependencies:**

"Every variable or prop used inside useMemo/useCallback must be in the dependency array, unless you want to deliberately use a stale value (which is rare and usually a bug)."

### Resources
- [React Hooks API Reference](https://react.dev/reference/react/hooks)

---

## Questions 2-15: Advanced React Hooks Deep Dive

**Difficulty:** 🟡 Medium to 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Consolidated advanced hooks patterns**

### Q2: useLayoutEffect - Synchronous DOM Updates

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes

#### Question
When should you use useLayoutEffect instead of useEffect? What are the performance implications?

#### Answer

```javascript
// Q2: useLayoutEffect - Synchronous DOM updates before paint
import { useLayoutEffect, useEffect, useRef, useState } from 'react';

function TooltipWithLayoutEffect() {
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const ref = useRef(null);

  // useLayoutEffect runs synchronously BEFORE browser paints
  useLayoutEffect(() => {
    const { height } = ref.current.getBoundingClientRect();
    setTooltipHeight(height);
  }, []);

  // useEffect runs AFTER browser paints (asynchronous)
  useEffect(() => {
    console.log('Runs after paint');
  }, []);

  return <div ref={ref}>Tooltip (height: {tooltipHeight})</div>;
}

// When to use useLayoutEffect:
// 1. Measuring DOM elements before paint
// 2. Preventing visual flickering
// 3. Synchronizing with third-party DOM libraries
```

#### 🔍 Deep Dive: useLayoutEffect vs useEffect in the Browser Rendering Pipeline

The critical distinction between `useLayoutEffect` and `useEffect` lies in their position within the browser's rendering pipeline. Understanding this requires knowledge of how browsers transform React components into pixels on screen.

**Browser Rendering Pipeline:**

1. **JavaScript Execution** - React calculates what changed (reconciliation)
2. **DOM Mutation** - React updates the actual DOM
3. **Layout** - Browser calculates positions and sizes of all elements (reflow)
4. **Paint** - Browser draws pixels to layers
5. **Composite** - Browser combines layers and displays on screen

**Where hooks execute:**

```
useEffect Timeline:
DOM Update → Layout → Paint → Composite → useEffect → (potential re-render)

useLayoutEffect Timeline:
DOM Update → useLayoutEffect → Layout → Paint → Composite
```

**Why this matters:**

When you use `useEffect` to measure DOM elements and update state based on those measurements, the browser has already painted once. This causes:
1. Initial render with wrong position/size
2. Visual flash (user sees wrong state briefly)
3. Second render with correct values
4. Another paint cycle

With `useLayoutEffect`, measurements happen before paint, preventing the visual glitch entirely.

**Internal Implementation (Simplified React Source):**

React uses different scheduling mechanisms:

```javascript
// useEffect - Scheduled in passive effects queue
function mountEffect(create, deps) {
  return mountEffectImpl(
    PassiveEffect | PassiveStaticEffect,
    HookPassive,
    create,
    deps
  );
  // Executed asynchronously after paint
}

// useLayoutEffect - Scheduled in layout effects queue
function mountLayoutEffect(create, deps) {
  return mountEffectImpl(
    UpdateEffect,
    HookLayout,
    create,
    deps
  );
  // Executed synchronously before paint
}
```

React processes layout effects in the commit phase, immediately after DOM mutations but before the browser paints. This is a synchronous operation that blocks the painting.

**Performance Cost Analysis:**

`useLayoutEffect` is approximately 2-8ms slower per render compared to `useEffect` because:

1. **Synchronous blocking**: Delays the paint until effect completes
2. **Extended frame time**: If your effect takes 10ms, the frame budget (16ms for 60 FPS) is consumed by JavaScript instead of rendering
3. **Cascading layouts**: DOM reads trigger additional layout calculations if there were pending DOM writes

**Example Performance Impact:**

```javascript
// Component with useEffect (non-blocking)
function Tooltip() {
  const [height, setHeight] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const measured = ref.current.getBoundingClientRect().height;
    setHeight(measured); // Triggers re-render AFTER paint
  }, []);

  // Frame timeline:
  // 0ms: React renders
  // 2ms: DOM updated
  // 4ms: Layout calculated
  // 6ms: Paint
  // 8ms: Composite (user sees UI)
  // 10ms: useEffect runs
  // 12ms: setState triggers re-render
  // 16ms: Second paint (user sees corrected UI)
  // Total user-perceived delay: 16ms for correct UI
}

// Component with useLayoutEffect (blocking but correct)
function TooltipOptimized() {
  const [height, setHeight] = useState(0);
  const ref = useRef();

  useLayoutEffect(() => {
    const measured = ref.current.getBoundingClientRect().height;
    setHeight(measured); // Triggers re-render BEFORE paint
  }, []);

  // Frame timeline:
  // 0ms: React renders
  // 2ms: DOM updated
  // 4ms: useLayoutEffect runs
  // 6ms: setState (sync re-render)
  // 8ms: Layout calculated
  // 10ms: Paint
  // 12ms: Composite (user sees correct UI immediately)
  // Total user-perceived delay: 12ms for correct UI, no flicker
}
```

**The Double-Render Problem:**

When `useLayoutEffect` sets state, React must perform a synchronous re-render before the browser paints. This is intentional but expensive:

```javascript
// ❌ Causes synchronous double-render
useLayoutEffect(() => {
  setWidth(ref.current.offsetWidth);
  setHeight(ref.current.offsetHeight);
  setPosition(calculatePosition()); // Three state updates!
}, []);

// ✅ Batch updates to minimize re-renders
useLayoutEffect(() => {
  setBounds({
    width: ref.current.offsetWidth,
    height: ref.current.offsetHeight,
    position: calculatePosition()
  });
}, []); // Single state update, one re-render
```

**Edge Case - Server-Side Rendering:**

`useLayoutEffect` causes warnings during SSR because there's no DOM to measure:

```javascript
// ❌ Warning: useLayoutEffect does nothing on the server
useLayoutEffect(() => {
  // This code never runs during SSR
}, []);

// ✅ Use conditional hook execution
useIsomorphicLayoutEffect(() => {
  // Safe for SSR
}, []);

// Implementation:
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
```

React warns about this because `useLayoutEffect` is skipped on the server, but runs on the client, potentially causing hydration mismatches.

#### 🐛 Real-World Scenario: Fixing Tooltip Position Flicker

**Context:** SaaS dashboard with dynamic tooltips that appear when hovering over chart data points. Users reported visible "jumping" when tooltips appeared.

**Production Metrics (Before Fix):**
- Tooltip position flash duration: 50-100ms (clearly visible)
- Cumulative Layout Shift (CLS): 0.42 (poor - threshold is 0.1)
- User complaints: 23% of daily active users mentioned "jumpy tooltips"
- Frame rate drops: 45-52 FPS during tooltip appearance
- Perceived performance: "Feels janky"

**Symptoms:**
Tooltips initially appeared in the wrong position (usually top-left corner at 0,0), then "jumped" to the correct position above/below the data point. This was especially noticeable on slower devices and when hovering quickly across multiple data points.

**Root Cause Investigation:**

```javascript
// BEFORE: Using useEffect causes visible flicker
function Tooltip({ targetRef, content }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef();

  useEffect(() => {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Calculate position above target
    const x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    const y = targetRect.top - tooltipRect.height - 8;

    setPosition({ x, y });
  }, [targetRef]); // Runs AFTER paint

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y
      }}
    >
      {content}
    </div>
  );
}
```

**Timeline of the bug:**

1. Tooltip mounts with initial position (0, 0)
2. React renders DOM with tooltip at (0, 0)
3. Browser paints - **USER SEES TOOLTIP AT WRONG POSITION**
4. useEffect runs after paint
5. Measures DOM, calculates correct position
6. setPosition triggers re-render
7. Browser paints again - tooltip jumps to correct position

**The Fix:**

```javascript
// AFTER: useLayoutEffect prevents flicker
function Tooltip({ targetRef, content }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef();

  useLayoutEffect(() => {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Calculate position above target
    let x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    let y = targetRect.top - tooltipRect.height - 8;

    // Boundary detection - keep tooltip in viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x < 0) x = 8;
    if (x + tooltipRect.width > viewportWidth) {
      x = viewportWidth - tooltipRect.width - 8;
    }
    if (y < 0) {
      // Flip to bottom if no room at top
      y = targetRect.bottom + 8;
    }

    setPosition({ x, y });
  }, [targetRef]); // Runs BEFORE paint

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        opacity: position.x === 0 ? 0 : 1, // Hide until positioned
        transition: 'opacity 0.15s'
      }}
    >
      {content}
    </div>
  );
}
```

**Production Metrics (After Fix):**
- Tooltip position flash: Eliminated (0ms visible flicker)
- Cumulative Layout Shift (CLS): 0.03 (excellent - 93% improvement)
- User complaints: Dropped to < 1% (related to other issues)
- Frame rate: Stable 58-60 FPS
- Perceived performance: "Smooth and professional"

**Additional optimization - Preventing layout thrashing:**

When showing multiple tooltips quickly (hovering across chart points), the original fix still caused performance issues because each tooltip measured the DOM separately.

**Further optimization:**

```javascript
// ✅ Batch measurements using requestAnimationFrame
function useTooltipPosition(targetRef) {
  const [position, setPosition] = useState(null);
  const tooltipRef = useRef();
  const rafRef = useRef();

  useLayoutEffect(() => {
    if (!targetRef.current || !tooltipRef.current) return;

    // Cancel any pending measurement
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // Calculate and set position
      setPosition(calculatePosition(targetRect, tooltipRect));
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetRef]);

  return [tooltipRef, position];
}
```

**Key Learnings:**

1. **Visual correctness > Async performance**: Users notice 50ms of flicker more than 5ms of blocking
2. **useLayoutEffect is essential for DOM measurements**: Anything involving getBoundingClientRect should use useLayoutEffect
3. **SSR compatibility requires conditional logic**: Use isomorphic layout effect helpers
4. **Batch state updates**: Multiple DOM measurements should update state once
5. **Hide-then-show pattern**: Set opacity:0 initially, then opacity:1 after positioning prevents any visual glitch

#### ⚖️ Trade-offs: useLayoutEffect vs useEffect

**The Performance vs Correctness Dilemma:**

Choosing between `useLayoutEffect` and `useEffect` is a classic trade-off between perceived performance and visual correctness. The wrong choice either degrades user experience or wastes frame budget.

**Decision Matrix:**

| Scenario | Best Hook | Reasoning |
|----------|-----------|-----------|
| Data fetching | useEffect | Async operation, no DOM dependency |
| Event listener setup | useEffect | No visual impact |
| DOM measurements | useLayoutEffect | Prevents flicker |
| Scroll position restoration | useLayoutEffect | Must happen before paint |
| Animation triggers | useLayoutEffect | Timing-critical |
| Logging/analytics | useEffect | No user-facing impact |
| Third-party DOM library initialization | useLayoutEffect | Requires correct layout |

**Trade-off 1: Blocking vs Flickering**

```javascript
// Scenario: Measuring element size and updating state

// Option A: useEffect (non-blocking, may flicker)
useEffect(() => {
  const width = ref.current.offsetWidth;
  setWidth(width);
}, []);
// Pros: Doesn't block paint, better FPS
// Cons: User sees flicker if width changes UI
// Cost: 1-2 extra paints, CLS score impact

// Option B: useLayoutEffect (blocking, no flicker)
useLayoutEffect(() => {
  const width = ref.current.offsetWidth;
  setWidth(width);
}, []);
// Pros: No visual flicker, smooth UX
// Cons: Blocks paint for ~2-8ms, reduces FPS if effect is slow
// Cost: Extended frame time, potential jank if effect > 10ms
```

**When to choose useEffect:**
- Element size change doesn't affect layout (e.g., just for logging)
- You can hide element until measured (opacity: 0 trick)
- Effect has side effects like fetch that take >50ms anyway
- Running on a slow device where 8ms blocking matters

**When to choose useLayoutEffect:**
- Position/size measurements affect what user sees
- Third-party libraries expect correct layout
- Scroll restoration (must happen before paint)
- Preventing Cumulative Layout Shift

**Trade-off 2: Development Experience vs Performance**

`useLayoutEffect` makes debugging harder because it runs synchronously in the commit phase:

```javascript
// ❌ Console.log timing is confusing
function Component() {
  console.log('1. Render phase');

  useLayoutEffect(() => {
    console.log('2. Layout effect (before paint)');
  });

  useEffect(() => {
    console.log('3. Effect (after paint)');
  });

  // Output order:
  // 1. Render phase
  // 2. Layout effect (before paint)
  // 3. Effect (after paint)
}
```

React DevTools Profiler doesn't clearly separate layout effects from the commit phase, making performance debugging harder. Effects show up as "passive effects" but layout effects are buried in "commit work".

**Trade-off 3: Mobile vs Desktop Performance**

On mobile devices with limited CPU, `useLayoutEffect` has a more significant performance impact:

```javascript
// Desktop: 8ms layout effect on 2.5GHz CPU
// Mobile: Same code takes 32ms on 1.5GHz CPU (4x slower)

useLayoutEffect(() => {
  // Complex calculation
  const positions = calculateComplexLayout();
  setPositions(positions);
}, [data]);

// On desktop: 8ms extension of frame time (acceptable)
// On mobile: 32ms extension (blows the 16ms budget, causes jank)
```

**Solution for mobile:**

```javascript
// Use progressive enhancement
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

const layoutHook = isMobile ? useEffect : useLayoutEffect;

layoutHook(() => {
  // On mobile: Accept minor flicker to preserve FPS
  // On desktop: Block paint for smooth experience
}, []);
```

**Trade-off 4: Server-Side Rendering Compatibility**

`useLayoutEffect` is completely skipped during SSR, which can cause hydration mismatches:

```javascript
// ❌ Causes hydration warning
function Component() {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    setWidth(window.innerWidth); // Only runs on client
  }, []);

  // Server renders: <div>Width: 0</div>
  // Client hydrates: <div>Width: 0</div>
  // Client layout effect: <div>Width: 1920</div> (mismatch!)
  return <div>Width: {width}</div>;
}

// ✅ Accept initial mismatch, suppress warning
function Component() {
  const [width, setWidth] = useState(0);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setWidth(window.innerWidth);
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>; // Match SSR output
  }

  return <div>Width: {width}</div>;
}
```

**Rule of Thumb:**

Use `useLayoutEffect` only when:
1. You're measuring the DOM (getBoundingClientRect, offsetWidth, etc.)
2. You're mutating the DOM before paint (third-party libraries)
3. You need to prevent visual flicker
4. The effect completes in < 10ms (measure with Profiler!)

Use `useEffect` for everything else:
- Data fetching
- Event listeners
- Analytics
- Subscriptions
- Timers

#### 💬 Explain to Junior: useLayoutEffect

**The Restaurant Kitchen Analogy:**

Imagine you're a chef preparing a dish for a customer. There are two ways to present it:

**useEffect = Check after serving:**

```javascript
// Step 1: Cook the meal
// Step 2: Put it on a plate
// Step 3: Send to customer (they see it!)
// Step 4: Walk out and realize garnish is missing
// Step 5: Add garnish while customer is watching
```

The customer sees the plate arrive, then watches you add the garnish. Awkward!

**useLayoutEffect = Check before serving:**

```javascript
// Step 1: Cook the meal
// Step 2: Put it on a plate
// Step 3: Add garnish before sending (customer waits in dining room)
// Step 4: Send to customer (they see perfect plate!)
```

The customer waits slightly longer, but sees a perfect plate from the start.

**Real Code Example:**

```javascript
// useEffect - Customer sees flash
function Menu() {
  const [price, setPrice] = useState('Calculating...');

  useEffect(() => {
    // Runs AFTER customer sees "Calculating..."
    const total = calculatePrice();
    setPrice(`$${total}`);
  }, []);

  // Customer sees: "Calculating..." → (flash) → "$42.99"
  return <div>Total: {price}</div>;
}

// useLayoutEffect - Customer sees final price
function MenuOptimized() {
  const [price, setPrice] = useState('Calculating...');

  useLayoutEffect(() => {
    // Runs BEFORE customer sees anything
    const total = calculatePrice();
    setPrice(`$${total}`);
  }, []);

  // Customer sees: "$42.99" (perfect from the start)
  return <div>Total: {price}</div>;
}
```

**When to use each:**

**Use useEffect (normal hook) for:**
- Loading data from the internet (fetch)
- Setting up timers (setTimeout)
- Listening for events (click, scroll)
- Anything that doesn't affect what user sees immediately

**Use useLayoutEffect (special hook) for:**
- Measuring sizes of elements (how wide is this button?)
- Positioning tooltips (where should this popup go?)
- Scroll position (restore scroll after navigation)
- Anything where you'd notice a "flash" without it

**The Gotcha - Performance:**

`useLayoutEffect` makes the customer wait a bit longer because you're doing the final check before serving. If that check takes too long, the customer gets impatient:

```javascript
// ❌ Bad: Slow layout effect blocks rendering
useLayoutEffect(() => {
  // This takes 100ms - way too long!
  const result = doExpensiveCalculation();
  setState(result);
}, []);
// User sees: (100ms delay) → content appears
// Feels slow and janky!

// ✅ Good: Fast layout effect
useLayoutEffect(() => {
  // This takes 2ms - acceptable
  const width = element.offsetWidth;
  setWidth(width);
}, []);
// User sees: (2ms delay - imperceptible) → content appears
```

**Interview Answer Template:**

*"useLayoutEffect is a variation of useEffect that runs synchronously after React updates the DOM but before the browser paints to the screen. This makes it perfect for DOM measurements and preventing visual flicker.*

*The difference is timing: useEffect runs after the browser has painted (asynchronous), while useLayoutEffect runs before painting (synchronous).*

*You should use useLayoutEffect when you need to read layout from the DOM and make changes before the user sees anything - for example, positioning a tooltip, measuring element sizes, or restoring scroll position.*

*However, useLayoutEffect should be used sparingly because it blocks the browser from painting, which can hurt performance if the effect takes too long. For most cases, useEffect is the right choice - only reach for useLayoutEffect when you're specifically preventing a visual flash."*

---

### Q3: useImperativeHandle - Customizing Component Refs

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 8 minutes

#### Question
What is useImperativeHandle and when should you use it? What are the alternatives?

#### Answer

```javascript
import { forwardRef, useImperativeHandle, useRef } from 'react';

// Child component
const CustomInput = forwardRef((props, ref) => {
  const inputRef = useRef();

  // Expose only specific methods to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    },
    scrollIntoView: () => {
      inputRef.current.scrollIntoView();
    },
    // Don't expose the entire input element
  }));

  return <input ref={inputRef} {...props} />;
});

// Parent component
function Form() {
  const inputRef = useRef();

  const handleClick = () => {
    // Only access methods we exposed
    inputRef.current.focus();
    inputRef.current.scrollIntoView();
    // inputRef.current.value // ❌ Not available
  };

  return (
    <>
      <CustomInput ref={inputRef} />
      <button onClick={handleClick}>Focus Input</button>
    </>
  );
}

// Q4: useId - Generate unique IDs for accessibility
function NameFields() {
  const id = useId(); // Generates unique ID

  return (
    <>
      <label htmlFor={id + '-firstName'}>First Name</label>
      <input id={id + '-firstName'} type="text" />

      <label htmlFor={id + '-lastName'}>Last Name</label>
      <input id={id + '-lastName'} type="text" />
    </>
  );
}

// Multiple instances get different IDs
function Form() {
  return (
    <>
      <NameFields /> {/* IDs: :r0:-firstName, :r0:-lastName */}
      <NameFields /> {/* IDs: :r1:-firstName, :r1:-lastName */}
    </>
  );
}
```

### Q5-7: useDeferredValue, useTransition, Performance Patterns

```javascript
// Q5: useDeferredValue - Defer non-urgent updates
import { useDeferredValue, useState, useMemo } from 'react';

function SearchResults({ query }) {
  // Deferred version lags behind during rapid updates
  const deferredQuery = useDeferredValue(query);

  // Expensive search only uses deferred value
  const results = useMemo(() => {
    return searchDatabase(deferredQuery); // Expensive operation
  }, [deferredQuery]);

  return (
    <div>
      {/* Show stale content while searching */}
      <div style={{ opacity: query !== deferredQuery ? 0.5 : 1 }}>
        {results.map(item => <div key={item.id}>{item.name}</div>)}
      </div>
    </div>
  );
}

function SearchPage() {
  const [query, setQuery] = useState('');

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <SearchResults query={query} />
    </>
  );
}

// Q6: useTransition - Mark updates as non-urgent
import { useTransition, useState } from 'react';

function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('about');

  const selectTab = (nextTab) => {
    // Mark tab change as non-urgent
    startTransition(() => {
      setTab(nextTab);
    });
  };

  return (
    <>
      <button onClick={() => selectTab('about')}>About</button>
      <button onClick={() => selectTab('posts')}>
        Posts {isPending && '(Loading...)'}
      </button>
      <button onClick={() => selectTab('contact')}>Contact</button>

      {tab === 'about' && <AboutTab />}
      {tab === 'posts' && <PostsTab />}
      {tab === 'contact' && <ContactTab />}
    </>
  );
}

// Q7: Optimizing Re-renders with React.memo
import React, { memo } from 'react';

// Without memo: Re-renders on every parent render
function ExpensiveComponent({ data }) {
  console.log('Rendered');
  return <div>{/* Expensive rendering */}</div>;
}

// With memo: Only re-renders when props change
const MemoizedComponent = memo(function ExpensiveComponent({ data }) {
  console.log('Rendered');
  return <div>{/* Expensive rendering */}</div>;
});

// Custom comparison function
const MemoizedWithCustom = memo(
  function Component({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip render)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### Q8-10: Custom Performance Hooks

```javascript
// Q8: useWhyDidYouUpdate - Debug re-renders
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};

      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
}

// Usage
function Component(props) {
  useWhyDidYouUpdate('Component', props);
  return <div>{props.count}</div>;
}

// Q9: useRafState - State updates synchronized with RAF
function useRafState(initialState) {
  const frame = useRef(0);
  const [state, setState] = useState(initialState);

  const setRafState = useCallback((value) => {
    cancelAnimationFrame(frame.current);

    frame.current = requestAnimationFrame(() => {
      setState(value);
    });
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(frame.current);
  }, []);

  return [state, setRafState];
}

// Usage: Smooth animations
function AnimatedComponent() {
  const [position, setPosition] = useRafState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      <div style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
        Follows mouse
      </div>
    </div>
  );
}

// Q10: useMountedState - Prevent state updates after unmount
function useMountedState() {
  const mountedRef = useRef(false);
  const get = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return get;
}

// Usage: Async operations
function AsyncComponent() {
  const [data, setData] = useState(null);
  const isMounted = useMountedState();

  useEffect(() => {
    async function loadData() {
      const result = await fetchData();

      // Only update if component is still mounted
      if (isMounted()) {
        setData(result);
      }
    }

    loadData();
  }, [isMounted]);

  return <div>{data}</div>;
}
```

### Q11-13: Advanced State Management Hooks

```javascript
// Q11: useReducerAsync - Async actions in reducers
function useReducerAsync(reducer, initState) {
  const [state, dispatch] = useReducer(reducer, initState);

  const dispatchAsync = useCallback(
    (action) => {
      if (typeof action === 'function') {
        return action(dispatch);
      }
      return dispatch(action);
    },
    [dispatch]
  );

  return [state, dispatchAsync];
}

// Usage
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function Component() {
  const [state, dispatch] = useReducerAsync(reducer, {
    loading: false,
    data: null,
    error: null
  });

  const fetchData = () => {
    // Async action creator
    return async (dispatch) => {
      dispatch({ type: 'FETCH_START' });
      try {
        const data = await fetch('/api/data');
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: error });
      }
    };
  };

  return <button onClick={() => dispatch(fetchData())}>Load</button>;
}

// Q12: useStateWithHistory - Undo/Redo functionality
function useStateWithHistory(initialState, capacity = 10) {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);

  const state = history[index];

  const setState = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(state) : value;

    // Remove future history when new state is set
    const newHistory = history.slice(0, index + 1);
    newHistory.push(newValue);

    // Limit capacity
    if (newHistory.length > capacity) {
      newHistory.shift();
    } else {
      setIndex(index + 1);
    }

    setHistory(newHistory);
  }, [history, index, state, capacity]);

  const goBack = useCallback(() => {
    setIndex(Math.max(0, index - 1));
  }, [index]);

  const goForward = useCallback(() => {
    setIndex(Math.min(history.length - 1, index + 1));
  }, [history.length, index]);

  return {
    state,
    setState,
    goBack,
    goForward,
    canGoBack: index > 0,
    canGoForward: index < history.length - 1
  };
}

// Usage
function DrawingApp() {
  const { state, setState, goBack, goForward, canGoBack, canGoForward } =
    useStateWithHistory([]);

  return (
    <>
      <button onClick={goBack} disabled={!canGoBack}>Undo</button>
      <button onClick={goForward} disabled={!canGoForward}>Redo</button>
      <Canvas value={state} onChange={setState} />
    </>
  );
}

// Q13: useQueue - Queue data structure
function useQueue(initialValue = []) {
  const [queue, setQueue] = useState(initialValue);

  const add = useCallback((value) => {
    setQueue(q => [...q, value]);
  }, []);

  const remove = useCallback(() => {
    let removedValue;
    setQueue(([first, ...rest]) => {
      removedValue = first;
      return rest;
    });
    return removedValue;
  }, []);

  const clear = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queue,
    add,
    remove,
    clear,
    first: queue[0],
    last: queue[queue.length - 1],
    size: queue.length
  };
}

// Usage: Toast notifications
function ToastManager() {
  const { queue, add, remove, size } = useQueue();

  const showToast = (message) => {
    add({ id: Date.now(), message });

    setTimeout(() => {
      remove();
    }, 3000);
  };

  return (
    <>
      <button onClick={() => showToast('Hello!')}>Show Toast</button>
      <div>
        {queue.map(toast => (
          <div key={toast.id}>{toast.message}</div>
        ))}
      </div>
    </>
  );
}
```

### Q14-15: Experimental & Future Hooks

```javascript
// Q14: useOptimistic - Optimistic UI updates (React 19)
import { useOptimistic } from 'react';

function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (state, optimisticValue) => state + optimisticValue
  );

  const handleLike = async () => {
    // Immediately show optimistic update
    addOptimisticLike(1);

    try {
      const newLikes = await likePost(postId);
      setLikes(newLikes);
    } catch (error) {
      // Optimistic update automatically reverted on error
      console.error('Failed to like post');
    }
  };

  return (
    <button onClick={handleLike}>
      👍 {optimisticLikes} likes
    </button>
  );
}

// Q15: Custom Hook Composition Patterns
// Combining multiple hooks for complex logic
function useUser(userId) {
  // Fetch user data
  const { data: user, loading: userLoading } = useFetch(`/api/users/${userId}`);

  // Fetch user posts
  const { data: posts, loading: postsLoading } = useFetch(
    user ? `/api/posts?userId=${user.id}` : null
  );

  // Track online status
  const isOnline = useOnlineStatus(userId);

  // Combine all states
  return {
    user,
    posts,
    isOnline,
    loading: userLoading || postsLoading,
    error: !user && !userLoading ? 'User not found' : null
  };
}

// Usage
function UserProfile({ userId }) {
  const { user, posts, isOnline, loading } = useUser(userId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.name} {isOnline && '🟢'}</h1>
      <PostList posts={posts} />
    </div>
  );
}
```

### Advanced Patterns & Best Practices

```javascript
// Pattern 1: Hook Dependencies Management
function useComplexEffect({ userId, filter, sort }) {
  // ❌ Wrong: Missing dependencies
  useEffect(() => {
    fetchData(userId, filter, sort);
  }, [userId]); // Missing filter, sort

  // ✅ Correct: All dependencies included
  useEffect(() => {
    fetchData(userId, filter, sort);
  }, [userId, filter, sort]);

  // ✅ Better: Memoize complex dependencies
  const config = useMemo(() => ({ filter, sort }), [filter, sort]);

  useEffect(() => {
    fetchData(userId, config);
  }, [userId, config]);
}

// Pattern 2: Stable Callback References
function SearchComponent() {
  const [query, setQuery] = useState('');

  // ❌ Wrong: Creates new function every render
  const handleSearch = () => performSearch(query);

  // ✅ Correct: Stable reference with useCallback
  const handleSearch = useCallback(() => {
    performSearch(query);
  }, [query]);

  return <SearchResults onSearch={handleSearch} />;
}

// Pattern 3: Avoiding Memory Leaks
function DataLoader() {
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await fetchData();
      if (!cancelled) {
        setData(data);
      }
    }

    load();

    return () => {
      cancelled = true; // Cleanup
    };
  }, []);
}
```

### Resources
- [React Hooks API Reference](https://react.dev/reference/react)
- [useHooks.com - Collection of hooks](https://usehooks.com/)
- [React Hooks in TypeScript](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks)

</details>

---

[← Back to React README](./README.md)

**Progress:** 15 of 15 advanced hooks completed ✅

