# Testing React Components

> React Testing Library, testing hooks, async testing, mocking, and best practices.

---

## Question 1: React Testing Library Best Practices

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Meta, Google, Netflix

### Question
How do you test React components with React Testing Library? What are the best practices?

### Answer

**React Testing Library (RTL)** - Tests components from a user's perspective, not implementation details.

**Key Points:**
1. **Query by role** - Use accessible queries (getByRole, getByLabelText)
2. **User interactions** - Use userEvent library for realistic interactions
3. **Async testing** - Use findBy queries for async elements
4. **Don't test implementation** - Avoid testing state, props directly
5. **Arrange-Act-Assert** - Structure tests clearly

### Code Example

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter, LoginForm, UserList } from './components';

// 1. BASIC COMPONENT TEST
test('counter increments when button clicked', async () => {
  // Arrange
  render(<Counter />);
  const user = userEvent.setup();

  // Act
  const button = screen.getByRole('button', { name: /increment/i });
  await user.click(button);

  // Assert
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});

// 2. FORM TESTING
test('login form submits with user credentials', async () => {
  const mockSubmit = jest.fn();
  render(<LoginForm onSubmit={mockSubmit} />);
  const user = userEvent.setup();

  // Fill form
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /submit/i });

  await user.type(emailInput, 'test@example.com');
  await user.type(passwordInput, 'password123');
  await user.click(submitButton);

  // Verify submission
  expect(mockSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  });
});

// 3. ASYNC DATA FETCHING
test('displays user list after loading', async () => {
  // Mock API
  const mockUsers = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ];

  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: async () => mockUsers
  });

  render(<UserList />);

  // Initially shows loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for users to appear
  const userItems = await screen.findAllByRole('listitem');
  expect(userItems).toHaveLength(2);
  expect(screen.getByText('John')).toBeInTheDocument();

  global.fetch.mockRestore();
});

// 4. TESTING ACCESSIBLE QUERIES (Best Practice)
test('uses accessible queries', () => {
  render(<LoginForm />);

  // ✅ GOOD: Query by role (most accessible)
  screen.getByRole('button', { name: /submit/i });
  screen.getByRole('textbox', { name: /email/i });

  // ✅ GOOD: Query by label text
  screen.getByLabelText(/password/i);

  // ✅ GOOD: Query by placeholder (when no label)
  screen.getByPlaceholderText(/enter your email/i);

  // ❌ BAD: Query by test ID (last resort only)
  // screen.getByTestId('submit-button');

  // ❌ BAD: Query by class or element type
  // screen.getByClassName('btn-primary');
});

// 5. ERROR HANDLING
test('displays error message when API fails', async () => {
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'));

  render(<UserList />);

  // Wait for error message
  const errorMessage = await screen.findByText(/failed to load users/i);
  expect(errorMessage).toBeInTheDocument();

  global.fetch.mockRestore();
});

// 6. CONDITIONAL RENDERING
test('shows/hides content based on user interaction', async () => {
  render(<AccordionItem />);
  const user = userEvent.setup();

  // Initially collapsed
  expect(screen.queryByText(/content/i)).not.toBeInTheDocument();

  // Click to expand
  const button = screen.getByRole('button', { name: /expand/i });
  await user.click(button);

  // Content now visible
  expect(screen.getByText(/content/i)).toBeInTheDocument();
});

// 7. CUSTOM RENDER WITH PROVIDERS
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';

const customRender = (ui, { theme = 'light', ...options } = {}) => {
  return render(
    <BrowserRouter>
      <ThemeProvider value={theme}>
        {ui}
      </ThemeProvider>
    </BrowserRouter>,
    options
  );
};

