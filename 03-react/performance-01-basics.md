# React Performance - Basics

> React performance fundamentals and optimization basics

---

## Question 1: React.memo and Performance Optimization

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Netflix

### Question
How does React.memo work? When should you use it?

### Answer

**React.memo** is a higher-order component that memoizes component rendering. It only re-renders if props change.

```jsx
// Without React.memo - re-renders every time parent renders
function ExpensiveComponent({ data }) {
  console.log('Rendering ExpensiveComponent');
  return <div>{/* expensive rendering */}</div>;
}

// With React.memo - only re-renders when data changes
const MemoizedComponent = React.memo(function ExpensiveComponent({ data }) {
  console.log('Rendering Memoized');
  return <div>{/* expensive rendering */}</div>;
});

// Custom comparison function
const MemoizedWithCustom = React.memo(
  ExpensiveComponent,
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.data.id === nextProps.data.id;
  }
);
```

**When to Use:**
- ✅ Pure functional components
- ✅ Expensive rendering
- ✅ Component renders often with same props
- ❌ Props change frequently
- ❌ Cheap/fast components
- ❌ Component always renders differently

### Resources
- [React Performance Optimization](https://react.dev/reference/react/memo)

---

<details>
<summary><strong>🔍 Deep Dive: React.memo Implementation</strong></summary>

React.memo implements a shallow comparison optimization at the component level, fundamentally changing how React's reconciliation algorithm decides whether to re-render a component. Understanding its internals reveals critical performance engineering principles.

**Internal Implementation Mechanism:**

When you wrap a component with React.memo, React creates a memoized version that intercepts the re-render process. Before executing the component function and creating new React elements, React.memo performs a shallow comparison of props:

```jsx
// React's internal logic (simplified)
function memo(Component, arePropsEqual) {
  return function MemoizedComponent(props) {
    const prevProps = usePrevious(props);

    if (prevProps && (arePropsEqual ? arePropsEqual(prevProps, props) : shallowEqual(prevProps, props))) {
      // Props haven't changed - reuse previous render result
      return previousRenderResult;
    }

    // Props changed - call component and cache result
    const result = Component(props);
    previousRenderResult = result;
    return result;
  };
}
```

**Shallow Comparison Deep Dive:**

The default comparison uses Object.is() for each prop, which has critical implications:

```jsx
// ❌ These will ALWAYS trigger re-render
const MemoComponent = React.memo(({ user, onClick, items }) => {
  return <div onClick={onClick}>{items.map(i => i.name)}</div>;
});

function Parent() {
  // New object reference every render
  const user = { name: 'John', age: 30 };

  // New function reference every render
  const handleClick = () => console.log('clicked');

  // New array reference every render
  const items = [{ name: 'Item 1' }, { name: 'Item 2' }];

  return <MemoComponent user={user} onClick={handleClick} items={items} />;
  // React.memo is USELESS here - always re-renders
}

// ✅ Proper stabilization with hooks
function Parent() {
  // Stable reference unless dependencies change
  const user = useMemo(() => ({ name: 'John', age: 30 }), []);

  // Stable function reference
  const handleClick = useCallback(() => console.log('clicked'), []);

  // Stable array reference
  const items = useMemo(() => [{ name: 'Item 1' }, { name: 'Item 2' }], []);

  return <MemoComponent user={user} onClick={handleClick} items={items} />;
  // Now React.memo prevents unnecessary re-renders
}
```

**Custom Comparison Functions:**

For complex props, you can provide a custom comparison function. This is where you control the re-render logic:

```jsx
const UserCard = React.memo(
  ({ user, metadata, onAction }) => {
    return (
      <div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <button onClick={onAction}>Action</button>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Return true to SKIP re-render, false to re-render
    // Compare only what matters for rendering
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.name === nextProps.user.name &&
      prevProps.user.email === nextProps.user.email
      // Intentionally ignore metadata and onAction changes
    );
  }
);
```

**Memory and Performance Trade-offs:**

React.memo introduces overhead that must be justified by prevented re-renders:

1. **Memory Cost:** Stores previous props and render output
2. **Comparison Cost:** Executes comparison function on every parent render
3. **Break-even Point:** Only beneficial if component's render cost > comparison cost

**Interaction with React's Fiber Architecture:**

React.memo operates at the Fiber node level. When React traverses the Fiber tree during reconciliation:

```
Parent Fiber (re-rendering)
    ↓
Child Fiber (React.memo wrapped)
    ↓
React.memo comparison executed
    ↓
If props equal: Reuse existing Fiber subtree (bailout)
If props different: Continue reconciliation into children
```

This "bailout" mechanism is React.memo's primary value - it prevents React from traversing entire subtrees, which can save thousands of comparisons in deep component trees.

**Advanced Pattern - Memoizing Context Consumers:**

```jsx
// ❌ Context consumers bypass React.memo
const ExpensiveChild = React.memo(({ data }) => {
  const theme = useContext(ThemeContext); // Re-renders on ANY context change
  return <div>{/* expensive render */}</div>;
});

// ✅ Split context consumption from expensive rendering
const ExpensiveChild = React.memo(({ data, theme }) => {
  return <div>{/* expensive render */}</div>;
});

function ContextBridge({ data }) {
  const theme = useContext(ThemeContext);
  return <ExpensiveChild data={data} theme={theme} />;
  // Now ExpensiveChild only re-renders when data OR theme change
}
```

**Profiling React.memo Effectiveness:**

Use React DevTools Profiler to measure impact:

```jsx
// Before React.memo: 145ms render time, renders on every parent update
// After React.memo: 145ms on first render, 0.1ms on subsequent (props unchanged)
// Savings: ~144.9ms per skipped render
```

React.memo is a precision tool for surgical optimization, not a blanket solution. Its effectiveness depends entirely on stable prop references and the cost-benefit ratio of comparison versus rendering.

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: E-commerce Performance Crisis</strong></summary>

**Production Crisis: E-commerce Product List Performance Collapse**

**Context:** A major e-commerce platform experienced severe performance degradation during Black Friday sales. Their product listing page rendered 50 product cards, and users reported 3-5 second lag when filtering or sorting products.

**Initial Metrics (Before Optimization):**

```
Page: Product Listing (50 items)
Interaction: Apply filter (change category)

Performance Metrics:
- Time to Interactive (TTI): 4,200ms
- Total Blocking Time (TBT): 2,800ms
- React DevTools Profiler:
  - ProductList component: 3,100ms
  - Each ProductCard render: 45-60ms
  - Total ProductCard renders: 50 cards × 60ms = 3,000ms
  - Re-renders on filter change: ALL 50 cards (unnecessary)

User Impact:
- 68% bounce rate on filter interactions
- 45% drop in conversion rate
- Customer complaints: "Page freezes when I filter"
```

**Root Cause Analysis:**

```jsx
// ❌ PROBLEMATIC CODE
function ProductList({ products, onAddToCart }) {
  const [filters, setFilters] = useState({ category: 'all', priceRange: 'all' });

  const filteredProducts = products.filter(p => {
    // Filtering logic
    return matchesFilters(p, filters);
  });

  return (
    <div>
      <FilterBar onFilterChange={setFilters} />
      {filteredProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          // Problem 1: onAddToCart is created inline in parent
          // Problem 2: ProductCard not memoized
          // Problem 3: product object reference changes on filter
        />
      ))}
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  // Expensive rendering: Image processing, price calculations, reviews
  const processedImage = processImage(product.image); // 15ms
  const priceDisplay = calculatePricing(product); // 10ms
  const reviewSummary = aggregateReviews(product.reviews); // 20ms

  return (
    <div className="product-card">
      <img src={processedImage} />
      <h3>{product.name}</h3>
      <p>{priceDisplay}</p>
      <ReviewStars summary={reviewSummary} />
      <button onClick={() => onAddToCart(product)}>Add to Cart</button>
    </div>
  );
}
```

**Debugging Process:**

Step 1: React DevTools Profiler revealed ALL 50 ProductCards re-rendered on every filter change, even though only the filtered products changed (not individual product data).

Step 2: Added console.log to ProductCard - confirmed excessive renders:
```
Filter change → 50 ProductCard renders (3,000ms)
Even products that didn't change data re-rendered
```

Step 3: Analyzed props with DevTools - discovered:
- `product` object reference changed due to `.filter()` creating new array
- `onAddToCart` function created fresh on every render
- No memoization anywhere

**Solution Implementation:**

```jsx
// ✅ OPTIMIZED CODE
function ProductList({ products, onAddToCart }) {
  const [filters, setFilters] = useState({ category: 'all', priceRange: 'all' });

  // Memoize filtered products to stabilize references
  const filteredProducts = useMemo(() => {
    return products.filter(p => matchesFilters(p, filters));
  }, [products, filters]);

  // Stabilize callback reference
  const handleAddToCart = useCallback((product) => {
    onAddToCart(product);
  }, [onAddToCart]);

  return (
    <div>
      <FilterBar onFilterChange={setFilters} />
      {filteredProducts.map(product => (
        <MemoizedProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}

// Memoize ProductCard with custom comparison
const MemoizedProductCard = React.memo(
  ProductCard,
  (prevProps, nextProps) => {
    // Only re-render if product data actually changed
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.product.stock === nextProps.product.stock &&
      prevProps.product.image === nextProps.product.image
      // Ignore onAddToCart changes - doesn't affect rendering
    );
  }
);

function ProductCard({ product, onAddToCart }) {
  // Memoize expensive computations
  const processedImage = useMemo(() => processImage(product.image), [product.image]);
  const priceDisplay = useMemo(() => calculatePricing(product), [product.price]);
  const reviewSummary = useMemo(() => aggregateReviews(product.reviews), [product.reviews]);

  return (
    <div className="product-card">
      <img src={processedImage} />
      <h3>{product.name}</h3>
      <p>{priceDisplay}</p>
      <ReviewStars summary={reviewSummary} />
      <button onClick={() => onAddToCart(product)}>Add to Cart</button>
    </div>
  );
}
```

**Post-Optimization Metrics:**

```
Same Interaction: Apply filter (change category)

Performance Metrics:
- Time to Interactive (TTI): 280ms (15x improvement)
- Total Blocking Time (TBT): 120ms (23x improvement)
- React DevTools Profiler:
  - ProductList component: 180ms
  - ProductCard renders: Only changed items (avg 5-10 cards)
  - Memoized cards: 0.1ms comparison time
  - Total render time: 5 cards × 50ms = 250ms (vs 3,000ms)

Business Impact:
- Bounce rate: 68% → 12% (82% reduction)
- Conversion rate: +38% recovery
- Customer satisfaction: 4.2 → 4.8 stars
- Revenue impact: $2.3M additional sales during Black Friday week
```

**Key Lessons Learned:**

1. **Measure First:** React DevTools Profiler revealed the exact problem (50 unnecessary renders)
2. **Stabilize References:** useMemo and useCallback are REQUIRED for React.memo to work
3. **Custom Comparisons:** Default shallow comparison wasn't enough - needed custom logic
4. **Selective Memoization:** Only memoized expensive components (ProductCard), not cheap ones (FilterBar)
5. **Validate Impact:** Post-optimization profiling confirmed 15x performance improvement

**Common Mistake During Fix:**

Initially, developers only added React.memo WITHOUT stabilizing callbacks:

```jsx
// ❌ Ineffective optimization
const MemoizedProductCard = React.memo(ProductCard);
// Still re-renders because onAddToCart prop changes every render
```

This taught the team: **React.memo is useless without stable prop references.** The combination of React.memo + useMemo + useCallback is what delivered the 15x performance gain.

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: When to Use React.memo</strong></summary>

**Decision Matrix: When to Use React.memo**

React.memo is not a free optimization - it introduces trade-offs that must be carefully evaluated. Here's a comprehensive decision framework:

**Trade-off #1: Memory vs CPU**

```jsx
// Without React.memo
function SimpleComponent({ name }) {
  return <div>{name}</div>; // 0.5ms render time
}
// Memory: ~0 bytes overhead
// CPU: 0.5ms per render
// Cost per render: 0.5ms

// With React.memo
const MemoizedSimple = React.memo(SimpleComponent);
// Memory: ~2KB (stores previous props + render result)
// CPU: 0.2ms comparison + 0.5ms render (first time)
// CPU: 0.2ms comparison only (subsequent, props unchanged)
// Cost per render: 0.2ms (cached) or 0.7ms (first render)
```

**Analysis:**
- **Break-even point:** React.memo saves time only if component re-renders >2 times with same props
- **For cheap components (<2ms):** React.memo overhead > benefit
- **For expensive components (>10ms):** React.memo provides significant savings

**Decision Rule:**
```
Use React.memo if:
  (Component render time × Expected re-renders with unchanged props) >
  (Comparison cost × Total parent re-renders)

Example:
  Component: 50ms render time
  Expected re-renders with same props: 8 times
  Comparison cost: 0.2ms
  Total parent re-renders: 10 times

  Benefit: 50ms × 8 = 400ms saved
  Cost: 0.2ms × 10 = 2ms comparison overhead
  Net savings: 398ms ✅ USE REACT.MEMO
```

**Trade-off #2: Code Complexity vs Performance**

```jsx
// ❌ Simple but slow
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <ExpensiveChild data="static" />
    </div>
  );
}
// ExpensiveChild re-renders on every count change (unnecessary)

// ✅ Complex but fast
function Parent() {
  const [count, setCount] = useState(0);
  const data = useMemo(() => "static", []); // Stabilize reference
  const MemoChild = useMemo(() => React.memo(ExpensiveChild), []); // Memoize component
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <MemoChild data={data} />
    </div>
  );
}
// ExpensiveChild skips re-renders, but code is harder to read/maintain
```

**Analysis:**
- **Code complexity:** +30-40% more code with memoization
- **Debugging difficulty:** Harder to track why components don't update
- **Team onboarding:** Junior developers may struggle with memoization patterns
- **Performance gain:** 80-95% reduction in unnecessary renders

**Decision Matrix:**
| Scenario | Use React.memo? | Rationale |
|----------|----------------|-----------|
| Internal tool (10 users) | ❌ No | Development speed > performance |
| Consumer app (1M users) | ✅ Yes | Performance affects revenue |
| Component renders <5ms | ❌ No | Comparison overhead > benefit |
| Component renders >20ms | ✅ Yes | Significant savings per skip |
| Team unfamiliar with memoization | ⚠️ Selectively | Only critical paths |
| High-traffic production app | ✅ Yes | Justify complexity with metrics |

**Trade-off #3: Default Comparison vs Custom Comparison**

```jsx
// Option A: Default shallow comparison
const MemoComponent = React.memo(Component);
// Pros: Simple, works for primitive props
// Cons: Breaks with object/array/function props
// Performance: Fast comparison (0.1-0.3ms)

// Option B: Custom deep comparison
const MemoComponent = React.memo(Component, (prev, next) => {
  return JSON.stringify(prev) === JSON.stringify(next);
});
// Pros: Handles complex props
// Cons: Expensive comparison (2-10ms for large objects)
// Performance: Slow comparison, defeats purpose

// Option C: Selective custom comparison
const MemoComponent = React.memo(Component, (prev, next) => {
  return prev.user.id === next.user.id && prev.config.theme === next.config.theme;
});
// Pros: Fast + accurate for specific use case
// Cons: Must manually maintain comparison logic
// Performance: Fast comparison (0.2-0.5ms)
```

**Decision Table:**

| Props Type | Recommended Approach | Comparison Cost | Skip Rate |
|------------|---------------------|----------------|-----------|
| Primitives only | Default shallow | 0.1ms | 90%+ |
| Objects/arrays (stable refs) | Default shallow | 0.1ms | 85%+ |
| Objects/arrays (unstable refs) | Custom selective | 0.5ms | 70%+ |
| Complex nested objects | useMemo props + default | 0.1ms | 90%+ |
| Functions | useCallback + default | 0.1ms | 90%+ |

**Trade-off #4: React.memo vs Component Architecture**

```jsx
// ❌ Band-aid solution: React.memo everywhere
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <MemoChild1 />
      <MemoChild2 />
      <MemoChild3 />
      {/* React.memo fixes symptoms, not root cause */}
    </div>
  );
}

// ✅ Better architecture: Split state
function Parent() {
  return (
    <div>
      <Counter /> {/* State isolated here */}
      <Child1 /> {/* No memoization needed */}
      <Child2 />
      <Child3 />
    </div>
  );
}

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}
```

**Analysis:**
- **React.memo approach:** Treats performance as afterthought
- **Architecture approach:** Prevents unnecessary re-renders by design
- **Best practice:** Use component composition first, React.memo as optimization second

**Trade-off #5: Client-Side vs Server Components (React 18+)**

```jsx
// Client Component with React.memo
'use client';
const MemoProduct = React.memo(ProductCard);
// Props serialized, sent to client, memoized there
// Bundle size: +15KB (React.memo runtime)
// Client CPU: Comparison cost on every render

// Server Component (no memoization needed)
async function ProductCard({ productId }) {
  const product = await db.query(`SELECT * FROM products WHERE id = ${productId}`);
  return <div>{product.name}</div>;
}
// Rendered once on server, HTML sent to client
// Bundle size: 0KB client impact
// Client CPU: 0 (no re-renders)
```

**Decision Framework:**

```
Should I use React.memo?

1. Is this a Server Component?
   → NO - Server Components don't re-render on client

2. Does component render >10ms?
   → NO - Overhead > benefit

3. Does component re-render often with same props?
   → NO - No savings to gain

4. Can I stabilize prop references (useMemo/useCallback)?
   → NO - React.memo won't help

5. Have I profiled the impact?
   → NO - Profile first, optimize after

If all answers are YES → Use React.memo
```

**Real-World Trade-off Example:**

A SaaS dashboard had 200 components. Adding React.memo everywhere:
- **Dev time:** +40 hours
- **Code complexity:** +35%
- **Performance gain:** +2% (most components were cheap)

After profiling and selective optimization:
- **Dev time:** +8 hours
- **Code complexity:** +5%
- **Performance gain:** +18% (targeted 10 expensive components)

**Conclusion:** Selective React.memo (based on profiling) delivers better ROI than blanket application.

</details>

---

<details>
<summary><strong>💬 Explain to Junior: React.memo in Simple Terms</strong></summary>

**Simple Explanation:**

Imagine you're a teacher grading math homework. You have 30 students, and you need to grade their assignments every day.

**Without React.memo (Always Re-grading):**

Every day, you grade ALL 30 assignments, even if some students submitted the exact same homework as yesterday. This takes a lot of time and energy.

```jsx
// Every time parent re-renders, this child re-renders too
function Student({ homework }) {
  console.log("Grading homework..."); // This runs EVERY TIME
  return <div>{homework.answer}</div>;
}
```

**With React.memo (Smart Grading):**

You check each student's homework against yesterday's. If it's identical, you just copy yesterday's grade. You only re-grade if the homework actually changed.

```jsx
// Only re-renders if homework prop changes
const Student = React.memo(function({ homework }) {
  console.log("Grading homework..."); // Only runs when homework changes
  return <div>{homework.answer}</div>;
});
```

**The Analogy in Code:**

```jsx
function Classroom() {
  const [teacherMood, setTeacherMood] = useState("happy");

  const homeworkData = { question: "What is 2+2?", answer: "4" };

  return (
    <div>
      <button onClick={() => setTeacherMood("tired")}>Change Mood</button>
      <p>Teacher is {teacherMood}</p>
      <Student homework={homeworkData} />
      {/* Without React.memo: Student re-renders when teacher's mood changes
          With React.memo: Student doesn't re-render (homework didn't change) */}
    </div>
  );
}
```

**But There's a Catch! (The Reference Problem)**

Here's where beginners get confused:

```jsx
// ❌ React.memo doesn't help here
function Classroom() {
  const [teacherMood, setTeacherMood] = useState("happy");

  // This creates a NEW object every render (even if values are same)
  const homeworkData = { question: "What is 2+2?", answer: "4" };

  return <Student homework={homeworkData} />;
  // React.memo sees NEW object reference → thinks homework changed → re-renders anyway!
}

// ✅ Fix: Use useMemo to keep same reference
function Classroom() {
  const [teacherMood, setTeacherMood] = useState("happy");

  // This keeps the SAME object reference unless dependencies change
  const homeworkData = useMemo(
    () => ({ question: "What is 2+2?", answer: "4" }),
    [] // Empty array = never changes
  );

  return <Student homework={homeworkData} />;
  // Now React.memo works! Same reference → skip re-render
}
```

**Real-World Example: Product List**

Imagine Amazon's product listing page:

```jsx
// Without React.memo: Filtering products re-renders ALL 100 product cards
function ProductList({ products }) {
  const [filter, setFilter] = useState("all");

  return (
    <div>
      <FilterButton onClick={() => setFilter("electronics")} />
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
        // Filter change → ALL 100 cards re-render (3 seconds delay!)
      ))}
    </div>
  );
}

// With React.memo: Only changed cards re-render
const ProductCard = React.memo(function({ product }) {
  return <div>{product.name}</div>;
});
// Filter change → Only relevant cards update (0.2 seconds!)
```

**When Should You Use React.memo? (Simple Rules)**

1. ✅ **Component is slow to render** (>10 milliseconds)
   ```jsx
   // This renders a complex chart - expensive!
   const Chart = React.memo(ComplexChart);
   ```

2. ✅ **Component re-renders often with same data**
   ```jsx
   // User types in search box → Parent re-renders → FAQ section unchanged
   const FAQ = React.memo(FAQSection);
   ```

3. ✅ **Component is deep in the tree**
   ```jsx
   // Deeply nested component gets many unnecessary updates from ancestors
   const DeepChild = React.memo(NestedComponent);
   ```

4. ❌ **Component is fast** (<2 milliseconds)
   ```jsx
   // Just displays text - super fast, don't bother
   function SimpleText({ text }) {
     return <p>{text}</p>;
   }
   ```

5. ❌ **Props change every render**
   ```jsx
   // Timer updates every second - memoization useless
   function Clock({ time }) {
     return <div>{time}</div>; // time prop changes constantly
   }
   ```

**Interview Answer Template:**

> "React.memo is a higher-order component that prevents unnecessary re-renders by memoizing the component's output. It works by comparing the previous props with the new props using shallow comparison. If they're the same, React reuses the previous render result instead of re-rendering the component.
>
> I use React.memo when a component is expensive to render and often receives the same props. For example, in a product listing, I wrapped ProductCard with React.memo because the card renders complex images and reviews, which takes about 50 milliseconds. When users filter products, only the affected cards re-render instead of all 100 cards, reducing render time from 5 seconds to 0.5 seconds.
>
> However, React.memo only works if props have stable references. I combine it with useMemo for objects and useCallback for functions to ensure props don't get new references on every render. Without stable references, React.memo is ineffective because the shallow comparison will always fail.
>
> I avoid using React.memo on fast components or components where props change frequently, because the comparison overhead can actually make performance worse. I always profile with React DevTools to measure the actual impact before and after adding memoization."

**Common Mistakes Beginners Make:**

```jsx
// ❌ Mistake 1: Using React.memo without stabilizing props
const Child = React.memo(ExpensiveChild);
function Parent() {
  const data = { value: 10 }; // New object every render!
  return <Child data={data} />; // React.memo useless
}

// ✅ Fix: Stabilize with useMemo
function Parent() {
  const data = useMemo(() => ({ value: 10 }), []);
  return <Child data={data} />; // Now React.memo works
}

// ❌ Mistake 2: Memoizing everything (over-optimization)
const Button = React.memo(SimpleButton); // Button renders in 0.5ms
const Text = React.memo(SimpleText);     // Text renders in 0.3ms
const Icon = React.memo(SimpleIcon);     // Icon renders in 0.4ms
// Comparison overhead > render time = SLOWER!

// ✅ Fix: Only memoize expensive components
const ExpensiveChart = React.memo(Chart); // Chart renders in 50ms ✅
// Leave cheap components unmemoized
```

**Key Takeaway:**

React.memo is like having a smart assistant who checks "Did anything actually change?" before doing expensive work. But the assistant needs stable information to compare - that's where useMemo and useCallback come in. Use it strategically on slow components, not everywhere.

</details>

---

