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

---

## Card 2: Unit vs Integration
**Q:** Difference between unit and integration tests?

**A:** Unit: single function/component in isolation, mocked dependencies. Integration: multiple units working together, some real dependencies. Integration catches interface bugs.

**Difficulty:** 🟢 Easy
**Tags:** #testing #unit #integration
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 3: TDD Process
**Q:** What is Test-Driven Development?

**A:** Red-Green-Refactor cycle. Write failing test first, implement minimum code to pass, refactor. Benefits: better design, confidence, documentation.

**Difficulty:** 🟡 Medium
**Tags:** #testing #tdd #methodology
**Frequency:** ⭐⭐⭐⭐

---

## Card 4: Jest vs Vitest
**Q:** When to choose Vitest over Jest?

**A:** Vitest: faster, Vite-native, ESM support, compatibility API. Jest: larger ecosystem, more resources, battle-tested. Vitest for new Vite projects.

**Difficulty:** 🟡 Medium
**Tags:** #testing #jest #vitest
**Frequency:** ⭐⭐⭐⭐

---

## Card 5: React Testing Library
**Q:** RTL principles?

**A:** Test behavior not implementation, query by accessibility, avoid testing internals, no shallow rendering, user-centric queries.

**Difficulty:** 🟡 Medium
**Tags:** #testing #rtl #react
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 6: Mocking Best Practices
**Q:** When to mock dependencies?

**A:** Mock: external APIs, slow operations, non-deterministic behavior. Don't mock: internal modules (use real), simple utilities. Over-mocking couples tests to implementation.

**Difficulty:** 🟡 Medium
**Tags:** #testing #mocking #best-practices
**Frequency:** ⭐⭐⭐⭐

---

## Card 7: Test Coverage
**Q:** Is 100% code coverage good?

**A:** Not always. High coverage ≠ good tests. Focus on critical paths, edge cases, user scenarios. Diminishing returns after 80%. Coverage shows untested code, not test quality.

**Difficulty:** 🟡 Medium
**Tags:** #testing #coverage #metrics
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 8: Async Testing
**Q:** How to test async code?

**A:** async/await in tests, waitFor, findBy queries, act warnings, fake timers, Promise resolution. Avoid arbitrary waits. Test loading and success states.

**Difficulty:** 🟡 Medium
**Tags:** #testing #async #promises
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 9: Snapshot Testing
**Q:** When are snapshots useful?

**A:** Stable UI, error messages, configuration objects. Avoid for: dynamic data, large components, frequently changing UI. Review changes carefully.

**Difficulty:** 🟢 Easy
**Tags:** #testing #snapshots #jest
**Frequency:** ⭐⭐⭐

---

## Card 10: E2E Test Tools
**Q:** Playwright vs Cypress?

**A:** Playwright: multi-browser, faster, parallel, browser contexts. Cypress: better DX, time-travel debugging, network stubbing. Both excellent for E2E.

**Difficulty:** 🟡 Medium
**Tags:** #testing #e2e #tools
**Frequency:** ⭐⭐⭐⭐

---

## Card 11: Testing Hooks
**Q:** How to test custom React hooks?

**A:** renderHook from @testing-library/react, test behavior not implementation, test with component usage, test cleanup, test dependencies.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #hooks
**Frequency:** ⭐⭐⭐⭐

---

## Card 12: Flaky Tests
**Q:** Causes and fixes for flaky tests?

**A:** Causes: race conditions, hardcoded waits, shared state, non-deterministic data. Fix: proper async handling, isolated tests, deterministic data, retry strategies.

**Difficulty:** 🟡 Medium
**Tags:** #testing #flaky #debugging
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 13: Test Doubles
**Q:** Types of test doubles?

**A:** Dummy (unused), Stub (predefined responses), Spy (records calls), Mock (expectations), Fake (working implementation). Use simplest that works.

**Difficulty:** 🟡 Medium
**Tags:** #testing #mocks #doubles
**Frequency:** ⭐⭐⭐

