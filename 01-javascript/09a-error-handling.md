# Error Handling & Debugging

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 27: How does error handling work with try-catch-finally?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain try-catch-finally blocks. How do you handle errors in JavaScript?

### Answer

**try-catch-finally** provides structured error handling in JavaScript.

1. **Structure**
   - `try`: Code that might throw error
   - `catch`: Handle the error
   - `finally`: Always executes (optional)
   - Can throw custom errors

2. **Error Types**
   - `Error`: Generic error
   - `TypeError`: Wrong type
   - `ReferenceError`: Undefined variable
   - `SyntaxError`: Parse error
   - Custom errors

### Code Example

```javascript
// 1. BASIC TRY-CATCH
try {
  const result = riskyOperation();
  console.log(result);
} catch (error) {
  console.error("Error occurred:", error.message);
}

// 2. TRY-CATCH-FINALLY
try {
  console.log("Trying...");
  throw new Error("Something went wrong!");
} catch (error) {
  console.log("Caught:", error.message);
} finally {
  console.log("This always runs!");
}

// 3. THROWING CUSTOM ERRORS
function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero!");
  }
  return a / b;
}

try {
  divide(10, 0);
} catch (error) {
  console.log(error.message); // "Cannot divide by zero!"
}

// 4. CUSTOM ERROR CLASS
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateAge(age) {
  if (age < 0) {
    throw new ValidationError("Age cannot be negative");
  }
}

try {
  validateAge(-5);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("Validation failed:", error.message);
  }
}

// 5. ASYNC ERROR HANDLING
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error; // Re-throw if needed
  } finally {
    console.log("Fetch attempt completed");
  }
}
```

### Resources

- [MDN: try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)

---

