# Testing Master Flashcards

> **50 essential testing concepts for frontend interviews**

**Time to review:** 25 minutes
**Best for:** Testing-focused roles, quality engineers

---

## Card 1: Testing Pyramid
**Q:** What is the testing pyramid?

**A:** More unit tests (fast, isolated), fewer integration tests (interactions), fewest E2E tests (slow, expensive). Balance: 70% unit, 20% integration, 10% E2E.

**Difficulty:** 🟢 Easy
**Tags:** #testing #strategy #pyramid
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** At Google/Meta, saying "70-20-10" is expected. Follow-up: "Why not 50-50?" Answer: unit tests run 100x faster, giving feedback loop advantage. Red flag: arguing for equal distribution. Ask how they optimize E2E suites—parallel execution matters.

---

## Card 2: Unit vs Integration
**Q:** Difference between unit and integration tests?

**A:** Unit: single function/component in isolation, mocked dependencies. Integration: multiple units working together, some real dependencies. Integration catches interface bugs.

**Difficulty:** 🟢 Easy
**Tags:** #testing #unit #integration
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Real example: unit test mocks API, integration uses MSW (production-like). Tests failed because API returned different field names. Red flag: over-mocking internal modules (utils, helpers). Common follow-up: "What's the cost?" Answer: unit tests run <50ms, integration 1-3s. Balance is key.

---

## Card 3: TDD Process
**Q:** What is Test-Driven Development?

**A:** Red-Green-Refactor cycle. Write failing test first, implement minimum code to pass, refactor. Benefits: better design, confidence, documentation.

**Difficulty:** 🟡 Medium
**Tags:** #testing #tdd #methodology
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Production metric: TDD teams reduced bug escapes by 40-50% (Microsoft research). Red flag: skipping refactor phase—debt accumulates. Common objection: "TDD slows us down." Reality: 15-20% slower initially, 2x faster long-term. Pair with code review for design discussions.

---

## Card 4: Jest vs Vitest
**Q:** When to choose Vitest over Jest?

**A:** Vitest: faster, Vite-native, ESM support, compatibility API. Jest: larger ecosystem, more resources, battle-tested. Vitest for new Vite projects.

**Difficulty:** 🟡 Medium
**Tags:** #testing #jest #vitest
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Benchmark: Vitest runs 5-10x faster due to native ESM, no transpilation overhead. Red flag: picking Vitest for legacy Webpack apps (incompatibility pain). Production insight: Jest at Meta (Facebook) because stability > speed. Follow-up: "Have you profiled tests?" shows thinking depth.

---

## Card 5: React Testing Library
**Q:** RTL principles?

**A:** Test behavior not implementation, query by accessibility, avoid testing internals, no shallow rendering, user-centric queries.

**Difficulty:** 🟡 Medium
**Tags:** #testing #rtl #react
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Real win: switching to RTL reduced test refactors by 60% (fewer implementation-tied tests). Red flag: using testId first—accessibility queries should be priority. Common pitfall: testing useState directly instead of UI output. Ask: "What would a blind user see?" guides test selection perfectly.

---

## Card 6: Mocking Best Practices
**Q:** When to mock dependencies?

**A:** Mock: external APIs, slow operations, non-deterministic behavior. Don't mock: internal modules (use real), simple utilities. Over-mocking couples tests to implementation.

**Difficulty:** 🟡 Medium
**Tags:** #testing #mocking #best-practices
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Production lesson: team mocked Array.map—tests passed, production failed when behavior changed. Red flag: jest.mock at file top (brittle). Best practice: mock only at test level (MSW for APIs). Metric: test-to-production mismatch drops 80% with realistic mocking. Follow-up: "How do you ensure mocks match reality?"

---

## Card 7: Test Coverage
**Q:** Is 100% code coverage good?

**A:** Not always. High coverage ≠ good tests. Focus on critical paths, edge cases, user scenarios. Diminishing returns after 80%. Coverage shows untested code, not test quality.

**Difficulty:** 🟡 Medium
**Tags:** #testing #coverage #metrics
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Airbnb insight: 100% coverage still had production bugs (bad assertions). Better metric: mutation score (Stryker). Target: 80% coverage, 70%+ mutation. Red flag: "We have 100% coverage" without quality context. Real question: "What critical paths aren't tested?" Branch coverage matters more than line coverage for decision logic.