---

## Card 14: AAA Pattern
**Q:** What is Arrange-Act-Assert?

**A:** Test structure: Arrange (setup), Act (execute), Assert (verify). Clear test organization, one concept per test, descriptive names.

**Difficulty:** 🟢 Easy
**Tags:** #testing #patterns #structure
**Frequency:** ⭐⭐⭐⭐

---

## Card 15: Integration Test Scope
**Q:** What to test in integration tests?

**A:** Component interactions, data flow, API integration, routing, state management. Real dependencies where possible. Test user workflows.

**Difficulty:** 🟡 Medium
**Tags:** #testing #integration #scope
**Frequency:** ⭐⭐⭐⭐

---

## Card 16: Test Isolation
**Q:** Why is test isolation important?

**A:** Independent test execution, no shared state, parallel execution, reliable results. Use beforeEach for setup, afterEach for cleanup.

**Difficulty:** 🟢 Easy
**Tags:** #testing #isolation #best-practices
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 17: Visual Regression
**Q:** What is visual regression testing?

**A:** Screenshot comparison to detect UI changes. Tools: Percy, Chromatic, BackstopJS. Useful for: style changes, responsive design, cross-browser.

**Difficulty:** 🟡 Medium
**Tags:** #testing #visual #regression
**Frequency:** ⭐⭐⭐

---

## Card 18: Contract Testing
**Q:** What is API contract testing?

**A:** Verify API provider/consumer agreement. Tools: Pact, MSW. Prevents breaking changes, faster than E2E, tests API integration.

**Difficulty:** 🔴 Hard
**Tags:** #testing #contract #api
**Frequency:** ⭐⭐⭐

---

## Card 19: Test Queries
**Q:** RTL query priority?

**A:** 1) getByRole (accessible), 2) getByLabelText, 3) getByPlaceholderText, 4) getByText, 5) getByDisplayValue, 6) getByAltText. Avoid testId.

**Difficulty:** 🟡 Medium
**Tags:** #testing #rtl #queries
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 20: Testing Context
**Q:** How to test components using Context?

**A:** Wrap with provider in tests, test provider value changes, test default values, use custom render with providers wrapper.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #context
**Frequency:** ⭐⭐⭐⭐

---

## Card 21: Error Boundaries Testing
**Q:** How to test Error Boundaries?

**A:** Suppress console.error, throw error in child, assert error UI, test error logging, test recovery, spy on error handler.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #error-boundaries
**Frequency:** ⭐⭐⭐

---

## Card 22: Accessibility Testing
**Q:** How to test accessibility?

**A:** jest-axe, manual testing, screen readers, keyboard navigation, ARIA attributes, color contrast, semantic HTML validation.

**Difficulty:** 🟡 Medium
**Tags:** #testing #accessibility #a11y
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 23: Performance Testing
**Q:** How to test performance?

**A:** React Profiler, Chrome DevTools, Lighthouse CI, bundle size analysis, render count tracking, Web Vitals. Set performance budgets.

**Difficulty:** 🟡 Medium
**Tags:** #testing #performance #metrics
**Frequency:** ⭐⭐⭐⭐

---

## Card 24: Test Data Builders
**Q:** What are test data builders?

**A:** Factory functions creating test data. Readable, reusable, default values. Example: createUser({name: 'Test'}). Reduces test boilerplate.

**Difficulty:** 🟡 Medium
**Tags:** #testing #patterns #data
**Frequency:** ⭐⭐⭐

---

## Card 25: Mutation Testing
**Q:** What is mutation testing?

**A:** Changes code to verify tests catch bugs. Tools: Stryker. Measures test quality. High mutation score = effective tests.

**Difficulty:** 🔴 Hard
**Tags:** #testing #mutation #quality
**Frequency:** ⭐⭐

---

## Card 26: Testing Forms
**Q:** Best practices for testing forms?

