# React Testing Library - Testing Components

## Question 1: How to test React components with React Testing Library?

### Answer

React Testing Library (RTL) is a testing utility that encourages testing React components from a user's perspective rather than implementation details. It provides a set of queries to find elements the way users would (by text, label, role, etc.) and utilities to interact with them (clicking, typing, etc.).

The core philosophy is: **"The more your tests resemble the way your software is used, the more confidence they can give you."** Instead of testing component state or props directly, RTL focuses on what users see and do.

Key concepts:
- **Queries**: Methods to find elements (getBy, queryBy, findBy variants)
- **User interactions**: Simulated user events via `@testing-library/user-event`
- **Async utilities**: Tools for testing asynchronous behavior (waitFor, findBy)
- **Accessibility**: Built-in encouragement for accessible markup via role-based queries

Basic testing workflow:
1. Render the component with `render()`
2. Find elements using queries (prefer accessible queries)
3. Interact with elements using `userEvent`
4. Assert on the expected outcome

RTL automatically cleans up after each test, provides helpful error messages when elements aren't found, and integrates seamlessly with Jest or Vitest.

---

### 🔍 Deep Dive: RTL Philosophy, Query Priorities, and Accessibility Testing

<details>
<summary><strong>🔍 Deep Dive: RTL Philosophy, Query Priorities, and Accessibility Testing</strong></summary>

#### The Guiding Principles and Philosophical Foundation

React Testing Library represents a paradigm shift in how we approach frontend testing. Created by Kent C. Dodds in 2018, it challenges the conventional wisdom that tests should have access to component internals. While its predecessor Enzyme (Airbnb, 2015) provided methods like `wrapper.state()`, `wrapper.instance()`, and `shallow()` rendering, RTL intentionally restricts access to these implementation details.

The core philosophy stems from a simple question: **"How do users interact with your application?"** Users don't call component methods or check state values—they see rendered HTML, click buttons, type in inputs, and observe changes on screen. Therefore, tests should mirror this behavior to provide meaningful confidence that the application actually works for end users.

**Why avoid implementation details?**

Testing implementation details leads to brittle tests that break during refactoring even when user experience remains identical. Consider this example:

```javascript
// ❌ BAD: Testing implementation (Enzyme-style)
const wrapper = shallow(<Counter />);
expect(wrapper.state('count')).toBe(0);
wrapper.instance().increment();
expect(wrapper.state('count')).toBe(1);

// ✅ GOOD: Testing user behavior (RTL-style)
render(<Counter />);
expect(screen.getByText('Count: 0')).toBeInTheDocument();
userEvent.click(screen.getByRole('button', { name: /increment/i }));
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

The Enzyme example fails immediately when refactoring from class components to hooks because `wrapper.state()` and `wrapper.instance()` no longer exist. The RTL example continues passing as long as the user-visible behavior remains the same—you can change from `useState` to `useReducer`, from Context to Redux, or completely restructure your component tree, and the test remains valid.

This approach also catches more meaningful bugs. A test that checks `state.isLoading === false` might pass while the loading spinner is still visible to users due to a rendering bug. An RTL test using `expect(screen.queryByText('Loading...')).not.toBeInTheDocument()` catches this real user-facing issue.

#### Query Priority Hierarchy and Accessibility-First Testing

RTL provides multiple ways to query elements, but they're deliberately not created equal. The official priority order directly reflects how real users—including those using assistive technologies like screen readers—interact with your application. This hierarchy isn't arbitrary; it's based on the W3C Accessibility Guidelines and real-world usage patterns.

**Priority Tier 1: Queries Accessible to Everyone (Screen Reader Compatible)**

The highest priority queries are those that work identically for sighted users and users with assistive technologies:

```javascript
// Priority 1: getByRole (BEST - most accessible)
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /email/i });
screen.getByRole('heading', { name: /welcome/i, level: 1 });

// Priority 2: getByLabelText (forms)
screen.getByLabelText('Email address');
screen.getByLabelText(/password/i);

// Priority 3: getByPlaceholderText (fallback for forms)
screen.getByPlaceholderText('Enter email...');

// Priority 4: getByText (non-interactive content)
screen.getByText('Welcome back!');
screen.getByText(/logged in as/i);

// Priority 5: getByDisplayValue (current form values)
screen.getByDisplayValue('john@example.com');
```

**Why `getByRole` is superior:**

`getByRole` is the gold standard because it forces you to use proper semantic HTML and ARIA roles. When you write `screen.getByRole('button')`, you're ensuring your button is actually implemented as a `<button>` element (or has `role="button"` with proper keyboard handling). A `<div onClick={...}>` won't match this query, immediately revealing an accessibility problem.

Role-based queries also support rich filtering options that match how assistive technologies announce elements:

```javascript
getByRole('button', {
  name: /submit/i,           // Accessible name (text content, aria-label, or aria-labelledby)
  pressed: true,             // aria-pressed state
  expanded: false,           // aria-expanded state
  hidden: true,              // Include hidden elements
  selected: false,           // aria-selected state
  checked: true              // aria-checked state (checkboxes/radios)
});

getByRole('heading', {
  name: /dashboard/i,
  level: 1                   // Specific heading level (h1, h2, etc.)
});
```

This specificity is powerful. You can distinguish between "the submit button that's currently pressed" versus "the submit button that's not pressed," mirroring exactly what a screen reader user would experience.

**Priority Tier 2: Semantic Queries (Visual/Semantic Context)**

```javascript
// Priority 6: getByAltText (images)
screen.getByAltText('Company logo');
screen.getByAltText(/user profile/i);

// Priority 7: getByTitle (for title attribute or SVG titles)
screen.getByTitle('Close dialog');
```

These queries work for specific element types and ensure proper semantic markup (alt text for images, titles for icons/SVGs).

**Priority Tier 3: Test IDs (Escape Hatch - Use Sparingly)**

```javascript
// Priority 8: getByTestId (last resort)
screen.getByTestId('complex-component-wrapper');
screen.getByTestId('legacy-third-party-widget');
```

Test IDs should only be used when:
- Dealing with third-party components you can't modify
- Complex non-semantic structures (data visualizations, canvases)
- Temporary scaffolding during refactoring toward better markup

**Why this hierarchy matters in practice:**

Using `getByRole` instead of `getByTestId` provides automatic accessibility auditing. Every time your test runs, it verifies that:
- Interactive elements have proper roles
- Form inputs have accessible labels
- Headings use semantic HTML (not styled divs)
- Buttons are keyboard-accessible
- ARIA states are correctly implemented

Consider this real-world example:

```javascript
// ❌ Inaccessible markup (but test "works")
<div data-testid="submit-btn" onClick={handleSubmit}>Submit</div>
screen.getByTestId('submit-btn'); // Passes ✓

// User experience: ❌ Not keyboard accessible, screen reader announces "clickable"

// ✅ Accessible markup (enforced by query)
<button onClick={handleSubmit}>Submit</button>
screen.getByRole('button', { name: /submit/i }); // Passes ✓

// User experience: ✅ Keyboard accessible (Tab + Enter), screen reader announces "Submit, button"
```

The first test passes but ships broken accessibility. The second test forces you to fix the markup before it even passes.

**Role-based queries in depth:**
```javascript
// Common ARIA roles
getByRole('button')      // <button>, <input type="button">, role="button"
getByRole('textbox')     // <input type="text">, <textarea>
getByRole('checkbox')    // <input type="checkbox">
getByRole('radio')       // <input type="radio">
getByRole('link')        // <a href="...">
getByRole('heading')     // <h1> - <h6>
getByRole('list')        // <ul>, <ol>
getByRole('listitem')    // <li>
getByRole('img')         // <img>, <svg role="img">
getByRole('dialog')      // <dialog>, role="dialog"
getByRole('navigation')  // <nav>, role="navigation"

// With accessible name options
getByRole('button', {
  name: /submit/i,           // Text content or aria-label
  pressed: true,             // aria-pressed
  expanded: false,           // aria-expanded
  hidden: true               // Include hidden elements
});

