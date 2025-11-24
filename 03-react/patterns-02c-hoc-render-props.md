# React HOC and Render Props - Part C

> Advanced component patterns continued

---

## Question 1: Layout Components Pattern

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 7 minutes
**Companies:** Design system teams

### Question
What are Layout Components? How do they help with consistent UI structure?

### Answer

**Layout Components** - Generic components that handle spacing, alignment, and structure without knowing content.

**Key Points:**
1. **Separation** - Layout vs content
2. **Reusable** - Consistent spacing
3. **Composable** - Stack, Inline, Center, etc.
4. **Prop-driven** - Spacing, alignment via props
5. **Common in** - Design systems

### Code Example

```jsx
// Layout Components Pattern
// Generic layout components for consistent structure
function Stack({ spacing = 4, children }) {
  return (
    <div className={`flex flex-col gap-${spacing}`}>
      {children}
    </div>
  );
}

function Inline({ spacing = 4, children }) {
  return (
    <div className={`flex flex-row gap-${spacing}`}>
      {children}
    </div>
  );
}

function Center({ children }) {
  return (
    <div className="flex items-center justify-center h-full">
      {children}
    </div>
  );
}

// Usage - Composable layouts
<Stack spacing={6}>
  <h1>Title</h1>
  <Inline spacing={2}>
    <button>Save</button>
    <button>Cancel</button>
  </Inline>
  <Center>
    <p>Centered content</p>
  </Center>
</Stack>
```

### 🔍 Deep Dive

**Layout Components Architecture and Design System Philosophy:**

Layout components represent a fundamental shift in how we think about UI composition. Rather than coupling layout concerns (spacing, alignment, stacking) with content, this pattern separates them into generic, reusable primitives. This approach originated from design systems like Theme UI, Chakra UI, and Braid Design System, where consistency and maintainability are paramount.

**Core Architectural Principles:**

The layout component pattern is built on several key principles. First, **single responsibility** - each component handles one layout concern (Stack for vertical spacing, Inline for horizontal, Center for centering, Box for general container). Second, **prop-driven configuration** - spacing, alignment, and other layout properties are controlled via props, not CSS classes. Third, **composition over configuration** - complex layouts are built by composing simple primitives rather than creating monolithic layout components.

**Implementation Deep Dive:**

A sophisticated layout system goes far beyond simple spacing. Consider a production-grade Stack component:

```jsx
// Advanced Stack implementation
function Stack({
  spacing = 4,
  align = 'stretch', // 'start', 'center', 'end', 'stretch'
  justify = 'start', // 'start', 'center', 'end', 'between', 'around'
  dividers = false,
  as = 'div',
  children
}) {
  const childArray = React.Children.toArray(children);

  return React.createElement(
    as,
    {
      className: `stack`,
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: align,
        justifyContent: justify,
        gap: `var(--space-${spacing})` // Uses design tokens
      }
    },
    dividers
      ? childArray.flatMap((child, i) =>
          i < childArray.length - 1
            ? [child, <Divider key={`divider-${i}`} />]
            : [child]
        )
      : children
  );
}
```

This implementation demonstrates several advanced features. The `as` prop enables polymorphism (render as different HTML elements), spacing uses design tokens for consistency, and dividers can be automatically inserted between children. The `React.Children` API ensures proper handling of dynamic children.

**CSS-in-JS vs Utility Classes:**

Layout components can be implemented with different styling approaches. CSS-in-JS libraries like styled-components provide dynamic styling:

```jsx
import styled from 'styled-components';

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.space[props.spacing]};
  align-items: ${props => props.align};
`;
```

Utility-first frameworks like Tailwind use class composition, though this can lead to issues with dynamic values (Tailwind JIT solves this). Modern approaches use CSS custom properties for maximum flexibility without runtime overhead.

**Advanced Layout Primitives:**

Beyond basic Stack/Inline, production design systems include sophisticated layout components. **Grid** handles 2D layouts with responsive columns, **Cluster** wraps items with configurable spacing, **Sidebar** creates flexible sidebar layouts, **Cover** centers content vertically with optional header/footer, and **Switcher** switches between horizontal and vertical based on available space.

**Type Safety and Developer Experience:**

TypeScript makes layout components more robust:

```typescript
interface StackProps {
  spacing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  dividers?: boolean;
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
}
```

Restricting spacing to specific values ensures consistency with your design system. This prevents arbitrary spacing values and enforces design constraints.

**React Server Components Consideration:**

Layout components are perfect candidates for Server Components since they're purely presentational with no client-side interactivity. This reduces JavaScript bundle size and improves performance. Mark them with `'use server'` directive in Next.js 13+ App Router.

### 🐛 Real-World Scenario

**Production Case Study: Design System Migration at E-Commerce Platform (2023)**

**Context:** A large e-commerce platform with 150+ developers had accumulated 2,500+ unique spacing values across their codebase (`margin: 17px`, `padding: 23px`, etc.). This inconsistency hurt visual quality and made redesigns nearly impossible. They migrated to a layout component system.

**Problem Metrics:**
- **2,500+ unique spacing values** across CSS files
- **45 different font sizes** (design system specified 8)
- **Developer velocity:** 30% of PR comments about spacing inconsistencies
- **Design handoff time:** 2-3 hours per screen mocking up spacing variations
- **Bundle size:** 85KB of CSS, 40% was spacing-related utilities

**Implementation Timeline (8 weeks):**

**Week 1-2: Design Token System**
```jsx
// theme.js - Single source of truth
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',    // 16px
  6: '1.5rem',  // 24px
  8: '2rem',    // 32px
  10: '2.5rem', // 40px
  12: '3rem',   // 48px
  16: '4rem'    // 64px
};
```

**Week 3-4: Core Layout Components**
```jsx
// Stack.jsx
export function Stack({ spacing = 4, children, ...props }) {
  return (
    <div
      className="stack"
      style={{ '--stack-spacing': `var(--space-${spacing})` }}
      {...props}
    >
      {children}
    </div>
  );
}
// stack.css
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--stack-spacing);
}
```

They created Stack, Inline, Grid, Cluster, Box, and Center - six primitives covering 95% of layout needs.

**Week 5-6: Automated Migration**

They wrote codemods to automatically migrate simple cases:

```jsx
// Before
<div className="flex flex-col space-y-4">
  <Header />
  <Content />
</div>

// After (automated codemod)
<Stack spacing={4}>
  <Header />
  <Content />
</Stack>
```

The codemod migrated **1,200 components automatically** (40% of codebase). Remaining 60% required manual review due to complex spacing logic.

**Week 7-8: Manual Migration + Documentation**

Developers manually migrated complex components with guidance from the design systems team. They created comprehensive documentation with before/after examples and migration guides.

**Results After 6 Months:**

**Bundle Size Impact:**
- CSS bundle: **85KB → 38KB** (55% reduction)
- Eliminated 2,000+ duplicate spacing declarations
- Gzip compression improved from 62% to 78% (more repetition)

**Developer Velocity:**
- PR review time: **-40%** (fewer spacing discussions)
- Design handoff: **2-3 hours → 20 minutes** (designers specify spacing tokens)
- New feature development: **+25% faster** (no spacing decisions needed)

**Visual Consistency:**
- Spacing values: **2,500 → 10** (design tokens only)
- Font sizes: **45 → 8** (design system enforced)
- Design QA failures: **-70%** (automated consistency)

**Accessibility Improvements:**
- Improved semantic HTML usage (using `as` prop appropriately)
- Better screen reader navigation (logical document structure)
- Keyboard navigation improved (focus management in Cluster components)

**Unexpected Benefits:**

1. **Responsive design simplified:** Spacing tokens included responsive values
```jsx
// Responsive spacing via design tokens
const spacing = {
  4: 'clamp(0.75rem, 2vw, 1rem)' // Fluid between 12px-16px
};
```

2. **Dark mode support:** Layout components integrated with theme context
```jsx
<Stack spacing={4} dividers> {/* Dividers respect theme */}
```

3. **Component library portability:** Layout components became a standalone package used across 4 internal projects

**Challenges Encountered:**

1. **Dynamic spacing:** Some components needed computed spacing (e.g., based on content length). Solution: Added `spacingMultiplier` prop for edge cases.

2. **Legacy CSS specificity:** Old CSS conflicted with layout components. Solution: Used CSS layers (`@layer`) to control specificity.

3. **Team adoption:** Some developers resisted "yet another abstraction." Solution: Showed bundle size metrics and developer velocity improvements in retrospective.

**Key Debugging Scenario:**

During migration, they found layout shifts (CLS) increased by 0.15. Investigation revealed:

```jsx
// ❌ Problem: Gap not supported in IE11, polyfill caused reflow
.stack { gap: var(--spacing); }

// ✅ Solution: Feature detection + fallback
.stack > * + * {
  margin-top: var(--spacing); /* Fallback */
}

@supports (gap: 1rem) {
  .stack { gap: var(--spacing); }
  .stack > * + * { margin-top: 0; }
}
```

This reduced CLS back to baseline levels.

### ⚖️ Trade-offs

**Layout Components vs Alternative Approaches:**

**1. Layout Components vs Utility Classes (Tailwind, Bootstrap)**

**Layout Components Advantages:**
- **Enforced consistency:** Only valid spacing values via props (TypeScript-enforced)
- **Semantics:** `<Stack>` conveys intent better than `flex flex-col gap-4`
- **Refactoring safety:** Change Stack implementation without touching consumers
- **Bundle size:** Smaller with many repeated layouts (one Stack class vs many utility classes)
- **Learning curve:** Junior developers understand `<Stack spacing={4}>` instantly

**Utility Classes Advantages:**
- **No abstraction:** Direct mapping to CSS, easier debugging
- **Speed:** Faster initial development (no component creation needed)
- **Flexibility:** Easier to break consistency when truly needed
- **Tooling:** Excellent editor autocomplete and IntelliSense
- **Community:** Huge ecosystem and examples available

**Decision Matrix:**

| Factor | Layout Components | Utility Classes | Winner |
|--------|------------------|-----------------|--------|
| Consistency enforcement | Strong (prop types) | Weak (arbitrary values) | Layout Components |
| Initial development speed | Slower (create components) | Faster (apply classes) | Utilities |
| Long-term maintenance | Easier (change one place) | Harder (find/replace all) | Layout Components |
| Bundle size (large app) | Smaller (shared classes) | Larger (many utilities) | Layout Components |
| Flexibility | Lower (prop constraints) | Higher (any CSS value) | Utilities |
| Type safety | Excellent (TypeScript) | Good (class variants) | Layout Components |

**Recommendation:** Use layout components for design systems and large applications (50+ developers). Use utility classes for MVPs, prototypes, and small teams where speed matters more than consistency.

**2. Layout Components vs CSS Grid/Flexbox Directly**

**Layout Components Advantages:**
- **Abstraction:** Hide CSS complexity from product developers
- **Consistency:** Centralized layout logic
- **Responsive defaults:** Built-in responsive behavior
- **Cross-browser:** Abstract browser differences
- **Semantic naming:** Stack/Inline vs flex-direction values

**Direct CSS Advantages:**
- **Performance:** No React component overhead
- **Flexibility:** Full CSS power available
- **Debugging:** Browser DevTools show actual CSS
- **Standard knowledge:** CSS skills transfer across frameworks
- **No lock-in:** Not tied to component library

**When to Use Each:**

```jsx
// ✅ Layout components: Consistent repeated patterns
<Stack spacing={4}>
  <Card />
  <Card />
  <Card />
</Stack>

// ✅ Direct CSS: Unique complex layouts
<div className="product-grid">
  {/* CSS Grid with named areas, custom gaps, etc. */}
</div>

// ❌ Over-abstraction: Don't create components for one-off layouts
<ComplexCustomLayoutThatOnlyExistsOnce>...</>
```

**3. Layout Components vs Compound Components**

**Layout Components:**
- Simple, single-purpose primitives
- No shared state between children
- Focused on spacing/alignment only
- Example: Stack, Inline, Grid

**Compound Components:**
- Complex components with shared state
- Children communicate via context
- Handle both layout AND behavior
- Example: Tabs, Accordion, Menu

**Hybrid Approach:**

```jsx
// Compound component for behavior
<Tabs>
  <TabList>
    <Tab>Tab 1</Tab>
    <Tab>Tab 2</Tab>
  </TabList>

  {/* Layout components for spacing */}
  <TabPanels>
    <TabPanel>
      <Stack spacing={4}>
        <Content1 />
        <Content2 />
      </Stack>
    </TabPanel>
  </TabPanels>
</Tabs>
```

**4. Implementation Trade-offs:**

**CSS-in-JS vs CSS Modules vs Utility Classes:**

```jsx
// CSS-in-JS (styled-components): Runtime overhead, dynamic styling
const Stack = styled.div`
  gap: ${p => p.theme.space[p.spacing]};
`;
// +: Dynamic theming, scoped styles
// -: Runtime cost, larger bundle, Flash of Unstyled Content risk

// CSS Modules: Zero runtime, static
<div className={styles.stack} style={{ gap: spacing[props.spacing] }}>
// +: Zero runtime, excellent performance
// -: Less dynamic, need CSS variables for theming

// Inline styles: Maximum flexibility
<div style={{ display: 'flex', gap: spacing }}>
// +: No build step, truly dynamic
// -: No pseudo-selectors, media queries
```

**Recommendation Decision Tree:**

```
Need dynamic theming?
├─ Yes → CSS-in-JS (styled-components, Emotion)
└─ No
   ├─ Need server components?
   │  └─ Yes → CSS Modules + CSS Variables
   └─ Small app? → Inline styles acceptable
```

**5. Performance Trade-offs:**

**Component Wrapper Overhead:**

Every layout component adds a DOM node. For deeply nested layouts:

```jsx
// ❌ Excessive nesting: 5 extra DOM nodes
<Stack>
  <Inline>
    <Stack>
      <Center>
        <Box><Content /></Box>
      </Center>
    </Stack>
  </Inline>
</Stack>

// ✅ Flatten where possible: 2 extra nodes
<Stack>
  <Inline align="center">
    <Content />
  </Inline>
</Stack>
```

**Measurement:** In a dashboard with 200 layout components, flattening reduced DOM nodes by 35% (1,200 → 780) and improved First Contentful Paint by 80ms.

**Recommendation:** Balance semantic clarity with performance. Use React DevTools Profiler to identify excessive nesting.

### 💬 Explain to Junior

**The Restaurant Kitchen Analogy:**

Imagine you're organizing a restaurant kitchen. Without layout components, every chef creates their own spacing system:

- Chef A: "I put 3 inches between cutting boards"
- Chef B: "I use 7.5 inches"
- Chef C: "I put them touching, no space"

This chaos makes the kitchen inefficient and ugly. Layout components are like standardized kitchen layouts:

- **Stack (vertical arrangement):** Like a shelf system with fixed spacing between shelves. You can choose shelf height (spacing prop), but it's always one of the standard sizes (4", 8", 12", etc.). Everything lines up perfectly.

- **Inline (horizontal arrangement):** Like a spice rack with evenly spaced jars. You decide spacing, but it's consistent across all jars.

- **Center:** Like a plate presentation template that ensures the main dish is always centered, no matter its size.

**Why This Matters:**

```jsx
// ❌ Without layout components: Chaos
<div style={{ marginBottom: '17px' }}>Header</div>
<div style={{ marginBottom: '23px' }}>Content</div>
<div style={{ marginBottom: '19px' }}>Footer</div>
// Every developer picks random spacing!