---

## Card 8: Async Testing
**Q:** How to test async code?

**A:** async/await in tests, waitFor, findBy queries, act warnings, fake timers, Promise resolution. Avoid arbitrary waits. Test loading and success states.

**Difficulty:** 🟡 Medium
**Tags:** #testing #async #promises
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Common pitfall: setTimeout(resolve, 500)—brittle and slow. Better: waitFor(()=>expect(el).toBeVisible()). Red flag: hardcoded delays indicate fragile tests. Real scenario: API timeout changed 100ms, all tests failed. Best: use act() to batch updates, fake timers for delays. Metric: proper async tests catch race conditions.

---

## Card 9: Snapshot Testing
**Q:** When are snapshots useful?

**A:** Stable UI, error messages, configuration objects. Avoid for: dynamic data, large components, frequently changing UI. Review changes carefully.

**Difficulty:** 🟢 Easy
**Tags:** #testing #snapshots #jest
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Red flag: snapshot for dynamic content (dates, IDs). Airbnb policy: manual review required for every snapshot update (prevents accidental changes). Better: assert specific properties (expect(tree.props.name)). Real issue: team ran `jest -u` without reviewing—bug slipped to prod. Use snapshots for error messages, configs only.

---

## Card 10: E2E Test Tools
**Q:** Playwright vs Cypress?

**A:** Playwright: multi-browser, faster, parallel, browser contexts. Cypress: better DX, time-travel debugging, network stubbing. Both excellent for E2E.

**Difficulty:** 🟡 Medium
**Tags:** #testing #e2e #tools
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Production choice: Microsoft uses Playwright (needed Safari testing), startup uses Cypress (better debugging). Metric: Playwright runs 20x tests in parallel, Cypress 1x. Red flag: picking tool for "coolness" not needs. Follow-up: "How many tests are E2E?" reveals pyramid understanding. Real scenario: Cypress struggles with multi-tab apps.

---

## Card 11: Testing Hooks
**Q:** How to test custom React hooks?

**A:** renderHook from @testing-library/react, test behavior not implementation, test with component usage, test cleanup, test dependencies.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #hooks
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Common error: testing hook directly without component context. Better: test how component uses hook (integration style). Real issue: useCallback dependency array forgot param—tests didn't catch it. Best: renderHook with act() for updates. Red flag: mocking hooks (use actual hooks in tests). Metric: renderHook tests are faster than component tests.

---

## Card 12: Flaky Tests
**Q:** Causes and fixes for flaky tests?

**A:** Causes: race conditions, hardcoded waits, shared state, non-deterministic data. Fix: proper async handling, isolated tests, deterministic data, retry strategies.

**Difficulty:** 🟡 Medium
**Tags:** #testing #flaky #debugging
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Google metric: 1 flaky test breaks confidence in entire suite. Real example: test passes locally 100x, CI fails 1/10 times (environment-dependent). Red flag: tests work on dev machine but not CI. Solution: testid isolation, fake time, deterministic IDs. Production impact: flaky E2E tests skipped by teams (loses value). Run tests 10x to verify stability.

---

## Card 13: Test Doubles
**Q:** Types of test doubles?

**A:** Dummy (unused), Stub (predefined responses), Spy (records calls), Mock (expectations), Fake (working implementation). Use simplest that works.

**Difficulty:** 🟡 Medium
**Tags:** #testing #mocks #doubles
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Martin Fowler taxonomy is standard in interviews. Red flag: confusing mock and stub (different purposes). Real scenario: use Fake for database in tests (in-memory DB), Stub for API. Production insight: too many mocks = brittle tests. Follow-up: "Which double would you use for logging?" reveals understanding.

---

## Card 14: AAA Pattern
**Q:** What is Arrange-Act-Assert?

**A:** Test structure: Arrange (setup), Act (execute), Assert (verify). Clear test organization, one concept per test, descriptive names.

**Difficulty:** 🟢 Easy
**Tags:** #testing #patterns #structure
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Industry standard at Google, Meta, Amazon. Red flag: multiple asserts (not always bad, but one concept per test is cleaner). Real pattern: Arrange 40%, Act 10%, Assert 50% of test code. Follow-up: "What if setup is complex?" Answer: extract to helper or separate file. Metric: tests should be readable as documentation.