getByRole('heading', {
  name: /dashboard/i,
  level: 1                   // For <h1>, <h2>, etc.
});
```

#### Query Variants: getBy vs queryBy vs findBy - Choosing the Right Tool

Each query comes in three variants with fundamentally different behaviors. Understanding when to use each variant is crucial for writing reliable, non-flaky tests:

**getBy* - Synchronous, Throws on Failure**

```javascript
// getBy* - Throws error if not found (synchronous)
// Use for: Elements that MUST be present immediately
const button = screen.getByRole('button', { name: /submit/i });
// Throws immediately if not found ❌
```

**When to use `getBy*`:**
- Elements that render immediately (not async)
- Static content that's always present
- Initial state before user interactions
- Asserting presence (not absence)

**Behavior on failure:** Throws descriptive error with suggestions for available roles/text, causing test to fail immediately.

**queryBy* - Synchronous, Returns Null on Failure**

```javascript
// queryBy* - Returns null if not found (synchronous)
// Use for: Asserting elements DON'T exist
const error = screen.queryByText(/error occurred/i);
expect(error).not.toBeInTheDocument(); // ✅
// Returns null if not found ✅
```

**When to use `queryBy*`:**
- Asserting elements are NOT present
- Checking conditional rendering (element may or may not exist)
- Before/after state (error message disappeared)
- Default state (modal is closed)

**Common mistake:**
```javascript
// ❌ BAD: Using getBy for non-existence
expect(() => screen.getByText('Error')).toThrow(); // Verbose and unclear

// ✅ GOOD: Using queryBy for non-existence
expect(screen.queryByText('Error')).not.toBeInTheDocument(); // Clear intent
```

**findBy* - Asynchronous, Waits and Retries**

```javascript
// findBy* - Returns Promise, waits up to 1000ms (async)
// Use for: Elements that appear asynchronously
const message = await screen.findByText(/data loaded/i);
// Waits and retries until found or timeout ⏱️
```

**When to use `findBy*`:**
- Data loaded from API calls
- Elements appearing after animations
- Async state updates
- Effects that trigger renders
- Debounced/throttled updates

**Under the hood:** `findBy*` is essentially `waitFor` + `getBy*`, polling every 50ms for up to 1000ms (configurable).

**Critical timing example:**
```javascript
// ❌ BAD: Race condition - fails intermittently
test('shows user data', () => {
  render(<UserProfile />);
  expect(screen.getByText('John Doe')).toBeInTheDocument(); // ❌ Data not loaded yet
});

// ✅ GOOD: Waits for async data
test('shows user data', async () => {
  render(<UserProfile />);
  expect(await screen.findByText('John Doe')).toBeInTheDocument(); // ✅ Waits for fetch
});
```

**Multiple elements:**
```javascript
// getAllBy* - Returns array, throws if none found
const items = screen.getAllByRole('listitem');
expect(items).toHaveLength(5);

// queryAllBy* - Returns empty array if none found
const errors = screen.queryAllByRole('alert');
expect(errors).toHaveLength(0); // ✅ for non-existence

// findAllBy* - Returns Promise<array>, waits for elements
const loadedItems = await screen.findAllByTestId('product-card');
```

#### Accessibility Testing Integration

RTL naturally guides you toward accessible components:

```javascript
// ❌ BAD: Inaccessible button
<div onClick={handleClick}>Submit</div>

// Testing forces you to use test IDs
screen.getByTestId('submit-button'); // Works but smelly

// ✅ GOOD: Accessible button
<button onClick={handleClick}>Submit</button>

// Can use proper semantic query
screen.getByRole('button', { name: /submit/i }); // Perfect!
```

**Testing form accessibility:**
```javascript
// Component with proper labels
<label htmlFor="email">Email address</label>
<input id="email" type="email" />

// Test finds it accessibly
const emailInput = screen.getByLabelText('Email address');

// Also works with aria-label
<input aria-label="Search products" type="search" />
screen.getByRole('searchbox', { name: /search products/i });

// Implicit labels
<label>
  Password
  <input type="password" />
</label>
screen.getByLabelText('Password');
```

**Testing ARIA attributes:**
```javascript
// Component
<button aria-pressed={isActive} aria-label="Toggle notifications">
  🔔
</button>

// Test
const toggle = screen.getByRole('button', {
  name: /toggle notifications/i,
  pressed: true
});

// Verify state changes
expect(toggle).toHaveAttribute('aria-pressed', 'true');
```

#### Container Queries vs Screen Queries

```javascript
// screen - queries the entire document
import { render, screen } from '@testing-library/react';

render(<App />);
screen.getByRole('button'); // Searches entire DOM

// container - queries a specific subtree
const { container } = render(<App />);
const button = container.querySelector('.specific-button'); // Escape hatch

// within - scope queries to a specific element
import { within } from '@testing-library/react';

const dialog = screen.getByRole('dialog');
const closeButton = within(dialog).getByRole('button', { name: /close/i });
// Only searches within the dialog
```

**When to use `within`:**
```javascript
// Multiple similar components
const productCards = screen.getAllByTestId('product-card');

const firstCard = productCards[0];
const firstCardPrice = within(firstCard).getByText(/\$\d+/);
const firstCardButton = within(firstCard).getByRole('button', { name: /add to cart/i });

// Prevents accidentally selecting elements from other cards
```

#### Debugging Tools

RTL provides powerful debugging utilities:

```javascript
import { screen, logRoles } from '@testing-library/react';

// 1. screen.debug() - Prints current DOM
screen.debug(); // Entire document
screen.debug(screen.getByRole('form')); // Specific element

// 2. logRoles() - Shows all available roles
const { container } = render(<MyComponent />);
logRoles(container);
// Outputs:
// navigation:
//   Name "Main navigation":
//   <nav />
// button:
//   Name "Submit":
//   <button />

// 3. Suggestions when query fails
screen.getByRole('buton'); // Typo
// Error message suggests: Did you mean "button"?
// Here are the accessible roles:
//   button: Name "Submit"
//   link: Name "Learn more"

// 4. Testing Playground (browser extension)
// Generates optimal queries for you
```

---

### 🐛 Real-World Scenario: Debugging Flaky Async Tests in Production CI/CD Pipeline

<details>
<summary><strong>🐛 Real-World Scenario: Debugging Flaky Async Tests in Production CI/CD Pipeline</strong></summary>

#### The Problem: Test Reliability Crisis

Your team's CI/CD pipeline has become unreliable. A critical user profile test that passed perfectly during development now fails randomly in the continuous integration environment. The symptoms are frustrating:

```javascript
// ❌ FLAKY TEST - Fails randomly
test('loads and displays user profile', () => {
  render(<UserProfile userId="123" />);

  const name = screen.getByText('John Doe');
  expect(name).toBeInTheDocument(); // ❌ Fails: Unable to find element
});
```

**Production Metrics:**
- **Failure rate in CI**: 30% (3 out of 10 builds fail)
- **Failure rate locally**: 10% (passes most of the time on developer machines)
- **Error message**: `TestingLibraryElementError: Unable to find an element with the text: John Doe`
- **Time wasted per week**: ~8 hours re-running failed builds
- **Impact**: Blocking deployments, frustrating developers, reducing confidence in test suite
- **Average build retry count**: 2.3 times before success
- **Cost**: Delayed releases, increased CI/CD costs (GitHub Actions minutes)

The classic symptom of flaky tests: they pass when you expect them to fail, fail when you expect them to pass, and erode team trust in the entire testing infrastructure.

#### Investigation Process

**Step 1: Understand the component behavior**
```javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>{user.name}</div>;
}
```

The component fetches data asynchronously! The test was checking for the name **synchronously**, before the fetch completed.

**Step 2: Add debugging**
```javascript
test('loads and displays user profile', () => {
  render(<UserProfile userId="123" />);

  // What's actually in the DOM?
  screen.debug(); // Shows: <div>Loading...</div>

  // This runs immediately, before fetch completes!
  const name = screen.getByText('John Doe'); // ❌ Not there yet
});
```

**Step 3: Identify the race condition**
- In fast environments (local): Fetch completes before assertion (~100ms)
- In slow environments (CI): Fetch takes longer (~500ms)
- Test doesn't wait for async operation

#### Solution 1: Use findBy Queries (Async Waiting)

```javascript
// ✅ GOOD: Waits for element to appear
test('loads and displays user profile', async () => {
  render(<UserProfile userId="123" />);

  // findBy returns a Promise, waits up to 1000ms
  const name = await screen.findByText('John Doe');
  expect(name).toBeInTheDocument();
});
```

**Why it works:**
- `findBy*` polls the DOM every 50ms for up to 1000ms
- Resolves when element appears
- Rejects with timeout error if not found
- Handles async naturally

#### Solution 2: Use waitFor for Complex Conditions

```javascript
import { render, screen, waitFor } from '@testing-library/react';

test('loads and displays user profile with role', async () => {
  render(<UserProfile userId="123" />);

  // Wait for multiple conditions
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Role: Admin')).toBeInTheDocument();
  });
});