test('renders with theme provider', () => {
  customRender(<Header />, { theme: 'dark' });
  expect(screen.getByRole('banner')).toHaveClass('dark-theme');
});
```

### Common Mistakes

- ❌ Using `getByTestId` for everything (use accessible queries instead)
- ❌ Testing implementation details (state, props, component methods)
- ❌ Using `fireEvent` instead of `userEvent` (userEvent is more realistic)
- ❌ Not waiting for async updates (`waitFor`, `findBy` queries)
- ✅ Query by role, label, text (how users interact)
- ✅ Test behavior, not implementation
- ✅ Use `userEvent.setup()` with async/await

### Follow-up Questions

1. What's the difference between `getBy`, `queryBy`, and `findBy`?
2. How do you test custom hooks?
3. When should you use `waitFor` vs `findBy`?

### Resources
- [React Testing Library](https://testing-library.com/react)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

### 🔍 Deep Dive

**React Testing Library Philosophy and Internal Architecture**

React Testing Library (RTL) represents a fundamental shift in testing philosophy, built on the principle that tests should resemble how users interact with applications rather than testing implementation details. Understanding its internal architecture reveals why this approach produces more maintainable and reliable tests.

**Query Priority System and DOM Testing Library Foundation**

RTL is built on top of DOM Testing Library, which provides the core query system. The library implements a sophisticated priority hierarchy for element queries, ranked by accessibility and user perception. The highest priority queries are `getByRole` and `getByLabelText`, which directly map to how assistive technologies and users perceive elements. These queries force developers to write accessible markup because if a test can't find an element by role or label, real users likely face similar challenges.

The query system uses three prefixes (`getBy`, `queryBy`, `findBy`) combined with various suffixes (Role, LabelText, PlaceholderText, Text, DisplayValue, AltText, Title, TestId). Each prefix serves a distinct purpose: `getBy` throws errors immediately when elements don't exist (useful for asserting presence), `queryBy` returns null for missing elements (perfect for asserting absence), and `findBy` returns promises that retry queries (essential for async elements). This design elegantly handles synchronous assertions, absence checks, and asynchronous rendering without requiring different mental models.

**userEvent vs fireEvent: Realistic User Simulation**

The `userEvent` library represents a sophisticated simulation layer that mirrors actual browser user interactions. When you call `await user.click(button)`, it doesn't simply dispatch a click event. Instead, it simulates the complete interaction sequence: mouseover, mousemove, mousedown, focus, mouseup, click. This sequence matters because real components may respond to any of these events, and testing only the click event misses potential bugs.

Similarly, `userEvent.type()` simulates individual keydown, keypress, and keyup events for each character, triggering input events and properly updating selection ranges. This catches issues like debounce logic, input validation, or character-by-character processing that fireEvent's single synthetic event would miss. The library also handles browser quirks, such as preventing default actions when inputs are disabled and properly managing focus order during Tab key navigation.

**waitFor and Retry Mechanism Internals**

The `waitFor` utility implements a polling mechanism with exponential backoff that's crucial for testing asynchronous behavior. By default, it checks your assertion every 50ms for up to 1000ms, but these values are configurable. The implementation uses mutation observers and RAF (requestAnimationFrame) callbacks to detect DOM changes efficiently, avoiding unnecessary polling when the DOM hasn't changed.

When using `findBy` queries, you're actually using `waitFor` under the hood. The query `await screen.findByText('Hello')` is syntactic sugar for `await waitFor(() => screen.getByText('Hello'))`. This explains why `findBy` automatically handles loading states – it keeps retrying the query until the element appears or the timeout expires.

**Screen vs Container: Debug Output and Query Scope**

The `screen` object provides queries scoped to the entire document.body, offering superior debug output through `screen.debug()`. This method uses pretty-dom to format and syntax-highlight the DOM tree, making it invaluable during test development. When a query fails, RTL automatically prints the accessible tree, showing elements by their roles and accessible names, which helps identify both test issues and accessibility problems.

The container returned by `render()` limits queries to that specific rendered tree, useful when testing multiple components simultaneously or when you need to assert elements are NOT in a specific subtree. However, `screen` is generally preferred because it better matches how users perceive the page as a single document.

**Custom Render Functions and Provider Wrapping**

Production applications typically require components to be wrapped in various providers (Router, Theme, State Management, i18n). RTL's render function accepts a wrapper option that automatically wraps your component during each test. Best practice is creating a custom render function that includes all global providers:

```jsx
function customRender(ui, {
  theme = 'light',
  locale = 'en',
  initialRoute = '/',
  ...options
} = {}) {
  return render(
    <BrowserRouter initialEntries={[initialRoute]}>
      <I18nProvider locale={locale}>
        <ThemeProvider theme={theme}>
          {ui}
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>,
    options
  );
}
```

This approach eliminates repetitive setup code and ensures consistent test environments. The function accepts configuration options for provider state, making it flexible enough to test different scenarios while maintaining DRY principles.

**Act Warnings and React's Internal Update Queue**

The "not wrapped in act()" warning occurs when React state updates happen outside React's knowledge during tests. React batches state updates and flushes them synchronously in tests, but async operations (setTimeout, promises, fetch) complete after the test function's synchronous execution. The `act()` utility tells React to flush all pending effects and updates before proceeding.

Modern RTL largely eliminates manual `act()` usage by wrapping user interactions and async queries automatically. However, understanding act() remains crucial when testing custom async logic or third-party libraries. The warning is React protecting you from race conditions where assertions run before state updates complete, producing flaky tests that sometimes pass based on timing.

**Accessibility Testing Integration**

RTL's query system doubles as basic accessibility testing. If `getByRole('button')` fails, your button likely has accessibility issues. The library integrates with jest-axe for comprehensive a11y testing: `expect(await axe(container)).toHaveNoViolations()` runs the same checks screen readers use, catching missing labels, invalid ARIA attributes, color contrast issues, and semantic HTML problems.

This integration embeds accessibility into the development workflow rather than treating it as a separate concern. When tests force you to add labels for querying elements, you're simultaneously improving the experience for assistive technology users.

---

### 🐛 Real-World Scenario

**Production Bug: Flaky Tests Causing CI Pipeline Failures**

**Context:** An e-commerce platform with 2,500+ React component tests was experiencing random CI failures, with 5-8 tests failing on each run but different tests failing each time. The flakiness rate reached 12%, meaning nearly 1 in 8 test runs failed despite no code changes. This blocked deployments and eroded team confidence in the test suite.

**Initial Symptoms and Metrics:**
- Average CI run time: 14 minutes
- Failure rate: 12% (300 tests failing non-deterministically)
- Most common failures: "Unable to find element", "Expected element not to be in document"
- Time wasted re-running CI: ~2.5 hours per day across team
- Failed deployments due to false negatives: 3-4 per week

**Investigation Process:**

The team first analyzed failure patterns by scraping CI logs for two weeks. They discovered three main failure categories:

1. **Async Race Conditions (45% of failures):** Tests asserting elements appeared/disappeared without proper async queries
2. **Improper Cleanup (30% of failures):** Tests leaving timers, subscriptions, or pending promises that affected subsequent tests
3. **Shared Mutable State (25% of failures):** Tests modifying global objects without restoration

**Root Cause Analysis – Deep Dive:**

**Issue 1: Overuse of getBy for Async Elements**

The codebase had 800+ instances of this anti-pattern:

```jsx
// ❌ FLAKY: Race condition depending on render timing
test('shows user data', () => {
  render(<UserProfile id={123} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument(); // Sometimes fails!
});
```

This test passes if React finishes rendering before the assertion runs but fails if the assertion runs during the initial loading state. The race condition is invisible on fast development machines but manifests in slower CI environments.

**Issue 2: Missing Cleanup for Timers and Subscriptions**

```jsx
// ❌ POLLUTES SUBSEQUENT TESTS
function usePolling(url, interval) {
  useEffect(() => {
    const timer = setInterval(() => fetch(url), interval);
    // Missing cleanup!
  }, [url, interval]);
}

test('polling hook', () => {
  renderHook(() => usePolling('/api/data', 1000));
  // Timer continues running, affecting next test!
});
```

Uncleared timers caused cascading failures. Test A creates a timer, Test B runs and receives unexpected fetch calls from Test A's timer, Test B fails with "Unexpected fetch call".

**Issue 3: Global Object Mutation**

```jsx
// ❌ MODIFIES GLOBAL STATE
test('handles offline mode', () => {
  Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
  // Never restored! All subsequent tests think browser is offline
});
```

**Solution Implementation:**

**Fix 1: Async Query Migration (2 weeks of effort)**

The team ran a codebase-wide transformation using ast-grep to identify and fix async patterns:

```jsx
// ✅ RELIABLE: Proper async query
test('shows user data', async () => {
  render(<UserProfile id={123} />);
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
  // Automatically waits up to 1s for element to appear
});

// ✅ PROPER LOADING + SUCCESS ASSERTION
test('shows loading then data', async () => {
  render(<UserProfile id={123} />);

  // Assert loading state exists
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for data to replace loading state
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

**Fix 2: Standardized Cleanup Patterns**

Created a custom render function with automatic cleanup:

```jsx
// utils/test-utils.js
const timers = new Set();
const subscriptions = new Set();

export function customRender(ui, options) {
  const result = render(ui, options);

  // Track any timers/intervals created during test
  const originalSetTimeout = global.setTimeout;
  const originalSetInterval = global.setInterval;

  global.setTimeout = (...args) => {
    const id = originalSetTimeout(...args);
    timers.add(id);
    return id;
  };

  global.setInterval = (...args) => {
    const id = originalSetInterval(...args);
    timers.add(id);
    return id;
  };

  return result;
}

afterEach(() => {
  // Cleanup all tracked timers
  timers.forEach(clearTimeout);
  timers.clear();
  subscriptions.forEach(unsubscribe => unsubscribe());
  subscriptions.clear();
});
```

**Fix 3: Global State Restoration**

```jsx
// utils/test-setup.js
const originalNavigator = { ...navigator };
const originalFetch = global.fetch;

afterEach(() => {
  // Restore all global objects
  Object.keys(navigator).forEach(key => {
    if (navigator[key] !== originalNavigator[key]) {
      navigator[key] = originalNavigator[key];
    }
  });

  global.fetch = originalFetch;
  jest.clearAllMocks();
  jest.clearAllTimers();
});
```

**Results After Fixes:**

- **Flakiness rate:** 12% → 0.3% (40x improvement)
- **CI reliability:** 88% → 99.7%
- **Average CI run time:** 14min → 11min (parallel execution now safe)
- **Failed deployments:** 3-4/week → 1-2/month
- **Developer confidence:** Significantly improved (measured via survey)
- **Time saved:** 2.5 hours/day → 0.1 hours/day (~$50k annual savings for 20-person team)

**Key Lessons:**

1. **Always use findBy for async elements** – The 1-second automatic wait is worth it
2. **Cleanup is non-negotiable** – One leaked timer can cascade into dozens of failed tests
3. **Global mocks must restore** – afterEach should restore every global modification
4. **Test isolation is critical** – Each test should be able to run independently in any order
5. **CI environment differs from local** – Slower CI machines expose race conditions hidden locally

**Interview Answer Template:**

"I encountered flaky tests causing 12% CI failure rates. I analyzed failure patterns and found three root causes: using `getBy` for async elements instead of `findBy`, missing cleanup for timers and subscriptions, and global state mutations without restoration. I implemented standardized cleanup patterns, migrated 800+ tests to use proper async queries, and created custom render utilities with automatic cleanup. This reduced flakiness from 12% to 0.3%, improved CI reliability to 99.7%, and saved ~2.5 hours daily in wasted re-runs."

---

### ⚖️ Trade-offs

**Query Strategy Selection: Accessibility vs Speed vs Specificity**

**getByRole vs getByTestId**

The fundamental trade-off in RTL is between accessibility-driven queries and specificity. `getByRole` encourages accessible markup but can be slower and more verbose:

```jsx
// ✅ ACCESSIBLE BUT VERBOSE
screen.getByRole('button', { name: /submit/i })

// ❌ FAST BUT MISSES A11Y ISSUES
screen.getByTestId('submit-btn')
```

**Decision Matrix:**

| Factor | getByRole | getByTestId | Use When |
|--------|-----------|-------------|----------|
| **Accessibility** | Forces accessible markup | Bypasses a11y concerns | getByRole: Public UI, getByTestId: Internal components |
| **Specificity** | Can match multiple elements | Guaranteed unique | getByTestId: Complex forms, getByRole: Simple interactions |
| **Maintenance** | Resilient to structure changes | Brittle if IDs change | getByRole: Long-term projects |
| **Performance** | Slower (DOM traversal + role computation) | Fast (direct attribute match) | getByTestId: Large test suites needing speed |
| **Refactoring Safety** | Breaks if accessibility regresses | Breaks if testId removed | getByRole: Better regression detection |

**Recommendation:** Use `getByRole` for all user-facing elements (buttons, inputs, links) and reserve `getByTestId` for complex scenarios where roles are ambiguous (e.g., nested lists, multiple similar elements).

**Real Example:**
A financial dashboard had 50+ buttons on a single page. Using `getByRole('button')` returned arrays requiring filtering. The team adopted a hybrid: `getByRole` for primary actions (submit, cancel) and `getByTestId` for grid cell actions (edit-row-5, delete-row-5).

---

**Testing Strategy: Integration vs Unit vs E2E**

**React Testing Library: Integration-Level Component Tests**

RTL naturally produces integration tests – rendering full component trees with child components. This differs from traditional unit testing that mocks all dependencies.

**Comparison:**

| Aspect | RTL Integration Tests | Jest Unit Tests | E2E (Cypress/Playwright) |
|--------|----------------------|-----------------|--------------------------|
| **Scope** | Component + children + providers | Single component, children mocked | Full application with backend |
| **Speed** | Moderate (10-100ms per test) | Fast (1-10ms per test) | Slow (500-5000ms per test) |
| **Confidence** | High for UI behavior | Low for integration | Highest for user flows |
| **Maintenance** | Moderate (refactoring-resistant) | High (breaks on implementation changes) | High (breaks on UI changes) |
| **Debugging** | Easy (synchronous, debug output) | Easy | Hard (async, headless) |
| **Cost** | Low (runs in Jest) | Low | High (infrastructure, flakiness) |

**Decision Framework:**

**Use RTL when:**
- Testing component behavior and user interactions (90% of frontend tests)
- Verifying conditional rendering, form validation, state updates
- Testing components in isolation but with real child components

**Use Unit Tests when:**
- Testing pure utility functions (formatCurrency, validateEmail)
- Testing complex algorithms without UI (state reducers, data transformations)
- Testing hooks in isolation with `renderHook`

**Use E2E when:**
- Testing critical user flows (signup, checkout, payment)
- Verifying multi-page interactions and navigation
- Testing integration with real backend APIs
- Smoke testing production deployments

**Real Example:**
An e-commerce team had 2,500 tests:
- 2,200 RTL tests (88%): Component behavior, forms, product lists
- 200 unit tests (8%): Price calculations, discount logic, inventory algorithms
- 100 E2E tests (4%): Checkout flow, payment processing, order confirmation

This pyramid structure provided 95% code coverage with fast CI runs (12 minutes) and high confidence in deployments.

---

**Mocking Strategy: MSW vs Direct Mocking vs Real API**

**Mock Service Worker (MSW) vs jest.fn() fetch mocks**

MSW intercepts network requests at the network layer, while direct mocking replaces functions.

| Factor | MSW | Direct fetch Mock | Real API (Test Database) |
|--------|-----|-------------------|-------------------------|
| **Realism** | High (actual HTTP requests) | Medium (mocked function) | Highest (real responses) |
| **Setup Complexity** | Medium (server setup) | Low (jest.fn()) | High (test database, migrations) |
| **Speed** | Fast (in-memory) | Fastest (no network layer) | Slow (network + DB overhead) |
| **Reliability** | High (deterministic responses) | Highest (no network) | Medium (network issues, DB state) |
| **Flexibility** | High (request handlers, delays, errors) | Medium (return values) | Low (must seed DB for each test) |
| **Maintenance** | Low (shared handlers) | High (per-test mocks) | High (DB schema migrations) |
| **Dev Experience** | Excellent (works in browser too) | Good (familiar jest API) | Poor (slow feedback) |

**Decision Guide:**

**Use MSW when:**
- Testing components that make multiple API calls with different endpoints
- Wanting to reuse API mocks in both tests and development (MSW works in browser)
- Testing error scenarios (network failures, 500 errors, timeouts)
- Working with GraphQL APIs (MSW has excellent GraphQL support)

```jsx
// ✅ MSW: Realistic, reusable, handles errors elegantly
const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.delay(100), ctx.json({ name: 'John' }));
  })
);

// Error simulation
server.use(rest.get('/api/users/:id', (req, res, ctx) => {
  return res(ctx.status(500));
}));
```

**Use Direct Mocking when:**
- Simple tests with one or two API calls
- Testing utility functions that call fetch directly
- Maximum speed is critical (large test suites)

```jsx
// ✅ Direct mock: Simple, fast for isolated tests
global.fetch = jest.fn().mockResolvedValue({
  json: async () => ({ name: 'John' })
});
```

**Use Real API when:**
- Testing API integration layer itself (not component tests)
- Contract testing between frontend and backend
- Smoke tests in staging environment

**Real Example:**
A SaaS dashboard app used MSW for 90% of tests (user flows, data fetching, error handling), direct mocks for 8% (simple utility tests), and real API calls for 2% (contract tests ensuring API schema matches frontend expectations).

---

**userEvent vs fireEvent: Realism vs Simplicity**

`userEvent` simulates realistic user interactions but requires async/await and is slower. `fireEvent` directly dispatches events synchronously.

| Factor | userEvent | fireEvent | Recommendation |
|--------|-----------|-----------|----------------|
| **Realism** | Complete interaction sequence | Single event dispatch | userEvent for user-facing features |
| **Speed** | Slower (multiple events) | Faster (single event) | fireEvent for internal events |
| **API** | Async (await required) | Synchronous | userEvent: Better for most tests |
| **Event Details** | Accurate (bubbling, focus, etc.) | Manual (must specify details) | userEvent: Catches more bugs |

**When fireEvent is acceptable:**
- Testing focus/blur events directly: `fireEvent.focus(input)`
- Testing paste events: `fireEvent.paste(input, { clipboardData: { getData: () => 'text' } })`
- Custom events: `fireEvent(element, new CustomEvent('myEvent'))`

**Best Practice:** Default to `userEvent`, use `fireEvent` only for events that users can't trigger directly.

---

**async/await vs waitFor: Implicit vs Explicit Waiting**

`findBy` queries use `waitFor` internally, creating a choice between implicit (findBy) and explicit (waitFor) waiting.

```jsx
// IMPLICIT: Clean, handles simple cases
expect(await screen.findByText('Hello')).toBeInTheDocument();

// EXPLICIT: Verbose, handles complex assertions
await waitFor(() => {
  expect(screen.getByText('Hello')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(5);
});
```

**Use findBy when:** Single element assertion, element will definitely appear

**Use waitFor when:** Multiple assertions, asserting element disappearance, custom retry logic

**Performance Consideration:** `findBy` has 1000ms timeout by default. If your component loads in 50ms, you're still waiting up to 1000ms unnecessarily. Configure timeout for faster tests: `await screen.findByText('Hello', {}, { timeout: 500 })`.

---

### 💬 Explain to Junior

**The Library That Changed How We Test**

Imagine you're a chef creating a new recipe. You could test it two ways:

**The Old Way (Enzyme/Traditional Testing):**
Check that you added exactly 2 eggs, stirred clockwise 50 times, and the mixing bowl is the right brand. But you never taste the food! You're testing HOW you cook, not WHAT you produce.

**The RTL Way (React Testing Library):**
Serve the dish to someone and see if they enjoy it. Did it taste good? Does it look appetizing? Can they eat it easily? You're testing the RESULT, not the process.

React Testing Library applies this philosophy to code: test what users see and do, not the internal React machinery.

---

**The Three Query Types: A Traffic Light Analogy**

Think of finding elements like checking if a traffic light is on:

**getBy – "Must Be There"** (Throws error if missing)
```jsx
screen.getByRole('button', { name: /submit/i })
// Like walking up to an intersection and demanding: "Show me the traffic light!"
// If there's no light → you immediately yell: "ERROR! NO LIGHT!"
```

Use `getBy` when: You know the element exists right now (like a submit button on a form).

**queryBy – "Maybe There"** (Returns null if missing)
```jsx
screen.queryByText(/error message/i)
// Like calmly looking around: "Is there a traffic light here?"
// If no light → you note: "Nope, no light" and move on
```

Use `queryBy` when: You're checking if something is ABSENT (asserting an error message disappeared).

**findBy – "Will Be There Soon"** (Waits up to 1 second)
```jsx
await screen.findByText('John Doe')
// Like waiting at an intersection: "I'll wait for the light to appear..."
// Checks every 50ms for up to 1 second, then gives up
```

Use `findBy` when: Elements appear after loading (API data, animations, delayed renders).

---

**Real-World Analogy: Testing a Coffee Machine**

**Bad Test (Implementation Details):**
```jsx
expect(component.state.temperature).toBe(95); // Internal state
expect(component.props.coffeeBeans).toBe('arabica'); // Props
expect(WaterHeater.mock.calls).toHaveLength(1); // Mocked internals
```

This is like testing a coffee machine by:
- Opening it up and checking the water temperature sensor reads 95°C
- Verifying the bean hopper is labeled "arabica"
- Counting how many times the heating element activated

**Good Test (User Perspective):**
```jsx
await user.click(screen.getByRole('button', { name: /brew coffee/i }));
expect(await screen.findByText(/coffee ready/i)).toBeInTheDocument();
expect(screen.getByRole('img', { name: /coffee cup/i })).toBeVisible();
```

This is like testing by:
- Pressing the "Brew" button (what users do)
- Waiting for the "Coffee Ready" light (what users see)
- Checking that coffee is in the cup (what users get)

If the coffee comes out perfect, WHO CARES how the internal heating element works? If it tastes burnt, the test fails regardless of whether the temperature sensor is accurate.

---

**Why userEvent, Not fireEvent?**

**Analogy: Pressing a Doorbell**

**fireEvent approach:**
```jsx
fireEvent.click(doorbell);
// Like teleporting your finger through the door and directly triggering the bell circuit
```

**userEvent approach:**
```jsx
await user.click(doorbell);
// Like actually walking up to the door, moving your hand, pressing the button, and releasing
```

When you click a real button:
1. Your mouse moves over it (mouseover event)
2. You press down (mousedown event)
3. The button gets focus (focus event)
4. You release (mouseup event)
5. The click registers (click event)

Some components respond to these intermediate events! For example:
- A button might show a tooltip on mouseover
- An input might validate on blur
- A form might track "time to first interaction" on focus

`fireEvent.click()` skips all this and goes straight to click. `userEvent.click()` simulates the real sequence, catching bugs that fireEvent misses.

**Real Bug Example:**

```jsx
// Button shows loading spinner on MOUSEDOWN, not CLICK
function SubmitButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onMouseDown={() => setLoading(true)}
      onClick={handleSubmit}
    >
      {loading ? 'Loading...' : 'Submit'}
    </button>
  );
}

// ❌ MISSES BUG: fireEvent doesn't trigger mousedown
fireEvent.click(button);
expect(screen.queryByText(/loading/i)).toBeInTheDocument(); // FAILS

// ✅ CATCHES BUG: userEvent triggers full sequence
await user.click(button);
expect(screen.getByText(/loading/i)).toBeInTheDocument(); // PASSES
```

---

**The Async Testing Pattern: A Restaurant Order Analogy**

Imagine ordering food at a restaurant:

**Synchronous (getBy):**
```jsx
screen.getByText('Your meal')
// Like demanding your food the instant you sit down
// Waiter: "Uh... we haven't cooked it yet!" → ERROR
```

**Asynchronous (findBy):**
```jsx
await screen.findByText('Your meal')
// Like sitting down and patiently waiting for your order
// Checks every 50ms: "Is my food ready? No? I'll wait..."
// After 1 second: "Okay, this is taking too long" → ERROR
```

**The Pattern:**
```jsx
test('displays user profile after loading', async () => {
  render(<UserProfile id={123} />);

  // 1. Assert loading state (synchronous, must be there NOW)
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // 2. Wait for data to appear (asynchronous, will appear SOON)
  expect(await screen.findByText('John Doe')).toBeInTheDocument();

  // 3. Assert loading state disappeared (synchronous, must be gone NOW)
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

This tests three states:
1. **Loading state exists** (immediate assertion)
2. **Data appears** (patient waiting)
3. **Loading state disappears** (immediate assertion after data loads)

---

**Interview Answer Template**

**Question:** "How do you test React components?"

**Strong Answer:**

"I use React Testing Library because it tests components from a user's perspective rather than implementation details. I follow the query priority: `getByRole` for buttons and inputs, `getByLabelText` for form fields, and `getByText` for content. For user interactions, I use the `userEvent` library because it simulates realistic event sequences – when I call `await user.click(button)`, it triggers mouseover, mousedown, focus, mouseup, and click, catching bugs that simple event dispatching misses.

For async behavior, I use `findBy` queries which automatically wait up to 1 second for elements to appear. For example, when testing a component that fetches user data, I first assert the loading state with `getByText(/loading/i)`, then wait for data with `await findByText('John Doe')`, and finally verify the loading state disappeared with `queryByText(/loading/i)`.

I structure tests with Arrange-Act-Assert: render the component, simulate user actions with `userEvent`, and assert the expected outcome. I avoid testing implementation details like state or props, focusing instead on what users see and experience. For API calls, I use Mock Service Worker to intercept requests at the network level, providing realistic mocking that works in both tests and development.

In production, I've used these practices to maintain test suites with 2,000+ tests while keeping CI times under 15 minutes and flakiness under 1%. The key is using async queries consistently, cleaning up side effects in afterEach, and preferring integration tests over mocking every dependency."

**Why This Answers Lands:**

1. **Philosophy first:** Shows you understand WHY, not just HOW
2. **Specific techniques:** Mentions exact APIs (userEvent, findBy, queryBy)
3. **Real async pattern:** Demonstrates proper loading → data → no loading sequence
4. **Avoids pitfalls:** Explicitly mentions common mistakes (implementation details, fireEvent)
5. **Production experience:** Provides metrics (2,000+ tests, 15 min CI, <1% flakiness)
6. **Best practices:** MSW for mocking, Arrange-Act-Assert structure, cleanup

---

## Question 2: Testing Async Behavior and API Calls

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** All companies

### Question
How do you test components that fetch data or perform async operations in React Testing Library?

### Answer

**Async Testing** - Use `findBy` queries, `waitFor`, and proper mocking for async operations.

**Key Points:**
1. **findBy queries** - Automatically wait for elements to appear
2. **waitFor** - Wait for assertions to pass
3. **Mock fetch/axios** - Control API responses in tests
4. **Loading states** - Test loading, success, and error states
5. **Act warnings** - Ensure state updates are wrapped in act()

### Code Example

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// 1. USING findBy (Recommended for async)
test('displays user data after fetch', async () => {
  render(<UserProfile userId={1} />);

  // findBy automatically waits up to 1000ms
  const username = await screen.findByText(/john doe/i);
  expect(username).toBeInTheDocument();
});

// 2. USING waitFor (for complex assertions)
test('updates UI after data loads', async () => {
  render(<Dashboard />);

  await waitFor(() => {
    expect(screen.getByText(/dashboard loaded/i)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });
});

// 3. MOCK SERVICE WORKER (MSW) - Best Practice
const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({
        id,
        name: 'John Doe',
        email: 'john@example.com'
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('fetches and displays user with MSW', async () => {
  render(<UserProfile userId={1} />);

  // Wait for data to load
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});

// 4. ERROR HANDLING
test('shows error message when fetch fails', async () => {
  server.use(
    rest.get('/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ error: 'Server error' }));
    })
  );

  render(<UserProfile userId={1} />);

  expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
});

// 5. MOCK FETCH DIRECTLY (alternative to MSW)
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch.mockRestore();
});

test('fetches user data with mocked fetch', async () => {
  const mockUser = { id: 1, name: 'John' };

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockUser
  });

  render(<UserProfile userId={1} />);

  expect(await screen.findByText('John')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('/api/users/1');
});

// 6. TESTING LOADING STATES
test('shows loading spinner then content', async () => {
  render(<UserList />);

  // Initially shows loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Loading disappears, content appears
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  expect(screen.getByRole('list')).toBeInTheDocument();
});

// 7. DEBOUNCED SEARCH
test('debounces search input', async () => {
  render(<SearchUsers />);
  const user = userEvent.setup();

  const searchInput = screen.getByRole('textbox', { name: /search/i });

  // Type quickly
  await user.type(searchInput, 'John');

  // Should only call API once after debounce
  await waitFor(
    () => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    },
    { timeout: 600 } // Wait for debounce delay
  );
});

// 8. POLLING/REFETCHING
test('refetches data on interval', async () => {
  jest.useFakeTimers();
  render(<LiveDashboard refreshInterval={5000} />);

  // Initial fetch
  expect(await screen.findByText(/initial data/i)).toBeInTheDocument();

  // Fast-forward time
  jest.advanceTimersByTime(5000);

  // Should refetch
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  jest.useRealTimers();
});
```

### Common Mistakes

- ❌ Not using `await` with `findBy` queries
- ❌ Using `getBy` for elements that appear async (use `findBy`)
- ❌ Not cleaning up mocks in `afterEach`
- ❌ Testing implementation details of async logic
- ✅ Use MSW for realistic API mocking
- ✅ Test loading, success, and error states
- ✅ Use `findBy` for async elements that will appear

### Follow-up Questions

1. What's the difference between `waitFor` and `findBy`?
2. How do you handle tests with multiple async operations?
3. When would you use MSW vs direct fetch mocking?

### Resources
- [Async Testing](https://testing-library.com/docs/dom-testing-library/api-async/)
- [Mock Service Worker](https://mswjs.io/)

---

### 🔍 Deep Dive

**Async Testing Architecture and React's Concurrent Rendering Model**

Testing asynchronous behavior in React requires understanding how React schedules updates, how the test environment differs from production, and how testing utilities coordinate with React's internal timing mechanisms. Modern React with concurrent features adds complexity, as updates may be interrupted, batched, or prioritized differently than in legacy React.

**React's Test Renderer and Automatic Batching**

In production, React 18+ automatically batches state updates within event handlers, timeouts, promises, and native events to minimize re-renders. In test environments, React uses `ReactTestUtils.act()` to flush pending updates synchronously, ensuring the DOM reflects all state changes before assertions run. However, this synchronous flushing creates a mismatch: production handles async updates asynchronously, while tests force them to complete immediately.

The `act()` warning appears when state updates occur outside React's awareness during tests. For example, a promise resolves in a microtask queue after your test function completes. React detects that state changed without `act()` wrapping the operation, warning you that assertions might run against stale state. Modern RTL eliminates most manual `act()` usage by wrapping `userEvent` interactions and async queries automatically, but understanding this mechanism prevents confusion when testing custom async logic.

**The waitFor Polling Strategy and Performance Implications**

The `waitFor` utility implements a polling strategy with exponential backoff and mutation observation for efficient retrying. By default, it checks your callback every 50ms for up to 1000ms. The algorithm works as follows:

1. Execute callback, catch any errors
2. If callback succeeds without throwing, resolve promise
3. If callback throws, wait 50ms and retry
4. Use `MutationObserver` to detect DOM changes between polls
5. If DOM unchanged after 3 consecutive polls, increase interval to 100ms
6. Continue until callback succeeds or 1000ms timeout expires

This adaptive polling reduces unnecessary checks when the DOM is stable while maintaining responsiveness when updates occur. However, with default settings, a component that loads in 50ms still waits the full 50ms per poll, potentially adding 50-100ms to each test. For large test suites with thousands of async tests, this accumulates to significant CI time. Configuring shorter intervals (`{ interval: 10 }`) or tuning timeouts per test speeds up suites substantially.

**findBy Queries: Syntactic Sugar with Hidden Complexity**

The `findBy` queries combine `getBy` queries with `waitFor`, making async testing more ergonomic. When you write `await screen.findByText('Hello')`, RTL expands this to approximately:

```javascript
await waitFor(() => {
  return screen.getByText('Hello');
});
```

This reveals why `findBy` queries throw immediately if the element exists but doesn't match your matcher – `getBy` throws, `waitFor` catches the error, and retries until success or timeout. Understanding this internal implementation clarifies why `findBy` is perfect for elements that will appear but inappropriate for elements that may never appear (use `queryBy` with `waitFor` for those scenarios).

**Mock Service Worker (MSW): Network-Level Interception Architecture**

MSW intercepts network requests using Service Worker API in browsers and node-request-interceptor in Node.js tests. This architecture positions MSW between your component's fetch calls and the actual network, allowing it to return mocked responses without modifying application code.

In browser environments, MSW registers a service worker that intercepts fetch requests before they reach the network. The service worker matches requests against defined handlers, returning mock responses or forwarding to the real network. This approach enables using identical mocks in tests, development, and even production debugging.

In Node.js test environments (Jest), MSW uses a different interception strategy since Service Workers don't exist. It patches native modules (`http`, `https`, `XMLHttpRequest`) to intercept requests at the module level. This lower-level interception works identically from the component's perspective but operates differently under the hood.

**MSW Request Handlers and Response Composition**

MSW handlers use a request-response model similar to Express middleware:

```javascript
rest.get('/api/users/:id', (req, res, ctx) => {
  const { id } = req.params;
  const authHeader = req.headers.get('Authorization');

  // Validate request
  if (!authHeader) {
    return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
  }

  // Simulate network delay
  return res(
    ctx.delay(100),
    ctx.status(200),
    ctx.json({ id, name: 'John Doe', email: 'john@example.com' })
  );
});
```

The `ctx` (context) object provides composable response transformers: `ctx.status()` sets status code, `ctx.json()` serializes response body, `ctx.delay()` simulates network latency, `ctx.set()` adds headers. These transformers compose elegantly, allowing precise control over response characteristics without complex mock implementation.

**Advanced MSW Patterns: Stateful Mocking and Request Assertions**

MSW supports stateful mocks that remember previous requests, enabling testing of sequences and idempotent operations:

```javascript
let requestCount = 0;

rest.get('/api/data', (req, res, ctx) => {
  requestCount++;

  if (requestCount === 1) {
    return res(ctx.json({ status: 'processing' }));
  } else if (requestCount === 2) {
    return res(ctx.json({ status: 'complete', result: 42 }));
  }

  return res(ctx.status(404));
});
```

This pattern tests polling mechanisms, retry logic, and progressive enhancement without complex test orchestration.

MSW also enables request-level assertions by capturing requests:

```javascript
const capturedRequests = [];

rest.post('/api/analytics', (req, res, ctx) => {
  capturedRequests.push(await req.json());
  return res(ctx.status(204));
});

// In test: verify analytics calls
test('tracks user actions', async () => {
  // ... user interactions ...
  expect(capturedRequests).toContainEqual({
    event: 'button_click',
    timestamp: expect.any(Number)
  });
});
```

**Debouncing, Throttling, and Timing-Sensitive Tests**

Testing debounced/throttled behavior requires controlling time. Jest provides `jest.useFakeTimers()` to mock `setTimeout`, `setInterval`, and `Date.now()`, allowing manual time advancement:

```javascript
test('debounces search input', async () => {
  jest.useFakeTimers();
  render(<SearchComponent />);
  const user = userEvent.setup({ delay: null }); // Disable userEvent's built-in delays

  const input = screen.getByRole('textbox');

  await user.type(input, 'test');

  // No API call yet (debounced)
  expect(global.fetch).not.toHaveBeenCalled();

  // Fast-forward 500ms
  jest.advanceTimersByTime(500);

  // Now API called
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith('/api/search?q=test');
  });

  jest.useRealTimers();
});
```

Combining fake timers with `waitFor` requires care: `waitFor` uses `setTimeout` internally, so advancing timers during `waitFor` can cause unexpected behavior. Best practice is advancing timers, THEN using `waitFor` to verify the results.

**Testing Async React 18 Features: Suspense, Transitions, and Streaming SSR**

React 18's concurrent features introduce new async patterns requiring specialized testing approaches. Suspense boundaries delay rendering until data loads, transitions mark updates as non-urgent, and streaming SSR sends HTML incrementally.

For Suspense, tests should verify fallback rendering and eventual data display:

```javascript
test('shows fallback then data', async () => {
  render(
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile id={123} />
    </Suspense>
  );

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  expect(await screen.findByText('John Doe')).toBeInTheDocument();
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

For transitions, use React's `act()` with `startTransition`:

```javascript
import { startTransition } from 'react';

test('transitions update without blocking', async () => {
  render(<SearchResults />);

  const input = screen.getByRole('textbox');

  await act(async () => {
    startTransition(() => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
  });

  // Transition updates are async but lower priority
  await waitFor(() => {
    expect(screen.getByText(/results for "test"/i)).toBeInTheDocument();
  });
});
```

**Handling Race Conditions and Cleanup in Async Tests**

Common async test bugs stem from unresolved promises, uncleaned timers, and race conditions between multiple async operations. Best practices include:

1. **Always await promises:** Every async operation should be awaited or returned
2. **Clear timers in beforeEach/afterEach:** Prevent timers from leaking across tests
3. **Cancel pending requests in useEffect cleanup:** Components should cancel fetch on unmount
4. **Use AbortController for fetch cancellation:** Modern API for request cancellation

```javascript
function useData(url) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });

    return () => controller.abort(); // Cleanup!
  }, [url]);

  return data;
}
```

Testing this hook verifies cleanup prevents memory leaks:

```javascript
test('cancels fetch on unmount', async () => {
  const { unmount } = render(<Component url="/api/data" />);

  unmount(); // Trigger cleanup

  // Verify no state updates after unmount (would cause warnings)
  await waitFor(() => {
    expect(console.error).not.toHaveBeenCalled();
  });
});
```

---

### 🐛 Real-World Scenario

**Production Bug: Infinite Loading State Due to Race Condition**

**Context:** A fintech dashboard displayed real-time account balances by polling an API every 5 seconds. Users reported that balances occasionally showed "Loading..." indefinitely, requiring page refresh. The bug occurred in ~3% of sessions, always during the first 30 seconds after login, and disproportionately affected users with slow connections or high latency.

**Initial Symptoms and Metrics:**
- Affected sessions: 3% (1,200 out of 40,000 daily active users)
- Time to occur: 15-30 seconds after page load
- User impact: Complete loss of balance visibility, 68% of affected users refreshed page
- Support tickets: 45 per week related to "balance not loading"
- Revenue impact: Estimated $12k/month in lost conversions (users abandoning flows)

**Investigation Process:**

The team couldn't reproduce the bug locally because development machines had fast connections and low latency. They instrumented the production app with logging:

```javascript
// Added logging to track state transitions
useEffect(() => {
  console.log('[Balance] Fetching started', { timestamp: Date.now() });

  fetchBalance()
    .then(data => {
      console.log('[Balance] Data received', { data, timestamp: Date.now() });
      setBalance(data);
      setLoading(false);
    })
    .catch(err => {
      console.log('[Balance] Error occurred', { err, timestamp: Date.now() });
      setError(err);
      setLoading(false);
    });
}, [userId]);
```

After analyzing production logs from 50 affected sessions, they discovered the pattern:

**Smoking Gun in Logs:**
```
[Balance] Fetching started (timestamp: 1000)
[Balance] Fetching started (timestamp: 5000)  // Second fetch triggered!
[Balance] Data received (timestamp: 6500)    // First response arrives AFTER second fetch started
[Balance] Data received (timestamp: 10000)   // Second response arrives
// Loading state never set to false because effect ran twice
```

**Root Cause Analysis:**

The component fetched data in `useEffect` without proper cleanup, and React 18's Strict Mode was triggering double-mounting in development (to catch this exact issue) but the team ignored the warnings.

**Problematic Code:**

```jsx
// ❌ RACE CONDITION: No cleanup, no request cancellation
function BalanceWidget({ userId }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetchBalance(userId)
      .then(data => {
        setBalance(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>Balance: ${balance}</div>;
}
```

**The Race Condition Explained:**

1. Component mounts, starts fetch #1, sets loading = true
2. User's slow connection delays response
3. React re-renders (due to parent state change or Strict Mode double-mount)
4. Effect runs again, starts fetch #2, sets loading = true
5. Fetch #1 completes, sets loading = false
6. Fetch #2 completes, BUT if the setter references stale state, loading might remain true

The actual bug was more subtle: the component was inside a Suspense boundary that briefly unmounted it during initial data loading, then re-mounted after 2 seconds. The first fetch started, component unmounted, component re-mounted, second fetch started, first fetch completed with stale data, second fetch never completed due to API rate limiting.

**Testing the Bug:**

The team wrote a failing test that reproduced the race condition:

```jsx
// ❌ TEST EXPOSING BUG
test('handles rapid re-fetches without getting stuck in loading', async () => {
  const mockFetch = jest.fn()
    .mockImplementationOnce(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({ balance: 100 }), 200)
      )
    )
    .mockImplementationOnce(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({ balance: 200 }), 100)
      )
    );

  global.fetch = mockFetch;

  const { rerender } = render(<BalanceWidget userId={1} />);

  // Initial loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Simulate re-mount by re-rendering with different userId
  rerender(<BalanceWidget userId={2} />);

  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  }, { timeout: 5000 });

  expect(screen.getByText(/Balance: \$200/i)).toBeInTheDocument();
});

