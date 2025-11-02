# Contributing to Frontend Interview Prep Series

Thank you for your interest in contributing! This repository is a community-driven resource, and we welcome contributions from developers of all experience levels.

---

## 📋 Table of Contents

1. [How to Contribute](#-how-to-contribute)
2. [Content Guidelines](#-content-guidelines)
3. [Question Format](#-question-format)
4. [Coding Problem Format](#-coding-problem-format)
5. [Flashcard Format](#-flashcard-format)
6. [Code of Conduct](#-code-of-conduct)
7. [Pull Request Process](#-pull-request-process)
8. [Review Process](#-review-process)

---

## 🤝 How to Contribute

### Ways to Contribute:

1. **Add new questions with answers**
2. **Submit coding problems with solutions**
3. **Create new flashcard decks**
4. **Fix typos or improve explanations**
5. **Add code examples**
6. **Create diagrams or visual aids**
7. **Share interview experiences**
8. **Improve documentation**
9. **Report issues**

### Getting Started:

1. **Fork the repository**
   ```bash
   git clone https://github.com/maurya-sachin/Frontend-Master-Prep-Series.git
   cd Frontend-Master-Prep-Series
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/add-new-questions
   ```

3. **Make your changes**
   - Follow the guidelines below
   - Test your code examples
   - Check for typos

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add 10 new TypeScript questions with answers"
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/add-new-questions
   ```

---

## 📝 Content Guidelines

### General Principles:

1. **Quality over quantity** - One well-explained question is better than 10 superficial ones
2. **Accuracy** - Verify all technical information
3. **Clarity** - Write in simple, clear language
4. **Completeness** - Every question needs a comprehensive answer
5. **Examples** - Include working code examples
6. **Sources** - Link to official documentation (MDN, React docs, etc.)

### What to Include:

✅ **Good Contributions:**
- Questions with detailed answers (3-5 key points)
- Working code examples with comments
- Common mistakes and how to avoid them
- Follow-up questions
- Real interview experiences
- Edge cases and gotchas
- Performance considerations

❌ **Avoid:**
- Questions without answers
- Incorrect technical information
- Copy-pasted content without attribution
- Overly simplistic answers
- Code without explanations
- Duplicate questions

---

## 📚 Question Format

### Template:

```markdown
## Question N: [Clear, Concise Title]

**Difficulty:** 🟢 Easy / 🟡 Medium / 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐ (1-5 stars)
**Time:** 3-5 minutes (estimated answer time)
**Companies:** Google, Meta, Amazon (if applicable)

### Question
[Write a clear, specific question that an interviewer might ask]

### Answer
[Detailed answer with 3-5 key points]

1. **First Key Point**
   - Explanation
   - Why it matters

2. **Second Key Point**
   - Explanation
   - Technical details

3. **Third Key Point**
   - Explanation
   - Practical implications

### Code Example
```javascript
// Working code example with comments
function example() {
  // Explain what this does
  const result = someOperation();
  return result;
}

// Usage example
console.log(example()); // Expected output
```

### Common Mistakes
- ❌ **Mistake 1:** Description of common error
  - Why it's wrong
  - What happens

- ✅ **Correct Approach:** How to do it right
  - Explanation
  - Why this is better

### Follow-up Questions
- "What if we need to handle X?"
- "How would you optimize this for Y?"
- "What are the trade-offs of Z?"

### Resources
- [MDN: Topic Name](https://developer.mozilla.org/)
- [Article: Detailed Guide](https://example.com)
- [Video: Visual Explanation](https://youtube.com)

---
```

### Example:

```markdown
## Question 1: What is closure in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain what a closure is in JavaScript and provide a practical example of when you would use one.

### Answer

A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.

1. **Lexical Scoping**
   - Functions are executed using the scope chain that was in effect when they were defined
   - Inner functions have access to variables in outer functions

2. **Persistent State**
   - Closures allow functions to "remember" their lexical scope
   - Useful for data privacy and maintaining state

3. **Common Use Cases**
   - Creating private variables
   - Event handlers
   - Callbacks
   - Function factories

### Code Example
```javascript
// Factory function creating a closure
function createCounter() {
  let count = 0; // Private variable

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

// Usage
const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount());  // 2
// count is not accessible directly (private)
```

### Common Mistakes
- ❌ **Mistake:** Closures in loops with var
  ```javascript
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
  }
  // Outputs: 3, 3, 3 (not 0, 1, 2)
  ```

- ✅ **Correct:** Use let or IIFE
  ```javascript
  for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
  }
  // Outputs: 0, 1, 2
  ```

### Follow-up Questions
- "What is the performance impact of closures?"
- "How do closures relate to memory management?"
- "Can you explain the closure in the context of React hooks?"

### Resources
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [JavaScript.info: Closure](https://javascript.info/closure)

---
```

---

## 💻 Coding Problem Format

### Template:

```markdown
# [Problem Name]

## Problem Statement
[Clear description of what needs to be implemented]

**Difficulty:** 🟢 Easy / 🟡 Medium / 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 15-30 minutes
**Companies:** Google, Meta, Amazon (if asked at these companies)

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Handle edge cases (empty input, null, etc.)
- [ ] Optimal time complexity

## Example Usage
```javascript
// Input
const input = [1, 2, 3, 4, 5];

// Output
const output = solution(input);
console.log(output); // Expected: [expected result]
```

## Test Cases
```javascript
describe('Problem Name', () => {
  test('handles basic case', () => {
    expect(solution([1, 2, 3])).toEqual(expected);
  });

  test('handles edge case: empty input', () => {
    expect(solution([])).toEqual([]);
  });

  test('handles edge case: null', () => {
    expect(solution(null)).toEqual(null);
  });
});
```

## Solution 1: Basic Approach
```javascript
function basicSolution(input) {
  // Simple, readable solution
  // May not be optimal
}
```

**Time Complexity:** O(?)
**Space Complexity:** O(?)

**Pros:**
- Easy to understand
- Quick to implement

**Cons:**
- Not optimal for large inputs

## Solution 2: Optimized Approach
```javascript
function optimizedSolution(input) {
  // More efficient solution
  // Better time/space complexity
}
```

**Time Complexity:** O(?)
**Space Complexity:** O(?)

**Pros:**
- Optimal performance
- Handles large inputs

**Cons:**
- More complex

## Solution 3: Production-Ready (if applicable)
```javascript
function productionSolution(input) {
  // Includes error handling
  // Input validation
  // Edge case handling

  if (!input || !Array.isArray(input)) {
    throw new Error('Invalid input');
  }

  // Implementation with full error handling
}
```

## Common Mistakes
- Mistake 1: Description
- Mistake 2: Description

## Edge Cases
- Empty input
- Null/undefined
- Single element
- Large datasets
- Duplicate values

## Follow-up Questions
- "How would you optimize this further?"
- "What if the input was a stream?"
- "How would you test this in production?"

## Real-World Applications
- Use case 1
- Use case 2

## Resources
- [Link to related concept]
- [Algorithm explanation]

---
```

---

## 🎴 Flashcard Format

### Template:

```markdown
## Card N: [Topic]
**Q:** [Clear, concise question]

**A:** [Short answer - 2-3 sentences max]

**Difficulty:** 🟢 Easy / 🟡 Medium / 🔴 Hard
**Tags:** #javascript #closures #interview
**Frequency:** ⭐⭐⭐⭐⭐

---
```

### Example:

```markdown
## Card 1: Closures
**Q:** What is a closure?

**A:** A function that has access to variables in its outer lexical scope, even after the outer function has returned. Used for data privacy and maintaining state.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #closures #fundamentals
**Frequency:** ⭐⭐⭐⭐⭐

---
```

---

## 🎯 Code of Conduct

### Be Respectful
- Treat all contributors with respect
- Welcome newcomers
- Provide constructive feedback
- Be patient with questions

### Be Collaborative
- Help others learn
- Share knowledge openly
- Credit original sources
- Work together to improve content

### Be Professional
- Use professional language
- Stay on topic
- Focus on the content, not the person
- Resolve conflicts maturely

---

## 🔄 Pull Request Process

### Before Submitting:

1. **Test your code**
   - All code examples must work
   - Run test cases if applicable

2. **Check formatting**
   - Follow markdown conventions
   - Use consistent indentation
   - Check for typos

3. **Update navigation**
   - Add links in README if needed
   - Update table of contents

4. **Write clear commit messages**
   ```bash
   # Good
   git commit -m "Add 10 React hooks questions with examples"

   # Avoid
   git commit -m "update files"
   ```

### PR Template:

```markdown
## Description
[Brief description of changes]

## Type of Change
- [ ] New questions/answers
- [ ] New coding problems
- [ ] New flashcards
- [ ] Bug fix
- [ ] Documentation update
- [ ] Other (please describe)

## Checklist
- [ ] Code examples are tested and working
- [ ] Followed content guidelines
- [ ] Checked for typos
- [ ] Updated navigation/links if needed
- [ ] Added appropriate difficulty/frequency tags

## Screenshots (if applicable)
[Add screenshots if relevant]

## Additional Notes
[Any additional context]
```

---

## ✅ Review Process

### What Reviewers Check:

1. **Technical Accuracy**
   - Is the information correct?
   - Are code examples bug-free?

2. **Quality**
   - Is the explanation clear?
   - Are there enough details?
   - Is it useful for interview prep?

3. **Format**
   - Follows templates?
   - Proper markdown formatting?
   - Links work?

4. **Completeness**
   - Answer provided for questions?
   - Multiple solutions for problems?
   - Edge cases covered?

### Review Timeline:

- Small changes (typos, minor edits): 1-2 days
- New content (5-10 questions): 3-5 days
- Large contributions (new sections): 1-2 weeks

---

## 🏆 Recognition

### Contributors

All contributors will be:
- Listed in the CONTRIBUTORS.md file
- Acknowledged in release notes
- Given credit in commit history

### Top Contributors

Monthly recognition for:
- Most questions added
- Most helpful reviews
- Best code examples
- Most impactful contributions

---

## 💡 Ideas for Contributions

### High Priority:
- [ ] More company-specific questions (FAANG)
- [ ] Advanced TypeScript patterns
- [ ] React 19 features
- [ ] Next.js 15 updates
- [ ] Performance optimization techniques
- [ ] Accessibility real-world scenarios

### Medium Priority:
- [ ] More visual diagrams
- [ ] Video explanations
- [ ] Interactive code playgrounds
- [ ] Interview experience stories
- [ ] Mock interview questions

### Nice to Have:
- [ ] Translations to other languages
- [ ] Audio flashcards
- [ ] Mobile-optimized flashcard app
- [ ] Offline flashcard mode enhancements

---

## 📞 Questions?

- **Issues:** Open an issue on GitHub
- **Discussions:** Use GitHub Discussions
- **Email:** [Your email if you want to provide one]

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making this resource better for everyone! 🙏**

---

[← Back to Main README](./README.md) | [Getting Started →](./GETTING-STARTED.md)