// Or wait for loading state to disappear
test('removes loading indicator', async () => {
  render(<UserProfile userId="123" />);

  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

**waitFor options:**
```javascript
await waitFor(
  () => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  },
  {
    timeout: 3000,        // Wait up to 3 seconds (default: 1000)
    interval: 100,        // Check every 100ms (default: 50)
    onTimeout: (error) => {
      screen.debug();     // Log DOM on timeout
      return error;
    }
  }
);
```

#### Real Production Bug: E-commerce Cart Updates with Debouncing

**Scenario**: Major e-commerce platform with 50k daily active users experiencing flaky cart update tests

**Business Context:**
- Shopping cart allows real-time quantity updates
- Backend API is rate-limited (max 10 requests/second per user)
- Frontend implements 500ms debounce to reduce API calls
- Test suite has 15 similar tests, all intermittently failing

**The Flaky Test:**

```javascript
// ❌ FLAKY: Doesn't wait for debounced API call
test('updates quantity in cart', () => {
  render(<ShoppingCart />);

  const quantityInput = screen.getByLabelText('Quantity');
  userEvent.clear(quantityInput);
  userEvent.type(quantityInput, '5');

  // Expects immediate update, but component debounces API calls
  expect(screen.getByText('Total: $50')).toBeInTheDocument(); // ❌ Fails
});
```

**Failure metrics:**
- **Local failure rate**: 40% (depends on CPU speed)
- **CI failure rate**: 65% (slower CI runners)
- **Debugging time wasted**: 12 developer-hours before root cause identified
- **False positive fixes attempted**: 3 (increased timeouts, disabled debouncing, mocked timers incorrectly)

**Component behavior:**
```javascript
function ShoppingCart() {
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(10);

  // Debounced API call (500ms delay)
  const updateCart = useDebouncedCallback(async (qty) => {
    const res = await fetch('/api/cart/update', {
      method: 'POST',
      body: JSON.stringify({ quantity: qty })
    });
    const data = await res.json();
    setTotal(data.total);
  }, 500);

  return (
    <>
      <input
        aria-label="Quantity"
        value={quantity}
        onChange={(e) => {
          setQuantity(e.target.value);
          updateCart(e.target.value);
        }}
      />
      <div>Total: ${total}</div>
    </>
  );
}
```

**✅ FIXED: Wait for async update**
```javascript
test('updates quantity in cart', async () => {
  render(<ShoppingCart />);

  const quantityInput = screen.getByLabelText('Quantity');
  await userEvent.clear(quantityInput);
  await userEvent.type(quantityInput, '5');

  // Wait for debounced API call + state update
  const total = await screen.findByText('Total: $50', {}, { timeout: 2000 });
  expect(total).toBeInTheDocument();
});
```

**Metrics after fix:**
- Flaky failure rate: 30% → 0%
- CI build reliability: 70% → 100%
- Developer time saved: ~2 hours/week (no more re-running builds)

#### Advanced Pattern: Testing Loading States

```javascript
test('shows loading, then data, then error on retry', async () => {
  const { rerender } = render(<UserProfile userId="123" />);

  // 1. Initial loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // 2. Wait for data to load
  await screen.findByText('John Doe');
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

  // 3. Trigger refetch with error
  server.use(
    rest.get('/api/users/123', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  rerender(<UserProfile userId="123" key="retry" />);

  // 4. Loading again
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // 5. Error appears
  await screen.findByText('Failed to load user');
});
```

</details>

---

### ⚖️ Trade-offs: RTL vs Enzyme, Query Selection Strategies, and Testing Approaches

<details>
<summary><strong>⚖️ Trade-offs: RTL vs Enzyme, Query Selection Strategies, and Testing Approaches</strong></summary>

#### React Testing Library vs Enzyme: The Great Testing Philosophy Divide

**Historical context and industry shift:**

Enzyme, released by Airbnb in 2015, became the de facto standard for React testing with its powerful API allowing direct access to component internals. However, by 2018, Kent C. Dodds introduced React Testing Library with a fundamentally different philosophy that has since become the industry recommendation. Today, Enzyme is officially unmaintained (last major update: 2019), lacks React 18+ support, and most companies are migrating away from it.

**Philosophy differences:**

| Aspect | Enzyme | React Testing Library |
|--------|--------|----------------------|
| **Focus** | Implementation details (how) | User behavior (what) |
| **Access** | Component internals (state, props, methods) | Rendered output only (DOM) |
| **Testing style** | White-box testing | Black-box testing |
| **Refactoring** | Tests break on internal changes | Tests break on UX changes only |
| **API size** | Large, flexible API (100+ methods) | Small, opinionated API (~20 queries) |
| **Maintenance** | ❌ Unmaintained since 2019 | ✅ Active, React 18+ support |
| **React 18 support** | ❌ No (stuck at React 17) | ✅ Full support |
| **Industry adoption (2024)** | 15% (legacy codebases) | 85% (new projects) |

**Enzyme approach:**
```javascript
// Full access to internals
const wrapper = shallow(<TodoList />);

// Test state directly
expect(wrapper.state('todos')).toHaveLength(0);

// Call methods directly
wrapper.instance().addTodo('Buy milk');
expect(wrapper.state('todos')).toHaveLength(1);

// Access props
wrapper.find('TodoItem').at(0).props().onToggle();

// Shallow rendering (doesn't render children)
shallow(<App />); // Only renders App, not child components
```

**RTL approach:**
```javascript
// Only access rendered output
render(<TodoList />);

// Test what users see
expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

// Interact like users do
await userEvent.type(screen.getByRole('textbox'), 'Buy milk');
await userEvent.click(screen.getByRole('button', { name: /add/i }));

// Assert on rendered output
expect(screen.getByRole('listitem')).toHaveTextContent('Buy milk');
```

**When Enzyme's approach causes problems:**
```javascript
// Component refactored from class to hooks
// Before (class):
class Counter extends React.Component {
  state = { count: 0 };
  increment = () => this.setState({ count: this.state.count + 1 });
  render() {
    return <button onClick={this.increment}>{this.state.count}</button>;
  }
}

// After (hooks):
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// ❌ Enzyme test breaks (no more instance() or state())
wrapper.instance().increment(); // TypeError: instance is not a function

// ✅ RTL test still works (tests behavior, not implementation)
userEvent.click(screen.getByRole('button'));
expect(screen.getByRole('button')).toHaveTextContent('1');
```

**Trade-off analysis:**

**Enzyme pros:**
- ✅ Fine-grained control for testing complex internal logic
- ✅ Shallow rendering speeds up tests (no child components)
- ✅ Easier to test error boundaries and edge cases
- ✅ Can test components in isolation without mocking children

**Enzyme cons:**
- ❌ Tests break on refactoring (class → hooks, state changes)
- ❌ Doesn't test actual DOM interactions
- ❌ Encourages testing implementation details
- ❌ No React 18 support (project abandoned)

**RTL pros:**
- ✅ Tests closely match user behavior (high confidence)
- ✅ Refactoring-resistant (only breaks on UX changes)
- ✅ Forces accessible markup (role-based queries)
- ✅ Actively maintained, works with React 18+

**RTL cons:**
- ❌ Can't test implementation details (sometimes you want this)
- ❌ Harder to test isolated components with many dependencies
- ❌ Full DOM rendering slower than shallow rendering
- ❌ Opinionated API limits flexibility

**Migration decision matrix:**

| Project Characteristic | Recommendation |
|----------------------|----------------|
| New project | ✅ RTL (industry standard) |
| Existing Enzyme tests (100s) | ⚠️ Gradual migration |
| Testing class components | ⚠️ Either (but RTL for new tests) |
| Testing hooks | ✅ RTL |
| Need React 18 features | ✅ RTL (Enzyme unmaintained) |
| Testing component libraries | ⚠️ Mix (RTL for integration, Enzyme for isolation) |

#### Query Selection Strategy Trade-offs

**Strategy 1: Role-first (Recommended)**

```javascript
// Prioritize getByRole for everything
const button = screen.getByRole('button', { name: /submit/i });
const input = screen.getByRole('textbox', { name: /email/i });
const heading = screen.getByRole('heading', { name: /welcome/i });
```

**Pros:**
- ✅ Forces accessible markup (ARIA roles, semantic HTML)
- ✅ Matches how assistive technologies work
- ✅ Future-proof (accessible roles rarely change)

**Cons:**
- ❌ Requires learning ARIA role mapping
- ❌ Verbose for simple cases
- ❌ Harder to query non-interactive content

**When to use:** Default choice for interactive elements (buttons, forms, navigation)

**Strategy 2: Text-first (Simple Content)**

```javascript
// Use getByText for static content
const title = screen.getByText('Dashboard');
const message = screen.getByText(/successfully logged in/i);
```

**Pros:**
- ✅ Simple, readable
- ✅ Perfect for static text, headings, labels
- ✅ No ARIA knowledge needed

**Cons:**
- ❌ Brittle if text changes
- ❌ Doesn't verify element type (could match anything)
- ❌ Fails with interpolated/dynamic text

**When to use:** Non-interactive content, error messages, static labels

**Strategy 3: Label-first (Forms)**

```javascript
// Use getByLabelText for form inputs
const email = screen.getByLabelText('Email address');
const password = screen.getByLabelText(/password/i);
```

**Pros:**
- ✅ Ensures proper form accessibility
- ✅ Matches how users identify inputs
- ✅ More specific than getByRole('textbox')

**Cons:**
- ❌ Requires proper label associations
- ❌ Doesn't work with placeholders-only designs

**When to use:** Form inputs with visible labels

**Strategy 4: Test ID (Escape Hatch)**

```javascript
// Use data-testid as last resort
<div data-testid="complex-widget">...</div>
const widget = screen.getByTestId('complex-widget');
```

**Pros:**
- ✅ Works for anything (decorative elements, SVGs, complex structures)
- ✅ Never fails due to text/role changes
- ✅ Fast query performance

**Cons:**
- ❌ Adds non-production attributes to markup
- ❌ Tests nothing about accessibility or UX
- ❌ Can become a crutch (avoid accessible queries)

**When to use:** Third-party components, complex widgets without semantic roles, temporary during refactoring

**Real-world example: Querying a complex form**
```javascript
// Component
<form>
  <label htmlFor="search">Search products</label>
  <div className="search-wrapper">
    <input
      id="search"
      type="search"
      placeholder="Enter product name..."
    />
    <button type="submit">
      <SearchIcon aria-label="Submit search" />
    </button>
  </div>
</form>

// ✅ BEST: Combine strategies appropriately
const searchInput = screen.getByRole('searchbox', { name: /search products/i });
// Uses role (semantic) + accessible name (label)

const submitButton = screen.getByRole('button', { name: /submit search/i });
// Uses role + aria-label from icon

// ❌ WORSE alternatives:
screen.getByPlaceholderText('Enter product name...'); // Fragile
screen.getByTestId('search-input'); // Misses accessibility
```

#### Performance Trade-offs: Query Types

**Speed comparison (10,000 queries, average DOM):**
```
getByTestId:     ~0.05ms (fastest - direct attribute lookup)
getByRole:       ~0.15ms (moderate - semantic tree traversal)
getByText:       ~0.30ms (slower - full text content search)
getByLabelText:  ~0.20ms (moderate - label association lookup)
```

**When performance matters:**
```javascript
// Slow: Searching large lists
const items = screen.getAllByText(/item/i); // Searches all text nodes

// Faster: Scoped search
const list = screen.getByRole('list');
const items = within(list).getAllByRole('listitem'); // Limited scope

// Fastest: Test IDs for non-semantic containers
const container = screen.getByTestId('product-grid');
const items = within(container).getAllByTestId('product-card');
```

**Practical guideline**: Use semantic queries by default. Only optimize if tests are measurably slow (>1s per test).

</details>

---

### 💬 Explain to Junior: User-Centric Testing Philosophy Made Simple

<details>
<summary><strong>💬 Explain to Junior: User-Centric Testing Philosophy Made Simple</strong></summary>

#### The Restaurant Menu Analogy: Testing the Experience, Not the Kitchen

Imagine you're a food critic reviewing a restaurant. You have two approaches to write your review:

**❌ Bad approach (Testing the kitchen internals):**
- Inspect if the chef has the right ingredients in the fridge
- Verify the recipe book is open to the correct page
- Measure if the oven temperature is exactly 350°F
- Confirm the chef's knife is sharp enough
- Check if the cutting board is clean
- Verify the chef followed the recipe steps in order

**Problems with this approach:**
- You never actually taste the food!
- The chef can follow the recipe perfectly but the food might still be bad
- If the chef changes the recipe but food tastes the same, your "test" fails
- Customers don't care about the kitchen—they care about the meal

**✅ Good approach (Testing the dining experience):**
- Order a burger from the menu (like a user would)
- Check if it arrives within reasonable time (15 minutes)
- Verify it looks appetizing and matches the menu picture
- Taste it to confirm it's delicious
- Confirm the waiter brought the correct order
- Ensure the bill is accurate

**Why this approach is better:**
- ✅ Tests actual customer experience
- ✅ Catches real problems (food tastes bad, wrong order, slow service)
- ✅ Doesn't break if kitchen processes change (as long as food quality stays same)
- ✅ Mirrors how customers actually interact with the restaurant

**React Testing Library is the second approach.** You don't test the kitchen (component internals like state, props, methods), you test the dining experience (what users see on screen and what happens when they interact with it).

**Real coding example:**

```javascript
// ❌ BAD: Testing the "kitchen" (implementation details)
const wrapper = shallow(<LoginForm />);
expect(wrapper.state('email')).toBe(''); // Checking ingredient prep
expect(wrapper.find('input').length).toBe(2); // Counting kitchen tools
wrapper.instance().handleSubmit(); // Calling chef's method directly

// ✅ GOOD: Testing the "dining experience" (user behavior)
render(<LoginForm />);
expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument(); // User sees email input
await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com'); // User types
await userEvent.click(screen.getByRole('button', { name: /login/i })); // User clicks login
expect(await screen.findByText(/welcome back/i)).toBeInTheDocument(); // User sees success message
```

The first approach is like inspecting the kitchen. The second approach is like being an actual customer.

#### Why This Matters in React

**Old way (testing the kitchen):**
```javascript
// ❌ Testing implementation details
test('Counter component', () => {
  const wrapper = shallow(<Counter />);

  // Checking the "recipe" (state structure)
  expect(wrapper.state('count')).toBe(0);

  // Calling chef methods directly (instance methods)
  wrapper.instance().increment();

  // Checking ingredients (props passed to children)
  expect(wrapper.find('Display').props().value).toBe(1);
});
```

**Problem**: If the chef changes the recipe (refactoring from class to hooks), your test breaks even though the burger (UI) is identical!

**New way (testing the experience):**
```javascript
// ✅ Testing user behavior
test('Counter component', async () => {
  render(<Counter />);

  // What does the customer see?
  expect(screen.getByText('Count: 0')).toBeInTheDocument();

  // What action do they take?
  await userEvent.click(screen.getByRole('button', { name: /increment/i }));

  // What's the result?
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

**Benefit**: Chef can change the recipe all they want (refactor internals). As long as the burger looks and tastes the same (UI works), the test passes!

#### The Three Questions Framework

For every test, ask yourself:

**1. What does the user see?**
```javascript
// Users see text, buttons, images - not state or props
expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
expect(screen.getByAltText('Profile picture')).toBeInTheDocument();
```

**2. What does the user do?**
```javascript
// Users click, type, scroll - not call methods or change state
await userEvent.click(screen.getByRole('button', { name: /submit/i }));
await userEvent.type(screen.getByRole('textbox'), 'Hello world');
```

**3. What does the user expect to happen?**
```javascript
// Users expect to see changes in the UI - not state updates
expect(screen.getByText('Form submitted successfully')).toBeInTheDocument();
expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
```

#### Interview Answer Template

**Question**: "How would you test a login form with React Testing Library?"

**Strong answer structure:**
```
"I'd approach this from a user's perspective:

1. ARRANGE: Render the LoginForm component
   - Set up any necessary mocks (API calls)

2. ACT: Simulate user interactions
   - Find the email input using getByLabelText or getByRole
   - Type a valid email using userEvent.type
   - Find the password input the same way
   - Type a password
   - Click the submit button using getByRole('button')

3. ASSERT: Verify expected outcomes
   - Check for success message or navigation
   - Ensure loading state appears/disappears
   - Verify form is cleared or disabled after submission

I'd use accessible queries like getByRole and getByLabelText to ensure the form is properly labeled. For async operations like API calls, I'd use findBy queries or waitFor to handle the asynchronous state updates.

I'd also test error cases: invalid inputs, API failures, and network errors, always focusing on what the user sees, not component internals like state or props."
```

**Key phrases to use:**
- "From a user's perspective..."
- "What the user sees and does..."
- "Testing behavior, not implementation..."
- "Accessible queries ensure proper markup..."
- "Handle async with findBy and waitFor..."

#### Common Beginner Mistakes

**Mistake 1: Using querySelector**
```javascript
// ❌ BAD
const button = container.querySelector('.submit-button');

// ✅ GOOD
const button = screen.getByRole('button', { name: /submit/i });
```

**Why it's bad:** Users don't see CSS classes. Tests should match user experience.

**Mistake 2: Not waiting for async**
```javascript
// ❌ BAD
test('loads data', () => {
  render(<UserList />);
  expect(screen.getByText('John Doe')).toBeInTheDocument(); // Fails!
});

// ✅ GOOD
test('loads data', async () => {
  render(<UserList />);
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
});
```

**Why it's bad:** Data loading is async. Need to wait for it.

**Mistake 3: Testing implementation details**
```javascript
// ❌ BAD
expect(wrapper.state('isLoading')).toBe(false);

// ✅ GOOD
expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
```

**Why it's bad:** Users don't see state. They see loading indicators.

#### Quick Reference: Query Selection

**"When in doubt, use this decision tree:"**

```
Is it a button, link, or form input?
  YES → getByRole

Is it text content (heading, paragraph, label)?
  YES → getByText

Is it a form input with a visible label?
  YES → getByLabelText

Is it an image?
  YES → getByAltText

Is it something weird or complex?
  YES → getByTestId (but try role first!)
```

#### The Container Query Pattern and Scoping Searches

When testing complex UIs with repetitive structures (lists, cards, modals), you often need to query within a specific section of the DOM rather than the entire document. The `within` utility provides this capability, allowing you to narrow the search scope and avoid selecting the wrong element.

**Problem: Multiple similar elements**

```javascript
// Component with multiple product cards
function ProductGrid({ products }) {
  return (
    <div>
      {products.map(product => (
        <article key={product.id} data-testid="product-card">
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <button>Add to Cart</button>
        </article>
      ))}
    </div>
  );
}

// ❌ BAD: Ambiguous queries
test('first product has correct price', () => {
  render(<ProductGrid products={mockProducts} />);

  // This finds ALL "Add to Cart" buttons - which one?
  const buttons = screen.getAllByRole('button', { name: /add to cart/i });
  // Hard to associate with specific product
});

// ✅ GOOD: Scoped queries with within
import { within } from '@testing-library/react';

test('first product has correct details', () => {
  render(<ProductGrid products={mockProducts} />);

  const productCards = screen.getAllByTestId('product-card');
  const firstCard = productCards[0];

  // Scope all queries to first card only
  expect(within(firstCard).getByText('Widget Pro')).toBeInTheDocument();
  expect(within(firstCard).getByText('$29.99')).toBeInTheDocument();

  const addButton = within(firstCard).getByRole('button', { name: /add to cart/i });
  expect(addButton).toBeEnabled();
});
```

**Advanced pattern: Testing modal dialogs**

```javascript
// Modal can be anywhere in DOM due to portals
test('dialog has correct buttons', () => {
  render(<ConfirmDialog message="Delete this item?" />);

  // First, locate the dialog specifically
  const dialog = screen.getByRole('dialog');

  // Then query within it (prevents matching buttons outside dialog)
  expect(within(dialog).getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  expect(within(dialog).getByRole('button', { name: /cancel/i })).toBeInTheDocument();

  // Also ensures proper dialog structure
  expect(within(dialog).getByText('Delete this item?')).toBeInTheDocument();
});
```

**The `container` vs `screen` distinction:**

```javascript
// screen - Global query across entire document
render(<App />);
screen.getByRole('button'); // Searches document.body

// container - The specific element that was rendered
const { container } = render(<App />);
container.querySelector('.custom-class'); // Searches only <App> subtree

// Why screen is usually better:
// - Matches how users/screen readers experience the app
// - Encourages semantic queries
// - Easier to refactor (no container dependency)
```

**When to use `within` vs `screen`:**

- **Use `screen`** (default): Most cases, unique elements, accessible queries
- **Use `within`**: Repetitive structures (lists, grids), scoping to modals/dialogs, complex component libraries

**Performance consideration:**

```javascript
// Slow: Multiple full-document searches
test('product grid performance', () => {
  render(<ProductGrid products={Array(100).fill(mockProduct)} />);

  // Each query searches entire DOM (100 cards × 100 searches = 10,000 traversals)
  screen.getAllByRole('button').forEach(button => {
    expect(button).toBeEnabled();
  });
});

// Faster: Scoped searches
test('product grid performance', () => {
  render(<ProductGrid products={Array(100).fill(mockProduct)} />);

  const cards = screen.getAllByTestId('product-card');

  // Each within search is scoped (100 cards × 1 scoped search = 100 traversals)
  cards.forEach(card => {
    const button = within(card).getByRole('button');
    expect(button).toBeEnabled();
  });
});
```

This scoping strategy is essential for testing complex UIs with hierarchical structures, repeated patterns, and nested components. It improves test clarity, performance, and reduces false matches.

</details>

---

## Question 2: What are testing best practices and anti-patterns?

### Answer

Writing effective React tests requires balancing confidence, maintainability, and speed. Best practices focus on testing user behavior over implementation details, while anti-patterns often lead to brittle, slow, or false-confidence tests.

**Core best practices:**
- **Test behavior, not implementation**: Focus on what users see and do, not how components work internally
- **Use accessible queries**: Prioritize `getByRole`, `getByLabelText` to ensure accessible markup
- **Wait for async properly**: Use `findBy` queries and `waitFor` for asynchronous operations
- **Mock external dependencies**: Isolate component logic from API calls, timers, localStorage
- **Write integration tests**: Test multiple components together as users experience them

**Common anti-patterns:**
- Testing internal state or props directly
- Using `querySelector` or `getByTestId` everywhere
- Not waiting for async operations (race conditions)
- Shallow rendering (missing integration issues)
- 100% code coverage obsession (coverage ≠ quality)

The goal is **confidence that your app works as users expect**, not just passing tests. Good tests should break when user experience breaks, and stay green when you refactor internals.

---

### 🔍 Deep Dive: Testing Patterns, Mocking Strategies, and Test Organization Architecture

<details>
<summary><strong>🔍 Deep Dive: Testing Patterns, Mocking Strategies, and Test Organization Architecture</strong></summary>

#### Pattern 1: AAA (Arrange, Act, Assert) - The Universal Testing Structure

The AAA pattern is the foundational structure for writing clear, maintainable tests across all testing frameworks and languages. Originating from Bill Wake's work on XUnit patterns, it provides a mental model that makes tests self-documenting and easy to debug.

**The three phases:**

1. **Arrange**: Set up the test scenario (render component, prepare data, configure mocks)
2. **Act**: Perform the action being tested (user interaction, function call, state change)
3. **Assert**: Verify the expected outcome (check rendered output, verify state, confirm API calls)

**Basic example:**

```javascript
test('user can add item to cart', async () => {
  // ARRANGE: Set up test conditions
  const mockProduct = { id: '123', name: 'Widget', price: 9.99 };
  render(<ProductPage product={mockProduct} />);

  // ACT: Perform user action
  await userEvent.click(screen.getByRole('button', { name: /add to cart/i }));

  // ASSERT: Verify outcome
  expect(screen.getByText('1 item in cart')).toBeInTheDocument();
});
```

**Why this pattern is powerful:**

**1. Clarity and readability** - Anyone reading the test immediately understands:
- What's the initial state? (Arrange)
- What action is being tested? (Act)
- What's the expected result? (Assert)

**2. Single Responsibility** - Each test focuses on one behavior. If you find yourself writing multiple Act-Assert cycles in a single test, it's a code smell indicating you should split into separate tests.

**3. Debugging efficiency** - When a test fails, the failure location immediately tells you which phase broke:
- Failure in Arrange → Setup issue (mocks, props, context)
- Failure in Act → Interaction issue (element not found, event not firing)
- Failure in Assert → Logic issue (component didn't behave as expected)

**4. Matches user mental model** - Users experience your app in this exact sequence: they arrive with context (Arrange), take an action (Act), and observe the result (Assert).

**Complex example with multiple assertions:**

```javascript
test('form validation shows multiple errors', async () => {
  // ARRANGE
  render(<ContactForm />);

  // ACT: Submit empty form
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  // ASSERT: Multiple related outcomes
  expect(screen.getByText('Email is required')).toBeInTheDocument();
  expect(screen.getByText('Message is required')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /email/i })).toBeInvalid();
  expect(screen.getByRole('textbox', { name: /message/i })).toBeInvalid();
});
```

**Note**: Multiple assertions are acceptable when they all verify different aspects of the same action's outcome. Here, all assertions verify the "submit empty form" action—they're not testing different behaviors.

**Advanced: Multiple assertions**
```javascript
test('form validation shows errors', async () => {
  render(<ContactForm />);

  // ACT: Submit without filling fields
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  // ASSERT: Multiple errors appear
  expect(screen.getByText('Email is required')).toBeInTheDocument();
  expect(screen.getByText('Message is required')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /email/i })).toBeInvalid();
});
```

#### Pattern 2: Custom Render Function (Test Setup)

Wrap `render()` to provide common context:

```javascript
// test-utils.js
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { AuthContext } from './contexts/AuthContext';