// TEST FAILED: Timeout after 5s, loading state never cleared
```

**Solution Implementation:**

**Fix 1: Implement AbortController for Request Cancellation**

```jsx
// ✅ PROPER: Cancel in-flight requests on cleanup
function BalanceWidget({ userId }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchBalance(userId, { signal: controller.signal })
      .then(data => {
        setBalance(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('Fetch cancelled');
          return; // Don't update state for cancelled requests
        }
        setError(err);
        setLoading(false);
      });

    return () => {
      controller.abort(); // Cancel on unmount or userId change
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>Balance: ${balance}</div>;
}
```

**Fix 2: Use Ignore Flag for Non-Abortable Async Operations**

For libraries that don't support AbortController, use an ignore flag:

```jsx
// ✅ ALTERNATIVE: Ignore stale responses
useEffect(() => {
  let ignore = false;

  setLoading(true);

  fetchBalance(userId).then(data => {
    if (!ignore) {  // Only update if not stale
      setBalance(data);
      setLoading(false);
    }
  });

  return () => {
    ignore = true;  // Mark this effect as stale
  };
}, [userId]);
```

**Fix 3: Updated Test Suite**

```jsx
// ✅ TEST NOW PASSES
test('cancels previous fetch when userId changes', async () => {
  let abortCallCount = 0;
  const mockFetch = jest.fn((url, options) => {
    // Track abort signal
    options.signal.addEventListener('abort', () => abortCallCount++);

    return new Promise(resolve =>
      setTimeout(() => {
        if (options.signal.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        resolve({ json: () => ({ balance: 100 }) });
      }, 100)
    );
  });

  global.fetch = mockFetch;

  const { rerender } = render(<BalanceWidget userId={1} />);

  // Trigger re-fetch before first completes
  rerender(<BalanceWidget userId={2} />);

  // First fetch should be aborted
  await waitFor(() => {
    expect(abortCallCount).toBe(1);
  });

  // Second fetch completes normally
  expect(await screen.findByText(/Balance: \$100/i)).toBeInTheDocument();
});

test('handles unmount during fetch without memory leaks', async () => {
  const consoleError = jest.spyOn(console, 'error');

  const { unmount } = render(<BalanceWidget userId={1} />);

  // Unmount before fetch completes
  unmount();

  await waitFor(() => {
    // Should not log "Can't perform state update on unmounted component"
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining('unmounted component')
    );
  });

  consoleError.mockRestore();
});
```

**Results After Fixes:**

- **Affected sessions:** 3% → 0.02% (150x improvement, residual issues from network errors)
- **Support tickets:** 45/week → 2/week (95% reduction)
- **User satisfaction:** Measured via NPS, improved from 6.2 to 7.8
- **Revenue recovery:** Estimated $11k/month regained from reduced abandonment
- **CI test time:** Increased by 45 seconds (acceptable for catching critical bugs)

**Performance Metrics:**

The fix added cleanup overhead but improved reliability dramatically:
- Additional cleanup code: ~8 lines per component
- Memory leak prevention: 100% (no more state updates on unmounted components)
- Test coverage for race conditions: 0% → 85%

**Key Lessons:**

1. **Always cleanup async operations in useEffect** – Abort requests, clear timers, unsubscribe
2. **React Strict Mode warnings are not noise** – They catch real production bugs
3. **Slow connections expose race conditions** – Test with `ctx.delay()` in MSW to simulate latency
4. **AbortController is essential for fetch** – Modern standard for cancellation
5. **Test rapid re-renders and unmounting** – Use `rerender()` and `unmount()` aggressively

**Interview Answer Template:**

"I debugged an infinite loading state bug affecting 3% of users in a fintech app. Production logs revealed a race condition: components re-fetched data without canceling previous requests, and responses arriving out of order left the UI stuck in loading state. I implemented AbortController to cancel in-flight requests when the component unmounted or dependencies changed, and added an ignore flag fallback for non-abortable operations. I wrote tests using `rerender()` to simulate rapid prop changes and verified abort signals were triggered correctly. This reduced affected sessions by 150x and eliminated 95% of related support tickets, recovering ~$11k monthly revenue."

---

### ⚖️ Trade-offs

**Async Query Strategies: findBy vs waitFor vs getBy with Retry**

Testing async behavior offers multiple approaches with different trade-offs:

**1. findBy Queries (Implicit Waiting)**

```jsx
expect(await screen.findByText('John Doe')).toBeInTheDocument();
```

**Pros:**
- Concise, readable syntax
- Automatically retries for 1000ms
- Built-in error messages
- Best for simple "element will appear" scenarios

**Cons:**
- Fixed 1000ms timeout (can't easily customize per-query)
- Single element assertion only (can't check multiple conditions)
- Throws immediately if element exists but doesn't match matcher
- Hidden complexity (developers don't realize it's polling)

**When to Use:** Default choice for async elements that will definitely appear

---

**2. waitFor with getBy (Explicit Waiting)**

```jsx
await waitFor(() => {
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(5);
});
```

**Pros:**
- Supports multiple assertions in one wait
- Configurable timeout and interval: `waitFor(() => {...}, { timeout: 500, interval: 10 })`
- Better for complex conditions (element count, multiple elements, computed values)
- More explicit about async behavior

**Cons:**
- More verbose syntax
- Requires understanding of polling behavior
- Can be slower if assertions are expensive (runs repeatedly)

**When to Use:** Complex assertions, custom timing requirements, multiple conditions

---

**3. Manual Retry Logic**

```jsx
let attempts = 0;
while (attempts < 10) {
  if (screen.queryByText('John Doe')) break;
  await new Promise(resolve => setTimeout(resolve, 100));
  attempts++;
}
```

**Pros:**
- Full control over retry logic
- Can implement exponential backoff
- Works for non-DOM async conditions

**Cons:**
- Verbose, error-prone
- Easy to create infinite loops
- Doesn't integrate with RTL error messages

**When to Use:** Rare; only when waitFor can't express your condition

---

**Decision Matrix:**

| Scenario | Best Approach | Rationale |
|----------|---------------|-----------|
| Single element will appear | `findBy` | Simplest, most readable |
| Element count assertion | `waitFor` + `getAllBy` | findBy doesn't support length checks |
| Custom timeout needed | `waitFor` | Configurable timeout/interval |
| Element might never appear | `waitFor` + `queryBy` | queryBy doesn't throw, allows clean timeout |
| Multiple related assertions | `waitFor` | Atomic wait for all conditions |
| Very fast component (<50ms) | `getBy` (no wait) | Avoid unnecessary timeout overhead |

**Performance Consideration:**

In a test suite with 2,000 tests, each using `findBy` with default 1000ms timeout, even if each component loads in 50ms, you're adding 50-100ms per test due to polling overhead. This accumulates to 100-200 seconds of wasted CI time. Optimizations:

```jsx
// Custom configuration for faster tests
screen.findByText('Hello', {}, { timeout: 300 }); // Reduce timeout to 300ms

// Or configure globally
import { configure } from '@testing-library/react';
configure({ asyncUtilTimeout: 500 });
```

Real example: A SaaS company reduced CI time from 18 minutes to 12 minutes (33% faster) by tuning async timeouts based on actual component load times measured in production.

---

**Mocking Strategy: MSW vs Direct Fetch Mocking**

**Mock Service Worker (MSW)**

```jsx
const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ name: 'John' }));
  })
);
```

**Pros:**
- Network-level interception (most realistic)
- Works in both tests and browser (reuse mocks in development)
- Excellent error simulation (status codes, network failures, delays)
- No need to mock fetch/axios directly
- Handlers are reusable across tests
- Great for testing retry logic, error boundaries, loading states

**Cons:**
- Additional setup (server.listen/close/resetHandlers)
- Learning curve for MSW API
- Slightly slower than direct mocking (processes HTTP layer)
- Adds ~50kb to test bundle (negligible for modern projects)

**When to Use:**
- Testing components that make real API calls
- Simulating network delays, errors, or retries
- Wanting to reuse mocks in development mode
- Testing applications with many API endpoints

---

**Direct Fetch Mocking**

```jsx
global.fetch = jest.fn().mockResolvedValue({
  json: async () => ({ name: 'John' })
});
```

**Pros:**
- Simplest setup, no extra libraries
- Fastest execution (no HTTP processing)
- Familiar Jest API
- Good for quick unit tests

**Cons:**
- Must mock fetch/axios for every test (or in beforeEach)
- Doesn't work in browser (tests only)
- Can't simulate realistic network behavior (delays, partial responses)
- Easy to forget cleanup (mockRestore in afterEach)
- Brittle if component uses different fetch libraries

**When to Use:**
- Simple components with 1-2 API calls
- Utility function tests (not React components)
- Maximum speed is critical (large test suites with thousands of tests)

---

**Real API Calls (Test Database)**

```jsx
// Actually calls real backend with test database
test('creates user', async () => {
  const response = await createUser({ name: 'John' });
  expect(response.status).toBe(201);
});
```

**Pros:**
- Highest confidence (tests real integration)
- Catches API contract changes immediately
- Tests authentication, CORS, actual server logic

**Cons:**
- Slow (network + DB overhead: 500-2000ms per test)
- Requires test database infrastructure
- Flaky (network issues, DB state pollution)
- Difficult to simulate errors (how do you make the DB fail on command?)
- Can't run tests offline

**When to Use:**
- Contract tests (ensure frontend and backend agree on API shape)
- Integration tests for critical flows (checkout, payments)
- Smoke tests in staging environment
- NOT for unit/component tests (too slow)

---

**Comparison Table:**

| Factor | MSW | Direct Mock | Real API |
|--------|-----|-------------|----------|
| **Speed** | 50-100ms | 10-20ms | 500-2000ms |
| **Setup Complexity** | Medium | Low | High |
| **Realism** | High | Medium | Highest |
| **Reusability** | High (tests + dev) | Low (tests only) | N/A |
| **Error Simulation** | Excellent | Good | Difficult |
| **Maintenance** | Low | Medium | High |
| **Best For** | Component tests | Utility tests | Contract tests |

**Recommended Strategy (Testing Pyramid):**

- 80% MSW (component integration tests)
- 15% Direct mocks (utility/hook unit tests)
- 5% Real API (contract tests, E2E critical paths)

---

**Timing Control: Real Timers vs Fake Timers**

**Real Timers (Default)**

```jsx
test('delays message', async () => {
  render(<DelayedMessage delay={1000} />);
  expect(await screen.findByText('Hello', {}, { timeout: 1500 })).toBeInTheDocument();
});
```

**Pros:**
- Simple, no special setup
- Tests actual timing behavior
- Works with async/await naturally

**Cons:**
- Tests actually wait (1000ms delay = 1000ms test time)
- Slow for debounce/throttle tests
- Can't precisely control timing

**When to Use:** Default choice, tests run fast enough

---

**Fake Timers (jest.useFakeTimers)**

```jsx
test('delays message', async () => {
  jest.useFakeTimers();
  render(<DelayedMessage delay={1000} />);

  jest.advanceTimersByTime(1000);

  expect(screen.getByText('Hello')).toBeInTheDocument();

  jest.useRealTimers();
});
```

**Pros:**
- Instant test execution (no actual waiting)
- Precise timing control
- Essential for testing debounce/throttle

**Cons:**
- Requires setup/teardown (useFakeTimers/useRealTimers)
- Breaks async operations (await won't work without manual flushing)
- Easy to create timing bugs in tests themselves
- Doesn't work with `findBy` (which uses setTimeout internally)

**When to Use:**
- Testing debounce, throttle, polling
- Components with long delays (>1s)
- Precise timing requirements (must trigger exactly at 500ms)

---

**Hybrid Approach: Fake Timers + Manual Flushing**

```jsx
test('debounced search', async () => {
  jest.useFakeTimers();
  render(<Search />);
  const user = userEvent.setup({ delay: null });

  await user.type(screen.getByRole('textbox'), 'test');

  // Fast-forward debounce delay
  jest.advanceTimersByTime(300);

  // Manually flush microtasks (for promises)
  await act(async () => {
    await Promise.resolve();
  });

  expect(screen.getByText('Results for: test')).toBeInTheDocument();

  jest.useRealTimers();
});
```

**When to Use:** Testing components that combine timers (setTimeout) with promises (fetch)

---

**Decision Framework:**

| Test Scenario | Timer Strategy | Rationale |
|---------------|----------------|-----------|
| Debounce/throttle | Fake timers | Instant execution, precise control |
| Polling (setInterval) | Fake timers | Control when polls trigger |
| Fetch + short delay (<200ms) | Real timers | Simplicity, tests fast enough |
| Fetch + long delay (>1s) | Fake timers | Avoid slow tests |
| Animation testing | Real timers + waitFor | Animations often use RAF, not setTimeout |
| Production-like timing | Real timers | Catch timing-related bugs |

**Real Example:**

A chat app had 150 tests for debounced message sending. With real timers, suite took 6 minutes (150 tests × 300ms debounce × 1.3 overhead). With fake timers, suite took 25 seconds (instant timer advancement). 14.4x speedup!

---

### 💬 Explain to Junior

**Async Testing: The Restaurant Order Analogy (Extended Edition)**

Imagine you're testing a restaurant's service. When you order food, you don't expect it instantly – there's a wait while the kitchen prepares it. Testing async React components is the same: you need to wait for data to "cook" before checking if it's served correctly.

**Three Ways to Handle Waiting:**

**1. findBy – "I'll Wait at My Table"**

```jsx
expect(await screen.findByText('Your burger is ready!')).toBeInTheDocument();
```

This is like sitting at your table and patiently checking every few seconds: "Is my food here? Not yet... how about now? Not yet... now? YES!"

The waiter (findBy) automatically checks every 50ms for up to 1 second. If your food arrives within that time, great! If not, you get frustrated and leave (test fails).

**When to use:** You KNOW food is coming, you just need to wait for it.

---

**2. waitFor – "I'll Wait, But I Have Conditions"**

```jsx
await waitFor(() => {
  expect(screen.getByText('Burger ready')).toBeInTheDocument();
  expect(screen.getByText('Fries ready')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
});
```

This is like telling the waiter: "I'll wait, but I need my burger AND fries AND my three side dishes. Don't tell me I'm done until EVERYTHING is ready."

`waitFor` keeps checking ALL your conditions together. Only when every condition is true does it say "success!"

**When to use:** You need multiple things to be ready at once, or you want to customize how long you'll wait.

---

**3. getBy + No Waiting – "I Want It NOW"**

```jsx
expect(screen.getByText('Your burger')).toBeInTheDocument();
```

This is like demanding your food the instant you sit down. If it's not already on the table, you throw a tantrum (test fails immediately).

**When to use:** You KNOW the element is already there (like a "Menu" button that's always visible).

---

**Real-World Async Pattern: The Three-Stage Order**

Here's how a real test handles loading data:

```jsx
test('shows user profile after loading', async () => {
  render(<UserProfile id={123} />);

  // STAGE 1: Verify loading state appears immediately
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  // Like confirming the waiter said "Your order is being prepared"

  // STAGE 2: Wait for the data to arrive
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
  // Like waiting patiently until your burger arrives

  // STAGE 3: Verify loading state is gone
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  // Like confirming the waiter removed the "Preparing" sign
});
```

**Why test all three stages?**

If you only test stage 2 (data appears), you might miss bugs where:
- Loading indicator never showed (bad UX)
- Loading indicator never disappeared (stuck in loading forever)

---

**Mock Service Worker (MSW): The Fake Kitchen**

In real life, you can't control when the kitchen finishes your food. In tests, you need that control! MSW is like hiring a fake kitchen that gives you INSTANT, PERFECT food every time.

**Real Restaurant (Production):**
```jsx
// Component makes real API call
fetch('/api/users/123')
  .then(res => res.json())
  .then(data => setUser(data));

// Takes 500ms, depends on real server, might fail
```

**Fake Kitchen (MSW in Tests):**
```jsx
// MSW intercepts the request before it reaches the real server
const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ id: 123, name: 'John Doe' }));
  })
);