---

## Card 15: Integration Test Scope
**Q:** What to test in integration tests?

**A:** Component interactions, data flow, API integration, routing, state management. Real dependencies where possible. Test user workflows.

**Difficulty:** 🟡 Medium
**Tags:** #testing #integration #scope
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real example: unit tests passed, integration test caught missing field in API response. Integration should use real-ish dependencies (MSW for API, real DB for tests). Red flag: "integration test" that mocks everything (just unit test renamed). Metric: 2-3 integration tests catch 40% more bugs than units alone.

---

## Card 16: Test Isolation
**Q:** Why is test isolation important?

**A:** Independent test execution, no shared state, parallel execution, reliable results. Use beforeEach for setup, afterEach for cleanup.

**Difficulty:** 🟢 Easy
**Tags:** #testing #isolation #best-practices
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Production issue: test order matters (shared state in global var). Cost: can't parallelize, unreliable results. Solution: beforeEach setup, afterEach teardown. Red flag: tests passing alone but failing in suite. Metric: proper isolation enables 10x test parallelization. Real example: shared mock state caused test failure only in CI with random order.

---

## Card 17: Visual Regression
**Q:** What is visual regression testing?

**A:** Screenshot comparison to detect UI changes. Tools: Percy, Chromatic, BackstopJS. Useful for: style changes, responsive design, cross-browser.

**Difficulty:** 🟡 Medium
**Tags:** #testing #visual #regression
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real scenario: CSS padding changed, unit tests missed it. Visual tests catch unintended UI changes. Red flag: false positives (timestamps in screenshots). Best: review threshold (pixel differences), ignore dynamic content. Production metric: catches 60% of bugs unit/integration miss. Cost: slow (runs in browser), requires manual approval.

---

## Card 18: Contract Testing
**Q:** What is API contract testing?

**A:** Verify API provider/consumer agreement. Tools: Pact, MSW. Prevents breaking changes, faster than E2E, tests API integration.

**Difficulty:** 🔴 Hard
**Tags:** #testing #contract #api
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real issue: frontend tests passed, backend changed API response format—production broke. Contract testing prevents this. Pact creates contracts both sides agree to. Red flag: no API testing at all (only mocked). Metric: contract tests are 100x faster than E2E, catch 80% of integration bugs. Advanced: Pact broker for CI/CD coordination.

---

## Card 19: Test Queries
**Q:** RTL query priority?

**A:** 1) getByRole (accessible), 2) getByLabelText, 3) getByPlaceholderText, 4) getByText, 5) getByDisplayValue, 6) getByAltText. Avoid testId.

**Difficulty:** 🟡 Medium
**Tags:** #testing #rtl #queries
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** getByRole is gold standard (mirrors accessibility). Red flag: testId as first choice (couples to implementation). Real scenario: button aria-label changed, testId tests passed but user-facing text changed. Metric: getByRole queries also verify ARIA—tests accessibility automatically. Follow-up: "Why not testId?" Shows understanding of testing philosophy.

---

## Card 20: Testing Context
**Q:** How to test components using Context?

**A:** Wrap with provider in tests, test provider value changes, test default values, use custom render with providers wrapper.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #context
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real example: custom render function with ThemeProvider wrapper—all tests inherit context. Red flag: testing context consumption directly (test component using context instead). Best: extract render helper to reduce boilerplate. Metric: 15-20 lines of setup boilerplate eliminated per test. Follow-up: "How do you handle default values?" shows thorough testing.

---

## Card 21: Error Boundaries Testing
**Q:** How to test Error Boundaries?

**A:** Suppress console.error, throw error in child, assert error UI, test error logging, test recovery, spy on error handler.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #error-boundaries
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real issue: console.error noise in test output. Solution: jest.spyOn(console, 'error').mockImplementation(). Red flag: not testing fallback UI. Best: verify error message displayed, recovery button works. Production metric: error boundaries prevent 100% app crashes (only isolated component crashes). Edge case: async errors won't trigger error boundary.

---

## Card 22: Accessibility Testing
**Q:** How to test accessibility?

**A:** jest-axe, manual testing, screen readers, keyboard navigation, ARIA attributes, color contrast, semantic HTML validation.