// ✅ With layout components: Consistency
<Stack spacing={4}>
  <Header />
  <Content />
  <Footer />
</Stack>
// Everyone uses the same spacing system!
```

**Key Concepts for Juniors:**

1. **Separation of Concerns:**
   - Layout components handle **where things go**
   - Content components handle **what things are**
   - Never mix layout and content in one component

2. **Composition:**
   - Build complex layouts from simple primitives
   - Like LEGO blocks - combine simple pieces for complex structures

3. **Props as Configuration:**
   - Props control behavior without changing code
   - `spacing={4}` vs `spacing={6}` - same component, different result

**Common Junior Mistakes:**

```jsx
// ❌ Mistake 1: Creating layout-specific components
function UserCardWithSpacing() {
  return <div style={{ marginBottom: '20px' }}><UserCard /></div>;
}

// ✅ Better: Use layout components
<Stack spacing={5}>
  <UserCard />
  <UserCard />
</Stack>

// ❌ Mistake 2: Nesting too deeply
<Stack><Stack><Stack><Content /></Stack></Stack></Stack>

// ✅ Better: One level usually enough
<Stack spacing={4}>
  <Content />
  <Content />
</Stack>

// ❌ Mistake 3: Using arbitrary spacing
<Stack spacing={7}> {/* 7 doesn't exist in design system! */}

// ✅ Better: Use design tokens
<Stack spacing={6}> {/* 6 = 24px, valid token */}
```

**Interview Answer Template:**

**Question:** "Explain layout components and why they're useful."

**Answer Structure:**

"Layout components are reusable primitives that handle spacing, alignment, and structure without knowing about content. They solve three main problems:

**First, consistency.** Without them, developers create thousands of unique spacing values. With layout components, we enforce design system constraints through props - you can only use spacing values that exist in the design system.

**Second, maintainability.** If we change our spacing system from 8px base to 4px base, we update the Stack component once instead of finding and replacing thousands of CSS declarations.

**Third, developer experience.** Junior developers can build consistent UIs without learning Flexbox or Grid deeply. `<Stack spacing={4}>` is self-documenting - anyone knows it stacks items vertically with spacing 4.

**Common layout primitives include:**
- **Stack** for vertical spacing
- **Inline** for horizontal spacing
- **Grid** for 2D layouts
- **Center** for centering content

**In production at [company]**, we saw a 55% CSS bundle reduction and 40% fewer PR review comments about spacing after migrating to layout components. The key is balancing abstraction with flexibility - provide escape hatches for truly custom layouts.

**Trade-offs to consider:** Layout components add DOM nodes (performance cost) and reduce flexibility (can't use arbitrary spacing). They're worth it for large teams and design systems but might be overkill for small projects or MVPs.

**Example use case:** Building a form layout:

```jsx
<Stack spacing={6}>
  <Heading>User Profile</Heading>
  <Stack spacing={4}>
    <Input label='Name' />
    <Input label='Email' />
  </Stack>
  <Inline spacing={2}>
    <Button>Save</Button>
    <Button variant='outline'>Cancel</Button>
  </Inline>
</Stack>
```

This creates a consistent, maintainable layout without writing any CSS. Different spacing for the heading (6) vs form fields (4) vs buttons (2) follows our design system hierarchy."

**Difficulty Adaptation:**
- **Junior role:** Focus on what/why, simple examples
- **Mid-level role:** Add trade-offs, bundle size impact, migration strategies
- **Senior role:** Discuss design system architecture, CSS-in-JS vs modules, performance measurements, team adoption challenges

---

## Question 2: Props Collection Pattern

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 6 minutes
**Companies:** Hook libraries

### Question
What is the Props Collection pattern? How does it simplify component APIs?

### Answer

**Props Collection** - Return a collection of props from a hook that can be spread onto elements.

**Key Points:**
1. **Convenience** - Bundle related props
2. **Consistency** - All needed props together
3. **Simplicity** - User spreads one object
4. **Limited flexibility** - Can't override easily
5. **Common in** - Form libraries

### Code Example

```jsx
// Props Collection Pattern
function useCheckbox() {
  const [checked, setChecked] = useState(false);

  // Collect all props needed for checkbox
  const checkboxProps = {
    type: 'checkbox',
    checked,
    onChange: (e) => setChecked(e.target.checked)
  };

  return { checked, checkboxProps };
}

// Usage
function MyCheckbox() {
  const { checked, checkboxProps } = useCheckbox();

  return (
    <label>
      <input {...checkboxProps} />
      {checked ? 'Checked' : 'Unchecked'}
    </label>
  );
}
```

### 🔍 Deep Dive

**Props Collection Pattern Architecture:**

The Props Collection pattern emerged as custom hooks became the standard for sharing stateful logic in React. Instead of returning individual values that users must wire up manually, this pattern returns pre-configured objects of props that can be spread directly onto elements. It's a convenience pattern that reduces boilerplate and ensures correct prop wiring.

**Core Concept:**

The pattern bundles related props together into a single object:

```jsx
// Without props collection (manual wiring)
function useCheckbox() {
  const [checked, setChecked] = useState(false);
  return { checked, setChecked };
}

function Manual() {
  const { checked, setChecked } = useCheckbox();
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
}

// With props collection (automatic wiring)
function useCheckbox() {
  const [checked, setChecked] = useState(false);
  const checkboxProps = {
    type: 'checkbox',
    checked,
    onChange: (e) => setChecked(e.target.checked)
  };
  return { checked, checkboxProps };
}

function Automatic() {
  const { checkboxProps } = useCheckbox();
  return <input {...checkboxProps} />; // Clean, simple!
}
```

**Advanced Implementation:**

Production-grade props collections handle multiple scenarios:

```jsx
function useInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  // Input props collection
  const inputProps = {
    value,
    onChange: (e) => setValue(e.target.value),
    onBlur: () => {
      setTouched(true);
      setFocused(false);
    },
    onFocus: () => setFocused(true)
  };

  // Label props collection (for a11y)
  const labelProps = {
    htmlFor: useId() // React 18 useId for unique IDs
  };

  // Container props collection
  const containerProps = {
    'data-focused': focused,
    'data-touched': touched
  };

  const reset = () => {
    setValue(initialValue);
    setTouched(false);
    setFocused(false);
  };

  return {
    value,
    touched,
    focused,
    inputProps,
    labelProps,
    containerProps,
    reset
  };
}

// Usage - Multiple prop collections working together
function FormField({ label }) {
  const { inputProps, labelProps, containerProps, touched } = useInput('');

  return (
    <div {...containerProps} className="field">
      <label {...labelProps}>{label}</label>
      <input {...inputProps} />
      {touched && <span>Field touched</span>}
    </div>
  );
}
```

**Why Props Collections Over Individual Props:**

1. **Convenience:** One spread instead of many individual props
2. **Consistency:** All required props included, impossible to forget one
3. **Accessibility:** Can bundle ARIA attributes automatically
4. **Discoverability:** TypeScript IntelliSense shows all available props at once
5. **Maintenance:** Add new props to collection without breaking consumers

**TypeScript Integration:**

Props collections shine with TypeScript:

```typescript
interface UseCheckboxReturn {
  checked: boolean;
  toggle: () => void;
  checkboxProps: {
    type: 'checkbox';
    checked: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    'aria-checked': boolean;
  };
}

function useCheckbox(initialChecked = false): UseCheckboxReturn {
  const [checked, setChecked] = useState(initialChecked);

  const checkboxProps = useMemo(() => ({
    type: 'checkbox' as const,
    checked,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setChecked(e.target.checked),
    'aria-checked': checked
  }), [checked]);

  const toggle = useCallback(() => setChecked(prev => !prev), []);

  return { checked, toggle, checkboxProps };
}
```

The `useMemo` optimization prevents recreating the props object on every render, important for performance in large forms.

**Limitations and When NOT to Use:**

The Props Collection pattern has a critical limitation: **users can't easily override individual props**. If someone needs to customize the `onChange` handler, they have to completely reconstruct the object:

```jsx
// ❌ Hard to override individual props
const { checkboxProps } = useCheckbox();
return (
  <input
    {...checkboxProps}
    onChange={(e) => {
      checkboxProps.onChange(e); // Must manually call original
      console.log('Custom logic'); // Then add custom logic
    }}
  />
);
```

This limitation led to the **Props Getters pattern** (next question), which solves this problem by returning functions instead of objects.

**Real-World Usage:**

Props collections are common in:
- **React Hook Form:** `register()` returns props collections
- **Downshift:** `getInputProps()` (though it's technically a getter)
- **React Aria:** Many hooks return props collections for accessibility
- **Form libraries:** Formik, Final Form use this pattern extensively

**Performance Considerations:**

Creating new object references on every render can cause unnecessary re-renders if props are compared with `React.memo`:

```jsx
// ❌ New object every render = re-render even if values unchanged
function useCheckbox() {
  const [checked, setChecked] = useState(false);
  return {
    checkboxProps: { // New object reference!
      type: 'checkbox',
      checked,
      onChange: (e) => setChecked(e.target.checked)
    }
  };
}

// ✅ Memoized object = stable reference
function useCheckbox() {
  const [checked, setChecked] = useState(false);
  const checkboxProps = useMemo(() => ({
    type: 'checkbox',
    checked,
    onChange: (e) => setChecked(e.target.checked)
  }), [checked]); // Only recreate when checked changes

  return { checkboxProps };
}
```

For most cases, the performance impact is negligible, but in large forms (50+ fields), memoization matters.

### 🐛 Real-World Scenario

**Production Case Study: Form Library Performance at SaaS Platform (2023)**

**Context:** A B2B SaaS platform built a custom form library using props collections for 200+ forms across their application. Initially launched without optimization, they encountered performance issues as forms grew more complex.

**Problem Discovery:**

Engineers noticed forms with 30+ fields felt "sluggish" - typing had visible delay. React DevTools Profiler revealed the culprit:

**Profiler Metrics:**
- **30-field form typing in text input:**
  - Total render time: **180ms per keystroke** (target: <16ms)
  - Components re-rendered: **All 30 fields** (should be 1)
  - Reason: Non-memoized props collections creating new object references

**Root Cause Analysis:**

```jsx
// ❌ Original implementation (problematic)
function useFormField(name) {
  const { values, setFieldValue, errors } = useFormContext();

  // NEW OBJECT EVERY RENDER - BREAKS REACT.MEMO
  const inputProps = {
    name,
    value: values[name],
    onChange: (e) => setFieldValue(name, e.target.value),
    'aria-invalid': !!errors[name]
  };

  return { inputProps, error: errors[name] };
}

// Field component wrapped with React.memo
const TextField = React.memo(({ label, ...props }) => {
  const { inputProps, error } = useFormField(props.name);
  console.log('TextField render'); // Logging to track re-renders

  return (
    <div>
      <label>{label}</label>
      <input {...inputProps} />
      {error && <span>{error}</span>}
    </div>
  );
});
```

**The Problem:** Every time ANY field changed, the form context updated, causing ALL `useFormField` hooks to re-run. Each created a new `inputProps` object reference, breaking `React.memo` comparison, causing all fields to re-render.

**Fix Implementation (Phases):**

**Phase 1: Add Memoization (Week 1)**

```jsx
// ✅ Fixed with useMemo
function useFormField(name) {
  const { values, setFieldValue, errors } = useFormContext();

  const inputProps = useMemo(() => ({
    name,
    value: values[name],
    onChange: (e) => setFieldValue(name, e.target.value),
    'aria-invalid': !!errors[name]
  }), [name, values[name], setFieldValue, errors[name]]);
  // Only recreate when THIS field's value/error changes

  return { inputProps, error: errors[name] };
}
```

**Results:**
- Render time: **180ms → 45ms per keystroke** (75% improvement)
- Re-renders: **30 fields → 3-5 fields** (fields sharing validation logic)
- Still not perfect - why are 3-5 fields re-rendering?

**Phase 2: Fix Unstable Callbacks (Week 2)**

Investigation revealed `setFieldValue` was recreated on every form render:

```jsx
// ❌ Context provider creating new functions
function FormProvider({ children }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  // NEW FUNCTION EVERY RENDER!
  const setFieldValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <FormContext.Provider value={{ values, setFieldValue, errors }}>
      {children}
    </FormContext.Provider>
  );
}

// ✅ Fixed with useCallback
function FormProvider({ children }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []); // Stable function reference

  const contextValue = useMemo(() => ({
    values,
    setFieldValue,
    errors
  }), [values, setFieldValue, errors]);

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
}
```

**Results:**
- Render time: **45ms → 18ms per keystroke** (90% total improvement)
- Re-renders: **3-5 fields → 1 field** (only the changing field)
- Form typing now felt instant and responsive

**Phase 3: Advanced Optimization - Granular Context (Week 3-4)**

For extremely large forms (100+ fields in their admin dashboard), even 18ms felt slow. They implemented **context splitting**:

```jsx
// Split context into values and actions
const FormValuesContext = React.createContext();
const FormActionsContext = React.createContext();

function useFormField(name) {
  const values = useContext(FormValuesContext);
  const { setFieldValue } = useContext(FormActionsContext);

  // Now only re-renders when FormValuesContext changes
  // setFieldValue is always stable from FormActionsContext
  const inputProps = useMemo(() => ({
    name,
    value: values[name],
    onChange: (e) => setFieldValue(name, e.target.value)
  }), [name, values[name], setFieldValue]);

  return { inputProps };
}
```

**Final Results After All Optimizations:**

**Performance Metrics (100-field admin form):**
- Render time: **180ms → 12ms** (93% improvement)
- Time to Interactive: **1.2s → 0.3s** (form loads faster)
- Memory usage: **45MB → 38MB** (fewer object allocations)
- User complaints: **15/month → 0** (typing lag eliminated)

**Bundle Size Impact:**
- Adding `useMemo`/`useCallback`: **+0KB** (built-in React hooks)
- Props collection pattern vs individual props: **-2.3KB** (less boilerplate)

**Accessibility Wins:**

By bundling ARIA attributes in props collections, they ensured consistent accessibility:

```jsx
const inputProps = useMemo(() => ({
  name,
  value: values[name],
  onChange: (e) => setFieldValue(name, e.target.value),
  'aria-invalid': !!errors[name],
  'aria-describedby': errors[name] ? `${name}-error` : undefined
}), [name, values[name], errors[name], setFieldValue]);
```

This caught 23 missing `aria-invalid` attributes that were causing accessibility audit failures.

**Unexpected Discovery:**

During optimization, they found a subtle React behavior: spreading props collections BEFORE custom props allows easy overrides:

```jsx
// ❌ Custom onChange overridden by spread
<input onChange={customHandler} {...inputProps} />
// inputProps.onChange wins - custom handler ignored!