function customRender(
  ui,
  {
    theme = 'light',
    user = { name: 'Test User', role: 'admin' },
    ...options
  } = {}
) {
  const Wrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
      <AuthContext.Provider value={{ user }}>
        {children}
      </AuthContext.Provider>
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
```

**Usage:**
```javascript
import { render, screen } from './test-utils';

test('shows admin menu', () => {
  render(<Dashboard />); // Automatically wrapped with providers!
  expect(screen.getByRole('link', { name: /admin panel/i })).toBeInTheDocument();
});

test('shows user menu for regular users', () => {
  render(<Dashboard />, { user: { name: 'Regular Joe', role: 'user' } });
  expect(screen.queryByRole('link', { name: /admin panel/i })).not.toBeInTheDocument();
});
```

#### Pattern 3: Testing User Flows (Integration Tests)

Test complete user journeys across multiple components:

```javascript
test('complete checkout flow', async () => {
  const { user } = render(<App />);

  // 1. Browse products
  expect(screen.getByRole('heading', { name: /products/i })).toBeInTheDocument();

  // 2. Add to cart
  await user.click(screen.getByRole('button', { name: /add to cart/i }));
  expect(screen.getByText('1 item in cart')).toBeInTheDocument();

  // 3. Go to cart
  await user.click(screen.getByRole('link', { name: /cart/i }));
  expect(screen.getByRole('heading', { name: /shopping cart/i })).toBeInTheDocument();

  // 4. Proceed to checkout
  await user.click(screen.getByRole('button', { name: /checkout/i }));

  // 5. Fill shipping info
  await user.type(screen.getByLabelText(/name/i), 'John Doe');
  await user.type(screen.getByLabelText(/address/i), '123 Main St');

  // 6. Submit order
  await user.click(screen.getByRole('button', { name: /place order/i }));

  // 7. Verify success
  expect(await screen.findByText(/order confirmed/i)).toBeInTheDocument();
});
```

**Benefits:**
- Tests real user experience
- Catches integration bugs between components
- Provides high confidence
- Documents user flows

#### Mocking Strategy 1: API Calls (MSW - Mock Service Worker)

**Best practice**: Mock at the network level, not module level

```javascript
// mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({
        id,
        name: 'John Doe',
        email: 'john@example.com'
      })
    );
  }),

  rest.post('/api/login', async (req, res, ctx) => {
    const { email, password } = await req.json();

    if (email === 'admin@test.com' && password === 'password') {
      return res(
        ctx.json({ token: 'fake-jwt-token', user: { role: 'admin' } })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid credentials' })
    );
  })
];

// mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// setupTests.js
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Usage in tests:**
```javascript
import { server } from './mocks/server';
import { rest } from 'msw';

test('handles login success', async () => {
  render(<LoginForm />);

  await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'password');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));

  expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
});

test('handles login failure', async () => {
  // Override mock for this test
  server.use(
    rest.post('/api/login', (req, res, ctx) => {
      return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }));
    })
  );

  render(<LoginForm />);

  await userEvent.type(screen.getByLabelText(/email/i), 'wrong@test.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));

  expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
});
```

**Why MSW over fetch mocks:**
- ✅ Works with any HTTP library (fetch, axios, etc.)
- ✅ Tests actual network code paths
- ✅ Can use same mocks for browser testing (Cypress, Playwright)
- ✅ Easier to test error cases (network failures, timeouts)

#### Mocking Strategy 2: Timers and Dates

```javascript
// Component with debounced search
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${query}`)
        .then(res => res.json())
        .then(setResults);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <input
        aria-label="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {results.map(r => <li key={r.id}>{r.name}</li>)}
      </ul>
    </>
  );
}

// ❌ BAD: Real timers (flaky, slow)
test('searches after typing', async () => {
  render(<SearchBox />);

  await userEvent.type(screen.getByLabelText(/search/i), 'react');

  // Have to actually wait 500ms!
  await waitFor(() => {
    expect(screen.getByText('React Docs')).toBeInTheDocument();
  }, { timeout: 1000 });
});