// Returns instantly, always succeeds, you control the data!
```

**Analogy:**

Your component orders a burger by calling `fetch('/api/users/123')`. Instead of sending that order to the real kitchen (real server), MSW intercepts it and says:

"Oh, you want user 123? Here, I've got that right here!" *hands you perfect data instantly*

This lets you test:
- ✅ What happens when data loads successfully
- ✅ What happens when the server returns an error
- ✅ What happens when the network is slow
- ✅ What happens when you get unexpected data

**Simulating a Slow Kitchen:**

```jsx
rest.get('/api/users/:id', (req, res, ctx) => {
  return res(
    ctx.delay(2000), // Wait 2 seconds before responding
    ctx.json({ name: 'John' })
  );
});
```

This is like telling the fake kitchen: "Take 2 seconds before giving me my burger." Now you can test if your loading spinner shows up during those 2 seconds!

**Simulating a Kitchen Fire (Errors):**

```jsx
rest.get('/api/users/:id', (req, res, ctx) => {
  return res(
    ctx.status(500), // Server error!
    ctx.json({ error: 'Kitchen is on fire!' })
  );
});
```

Now you can test if your error message displays correctly when things go wrong.

---

**Why Use MSW Instead of Simple Mocks?**

**Simple Mock (jest.fn):**
```jsx
global.fetch = jest.fn().mockResolvedValue({
  json: async () => ({ name: 'John' })
});
```

This is like telling your component: "Whenever you call `fetch`, just pretend you got this data."

**Problem:** This is ONLY for tests. You can't use it while developing in the browser.

**MSW:**
```jsx
rest.get('/api/users/:id', (req, res, ctx) => {
  return res(ctx.json({ name: 'John' }));
});
```

This works in BOTH tests AND your browser! You can develop your frontend without needing a real backend running.

**Analogy:** Simple mocks are like practicing with fake food (only in tests). MSW is like having a fake kitchen you can use anytime (tests AND development).

---

**Fake Timers: Time Travel for Tests**

Some components have delays:

```jsx
function DelayedGreeting() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 5000); // Wait 5 seconds
  }, []);

  return show ? <div>Hello!</div> : <div>Waiting...</div>;
}
```

**With Real Timers:**
```jsx
test('shows greeting after 5 seconds', async () => {
  render(<DelayedGreeting />);

  // Actually wait 5 seconds 😴
  expect(await screen.findByText('Hello!', {}, { timeout: 6000 }))
    .toBeInTheDocument();
});
```

This test takes 5+ seconds to run. If you have 100 tests like this, your test suite takes 8+ minutes!

**With Fake Timers:**
```jsx
test('shows greeting after 5 seconds', () => {
  jest.useFakeTimers(); // Enter time travel mode!

  render(<DelayedGreeting />);

  expect(screen.getByText('Waiting...')).toBeInTheDocument();

  jest.advanceTimersByTime(5000); // Fast-forward 5 seconds INSTANTLY

  expect(screen.getByText('Hello!')).toBeInTheDocument();

  jest.useRealTimers(); // Exit time travel mode
});
```

This test runs in ~10ms instead of 5000ms!

**Analogy:** Real timers are like actually waiting 5 seconds. Fake timers are like having a remote control that fast-forwards time – you instantly jump 5 seconds into the future.

---

**AbortController: Canceling Your Order**

Imagine you order food, then change your mind. You tell the waiter "Cancel my burger!" But if the kitchen already finished it, you still get charged. AbortController is how you properly cancel requests.

**Problem Without Cancellation:**

```jsx
// ❌ Component orders burger, then unmounts (user navigates away)
function BurgerWidget({ burgerId }) {
  useEffect(() => {
    fetch(`/api/burgers/${burgerId}`)
      .then(res => res.json())
      .then(data => setBurger(data)); // PROBLEM: component might be gone!
  }, [burgerId]);
}
```

If the user navigates away before the burger arrives, the component tries to "setBurger" after it's unmounted. This causes memory leaks and errors!

**Solution With AbortController:**

```jsx
// ✅ Properly cancel order when leaving
function BurgerWidget({ burgerId }) {
  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/burgers/${burgerId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setBurger(data))
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('Order cancelled'); // Normal, not an error!
          return;
        }
        console.error(err); // Real error
      });

    return () => {
      controller.abort(); // Cancel when component unmounts!
    };
  }, [burgerId]);
}
```

**Analogy:** `controller.abort()` is like pressing a "Cancel Order" button when you leave the restaurant. The kitchen stops preparing your food, and you don't get charged.

---

**Interview Answer Template**

**Question:** "How do you test async behavior in React?"

**Strong Answer:**

"I use React Testing Library's async queries to handle asynchronous behavior. For elements that appear after data loads, I use `findBy` queries which automatically retry for up to 1 second. For example, when testing a user profile component, I first assert the loading state appears with `getByText(/loading/i)`, then wait for the data with `await findByText('John Doe')`, and finally verify the loading state disappeared with `queryByText(/loading/i)`.

For API mocking, I use Mock Service Worker because it intercepts requests at the network level, making mocks work in both tests and development. I can simulate realistic scenarios like network delays using `ctx.delay(100)` or server errors with `ctx.status(500)`. This catches edge cases that simple mocks miss.

For components with timers or debouncing, I use `jest.useFakeTimers()` to control time. This lets me fast-forward through delays instantly instead of actually waiting. For example, I can test a 5-second delay in milliseconds by calling `jest.advanceTimersByTime(5000)`.

I always implement cleanup in `useEffect` using AbortController for fetch requests. This prevents state updates on unmounted components and memory leaks. In tests, I verify cleanup by unmounting components during async operations and ensuring no errors occur.

In production, these practices helped me maintain a test suite with 2,000+ async tests that runs in under 15 minutes with <1% flakiness. The key is using proper async queries, cleaning up side effects, and simulating realistic network conditions with MSW."

**Why This Answer Lands:**

1. **Specific pattern:** Shows the loading → data → no-loading sequence
2. **Tools mentioned:** findBy, MSW, jest.useFakeTimers, AbortController
3. **Real scenarios:** Network delays, errors, cleanup, debouncing
4. **Production experience:** 2,000+ tests, 15 min CI, <1% flakiness
5. **Best practices:** Cleanup, realistic mocking, proper async handling

---

## Question 3: Testing Custom Hooks

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Meta, Netflix

### Question
How do you test custom React hooks? What tools and patterns should you use?

### Answer

**Testing Custom Hooks** - Use `@testing-library/react-hooks` or render a test component.

**Key Points:**
1. **renderHook** - Dedicated utility for testing hooks
2. **result.current** - Access hook's return value
3. **act** - Wrap state updates in act()
4. **waitFor** - Wait for async hook updates
5. **Test component approach** - Alternative for complex scenarios

### Code Example

```jsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCounter, useFetch, useLocalStorage } from './hooks';