**A:** Test validation, submission, error messages, loading states, success feedback. Use userEvent for realistic interactions. Test accessibility.

**Difficulty:** 🟡 Medium
**Tags:** #testing #forms #validation
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 27: Router Testing
**Q:** How to test React Router?

**A:** MemoryRouter for tests, test navigation, route params, redirects, protected routes, 404 pages. Test location changes.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react-router #navigation
**Frequency:** ⭐⭐⭐⭐

---

## Card 28: API Mocking
**Q:** Tools for mocking APIs?

**A:** MSW (service worker), nock (Node), fetch-mock. MSW best for realistic mocking, works in browser and Node, reusable handlers.

**Difficulty:** 🟡 Medium
**Tags:** #testing #api #mocking
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 29: Smoke Tests
**Q:** What are smoke tests?

**A:** Quick tests checking critical functionality. Run before deployment. Faster than full suite. Detect major issues early.

**Difficulty:** 🟢 Easy
**Tags:** #testing #smoke #deployment
**Frequency:** ⭐⭐⭐

---

## Card 30: Test Maintenance
**Q:** How to maintain test suite?

**A:** Remove obsolete tests, refactor duplicates, update with features, fix flaky tests, review coverage, parallelize slow tests.

**Difficulty:** 🟡 Medium
**Tags:** #testing #maintenance #best-practices
**Frequency:** ⭐⭐⭐⭐

---

## Card 31: Given-When-Then
**Q:** What is Given-When-Then?

**A:** BDD test structure: Given (context), When (action), Then (outcome). Similar to AAA but focuses on behavior. Use for E2E/integration.

**Difficulty:** 🟢 Easy
**Tags:** #testing #bdd #structure
**Frequency:** ⭐⭐⭐

---

## Card 32: Testing Redux
**Q:** How to test Redux?

**A:** Test reducers (pure functions), action creators, selectors, thunks with mocked dispatch, connected components with Provider.

**Difficulty:** 🟡 Medium
**Tags:** #testing #redux #state-management
**Frequency:** ⭐⭐⭐⭐

---

## Card 33: Parameterized Tests
**Q:** What are parameterized tests?

**A:** Run same test with different inputs. test.each in Jest. Reduces duplication, tests edge cases, clearer intent.

**Difficulty:** 🟢 Easy
**Tags:** #testing #jest #patterns
**Frequency:** ⭐⭐⭐

---

## Card 34: Testing Async Effects
**Q:** How to test useEffect with async?

**A:** Wait for updates with waitFor, test loading/success/error states, mock async functions, use fake timers, cleanup subscriptions.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #async
**Frequency:** ⭐⭐⭐⭐

---

## Card 35: CI/CD Integration
**Q:** Testing in CI/CD pipelines?

**A:** Run on every commit, parallel execution, fail fast, cache dependencies, different test stages, generate reports, notify failures.

**Difficulty:** 🟡 Medium
**Tags:** #testing #ci-cd #automation
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 36: Screen vs Query
**Q:** Difference between screen and query?

**A:** screen has all queries (screen.getByRole), no container needed. query methods return null if not found. get throws error.

**Difficulty:** 🟢 Easy
**Tags:** #testing #rtl #api
**Frequency:** ⭐⭐⭐⭐

---

## Card 37: User Event vs FireEvent
**Q:** When to use userEvent over fireEvent?

**A:** userEvent simulates real user interactions (click, type), triggers all associated events. fireEvent is low-level. Prefer userEvent.

**Difficulty:** 🟡 Medium
**Tags:** #testing #rtl #interactions
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 38: Test Organization
**Q:** How to organize test files?

**A:** Co-locate with source (component.test.js), separate test folder for integration, shared utils in __tests__/utils, descriptive test names.

**Difficulty:** 🟢 Easy
**Tags:** #testing #organization #structure
**Frequency:** ⭐⭐⭐

---

## Card 39: Spy Functions
**Q:** When to use jest.fn()?