// ✅ GOOD: Fake timers
test('searches after typing', async () => {
  jest.useFakeTimers();
  render(<SearchBox />);

  await userEvent.type(screen.getByLabelText(/search/i), 'react');

  // Fast-forward time
  act(() => {
    jest.advanceTimersByTime(500);
  });

  expect(await screen.findByText('React Docs')).toBeInTheDocument();

  jest.useRealTimers();
});
```

**Testing dates:**
```javascript
test('shows correct deadline', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2024-01-15'));

  render(<ProjectDeadline dueDate="2024-01-20" />);

  expect(screen.getByText('5 days remaining')).toBeInTheDocument();

  jest.useRealTimers();
});
```

#### Mocking Strategy 3: Browser APIs

```javascript
// LocalStorage
beforeEach(() => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
  global.localStorage = localStorageMock;
});

test('saves theme preference', async () => {
  render(<ThemeToggle />);

  await userEvent.click(screen.getByRole('button', { name: /dark mode/i }));

  expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
});

// IntersectionObserver
beforeEach(() => {
  global.IntersectionObserver = class IntersectionObserver {
    observe() { return null; }
    disconnect() { return null; }
    unobserve() { return null; }
  };
});

// Window.matchMedia
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });
});
```

#### Test Organization: File Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.styles.ts
│   └── UserProfile/
│       ├── UserProfile.tsx
│       ├── UserProfile.test.tsx
│       └── __tests__/
│           ├── UserProfile.integration.test.tsx
│           └── UserProfile.a11y.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
└── test/
    ├── test-utils.tsx (custom render)
    ├── setupTests.ts (global setup)
    └── mocks/
        ├── handlers.ts (MSW handlers)
        └── server.ts (MSW server)
```

**Naming conventions:**
- `*.test.tsx` - Unit/component tests
- `*.integration.test.tsx` - Integration tests
- `*.a11y.test.tsx` - Accessibility-focused tests
- `*.spec.tsx` - Alternative to `.test.tsx`

---

### 🐛 Real-World Scenario: Fixing Brittle Tests After Major Refactoring (Redux → Context Migration)

<details>
<summary><strong>🐛 Real-World Scenario: Fixing Brittle Tests After Major Refactoring (Redux → Context Migration)</strong></summary>

#### The Problem: Complete Test Suite Collapse

Your team embarked on a major architectural refactoring: migrating the entire user authentication system from Redux to React Context API. The refactoring took 3 days, passed code review, and the application works perfectly in manual testing. However, when you run the test suite: **78 tests failed catastrophically**.

**The Broken Test Pattern:**

```javascript
// ❌ BROKEN TEST - Tests Redux implementation details
test('login sets user in store', async () => {
  const { store } = renderWithRedux(<LoginForm />);

  await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'password');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(store.getState().auth.user).toEqual({
      email: 'user@test.com',
      name: 'Test User'
    });
  });
});
```

**Production Impact Metrics:**
- **Tests broken**: 78 out of 245 total (32% failure rate)
- **Files affected**: 15 test files across authentication, profile, settings modules
- **Initial time estimate to fix**: 2 days
- **Actual time spent**: 2.5 days (20 developer-hours)
- **Deployment delay**: 3 days (missed sprint deadline)
- **Team morale impact**: Significant frustration, questioned value of testing
- **Root cause**: Tests were tightly coupled to Redux implementation, not user behavior

**Why the tests broke:**

The tests made three critical mistakes:

1. **Direct state inspection** - `store.getState().auth.user` checks Redux internal state
2. **Implementation coupling** - Tests depend on Redux API (`getState()`)
3. **Framework dependency** - `renderWithRedux` helper is Redux-specific

After migrating to Context API:
- Redux store no longer exists → `store.getState()` is undefined
- Context uses different API → No equivalent to `getState()`
- Tests fail even though user-visible behavior is identical

#### Investigation Process

**Step 1: Identify what actually changed**
```javascript
// BEFORE: Redux implementation
function LoginForm() {
  const dispatch = useDispatch();

  const handleSubmit = (email, password) => {
    dispatch(loginAction(email, password));
  };
  // ...
}

// AFTER: Context implementation
function LoginForm() {
  const { login } = useAuth();

  const handleSubmit = (email, password) => {
    login(email, password);
  };
  // ...
}
```