**Difficulty:** 🟡 Medium
**Tags:** #testing #accessibility #a11y
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** jest-axe catches 30-40% of a11y issues automatically. Red flag: no keyboard navigation testing (Tab, Enter, Escape). Real scenario: tab focus trap forgotten—keyboard users stuck. Best practice: test with screen reader (NVDA free). Production metric: accessible apps have lower bounce rates. Legal note: WCAG compliance increasingly required (ADA lawsuits rising).

---

## Card 23: Performance Testing
**Q:** How to test performance?

**A:** React Profiler, Chrome DevTools, Lighthouse CI, bundle size analysis, render count tracking, Web Vitals. Set performance budgets.

**Difficulty:** 🟡 Medium
**Tags:** #testing #performance #metrics
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real metric: one unnecessary render = 5-10ms added. 100 components * unnecessary render = 0.5-1s user delay. Bundle size budgets prevent bloat (Webpack analyzer). Red flag: no performance monitoring in CI. Best: Lighthouse CI enforces performance budget. Production insight: 100ms improvement = 1% conversion lift (Shopify research).

---

## Card 24: Test Data Builders
**Q:** What are test data builders?

**A:** Factory functions creating test data. Readable, reusable, default values. Example: createUser({name: 'Test'}). Reduces test boilerplate.

**Difficulty:** 🟡 Medium
**Tags:** #testing #patterns #data
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real benefit: tests become documentation (readable intent). Example: createUser({role: 'admin'}) vs const user = {id:1, name:'x', role:'admin',...}. Red flag: duplicated test data across files. Metric: 30-50% reduction in test setup code. Production insight: easier to add fields to user object (update factory once).

---

## Card 25: Mutation Testing
**Q:** What is mutation testing?

**A:** Changes code to verify tests catch bugs. Tools: Stryker. Measures test quality. High mutation score = effective tests.

**Difficulty:** 🔴 Hard
**Tags:** #testing #mutation #quality
**Frequency:** ⭐⭐

**💡 Interview Tip:** Real example: code changes `>` to `<`, if test still passes, test is weak. Stryker catches bad tests (100% coverage but bad assertions). Metric: 70%+ mutation score = high-quality tests. Advanced: integrate Stryker into CI (but slow—30+ mins). Google uses mutation testing for critical systems. Red flag: teams skip it (assumes coverage = quality).

---

## Card 26: Testing Forms
**Q:** Best practices for testing forms?

**A:** Test validation, submission, error messages, loading states, success feedback. Use userEvent for realistic interactions. Test accessibility.

**Difficulty:** 🟡 Medium
**Tags:** #testing #forms #validation
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Real scenario: email validation client-side passed, but server rejected valid emails. Test both. Red flag: not testing loading state (UX hangs). Best: test form with aria-label (label text, for accessibility). Metric: form errors are top abandonment cause—100% test coverage critical. Use userEvent.type() for realistic typing behavior, not fireEvent.

---

## Card 27: Router Testing
**Q:** How to test React Router?

**A:** MemoryRouter for tests, test navigation, route params, redirects, protected routes, 404 pages. Test location changes.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react-router #navigation
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real issue: protected route accessible without auth token—unit test didn't catch. Must test navigation flow. Red flag: not testing route params (incorrect data rendered). Best: use MemoryRouter for isolation, test redirect behavior. Production metric: routing bugs = 404 errors, lost users. Follow-up: "How test lazy-loaded routes?" shows completeness thinking.

---

## Card 28: API Mocking
**Q:** Tools for mocking APIs?

**A:** MSW (service worker), nock (Node), fetch-mock. MSW best for realistic mocking, works in browser and Node, reusable handlers.

**Difficulty:** 🟡 Medium
**Tags:** #testing #api #mocking
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** MSW is industry standard (used by major projects). Red flag: stubbing fetch in multiple tests (fragile, not reusable). Best: centralized MSW handlers in __mocks__ folder. Real benefit: same handlers work in tests and browser storybook. Metric: 50% faster E2E without real API calls. Production insight: MSW can replay real API errors in tests.

---

## Card 29: Smoke Tests
**Q:** What are smoke tests?

**A:** Quick tests checking critical functionality. Run before deployment. Faster than full suite. Detect major issues early.

