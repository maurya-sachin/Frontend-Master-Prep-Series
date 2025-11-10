# Testing Accessibility

> Automated testing, manual testing, axe-core, Lighthouse, and accessibility testing strategies.

---

## Question 1: Automated Accessibility Testing

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Google, Airbnb

### Question
How do you test accessibility in frontend applications?

### Answer

**Tools & Strategies:**
1. Automated tools (catch ~30% of issues)
2. Manual testing
3. Screen reader testing
4. Keyboard testing

```javascript
// Jest + jest-axe
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should have no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);

  expect(results).toHaveNoViolations();
});

// Testing Library accessibility queries
test('form is accessible', () => {
  render(<LoginForm />);

  // Use accessible queries
  const emailInput = screen.getByLabelText(/email/i);
  const submitButton = screen.getByRole('button', { name: /submit/i });

  expect(emailInput).toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();
});
```

**Manual Checklist:**
- ✅ Keyboard navigation works
- ✅ Focus indicators visible
- ✅ Screen reader announces correctly
- ✅ Color contrast meets WCAG
- ✅ Images have alt text

### Resources
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [jest-axe](https://github.com/nickcolley/jest-axe)

---