// ✅ Spread first, then override
<input {...inputProps} onChange={customHandler} />
// Custom handler wins - as expected
```

This led to documenting prop spread order as a best practice.

### ⚖️ Trade-offs

**Props Collection vs Alternative Patterns:**

**1. Props Collection vs Individual Return Values**

**Props Collection Advantages:**
- **Less boilerplate:** One spread vs 5+ individual props
- **Consistency:** Impossible to forget a required prop
- **Bundle props:** Group related props logically (inputProps, labelProps, etc.)
- **Discoverability:** TypeScript shows all props in one object
- **Accessibility:** Can include ARIA attributes automatically

**Individual Values Advantages:**
- **Flexibility:** Easy to override or customize individual values
- **Explicit:** Clear which props come from hook vs component
- **Composition:** Can mix multiple hooks' values easily
- **Debugging:** Easier to trace which hook provided which value

**Example Comparison:**

```jsx
// Props Collection
function useCheckbox() {
  const [checked, setChecked] = useState(false);
  return {
    checkboxProps: {
      type: 'checkbox',
      checked,
      onChange: (e) => setChecked(e.target.checked)
    }
  };
}
<input {...checkboxProps} /> // Simple!

// Individual Values
function useCheckbox() {
  const [checked, setChecked] = useState(false);
  const onChange = (e) => setChecked(e.target.checked);
  return { checked, onChange };
}
<input type="checkbox" checked={checked} onChange={onChange} />
// More verbose but more flexible
```

**When to Choose:**

| Scenario | Use Props Collection | Use Individual Values |
|----------|---------------------|----------------------|
| Simple standardized inputs | ✅ Yes | ❌ No |
| Need to override props often | ❌ No | ✅ Yes |
| Many related props (5+) | ✅ Yes | ❌ No |
| TypeScript discoverability | ✅ Yes | Neutral |
| Composing multiple hooks | ❌ No | ✅ Yes |

**2. Props Collection vs Props Getters**

**Props Collection (object):**
```jsx
const { inputProps } = useInput();
<input {...inputProps} />
```

**Props Getters (function):**
```jsx
const { getInputProps } = useInput();
<input {...getInputProps()} />
```

**Decision Matrix:**

| Factor | Props Collection | Props Getters | Winner |
|--------|-----------------|---------------|--------|
| Simplicity | Simpler (object spread) | More complex (function call) | Collection |
| Customization | Hard (must reconstruct) | Easy (pass overrides) | Getters |
| Type safety | Excellent | Excellent | Tie |
| Performance | Requires memoization | Requires memoization | Tie |
| Learning curve | Easier | Slightly harder | Collection |

**Example - Customization:**

```jsx
// Props Collection: Hard to customize
const { inputProps } = useInput();
<input
  {...inputProps}
  onChange={(e) => {
    inputProps.onChange(e); // Must call original
    console.log('Custom'); // Then add custom logic
  }}
/>

// Props Getters: Easy to customize
const { getInputProps } = useInput();
<input
  {...getInputProps({
    onChange: (e) => console.log('Custom') // Auto-merged!
  })}
/>
```

**Recommendation:** Start with props collections for simple cases. Migrate to props getters when users need customization flexibility.

**3. Implementation Complexity:**

**Simple Props Collection (Easy):**
```jsx
function useSimple() {
  return {
    inputProps: { type: 'text', value: 'foo' }
  };
}
```

**Memoized Props Collection (Moderate):**
```jsx
function useMemoized() {
  const [value, setValue] = useState('');
  const inputProps = useMemo(() => ({
    type: 'text',
    value,
    onChange: (e) => setValue(e.target.value)
  }), [value]);
  return { inputProps };
}
```

**Multiple Collections with Dependencies (Complex):**
```jsx
function useComplex() {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const id = useId();

  const inputProps = useMemo(() => ({
    id,
    type: 'text',
    value,
    onChange: (e) => setValue(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false)
  }), [id, value]);

  const labelProps = useMemo(() => ({
    htmlFor: id
  }), [id]);

  return { inputProps, labelProps, focused };
}
```

**Trade-off:** More collections = better organization but more complexity. Balance based on component needs.

**4. Props Collection Anti-Patterns:**

**❌ Anti-Pattern 1: Too Many Props**

```jsx
// Bad: Mixing layout, behavior, and style in one collection
const inputProps = {
  type: 'text',
  value,
  onChange,
  className: 'input-field', // Layout concern
  style: { color: 'red' },   // Style concern
  placeholder: 'Enter...',    // Content concern
  'aria-label': 'Input'       // A11y concern
};
```

**✅ Better: Separate concerns**

```jsx
const inputProps = { type: 'text', value, onChange }; // Behavior only
const a11yProps = { 'aria-label': 'Input' };         // A11y
// Let component handle layout/style
```

**❌ Anti-Pattern 2: Including Non-DOM Props**

```jsx
// Bad: Mixing DOM and non-DOM props
const inputProps = {
  value,
  onChange,
  isValid: true, // Not a valid DOM attribute!
  fieldId: 5     // Not a valid DOM attribute!
};
<input {...inputProps} /> // Warning: unknown props
```

**✅ Better: Separate DOM and state**

```jsx
const inputProps = { value, onChange };
const fieldState = { isValid: true, fieldId: 5 };
return { inputProps, fieldState };
```

**5. Performance Considerations:**

**Object Creation Overhead:**

```jsx
// Measured in production form with 100 fields:
// Without memoization: 50ms per keystroke (recreating 100 objects)
// With memoization: 12ms per keystroke (recreating 1 object)

// Memoization cost itself is negligible (~0.1ms per field)
```

**When Memoization Isn't Worth It:**

```jsx
// Don't memoize if:
// 1. Component not wrapped with React.memo
// 2. Props change on every render anyway
// 3. Form has <10 fields (overhead not noticeable)

// Simple forms: Skip memoization
function useSimpleCheckbox() {
  const [checked, setChecked] = useState(false);
  return {
    checkboxProps: {
      checked,
      onChange: (e) => setChecked(e.target.checked)
    } // No useMemo needed for simple case
  };
}
```

### 💬 Explain to Junior

**The Restaurant Order Slip Analogy:**

Imagine you're a waiter taking orders. Without props collections, you'd have to remember and communicate every detail separately:

**Without Props Collection (Manual):**
- Waiter: "Table 5 wants..."
- "...a burger"
- "...cooked medium"
- "...with fries"
- "...no pickles"
- "...extra sauce"

You have to remember and communicate 5 separate pieces of information. If you forget one, the order is wrong.

**With Props Collection (Automatic):**
- Waiter: "Table 5 wants [hands over complete order slip]"

The order slip has ALL the information bundled together. Impossible to forget a piece!

**Code Translation:**

```jsx
// ❌ Without Props Collection: Manual wiring (error-prone)
function useCheckbox() {
  const [checked, setChecked] = useState(false);
  const onChange = (e) => setChecked(e.target.checked);
  return { checked, onChange };
}

function Manual() {
  const { checked, onChange } = useCheckbox();
  return (
    <input
      type="checkbox"  // You have to remember this
      checked={checked}
      onChange={onChange}
      // Oops, forgot aria-checked! ❌
    />
  );
}

// ✅ With Props Collection: Everything included (foolproof)
function useCheckbox() {
  const [checked, setChecked] = useState(false);
  const checkboxProps = {
    type: 'checkbox',
    checked,
    onChange: (e) => setChecked(e.target.checked),
    'aria-checked': checked // Accessibility included!
  };
  return { checkboxProps };
}

function Automatic() {
  const { checkboxProps } = useCheckbox();
  return <input {...checkboxProps} />; // All props applied automatically!
}
```

**Key Concepts for Juniors:**

**1. The Spread Operator (`...`):**

Think of `...` as "unpack this box":

```jsx
const box = { color: 'red', size: 'large' };
<div {...box} />
// Becomes:
<div color="red" size="large" />
```

**2. Why Bundle Props:**

```jsx
// Without bundling: Easy to make mistakes
<input
  type="text"
  value={value}
  onChange={handleChange}
  // Forgot onBlur? Forgot aria-label? ❌
/>

// With bundling: All or nothing (no mistakes)
<input {...inputProps} /> // ✅ Includes EVERYTHING
```

**3. When NOT to Use:**

Props collections are great when you DON'T need customization:

```jsx
// ✅ Good: Standard checkbox (no customization)
const { checkboxProps } = useCheckbox();
<input {...checkboxProps} />

// ❌ Bad: Need custom onChange
const { checkboxProps } = useCheckbox();
<input
  {...checkboxProps}
  onChange={(e) => {
    // Hard to customize! Need to call checkboxProps.onChange manually
  }}
/>
// For this case, use Props Getters pattern instead (next question)
```

**Common Junior Mistakes:**

```jsx
// ❌ Mistake 1: Forgetting the spread
const { inputProps } = useInput();
<input inputProps={inputProps} /> // WRONG! Passes object as prop

// ✅ Correct: Spread the object
<input {...inputProps} />

// ❌ Mistake 2: Overriding props in wrong order
<input onChange={custom} {...inputProps} />
// inputProps.onChange overwrites custom! ❌

// ✅ Correct order: Spread first, override after
<input {...inputProps} onChange={custom} />
// Now custom overwrites inputProps.onChange ✅

// ❌ Mistake 3: Not memoizing in large forms
function useFormField() {
  return {
    inputProps: { /* new object every render */ }
  };
}
// In 50-field form, creates 50 new objects per keystroke!

// ✅ Better: Memoize
function useFormField() {
  const inputProps = useMemo(() => ({
    /* ... */
  }), [dependencies]);
  return { inputProps };
}
```

**Interview Answer Template:**

**Question:** "What is the Props Collection pattern and when would you use it?"

**Answer:**

"The Props Collection pattern is when a custom hook returns an object of props that can be spread directly onto an element, rather than returning individual values that need manual wiring.

**Example:**

```jsx
// Props Collection pattern
function useCheckbox() {
  const [checked, setChecked] = useState(false);
  const checkboxProps = {
    type: 'checkbox',
    checked,
    onChange: (e) => setChecked(e.target.checked),
    'aria-checked': checked
  };
  return { checkboxProps };
}

// Clean usage
<input {...checkboxProps} />
```

**Benefits:**

**First, convenience.** Instead of wiring up 4-5 props manually, you spread one object. This reduces boilerplate significantly in forms with many fields.

**Second, consistency.** You can't forget required props - they're all bundled together. This caught 23 missing `aria-invalid` attributes in our accessibility audit.

**Third, discoverability.** With TypeScript, hovering over `checkboxProps` shows all included props at once, improving developer experience.

**Trade-offs:**

The main limitation is **flexibility**. If users need to customize individual props (like adding custom onChange logic), they have to manually call the original handler:

```jsx
<input
  {...checkboxProps}
  onChange={(e) => {
    checkboxProps.onChange(e); // Call original
    console.log('Custom logic'); // Add custom
  }}
/>
```

This is awkward. For cases needing customization, the **Props Getters pattern** is better - it returns a function that accepts overrides and merges them automatically.

**When to use:**
- Form libraries (React Hook Form uses this extensively)
- Standardized inputs where customization is rare
- Components with many required props (5+)
- When bundling accessibility attributes

**When NOT to use:**
- Components needing frequent customization
- Simple components with 1-2 props (overkill)
- Performance-critical code without memoization

**In production at [company]**, we use props collections for our form library. After optimizing with `useMemo`, we saw typing latency drop from 180ms to 12ms per keystroke in a 100-field admin form."

**Difficulty Adaptation:**
- **Junior:** Focus on what/why, simple examples, spread operator explanation
- **Mid:** Add memoization, performance considerations, real metrics
- **Senior:** Discuss vs Props Getters, context optimization, bundle size, a11y benefits

---

## Question 3: Props Getters Pattern

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Downshift, React Hook Form

### Question
What is the Props Getters pattern? How does it improve upon Props Collection?

### Answer

**Props Getters** - Return functions that generate props, allowing users to override and extend behavior.

**Key Points:**
1. **Function returns props** - More flexible
2. **User overrides** - Merge custom props
3. **Composable** - Chain multiple behaviors
4. **Type safe** - Better TypeScript support
5. **Used in** - Downshift, Reach UI

### Code Example

```jsx
// Props Getters Pattern (More Flexible)
function useToggle() {
  const [on, setOn] = useState(false);

  // Function that returns props (can accept user overrides)
  function getTogglerProps({ onClick, ...props } = {}) {
    return {
      'aria-pressed': on,
      onClick: (event) => {
        onClick?.(event); // Call user's onClick first
        setOn(!on); // Then toggle
      },
      ...props
    };
  }

  return { on, getTogglerProps };
}

// Usage - User can extend behavior
function Switch() {
  const { on, getTogglerProps } = useToggle();

  return (
    <button
      {...getTogglerProps({
        onClick: () => console.log('Toggled!'),
        className: 'switch'
      })}
    >
      {on ? 'On' : 'Off'}
    </button>
  );
}

// Advanced: Multiple getters
function useMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  function getMenuProps(props = {}) {
    return {
      role: 'menu',
      ...props
    };
  }

  function getItemProps({ index, onClick, ...props } = {}) {
    return {
      role: 'menuitem',
      onClick: (event) => {
        onClick?.(event);
        setSelectedIndex(index);
        setIsOpen(false);
      },
      'aria-selected': index === selectedIndex,
      ...props
    };
  }

  function getToggleProps({ onClick, ...props } = {}) {
    return {
      onClick: (event) => {
        onClick?.(event);
        setIsOpen(!isOpen);
      },
      'aria-expanded': isOpen,
      ...props
    };
  }

  return {
    isOpen,
    selectedIndex,
    getMenuProps,
    getItemProps,
    getToggleProps
  };
}

// Usage
function DropdownMenu() {
  const {
    isOpen,
    getMenuProps,
    getItemProps,
    getToggleProps
  } = useMenu();

  return (
    <div>
      <button {...getToggleProps()}>Menu</button>
      {isOpen && (
        <ul {...getMenuProps()}>
          <li {...getItemProps({ index: 0 })}>Item 1</li>
          <li {...getItemProps({ index: 1 })}>Item 2</li>
          <li {...getItemProps({ index: 2 })}>Item 3</li>
        </ul>
      )}
    </div>
  );
}
```

### 🔍 Deep Dive

**Props Getters Pattern Architecture and Evolution:**

The Props Getters pattern is an evolution of Props Collection that solves a critical limitation: **user customization**. Instead of returning pre-configured prop objects, this pattern returns **functions** that generate props. These functions accept user overrides and intelligently merge them with the hook's logic.

**The Problem Props Getters Solve:**

With Props Collection, customization is painful:

```jsx
// Props Collection: Hard to customize
const { checkboxProps } = useCheckbox();
<input
  {...checkboxProps}
  onChange={(e) => {
    checkboxProps.onChange(e); // Must manually call original
    logAnalytics('checkbox_toggled'); // Then add custom logic
  }}
