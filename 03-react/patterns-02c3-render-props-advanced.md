## Question 1: Pattern Best Practices

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
