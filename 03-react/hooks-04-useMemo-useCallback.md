# React Hooks: useMemo and useCallback

## Question 1: What's the difference between useMemo and useCallback? When to use each?

**Main Answer:**

`useMemo` and `useCallback` are React optimization hooks that prevent unnecessary recalculations and recreations between renders, but they serve different purposes:

**useMemo** memoizes the *result* of a computation. It takes a function, executes it, and caches the returned value. The memoized value is only recalculated when dependencies change. Use it for expensive calculations that you don't want to repeat on every render.

**useCallback** memoizes the *function itself*. It returns a memoized version of the callback that only changes when dependencies change. Use it when passing callbacks to optimized child components that rely on reference equality to prevent unnecessary renders.

**Key difference**: `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`. UseCallback returns the function, useMemo returns the function's result.

**When to use useMemo:**
- Expensive calculations (filtering large arrays, complex transformations)
- Creating objects/arrays that are dependencies of other hooks
- Preventing expensive component re-renders by memoizing props

**When to use useCallback:**
- Passing callbacks to React.memo components
- Dependencies in useEffect/useMemo that are functions
- Optimizing child component renders that depend on callback reference equality
- Creating stable function references for event handlers in lists

**Rule of thumb**: If you're computing a value, use useMemo. If you're defining a function to pass down, use useCallback. However, both should be used judiciously—premature optimization can harm performance more than help.

### 🔍 Deep Dive: React Memoization Internals

#### How React's Memoization Works

Both hooks use the same underlying mechanism in React's reconciliation process:

**1. Dependency Comparison Algorithm:**

```javascript
// React's internal comparison (simplified)
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) return false;

  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(prevDeps[i], nextDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
```

React uses **Object.is()** for dependency comparison, which means:
- Primitive values: Compared by value (`5 === 5`, `"hello" === "hello"`)
- Objects/Arrays/Functions: Compared by reference (`{} !== {}`, `[] !== []`)

**2. Hook Storage in Fiber:**

```javascript
// React Fiber node (simplified)
{
  memoizedState: {
    // useMemo storage
    memoizedValue: computedResult,
    deps: [dep1, dep2],
    next: {
      // useCallback storage
      memoizedValue: callbackFunction,
      deps: [dep1, dep2],
      next: // ... next hook
    }
  }
}
```

Each hook call creates a node in a linked list attached to the component's Fiber. The order matters—this is why you can't use hooks conditionally.

**3. Performance Cost Analysis:**

```javascript
// useMemo overhead
const value = useMemo(() => {
  return expensiveComputation(a, b); // Cost: C
}, [a, b]);

// Actual cost per render:
// - Dependency check: D (comparing a, b)
// - Function execution: C (only if deps changed)
// - Memory storage: M (constant)
// Total: D + (changeRate * C) + M

// Without useMemo:
const value = expensiveComputation(a, b); // Cost: C every render
```

**useMemo is worth it when:** `D + (changeRate * C) + M < C`

For a computation that runs 10ms and deps change 10% of renders:
- With useMemo: 0.1ms (deps check) + (0.1 * 10ms) + 0.1ms = 1.2ms average
- Without: 10ms every render
- **Savings: 8.8ms per render (88%)**

**4. Memory Implications:**

```javascript
// Each memoized value consumes heap memory
function DataGrid({ data }) {
  // Stores filtered array in memory between renders
  const filteredData = useMemo(
    () => data.filter(item => item.active),
    [data]
  );

  // Stores sorted array in memory
  const sortedData = useMemo(
    () => [...filteredData].sort((a, b) => a.name.localeCompare(b.name)),
    [filteredData]
  );

  // If data has 10,000 items × 2 arrays × ~100 bytes = ~2MB memoized
}
```

**Memory trade-off**: Caching prevents CPU work but increases memory usage. For large datasets, this can cause memory pressure and trigger garbage collection, potentially negating performance gains.

**5. useCallback Specifics:**

```javascript
// useCallback prevents function recreation
const handleClick = useCallback(() => {
  console.log(count); // Closes over count
}, [count]);

// Without useCallback (new function every render):
const handleClick = () => {
  console.log(count);
};

// Under the hood, React stores:
{
  memoizedValue: handleClick, // Function reference
  deps: [count],
  baseState: null
}
```

**Why function reference matters:**

```javascript
function Parent() {
  const [count, setCount] = useState(0);

  // New function every render
  const increment = () => setCount(c => c + 1);

  return <Child onIncrement={increment} />;
}

const Child = React.memo(({ onIncrement }) => {
  console.log('Child rendered'); // Logs every Parent render!
  return <button onClick={onIncrement}>Increment</button>;
});

// React.memo's comparison:
// prevProps.onIncrement !== nextProps.onIncrement
// (different function references) → re-render Child
```

**6. Dependency Array Gotchas:**

```javascript
// ❌ BAD: Missing dependencies
const value = useMemo(() => {
  return data.filter(item => item.status === status);
}, [data]); // Missing 'status' - stale closure!

// ❌ BAD: Object dependency (always changes)
const value = useMemo(() => {
  return data.filter(filter);
}, [data, { field: 'name' }]); // New object every render!

// ✅ GOOD: All dependencies, stable references
const filterConfig = useMemo(() => ({ field: 'name' }), []);
const value = useMemo(() => {
  return data.filter(item => item[filterConfig.field]);
}, [data, filterConfig]);
```

**7. React 18+ Automatic Batching Impact:**

React 18's automatic batching reduces the need for some memoization:

```javascript
// React 17: Two renders
setTimeout(() => {
  setCount(1);  // Render 1
  setFlag(true); // Render 2
}, 1000);

// React 18: One render (automatic batching)
setTimeout(() => {
  setCount(1);  // Batched
  setFlag(true); // Batched → Single render
}, 1000);

// Fewer renders = less need for aggressive memoization
```

### 🐛 Real-World Scenario: Over-Optimization Performance Bug

**Context**: E-commerce product listing with filters and sorting (50k products)

**Initial Implementation (Over-optimized):**

```javascript
function ProductList({ products }) {
  const [filters, setFilters] = useState({ category: '', priceRange: '' });
  const [sortBy, setSortBy] = useState('name');

  // ❌ Premature optimization everywhere
  const categoryOptions = useMemo(
    () => ['Electronics', 'Clothing', 'Books'],
    [] // Static data - useMemo adds overhead!
  );

  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []); // Missing setFilters dependency (works but confusing)

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
  }, []); // Missing setSortBy dependency

  const filteredProducts = useMemo(() => {
    console.log('Filtering...');
    return products.filter(p =>
      (!filters.category || p.category === filters.category) &&
      (!filters.priceRange || p.price <= filters.priceRange)
    );
  }, [products, filters]);

  const sortedProducts = useMemo(() => {
    console.log('Sorting...');
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      return 0;
    });
  }, [filteredProducts, sortBy]);

  // ❌ Memoizing JSX (almost never worth it)
  const productCards = useMemo(() =>
    sortedProducts.map(product => (
      <ProductCard key={product.id} product={product} />
    ))
  , [sortedProducts]);

  return (
    <div>
      <Filters
        options={categoryOptions}
        onChange={handleFilterChange}
        onSortChange={handleSortChange}
      />
      <div className="grid">{productCards}</div>
    </div>
  );
}
```