// 1. TESTING SIMPLE CUSTOM HOOK
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

test('useCounter increments count', () => {
  const { result } = renderHook(() => useCounter(0));

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});

test('useCounter resets to initial value', () => {
  const { result } = renderHook(() => useCounter(10));

  act(() => {
    result.current.increment();
    result.current.increment();
  });

  expect(result.current.count).toBe(12);

  act(() => {
    result.current.reset();
  });

  expect(result.current.count).toBe(10);
});

// 2. TESTING ASYNC HOOK
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

test('useFetch fetches data', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ id: 1, name: 'John' })
  });

  const { result } = renderHook(() => useFetch('/api/users/1'));

  // Initially loading
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toBe(null);

  // Wait for data to load
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data).toEqual({ id: 1, name: 'John' });
  expect(result.current.error).toBe(null);

  global.fetch.mockRestore();
});

// 3. TESTING HOOK WITH DEPENDENCIES
test('useFetch refetches when URL changes', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ id: 1 })
  });

  const { result, rerender } = renderHook(
    ({ url }) => useFetch(url),
    { initialProps: { url: '/api/users/1' } }
  );

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(global.fetch).toHaveBeenCalledWith('/api/users/1');

  // Change URL
  rerender({ url: '/api/users/2' });

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(global.fetch).toHaveBeenCalledWith('/api/users/2');
  expect(global.fetch).toHaveBeenCalledTimes(2);

  global.fetch.mockRestore();
});