**Difficulty:** 🟢 Easy
**Tags:** #testing #smoke #deployment
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real metric: smoke tests catch 80% of critical bugs in <1 minute. Example: can user login? Can user checkout? App doesn't crash? Red flag: no smoke tests (slow feedback loop). Production workflow: smoke tests run first in CI, full suite runs in parallel. Cost-benefit: 30 sec to save hours of debugging. Deployment safety net.

---

## Card 30: Test Maintenance
**Q:** How to maintain test suite?

**A:** Remove obsolete tests, refactor duplicates, update with features, fix flaky tests, review coverage, parallelize slow tests.

**Difficulty:** 🟡 Medium
**Tags:** #testing #maintenance #best-practices
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real issue: 20% of tests are duplicates/obsolete (dead weight). Red flag: tests slower than code changes (debt accumulates). Best: quarterly test audit (review coverage, remove dead tests). Metric: 30% of testing time = maintenance. Parallel execution reduces full suite from 1h to 10min. Production rule: never delete test without understanding why.

---

## Card 31: Given-When-Then
**Q:** What is Given-When-Then?

**A:** BDD test structure: Given (context), When (action), Then (outcome). Similar to AAA but focuses on behavior. Use for E2E/integration.

**Difficulty:** 🟢 Easy
**Tags:** #testing #bdd #structure
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** BDD bridges gap between business and tech. Red flag: technical jargon in Given-When-Then (not readable by PMs). Real example: "Given user is on checkout page, When user clicks Pay button, Then payment processed." Perfect readability. Tools: Cucumber, Gherkin. Production insight: business stakeholders can write tests.

---

## Card 32: Testing Redux
**Q:** How to test Redux?

**A:** Test reducers (pure functions), action creators, selectors, thunks with mocked dispatch, connected components with Provider.

**Difficulty:** 🟡 Medium
**Tags:** #testing #redux #state-management
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real lesson: pure reducer testing is simple (no mocks needed). Red flag: not testing selectors (data transformation bugs). Best practice: test initial state, each action type. Metric: 100% reducer coverage common (pure functions). Production insight: Redux Toolkit simplifies testing (less boilerplate). Follow-up: "How test selectors?" shows thoroughness.

---

## Card 33: Parameterized Tests
**Q:** What are parameterized tests?

**A:** Run same test with different inputs. test.each in Jest. Reduces duplication, tests edge cases, clearer intent.

**Difficulty:** 🟢 Easy
**Tags:** #testing #jest #patterns
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real example: test('+' operator) should test +5, -3, 0, 1000. test.each covers all with one test. Red flag: duplicated tests (copy-paste danger). Metric: 50%+ test reduction with parameterization. Production insight: edge cases naturally tested (all inputs documented). Readability improved (test intent clear from data table).

---

## Card 34: Testing Async Effects
**Q:** How to test useEffect with async?

**A:** Wait for updates with waitFor, test loading/success/error states, mock async functions, use fake timers, cleanup subscriptions.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #async
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real issue: test completes before useEffect runs (race condition). Solution: waitFor(() => expect(element).toBeInTheDocument()). Red flag: hardcoded setTimeout delays (flaky). Best: test all states (loading, success, error). Metric: most bugs in async code. Production lesson: cleanup functions critical (prevent memory leaks in tests).

---

## Card 35: CI/CD Integration
**Q:** Testing in CI/CD pipelines?

**A:** Run on every commit, parallel execution, fail fast, cache dependencies, different test stages, generate reports, notify failures.

**Difficulty:** 🟡 Medium
**Tags:** #testing #ci-cd #automation
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Real metric: GitHub Actions 5-10min total (unit 1min, int 2min, E2E 5min parallel). Red flag: no test stage (broken code deployed). Best practice: fail fast (unit→int→E2E), cache node_modules. Production workflow: tests block PR merge (protection). Advanced: split by risk (smoke tests first). Cost: ~$0.50/month with GitHub Actions.

---

## Card 36: Screen vs Query
**Q:** Difference between screen and query?

**A:** screen has all queries (screen.getByRole), no container needed. query methods return null if not found. get throws error.