**What changed:** Internal state management (Redux → Context)
**What didn't change:** UI, user interaction, visible outcome

**Step 2: Identify what should have been tested**

Users don't care about Redux vs Context. They care about:
- Can they log in?
- Do they see their name after login?
- Are protected routes accessible?

#### Solution: Refactor to Behavior-Based Tests

```javascript
// ✅ FIXED: Tests user-visible behavior
test('user can log in successfully', async () => {
  render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );

  await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'password');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));

  // Test what user SEES, not internal state
  expect(await screen.findByText(/welcome, test user/i)).toBeInTheDocument();
});
```

**Why this works:**
- ✅ Doesn't care about Redux, Context, or any state management
- ✅ Survives refactoring (as long as UI behavior stays same)
- ✅ Tests actual user experience

#### Real Production Example: Form Validation

**Scenario:** Refactored from Formik to React Hook Form

```javascript
// ❌ BAD: Coupled to Formik
test('validates email format', async () => {
  const { container } = render(<SignupForm />);
  const formik = container.querySelector('form').__formik; // Yikes!

  formik.setFieldValue('email', 'invalid-email');
  formik.setFieldTouched('email', true);

  await waitFor(() => {
    expect(formik.errors.email).toBe('Invalid email format');
  });
});

// ✅ GOOD: Tests user experience
test('shows error for invalid email', async () => {
  render(<SignupForm />);

  const emailInput = screen.getByLabelText(/email/i);

  await userEvent.type(emailInput, 'invalid-email');
  await userEvent.tab(); // Trigger blur/validation

  expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  expect(emailInput).toBeInvalid();
});
```

**Metrics after refactoring tests:**
- Tests broken by state management change: 78 → 0
- Tests broken by UI changes: 0 → 12 (expected - UI actually changed)
- Time to refactor codebase: 3 days
- Time to fix tests (old approach): 2 days
- Time to fix tests (new approach): 2 hours

#### Anti-Pattern: Testing Too Many Things

```javascript
// ❌ BAD: One giant test
test('complete user journey', async () => {
  render(<App />);

  // 50 lines of test code...
  // Login
  // Navigate to profile
  // Edit profile
  // Change password
  // Upload avatar
  // Update settings
  // Logout

  // If ANY step fails, hard to debug which part broke
});

// ✅ GOOD: Separate focused tests
describe('User Profile Flow', () => {
  test('user can edit profile information', async () => {
    // Just profile editing
  });

  test('user can change password', async () => {
    // Just password change
  });

  test('user can upload avatar', async () => {
    // Just avatar upload
  });
});
```

**Benefits of focused tests:**
- ✅ Clear failure messages
- ✅ Easier to debug
- ✅ Can run individually
- ✅ Faster to fix when broken

</details>

---

### ⚖️ Trade-offs: Testing Strategies, Coverage Goals, and Resource Allocation

<details>
<summary><strong>⚖️ Trade-offs: Testing Strategies, Coverage Goals, and Resource Allocation</strong></summary>

#### Unit vs Integration vs E2E Tests: The Testing Trophy Strategy

**The Testing Trophy (Kent C. Dodds) vs Testing Pyramid:**

The traditional "Testing Pyramid" (Google, 2010) advocated for 70% unit, 20% integration, 10% E2E. However, modern frontend development has evolved toward the "Testing Trophy" which inverts this distribution based on real-world effectiveness data.

**The Testing Trophy distribution:**

```
       /\
      /E2\     E2E (End-to-End)
     /____\    - 10% of tests
    ///////\   Integration
   / INT   \  - 60% of tests (MOST IMPORTANT)
  /_________\
 ////////////\ Unit
/   UNIT     \ - 30% of tests
```

**Why Integration tests dominate:**

Integration tests provide the best balance of:
- **Confidence**: Tests multiple components working together (catches integration bugs)
- **Speed**: Faster than E2E (no real browser), slower than unit (more setup)
- **Maintainability**: More resilient to refactoring than unit tests
- **Cost**: Cheaper to write/maintain than E2E, more valuable than unit

**Industry data (based on Google, Microsoft, Netflix testing reports):**
- Integration tests catch **65%** of production bugs
- Unit tests catch **25%** of production bugs
- E2E tests catch **10%** of production bugs (but catch the most critical ones)
- **Cost per bug found**: Unit ($5), Integration ($15), E2E ($50)
- **ROI**: Integration tests have highest return on investment

**Unit tests (Component-level):**
```javascript
// Tests single component in isolation
test('Button shows loading state', () => {
  render(<Button loading>Submit</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

**Pros:**
- ✅ Fast (milliseconds)
- ✅ Easy to debug
- ✅ Covers edge cases
- ✅ Great for complex logic

**Cons:**
- ❌ Doesn't catch integration bugs
- ❌ Can give false confidence
- ❌ May test implementation details

**When to use:** Utility functions, hooks, complex components with lots of conditional logic

**Integration tests (Multiple components):**
```javascript
// Tests components working together
test('adding item to cart updates total', async () => {
  render(
    <CartProvider>
      <ProductList />
      <CartSummary />
    </CartProvider>
  );

  await userEvent.click(screen.getAllByRole('button', { name: /add to cart/i })[0]);

  expect(screen.getByText(/1 item in cart/i)).toBeInTheDocument();
  expect(screen.getByText(/total: \$19\.99/i)).toBeInTheDocument();
});
```

**Pros:**
- ✅ High confidence (tests real interactions)
- ✅ Catches integration bugs
- ✅ Closer to user experience
- ✅ More resilient to refactoring

**Cons:**
- ❌ Slower than unit tests
- ❌ Harder to debug failures
- ❌ Requires more setup (providers, mocks)

**When to use:** User flows, features spanning multiple components (MOST OF YOUR TESTS)

**E2E tests (Full application in browser):**
```javascript
// Cypress/Playwright - Real browser, real server
test('user can complete purchase', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Add to Cart');
  await page.click('text=Checkout');
  await page.fill('[name="email"]', 'user@test.com');
  await page.click('text=Place Order');
  await expect(page.locator('text=Order Confirmed')).toBeVisible();
});
```

**Pros:**
- ✅ Highest confidence (tests real app)
- ✅ Catches all types of bugs
- ✅ Tests backend integration
- ✅ Visual regression possible

**Cons:**
- ❌ Slowest (seconds/minutes)
- ❌ Flaky (network, timing issues)
- ❌ Expensive to maintain
- ❌ Hard to debug

**When to use:** Critical user paths (checkout, signup, login), smoke tests before deployment

#### Coverage Metrics: What Actually Matters

**The myth of 100% coverage:**
```javascript
// This has 100% code coverage but ZERO value
function add(a, b) {
  return a + b;
}

test('add function exists', () => {
  expect(add).toBeDefined(); // ✅ 100% coverage!
});

// But it doesn't test if add actually works!
```

**Better approach: Meaningful coverage**
```javascript
test('add returns sum of two numbers', () => {
  expect(add(2, 3)).toBe(5);
  expect(add(-1, 1)).toBe(0);
  expect(add(0.1, 0.2)).toBeCloseTo(0.3);
});
```

**Coverage targets:**

| Metric | Target | Why |
|--------|--------|-----|
| Statements | 70-80% | Catches most logic bugs |
| Branches | 60-70% | Tests all if/else paths |
| Functions | 80%+ | All functions executed |
| Lines | 70-80% | Overall code execution |

**What to NOT obsess over:**
- ❌ 100% coverage (diminishing returns)
- ❌ Covering UI framework code (React internals)
- ❌ Covering type definitions (TypeScript types)
- ❌ Covering trivial code (constants, exports)

**What to focus on:**
- ✅ Critical business logic
- ✅ Complex conditionals
- ✅ Error handling paths
- ✅ User-facing features

#### Trade-off: Mocking vs Real Dependencies

**Example: Testing a component that uses React Router**

**Option 1: Mock the router**
```javascript
// ❌ Overmocked - tests nothing real
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '123' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

test('navigates to detail page', () => {
  render(<ProductList />);
  // Can't test real navigation!
});
```

**Pros:**
- ✅ Fast
- ✅ Isolated

**Cons:**
- ❌ Doesn't test real routing
- ❌ Misses bugs (what if router API changes?)
- ❌ False confidence

**Option 2: Use real router (with MemoryRouter)**
```javascript
// ✅ Real router, controlled environment
import { MemoryRouter } from 'react-router-dom';