// 4. TESTING HOOK WITH CONTEXT
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

test('useAuth returns context value', () => {
  const wrapper = ({ children }) => (
    <AuthContext.Provider value={{ user: { name: 'John' }, logout: jest.fn() }}>
      {children}
    </AuthContext.Provider>
  );

  const { result } = renderHook(() => useAuth(), { wrapper });

  expect(result.current.user).toEqual({ name: 'John' });
  expect(result.current.logout).toBeInstanceOf(Function);
});

// 5. ALTERNATIVE: TEST COMPONENT APPROACH
function TestComponent() {
  const { count, increment } = useCounter(0);

  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

test('useCounter works in component', async () => {
  render(<TestComponent />);
  const user = userEvent.setup();

  expect(screen.getByText('Count: 0')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /increment/i }));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Common Mistakes

- ❌ Forgetting to wrap state updates in `act()`
- ❌ Not providing required context/providers when testing hooks
- ❌ Testing hook implementation details instead of behavior
- ❌ Not cleaning up side effects (timers, subscriptions)
- ✅ Use `renderHook` for most cases
- ✅ Use test component approach for complex scenarios
- ✅ Properly mock dependencies (fetch, localStorage, etc.)

### Follow-up Questions

1. When would you use `renderHook` vs rendering a test component?
2. How do you test hooks that use context?
3. How do you test cleanup functions in useEffect?

### Resources
- [Testing React Hooks](https://react-hooks-testing-library.com/)
- [React Testing Library Hooks](https://testing-library.com/docs/react-testing-library/api#renderhook)

---

### 🔍 Deep Dive

**Hook Testing Architecture and React's Rules of Hooks**

Testing custom hooks requires understanding React's internal hook implementation, the Rules of Hooks, and how testing utilities work around these constraints. Unlike components that return JSX, hooks return JavaScript values, requiring specialized testing approaches that maintain React's hook contract while isolating hook logic from UI concerns.

**The renderHook Utility: Creating a Virtual Component**

React hooks can only be called inside function components or other hooks during render. This constraint stems from React's internal hook implementation, which uses a call-order-dependent linked list to track hook state. When you call `useState`, React doesn't know which state you're referring to by variable name—it only knows by position in the call sequence.

The `renderHook` utility from React Testing Library solves this by creating an invisible test component that calls your hook during its render:

```javascript
// What renderHook does internally (simplified)
function renderHook(hookFn) {
  let result;

  function TestComponent() {
    result = hookFn(); // Call hook during render
    return null; // No UI needed
  }

  const rendered = render(<TestComponent />);

  return {
    result: { current: result },
    rerender: (newProps) => rendered.rerender(<TestComponent {...newProps} />),
    unmount: rendered.unmount
  };
}
```

The `result.current` pattern uses a ref-like object that's updated on each render, allowing your test to access the latest hook return value even after re-renders. This design is necessary because JavaScript closures would capture the initial value, not subsequent updates.

**Managing Hook State Updates with act()**

When you call functions returned by hooks (like `increment` from a counter hook), they trigger state updates that schedule re-renders. In React's test environment, these updates must be wrapped in `act()` to ensure React flushes pending effects and updates before assertions run.

```javascript
test('counter increments', () => {
  const { result } = renderHook(() => useCounter(0));

  // ❌ WITHOUT ACT: Assertion might run before state updates
  result.current.increment();
  expect(result.current.count).toBe(1); // FAILS: still 0

  // ✅ WITH ACT: Ensures update completes before assertion
  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(1); // PASSES
});
```

Modern RTL's `renderHook` automatically wraps many operations in `act()`, but manual wrapping is necessary for direct function calls that trigger state updates.

**Testing Hooks with Dependencies: The rerender Pattern**

Hooks that depend on props or arguments need testing across different values. The `rerender` function allows changing hook inputs without unmounting, preserving hook state while triggering re-execution with new parameters:

```javascript
test('useFetch refetches when URL changes', async () => {
  const { result, rerender } = renderHook(
    ({ url }) => useFetch(url),
    { initialProps: { url: '/api/users/1' } }
  );

  // Wait for initial fetch
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data.id).toBe(1);

  // Change URL and verify refetch
  rerender({ url: '/api/users/2' });

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data.id).toBe(2);
});
```

The rerender mechanism simulates what happens in real components when props change: the hook's useEffect dependencies detect changes and trigger cleanup/re-execution.

**Testing Hooks That Use Context: Wrapper Providers**

Hooks that call `useContext` require their context provider to be present during testing. The `wrapper` option in `renderHook` wraps the virtual test component in providers:

```javascript
test('useAuth returns user from context', () => {
  const mockUser = { id: 1, name: 'John' };

  const wrapper = ({ children }) => (
    <AuthContext.Provider value={{ user: mockUser, logout: jest.fn() }}>
      {children}
    </AuthContext.Provider>
  );

  const { result } = renderHook(() => useAuth(), { wrapper });

  expect(result.current.user).toEqual(mockUser);
  expect(result.current.logout).toBeInstanceOf(Function);
});
```

This pattern extends to any provider: Router, Theme, State Management, Query Cache. Best practice is creating a custom `renderHook` wrapper that includes all global providers:

```javascript
function renderHookWithProviders(hook, { user = null, theme = 'light', ...options } = {}) {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider user={user}>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

  return renderHook(hook, { wrapper, ...options });
}
```

**Async Hooks and waitFor: Polling for State Changes**

Hooks that perform async operations (data fetching, timers) require waiting for state updates. The `waitFor` utility polls hook state until assertions pass:

```javascript
test('useFetch loads data', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ id: 1, name: 'John' })
  });

  const { result } = renderHook(() => useFetch('/api/users/1'));

  // Initially loading
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toBe(null);

  // Wait for state updates
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data).toEqual({ id: 1, name: 'John' });
  expect(result.current.error).toBe(null);

  global.fetch.mockRestore();
});
```

The polling mechanism checks `result.current` repeatedly, which always reflects the latest state due to the ref-like structure. This differs from component testing where you query the DOM; with hooks, you directly access the return value.

**Testing Hook Cleanup and Memory Leaks**

Hooks with side effects (subscriptions, timers, event listeners) must clean up in useEffect returns. Testing cleanup verifies no memory leaks occur:

```javascript
function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup!
    };
  }, []);

  return size;
}

test('useWindowSize cleans up event listener on unmount', () => {
  const addListener = jest.spyOn(window, 'addEventListener');
  const removeListener = jest.spyOn(window, 'removeEventListener');

  const { unmount } = renderHook(() => useWindowSize());

  expect(addListener).toHaveBeenCalledWith('resize', expect.any(Function));

  unmount();

  expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));

  addListener.mockRestore();
  removeListener.mockRestore();
});
```

This pattern catches common bugs where developers forget cleanup, leading to duplicate listeners, memory leaks, and "setState on unmounted component" warnings.

**Alternative Approach: Testing Hooks Through Components**

Some teams prefer testing hooks by rendering actual components that use them, arguing this better reflects real usage:

```javascript
function CounterComponent() {
  const { count, increment, decrement } = useCounter(0);

  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

test('useCounter works in component', async () => {
  render(<CounterComponent />);
  const user = userEvent.setup();

  expect(screen.getByTestId('count')).toHaveTextContent('0');

  await user.click(screen.getByRole('button', { name: '+' }));
  expect(screen.getByTestId('count')).toHaveTextContent('1');

  await user.click(screen.getByRole('button', { name: '-' }));
  expect(screen.getByTestId('count')).toHaveTextContent('0');
});
```

**Comparison: renderHook vs Component Testing**

| Aspect | renderHook | Component Testing |
|--------|-----------|------------------|
| **Isolation** | Tests hook logic only | Tests hook + UI rendering |
| **Speed** | Faster (no DOM rendering) | Slower (full component tree) |
| **Clarity** | Direct access to hook return value | Indirect access via DOM queries |
| **Realism** | Less realistic (no UI context) | More realistic (actual usage) |
| **Setup** | Minimal boilerplate | Requires test component |
| **Use Case** | Utility hooks, complex logic | Integration testing, hooks tightly coupled to UI |

**Best Practice:** Use `renderHook` for utility hooks (useFetch, useLocalStorage, useDebounce) and component testing for hooks tightly coupled to UI (useFormValidation that displays errors, useInfiniteScroll that renders items).

**Testing React Query and Other Library Hooks**

Third-party hooks like React Query's `useQuery` or SWR's `useSWR` require special setup for their global configuration:

```javascript
import { QueryClient, QueryClientProvider } from 'react-query';

test('useUser fetches user data', async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false } // Disable retries in tests
    }
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ id: 1, name: 'John' })
  });

  const { result } = renderHook(() => useUser(1), { wrapper });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toEqual({ id: 1, name: 'John' });

  global.fetch.mockRestore();
});
```

The key is disabling retries (`retry: false`) to prevent tests from hanging when mocks fail and providing a fresh QueryClient per test to avoid state pollution.

**Advanced Pattern: Testing Hook State Machines**

Complex hooks often implement state machines. Testing all transitions requires systematic coverage:

```javascript
function useConnectionStatus() {
  const [status, setStatus] = useState('disconnected');

  const connect = () => {
    setStatus('connecting');
    setTimeout(() => setStatus('connected'), 100);
  };

  const disconnect = () => {
    setStatus('disconnecting');
    setTimeout(() => setStatus('disconnected'), 50);
  };

  return { status, connect, disconnect };
}

test('useConnectionStatus state machine', async () => {
  jest.useFakeTimers();

  const { result } = renderHook(() => useConnectionStatus());

  // Initial state
  expect(result.current.status).toBe('disconnected');

  // Transition: disconnected → connecting → connected
  act(() => {
    result.current.connect();
  });

  expect(result.current.status).toBe('connecting');

  act(() => {
    jest.advanceTimersByTime(100);
  });

  expect(result.current.status).toBe('connected');

  // Transition: connected → disconnecting → disconnected
  act(() => {
    result.current.disconnect();
  });

  expect(result.current.status).toBe('disconnecting');

  act(() => {
    jest.advanceTimersByTime(50);
  });

  expect(result.current.status).toBe('disconnected');

  jest.useRealTimers();
});
```

This pattern ensures all state transitions work correctly and timings are precise.

---

### 🐛 Real-World Scenario

**Production Bug: useDebounce Hook Causing Stale Search Results**

**Context:** An e-commerce platform implemented a custom `useDebounce` hook for search input, allowing users to type without triggering API calls on every keystroke. After deployment, users reported seeing results for previous searches instead of their current query. For example, typing "shoes" quickly then "socks" would sometimes display shoe results for the "socks" query. The bug affected ~8% of searches, particularly for fast typers on slow connections.

**Initial Symptoms and Metrics:**
- Affected searches: 8% (4,800 out of 60,000 daily searches)
- User behavior: Fast typing (>200ms between keystrokes)
- Device correlation: Higher occurrence on mobile devices (12%) vs desktop (4%)
- Search abandonment: 45% of affected users started a new search or left the page
- Revenue impact: Estimated $18k/month in lost conversions from frustrated users

**Investigation Process:**

The team initially suspected the backend API, but logs showed correct queries being sent. The issue was frontend-side. They reviewed the `useDebounce` implementation:

```javascript
// ❌ BUGGY IMPLEMENTATION
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer); // Cleanup on value change
  }, [value, delay]);

  return debouncedValue;
}

// Usage in component
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchSearchResults(debouncedSearchTerm).then(setResults);
    }
  }, [debouncedSearchTerm]);

  return <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />;
}
```

**Root Cause Analysis:**

The hook lacked proper cleanup for the fetch operation. Here's what happened:

1. User types "shoes" → debounce starts 300ms timer
2. User quickly types "socks" before timer expires → old timer cleared, new timer starts
3. User types fast enough that multiple debounce cycles happen
4. First search for "shoes" starts after 300ms
5. Second search for "socks" starts 50ms later (user stopped typing)
6. "Socks" API responds faster (cache hit, 80ms)
7. "Shoes" API responds slower (200ms)
8. "Shoes" results overwrite "socks" results because fetch wasn't cancelled

**The Critical Bug:** The `useDebounce` hook correctly debounced the value, but the consuming component's fetch effect didn't cancel previous fetches when a new search started.

**Testing the Bug:**

The team wrote tests that exposed the race condition:

```javascript
// ❌ TEST EXPOSING BUG
test('useDebounce with rapid changes should show latest results', async () => {
  jest.useFakeTimers();

  let fetchCount = 0;
  global.fetch = jest.fn(url => {
    fetchCount++;
    const query = new URL(url).searchParams.get('q');
    const delay = query === 'shoes' ? 200 : 80; // shoes slower than socks

    return new Promise(resolve =>
      setTimeout(() => {
        resolve({
          json: async () => ({ query, results: [`Result for ${query}`] })
        });
      }, delay)
    );
  });

  const { rerender } = render(<SearchBar />);
  const user = userEvent.setup({ delay: null });

  const input = screen.getByRole('textbox');

  // Type "shoes"
  await user.type(input, 'shoes');

  // Advance past debounce delay
  act(() => {
    jest.advanceTimersByTime(300);
  });

  // Type "socks" (overwrites "shoes")
  await user.clear(input);
  await user.type(input, 'socks');

  // Advance past debounce delay
  act(() => {
    jest.advanceTimersByTime(300);
  });

  // Advance past all fetch delays
  act(() => {
    jest.advanceTimersByTime(300);
  });

  await waitFor(() => {
    expect(screen.getByText(/Result for socks/i)).toBeInTheDocument();
  });

  // BUG: This fails because "shoes" results overwrite "socks"
  expect(screen.queryByText(/Result for shoes/i)).not.toBeInTheDocument();

  global.fetch.mockRestore();
  jest.useRealTimers();
});

// TEST FAILED: Found "Result for shoes" when it should show "Result for socks"
```

**Solution Implementation:**

**Fix 1: Add Request Cancellation to Fetch Effect**

```javascript
// ✅ FIXED: Cancel previous fetch when new search starts
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    fetchSearchResults(debouncedSearchTerm, { signal: controller.signal })
      .then(data => setResults(data.results))
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('Search cancelled for:', debouncedSearchTerm);
          return;
        }
        console.error('Search error:', err);
      });

    return () => {
      controller.abort(); // Cancel on new search
    };
  }, [debouncedSearchTerm]);

  return (
    <div>
      <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      <ul>
        {results.map(result => (
          <li key={result}>{result}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Fix 2: Enhanced useDebounce with Built-in Cancellation**

```javascript
// ✅ ALTERNATIVE: Debounce hook that returns cancel function
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [value, delay]);

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current);
    setDebouncedValue(value); // Immediately update to current value
  }, [value]);

  return [debouncedValue, cancel];
}