**Difficulty:** 🟢 Easy
**Tags:** #testing #rtl #api
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** screen is modern best practice (preferred over destructured queries). Red flag: using container from render (couples to DOM). Real difference: screen = whole document, queryByRole = from render result. Metric: screen usage = cleaner tests (no need destructuring). Follow-up: "queryBy vs getBy?" Answer: query returns null, get throws error.

---

## Card 37: User Event vs FireEvent
**Q:** When to use userEvent over fireEvent?

**A:** userEvent simulates real user interactions (click, type), triggers all associated events. fireEvent is low-level. Prefer userEvent.

**Difficulty:** 🟡 Medium
**Tags:** #testing #rtl #interactions
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Real difference: fireEvent.click() = DOM event only, userEvent.click() = real click (focus, blur, events). Red flag: fireEvent usage (unrealistic testing). Production scenario: onChange event missed with fireEvent. Best: always userEvent. Metric: tests with userEvent catch 30% more bugs. RTL testing library recommends userEvent for all user interactions.

---

## Card 38: Test Organization
**Q:** How to organize test files?

**A:** Co-locate with source (component.test.js), separate test folder for integration, shared utils in __tests__/utils, descriptive test names.

**Difficulty:** 🟢 Easy
**Tags:** #testing #organization #structure
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Co-location is modern best (component + test same folder). Red flag: separate tests/ folder (hard to find tests). Real benefit: component rename = test rename automatically. Best practice: Button.tsx, Button.test.tsx. Shared utils in __tests__/utils/ (accessible everywhere). Metric: easier onboarding (test near code). Production structure follows convention.

---

## Card 39: Spy Functions
**Q:** When to use jest.fn()?

**A:** Track function calls, verify arguments, mock implementations, count invocations. Use for callbacks, event handlers, dependency injection.

**Difficulty:** 🟡 Medium
**Tags:** #testing #jest #mocking
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** jest.fn() = spy + mock combined. Real usage: verify callback called with right args. Example: onClick handler. Red flag: jest.fn() without assertions (track calls but verify). Metric: callbacks tested thoroughly prevent bugs. Production pattern: dependency injection with jest.fn() = clean tests. Advanced: jest.fn().mockResolvedValue() for async.

---

## Card 40: Setup/Teardown
**Q:** beforeEach vs beforeAll?

**A:** beforeEach: runs before each test, ensures isolation. beforeAll: runs once per file, shared setup. Use beforeEach for most cases.

**Difficulty:** 🟢 Easy
**Tags:** #testing #jest #lifecycle
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** beforeEach = fresh state per test (safe). beforeAll = shared state (dangerous—tests affect each other). Real issue: beforeAll mock persists across tests. Red flag: shared database in beforeAll. Best: beforeEach for setup, afterEach for cleanup. Metric: enables parallel test execution. Production rule: always isolate, even if slower.

---

## Card 41: Testing Custom Hooks
**Q:** Best practices for hook testing?

**A:** Test with renderHook, test return values, test updates, test cleanup, test with real component usage patterns.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #hooks
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** renderHook = specialized tool for hooks (not testing in component). Red flag: testing hook in component context (integration, not unit). Real benefit: renderHook faster, simpler than component render. Best: test hook independently, then in component integration. Metric: 100+ hook tests in major projects. Production insight: hooks are composable (test composition).

---

## Card 42: Debugging Tests
**Q:** How to debug failing tests?

**A:** debug() from RTL, console.log, breakpoints, screen.logTestingPlaygroundURL(), --verbose, focused tests (it.only).

**Difficulty:** 🟢 Easy
**Tags:** #testing #debugging #rtl
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** screen.debug() = golden tool (prints DOM). screen.logTestingPlaygroundURL() = generates selector code for you. Red flag: no debugging tools knowledge. Best: it.only for focused testing (runs single test). Node debugger works with tests. Real scenario: screen.debug() saves 30 min of guess-work. Production practice: share debug() screenshot in PR for failing tests.

---

## Card 43: Code Coverage Reports
**Q:** What coverage metrics matter?

**A:** Statement, branch, function, line coverage. Branch coverage most important. Focus on untested critical code, not 100%.

**Difficulty:** 🟡 Medium
**Tags:** #testing #coverage #metrics
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Branch coverage = decision paths (if/else/switch). Most important! Red flag: high coverage but low branch. Real scenario: forgot else branch (100% line, 50% branch). Tools: nyc, codecov. Metric: target 80% line, 70% branch. Production rule: coverage shows gaps, not quality. Google uses 60% baseline for most projects (70% for critical).