**Performance Metrics (React DevTools Profiler):**

```
Initial render: 1,245ms
Filter change: 892ms (re-filtering + re-sorting + re-memoizing JSX)
Memory usage: 124MB (50k products × 2 cached arrays + cached JSX)

Breakdown per render:
- Dependency checks (4 useMemo + 2 useCallback): 0.8ms
- Filtering: 245ms
- Sorting: 180ms
- JSX recreation: 450ms (even when memoized - still creates virtual DOM)
- Reconciliation: 17ms
```

**Problem**: Memoizing JSX adds overhead without benefits because:
1. React already efficiently diffs virtual DOM
2. ProductCard components should handle their own optimization
3. Storing 50k JSX elements in memory is wasteful

**The Bug - Stale Closures:**

```javascript
// User clicks filter → clicks sort rapidly
// Sequence:
// 1. Filter change triggers filteredProducts update
// 2. Before sortedProducts recalculates, user changes sort
// 3. sortedProducts uses STALE filteredProducts reference
// 4. UI shows wrong sorted results for ~100ms
// 5. Next render fixes it, but flicker is visible

// Console output:
// "Filtering..." (from filter change)
// "Sorting..." (from sort change, uses stale filteredProducts)
// "Sorting..." (corrects itself next render)
```

**Improved Solution:**

```javascript
function ProductList({ products }) {
  const [filters, setFilters] = useState({ category: '', priceRange: '' });
  const [sortBy, setSortBy] = useState('name');

  // ✅ No useMemo for static data
  const categoryOptions = ['Electronics', 'Clothing', 'Books'];

  // ✅ No useCallback for callbacks with stable setState
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  // ✅ Combine filter + sort in one useMemo (avoids stale closure)
  const processedProducts = useMemo(() => {
    console.log('Processing...');
    const filtered = products.filter(p =>
      (!filters.category || p.category === filters.category) &&
      (!filters.priceRange || p.price <= filters.priceRange)
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      return 0;
    });
  }, [products, filters, sortBy]);

  // ✅ Let React handle JSX efficiently
  return (
    <div>
      <Filters
        options={categoryOptions}
        onChange={handleFilterChange}
        onSortChange={handleSortChange}
      />
      <div className="grid">
        {processedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// ✅ Optimize at component level instead
const ProductCard = React.memo(({ product }) => {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
});
```

**Improved Metrics:**

```
Initial render: 980ms (21% faster)
Filter change: 445ms (50% faster - single memoization)
Memory usage: 62MB (50% reduction - no cached JSX)

Breakdown per render:
- Dependency checks (1 useMemo): 0.1ms
- Processing (filter + sort): 425ms
- JSX creation: 12ms (virtual DOM only)
- Reconciliation: 8ms (React.memo on ProductCard helps)
```

**Key Lessons:**

1. **Combine dependent computations** - Avoid intermediate memoized values that create stale closure risks
2. **Don't memoize JSX** - React's virtual DOM diffing is already optimized
3. **Memoize at component level** - React.memo on child components is more effective
4. **Measure first** - Use React DevTools Profiler before optimizing

**When the bug manifested:**
- High-frequency filter changes (user typing in search)
- Rapid sort changes while filtering
- Large datasets (>10k items) where timing matters
- Mobile devices with slower JavaScript engines

<details>
<summary><strong>⚖️ Trade-offs: When NOT to Use useMemo/useCallback</strong></summary>

#### Cost-Benefit Analysis Framework

**Decision Matrix:**

| Scenario | Use Memo? | Reason |
|----------|-----------|---------|
| Primitive calculation (`a + b`) | ❌ NO | Faster to recalculate than check deps |
| Array filter (<100 items) | ❌ NO | Dependency check overhead > filter cost |
| Array filter (>1000 items) | ✅ YES | Filter cost > dependency check |
| Static data | ❌ NO | Move outside component or use constant |
| Callback to non-memoized child | ❌ NO | Child re-renders anyway |
| Callback to React.memo child | ✅ YES | Prevents unnecessary re-renders |
| Object/array as useEffect dep | ✅ YES | Prevents infinite loops |
| Function that changes every render | ❌ NO | Dependencies include state/props |

#### 1. Premature Optimization (Common Anti-Pattern)

```javascript
// ❌ BAD: Over-engineering simple component
function UserProfile({ user }) {
  const fullName = useMemo(
    () => `${user.firstName} ${user.lastName}`,
    [user.firstName, user.lastName]
  );

  const greeting = useMemo(
    () => `Hello, ${fullName}!`,
    [fullName]
  );

  const handleClick = useCallback(() => {
    console.log(greeting);
  }, [greeting]);

  return (
    <div onClick={handleClick}>
      {greeting}
    </div>
  );
}

// Performance cost:
// - 3 dependency checks: ~0.3ms
// - String concatenation: ~0.001ms
// - Net loss: 300x slower!

// ✅ GOOD: Simple is faster
function UserProfile({ user }) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const greeting = `Hello, ${fullName}!`;

  const handleClick = () => {
    console.log(greeting);
  };

  return <div onClick={handleClick}>{greeting}</div>;
}
```

**Benchmark (1000 renders):**
- Over-optimized: 342ms
- Simple version: 23ms
- **Optimization made it 15x slower!**

#### 2. Unnecessary Callback Memoization

```javascript
// ❌ BAD: Child isn't memoized
function Parent() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  // Child will re-render anyway when Parent re-renders
  return <Child onIncrement={increment} />;
}

function Child({ onIncrement }) {
  console.log('Child rendered'); // Logs every Parent render
  return <button onClick={onIncrement}>Increment</button>;
}

// ✅ GOOD: Only memoize if child is memoized
const Child = React.memo(({ onIncrement }) => {
  console.log('Child rendered'); // Only logs when onIncrement changes
  return <button onClick={onIncrement}>Increment</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // Now useCallback is useful
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return <Child onIncrement={increment} />;
}
```

#### 3. False Dependencies (Negates Memoization)