/>
```

Props Getters make this elegant:

```jsx
// Props Getters: Automatic merging
const { getCheckboxProps } = useCheckbox();
<input
  {...getCheckboxProps({
    onChange: () => logAnalytics('checkbox_toggled')
  })}
/>
// Hook's onChange AND user's onChange both fire automatically!
```

**Core Implementation Pattern:**

A production-grade prop getter handles multiple scenarios:

```jsx
function useInput() {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const id = useId();

  // Prop getter function
  function getInputProps(userProps = {}) {
    // Destructure user overrides
    const {
      onChange: userOnChange,
      onBlur: userOnBlur,
      onFocus: userOnFocus,
      ...restUserProps
    } = userProps;

    return {
      // Required props from hook
      id,
      value,

      // Merged event handlers
      onChange: callAll(
        (e) => setValue(e.target.value), // Hook's logic
        userOnChange // User's custom logic
      ),
      onBlur: callAll(
        () => setTouched(true), // Hook's logic
        userOnBlur // User's custom logic
      ),
      onFocus: userOnFocus, // User's override completely replaces (no hook logic)

      // User's additional props (className, etc.)
      ...restUserProps
    };
  }

  return { value, touched, getInputProps };
}

// Helper to compose multiple functions
function callAll(...fns) {
  return (...args) => {
    fns.forEach(fn => fn?.(...args));
  };
}
```

**Advanced: Downshift's Real Implementation:**

Downshift, the gold standard for prop getters, handles keyboard navigation, ARIA attributes, and accessibility:

```jsx
function useCombobox() {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);

  function getInputProps(userProps = {}) {
    const {
      onKeyDown: userOnKeyDown,
      onChange: userOnChange,
      onBlur: userOnBlur,
      ...rest
    } = userProps;

    return {
      // Input state
      value: inputValue,
      ref: inputRef,

      // ARIA attributes
      role: 'combobox',
      'aria-expanded': isOpen,
      'aria-activedescendant': highlightedIndex >= 0
        ? `option-${highlightedIndex}`
        : undefined,
      'aria-autocomplete': 'list',
      'aria-controls': 'listbox',

      // Event handlers (merged)
      onChange: callAll(
        (e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        },
        userOnChange
      ),

      onKeyDown: callAll(
        (e) => {
          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              setHighlightedIndex(prev => prev + 1);
              break;
            case 'ArrowUp':
              e.preventDefault();
              setHighlightedIndex(prev => Math.max(0, prev - 1));
              break;
            case 'Enter':
              if (highlightedIndex >= 0) {
                selectItem(highlightedIndex);
              }
              break;
            case 'Escape':
              setIsOpen(false);
              break;
          }
        },
        userOnKeyDown
      ),

      onBlur: callAll(
        () => setIsOpen(false),
        userOnBlur
      ),

      // User's additional props
      ...rest
    };
  }

  return { getInputProps, /* other getters */ };
}
```

**Type Safety with TypeScript:**

TypeScript makes prop getters type-safe and self-documenting:

```typescript
type GetInputPropsOptions = {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  disabled?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

type GetInputPropsReturn = {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  'aria-invalid': boolean;
  ref: React.RefObject<HTMLInputElement>;
} & Omit<GetInputPropsOptions, 'onChange' | 'onBlur'>;

function getInputProps(
  options: GetInputPropsOptions = {}
): GetInputPropsReturn {
  // Implementation
}
```

This provides:
1. **IntelliSense:** Auto-complete for available overrides
2. **Type checking:** Prevents passing invalid props
3. **Documentation:** Types self-document the API

**Advanced Pattern: State Reducers with Getters:**

For maximum flexibility, combine prop getters with state reducers (used by Downshift):

```jsx
function useToggle({ reducer = (state, action) => action.changes } = {}) {
  const [state, dispatch] = useReducer(
    (state, action) => {
      // Call user's reducer to allow state override
      const changes = reducer(state, action);
      return { ...state, ...changes };
    },
    { on: false }
  );

  function getTogglerProps(userProps = {}) {
    return {
      'aria-pressed': state.on,
      onClick: callAll(
        () => dispatch({ type: 'toggle', changes: { on: !state.on } }),
        userProps.onClick
      ),
      ...userProps
    };
  }

  return { on: state.on, getTogglerProps };
}

// User can now override state changes!
const { getTogglerProps } = useToggle({
  reducer: (state, action) => {
    if (action.type === 'toggle' && someCondition) {
      return { on: false }; // Prevent toggle in certain conditions
    }
    return action.changes; // Default behavior
  }
});
```

**Performance Optimization:**

Unlike Props Collections, prop getters create a new function object every render. Memoization is crucial:

```jsx
// ❌ Bad: New function every render
function useInput() {
  const [value, setValue] = useState('');

  function getInputProps(userProps = {}) {
    // New function every render - causes re-renders!
    return { /* ... */ };
  }

  return { getInputProps };
}

// ✅ Better: Memoized with dependencies
function useInput() {
  const [value, setValue] = useState('');

  const getInputProps = useCallback((userProps = {}) => {
    const { onChange, ...rest } = userProps;
    return {
      value,
      onChange: callAll((e) => setValue(e.target.value), onChange),
      ...rest
    };
  }, [value]); // Only recreate when value changes

  return { getInputProps };
}
```

**Why Prop Getters Are the Standard for Complex Libraries:**

1. **Flexibility:** Users can override any prop easily
2. **Composability:** Multiple behaviors can be layered
3. **Accessibility:** Hook can enforce ARIA attributes while allowing customization
4. **TypeScript Support:** Better type inference than collections
5. **Discovery:** Function signature documents available options

This is why Downshift, React Hook Form, Reach UI, and React Aria all use prop getters extensively.

### 🐛 Real-World Scenario

**Production Case Study: Autocomplete Component Migration at E-Learning Platform (2022)**

**Context:** An e-learning platform had a custom autocomplete component used in 80+ locations (course search, user lookup, tag selection, etc.). Initially built with Props Collection pattern, they faced constant feature requests for customization that were painful to implement.

**Initial Implementation (Props Collection):**

```jsx
function useAutocomplete(options) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Props collection - no customization
  const inputProps = {
    value: inputValue,
    onChange: (e) => {
      setInputValue(e.target.value);
      setIsOpen(true);
    },
    onBlur: () => setIsOpen(false)
  };

  return { inputProps, isOpen };
}
```

**Problems Encountered:**

**Problem 1: Analytics Tracking (Week 3)**

Product team wanted to track autocomplete interactions for analytics:

```jsx
// ❌ Awkward workaround with Props Collection
const { inputProps } = useAutocomplete(courses);
<input
  {...inputProps}
  onChange={(e) => {
    inputProps.onChange(e); // Must manually call original
    analytics.track('autocomplete_input', { value: e.target.value });
  }}
/>
// Every usage (80+ places) needed this boilerplate!
```

**Problem 2: Debounced Search (Week 5)**

For expensive API calls, some autocompletes needed debouncing:

```jsx
// ❌ Can't easily add debouncing to Props Collection
const { inputProps } = useAutocomplete(users);
const debouncedOnChange = useMemo(
  () => debounce(inputProps.onChange, 300),
  [inputProps.onChange] // inputProps.onChange changes every render!
);
<input {...inputProps} onChange={debouncedOnChange} />
// Doesn't work - inputProps.onChange recreated every render
```

**Problem 3: Keyboard Shortcuts (Week 8)**

Power users requested Ctrl+K to focus search:

```jsx
// ❌ Can't extend onKeyDown without props getter
const { inputProps } = useAutocomplete(courses);
// inputProps doesn't include onKeyDown, and adding it breaks pattern
```

**Migration Decision:**

After 3 months of workarounds, team decided to migrate to Props Getters pattern.

**New Implementation (Props Getters):**

```jsx
function useAutocomplete(options = []) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const filtered = useMemo(
    () => options.filter(opt => opt.label.includes(inputValue)),
    [options, inputValue]
  );

  // Prop getter - accepts user customization
  const getInputProps = useCallback((userProps = {}) => {
    const {
      onChange: userOnChange,
      onKeyDown: userOnKeyDown,
      onBlur: userOnBlur,
      ...rest
    } = userProps;

    return {
      value: inputValue,
      role: 'combobox',
      'aria-expanded': isOpen,
      'aria-activedescendant':
        highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined,

      onChange: callAll(
        (e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(0);
        },
        userOnChange // User's custom onChange merged!
      ),

      onKeyDown: callAll(
        (e) => {
          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              setHighlightedIndex(prev =>
                Math.min(filtered.length - 1, prev + 1)
              );
              break;
            case 'ArrowUp':
              e.preventDefault();
              setHighlightedIndex(prev => Math.max(0, prev - 1));
              break;
            case 'Enter':
              if (highlightedIndex >= 0) {
                selectOption(filtered[highlightedIndex]);
              }
              break;
            case 'Escape':
              setIsOpen(false);
              break;
          }
        },
        userOnKeyDown // User's custom keyboard handlers merged!
      ),

      onBlur: callAll(
        () => setTimeout(() => setIsOpen(false), 200),
        userOnBlur
      ),

      ...rest // User's additional props (className, disabled, etc.)
    };
  }, [inputValue, isOpen, highlightedIndex, filtered]);

  const getOptionProps = useCallback((userProps = {}) => {
    const { index, onClick, ...rest } = userProps;
    return {
      id: `option-${index}`,
      role: 'option',
      'aria-selected': index === highlightedIndex,
      onClick: callAll(
        () => {
          selectOption(filtered[index]);
          setIsOpen(false);
        },
        onClick
      ),
      ...rest
    };
  }, [highlightedIndex, filtered]);

  return { getInputProps, getOptionProps, filtered, isOpen };
}
```

**Migration Results:**

**Timeline: 6 weeks (2 hours/week)**

**Week 1-2:** Implemented new `useAutocomplete` with prop getters
**Week 3-4:** Migrated 80+ usage sites using codemods
**Week 5-6:** Added features that were previously impossible

**Before vs After Comparison:**

**Analytics Tracking (Previously Awkward):**

```jsx
// Before (Props Collection): Boilerplate at every usage
<input
  {...inputProps}
  onChange={(e) => {
    inputProps.onChange(e);
    analytics.track('input', { value: e.target.value });
  }}
/>

// After (Props Getters): Clean and simple
<input
  {...getInputProps({
    onChange: (e) => analytics.track('input', { value: e.target.value })
  })}
/>
```

**Debounced Search (Previously Broken):**

```jsx
// Before: Didn't work (onChange recreated every render)
const debouncedChange = useMemo(
  () => debounce(inputProps.onChange, 300),
  [inputProps.onChange]
);

// After: Works perfectly!
const debouncedTrack = useMemo(
  () => debounce((e) => fetchResults(e.target.value), 300),
  []
);
<input {...getInputProps({ onChange: debouncedTrack })} />
```

**Keyboard Shortcuts (Previously Impossible):**

```jsx
// Before: Can't add custom keyboard handlers
// inputProps has no onKeyDown, can't extend it

// After: Custom shortcuts work seamlessly
<input
  {...getInputProps({
    onKeyDown: (e) => {
      if (e.key === '/' && e.ctrlKey) {
        e.preventDefault();
        focusSearch();
      }
    }
  })}
/>
// Both useAutocomplete's arrow navigation AND custom Ctrl+/ work!
```

**Performance Metrics After Migration:**

- **Bundle size:** +1.2KB (callAll helper + useCallback overhead)
- **Render time:** No change (12ms average)
- **Developer velocity:** **+40%** (new features implemented faster)
- **Bug reports:** **-60%** (fewer workaround-related bugs)
- **Code duplication:** **-80%** (no more onChange boilerplate at every usage)

**Accessibility Improvements:**

Prop getters allowed enforcing ARIA attributes while permitting customization:

```jsx
const getInputProps = useCallback((userProps = {}) => {
  return {
    role: 'combobox', // Always enforced
    'aria-expanded': isOpen, // Always enforced
    'aria-activedescendant': highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined,
    ...userProps // But users can still add aria-label, aria-describedby, etc.
  };
}, [isOpen, highlightedIndex]);
```

This caught 12 accessibility violations where autocompletes were missing proper ARIA attributes.

**Unexpected Discovery:**

During migration, they discovered a memory leak in the old Props Collection approach:

```jsx
// ❌ Props Collection created closure over stale state
const inputProps = {
  onChange: (e) => {
    setInputValue(e.target.value);
    // BUG: This closure captures `options` from when component first rendered!
    if (options.length === 0) {
      showEmptyState();
    }
  }
};

// ✅ Props Getters with useCallback fixed it
const getInputProps = useCallback((userProps = {}) => {
  return {
    onChange: callAll(
      (e) => {
        setInputValue(e.target.value);
        // Uses latest `filtered` via dependency array
        if (filtered.length === 0) {
          showEmptyState();
        }
      },
      userProps.onChange
    )
  };
}, [filtered]); // Dependency array ensures latest state
```

Fixing this eliminated 8 "autocomplete doesn't update" bug reports.

### ⚖️ Trade-offs

**Props Getters vs Alternative Patterns:**

**1. Props Getters vs Props Collection**

| Factor | Props Getters | Props Collection | Winner |
|--------|--------------|------------------|--------|
| Simplicity | Function call required | Simple object spread | Collection |
| Customization | Easy (pass overrides) | Hard (manual merging) | **Getters** |
| Type safety | Excellent (generic types) | Good | Getters |
| Learning curve | Moderate | Easy | Collection |
| Bundle size | +~0.5KB (`callAll` helper) | Smaller | Collection |
| Use case | Complex reusable hooks | Simple standardized components | Context-dependent |

**When to Choose:**

```jsx
// Use Props Collection when:
// - Simple, no customization needed
// - Standardized inputs (checkboxes, basic text fields)
// - Small team, junior developers

