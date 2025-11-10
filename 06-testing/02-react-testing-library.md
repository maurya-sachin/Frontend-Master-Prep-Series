# React Testing Library Deep Dive

> Testing components, hooks, async logic, mocking, and advanced testing patterns.

---

## Question 1: Testing Async Components

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Meta, Netflix

### Question
How do you test components that fetch data asynchronously?

### Answer

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('loads and displays user data', async () => {
  render(<UserProfile userId="1" />);

  // Wait for loading to disappear
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for data to appear
  await waitFor(() => {
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  });

  // Or use findBy (combines getBy + waitFor)
  expect(await screen.findByText(/john doe/i)).toBeInTheDocument();
});

// Mocking fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ name: 'John Doe' })
  })
);
```

### Resources
- [Testing Library Async](https://testing-library.com/docs/dom-testing-library/api-async/)

---