```javascript
// ❌ BAD: Dependencies change every render
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  const searchConfig = { // New object every render
    caseSensitive: false,
    maxResults: 10
  };

  const filteredResults = useMemo(() => {
    return results.filter(r =>
      r.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [results, query, searchConfig]); // searchConfig changes every time!

  // Memoization never hits cache - pointless overhead
}

// ✅ GOOD: Stable dependencies
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  // Option 1: Move outside component
  const SEARCH_CONFIG = { caseSensitive: false, maxResults: 10 };

  // Option 2: Memoize the config
  const searchConfig = useMemo(() => ({
    caseSensitive: false,
    maxResults: 10
  }), []);

  const filteredResults = useMemo(() => {
    return results
      .filter(r => r.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, SEARCH_CONFIG.maxResults);
  }, [results, query]);
}
```

#### 4. Memory Pressure on Low-End Devices

```javascript
// ❌ BAD: Caching huge datasets
function DataVisualization({ rawData }) {
  // rawData: 1 million rows × 20 columns = ~200MB

  const processedData = useMemo(() => {
    return rawData.map(row => ({
      ...row,
      computed: expensiveComputation(row)
    }));
  }, [rawData]);

  const aggregatedData = useMemo(() => {
    return processedData.reduce((acc, row) => {
      // Complex aggregation
    }, {});
  }, [processedData]);

  // Memory usage: ~400MB (original + processed + aggregated)
  // On mobile (2GB RAM): Triggers GC, app freezes
}

// ✅ GOOD: Compute on-demand or paginate
function DataVisualization({ rawData }) {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 100;

  // Only process visible page
  const visibleData = useMemo(() => {
    const start = page * PAGE_SIZE;
    const pageData = rawData.slice(start, start + PAGE_SIZE);
    return pageData.map(row => ({
      ...row,
      computed: expensiveComputation(row)
    }));
  }, [rawData, page]);

  // Memory: ~200MB (original) + ~0.2MB (100 rows) = 200.2MB
}
```

#### 5. When NOT to Memoize

**Don't memoize if:**

1. **Computation is trivial** (<1ms)
   ```javascript
   // ❌ Overhead > benefit
   const doubled = useMemo(() => value * 2, [value]);
   ```

2. **Dependencies change frequently** (>80% of renders)
   ```javascript
   // ❌ Always recalculates anyway
   const filtered = useMemo(() => data.filter(query), [data, query]);
   // If query changes every keystroke = useMemo overhead for no cache hits
   ```

3. **Component rarely re-renders**
   ```javascript
   // ❌ Modal that renders once per session
   function Modal({ isOpen, onClose }) {
     const handleEscape = useCallback((e) => {
       if (e.key === 'Escape') onClose();
     }, [onClose]);
     // Modal opens/closes rarely - optimization pointless
   }
   ```

4. **You haven't measured** (Premature optimization)
   ```javascript
   // ❌ "This looks expensive" (without profiling)
   const result = useMemo(() => complexLogic(), [deps]);

   // ✅ Profile first:
   console.time('complexLogic');
   const result = complexLogic();
   console.timeEnd('complexLogic'); // 0.1ms - don't memoize!
   ```

#### Performance Budget Decision Tree

```
Is it actually slow?
├─ NO → Don't optimize
└─ YES → Profile to find bottleneck
    ├─ Bottleneck is expensive calculation
    │   ├─ Runs every render → useMemo ✅
    │   └─ Deps change often → Don't memoize ❌
    ├─ Bottleneck is child re-renders
    │   ├─ Passing callbacks → useCallback + React.memo ✅
    │   └─ Passing primitives → React.memo only ✅
    └─ Bottleneck is elsewhere → Fix root cause
```

**Rule of thumb metrics:**
- **Memoize calculations >5ms** that run every render with stable deps
- **Memoize callbacks** when passing to React.memo children
- **Don't memoize** primitives, simple operations, or unstable dependencies
- **Always profile** with React DevTools Profiler before/after optimization

### 💬 Explain to Junior: useMemo and useCallback Made Simple

#### The Restaurant Kitchen Analogy

Imagine you're running a restaurant kitchen:

**Without memoization:**
Every time a customer asks "What's for dinner?", you:
1. Go to the market to buy ingredients
2. Prep all the vegetables
3. Cook everything from scratch
4. Serve the meal

This happens even if 10 customers ask the same question in a row!

**With useMemo (memoizing results):**
The first time someone asks, you cook the meal. Then you put a sample on display. Next customers see the display and know what's available—no need to cook again unless ingredients change.

```javascript
// Without useMemo (cook every time)
function Restaurant() {
  const menu = prepareComplexMenu(); // Runs every render
  return <MenuDisplay menu={menu} />;
}

// With useMemo (cook once, display many times)
function Restaurant() {
  const menu = useMemo(() => prepareComplexMenu(), []); // Cook once
  return <MenuDisplay menu={menu} />;
}
```

**With useCallback (memoizing the recipe):**
Instead of writing a new recipe card every time someone asks how to cook, you laminate ONE recipe card and reuse it. The recipe stays the same unless ingredients (dependencies) change.

```javascript
// Without useCallback (new recipe every time)
function Restaurant() {
  const cookMeal = () => { /* recipe */ }; // New recipe every render
  return <Chef recipe={cookMeal} />;
}

// With useCallback (laminated recipe)
function Restaurant() {
  const cookMeal = useCallback(() => { /* recipe */ }, []); // Same recipe
  return <Chef recipe={cookMeal} />;
}
```

#### Simple Rules for Beginners

**Use useMemo when:**
- You have a slow calculation (like filtering a huge list)
- The calculation result is used multiple times
- You're creating objects/arrays used in other hooks

**Use useCallback when:**
- You're passing a function to a child component
- That child component uses React.memo
- You want to prevent the child from re-rendering unnecessarily

**Don't use either when:**
- The operation is fast (like adding two numbers)
- You haven't actually measured any performance problem
- The component barely renders

#### Code Example: Shopping Cart

```javascript
// Scenario: Shopping cart with filtering and sorting
function ShoppingCart({ items }) {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('name');

  // ✅ useMemo: Expensive filtering operation
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]); // Only re-filter when items or filter changes

  // ✅ useMemo: Expensive sorting operation
  const sortedItems = useMemo(() => {
    console.log('Sorting items...');
    return [...filteredItems].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      return a.price - b.price;
    });
  }, [filteredItems, sort]); // Only re-sort when filtered items or sort changes

  // ✅ useCallback: Prevent CartItem re-renders
  const handleRemove = useCallback((id) => {
    // Remove item logic
  }, []); // Stable function reference

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search items..."
      />
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="name">Sort by Name</option>
        <option value="price">Sort by Price</option>
      </select>

      {sortedItems.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
}

// Child component with React.memo (only re-renders if props change)
const CartItem = React.memo(({ item, onRemove }) => {
  console.log(`Rendering item: ${item.name}`);
  return (
    <div>
      <span>{item.name} - ${item.price}</span>
      <button onClick={() => onRemove(item.id)}>Remove</button>
    </div>
  );
});
```