// Use Props Getters when:
// - Complex components (autocomplete, dropdown, tabs)
// - Users need customization often
// - Library/design system (flexibility matters)
// - Accessibility features need enforcement + customization
```

**2. Props Getters vs Individual Return Values**

**Props Getters:**
```jsx
const { getInputProps } = useInput();
<input {...getInputProps({ className: 'custom' })} />
```

**Individual Values:**
```jsx
const { value, onChange, onBlur } = useInput();
<input value={value} onChange={onChange} onBlur={onBlur} className="custom" />
```

**Decision Matrix:**

| Scenario | Props Getters | Individual Values | Winner |
|----------|--------------|-------------------|--------|
| Many props (5+) | Convenient | Verbose | Getters |
| ARIA attributes | Bundled automatically | Manual wiring | **Getters** |
| Mixing multiple hooks | Can conflict | Easy to compose | Individual |
| TypeScript autocomplete | Shows all options | Shows individual values | Tie |
| Testing | Mock getter function | Mock individual values | Individual |

**3. Implementation Complexity:**

**Simple Props Getter:**
```jsx
function useCheckbox() {
  const [checked, setChecked] = useState(false);

  const getCheckboxProps = useCallback((userProps = {}) => {
    const { onChange, ...rest } = userProps;
    return {
      type: 'checkbox',
      checked,
      onChange: callAll((e) => setChecked(e.target.checked), onChange),
      ...rest
    };
  }, [checked]);

  return { checked, getCheckboxProps };
}
```

**Complex Props Getter (Downshift-style):**
```jsx
function useCombobox() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const getInputProps = useCallback((userProps = {}) => {
    const {
      onKeyDown,
      onChange,
      onBlur,
      ref: userRef,
      ...rest
    } = userProps;

    return {
      ref: callAllRefs(inputRef, userRef), // Merge refs!
      value: state.inputValue,
      role: 'combobox',
      'aria-expanded': state.isOpen,
      'aria-activedescendant': state.highlightedIndex >= 0
        ? `item-${state.highlightedIndex}`
        : undefined,
      'aria-controls': 'listbox',
      'aria-autocomplete': 'list',
      'aria-labelledby': 'label',
      onKeyDown: callAll(handleKeyDown, onKeyDown),
      onChange: callAll(handleChange, onChange),
      onBlur: callAll(handleBlur, onBlur),
      ...rest
    };
  }, [state]);

  return { getInputProps, /* ...more getters */ };
}
```

**Trade-off:** Complexity vs flexibility. Start simple, add complexity only when needed.

**4. Performance Implications:**

**Function Creation Cost:**

```jsx
// Prop getters create functions on every render
// Measured in 100-component autocomplete list:

// Without memoization: 25ms per state change
function useAutocomplete() {
  function getInputProps(userProps = {}) { /* ... */ } // New function every render!
  return { getInputProps };
}

// With memoization: 8ms per state change
function useAutocomplete() {
  const getInputProps = useCallback((userProps = {}) => {
    /* ... */
  }, [/* dependencies */]); // Stable function reference
  return { getInputProps };
}
```

**callAll Helper Performance:**

```jsx
// callAll adds negligible overhead (~0.01ms per call)
function callAll(...fns) {
  return (...args) => {
    fns.forEach(fn => fn?.(...args)); // Very fast iteration
  };
}

// In production form with 50 fields:
// Total callAll overhead: ~0.5ms per keystroke (imperceptible)
```

**5. Common Pitfalls:**

**❌ Pitfall 1: Overwriting Hook's Props**

```jsx
// ❌ Bad: User props spread first, hook overrides them
function getInputProps(userProps = {}) {
  return {
    ...userProps,
    onChange: (e) => setValue(e.target.value) // Overwrites user's onChange!
  };
}

// ✅ Good: Merge event handlers
function getInputProps(userProps = {}) {
  const { onChange, ...rest } = userProps;
  return {
    onChange: callAll((e) => setValue(e.target.value), onChange),
    ...rest // User props like className applied
  };
}
```

**❌ Pitfall 2: Not Memoizing Getter Functions**

```jsx
// ❌ Bad: New function every render
function useInput() {
  const [value, setValue] = useState('');
  return {
    getInputProps: (props) => ({ value, ...props }) // New function!
  };
}

// ✅ Good: Memoized
function useInput() {
  const [value, setValue] = useState('');
  const getInputProps = useCallback((props = {}) => ({
    value,
    ...props
  }), [value]);
  return { getInputProps };
}
```

**❌ Pitfall 3: Forgetting to Spread Rest Props**

```jsx
// ❌ Bad: Ignores user's className, disabled, etc.
function getInputProps(userProps = {}) {
  const { onChange } = userProps;
  return {
    value,
    onChange: callAll(handleChange, onChange)
    // Missing ...rest - user's className lost!
  };
}

// ✅ Good: Spread rest props
function getInputProps(userProps = {}) {
  const { onChange, ...rest } = userProps;
  return {
    value,
    onChange: callAll(handleChange, onChange),
    ...rest // User's className, disabled, etc. applied
  };
}
```

### 💬 Explain to Junior

**The Restaurant Customization Analogy:**

Imagine ordering food at a restaurant:

**Props Collection (Fixed Menu):**
- You: "I'll have the burger combo"
- Restaurant: "Here's your burger with fries, pickles, and ketchup"
- You: "But I don't want pickles!"
- Restaurant: "Sorry, it's a combo. Take the pickles out yourself."

**Props Getters (Customizable Menu):**
- You: "I'll have the burger combo, no pickles, extra sauce"
- Restaurant: "Here's your burger with fries, extra sauce, no pickles"
- Everything is customized for you!

**Code Translation:**

```jsx
// ❌ Props Collection: Can't customize easily
const { burgerComboProps } = useCombo();
<Meal {...burgerComboProps} />
// Gets fries, pickles, ketchup - can't change!

// ✅ Props Getters: Easy customization
const { getBurgerComboProps } = useCombo();
<Meal {...getBurgerComboProps({
  noPick les: true,
  extraSauce: true
})} />
// Gets exactly what you want!
```

**Key Concepts for Juniors:**

**1. Why Functions Instead of Objects:**

```jsx
// Props Collection (object):
const inputProps = { value, onChange }; // Fixed

// Props Getters (function):
const getInputProps = (customOptions) => {
  return { value, onChange, ...customOptions }; // Flexible!
};
```

**2. The `callAll` Helper:**

Think of `callAll` as a wedding guest list coordinator:

```jsx
// You want to invite your friends
const yourGuests = ['Alice', 'Bob'];

// Your partner wants to invite their friends
const partnerGuests = ['Charlie', 'Diana'];

// callAll invites BOTH lists
const allGuests = [...yourGuests, ...partnerGuests];
// ['Alice', 'Bob', 'Charlie', 'Diana']

// Code version:
function callAll(...functions) {
  return (...args) => {
    functions.forEach(fn => fn?.(...args)); // Call ALL functions!
  };
}

// Usage:
const combinedOnClick = callAll(
  hookOnClick, // Hook's logic
  userOnClick  // Your custom logic
);
// Both functions run when clicked!
```

**3. When to Use Props Getters:**

```jsx
// ✅ Good: Complex component needing customization
function Autocomplete() {
  const { getInputProps } = useAutocomplete(options);

  return (
    <input
      {...getInputProps({
        onChange: (e) => analytics.track('search', e.target.value),
        className: 'custom-style',
        placeholder: 'Search courses...'
      })}
    />
  );
}

// ❌ Overkill: Simple component with no customization
function SimpleCheckbox() {
  const { getCheckboxProps } = useCheckbox();
  return <input {...getCheckboxProps()} />; // No customization = use Props Collection instead
}
```

**Common Junior Mistakes:**

```jsx
// ❌ Mistake 1: Forgetting to call the getter
const { getInputProps } = useInput();
<input {...getInputProps} /> // WRONG! Spreading function itself

// ✅ Correct: Call the function
<input {...getInputProps()} /> // Call with ()

// ❌ Mistake 2: Passing props incorrectly
<input getInputProps={{ className: 'custom' }} /> // WRONG! Prop, not spread

// ✅ Correct: Spread the result
<input {...getInputProps({ className: 'custom' })} />

// ❌ Mistake 3: Overwriting hook's logic
<input
  {...getInputProps()}
  onChange={(e) => console.log(e.target.value)} // Overwrites hook's onChange!
/>

// ✅ Correct: Pass as argument to getter
<input
  {...getInputProps({
    onChange: (e) => console.log(e.target.value) // Merged with hook's onChange!
  })}
/>
```

**Interview Answer Template:**

**Question:** "What is the Props Getters pattern and how does it differ from Props Collection?"

**Answer:**

"Props Getters is an advanced pattern where custom hooks return **functions** that generate props, rather than pre-configured prop objects. This enables users to easily customize and extend behavior.

**Example:**

```jsx
function useToggle() {
  const [on, setOn] = useState(false);

  // Returns FUNCTION, not object
  function getTogglerProps(userProps = {}) {
    const { onClick, ...rest } = userProps;
    return {
      'aria-pressed': on,
      onClick: callAll(
        () => setOn(!on), // Hook's logic
        onClick           // User's custom logic
      ),
      ...rest // User's additional props (className, etc.)
    };
  }

  return { on, getTogglerProps };
}

// Usage - easy customization
<button
  {...getTogglerProps({
    onClick: () => analytics.track('toggled'),
    className: 'custom-toggle'
  })}
>
  {on ? 'On' : 'Off'}
</button>
```

**How It Works:**

1. User calls `getTogglerProps({ custom options })`
2. Function extracts event handlers (`onClick`, etc.)
3. Uses `callAll` helper to merge hook's handler + user's handler
4. Returns merged props object with both behaviors

**Props Collection vs Props Getters:**

**Props Collection (simple but inflexible):**
- Returns: Object directly
- Customization: Hard (must manually call original handler)
- Use case: Simple, standardized components

**Props Getters (complex but flexible):**
- Returns: Function that returns object
- Customization: Easy (pass overrides as argument)
- Use case: Complex, reusable components needing flexibility

**Real-World Example:**

At [company], we migrated our autocomplete component from Props Collection to Props Getters. This allowed:
- **Analytics tracking:** Users add custom onChange without breaking autocomplete logic
- **Keyboard shortcuts:** Users add custom onKeyDown while preserving arrow navigation
- **Debounced search:** Users wrap onChange with debounce easily

Results: **+40% developer velocity**, **-60% bug reports** from workarounds, **-80% code duplication**.

**Trade-offs:**
- **Bundle size:** +~0.5KB for `callAll` helper
- **Complexity:** Slightly harder to understand than Props Collection
- **Performance:** Requires `useCallback` memoization to avoid unnecessary re-renders

**When to use:**
- Component libraries (Downshift, Reach UI, React Aria all use this)
- Complex components (autocomplete, dropdown, tabs)
- When users frequently need customization
- When enforcing accessibility while allowing flexibility

**When NOT to use:**
- Simple components with no customization needs
- Small internal projects (Props Collection is simpler)
- Junior-heavy teams (higher learning curve)"

**Difficulty Adaptation:**
- **Junior:** Focus on what/why, simple callAll explanation, when to use
- **Mid:** Add real metrics, migration story, performance considerations
- **Senior:** Discuss vs state reducers, TypeScript generics, ref merging, accessibility enforcement

---

## Question 4: When to Use HOC vs Render Props

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐
**Time:** 8 minutes
**Companies:** Senior interviews

### Question
When should you use HOC vs Render Props vs Custom Hooks? What are the trade-offs?

### Answer

**Pattern Selection** - Choose based on use case, complexity, and team familiarity.

**Key Points:**
1. **HOC** - Cross-cutting concerns, wrapping
2. **Render Props** - Dynamic rendering control
3. **Custom Hooks** - Modern default choice
4. **Composition** - General component structure
5. **Context** - Global state sharing

### Code Example

```jsx
// When to use each pattern:

// 1. Composition - Default choice, most flexible
<Dialog>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>Content</DialogContent>
</Dialog>

// 2. HOC - Cross-cutting concerns (auth, logging)
const EnhancedComponent = withAuth(withLogging(Component));

// 3. Render Props - Share stateful logic (legacy, use hooks now)
<Mouse render={({ x, y }) => <div>{x}, {y}</div>} />

// 4. Compound Components - Complex UI with shared state
<Tabs>
  <TabList><Tab /></TabList>
  <TabPanels><TabPanel /></TabPanels>
</Tabs>

// 5. Custom Hooks - Modern way (preferred for logic reuse)
const { data, loading } = useFetch('/api/users');

// 6. Provider Pattern - Global state/context
<ThemeProvider><App /></ThemeProvider>

// 7. Props Getters - Flexible prop composition
const { getInputProps, getLabelProps } = useField();
```

### 🔍 Deep Dive

**Pattern Selection Decision Tree and Historical Context:**

The React ecosystem has evolved dramatically since 2013. Understanding when to use each pattern requires historical context and modern best practices. Let's examine the evolution and current recommendations for each pattern.

**Historical Evolution Timeline:**

1. **2013-2015: HOCs Era**
   - Mixins (removed in React 15.5) were the original reuse mechanism
   - HOCs emerged as the mixin replacement (popularized by Redux's `connect()`)
   - Problem: "wrapper hell" and prop collision

2. **2015-2018: Render Props Era**
   - React Router, Downshift, React Motion adopted render props
   - Solved HOC composition problems but introduced callback hell
   - Problem: Deeply nested JSX, performance issues

3. **2019-Present: Hooks Era**
   - Hooks (React 16.8) became the de facto standard
   - 90% of use cases now use custom hooks
   - HOCs and Render Props relegated to legacy/specific scenarios

**Modern Pattern Selection Matrix:**

| Use Case | Best Pattern | Why | Examples |
|----------|-------------|-----|----------|
| Share stateful logic | **Custom Hooks** | Simplest, most flexible, no nesting | useFetch, useAuth, useForm |
| UI composition | **Children/Composition** | Declarative, flexible | Dialog, Card, Layout components |
| Complex UI with shared state | **Compound Components** | Implicit state sharing via context | Tabs, Accordion, Menu |
| Global state | **Context Provider** | Built for this purpose | Theme, Auth, I18n |
| Cross-cutting class components | **HOC** | Only option without hooks | withAuth (legacy), React.memo |
| Third-party integration | **HOC** | Wrap external libraries | withRouter (old React Router) |
| Flexible prop composition | **Props Getters** | User customization + enforcement | Downshift, React Hook Form |
| Legacy code | **Render Props** | Don't migrate if working | Old libraries, not worth refactoring |

**Deep Dive: When Hooks AREN'T Enough:**

Despite hooks being the default, certain scenarios require other patterns:

**1. HOCs for Cross-Cutting Concerns in Libraries:**

```jsx
// React.memo is an HOC (can't be a hook!)
const MemoizedComponent = React.memo(Component);

// forwardRef is an HOC-like pattern
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref}>{props.children}</button>
));

// Error boundaries (can't use hooks - no useErrorBoundary)
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
```

**2. Compound Components for Tight Coupling:**

```jsx
// When children MUST communicate with parent
// Custom hooks can't enforce structure like compound components
<Select value={value} onChange={setValue}>
  <SelectTrigger>Choose...</SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>

// Hooks can't enforce this structure:
const { value, setValue } = useSelect();
// User could forget SelectTrigger or mix up order!
```

**3. Props Getters for Library Authors:**

When building reusable component libraries, props getters provide the best balance of flexibility and correctness:

```jsx
// Library author needs to:
// 1. Enforce accessibility (aria attributes)
// 2. Allow user customization
// 3. Prevent incorrect usage

// Props Getters solve this perfectly
function useAutocomplete() {
  const getInputProps = (userProps = {}) => ({
    role: 'combobox', // Enforced
    'aria-expanded': isOpen, // Enforced
    ...mergeProps(userProps) // But customizable
  });
  return { getInputProps };
}
```

**Advanced Pattern Combinations:**

Real-world applications often combine patterns:

```jsx
// Compound Components + Hooks + Context
function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0); // Hook for state
  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return (
    <TabsContext.Provider value={value}> {/* Context for communication */}
      {children} {/* Composition for structure */}
    </TabsContext.Provider>
  );
}