// Usage with manual cancel
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, cancelDebounce] = useDebounce(searchTerm, 300);

  useEffect(() => {
    // ... fetch with AbortController
  }, [debouncedSearchTerm]);

  const handleClearSearch = () => {
    setSearchTerm('');
    cancelDebounce(); // Immediately cancel pending debounce
  };

  return (
    <div>
      <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      <button onClick={handleClearSearch}>Clear</button>
    </div>
  );
}
```

**Fix 3: Comprehensive Test Suite**

```javascript
// ✅ TEST NOW PASSES
test('cancels previous search when new search starts', async () => {
  jest.useFakeTimers();

  let abortCount = 0;
  global.fetch = jest.fn((url, options) => {
    const query = new URL(url).searchParams.get('q');
    const delay = query === 'shoes' ? 200 : 80;

    options.signal.addEventListener('abort', () => {
      abortCount++;
    });

    return new Promise((resolve, reject) =>
      setTimeout(() => {
        if (options.signal.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
        } else {
          resolve({
            json: async () => ({ query, results: [`Result for ${query}`] })
          });
        }
      }, delay)
    );
  });

  render(<SearchBar />);
  const user = userEvent.setup({ delay: null });
  const input = screen.getByRole('textbox');

  // Type "shoes"
  await user.type(input, 'shoes');
  act(() => jest.advanceTimersByTime(300));

  // Type "socks" (should cancel "shoes" fetch)
  await user.clear(input);
  await user.type(input, 'socks');
  act(() => jest.advanceTimersByTime(300));

  // Verify first fetch was aborted
  expect(abortCount).toBe(1);

  // Advance all timers
  act(() => jest.advanceTimersByTime(300));

  await waitFor(() => {
    expect(screen.getByText(/Result for socks/i)).toBeInTheDocument();
  });

  expect(screen.queryByText(/Result for shoes/i)).not.toBeInTheDocument();

  global.fetch.mockRestore();
  jest.useRealTimers();
});

test('useDebounce updates value after delay', () => {
  jest.useFakeTimers();

  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: 'initial', delay: 300 } }
  );

  expect(result.current).toBe('initial');

  // Change value
  rerender({ value: 'updated', delay: 300 });

  // Before delay, still shows old value
  act(() => jest.advanceTimersByTime(200));
  expect(result.current).toBe('initial');

  // After delay, shows new value
  act(() => jest.advanceTimersByTime(100));
  expect(result.current).toBe('updated');

  jest.useRealTimers();
});

test('useDebounce cancels on rapid changes', () => {
  jest.useFakeTimers();

  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300),
    { initialProps: { value: 'first' } }
  );

  // Rapid changes before delay expires
  rerender({ value: 'second' });
  act(() => jest.advanceTimersByTime(100));

  rerender({ value: 'third' });
  act(() => jest.advanceTimersByTime(100));

  rerender({ value: 'fourth' });
  act(() => jest.advanceTimersByTime(100));

  // Only the last value should debounce through
  act(() => jest.advanceTimersByTime(200));

  expect(result.current).toBe('fourth');

  jest.useRealTimers();
});
```

**Results After Fixes:**

- **Affected searches:** 8% → 0.1% (80x improvement, residual issues from actual network errors)
- **Search abandonment:** 45% → 5% (9x improvement)
- **User satisfaction:** Search NPS improved from 5.8 to 7.5
- **Revenue recovery:** Estimated $16k/month regained from reduced abandonment
- **Test coverage:** Search debounce logic 0% → 95%

**Performance Metrics:**

- Additional cleanup code: ~12 lines in search component
- Test suite runtime: Increased by 1.2 seconds (3 new tests)
- Search response perception: Improved due to faster cancellation feedback

**Key Lessons:**

1. **Debouncing alone doesn't prevent race conditions** – Must also cancel in-flight requests
2. **Test hooks with timing-sensitive logic using fake timers** – Exposes race conditions
3. **Fast typers on slow connections expose async bugs** – Test with realistic delays
4. **AbortController is essential for all async operations** – Not just useEffect cleanup
5. **Hook tests should verify cleanup behavior** – Test unmount and rapid re-renders

**Interview Answer Template:**

"I debugged a race condition in a search feature where users saw stale results from previous queries. The issue was our `useDebounce` hook correctly debounced input, but the fetch effect didn't cancel previous requests when new searches started. Fast typers triggered multiple overlapping searches, and slower requests overwrote faster ones. I fixed it by adding AbortController to cancel in-flight fetches when the debounced value changed. I wrote tests using `renderHook` with fake timers to simulate rapid typing and verified abort signals were triggered correctly. This reduced affected searches by 80x and improved search completion rate from 55% to 95%, recovering ~$16k monthly revenue."

---

### ⚖️ Trade-offs

**Hook Testing Approaches: renderHook vs Component Testing vs Direct Calls**

Testing custom hooks offers three main approaches with distinct trade-offs:

**1. renderHook (Isolated Hook Testing)**

```javascript
test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter(0));

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

**Pros:**
- Isolated testing (hook logic only, no UI concerns)
- Direct access to hook return value via `result.current`
- Fast execution (no DOM rendering overhead)
- Clear test failures (pinpoints hook logic bugs)
- Easy to test edge cases and error conditions

**Cons:**
- Less realistic (hooks used in isolation, not in components)
- Requires understanding `act()` and `waitFor` for async
- Extra dependency (@testing-library/react-hooks in older versions)
- Doesn't catch issues with hook integration into components

**When to Use:**
- Utility hooks (useFetch, useLocalStorage, useDebounce)
- Complex stateful logic (state machines, calculators)
- Hooks with many edge cases requiring comprehensive coverage
- Hooks reused across many components

---

**2. Component Testing (Integration Approach)**

```javascript
function TestComponent() {
  const { count, increment } = useCounter(0);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}

test('useCounter works in component', async () => {
  render(<TestComponent />);
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: '+' }));
  expect(screen.getByTestId('count')).toHaveTextContent('1');
});
```

**Pros:**
- Realistic testing (hook used in actual component context)
- Tests hook + UI integration simultaneously
- No need to manually use `act()` (RTL handles it)
- Catches more integration bugs
- Better reflects actual usage

**Cons:**
- Slower (renders full component tree)
- Indirect access to hook state (via DOM queries)
- More boilerplate (need test component)
- Test failures less clear (bug in hook or component?)
- Harder to test hook edge cases without complex UI scenarios

**When to Use:**
- Hooks tightly coupled to UI (useFormValidation that displays errors)
- Integration tests for critical flows
- Hooks used in one specific component
- When hook behavior depends on React lifecycle events (render, commit)

---

**3. Direct Hook Calls (Anti-Pattern, but worth understanding)**

```javascript
// ❌ DOESN'T WORK: Violates Rules of Hooks
test('useCounter increments', () => {
  const { count, increment } = useCounter(0); // ERROR: Called outside component
  increment();
  expect(count).toBe(1);
});
```

**Why This Fails:**

React hooks rely on being called during component render in consistent order. Calling hooks outside components breaks React's internal hook state management, causing errors like "Hooks can only be called inside function components."

**Exception:** Some simple hooks without state can be tested directly if they're pure functions:

```javascript
// ✅ WORKS: Pure function, not a real hook
function useFullName(firstName, lastName) {
  return `${firstName} ${lastName}`;
}

test('useFullName combines names', () => {
  expect(useFullName('John', 'Doe')).toBe('John Doe');
});
```

But this isn't testing a "hook" – it's testing a utility function. True hooks with state/effects require renderHook or component testing.

---

**Decision Matrix:**

| Factor | renderHook | Component Testing | Use Case |
|--------|-----------|-------------------|----------|
| **Isolation** | High | Low | renderHook: Unit tests, Component: Integration |
| **Speed** | Fast (10-20ms) | Moderate (50-100ms) | renderHook: Large test suites |
| **Realism** | Low | High | Component: Critical user flows |
| **Boilerplate** | Low | Medium | renderHook: Quick tests |
| **Clarity** | High (direct access) | Medium (DOM queries) | renderHook: Debugging hook logic |
| **Integration Bugs** | Misses | Catches | Component: Full feature coverage |

**Recommended Strategy:**

- **Use renderHook for:** Utility hooks, complex logic, edge cases (70% of hook tests)
- **Use component testing for:** UI-coupled hooks, integration tests (30% of hook tests)

**Real Example:**

A SaaS app had 200 hook tests:
- 140 renderHook tests (70%): useFetch, useDebounce, useLocalStorage, useAuth
- 60 component tests (30%): useFormValidation (displays errors), useInfiniteScroll (renders items)

This balance provided fast CI runs (3 minutes) with high confidence in both hook logic and integration.

---

**Wrapper Complexity: Inline vs Custom renderHook**

**Inline Wrapper (Simple)**

```javascript
test('useAuth returns user', () => {
  const wrapper = ({ children }) => (
    <AuthProvider user={{ name: 'John' }}>
      {children}
    </AuthProvider>
  );

  const { result } = renderHook(() => useAuth(), { wrapper });
  expect(result.current.user.name).toBe('John');
});
```

**Pros:**
- Clear what providers are active in each test
- Easy to customize per-test (different user, theme, etc.)
- No hidden dependencies

**Cons:**
- Repetitive across many tests
- Easy to forget a required provider
- Verbose when multiple providers needed

---

**Custom renderHook (DRY)**