---

## Card 44: Testing Portals
**Q:** How to test React Portals?

**A:** Query in document.body or specific container, test modal behavior, test focus management, test click outside.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #portals
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Red flag: expecting portal in component hierarchy (wrong—portals render outside). Real testing: query in document.body, not render container. Best: getByRole for modal (accessible). Metric: portal bugs often = focus not moving to modal. Production lesson: test click-outside closes modal (user UX). Edge case: nested portals (rare but complex).

---

## Card 45: Lazy Loading Tests
**Q:** How to test lazy loaded components?

**A:** Mock React.lazy, test Suspense fallback, waitFor component, test error boundary, test loading states.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #lazy-loading
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real issue: test completes before lazy component loads (race condition). Solution: waitFor(() => expect(screen.getByText(/loaded/i))). Red flag: not testing Suspense fallback UI. Best: test loading→success→error states. Metric: lazy bugs = 404 on dynamic imports. Production pattern: mock lazy with jest.mock() for tests.

---

## Card 46: Testing Timers
**Q:** How to test setTimeout/setInterval?

**A:** jest.useFakeTimers(), jest.advanceTimersByTime(), jest.runAllTimers(), restore real timers after. Test delays without waiting.

**Difficulty:** 🟡 Medium
**Tags:** #testing #timers #jest
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real benefit: test 1000s of ms delays instantly (no waiting). Red flag: forgetting jest.useRealTimers() after (breaks other tests). Best: wrap in try/finally. Metric: timer tests 100x faster. Common mistake: mixing real + fake timers. Production pattern: debounce/throttle need timer testing. Advanced: jest.advanceTimersToNextTimer().

---

## Card 47: Integration Test Strategy
**Q:** What makes a good integration test?

**A:** Tests real user workflows, minimal mocking, tests feature end-to-end, includes routing/state, covers happy and error paths.

**Difficulty:** 🟡 Medium
**Tags:** #testing #integration #strategy
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real example: checkout flow = fill form→select shipping→pay (all integrated). Red flag: mocking every layer (not integration). Best: real DB, MSW for API, real routing. Metric: 80% bugs caught by integration (30% units miss). Production workflow: integration tests = confidence to deploy. Advanced: integration tests → E2E (subset of flows).

---

## Card 48: Test Naming
**Q:** Best practices for test names?

**A:** Describe behavior not implementation, include context, use "should" or "when/then", be specific, long names OK.

**Difficulty:** 🟢 Easy
**Tags:** #testing #naming #best-practices
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Bad: "test component" (unclear). Good: "should display error when email is invalid" (clear behavior). Red flag: test name doesn't match assertions. Real benefit: test name = documentation. Metric: future devs understand from test name. Production rule: test failures = test name tells story of what failed. Use descriptive > concise.

---

## Card 49: Watch Mode
**Q:** Benefits of Jest watch mode?

**A:** Fast feedback, runs related tests, interactive mode, coverage on demand, filters by pattern. Essential for TDD workflow.

**Difficulty:** 🟢 Easy
**Tags:** #testing #jest #developer-experience
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real benefit: red-green-refactor cycle (instant feedback). Watch mode = TDD enabler (seconds between test→code change). Red flag: not using watch mode in development. Metric: 5-10x faster feedback loop. Production workflow: local watch mode → CI full suite. Advanced: jest --watch --testPathPattern=path (run related tests only). Metric: reduces context-switching cost.

---

## Card 50: Test Pyramid Anti-patterns
**Q:** Common testing anti-patterns?

**A:** Ice cream cone (too many E2E), testing implementation, no isolation, flaky tests, slow suites, poor assertions, brittle selectors.

**Difficulty:** 🟡 Medium
**Tags:** #testing #anti-patterns #best-practices
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Ice cream cone = 50% E2E (slow, expensive). Red flag: test implementation instead of behavior. Real issue: brittle selectors (CSS class name changes = test breaks). Best: testId fallback only. Metric: anti-patterns = 30% slower CI. Production truth: good tests enable refactoring. Recognize patterns early (review test code).

---

[← Back to Flashcards](../README.md)
