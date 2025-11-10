# Testing Patterns and Best Practices

> Test organization, AAA pattern, test doubles, coverage, TDD, and testing strategies.

---

## Question 1: AAA Pattern in Testing

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Google, Meta

### Question
What is the AAA (Arrange-Act-Assert) pattern in testing?

### Answer

**AAA Pattern** - Standard structure for organizing tests.

```javascript
test('user can submit form', () => {
  // Arrange - Set up test data and environment
  const user = { name: 'John', email: 'john@example.com' };
  render(<Form />);

  // Act - Perform the action being tested
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: user.name }
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: user.email }
  });
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));

  // Assert - Verify the expected outcome
  expect(screen.getByText(/thank you/i)).toBeInTheDocument();
});
```

**Best Practices:**
- Clear separation of phases
- One assertion per test (when possible)
- Descriptive test names
- Test behavior, not implementation

### Resources
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