```javascript
// test-utils.js
export function renderHookWithProviders(hook, {
  user = null,
  theme = 'light',
  locale = 'en',
  ...options
} = {}) {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider user={user}>
        <ThemeProvider theme={theme}>
          <I18nProvider locale={locale}>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

  return renderHook(hook, { wrapper, ...options });
}

// test file
test('useAuth returns user', () => {
  const { result } = renderHookWithProviders(() => useAuth(), {
    user: { name: 'John' }
  });

  expect(result.current.user.name).toBe('John');
});
```

**Pros:**
- DRY (no repetitive wrapper code)
- Consistent provider setup across tests
- Easy to add global providers once
- Customizable via options parameter

**Cons:**
- Hidden dependencies (not obvious what providers are active)
- Can make tests harder to understand
- Overhead of maintaining test utilities

**Decision Guide:**

- **Use inline wrappers when:** Testing a hook that needs 1-2 specific providers
- **Use custom renderHook when:** Testing many hooks that all need the same 3+ providers

**Real Example:**

A team migrated from inline wrappers to custom renderHook and reduced hook test code by 40% (from 3,500 lines to 2,100 lines) while improving consistency.

---

**Async Testing: waitFor vs Manual Polling**

**waitFor (Built-in Retry)**

```javascript
test('useFetch loads data', async () => {
  const { result } = renderHook(() => useFetch('/api/users'));

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data).toBeDefined();
});
```

**Pros:**
- Automatic retry (polls until assertion passes or timeout)
- Clear test intent
- Built-in error messages
- Works with RTL ecosystem

**Cons:**
- Fixed polling interval (50ms by default)
- Can be slow if hook updates infrequently
- Polling overhead accumulates in large suites

---

**Manual Polling (Custom Control)**

```javascript
test('useFetch loads data', async () => {
  const { result } = renderHook(() => useFetch('/api/users'));

  while (result.current.loading) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  expect(result.current.data).toBeDefined();
});
```

**Pros:**
- Full control over polling logic
- Can optimize for specific hook behavior
- Potentially faster with custom intervals

**Cons:**
- Easy to create infinite loops
- Manual error handling
- Verbose, error-prone

**When to Use:**

- **waitFor:** Default choice (95% of cases)
- **Manual polling:** Complex timing requirements, optimization for specific patterns

---

**State Updates: act() Everywhere vs RTL's Auto-Wrapping**

Modern RTL automatically wraps many operations in `act()`, but manual wrapping is sometimes necessary.

**When RTL Auto-Wraps:**

```javascript
test('no manual act needed', async () => {
  render(<Component />);
  const user = userEvent.setup();

  // Auto-wrapped by userEvent
  await user.click(button);

  // Auto-wrapped by findBy
  expect(await screen.findByText('Success')).toBeInTheDocument();
});
```

**When Manual act() is Needed:**

```javascript
test('manual act required', () => {
  const { result } = renderHook(() => useCounter(0));

  // ❌ NOT auto-wrapped: direct function call
  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

**Rule of Thumb:**

- **userEvent interactions:** Auto-wrapped, no manual act()
- **async queries (findBy, waitFor):** Auto-wrapped
- **Direct hook function calls:** Require manual act()
- **Timers, custom async logic:** Require manual act()

---

**Fake vs Real Timers for Hook Testing**

**Real Timers (Simple)**

```javascript
test('useInterval calls callback', async () => {
  const callback = jest.fn();
  renderHook(() => useInterval(callback, 100));

  await new Promise(resolve => setTimeout(resolve, 250));

  expect(callback).toHaveBeenCalledTimes(2);
});
```

**Pros:** Simple, tests actual timing
**Cons:** Slow (waits 250ms), can be flaky

**Fake Timers (Fast)**

```javascript
test('useInterval calls callback', () => {
  jest.useFakeTimers();
  const callback = jest.fn();

  renderHook(() => useInterval(callback, 100));

  jest.advanceTimersByTime(250);

  expect(callback).toHaveBeenCalledTimes(2);

  jest.useRealTimers();
});
```

**Pros:** Instant (no waiting), precise control
**Cons:** Doesn't test actual timing, requires manual timer management

**Decision:** Use fake timers for hooks with predictable timing (debounce, throttle, intervals). Use real timers for hooks where timing precision matters less than simplicity.

---

### 💬 Explain to Junior

**What Are Custom Hooks and Why Test Them Separately?**

Imagine you have a Swiss Army knife with multiple tools: scissors, screwdriver, can opener. Would you test the knife by:

A) Using it to open cans, unscrew screws, and cut paper (testing the whole tool in real scenarios)

B) Testing each tool individually to make sure the scissors cut, the screwdriver turns, etc.

Custom hooks are like those individual tools. They're reusable pieces of logic (like fetching data, managing form state, or debouncing input) that you use in many components. Testing them separately makes sense for the same reason you'd test each tool on the Swiss Army knife: if the scissors are broken, you want to know it's the scissors, not the can opener.

---

**The Two Ways to Test Hooks**

**Method 1: renderHook (Testing the Hook Alone)**

```javascript
test('useCounter increments correctly', () => {
  const { result } = renderHook(() => useCounter(0));

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

**Analogy:** This is like testing the scissors from the Swiss Army knife by themselves. You pull them out, test if they cut paper, and verify they work. You're NOT testing how well they fit in the knife handle or whether they work alongside the screwdriver – just whether the scissors cut.

**When to use:** When you have a utility hook used in many places (useFetch, useDebounce, useLocalStorage). If the hook breaks, you want to know immediately without having to test 20 different components.

---

**Method 2: Component Testing (Testing the Hook in a Real Component)**

```javascript
function TestComponent() {
  const { count, increment } = useCounter(0);
  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}

test('useCounter works in a real component', async () => {
  render(<TestComponent />);
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: '+' }));
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

**Analogy:** This is like testing the scissors while they're still attached to the Swiss Army knife. You're verifying they work in the context of the whole tool, checking that you can pull them out, use them, and fold them back without issues.

**When to use:** When your hook is tightly coupled to a specific component (like a form validation hook that displays error messages). You care more about the hook + UI working together than the hook in isolation.

---

**The Magic of renderHook: How Does It Work?**

Remember how React hooks can only be called inside components? `renderHook` is a clever trick: it creates an invisible component just to call your hook!

```javascript
// What renderHook does behind the scenes
function InvisibleTestComponent() {
  const hookResult = useCounter(0); // Your hook gets called here!
  // Store result somewhere accessible
  return null; // No UI needed
}
```

It's like creating a fake stage (the invisible component) just so your actor (the hook) has a place to perform. The audience (your test) watches the performance through `result.current`.

---

**The act() Function: Why Do We Need It?**

When you call `result.current.increment()` in a test, you're triggering a state update. React needs time to process this update and re-render. The `act()` function says: "Hey React, I'm about to do something that causes updates. Wait until all those updates finish before moving on."

**Analogy:** Imagine you're baking cookies:

**Without act():**
```javascript
putCookiesInOven();
expect(cookies).toBeBaked(); // FAILS: Cookies still raw!
```

**With act():**
```javascript
act(() => {
  putCookiesInOven();
  waitForCookiesToBake(); // Wait for all the baking to finish
});
expect(cookies).toBeBaked(); // PASSES: Cookies are done!
```

`act()` ensures React finishes all its "cooking" (state updates, re-renders, effects) before you check the results.

---

**Testing Async Hooks: The waitFor Pattern**

Some hooks fetch data from an API. They start with `loading: true`, fetch data, then set `loading: false`. How do you test this?

```javascript
test('useFetch loads user data', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ name: 'John' })
  });

  const { result } = renderHook(() => useFetch('/api/users/1'));

  // Right now: loading is true, data is null
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toBe(null);

  // Wait for loading to finish
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  // Now: loading is false, data is loaded!
  expect(result.current.data).toEqual({ name: 'John' });

  global.fetch.mockRestore();
});
```

**Analogy:** This is like ordering food delivery:

1. You place the order (hook starts fetching)
2. Initially, status is "Preparing" (loading: true, data: null)
3. You wait patiently (waitFor)
4. Eventually, status changes to "Delivered" (loading: false, data: {...})
5. You verify your food arrived correctly (assertion on data)

`waitFor` is your "patiently waiting" step. It keeps checking every 50ms: "Is my food here yet? No? I'll wait... how about now? Yes!" Once it arrives, the test continues.

---

**Testing Hooks That Use Context: The Wrapper Pattern**

Some hooks need context to work (like `useAuth` that gets user data from `AuthContext`). You can't just call `useAuth()` without providing the context!

```javascript
test('useAuth returns user from context', () => {
  const mockUser = { id: 1, name: 'John' };

  // Create a wrapper that provides the context
  const wrapper = ({ children }) => (
    <AuthContext.Provider value={{ user: mockUser }}>
      {children}
    </AuthContext.Provider>
  );

  const { result } = renderHook(() => useAuth(), { wrapper });

  expect(result.current.user).toEqual(mockUser);
});
```

**Analogy:** Imagine testing a fish's swimming ability:

**Without wrapper (no water):**
```javascript
const fish = getFish();
fish.swim(); // ERROR: Fish can't swim without water!
```

**With wrapper (provides water):**
```javascript
const wrapper = ({ children }) => <WaterTank>{children}</WaterTank>;
const { result } = renderHook(() => getFish(), { wrapper });
result.current.swim(); // SUCCESS: Fish swims in water!
```

The wrapper provides the "environment" (context) the hook needs to function.

---

**Testing Cleanup: Making Sure Hooks Clean Up After Themselves**

Good hooks clean up their side effects when components unmount. For example, a hook that adds an event listener should remove it when done:

```javascript
function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup!
    };
  }, []);

  return size;
}

test('useWindowSize cleans up listener on unmount', () => {
  const removeListener = jest.spyOn(window, 'removeEventListener');

  const { unmount } = renderHook(() => useWindowSize());

  unmount(); // Simulate component being removed

  expect(removeListener).toHaveBeenCalled(); // Verify cleanup happened!

  removeListener.mockRestore();
});
```

**Analogy:** This is like testing that someone turns off the lights when they leave a room.

**Bad behavior (no cleanup):**
```javascript
enterRoom();
turnOnLights();
leaveRoom(); // Lights still on! 💡 (memory leak)
```

**Good behavior (with cleanup):**
```javascript
enterRoom();
turnOnLights();
leaveRoom();
turnOffLights(); // ✅ Lights off (no memory leak)
```

The test verifies that `unmount()` (leaving the room) triggers cleanup (turning off lights).

---

**Fake Timers: Time Travel for Hook Tests**

Some hooks use timers (setTimeout, setInterval). Testing them with real timers means actually waiting:

```javascript
// ❌ SLOW: Actually waits 5 seconds
test('useDebounce waits 5 seconds', async () => {
  const { result } = renderHook(() => useDebounce('test', 5000));

  await new Promise(resolve => setTimeout(resolve, 5000));

  expect(result.current).toBe('test');
});
```

This test takes 5 seconds! With fake timers, you can instantly fast-forward time:

```javascript
// ✅ FAST: Runs in milliseconds
test('useDebounce waits 5 seconds', () => {
  jest.useFakeTimers();

  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: 'test', delay: 5000 } }
  );

  // Initially, debounced value is still empty/old
  expect(result.current).toBe('');

  // Fast-forward time by 5 seconds INSTANTLY
  act(() => {
    jest.advanceTimersByTime(5000);
  });

  // Now debounced value updated!
  expect(result.current).toBe('test');

  jest.useRealTimers();
});
```

**Analogy:** Real timers are like watching a 5-second video at normal speed. Fake timers are like having a remote control that lets you skip forward instantly. The video "thinks" 5 seconds passed, but you only waited a few milliseconds.

---

**Interview Answer Template**

**Question:** "How do you test custom React hooks?"

**Strong Answer:**

"I use `renderHook` from React Testing Library to test custom hooks in isolation. This utility creates an invisible test component that calls the hook during render and provides access to the hook's return value via `result.current`. For example, when testing `useCounter`, I call `renderHook(() => useCounter(0))`, then use `act()` to wrap state updates like `act(() => result.current.increment())`, and finally assert the new count with `expect(result.current.count).toBe(1)`.

For async hooks like `useFetch`, I use `waitFor` to poll for state changes. I first verify the initial loading state, then wait for loading to complete with `await waitFor(() => expect(result.current.loading).toBe(false))`, and finally assert the loaded data. I mock API calls with `global.fetch = jest.fn()` to control responses and test error scenarios.

For hooks that use context like `useAuth`, I provide a wrapper with the necessary providers: `const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>`, then pass it to renderHook: `renderHook(() => useAuth(), { wrapper })`.

I test cleanup by calling `unmount()` and verifying side effects are cleaned up, like event listeners being removed. For hooks with timers, I use `jest.useFakeTimers()` to control time and test debouncing or throttling logic without actual delays.

Alternatively, for hooks tightly coupled to UI, I test them through components using regular component tests. This provides more realistic integration testing at the cost of less isolation. In production, I've maintained suites with 200+ hook tests that run in under 3 minutes, with 70% using renderHook for utility hooks and 30% using component tests for UI-coupled hooks."

**Why This Answer Lands:**

1. **Specific tool:** Mentions renderHook, act(), waitFor clearly
2. **Async pattern:** Describes waiting for loading states properly
3. **Context handling:** Shows understanding of wrapper pattern
4. **Cleanup testing:** Mentions unmount and side effect verification
5. **Fake timers:** Demonstrates advanced timing control
6. **Trade-offs:** Acknowledges when component testing is better
7. **Production experience:** Provides metrics (200+ tests, 3 min runtime, 70/30 split)

---

**[← Back to React README](./README.md)**