test('navigates to detail page', async () => {
  render(
    <MemoryRouter initialEntries={['/products']}>
      <Routes>
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>
  );

  await userEvent.click(screen.getByRole('link', { name: /view details/i }));

  expect(screen.getByRole('heading', { name: /product details/i })).toBeInTheDocument();
});
```

**Pros:**
- ✅ Tests real routing logic
- ✅ Catches integration bugs
- ✅ High confidence

**Cons:**
- ❌ Slightly slower
- ❌ More setup

**General rule:**
- Mock external services (APIs, databases)
- Use real libraries (React Router, date libraries)
- Mock sparingly (only when necessary)

#### Trade-off: Test Speed vs Confidence

**Fast tests (Unit/Mocked):**
```javascript
// Runs in 10ms
test('formatPrice formats correctly', () => {
  expect(formatPrice(1234.56)).toBe('$1,234.56');
});
```

**Slow tests (Integration/Real):**
```javascript
// Runs in 500ms
test('checkout flow works', async () => {
  render(<App />);
  // Many steps, API calls, navigation...
});
```

**Optimal strategy:**
```
Fast unit tests: 30%
  - Utils, helpers, hooks
  - Run on every save (watch mode)
  - Instant feedback

Medium integration tests: 60%
  - Component interactions
  - Run on pre-commit
  - Quick enough for TDD

Slow E2E tests: 10%
  - Critical paths
  - Run in CI only
  - Before deployment
```

**Example setup:**
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=\\.test\\.",
    "test:integration": "jest --testPathPattern=\\.integration\\.",
    "test:e2e": "playwright test",
    "test:watch": "jest --watch --testPathPattern=\\.test\\.",
    "test:ci": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

</details>

---

### 💬 Explain to Junior: Writing Tests That Don't Suck (The "Future You" Will Thank You)

<details>
<summary><strong>💬 Explain to Junior: Writing Tests That Don't Suck (The "Future You" Will Thank You)</strong></summary>

#### The "Future You" Principle: Writing Self-Documenting Tests

**The scenario every developer faces:**
- You write a test today (Friday, 3pm, ready for weekend)
- 6 months later, the test fails (Monday, 9am, production is down)
- You (or worse, a teammate) have to figure out what broke and why
- You don't remember writing this test
- The original context is completely gone

**Bad test (Future You is completely lost):**

```javascript
test('it works', () => {
  const { container } = render(<Thing />);
  const el = container.querySelector('.box');
  fireEvent.click(el);
  expect(el.classList.contains('active')).toBe(true);
});

// Future You at 9am Monday:
// "What is 'Thing'? What's '.box'? Active for what purpose?
// Is this even important? Can I just delete it?
// Why did past me write such a terrible test?!"
```

**Problems with this test:**
1. Test name is useless ("it works" - what works?)
2. Component name is vague ("Thing")
3. Querying by CSS class (`.box` - what does this represent to users?)
4. Using `fireEvent` instead of `userEvent` (doesn't simulate real interactions)
5. Checking CSS classes (users don't see classes)
6. No context for why this behavior matters

**Good test (Future You immediately understands and fixes the bug in 2 minutes):**

```javascript
test('clicking notification bell shows unread count', async () => {
  render(<Header unreadCount={5} />);

  const notificationButton = screen.getByRole('button', { name: /notifications/i });

  await userEvent.click(notificationButton);

  expect(screen.getByText('5 unread notifications')).toBeInTheDocument();
});

// Future You at 9am Monday:
// "Oh! The notification dropdown isn't showing the unread count.
// Let me check the NotificationDropdown component...
// Found it! The count prop isn't being passed. Fixed in 2 minutes."
```

**Why this test is excellent:**

1. **Descriptive name** - Explains exact user behavior being tested
2. **Clear component** - `<Header>` with obvious props (`unreadCount={5}`)
3. **Semantic query** - `getByRole('button')` shows it's a button (accessible!)
4. **Real user interaction** - `userEvent.click()` simulates actual user clicking
5. **User-visible assertion** - Checks for text user sees ("5 unread notifications")
6. **Self-documenting** - Any developer can understand without context

**The "Delete and Rewrite" Test:**

Here's a powerful mental model: **"If I deleted this test and had to rewrite it from scratch based only on the component's purpose, would it look the same?"**

#### The "Delete and Rewrite" Test

**Ask yourself: If I deleted this test and rewrote it from scratch, would it look the same?**

```javascript
// ❌ BAD: Depends on internal knowledge
test('component renders', () => {
  const wrapper = shallow(<MyComponent />);
  expect(wrapper.find('.header').exists()).toBe(true);
  expect(wrapper.state('count')).toBe(0);
});

// If you deleted this and rewrote it, you'd probably write something different

// ✅ GOOD: Clear from component purpose
test('counter starts at zero and increments on click', async () => {
  render(<Counter />);

  expect(screen.getByText('Count: 0')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /increment/i }));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});

// If you deleted this and rewrote it, it would look almost identical
```

#### Common Testing Mistakes (and How to Fix Them)

**Mistake 1: Testing Too Much at Once**
```javascript
// ❌ BAD: Giant test
test('app works', async () => {
  // 100 lines testing login, navigation, CRUD, logout...
});

// ✅ GOOD: Focused tests
test('user can log in', async () => { /* ... */ });
test('user can create post', async () => { /* ... */ });
test('user can edit post', async () => { /* ... */ });
test('user can delete post', async () => { /* ... */ });
```

**Mistake 2: Not Cleaning Up**
```javascript
// ❌ BAD: Leaks state between tests
let user;

test('creates user', () => {
  user = { name: 'John' };
  expect(user.name).toBe('John');
});

test('user has email', () => {
  expect(user.email).toBe('john@test.com'); // ❌ Depends on previous test!
});

// ✅ GOOD: Independent tests
test('creates user with name', () => {
  const user = { name: 'John' };
  expect(user.name).toBe('John');
});

test('creates user with email', () => {
  const user = { name: 'John', email: 'john@test.com' };
  expect(user.email).toBe('john@test.com');
});
```

**Mistake 3: Using waitFor Unnecessarily**
```javascript
// ❌ BAD: Unnecessary waitFor
test('renders heading', async () => {
  render(<Page />);
  await waitFor(() => {
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});

// ✅ GOOD: Synchronous elements don't need waiting
test('renders heading', () => {
  render(<Page />);
  expect(screen.getByRole('heading')).toBeInTheDocument();
});

// ✅ Use waitFor only for async
test('loads user data', async () => {
  render(<UserProfile />);
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
});
```

#### Interview Answer Template

**Question**: "What are some common anti-patterns in React testing?"

**Strong answer:**
```
"I'd highlight three major anti-patterns:

1. TESTING IMPLEMENTATION DETAILS
   The biggest mistake is testing how a component works internally instead of what it does for users. For example, checking component state or prop values directly. This makes tests brittle - they break when you refactor, even if behavior stays the same. Instead, I focus on what users see and do: rendered output and interactions.

2. NOT WAITING FOR ASYNC OPERATIONS
   A common source of flaky tests is not properly handling asynchronous behavior. Using getBy queries for data that loads asynchronously will fail intermittently. The fix is using findBy queries (which return promises and wait) or wrapping assertions in waitFor.

3. OVERUSING TEST IDS
   While data-testid is tempting because it's easy, it tests nothing about user experience or accessibility. I prioritize getByRole and getByLabelText because they ensure proper semantic markup and accessible design. Test IDs should be a last resort for complex non-semantic components.

I also avoid shallow rendering (missing integration issues), testing too many things in one test (hard to debug), and obsessing over 100% code coverage (better to focus on meaningful tests for critical paths)."
```

#### Quick Decision Framework

**"Should I write this test?"**

```
Does it test user-facing behavior?
  NO → Skip it (testing implementation)
  YES → Continue

Would this test break if I refactored to hooks/Context/etc?
  YES → Revise it (too coupled to implementation)
  NO → Continue

Can I understand what this test does 6 months from now?
  NO → Add better names/comments
  YES → Continue

Does this test give me confidence the feature works?
  NO → Don't write it
  YES → Write it!
```

#### Golden Rules

1. **Test behavior, not code** - Focus on what, not how
2. **Use real interactions** - userEvent, not fireEvent
3. **Query accessibly** - getByRole > getByTestId
4. **Wait for async** - findBy and waitFor are your friends
5. **Keep tests focused** - One behavior per test
6. **Name tests clearly** - Future You will thank you

**Remember:** Good tests are like good documentation. They explain what your app does and give you confidence it works.

</details>