**What happens:**
1. User types in search → `filter` changes
2. `filteredItems` recalculates (useMemo runs)
3. `sortedItems` recalculates (depends on filteredItems)
4. CartItem components DON'T re-render (handleRemove reference unchanged, React.memo prevents it)
5. Only the filtered/sorted items list updates

**Without memoization:**
- Every keystroke would filter + sort + re-render ALL CartItem components
- For 100 items, that's 100 unnecessary re-renders per keystroke!

#### Interview Answer Template

**Question: "When would you use useMemo?"**

**Answer:**
"I'd use useMemo to optimize expensive calculations that don't need to run on every render. For example, if I'm filtering or sorting a large list, I'd wrap that operation in useMemo with dependencies on the data and filter criteria. This way, the calculation only runs when those specific values change, not on every render.

However, I'd always profile first with React DevTools to confirm there's actually a performance problem, because useMemo has its own overhead. If the calculation is fast, memoizing it can actually make things slower."

**Question: "What's the difference between useMemo and useCallback?"**

**Answer:**
"Both prevent unnecessary recalculations, but useMemo caches a computed value while useCallback caches a function itself. I use useMemo for expensive operations like `useMemo(() => data.filter(...), [data])`, which caches the filtered result. I use useCallback for functions passed to child components, like `useCallback(() => handleClick(), [])`, to maintain the same function reference and prevent child re-renders when used with React.memo.

The key insight is that `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)` — it's just syntactic sugar for memoizing a function."

**Question: "What are common mistakes with these hooks?"**

**Answer:**
"Three common mistakes:

First, premature optimization—adding useMemo to simple calculations like adding two numbers, which is faster without it.

Second, missing dependencies, which causes stale closure bugs where the memoized value uses old data.

Third, using useCallback without React.memo on the child component, which provides no benefit because the child re-renders anyway.

I always use the eslint-plugin-react-hooks exhaustive-deps rule to catch dependency issues and profile before optimizing."

#### Quick Reference Card

```javascript
// useMemo - Cache computed values
const value = useMemo(() => {
  return expensiveOperation(a, b);
}, [a, b]); // Recalculate only when a or b changes

// useCallback - Cache functions
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]); // New function only when a or b changes

// Common pattern: useCallback with React.memo
const MemoizedChild = React.memo(({ onClick }) => {
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []); // Stable reference

  return <MemoizedChild onClick={handleClick} />;
}

// Dependencies array rules:
// - Include all values from component scope used in callback
// - Use ESLint rule to check: exhaustive-deps
// - Primitive values: compared by value
// - Objects/arrays/functions: compared by reference
```

**Remember:** Profile first, optimize second. Most components don't need memoization!

---

## Question 2: What are common mistakes with useMemo/useCallback and how to avoid them?

**Main Answer:**

Common mistakes with useMemo and useCallback can actually harm performance instead of improving it. Here are the most critical pitfalls:

**1. Missing dependencies (stale closures):**
The most dangerous mistake. When you omit dependencies, your memoized value/function captures old values, leading to bugs that are hard to debug. Always include all variables from component scope that are used inside the memoized callback.

**2. Premature optimization:**
Adding memoization to every computation "just in case" adds overhead (dependency checking, memory storage) that often exceeds the cost of the original operation. Only optimize after measuring with React DevTools Profiler.

**3. Unstable dependencies:**
Passing objects, arrays, or functions as dependencies that are recreated every render defeats memoization. The dependency check sees a new reference and recalculates every time.

**4. Over-reliance on memoization:**
Using useMemo/useCallback as a band-aid for deeper architectural problems (like prop drilling, excessive re-renders from poor state structure). Better to fix the root cause.

**5. useCallback without React.memo:**
Memoizing callbacks to non-memoized children provides zero benefit—the child re-renders anyway when the parent does, regardless of callback stability.

**6. Memoizing component output (JSX):**
Wrapping JSX in useMemo is almost never beneficial. React's virtual DOM diffing is already optimized for this, and you're adding overhead without gains.

**How to avoid:**
- Use eslint-plugin-react-hooks with exhaustive-deps rule
- Profile before and after optimization
- Create stable references for complex dependencies
- Consider React.memo on children before useCallback on parents
- Move static values outside components
- Use performance budgets (only optimize if >5ms improvement)

### 🔍 Deep Dive: Dependency Management and Closure Mechanics

#### 1. Stale Closures: The Most Insidious Bug

**How closures work in JavaScript:**

```javascript
function createCounter() {
  let count = 0; // Captured in closure

  return function increment() {
    count++; // References outer scope
    console.log(count);
  };
}

const counter1 = createCounter();
counter1(); // 1
counter1(); // 2

const counter2 = createCounter();
counter2(); // 1 (new closure, new count)
```

**In React hooks:**

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ STALE CLOSURE: useCallback without dependencies
  const handleClick = useCallback(() => {
    console.log(count); // Captures count = 0 forever!
  }, []); // Empty deps = never updates

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={handleClick}>Log Count</button>
    </div>
  );
}

// User clicks Increment 5 times → count = 5
// User clicks Log Count → logs 0 (stale value!)
```

**Why this happens:**

When React creates the component's first render:
1. `count = 0`
2. `handleClick` function is created, capturing `count = 0` in its closure
3. useCallback with `[]` deps means "never recreate this function"
4. Even when count updates to 1, 2, 3..., handleClick still references the original `count = 0`

**The correct version:**

```javascript
// ✅ CORRECT: Include count in dependencies
const handleClick = useCallback(() => {
  console.log(count); // Gets current count
}, [count]); // Recreate when count changes

// Alternative: Use functional updates (no dependency needed)
const handleIncrement = useCallback(() => {
  setCount(c => c + 1); // c is always current
}, []); // No dependencies - setState is stable
```

#### 2. ESLint Rule: exhaustive-deps

**Setup:**

```json
// .eslintrc.json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**What it catches:**

```javascript
function SearchResults({ query, filters }) {
  const [results, setResults] = useState([]);

  // ❌ ESLint warning: React Hook useMemo has missing dependencies: 'filters'
  const filteredResults = useMemo(() => {
    return results.filter(r =>
      r.title.includes(query) && r.category === filters.category
    );
  }, [results, query]); // Missing 'filters'!

  // ✅ Fixed
  const filteredResults = useMemo(() => {
    return results.filter(r =>
      r.title.includes(query) && r.category === filters.category
    );
  }, [results, query, filters]);
}
```

