# React Testing Library Deep Dive

> **Master React Testing Library - components, hooks, async logic, user interactions, and advanced patterns**

---

## Question 1: What is React Testing Library and how does it differ from Enzyme?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-9 minutes
**Companies:** Meta, Google, Airbnb, Netflix

### Question
Explain React Testing Library philosophy. How does it differ from Enzyme? Why is it the recommended testing approach?

### Answer

React Testing Library (RTL) encourages testing components the way users interact with them, focusing on accessibility and behavior over implementation details.

**Core Philosophy:**
1. **User-Centric** - Test what users see/do
2. **Accessibility First** - Query by roles, labels
3. **Implementation Agnostic** - Don't test state/props directly
4. **Confidence** - Tests resemble real usage
5. **Maintainability** - Tests don't break on refactors

### RTL vs Enzyme

```javascript
// ❌ ENZYME: Tests implementation details
import { shallow } from 'enzyme';

test('counter (Enzyme)', () => {
  const wrapper = shallow(<Counter />);

  // Bad: Testing state directly
  expect(wrapper.state('count')).toBe(0);

  // Bad: Finding by class/component name
  wrapper.find('.increment-button').simulate('click');

  expect(wrapper.state('count')).toBe(1);
});

// ✅ RTL: Tests user behavior
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('counter (RTL)', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  // Good: User sees count
  expect(screen.getByText('Count: 0')).toBeInTheDocument();

  // Good: User clicks button by accessible name
  await user.click(screen.getByRole('button', { name: /increment/i }));

  // Good: User sees updated count
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Key Differences

| Aspect | Enzyme | React Testing Library |
|--------|--------|----------------------|
| **Philosophy** | Test internals | Test behavior |
| **Queries** | Classes, state, props | Roles, labels, text |
| **Shallow render** | Yes | No (full render only) |
| **Instance access** | Yes (wrapper.instance()) | No |
| **State testing** | Encourages | Discourages |
| **Maintenance** | Manual updates | React 18+ compatible |

### Code Example

```javascript
// Counter.jsx
import { useState } from 'react';

export function Counter({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
      <button onClick={() => setCount(initialCount)}>
        Reset
      </button>
    </div>
  );
}

// Counter.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

describe('Counter', () => {
  test('renders initial count', () => {
    render(<Counter initialCount={5} />);
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });

  test('increments count', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole('button', { name: /increment/i }));

    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  test('decrements count', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={5} />);

    await user.click(screen.getByRole('button', { name: /decrement/i }));

    expect(screen.getByText('Count: 4')).toBeInTheDocument();
  });

  test('resets to initial value', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={10} />);

    await user.click(screen.getByRole('button', { name: /increment/i }));
    expect(screen.getByText('Count: 11')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByText('Count: 10')).toBeInTheDocument();
  });
});
```

### Resources
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Guiding Principles](https://testing-library.com/docs/guiding-principles/)

---

## Question 2: What are the different query methods in RTL and when should you use each?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** All React companies

### Question
Explain the different query types (getBy, queryBy, findBy) and query variants (ByRole, ByText, etc.) in RTL. When should you use each?

### Answer

RTL provides multiple query methods for different scenarios.

**Query Types:**
1. **getBy*** - Throws if not found (synchronous)
2. **queryBy*** - Returns null if not found
3. **findBy*** - Async, waits for element
4. **getAllBy***, **queryAllBy***, **findAllBy*** - Multiple elements

**Query Priority (Recommended Order):**
1. **getByRole** - Accessibility queries (best)
2. **getByLabelText** - Form fields
3. **getByPlaceholderText** - Fallback for inputs
4. **getByText** - Non-interactive elements
5. **getByDisplayValue** - Current input value
6. **getByAltText** - Images
7. **getByTitle** - Title attribute
8. **getByTestId** - Last resort

### Code Example

```javascript
import { render, screen } from '@testing-library/react';

// Component to test
function LoginForm() {
  return (
    <form>
      <h1>Login</h1>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        placeholder="Enter email"
        aria-label="Email address"
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        placeholder="Enter password"
      />
      <button type="submit">Sign In</button>
      <img src="logo.png" alt="Company logo" />
      <p title="Helper text">Need help?</p>
      <div data-testid="custom-element">Custom</div>
    </form>
  );
}