// HOC + Hooks (migrating legacy code)
function withAuth(Component) {
  return function AuthComponent(props) {
    const { user, loading } = useAuth(); // Hook inside HOC!
    if (loading) return <Spinner />;
    if (!user) return <Redirect to="/login" />;
    return <Component {...props} user={user} />;
  };
}
```

**Performance Implications of Each Pattern:**

```jsx
// Measured in production app with 100 components:

// 1. Custom Hooks: Fastest (0 wrapper components)
function Component() {
  const data = useFetch('/api'); // Direct state access
  return <div>{data}</div>;
}
// Render time: 12ms, Memory: 2.1MB

// 2. Compound Components: Slightly slower (context overhead)
<Tabs>
  <Tab />
</Tabs>
// Render time: 15ms, Memory: 2.3MB (context provider)

// 3. HOCs: Slower (extra wrapper components)
const Enhanced = withA(withB(withC(Component)));
// Render time: 18ms, Memory: 2.8MB (3 extra wrappers)

// 4. Render Props: Slowest (function call + wrapper)
<DataFetcher render={data => <Component data={data} />} />
// Render time: 22ms, Memory: 3.1MB (function recreation)
```

**TypeScript Considerations:**

Different patterns have different TypeScript complexities:

```typescript
// Hooks: Excellent type inference
function useFetch<T>(url: string): { data: T | null; loading: boolean } {
  // TypeScript infers return type automatically
}
const { data } = useFetch<User[]>('/users'); // data is User[] | null

// HOCs: Complex type preservation
function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, 'user'> & { requiredAuth?: boolean }> {
  // Hard to type correctly!
}

// Render Props: Manual typing needed
<DataFetcher<User[]>
  url="/users"
  render={(data: User[]) => <List data={data} />}
/>

// Props Getters: Good inference with proper types
type InputPropsOptions = { onChange?: ChangeHandler };
function getInputProps(opts: InputPropsOptions): InputPropsReturn;
```

**Migration Strategy (Legacy to Modern):**

When encountering legacy patterns, here's the migration priority:

```jsx
// Priority 1: Migrate Render Props to Hooks (high impact)
// Before:
<Mouse render={({ x, y }) => <div>{x}, {y}</div>} />

// After:
function Component() {
  const { x, y } = useMouse();
  return <div>{x}, {y}</div>;
}

// Priority 2: Migrate HOC chains to Hooks (medium impact)
// Before:
const Enhanced = withAuth(withTheme(withRouter(Component)));

// After:
function Component() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  // Flat, readable, debuggable
}

// Priority 3: Leave Compound Components (low priority)
// Already a good pattern, no need to change
<Tabs><Tab /></Tabs>
```

### 🐛 Real-World Scenario

**Production Case Study: Pattern Migration at SaaS Dashboard (2020-2021)**

**Context:** A B2B SaaS dashboard built in 2017 (React 15.6, pre-hooks) had accumulated significant technical debt across 400+ components using various patterns. After React 16.8 introduced hooks, the team planned a systematic migration.

**Initial Codebase Analysis (January 2020):**

**Pattern Distribution:**
- HOCs: 120 components (30%)
- Render Props: 80 components (20%)
- Class Components: 150 components (37.5%)
- Function Components (no hooks): 50 components (12.5%)
- **Zero custom hooks** (pre-React 16.8 codebase)

**Key Problems:**

**Problem 1: "Wrapper Hell" from HOC Chains**

```jsx
// Typical component in codebase
const DashboardWidget = withAuth(
  withTheme(
    withAnalytics(
      withErrorBoundary(
        withLogging(
          withRouter(WidgetComponent)
        )
      )
    )
  )
);

// React DevTools hierarchy:
// <withAuth>
//   <withTheme>
//     <withAnalytics>
//       <withErrorBoundary>
//         <withLogging>
//           <withRouter>
//             <WidgetComponent />
```

**Impact:**
- **React DevTools:** 6-10 extra wrapper components per component (impossible to debug)
- **Bundle size:** Each HOC added ~200-500 bytes
- **Performance:** Re-renders cascaded through wrappers (18-25ms per widget render)

**Problem 2: Render Props Callback Hell**

```jsx
// Nested render props (common pattern)
<AuthProvider>
  {({ user }) => (
    <ThemeProvider>
      {({ theme }) => (
        <DataFetcher url="/api/widgets">
          {({ data, loading }) => (
            <ErrorBoundary>
              {({ error }) => {
                if (loading) return <Spinner />;
                if (error) return <Error />;
                return <WidgetList data={data} user={user} theme={theme} />;
              }}
            </ErrorBoundary>
          )}
        </DataFetcher>
      )}
    </ThemeProvider>
  )}
</AuthProvider>
```

**Impact:**
- **Readability:** Indentation 6-8 levels deep
- **Performance:** 4 function recreations on every render
- **Testing:** Mocking 4 layers of providers for unit tests

**Problem 3: Props Drilling and Naming Conflicts**

```jsx
// HOC prop collision
const withUser = (Component) => (props) => {
  const user = useAuth();
  return <Component {...props} user={user} />;
};

const withAnalytics = (Component) => (props) => {
  const user = getAnalyticsUser(); // Different "user"!
  return <Component {...props} user={user} />; // COLLISION!
};

// Component receives whichever HOC is outermost
```

**Migration Plan (3 Phases over 12 Months):**

**Phase 1: Foundation (Months 1-3) - Create Custom Hooks**

Team created custom hooks to replace HOCs and render props:

```jsx
// Created 15 core custom hooks
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
}

function useTheme() { /* ... */ }
function useAnalytics() { /* ... */ }
function useRouter() { /* ... */ }
function useFetch(url) { /* ... */ }
```

**Results:**
- 15 hooks created covering 90% of HOC/render prop use cases
- Bundle size: **-8.5KB** (eliminated HOC wrapper code)
- Documentation: 200 pages of migration guides

**Phase 2: Systematic Migration (Months 4-9)**

**Migration Priority System:**
1. **High Traffic Components** (dashboard, user profile): Migrated first for maximum impact
2. **Heavily Nested** (6+ HOCs/render props): Most benefit from hooks
3. **Frequently Changed** (active development): Prevent future tech debt
4. **Low Risk** (well-tested, simple logic): Safe practice runs

**Migration Example:**

```jsx
// BEFORE: HOC Chain (120ms render time, 8 wrappers)
const DashboardWidget = withAuth(
  withTheme(
    withAnalytics(
      withRouter(WidgetComponent)
    )
  )
);

// AFTER: Custom Hooks (45ms render time, 0 wrappers)
function DashboardWidget() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { track } = useAnalytics();
  const router = useRouter();

  return <WidgetComponent user={user} theme={theme} track={track} router={router} />;
}
```

**Phase 2 Results (Month 9):**
- **Components migrated:** 250/400 (62.5%)
- **Average render time:** 120ms → 48ms (60% improvement)
- **React DevTools depth:** 8-12 levels → 2-4 levels
- **Bundle size:** **-42KB** (HOC wrapper code eliminated)

**Phase 3: Complex Patterns (Months 10-12)**

Some components couldn't migrate fully to hooks:

**Error Boundaries (No Hook Alternative):**
```jsx
// Kept as class component (no useErrorBoundary exists)
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
// Decision: Keep 12 error boundaries as-is (stable, working, no alternative)
```

**Compound Components (Already Good Pattern):**
```jsx
// Kept compound components (no need to change)
<Tabs>
  <TabList>
    <Tab>Profile</Tab>
    <Tab>Settings</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>...</TabPanel>
  </TabPanels>
</Tabs>
// Decision: 35 compound components kept unchanged (modern pattern)
```

**Final Results (Month 12):**

**Pattern Distribution After Migration:**
- Custom Hooks: 320 components (80%) ⬆
- Compound Components: 35 components (8.75%) ➡ (kept)
- Class Components (Error Boundaries): 12 components (3%) ➡ (kept)
- Function Components: 23 components (5.75%)
- Legacy HOCs: 10 components (2.5%) ⬇ (third-party integrations)
- **Render Props: 0 (completely migrated)** ⬇

**Performance Metrics:**
- Average component render time: **120ms → 42ms** (65% faster)
- Time to Interactive (TTI): **2.8s → 1.6s** (43% faster)
- React DevTools nesting: **8-12 levels → 2-4 levels**
- Bundle size: **-58KB JavaScript** (gzipped)
- Memory usage: **-18MB** (fewer wrapper components)

**Developer Experience:**
- **Onboarding time:** New devs productive in 3 days (was 2 weeks)
- **Debugging time:** **-55%** (simpler stack traces)
- **PR review time:** **-35%** (code more readable)
- **Test setup:** **-70% boilerplate** (no mocking HOC chains)

**Unexpected Benefits:**

1. **TypeScript Migration Accelerated:** Hooks have better type inference than HOCs, making TypeScript adoption easier

2. **Better Code Splitting:** Tree-shaking improved with hooks (no HOC wrapper functions)

3. **React DevTools Profiler:** Finally usable (wasn't before due to wrapper hell)

**Lessons Learned:**

1. **Don't migrate everything:** Error boundaries and stable compound components don't need migration
2. **Prioritize high-impact components:** Dashboard, auth flows, frequently used
3. **Create hooks library first:** Foundation before migration prevents inconsistency
4. **Gradual migration works:** 12 months, zero downtime, zero regressions

### ⚖️ Trade-offs

**Comprehensive Pattern Comparison:**

**1. Custom Hooks vs HOCs**

| Factor | Custom Hooks | HOCs | Winner |
|--------|-------------|------|--------|
| Readability | Flat, linear | Nested wrappers | **Hooks** |
| Bundle size | Smaller (no wrappers) | Larger (wrapper functions) | **Hooks** |
| Type safety | Excellent inference | Complex generic types | **Hooks** |
| Debugging | Easy (direct stack trace) | Hard (wrapper hell) | **Hooks** |
| Class component support | No (hooks only) | Yes | HOCs |
| Prop collisions | No | Yes (common problem) | **Hooks** |
| Learning curve | Moderate | Easy (just functions) | HOCs |
| Performance | Better (fewer re-renders) | Worse (cascade re-renders) | **Hooks** |

**Recommendation:** Use hooks 95% of the time. Only use HOCs for:
- Third-party class component integration (withRouter for old React Router)
- React.memo, forwardRef (HOC-like patterns with no hook alternative)
- Legacy code not worth migrating

**2. Custom Hooks vs Render Props**

| Factor | Custom Hooks | Render Props | Winner |
|--------|-------------|--------------|--------|
| Nesting | No nesting | Deep callback nesting | **Hooks** |
| Performance | Better (no function recreation) | Worse (inline functions) | **Hooks** |
| Readability | Clean, flat | Indented, nested | **Hooks** |
| Dynamic UI | Limited | Excellent | Render Props |
| Testing | Easy (just call hook) | Hard (mock render function) | **Hooks** |
| Bundle size | Smaller | Larger (render components) | **Hooks** |
| React DevTools | Clean | Extra components | **Hooks** |

**When Render Props Win:**
- Absolutely dynamic rendering based on state
- Example: React Spring (animation library)

```jsx
// Render props excel here - UI changes based on animation state
<Spring from={{ opacity: 0 }} to={{ opacity: 1 }}>
  {props => <div style={props}>Fading in</div>}
</Spring>

// Hook version is less elegant:
const springProps = useSpring({ from: { opacity: 0 }, to: { opacity: 1 }});
<div style={springProps}>Fading in</div>
// Works, but render prop is more declarative for animations
```

**3. Compound Components vs Hooks**

| Factor | Compound Components | Hooks | Winner |
|--------|-------------------|-------|--------|
| Structure enforcement | Strong (JSX structure) | Weak (user responsibility) | **Compound** |
| Flexibility | Limited (fixed structure) | High (any structure) | Hooks |
| Implicit state sharing | Yes (via context) | No (explicit passing) | **Compound** |
| Learning curve | Harder (context, cloneElement) | Easier | Hooks |
| UI consistency | Guaranteed | User-dependent | **Compound** |
| Bundle size | Larger (context + components) | Smaller | Hooks |

**Decision Matrix:**

```jsx
// Use Compound Components when:
// - Structure is critical (Tab + TabPanel must match)
// - Implicit state sharing improves DX
<Tabs>
  <Tab />   {/* Must be inside Tabs */}
  <TabPanel /> {/* Must match Tab order */}
</Tabs>

// Use Hooks when:
// - Flexible structure needed
// - No implicit coupling between components
const { activeTab, setActiveTab } = useTabs();
<div>
  <button onClick={() => setActiveTab(0)}>Tab 1</button> {/* Anywhere */}
  {activeTab === 0 && <Panel1 />}
</div>
```

**4. Pattern Complexity vs Flexibility:**

```jsx
// Simple → Complex (left to right)
// Flexible → Restrictive (top to bottom)

// Most Flexible, Least Structure
Props (plain components)
  ↓
Custom Hooks (logic reuse)
  ↓
Props Getters (flexible + enforced)
  ↓
Render Props (controlled rendering)
  ↓
Compound Components (enforced structure)
  ↓
HOCs (wrapped behavior)
  ↓
// Most Restrictive, Most Structure
```

**5. Performance Deep Dive:**

**Re-render Behavior:**

```jsx
// Measured in production app with 50 child components:

// 1. Hooks: Only changed components re-render
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Child1 /> {/* Doesn't re-render unless own state changes */}
      <Child2 count={count} /> {/* Only this re-renders */}
    </>
  );
}
// Re-renders: 1 component (Child2)

// 2. HOC: Wrapper components can trigger cascades
const Enhanced = withCounter(Parent);
// Re-renders: 3 components (withCounter wrapper, Parent, Child2)

// 3. Render Props: Function recreation triggers re-renders
<Counter>
  {({ count }) => <Child2 count={count} />}
</Counter>
// Re-renders: 2 components (Counter, Child2)
// Plus function recreation overhead
```

**Bundle Size Impact (Measured in Real App):**

```
Plain Hooks: +0KB (built into React)
Props Getters: +0.3KB (callAll helper)
Compound Components: +0.8KB (context provider)
HOCs: +1.5KB (wrapper functions + hoisting logic)
Render Props: +1.2KB (render component + function handling)
```

### 💬 Explain to Junior

**The Tool Analogy:**

Imagine you're building furniture. You have different tools:

**Custom Hooks = Swiss Army Knife:**
- One tool, many uses
- Your go-to for 90% of tasks
- "I need to fetch data" → `useFetch`
- "I need authentication" → `useAuth`

**Compound Components = IKEA Instructions:**
- Step-by-step structure you must follow
- Can't skip steps or change order
- ```jsx
  <Tabs>          {/* Step 1: Container */}
    <Tab />       {/* Step 2: Buttons */}
    <TabPanel />  {/* Step 3: Content */}
  </Tabs>
  // Order matters! TabPanel must match Tab
  ```

**HOCs = Gift Wrapping:**
- Wrap something to add features
- Can wrap multiple times (like wrapping paper layers)
- ```jsx
  const Gift = withAuth(withLogging(Component));
  // Component wrapped in authentication, then wrapped in logging
  ```
- **Problem:** Too many layers = can't find the gift inside!

**Render Props = Custom Cake Decorator:**
- You provide the cake (data), decorator decides how it looks
- ```jsx
  <CakeDecorator>
    {(frosting, sprinkles) => (
      <Cake frosting={frosting} sprinkles={sprinkles} />
    )}
  </CakeDecorator>
  ```
- **Problem:** Too flexible = inconsistent results

**Key Decision Tree for Juniors:**

```jsx
// START HERE
"What do I need to do?"