**When to ignore (rarely):**

```javascript
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1); // Functional update - doesn't need count
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Safe to ignore - using functional update
}
```

#### 3. Object/Array Dependencies: Reference Equality Trap

**The problem:**

```javascript
function DataTable() {
  const [data, setData] = useState([]);

  // ❌ New object every render
  const options = {
    sortable: true,
    filterable: true
  };

  // ❌ useMemo recalculates every time (options reference changes)
  const processedData = useMemo(() => {
    return data.map(row => transform(row, options));
  }, [data, options]); // options is new every render!
}
```

**Object.is() comparison:**

```javascript
const obj1 = { a: 1 };
const obj2 = { a: 1 };
Object.is(obj1, obj2); // false (different references)

const obj3 = obj1;
Object.is(obj1, obj3); // true (same reference)
```

**Solutions:**

```javascript
// Solution 1: Move outside component (if static)
const OPTIONS = {
  sortable: true,
  filterable: true
};

function DataTable() {
  const [data, setData] = useState([]);

  const processedData = useMemo(() => {
    return data.map(row => transform(row, OPTIONS));
  }, [data]); // OPTIONS is stable
}

// Solution 2: Memoize the dependency
function DataTable() {
  const [data, setData] = useState([]);

  const options = useMemo(() => ({
    sortable: true,
    filterable: true
  }), []); // Create once

  const processedData = useMemo(() => {
    return data.map(row => transform(row, options));
  }, [data, options]); // options is stable
}

// Solution 3: Destructure dependencies (if from props)
function DataTable({ config }) {
  const [data, setData] = useState([]);
  const { sortable, filterable } = config;

  const processedData = useMemo(() => {
    return data.map(row => transform(row, { sortable, filterable }));
  }, [data, sortable, filterable]); // Primitives (by-value comparison)
}
```

#### 4. Function Dependencies

**The problem:**

```javascript
function UserList() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // ❌ Helper function defined in component (new every render)
  const matchesSearch = (user) => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // ❌ useMemo recalculates every time (matchesSearch reference changes)
  const filteredUsers = useMemo(() => {
    return users.filter(matchesSearch);
  }, [users, matchesSearch]); // matchesSearch is new every render!
}
```

**Solutions:**

```javascript
// Solution 1: Inline the logic
const filteredUsers = useMemo(() => {
  return users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [users, searchTerm]);

// Solution 2: useCallback for the helper
const matchesSearch = useCallback((user) => {
  return user.name.toLowerCase().includes(searchTerm.toLowerCase());
}, [searchTerm]);

const filteredUsers = useMemo(() => {
  return users.filter(matchesSearch);
}, [users, matchesSearch]); // matchesSearch is stable

// Solution 3: Move outside component (if no closure needed)
const matchesSearch = (user, term) => {
  return user.name.toLowerCase().includes(term.toLowerCase());
};

function UserList() {
  const filteredUsers = useMemo(() => {
    return users.filter(user => matchesSearch(user, searchTerm));
  }, [users, searchTerm]);
}
```

#### 5. Dependency Array Deep Dive

**React's comparison algorithm:**

```javascript
// Simplified React internals
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) return false;

  for (let i = 0; i < prevDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue; // Same value, check next
    }
    return false; // Different value, recalculate
  }
  return true; // All same, use cached value
}

// Usage in useMemo
function useMemo(create, deps) {
  const hook = getCurrentHook();
  const nextDeps = deps;
  const prevDeps = hook.memoizedState?.[1];

  if (prevDeps !== null) {
    if (areHookInputsEqual(nextDeps, prevDeps)) {
      return hook.memoizedState[0]; // Return cached value
    }
  }

  const nextValue = create(); // Recalculate
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
```

**Primitive vs Reference types:**

```javascript
// Primitives (by-value comparison)
Object.is(5, 5); // true
Object.is('hello', 'hello'); // true
Object.is(true, true); // true

// References (by-reference comparison)
Object.is({}, {}); // false
Object.is([], []); // false
Object.is(() => {}, () => {}); // false

// Special cases
Object.is(NaN, NaN); // true (unlike ===)
Object.is(0, -0); // false (unlike ===)
Object.is(null, undefined); // false
```

#### 6. The "Depend on Everything" Anti-Pattern

**Bad pattern:**

```javascript
function ComplexComponent({ config, data, filters, sort }) {
  // ❌ Giant dependency array (recalculates often)
  const processedData = useMemo(() => {
    return data
      .filter(filters)
      .sort(sort)
      .map(item => config.transform(item));
  }, [config, data, filters, sort]); // 4 dependencies

  // If any prop changes, recalculates (likely every render)
}
```

**Better approach - break down:**

```javascript
function ComplexComponent({ config, data, filters, sort }) {
  // Step 1: Filter (depends on data + filters)
  const filteredData = useMemo(() => {
    return data.filter(filters);
  }, [data, filters]);

  // Step 2: Sort (depends on filtered + sort)
  const sortedData = useMemo(() => {
    return [...filteredData].sort(sort);
  }, [filteredData, sort]);

  // Step 3: Transform (depends on sorted + config)
  const processedData = useMemo(() => {
    return sortedData.map(item => config.transform(item));
  }, [sortedData, config]);

  // Now each step only recalculates when its specific deps change
}
```

**Trade-off:**
- More useMemo calls = more overhead
- But more granular control = fewer unnecessary recalculations
- Profile to determine which approach is faster for your use case

### 🐛 Real-World Scenario: Stale Closure in Production

**Context**: Real-time dashboard with auto-refresh and user interactions (analytics platform)

**The Bug:**

```javascript
function Dashboard({ userId }) {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ timeRange: '24h', metric: 'views' });
  const [autoRefresh, setAutoRefresh] = useState(true);

  // ❌ CRITICAL BUG: Stale closure in interval
  useEffect(() => {
    if (!autoRefresh) return;

    const fetchData = async () => {
      const response = await api.getDashboardData(userId, filters);
      setData(response);
    };

    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 30000); // Every 30s

    return () => clearInterval(intervalId);
  }, [autoRefresh]); // ❌ Missing userId, filters!

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []); // ❌ Missing setFilters (works but confusing)

  const processedData = useMemo(() => {
    if (!data) return null;
    return data.items.filter(item => item.metric === filters.metric);
  }, [data]); // ❌ Missing filters!

  return (
    <div>
      <FilterPanel filters={filters} onChange={handleFilterChange} />
      <DataGrid data={processedData} />
    </div>
  );
}
```

**What happened in production:**