**A:** Track function calls, verify arguments, mock implementations, count invocations. Use for callbacks, event handlers, dependency injection.

**Difficulty:** 🟡 Medium
**Tags:** #testing #jest #mocking
**Frequency:** ⭐⭐⭐⭐

---

## Card 40: Setup/Teardown
**Q:** beforeEach vs beforeAll?

**A:** beforeEach: runs before each test, ensures isolation. beforeAll: runs once per file, shared setup. Use beforeEach for most cases.

**Difficulty:** 🟢 Easy
**Tags:** #testing #jest #lifecycle
**Frequency:** ⭐⭐⭐⭐

---

## Card 41: Testing Custom Hooks
**Q:** Best practices for hook testing?

**A:** Test with renderHook, test return values, test updates, test cleanup, test with real component usage patterns.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #hooks
**Frequency:** ⭐⭐⭐⭐

---

## Card 42: Debugging Tests
**Q:** How to debug failing tests?

**A:** debug() from RTL, console.log, breakpoints, screen.logTestingPlaygroundURL(), --verbose, focused tests (it.only).

**Difficulty:** 🟢 Easy
**Tags:** #testing #debugging #rtl
**Frequency:** ⭐⭐⭐⭐

---

## Card 43: Code Coverage Reports
**Q:** What coverage metrics matter?

**A:** Statement, branch, function, line coverage. Branch coverage most important. Focus on untested critical code, not 100%.

**Difficulty:** 🟡 Medium
**Tags:** #testing #coverage #metrics
**Frequency:** ⭐⭐⭐⭐

---

## Card 44: Testing Portals
**Q:** How to test React Portals?

**A:** Query in document.body or specific container, test modal behavior, test focus management, test click outside.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #portals
**Frequency:** ⭐⭐⭐

---

## Card 45: Lazy Loading Tests
**Q:** How to test lazy loaded components?

**A:** Mock React.lazy, test Suspense fallback, waitFor component, test error boundary, test loading states.

**Difficulty:** 🟡 Medium
**Tags:** #testing #react #lazy-loading
**Frequency:** ⭐⭐⭐

---

## Card 46: Testing Timers
**Q:** How to test setTimeout/setInterval?

**A:** jest.useFakeTimers(), jest.advanceTimersByTime(), jest.runAllTimers(), restore real timers after. Test delays without waiting.

**Difficulty:** 🟡 Medium
**Tags:** #testing #timers #jest
**Frequency:** ⭐⭐⭐⭐

---

## Card 47: Integration Test Strategy
**Q:** What makes a good integration test?

**A:** Tests real user workflows, minimal mocking, tests feature end-to-end, includes routing/state, covers happy and error paths.

**Difficulty:** 🟡 Medium
**Tags:** #testing #integration #strategy
**Frequency:** ⭐⭐⭐⭐

---

## Card 48: Test Naming
**Q:** Best practices for test names?

**A:** Describe behavior not implementation, include context, use "should" or "when/then", be specific, long names OK.

**Difficulty:** 🟢 Easy
**Tags:** #testing #naming #best-practices
**Frequency:** ⭐⭐⭐⭐

---

## Card 49: Watch Mode
**Q:** Benefits of Jest watch mode?

**A:** Fast feedback, runs related tests, interactive mode, coverage on demand, filters by pattern. Essential for TDD workflow.

**Difficulty:** 🟢 Easy
**Tags:** #testing #jest #developer-experience
**Frequency:** ⭐⭐⭐

---

## Card 50: Test Pyramid Anti-patterns
**Q:** Common testing anti-patterns?

**A:** Ice cream cone (too many E2E), testing implementation, no isolation, flaky tests, slow suites, poor assertions, brittle selectors.

**Difficulty:** 🟡 Medium
**Tags:** #testing #anti-patterns #best-practices
**Frequency:** ⭐⭐⭐⭐

---

[← Back to Flashcards](../README.md)
