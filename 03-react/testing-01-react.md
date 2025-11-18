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

**[← Back to React README](./README.md)**