1. **User loads dashboard**: userId=123, filters={ timeRange: '24h', metric: 'views' }
2. **Initial fetch works correctly** (displays data for user 123)
3. **User changes filter** to metric='clicks'
4. **processedData stays showing 'views'** (stale filters in useMemo!)
5. **After 30 seconds, auto-refresh runs** but STILL fetches userId=123 with OLD filters
6. **User switches to different user** (userId=456)
7. **Auto-refresh STILL fetching for userId=123** with original filters!
8. **User sees data for wrong user** (123 instead of 456)

**Production metrics:**

```
Error reports: 847 incidents over 2 days
Affected users: 23% of dashboard users
User complaints: "Dashboard shows wrong data"
Data integrity issue: Users made decisions on wrong metrics
Time to identify root cause: 6 hours (hard to debug)
```

**The confusion:**

```javascript
// User's timeline:
// T=0s:   Load dashboard (userId=123, metric='views')
// T=15s:  Change filter (metric='clicks')
// T=30s:  Auto-refresh (fetches userId=123, metric='views') ← STALE!
// T=45s:  Switch user (userId=456)
// T=60s:  Auto-refresh (fetches userId=123, metric='views') ← WRONG USER!
// T=75s:  User sees data for user 123 but thinks it's for user 456

// Console output:
console.log('Fetching data for:', userId, filters);
// Logs: "Fetching data for: 123 { timeRange: '24h', metric: 'views' }"
// Even though UI shows userId=456, metric='clicks'!
```

**Why ESLint didn't catch it:**

```javascript
// Developer had disabled the rule in this file:
/* eslint-disable react-hooks/exhaustive-deps */

// Reason (in code comment): "Too many warnings, will fix later"
// This is a common anti-pattern that leads to bugs
```

**The fix:**

```javascript
function Dashboard({ userId }) {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ timeRange: '24h', metric: 'views' });
  const [autoRefresh, setAutoRefresh] = useState(true);

  // ✅ FIXED: All dependencies included
  useEffect(() => {
    if (!autoRefresh) return;

    const fetchData = async () => {
      console.log('Fetching data for:', userId, filters);
      const response = await api.getDashboardData(userId, filters);
      setData(response);
    };

    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 30000);

    return () => {
      console.log('Cleaning up interval for:', userId, filters);
      clearInterval(intervalId);
    };
  }, [autoRefresh, userId, filters]); // ✅ All deps included

  // ✅ FIXED: Proper dependencies
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []); // setFilters is stable (from useState)

  // ✅ FIXED: Include filters
  const processedData = useMemo(() => {
    if (!data) return null;
    return data.items.filter(item => item.metric === filters.metric);
  }, [data, filters]); // ✅ Both deps included

  return (
    <div>
      <FilterPanel filters={filters} onChange={handleFilterChange} />
      <DataGrid data={processedData} />
    </div>
  );
}
```

**Improved behavior:**

```javascript
// User's timeline (after fix):
// T=0s:   Load dashboard (userId=123, metric='views')
//         → Effect runs: fetch(123, 'views'), interval starts
// T=15s:  Change filter (metric='clicks')
//         → Effect cleanup: clear old interval (123, 'views')
//         → Effect runs: fetch(123, 'clicks'), new interval starts
// T=30s:  Auto-refresh (fetches userId=123, metric='clicks') ✅ CORRECT!
// T=45s:  Switch user (userId=456)
//         → Effect cleanup: clear old interval (123, 'clicks')
//         → Effect runs: fetch(456, 'clicks'), new interval starts
// T=60s:  Auto-refresh (fetches userId=456, metric='clicks') ✅ CORRECT!
```

**Performance consideration:**

```javascript
// Concern: Won't this restart the interval too often?
// Answer: Yes, but we can optimize with useMemo

function Dashboard({ userId }) {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ timeRange: '24h', metric: 'views' });
  const [autoRefresh, setAutoRefresh] = useState(true);

  // ✅ Memoize fetch function (stable unless userId/filters change)
  const fetchData = useCallback(async () => {
    const response = await api.getDashboardData(userId, filters);
    setData(response);
  }, [userId, filters]);

  // ✅ Effect only depends on stable references
  useEffect(() => {
    if (!autoRefresh) return;

    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchData]); // fetchData is stable

  // Changing autoRefresh toggle doesn't restart fetch logic,
  // only starts/stops the interval
}
```

**Lessons learned:**

1. **Never disable exhaustive-deps** without thorough review
2. **Stale closures cause data integrity bugs** (worst kind - silent and wrong)
3. **Test with rapid user interactions** (filter changes, user switches)
4. **Add logging** to debug closure issues (log captured values)
5. **Consider callback stability** for effects with intervals/timers

**Prevention checklist:**

```javascript
// Before committing useEffect/useMemo/useCallback:
// 1. ESLint exhaustive-deps warning? → Fix it, don't ignore
// 2. Does it capture state/props? → Include in deps
// 3. Does it run on interval/timeout? → Double-check deps
// 4. Test: Change deps rapidly, verify behavior
// 5. Add console.log with captured values (remove before prod)
```

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Optimization Strategies and When to Use Them</strong></summary>

#### Strategy Comparison Matrix

| Strategy | Use Case | Pros | Cons | When NOT to Use |
|----------|----------|------|------|-----------------|
| **useMemo** | Expensive calculations | Prevents recalc | Memory + deps overhead | Fast operations (<1ms) |
| **useCallback** | Stable function refs | Prevents child re-renders | Only useful with React.memo | Non-memoized children |
| **React.memo** | Expensive child renders | Prevents component re-render | Props shallow comparison cost | Props change frequently |
| **Code splitting** | Large bundles | Reduces initial load | Network latency for chunks | Small apps (<100KB) |
| **Virtualization** | Long lists (>100 items) | Renders only visible | Complex implementation | Short lists |
| **Web Workers** | Heavy CPU tasks | Doesn't block UI | Communication overhead | Quick tasks (<50ms) |

#### 1. useMemo vs Just Recalculating

**Decision tree:**

```
Is the calculation expensive? (>5ms)
├─ NO → Don't use useMemo ❌
└─ YES → Do dependencies change frequently?
    ├─ YES (>50% of renders) → Don't use useMemo ❌
    └─ NO (<50% of renders) → Use useMemo ✅
```