├─ Share logic (fetch data, manage state)?
│  └─ ✅ Use Custom Hook
│     const { data } = useFetch('/api');
│
├─ Build UI with strict structure (tabs, accordion)?
│  └─ ✅ Use Compound Components
│     <Tabs><Tab /><TabPanel /></Tabs>
│
├─ Wrap component to add features (auth, logging)?
│  ├─ Modern codebase? ✅ Use Hook inside component
│  └─ Legacy/class component? ✅ Use HOC
│
└─ Absolutely need dynamic rendering?
   ├─ Animation library? ✅ Render Props okay
   └─ Everything else? ✅ Use Hook instead
```

**Common Junior Mistakes:**

```jsx
// ❌ Mistake 1: Using HOCs when hooks work better
const EnhancedComponent = withAuth(Component);

// ✅ Better: Use hook
function Component() {
  const { user } = useAuth();
  // Cleaner, easier to debug
}

// ❌ Mistake 2: Nested render props
<DataFetcher>
  {data => (
    <ThemeProvider>
      {theme => (
        <UserContext>
          {user => {
            // 4 levels deep! Hard to read!
          }}
        </UserContext>
      )}
    </ThemeProvider>
  )}
</DataFetcher>

// ✅ Better: Flat hooks
function Component() {
  const data = useFetch('/api');
  const theme = useTheme();
  const user = useUser();
  // Easy to read!
}

// ❌ Mistake 3: Custom hook for everything
function useButtonColor() {
  return 'blue';
}
// Overkill! Just use a constant or prop

// ✅ Better: Only use hooks for stateful logic
const BUTTON_COLOR = 'blue';
```

**Interview Answer Template:**

**Question:** "When should you use HOC vs Render Props vs Custom Hooks?"

**Answer:**

"In modern React (16.8+), **custom hooks should be your default choice** for sharing stateful logic. They're simpler, more performant, and easier to compose than HOCs or render props.

**Here's my decision framework:**

**1. Custom Hooks (90% of cases):**
- Sharing state or side effects between components
- Examples: `useFetch`, `useAuth`, `useLocalStorage`
- Advantages: No wrapper components, flat code, great TypeScript support
- Use this unless hooks can't solve the problem

**2. Compound Components:**
- Complex UI with enforced structure and implicit state sharing
- Examples: Tabs, Accordion, Select dropdown
- When child components must communicate with parent and order matters
- Hooks can't enforce structure like compound components can

```jsx
<Tabs>
  <Tab />    {/* Must be inside Tabs, must have matching TabPanel */}
  <TabPanel />
</Tabs>
```

**3. HOCs (rare, specific cases):**
- Wrapping class components (can't use hooks)
- Third-party library integration (old React Router's `withRouter`)
- Built-in patterns with no alternative (`React.memo`, `forwardRef`)
- Legacy codebases not worth migrating

**4. Render Props (legacy, avoid for new code):**
- Only for animation libraries or truly dynamic rendering
- Migrate existing render props to hooks when refactoring
- Performance overhead: function recreation every render

**Real-world example:**

At [company], we migrated a 400-component dashboard from HOCs/render props to hooks over 12 months:
- **Performance:** Render time 120ms → 42ms (65% faster)
- **Bundle size:** -58KB JavaScript
- **Debugging:** React DevTools depth 8-12 → 2-4 levels
- **Developer velocity:** Onboarding 2 weeks → 3 days

**We kept:**
- 12 error boundaries (no hook alternative)
- 35 compound components (already good pattern)
- 10 HOCs (third-party integration)

**Key takeaway:** Start with hooks. Only reach for other patterns when hooks genuinely can't solve the problem."

**Difficulty Adaptation:**
- **Junior:** Focus on "hooks first", simple examples, decision tree
- **Mid:** Add migration story, performance metrics, when hooks aren't enough
- **Senior:** Discuss bundle size analysis, TypeScript implications, compound component internals, error boundary alternatives

---

## Question 5: Pattern Best Practices

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐
**Time:** 8 minutes
**Companies:** Senior interviews

### Question
What are best practices when choosing and implementing React patterns?

### Answer

**Best Practices** - Choose the simplest pattern that solves your problem, favor hooks over HOC/render props.

**Key Points:**
1. **Start simple** - Don't over-engineer
2. **Hooks first** - Modern default
3. **Composition** - For UI structure
4. **Context sparingly** - Only for global state
5. **Document** - Make patterns clear to team

### Code Example

```jsx
// ❌ Over-engineered
const EnhancedComponent = withAuth(
  withLogging(
    withAnalytics(
      withTheme(Component)
    )
  )
);

// ✅ Use hooks instead
function Component() {
  const { user } = useAuth();
  const { log } = useLogging();
  const { track } = useAnalytics();
  const { theme } = useTheme();

  // Clean, readable, testable
}

// ❌ Unnecessary render prop
<DataFetcher
  url="/api/users"
  render={({ data, loading }) => (
    loading ? <Spinner /> : <UserList users={data} />
  )}
/>

// ✅ Custom hook instead
function UserListContainer() {
  const { data: users, loading } = useFetch('/api/users');

  if (loading) return <Spinner />;
  return <UserList users={users} />;
}

// ✅ When to use each pattern
// - Hooks: Logic reuse (90% of cases)
// - Composition: UI structure
// - Compound Components: Complex UI with shared state
// - Context: Global state (auth, theme, i18n)
// - HOC: Legacy code, third-party integration
// - Render Props: Legacy code (migrate to hooks)
```

### 🔍 Deep Dive

**Pattern Best Practices and Anti-Patterns:**

Choosing the right React pattern is more art than science. It requires understanding trade-offs, team capabilities, and long-term maintainability. Let's explore comprehensive best practices grounded in real-world production experience.

**The Simplicity Principle:**

The most important best practice: **Start with the simplest pattern that solves your problem.** Premature abstraction is worse than no abstraction.

```jsx
// ❌ Over-abstraction (seen in real codebases)
// A toggle component that became absurdly complex
function useToggle(initialValue, {
  onToggle,
  beforeToggle,
  afterToggle,
  toggleIf,
  reducer,
  middleware
}) {
  // 150 lines of "flexible" logic
  // NO ONE understood this
}

// ✅ Start simple
function useToggle(initialValue) {
  const [on, setOn] = useState(initialValue);
  const toggle = () => setOn(prev => !prev);
  return { on, toggle };
}
// Add complexity ONLY when needed
```

**Best Practice 1: Hooks-First Approach (Post-2019)**

In modern React, hooks should be your default for **ALL** stateful logic sharing:

```jsx
// Modern React component checklist:
// 1. Can this be a custom hook? → YES (90% of time)
// 2. Does it need strict UI structure? → Compound Components (5%)
// 3. Is it for error handling? → Error Boundary class (3%)
// 4. Third-party class component? → HOC (2%)

// Real metrics from 2024 codebases:
// - Hooks: 90-95% of logic reuse
// - Compound Components: 3-5%
// - Error Boundaries: 1-2%
// - HOCs: 1-2% (legacy only)
// - Render Props: <1% (legacy, migration in progress)
```

**Best Practice 2: Composition Over Configuration**

Favor component composition (children) over complex configuration props:

```jsx
// ❌ Anti-pattern: Configuration hell
<Modal
  title="Confirm"
  body="Are you sure?"
  primaryButton="Yes"
  secondaryButton="No"
  onPrimary={handleYes}
  onSecondary={handleNo}
  titleAlign="center"
  titleColor="red"
  bodySize="large"
  buttonLayout="stacked"
  showCloseIcon={true}
  closeIconPosition="top-right"
  // 20+ more props...
/>
// Impossible to remember all props!
// TypeScript autocomplete is overwhelming!

// ✅ Better: Composition (children)
<Modal>
  <ModalHeader align="center" color="red">Confirm</ModalHeader>
  <ModalBody size="large">Are you sure?</ModalBody>
  <ModalFooter layout="stacked">
    <Button onClick={handleYes}>Yes</Button>
    <Button onClick={handleNo}>No</Button>
  </ModalFooter>
  <ModalClose position="top-right" />
</Modal>
// Discoverable, flexible, easier to understand
```

**Best Practice 3: Context Sparingly (Avoid "Context Hell")**

Context is often overused for prop drilling that isn't actually problematic:

```jsx
// ❌ Anti-pattern: Context for everything
// Team created 40+ contexts for a medium-sized app!
<AuthContext>
  <ThemeContext>
    <LanguageContext>
      <NotificationContext>
        <AnalyticsContext>
          <FeatureFlagContext>
            {/* 34 more contexts... */}
            <App />
          </FeatureFlagContext>
        </AnalyticsContext>
      </NotificationContext>
    </LanguageContext>
  </ThemeContext>
</AuthContext>

// ✅ Better: Context only for truly global state
// Only 3-5 contexts for typical app:
// 1. Auth (user session)
// 2. Theme (dark/light mode)
// 3. I18n (language/locale)
// 4. Router (navigation state)
// Everything else: props or custom hooks

// For non-global state, just pass props!
<Dashboard user={user} theme={theme} /> // 2 props is FINE
```

**Best Practice 4: Document Your Patterns**

Patterns are invisible to new team members without documentation:

```jsx
// ✅ Document compound components
/**
 * Tabs - Accessible tab component using compound component pattern
 *
 * @example
 * <Tabs defaultValue="profile">
 *   <TabList>
 *     <Tab value="profile">Profile</Tab>
 *     <Tab value="settings">Settings</Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel value="profile">Profile content</TabPanel>
 *     <TabPanel value="settings">Settings content</TabPanel>
 *   </TabPanels>
 * </Tabs>
 *
 * @important Tab values must match TabPanel values
 * @important TabList and TabPanels must be direct children of Tabs
 * @see https://docs.company.com/patterns/tabs
 */
function Tabs({ children, defaultValue }) {
  // Implementation
}
```

**Best Practice 5: Avoid Pattern Mixing (Cognitive Load)**

Don't mix too many patterns in one component:

```jsx
// ❌ Anti-pattern: Pattern soup
function Dashboard() {
  // Custom hook
  const { data } = useFetch('/api/stats');

  // HOC-wrapped component
  const EnhancedWidget = withAuth(Widget);

  // Render prop
  return (
    <DataProvider
      render={({ userId }) => (
        // Compound component
        <Tabs>
          <Tab>{/* ... */}</Tab>
        </Tabs>
      )}
    />
  );
}
// Using 4 different patterns! Confusing!

// ✅ Better: Consistent pattern usage
function Dashboard() {
  const { data } = useFetch('/api/stats'); // Hooks
  const { userId } = useAuth(); // Hooks
  const { theme } = useTheme(); // Hooks

  return (
    <Tabs> {/* Compound (established pattern for tabs) */}
      <Tab>Stats: {data}</Tab>
    </Tabs>
  );
}
// Predictable, consistent
```

**Best Practice 6: Progressive Enhancement**

Start simple, add complexity progressively:

```jsx
// Phase 1: Simple hook (Week 1)
function useFetch(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData);
  }, [url]);
  return data;
}

// Phase 2: Add loading state (Week 3, user request)
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [url]);
  return { data, loading };
}

// Phase 3: Add error handling (Month 2, production errors)
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);
  return { data, loading, error };
}

// Phase 4: Add caching (Month 6, performance optimization)
// Only add when actually needed!
```

**Advanced Best Practices:**

**1. TypeScript-First Pattern Design:**

```typescript
// Design patterns with TypeScript from the start
// Prevents refactoring pain later

// ✅ Strongly typed hook
function useFetch<T>(url: string): {
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  // Implementation
}

// Usage has perfect inference
const { data } = useFetch<User[]>('/api/users');
// data is User[] | null (autocomplete works!)

// ✅ Strongly typed compound component
type TabsProps = {
  children: React.ReactElement<TabListProps | TabPanelsProps>[];
  defaultValue?: string;
};
// TypeScript enforces correct children
```

**2. Performance-Aware Pattern Selection:**

Different patterns have different performance characteristics:

```jsx
// For 100+ component lists:
// - Hooks: Fastest (no wrapper overhead)
// - Compound Components: Moderate (context overhead acceptable)
// - HOCs: Slow (wrapper re-renders cascade)

// Measured in production:
// 100 items with hooks: 45ms render
// 100 items with compound: 62ms render
// 100 items with 3-layer HOC: 120ms render
```

**3. Testability-Driven Pattern Choice:**

```jsx
// Hooks: Easy to test (just call the hook)
const { result } = renderHook(() => useFetch('/api'));
expect(result.current.loading).toBe(true);

// Compound Components: Moderate (need full render)
render(<Tabs><Tab /></Tabs>);
// Must render full component tree

// HOCs: Hard (need to mock wrappers)
const Enhanced = withAuth(withTheme(Component));
// Must mock both withAuth AND withTheme contexts!
```

### 🐛 Real-World Scenario

**Production Case Study: Pattern Standardization at 50-Person Engineering Team (2022-2023)**

**Context:** A fast-growing startup scaled from 10 to 50 engineers in 18 months. With no pattern guidelines, each team developed different approaches to the same problems. This created onboarding nightmares and inconsistent codebases across 12 micro-frontends.

**Initial Problem Analysis (January 2022):**

**Pattern Chaos Metrics:**
- **7 different data fetching patterns** across codebase (HOCs, render props, hooks, utilities, services, etc.)
- **Zero documentation** on when to use which pattern
- **Onboarding time:** New devs took 4-6 weeks to be productive
- **Code review time:** 40% of comments were "why not use pattern X instead?"
- **Bug rate:** Higher in code using unfamiliar patterns (68% of bugs in 30% of codebase using "exotic" patterns)

**Specific Examples of Chaos:**

**Data Fetching (7 different approaches):**

```jsx
// Team A: HOC pattern
const DataFetcherHOC = withDataFetch('/api/users');

// Team B: Render props
<DataFetcher url="/api/users" render={data => <List data={data} />} />

// Team C: Custom hook
const { data } = useFetch('/api/users');

// Team D: useEffect + fetch
useEffect(() => { fetch('/api/users').then(...); }, []);

// Team E: Service class
const data = await UserService.fetch();

// Team F: Redux thunk
dispatch(fetchUsers());

// Team G: SWR library
const { data } = useSWR('/api/users', fetcher);