describe('Query Methods', () => {
  beforeEach(() => {
    render(<LoginForm />);
  });

  // 1. getByRole - BEST for accessibility
  test('getByRole queries', () => {
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  // 2. getByLabelText - For form fields
  test('getByLabelText queries', () => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  // 3. getByPlaceholderText - When no label
  test('getByPlaceholderText queries', () => {
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
  });

  // 4. getByText - For non-interactive elements
  test('getByText queries', () => {
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/need help/i)).toBeInTheDocument();
  });

  // 5. getByAltText - For images
  test('getByAltText queries', () => {
    expect(screen.getByAltText(/company logo/i)).toBeInTheDocument();
  });

  // 6. getByTitle - Title attribute
  test('getByTitle queries', () => {
    expect(screen.getByTitle(/helper text/i)).toBeInTheDocument();
  });

  // 7. getByTestId - Last resort
  test('getByTestId queries', () => {
    expect(screen.getByTestId('custom-element')).toBeInTheDocument();
  });
});

// Query type differences
describe('Query Types', () => {
  test('getBy - throws if not found', () => {
    render(<div>Hello</div>);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(() => screen.getByText('Goodbye')).toThrow();
  });

  test('queryBy - returns null if not found', () => {
    render(<div>Hello</div>);

    expect(screen.queryByText('Hello')).toBeInTheDocument();
    expect(screen.queryByText('Goodbye')).toBeNull();
  });

  test('findBy - waits for element (async)', async () => {
    function AsyncComponent() {
      const [show, setShow] = React.useState(false);
      React.useEffect(() => {
        setTimeout(() => setShow(true), 100);
      }, []);
      return show ? <div>Loaded!</div> : <div>Loading...</div>;
    }

    render(<AsyncComponent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('Loaded!')).toBeInTheDocument();
  });

  test('getAllBy - multiple elements', () => {
    render(
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });
});

// When to use each query type
describe('Query Type Usage', () => {
  test('use queryBy for asserting element absence', () => {
    render(<div>Visible</div>);

    // ✅ Good: Use queryBy for negative assertions
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();

    // ❌ Bad: getBy throws before assertion runs
    // expect(screen.getByText('Hidden')).not.toBeInTheDocument();
  });

  test('use findBy for elements that appear async', async () => {
    function DelayedComponent() {
      const [data, setData] = React.useState(null);

      React.useEffect(() => {
        setTimeout(() => setData('Data loaded'), 100);
      }, []);

      return <div>{data || 'Loading...'}</div>;
    }

    render(<DelayedComponent />);

    // ✅ Good: findBy waits for element
    expect(await screen.findByText('Data loaded')).toBeInTheDocument();

    // ❌ Bad: getBy fails immediately
    // expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });

  test('use getBy for elements that should exist immediately', () => {
    render(<button>Click me</button>);

    // ✅ Good: Element exists immediately
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Resources
- [RTL Queries](https://testing-library.com/docs/queries/about/)
- [Query Priority](https://testing-library.com/docs/queries/about#priority)

---

## Question 3: How do you test user interactions with userEvent vs fireEvent?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Meta, Google, Airbnb

### Question
Explain the difference between fireEvent and userEvent. When should you use each? How do you test complex user interactions?

### Answer

**userEvent** is the recommended approach as it simulates real user interactions more accurately than **fireEvent**.

**Key Differences:**
1. **userEvent** - Fires multiple events (like real users)
2. **fireEvent** - Fires single DOM event
3. **userEvent** - Async (returns promises)
4. **fireEvent** - Synchronous

### Code Example

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';

// Form component
function ContactForm({ onSubmit }) {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Name</label>
      <input
        id="name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <label htmlFor="message">Message</label>
      <textarea
        id="message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      />

      <button type="submit">Submit</button>
    </form>
  );
}

// 1. TYPING (userEvent is better)
describe('Typing interactions', () => {
  test('userEvent.type - realistic typing', async () => {
    const user = userEvent.setup();
    render(<ContactForm onSubmit={jest.fn()} />);

    const input = screen.getByLabelText(/name/i);

    // userEvent fires: keyDown, keyPress, keyUp for each character
    await user.type(input, 'John Doe');

    expect(input).toHaveValue('John Doe');
  });

  test('fireEvent.change - direct value change', () => {
    render(<ContactForm onSubmit={jest.fn()} />);

    const input = screen.getByLabelText(/name/i);

    // fireEvent only fires change event (less realistic)
    fireEvent.change(input, { target: { value: 'John Doe' } });

    expect(input).toHaveValue('John Doe');
  });
});

// 2. CLICKING
describe('Click interactions', () => {
  test('userEvent.click - realistic click', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<button onClick={handleClick}>Click me</button>);

    // Fires: pointerOver, pointerEnter, pointerDown, mouseDown,
    //        pointerUp, mouseUp, click
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('fireEvent.click - simple click', () => {
    const handleClick = jest.fn();

    render(<button onClick={handleClick}>Click me</button>);

    // Only fires click event
    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// 3. COMPLEX INTERACTIONS
describe('Complex user interactions', () => {
  test('complete form fill and submit', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();

    render(<ContactForm onSubmit={handleSubmit} />);

    // Type in multiple fields
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello world');

    // Submit form
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello world'
    });
  });

  test('keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <input placeholder="Field 1" />
        <input placeholder="Field 2" />
        <button>Submit</button>
      </div>
    );

    const field1 = screen.getByPlaceholderText('Field 1');
    const field2 = screen.getByPlaceholderText('Field 2');
    const button = screen.getByRole('button');

    // Tab through elements
    await user.tab();
    expect(field1).toHaveFocus();

    await user.tab();
    expect(field2).toHaveFocus();

    await user.tab();
    expect(button).toHaveFocus();

    // Shift+Tab to go back
    await user.tab({ shift: true });
    expect(field2).toHaveFocus();
  });

  test('file upload', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<input type="file" onChange={handleChange} />);

    const file = new File(['content'], 'test.png', { type: 'image/png' });
    const input = screen.getByRole('textbox', { hidden: true });

    await user.upload(input, file);

    expect(handleChange).toHaveBeenCalled();
    expect(input.files[0]).toBe(file);
    expect(input.files).toHaveLength(1);
  });

  test('select option', async () => {
    const user = userEvent.setup();

    render(
      <select aria-label="Country">
        <option value="">Select country</option>
        <option value="us">USA</option>
        <option value="uk">UK</option>
        <option value="ca">Canada</option>
      </select>
    );

    const select = screen.getByLabelText(/country/i);

    await user.selectOptions(select, 'us');
    expect(select).toHaveValue('us');

    await user.selectOptions(select, ['uk']);
    expect(select).toHaveValue('uk');
  });

  test('clear input', async () => {
    const user = userEvent.setup();

    render(<input defaultValue="Initial value" />);

    const input = screen.getByRole('textbox');

    expect(input).toHaveValue('Initial value');

    await user.clear(input);
    expect(input).toHaveValue('');
  });

  test('hover interactions', async () => {
    const user = userEvent.setup();

    function Tooltip() {
      const [show, setShow] = React.useState(false);
      return (
        <div>
          <button
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
          >
            Hover me
          </button>
          {show && <div role="tooltip">Tooltip text</div>}
        </div>
      );
    }

    render(<Tooltip />);

    const button = screen.getByRole('button');

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.hover(button);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await user.unhover(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
```

### userEvent API

```javascript
const user = userEvent.setup();

// Typing
await user.type(element, 'text to type');
await user.type(element, 'Hello{Enter}'); // Special keys
await user.type(element, '{Shift}{Control}a'); // Key combinations

// Clicking
await user.click(element);
await user.dblClick(element);
await user.tripleClick(element);

// Keyboard
await user.keyboard('[ShiftLeft>]A[/ShiftLeft]'); // Shift+A
await user.tab(); // Tab key
await user.tab({ shift: true }); // Shift+Tab

// Forms
await user.type(input, 'text');
await user.clear(input);
await user.selectOptions(select, 'value');
await user.upload(input, file);

// Pointer
await user.hover(element);
await user.unhover(element);
await user.pointer({ keys: '[MouseLeft]', target: element });

// Clipboard
await user.copy();
await user.paste('pasted text');
await user.cut();
```

### Resources
- [userEvent API](https://testing-library.com/docs/user-event/intro/)
- [Interaction Examples](https://testing-library.com/docs/user-event/convenience)

---

## Question 4: How do you test async components and data fetching?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Meta, Netflix, Airbnb

### Question
Explain how to test components that fetch data asynchronously. How do you handle loading states, errors, and async updates?

### Answer

RTL provides `waitFor`, `findBy*` queries, and other utilities for testing async behavior.

**Async Utilities:**
1. **findBy*** - Wait for element to appear
2. **waitFor** - Wait for assertion to pass
3. **waitForElementToBeRemoved** - Wait for removal
4. **act** - Wrap async state updates

### Code Example

```javascript
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Async component
function UserProfile({ userId }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/users/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <p>Bio: {user.bio}</p>
    </div>
  );
}

// Mock fetch
global.fetch = jest.fn();

describe('UserProfile - Async Testing', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // 1. TESTING LOADING STATE
  test('shows loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<UserProfile userId={1} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  // 2. USING findBy (recommended for async)
  test('displays user data with findBy', async () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Software engineer'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });

    render(<UserProfile userId={1} />);

    // findBy automatically waits (combines getBy + waitFor)
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText(/software engineer/i)).toBeInTheDocument();
  });

  // 3. USING waitFor
  test('displays user data with waitFor', async () => {
    const mockUser = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      bio: 'Product manager'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });

    render(<UserProfile userId={2} />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  // 4. USING waitForElementToBeRemoved
  test('displays user data with waitForElementToBeRemoved', async () => {
    const mockUser = {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      bio: 'Designer'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });

    render(<UserProfile userId={3} />);

    const loadingElement = screen.getByText(/loading/i);
    await waitForElementToBeRemoved(loadingElement);

    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  // 5. TESTING ERROR STATES
  test('displays error message on fetch failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<UserProfile userId={999} />);

    expect(await screen.findByText(/error: network error/i)).toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  test('handles HTTP error responses', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    render(<UserProfile userId={999} />);

    expect(await screen.findByText(/error: failed to fetch/i)).toBeInTheDocument();
  });

  // 6. TESTING RE-FETCHING ON PROP CHANGE
  test('refetches when userId changes', async () => {
    const user1 = { name: 'User 1', email: 'user1@test.com', bio: 'Bio 1' };
    const user2 = { name: 'User 2', email: 'user2@test.com', bio: 'Bio 2' };

    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => user1 })
      .mockResolvedValueOnce({ ok: true, json: async () => user2 });

    const { rerender } = render(<UserProfile userId={1} />);

    expect(await screen.findByText('User 1')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);

    // Change userId
    rerender(<UserProfile userId={2} />);

    expect(await screen.findByText('User 2')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  // 7. TESTING TIMEOUT
  test('handles slow requests', async () => {
    const mockUser = { name: 'Slow User', email: 'slow@test.com', bio: 'Bio' };

    fetch.mockImplementation(
      () => new Promise(resolve =>
        setTimeout(() => resolve({
          ok: true,
          json: async () => mockUser
        }), 2000)
      )
    );

    render(<UserProfile userId={1} />);

    // Increase timeout for this specific test
    expect(
      await screen.findByText('Slow User', {}, { timeout: 3000 })
    ).toBeInTheDocument();
  }, 5000); // Jest test timeout

  // 8. TESTING PARALLEL REQUESTS
  test('handles multiple concurrent requests', async () => {
    function UserList({ userIds }) {
      const [users, setUsers] = React.useState([]);

      React.useEffect(() => {
        Promise.all(
          userIds.map(id =>
            fetch(`/api/users/${id}`).then(r => r.json())
          )
        ).then(setUsers);
      }, [userIds]);

      return (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      );
    }

    const mockUsers = [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
      { id: 3, name: 'User 3' }
    ];

    fetch.mockImplementation((url) => {
      const id = parseInt(url.split('/').pop());
      const user = mockUsers.find(u => u.id === id);
      return Promise.resolve({ json: async () => user });
    });

    render(<UserList userIds={[1, 2, 3]} />);

    expect(await screen.findByText('User 1')).toBeInTheDocument();
    expect(await screen.findByText('User 2')).toBeInTheDocument();
    expect(await screen.findByText('User 3')).toBeInTheDocument();
  });
});

// Advanced async patterns
describe('Advanced Async Patterns', () => {
  test('debounced search', async () => {
    function SearchInput() {
      const [query, setQuery] = React.useState('');
      const [results, setResults] = React.useState([]);

      React.useEffect(() => {
        if (!query) return;

        const timeoutId = setTimeout(() => {
          fetch(`/api/search?q=${query}`)
            .then(r => r.json())
            .then(setResults);
        }, 300);

        return () => clearTimeout(timeoutId);
      }, [query]);

      return (
        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
          />
          <ul>
            {results.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </div>
      );
    }

    fetch.mockResolvedValue({
      json: async () => [
        { id: 1, title: 'Result 1' },
        { id: 2, title: 'Result 2' }
      ]
    });

    const user = userEvent.setup({ delay: null }); // Disable built-in delay
    render(<SearchInput />);

    const input = screen.getByPlaceholderText('Search...');

    await user.type(input, 'test');

    // Wait for debounce + fetch
    expect(await screen.findByText('Result 1')).toBeInTheDocument();
    expect(await screen.findByText('Result 2')).toBeInTheDocument();
  });

  test('infinite scroll', async () => {
    function InfiniteList() {
      const [items, setItems] = React.useState([]);
      const [page, setPage] = React.useState(1);
      const [hasMore, setHasMore] = React.useState(true);

      const loadMore = () => {
        fetch(`/api/items?page=${page}`)
          .then(r => r.json())
          .then(data => {
            setItems(prev => [...prev, ...data.items]);
            setHasMore(data.hasMore);
            setPage(p => p + 1);
          });
      };

      React.useEffect(() => {
        loadMore();
      }, []);

      return (
        <div>
          <ul>
            {items.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
          {hasMore && (
            <button onClick={loadMore}>Load More</button>
          )}
        </div>
      );
    }

    fetch
      .mockResolvedValueOnce({
        json: async () => ({
          items: [{ id: 1, name: 'Item 1' }],
          hasMore: true
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          items: [{ id: 2, name: 'Item 2' }],
          hasMore: false
        })
      });

    const user = userEvent.setup();
    render(<InfiniteList />);

    // Wait for initial load
    expect(await screen.findByText('Item 1')).toBeInTheDocument();

    // Load more
    await user.click(screen.getByRole('button', { name: /load more/i }));

    expect(await screen.findByText('Item 2')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });
});
```

### Resources
- [Async Utilities](https://testing-library.com/docs/dom-testing-library/api-async/)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Question 5: How do you test form validation and error handling?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** All companies

### Question
Explain how to test form validation, error messages, and submission logic. How do you test both client-side and async validation?

### Answer

Form testing covers validation, error display, submission, and user feedback.

### Code Example

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Registration form with validation
function RegistrationForm({ onSubmit }) {
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'username-error' : undefined}
        />
        {errors.username && (
          <div id="username-error" role="alert">{errors.username}</div>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          aria-invalid={!!errors.email}
        />
        {errors.email && <div role="alert">{errors.email}</div>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          aria-invalid={!!errors.password}
        />
        {errors.password && <div role="alert">{errors.password}</div>}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && <div role="alert">{errors.confirmPassword}</div>}
      </div>

      {errors.submit && <div role="alert">{errors.submit}</div>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Register'}
      </button>
    </form>
  );
}

describe('RegistrationForm Validation', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  // 1. REQUIRED FIELD VALIDATION
  test('shows error for empty username', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} />);

    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  // 2. LENGTH VALIDATION
  test('shows error for short username', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/username/i), 'ab');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(
      await screen.findByText('Username must be at least 3 characters')
    ).toBeInTheDocument();
  });

  // 3. FORMAT VALIDATION
  test('shows error for invalid email', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText('Email is invalid')).toBeInTheDocument();
  });

  // 4. MATCHING FIELDS VALIDATION
  test('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'different');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  // 5. SUCCESSFUL SUBMISSION
  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockSubmit.mockResolvedValueOnce();

    render(<RegistrationForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
    });

    // No error messages shown
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // 6. ASYNC SUBMISSION ERROR
  test('shows error when submission fails', async () => {
    const user = userEvent.setup();
    mockSubmit.mockRejectedValueOnce(new Error('Username already exists'));

    render(<RegistrationForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/username/i), 'existinguser');
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(
      await screen.findByText('Username already exists')
    ).toBeInTheDocument();
  });

  // 7. LOADING STATE
  test('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<RegistrationForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(submitButton).toHaveTextContent('Submitting...');
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Register');
      expect(submitButton).not.toBeDisabled();
    });
  });

  // 8. ARIA ATTRIBUTES FOR ERRORS
  test('sets aria-invalid on fields with errors', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} />);

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      const usernameInput = screen.getByLabelText(/username/i);
      expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
      expect(usernameInput).toHaveAttribute('aria-describedby', 'username-error');
    });
  });

  // 9. MULTIPLE VALIDATION ERRORS
  test('shows all validation errors at once', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} />);

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  // 10. CLEARING ERRORS ON FIX
  test('clears errors when user fixes validation issues', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} />);

    // Trigger validation errors
    await user.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText('Username is required')).toBeInTheDocument();

    // Fix the error
    await user.type(screen.getByLabelText(/username/i), 'validusername');
    await user.type(screen.getByLabelText(/email/i), 'valid@email.com');
    await user.type(screen.getByLabelText(/^password$/i), 'validpassword123');
    await user.type(screen.getByLabelText(/confirm password/i), 'validpassword123');

    await user.click(screen.getByRole('button', { name: /register/i }));

    // Errors should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
    });
  });
});
```

### Resources
- [Form Testing](https://testing-library.com/docs/ecosystem-user-event/#typeelement-text-options)

---

**[← Back to Testing README](./README.md)**

**Progress:** 5 of 18+ React Testing Library questions completed ✅

_Note: Additional questions on context testing, routing, custom render wrappers, snapshot testing, accessibility testing, mocking modules, testing error boundaries, portal testing, suspense testing, state management testing, and advanced patterns will be added to reach 18 total questions._