**Example 1: String manipulation (don't memoize)**

```javascript
// ❌ BAD: Overhead > benefit
const fullName = useMemo(
  () => `${firstName} ${lastName}`,
  [firstName, lastName]
);

// ✅ GOOD: Just recalculate
const fullName = `${firstName} ${lastName}`;

// Benchmark (1000 renders):
// With useMemo: 12.4ms
// Without: 0.8ms
// Winner: No memoization (15x faster)
```

**Example 2: Array filtering (memoize)**

```javascript
// ✅ GOOD: Expensive operation
const filteredUsers = useMemo(
  () => users.filter(u => u.role === role),
  [users, role]
);

// Benchmark (1000 renders, 10,000 users):
// With useMemo: 125ms (10% dep changes)
// Without: 1,250ms (every render)
// Winner: useMemo (10x faster)
```

#### 2. useCallback vs Inline Functions

**Cost analysis:**

```javascript
// Inline function cost:
// - Function creation: ~0.001ms
// - Memory allocation: ~48 bytes
// - GC impact: Negligible (short-lived)

// useCallback cost:
// - Dependency check: ~0.01ms
// - Memory storage: ~48 bytes (retained)
// - Complexity: Higher (deps management)

// Break-even point: Only if preventing expensive child re-renders
```

**Scenario A: Non-memoized child**

```javascript
// ❌ POINTLESS: Child re-renders anyway
function Parent() {
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return <Child onClick={handleClick} />; // Child not memoized!
}

function Child({ onClick }) {
  return <button onClick={onClick}>Click</button>;
}

// Parent re-renders → Child re-renders (no optimization)
```

**Scenario B: Memoized child**

```javascript
// ✅ USEFUL: Prevents child re-renders
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []); // Stable reference

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveChild onClick={handleClick} />
    </div>
  );
}

const ExpensiveChild = React.memo(({ onClick }) => {
  // Expensive render logic (50ms)
  return <button onClick={onClick}>Click</button>;
});

// Parent re-renders (count changes) → ExpensiveChild DOESN'T re-render
// Savings: 50ms per parent render
```

#### 3. React.memo vs useMemo for Components

**React.memo (memoize entire component):**

```javascript
// ✅ Memoize at component level
const ProductCard = React.memo(({ product }) => {
  return (
    <div className="card">
      <img src={product.image} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
});

// Comparison: prevProps.product vs nextProps.product
// Only re-renders if product object reference changes
```

**useMemo for JSX (almost never useful):**

```javascript
// ❌ ANTI-PATTERN: Memoizing JSX
function ProductList({ products }) {
  const productCards = useMemo(
    () => products.map(p => <ProductCard key={p.id} product={p} />),
    [products]
  );

  return <div className="grid">{productCards}</div>;
}

// Problem: Still creates virtual DOM elements
// React still diffs them
// No real benefit, adds complexity
```

**Why React.memo is better:**

```javascript
// ✅ GOOD: Let React handle optimization
function ProductList({ products }) {
  return (
    <div className="grid">
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

// ProductCard with React.memo handles its own memoization
// Simpler, more maintainable, just as performant
```

#### 4. Granular vs Coarse Memoization

**Coarse (one big useMemo):**

```javascript
// ❌ Recalculates everything if any dep changes
const result = useMemo(() => {
  const filtered = data.filter(filters);
  const sorted = filtered.sort(sort);
  const formatted = sorted.map(format);
  return formatted;
}, [data, filters, sort, format]);

// If sort changes: re-filters + re-sorts + re-formats (expensive!)
```

**Granular (multiple small useMemo):**

```javascript
// ✅ Only recalculates affected steps
const filtered = useMemo(
  () => data.filter(filters),
  [data, filters]
);

const sorted = useMemo(
  () => [...filtered].sort(sort),
  [filtered, sort]
);

const formatted = useMemo(
  () => sorted.map(format),
  [sorted, format]
);

// If sort changes: re-sorts + re-formats only (skips filtering!)
```

**Trade-off:**

| Approach | Overhead | Precision | Best For |
|----------|----------|-----------|----------|
| Coarse | Less useMemo calls | Recalculates more | Deps rarely change independently |
| Granular | More useMemo calls | Recalculates less | Deps change independently |

#### 5. Optimization Decision Framework

**Step 1: Measure first**

```javascript
// Use React DevTools Profiler
// 1. Record interaction
// 2. Check "Ranked" tab for slow components
// 3. Check "Flamegraph" for render cascade
// 4. Optimize ONLY the slowest components
```

**Step 2: Identify bottleneck type**

```javascript
// Type A: Expensive calculation in component
// Solution: useMemo

// Type B: Too many child re-renders
// Solution: React.memo + useCallback

// Type C: Massive list rendering
// Solution: Virtualization (react-window)

// Type D: Large component tree
// Solution: Code splitting (React.lazy)
```

**Step 3: Apply optimization**

```javascript
// Before:
function SlowComponent({ data, filter }) {
  const result = expensiveCalculation(data, filter); // 100ms
  return <div>{result}</div>;
}

// After (if calculation is the bottleneck):
function SlowComponent({ data, filter }) {
  const result = useMemo(
    () => expensiveCalculation(data, filter),
    [data, filter]
  );
  return <div>{result}</div>;
}

// Measure again:
// - If improved: Keep optimization ✅
// - If same: Remove optimization ❌
// - If worse: Remove optimization ❌
```

**Step 4: Performance budget**

```javascript
// Set targets for your app
const PERFORMANCE_BUDGET = {
  initialRender: 1000, // ms
  userInteraction: 100, // ms (RAIL model)
  componentRender: 16, // ms (60fps)
};

// Only optimize if exceeding budget
if (renderTime > PERFORMANCE_BUDGET.componentRender) {
  // Consider optimization
}
```

### 💬 Explain to Junior: Avoiding Common Mistakes

#### The "Optimization Trap" Story

Imagine you're organizing a library. You have two strategies:

**Strategy A (Premature optimization):**
Before anyone visits, you create elaborate indexes for every possible search: by color of book cover, by number of pages, by publication month, by author's birthday... You spend days creating these indexes.

**Strategy B (Measure first):**
You wait to see what people actually search for. 90% search by title or author. So you create ONLY those two indexes.

**Result:**
- Strategy A: Lots of work, most indexes never used, slower because more to maintain
- Strategy B: Minimal work, fast for actual use cases

**This is exactly like useMemo/useCallback:**

```javascript
// ❌ Strategy A: Memoize everything "just in case"
function Library({ books }) {
  const titles = useMemo(() => books.map(b => b.title), [books]);
  const authors = useMemo(() => books.map(b => b.author), [books]);
  const colors = useMemo(() => books.map(b => b.color), [books]); // Never used!
  const pageCount = useMemo(() => books.map(b => b.pages), [books]); // Never used!

  return <div>{titles.join(', ')}</div>; // Only uses titles!
}

// ✅ Strategy B: Memoize only what's needed
function Library({ books }) {
  const titles = books.map(b => b.title); // Fast enough without useMemo
  return <div>{titles.join(', ')}</div>;
}
```

#### Mistake 1: Missing Dependencies (The Frozen Value Bug)

**Simple analogy:**

You write a shopping list at home: "Buy milk, eggs, bread"
At the store, your friend calls: "Also get cheese!"
But you're looking at your old list... you don't see cheese.

**In code:**

```javascript
function ShoppingList() {
  const [items, setItems] = useState(['milk', 'eggs', 'bread']);

  // ❌ Creates list once, never updates
  const shoppingList = useMemo(() => {
    return items.join(', ');
  }, []); // Empty deps = frozen at first render!

  // User adds cheese: setItems([...items, 'cheese'])
  // But shoppingList still shows: "milk, eggs, bread"

  // ✅ Include items in dependencies
  const shoppingList = useMemo(() => {
    return items.join(', ');
  }, [items]); // Updates when items change
}
```

**How to catch this:**

1. **Use ESLint rule** (exhaustive-deps)
2. **Ask yourself:** "Does this use any value from outside?"
3. **Include ALL outside values in deps array**

#### Mistake 2: Object Dependencies (The New Box Problem)

**Simple analogy:**

You have two boxes with the same toy inside.
Are they the same box? **No!** (Even though the toy is identical)

**In code:**

```javascript
function ToyBox() {
  const [count, setCount] = useState(0);

  // ❌ New box every render (even though contents are same)
  const config = {
    color: 'red',
    size: 'large'
  };

  const result = useMemo(() => {
    return doSomething(config);
  }, [config]); // config is a NEW object every render!

  // React sees: oldConfig !== newConfig (different boxes)
  // So useMemo recalculates every time (memoization useless!)
}
```

**Visual explanation:**

```javascript
// Render 1:
const config1 = { color: 'red' }; // Box #1
// Render 2:
const config2 = { color: 'red' }; // Box #2

config1 === config2; // false (different boxes!)

// But:
const color1 = 'red';
const color2 = 'red';
color1 === color2; // true (same value)
```

**Solution:**

```javascript
// ✅ Option 1: Move outside component (same box every time)
const CONFIG = { color: 'red', size: 'large' };

function ToyBox() {
  const result = useMemo(() => {
    return doSomething(CONFIG);
  }, []); // CONFIG never changes
}

// ✅ Option 2: Memoize the object (create box once)
function ToyBox() {
  const config = useMemo(() => ({
    color: 'red',
    size: 'large'
  }), []); // Create once

  const result = useMemo(() => {
    return doSomething(config);
  }, [config]); // config is stable
}

// ✅ Option 3: Use primitive values (not boxes, just values)
function ToyBox() {
  const color = 'red';
  const size = 'large';

  const result = useMemo(() => {
    return doSomething({ color, size });
  }, [color, size]); // Primitives compared by value
}
```

#### Mistake 3: useCallback Without React.memo (The Wasted Effort)

**Simple analogy:**

You carefully wrap a gift in nice paper (useCallback).
But then you hand it to someone who immediately tears off the wrapper and throws it away (non-memoized child).

**In code:**

```javascript
// ❌ Wasted effort
function Parent() {
  // Carefully wrap the function
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  // Give to child who doesn't care about wrapper
  return <Child onClick={handleClick} />;
}

function Child({ onClick }) {
  // Child re-renders every time Parent re-renders anyway!
  return <button onClick={onClick}>Click</button>;
}

// useCallback did nothing useful here
```

**Solution:**

```javascript
// ✅ Useful when child appreciates the wrapper
function Parent() {
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return <MemoizedChild onClick={handleClick} />;
}

// Child wrapped with React.memo (appreciates stable reference)
const MemoizedChild = React.memo(({ onClick }) => {
  console.log('Child rendered'); // Only logs when onClick changes!
  return <button onClick={onClick}>Click</button>;
});
```

#### Mistake 4: Premature Optimization (The Over-Engineering)

**Simple analogy:**

Your car takes 10 minutes to reach the store.
You spend 5 hours installing a turbo engine to save 30 seconds.

**In code:**

```javascript
// ❌ Over-optimizing simple operations
function UserGreeting({ firstName, lastName }) {
  // Optimization: 0.01ms dependency check
  const fullName = useMemo(
    () => `${firstName} ${lastName}`,
    [firstName, lastName]
  );

  // Actual operation: 0.001ms string concatenation
  // Net result: 10x SLOWER with useMemo!

  return <div>Hello, {fullName}!</div>;
}

// ✅ Just do the simple thing
function UserGreeting({ firstName, lastName }) {
  const fullName = `${firstName} ${lastName}`;
  return <div>Hello, {fullName}!</div>;
}
```

**Rule of thumb for beginners:**

**DON'T optimize until:**
1. You notice the app is slow
2. You use React DevTools Profiler to measure
3. You find the actual slow part
4. You optimize THAT specific part
5. You measure again to confirm improvement

#### Interview Answer Templates

**Question: "What mistakes should you avoid with useMemo?"**

**Answer:**
"The most critical mistake is missing dependencies, which causes stale closure bugs where your memoized value uses old data. I always use the ESLint exhaustive-deps rule to catch this.

Another common mistake is premature optimization—adding useMemo to fast operations actually makes them slower due to the dependency checking overhead. I always profile with React DevTools first to confirm there's actually a performance problem worth solving.

Finally, using unstable dependencies like objects created inline defeats the purpose of memoization because React sees a new reference every render. I either move those outside the component, memoize them separately, or destructure them into primitive values."

**Question: "When should you NOT use useCallback?"**

**Answer:**
"I wouldn't use useCallback if the child component isn't wrapped with React.memo, because the child will re-render anyway when the parent renders, making the callback memoization pointless.

I also avoid it when the callback's dependencies change frequently—if they change every render, you're just adding overhead without any cache hits.

Finally, if the component itself rarely renders, the optimization overhead isn't worth it. I measure first with React DevTools to ensure the optimization actually helps before adding complexity."

#### Quick Debug Checklist

**When useMemo/useCallback isn't working:**

```javascript
// 1. Check dependencies
console.log('Dependencies:', { a, b, c });
// Are they changing when you expect?

// 2. Check reference equality
const obj1 = { a: 1 };
const obj2 = { a: 1 };
console.log(obj1 === obj2); // false - problem!

// 3. Check if memoization is hitting cache
const value = useMemo(() => {
  console.log('CALCULATING'); // Should only log when deps change
  return expensiveFunc();
}, [deps]);

// 4. Use React DevTools Profiler
// Record interaction → Check "Ranked" tab → Find slow components

// 5. Measure before and after
console.time('render');
// ... component logic
console.timeEnd('render');
```

**Remember:** Most components don't need optimization. Start simple, measure, then optimize only what's actually slow!

</details>