// ALL DOING THE SAME THING! Confusing!
```

**State Management (5 different approaches):**
- Context API (3 implementations)
- Redux (2 different setups)
- Zustand
- Jotai
- Local state + prop drilling

**Solution: Pattern Standardization Initiative**

**Phase 1: Pattern Audit & Decision (Months 1-2)**

Team leads analyzed all 12 micro-frontends and voted on standard patterns:

**Decisions Made:**

| Use Case | Standard Pattern | Rationale | Alt Teams Migrated |
|----------|-----------------|-----------|-------------------|
| Data fetching | React Query hooks | Industry standard, caching built-in | 6 teams |
| State logic | Custom hooks | Simplest, most flexible | 8 teams |
| Global state | Context (max 5) | Built-in, sufficient for needs | 4 teams |
| Complex UI | Compound Components | Best DX for tabs/accordion/etc | 3 teams |
| Auth gates | Custom hook (`useAuth`) | No HOC wrapper hell | 7 teams |

**Phase 2: Documentation & Examples (Month 3)**

Created comprehensive pattern guide:

```markdown
# Company React Patterns Guide

## ✅ Approved Patterns

### 1. Custom Hooks (90% of cases)
**When:** Sharing stateful logic
**Example:** `useFetch`, `useAuth`, `useLocalStorage`
**Docs:** [Link to internal docs]

### 2. Compound Components (Complex UI)
**When:** Tabs, Accordion, Select, Modal
**Example:** See Storybook → Patterns → Compound
**Docs:** [Link to internal docs]

### 3. Context (Global State ONLY)
**Limit:** Max 5 contexts per app
**Approved contexts:** Auth, Theme, I18n, Router, Feature Flags
**When:** Truly global state (100+ components need access)
**Docs:** [Link to internal docs]

## ❌ Discouraged Patterns

### HOCs (Use hooks instead)
### Render Props (Migrate to hooks)
### Class Components (Migrate to functions + hooks)

## 🛠️ Migration Guides
[Links to step-by-step migration docs]
```

**Phase 3: Automated Migration (Months 4-7)**

Created codemods to automate 60% of migrations:

```bash
# Codemod: withAuth HOC → useAuth hook
npx jscodeshift -t transforms/with-auth-to-use-auth.js src/

# Before:
# const Enhanced = withAuth(Component);

# After:
# function Component() {
#   const { user } = useAuth();
#   // ...
# }

# Automated 180 components (60% of auth code)
# Manual review needed for 120 components (40%)
```

**Phase 4: Enforcement (Months 8-12)**

Implemented automated checks:

**ESLint Rules:**
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Prevent new HOCs
    'react-hooks/no-hoc': 'error',

    // Prevent new render props
    'react/no-render-prop': 'error',

    // Limit context creation
    'react/max-contexts-per-file': ['error', 1],

    // Custom rules
    'company/prefer-custom-hooks': 'error',
    'company/approved-patterns-only': 'warn'
  }
};
```

**Results After 12 Months:**

**Pattern Distribution Before → After:**
- Custom Hooks: 25% → 88% ⬆
- Compound Components: 5% → 7% ➡
- Context: 15% (40+ contexts) → 8% (12 contexts) ⬇
- HOCs: 30% → 2% ⬇ (legacy only)
- Render Props: 15% → 0% ⬇ (fully migrated)
- Other/Chaos: 10% → 0% ⬇

**Business Metrics:**

**Developer Velocity:**
- Onboarding time: **4-6 weeks → 1.5 weeks** (73% faster)
- PR review time: **-50%** (fewer pattern discussions)
- Code review quality: **+40%** (focused on logic, not pattern debates)
- Cross-team collaboration: **+60%** (engineers could contribute to any micro-frontend)

**Code Quality:**
- Bug rate: **-45%** (especially in data fetching)
- Test coverage: **68% → 85%** (hooks easier to test)
- Lines of code: **-12%** (simpler patterns = less code)
- TypeScript adoption: **+35%** (hooks have better inference)

**Performance:**
- Average component render time: **-28%** (fewer wrapper components)
- Bundle size: **-85KB** across all micro-frontends
- Memory usage: **-22MB** (fewer object allocations)

**Unexpected Benefits:**

1. **Recruiting Advantage:** Candidates preferred company with modern patterns over competitors still using HOCs/render props

2. **Open Source Contributions:** Standardized patterns → easier to extract internal libraries to open source

3. **Better Documentation:** Pattern guide became internal knowledge base, improved by entire team

**Challenges Faced:**

**Challenge 1: Resistance from Senior Developers**

Some engineers who invented custom patterns resisted standardization:

**Solution:**
- Showed metrics: bug rate, onboarding time, PR review time
- Included them in decision-making process
- Allowed "exceptions with justification" (strict approval process)

**Challenge 2: Legacy Code Maintenance**

200+ components using old patterns couldn't be migrated immediately:

**Solution:**
- Created "pattern version" tags in code
- `// @pattern-version: legacy-hoc` = old pattern, will migrate
- `// @pattern-version: v2-hooks` = modern pattern
- Prevented pattern mix within single file

**Challenge 3: Third-Party Library Integration**

Some libraries required HOC pattern (old React Router, etc.):

**Solution:**
- Created thin wrapper hooks:
```jsx
// Library forces HOC: withRouter
// We created: useRouter hook that wraps it
function useRouter() {
  const RouterComponent = ({ match, history }) => {
    React.useEffect(() => {
      routerRef.current = { match, history };
    });
    return null;
  };
  const Enhanced = withRouter(RouterComponent);
  // ... return router object
}
// Now everyone uses useRouter (consistent API)
```

### ⚖️ Trade-offs

**Pattern Best Practices Decision Matrix:**

**1. Simplicity vs Flexibility**

| Approach | Simplicity | Flexibility | When to Choose |
|----------|-----------|-------------|----------------|
| Hardcoded values | Highest | Lowest | Prototypes, one-offs |
| Props | High | Moderate | Standard components |
| Custom Hooks | Moderate | High | Logic reuse (default choice) |
| Compound Components | Low | Moderate | Complex UI with structure |
| Props Getters | Low | Highest | Library APIs, max customization |

**Decision Rule:** Choose the simplest pattern that meets current needs. Refactor to more flexible pattern ONLY when requirements prove it necessary.

**2. Documentation Overhead vs Long-Term Maintainability**

| Pattern | Doc Overhead | Maintenance | Team Size Impact |
|---------|-------------|-------------|------------------|
| Plain props | Low | Easy | Works for small teams (2-5) |
| Custom hooks | Moderate | Easy | Scales to medium teams (5-20) |
| Compound Components | High | Moderate | Needs docs for large teams (20+) |
| Advanced patterns | Very High | Hard | Only with dedicated DX team |

**Real Metrics:**
- Small team (<10 devs): Verbal communication works, minimal docs needed
- Medium team (10-50 devs): Pattern guide essential, reduces onboarding 4-6 weeks → 1.5 weeks
- Large team (50+ devs): Automated enforcement (ESLint) + comprehensive docs + pattern library required

**3. Performance vs Developer Experience**

```jsx
// Most performant: Inline everything (horrible DX)
function Button({ onClick }) {
  return <button onClick={onClick}>Click</button>;
}
// Fast but repetitive

// Best DX: Abstract everything (potential perf cost)
<Button
  onClick={handleClick}
  variant="primary"
  size="large"
  leftIcon={<Icon />}
  loading={loading}
  // ...50 more props
/>
// Easy to use but heavier bundle

// Balanced: Composition
<Button onClick={handleClick} variant="primary">
  <Icon /> Click me
</Button>
// Good perf + good DX
```

**Measured Trade-offs:**
- Over-abstraction cost: +15-30KB bundle size (unnecessary flexibility)
- Under-abstraction cost: +200-400 lines duplicated code per feature
- Sweet spot: Abstract when 3+ usages exist (measured from real codebases)

**4. Standardization vs Innovation**

| Approach | Pros | Cons | When to Use |
|----------|------|------|-------------|
| Strict standards | Consistency, easy onboarding | Stifles innovation | Large teams, established products |
| Zero standards | Maximum flexibility | Chaos, hard to maintain | Prototypes, R&D teams |
| "Approved + exceptions" | Balance | Needs governance process | Most production teams |

**Real Example:**
- **Startup (10 devs):** Light guidelines, experiment freely
- **Scale-up (50 devs):** Standard patterns with escape hatches
- **Enterprise (200+ devs):** Strict standards, exception approval required

**5. Migration Cost vs Long-Term Benefit**

**Cost-Benefit Analysis (From Real Migration):**

| Migration Type | Effort (dev-weeks) | Benefit (annual) | ROI Timeline |
|----------------|-------------------|------------------|--------------|
| HOCs → Hooks | 40 weeks | -45% bug rate, -50% PR time | 6 months |
| Render Props → Hooks | 25 weeks | -28% render time, -30% onboarding | 4 months |
| Context sprawl → 5 contexts | 15 weeks | -22MB memory, +60% cross-team collab | 3 months |

**Decision Rule:**
- High-traffic code: Migrate immediately (ROI in weeks)
- Low-traffic code: Migrate when touched (opportunistic)
- Legacy stable code: Never migrate (if it works, don't fix it)

### 💬 Explain to Junior

**The Restaurant Kitchen Analogy:**

Imagine managing a restaurant kitchen with 10 chefs. Without standards:

**Without Pattern Standards (Chaos):**
- Chef A makes pizza with dough recipe X
- Chef B makes pizza with dough recipe Y
- Chef C makes pizza with dough recipe Z
- New chef arrives: "Which recipe should I use?" → Confused!
- Customer orders pizza: "Which version will I get?" → Inconsistent!

**With Pattern Standards:**
- **Official Pizza Recipe:** Everyone uses the same base recipe
- **Approved Variations:** Listed in the cookbook
- **New Chef:** Follows the cookbook, productive immediately
- **Customer:** Consistent product every time

**React Patterns = Kitchen Recipes:**

```jsx
// ❌ Chaos: Every component does data fetching differently
// Component A:
const withDataA = (Component) => {/* ... */};

// Component B:
<DataFetcher render={data => {/* ... */}} />

// Component C:
const { data } = useFetch('/api');

// NEW DEVELOPER: "Which one should I use???" 😵

// ✅ Standard: Everyone uses the same pattern
const { data } = useFetch('/api'); // Always this!
// NEW DEVELOPER: "Got it! I'll use useFetch" 😊
```

**Key Principles for Juniors:**

**1. Start Simple, Add Complexity Later:**

```jsx
// Week 1: Simple toggle
function useToggle(initial) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn(!on);
  return { on, toggle };
}
// Perfect! Don't add features you don't need yet

// ❌ Don't do this on Week 1:
function useToggle(initial, {
  onToggle,
  middleware,
  reducer,
  plugins
}) {
  // 200 lines of code NO ONE asked for!
}
```

**2. Hooks First (95% of Time):**

```jsx
// Your default thought process:
"I need to share logic"
  ↓
"Can I use a custom hook?"
  ↓
YES → Use hook (95% of time)
NO → Ask senior why hook won't work
```

**3. Don't Mix Too Many Patterns:**

```jsx
// ❌ Confusing: Too many patterns in one file
function Dashboard() {
  // Pattern 1: HOC
  const Enhanced = withAuth(Component);

  // Pattern 2: Render prop
  <DataProvider render={data => (
    // Pattern 3: Compound component
    <Tabs><Tab /></Tabs>
  )} />
}
// Hard to understand what's happening!

// ✅ Clear: Consistent pattern usage
function Dashboard() {
  const { user } = useAuth(); // Hook
  const { data } = useFetch(); // Hook
  const { theme } = useTheme(); // Hook

  return <Tabs><Tab /></Tabs>; // Compound (standard for tabs)
}
// Easy to follow!
```

**Common Junior Mistakes:**

```jsx
// ❌ Mistake 1: Creating custom hook for non-stateful logic
function useButtonColor() {
  return 'blue'; // No state! Just a constant!
}

// ✅ Better: Just use a variable
const BUTTON_COLOR = 'blue';

// ❌ Mistake 2: Over-abstracting too early
// Created after 1 usage!
function useFormWithValidationAndAnalyticsAndLogging() {
  // 500 lines of code for ONE form!
}

// ✅ Better: Wait for 3+ usages before abstracting
// First 2 forms: Duplicate code (fine!)
// Third form: "Hey, I'm copying the same code again"
// NOW create useForm hook

// ❌ Mistake 3: Ignoring team patterns
// Team uses custom hooks, but junior uses HOC because they learned it first
const Enhanced = withAuth(Component);

// ✅ Better: Follow team standards
const { user } = useAuth(); // What the team uses
```

**Interview Answer Template:**

**Question:** "What are best practices for choosing React patterns?"

**Answer:**

"The most important principle is **start simple and add complexity only when needed.** Premature abstraction causes more problems than it solves.

**My pattern selection framework:**

**1. Hooks First (Default):**
- 90-95% of logic sharing should use custom hooks
- Simplest, most performant, best TypeScript support
- Only deviate from hooks when hooks genuinely can't solve the problem

**2. Composition for UI (Children Props):**
- Prefer component composition over configuration props
- `<Modal><ModalHeader /><ModalBody /></Modal>` is better than 20 configuration props
- More flexible, more discoverable, easier to extend

**3. Context Sparingly (3-5 Max):**
- Only for truly global state (auth, theme, i18n)
- Avoid "context hell" - 40+ contexts is too many
- Most state should be local or passed via props

**4. Document Your Patterns:**
- Patterns are invisible without documentation
- Create pattern guide showing when to use what
- Include code examples and migration guides

**5. Progressive Enhancement:**
- Start with simplest implementation
- Add features ONLY when users request them
- Example: `useFetch` started with just `data`, added `loading`, then `error`, then caching - over months

**Real-world example:**

At [company], we standardized patterns across 50 engineers and 12 micro-frontends:

**Before standardization:**
- 7 different data fetching patterns (chaos!)
- Onboarding: 4-6 weeks
- 40% of code reviews about pattern choice
- Bug rate higher in unfamiliar patterns

**After standardization:**
- 1 standard data fetching pattern (React Query hooks)
- Onboarding: 1.5 weeks (73% faster)
- Code reviews focused on logic, not patterns
- Bug rate -45%

**Patterns we standardized:**
- Data fetching: React Query hooks
- Logic reuse: Custom hooks
- Global state: Context (max 5)
- Complex UI: Compound components
- **Discouraged:** HOCs, render props (migrate to hooks)

**Key decisions:**
1. **Document first:** Created comprehensive pattern guide
2. **Automate enforcement:** ESLint rules prevented new HOCs/render props
3. **Gradual migration:** 12 months, zero downtime
4. **Exception process:** Strict approval for non-standard patterns

**Trade-offs:**
- **Standardization** reduces flexibility but improves consistency
- **Documentation** takes time but reduces onboarding from weeks to days
- **Migration** costs effort upfront but pays off in months (measured ROI)

**Key takeaway:** Prioritize simplicity, document your decisions, enforce with tooling, and measure the impact."

**Difficulty Adaptation:**
- **Junior:** Focus on "hooks first", simplicity principle, team standards
- **Mid:** Add pattern guide creation, migration strategies, cost-benefit analysis
- **Senior:** Discuss governance models, exception processes, measuring pattern ROI, scaling to 50+ engineers

---

**[← Back to React README](./README.md)**

**Progress:** 15 of 15 component patterns completed ✅
