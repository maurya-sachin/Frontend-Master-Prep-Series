# Check Palindrome

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Amazon, Google, Microsoft, Meta, Apple
**Time:** 15-20 minutes

---

## Problem Statement

Determine whether a given string is a palindrome (reads the same forwards and backwards).

### Requirements

- ✅ Ignore case sensitivity
- ✅ Ignore non-alphanumeric characters
- ✅ Handle empty strings
- ✅ Handle single character strings
- ✅ O(n) time complexity preferred

---

## Solution

```javascript
function isPalindrome(str) {
  // Clean the string: lowercase and remove non-alphanumeric
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Two-pointer approach
  let left = 0;
  let right = cleaned.length - 1;

  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

// Usage
isPalindrome("A man, a plan, a canal: Panama");  // true
isPalindrome("race a car");  // false
isPalindrome("Was it a car or a cat I saw?");  // true
```

---

## Alternative Solutions

### Using Array Reversal

```javascript
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const reversed = cleaned.split('').reverse().join('');
  return cleaned === reversed;
}
```

**Pros:**
- Simple and readable
- One-liner logic

**Cons:**
- O(n) extra space for reversed string
- Multiple array operations (split, reverse, join)
- Less efficient for large strings

### Recursive Approach

```javascript
function isPalindrome(str, left = 0, right = str.length - 1) {
  // Clean string only once
  if (left === 0 && right === str.length - 1) {
    str = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    right = str.length - 1;
  }

  // Base case
  if (left >= right) {
    return true;
  }

  // Compare characters
  if (str[left] !== str[right]) {
    return false;
  }

  // Recursive call
  return isPalindrome(str, left + 1, right - 1);
}
```

**Pros:**
- Elegant solution
- Good for demonstrating recursion understanding

**Cons:**
- Call stack overhead
- Risk of stack overflow on very long strings
- Less performant than iterative

### Using Array.every()

```javascript
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const length = cleaned.length;

  return cleaned.split('').every((char, index) => {
    return char === cleaned[length - 1 - index];
  });
}
```

**Pros:**
- Functional programming style
- Readable

**Cons:**
- Checks every character (doesn't short-circuit at midpoint)
- Less efficient than two-pointer

---

## Test Cases

```javascript
describe('isPalindrome', () => {
  test('returns true for simple palindrome', () => {
    expect(isPalindrome('racecar')).toBe(true);
  });

  test('returns true for palindrome with spaces', () => {
    expect(isPalindrome('race car')).toBe(true);
  });

  test('returns true for palindrome with mixed case', () => {
    expect(isPalindrome('RaceCar')).toBe(true);
  });

  test('returns true for palindrome with punctuation', () => {
    expect(isPalindrome('A man, a plan, a canal: Panama')).toBe(true);
  });

  test('returns false for non-palindrome', () => {
    expect(isPalindrome('hello')).toBe(false);
  });

  test('returns false for similar but not palindrome', () => {
    expect(isPalindrome('race a car')).toBe(false);
  });

  test('returns true for empty string', () => {
    expect(isPalindrome('')).toBe(true);
  });

  test('returns true for single character', () => {
    expect(isPalindrome('a')).toBe(true);
  });

  test('returns true for palindrome with numbers', () => {
    expect(isPalindrome('12321')).toBe(true);
  });

  test('returns true for alphanumeric palindrome', () => {
    expect(isPalindrome('A1B2B1A')).toBe(true);
  });

  test('handles special characters only', () => {
    expect(isPalindrome('!!!')).toBe(true);
  });
});
```

---

## Real-World Use Cases

### 1. Username Validation

```javascript
function isValidPalindromeUsername(username) {
  // Some systems restrict palindrome usernames
  const cleaned = username.toLowerCase();
  return !isPalindrome(cleaned);
}

console.log(isValidPalindromeUsername('anna')); // false (not valid)
console.log(isValidPalindromeUsername('john')); // true (valid)
```

### 2. DNA Sequence Analysis

```javascript
function isPalindromicSequence(dnaSequence) {
  // Palindromic sequences are important in genetics
  const validBases = dnaSequence.toUpperCase().replace(/[^ATCG]/g, '');
  return isPalindrome(validBases);
}

console.log(isPalindromicSequence('GAATTC')); // true
console.log(isPalindromicSequence('ATCGAT')); // false
```

### 3. Credit Card Validation (Partial)

```javascript
function hasPalindromicPattern(cardNumber) {
  // Flag suspicious palindromic patterns
  const digits = cardNumber.replace(/\D/g, '');
  const segments = [];

  for (let i = 0; i <= digits.length - 4; i++) {
    const segment = digits.substr(i, 4);
    if (isPalindrome(segment)) {
      segments.push(segment);
    }
  }

  return segments.length > 0 ? segments : null;
}

console.log(hasPalindromicPattern('1234-5665-7890-1234')); // ['5665']
```

### 4. Text Analysis Tool

```javascript
function findPalindromes(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];

  return words.filter(word => {
    return word.length > 2 && isPalindrome(word);
  });
}

const text = "Madam, I saw a racecar at noon level with the civic center";
console.log(findPalindromes(text));
// ['madam', 'racecar', 'noon', 'level', 'civic']
```

### 5. Password Strength Checker

```javascript
function checkPasswordStrength(password) {
  const warnings = [];

  // Warn if password is a palindrome
  if (isPalindrome(password)) {
    warnings.push('Password should not be a palindrome');
  }

  // Check for palindromic substrings
  for (let i = 0; i < password.length - 3; i++) {
    const substring = password.substr(i, 4);
    if (isPalindrome(substring)) {
      warnings.push('Contains palindromic pattern');
      break;
    }
  }

  return {
    isPalindrome: isPalindrome(password),
    warnings
  };
}
```

---

## Performance Optimization

### Optimized for Large Strings

```javascript
function isPalindromeFast(str) {
  // Single pass cleaning and checking
  const chars = [];

  // Clean while building array
  for (let i = 0; i < str.length; i++) {
    const char = str[i].toLowerCase();
    if ((char >= 'a' && char <= 'z') || (char >= '0' && char <= '9')) {
      chars.push(char);
    }
  }

  // Two-pointer comparison
  let left = 0;
  let right = chars.length - 1;

  while (left < right) {
    if (chars[left] !== chars[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}
```

### Early Exit Optimization

```javascript
function isPalindromeEarlyExit(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const length = cleaned.length;

  // Only need to check half the string
  const halfLength = Math.floor(length / 2);

  for (let i = 0; i < halfLength; i++) {
    if (cleaned[i] !== cleaned[length - 1 - i]) {
      return false; // Early exit on first mismatch
    }
  }

  return true;
}
```

---

## Common Mistakes

### ❌ Mistake 1: Not handling special characters

```javascript
// Wrong: Case-sensitive, includes spaces
function isPalindrome(str) {
  return str === str.split('').reverse().join('');
}

isPalindrome("Race Car"); // false (should be true)
```

### ✅ Correct: Clean the string first

```javascript
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}
```

### ❌ Mistake 2: Not optimizing the check

```javascript
// Wrong: Checks entire string instead of half
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] !== cleaned[cleaned.length - 1 - i]) {
      return false;
    }
  }
  return true;
}
```

### ✅ Correct: Only check half the string

```javascript
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const halfLength = Math.floor(cleaned.length / 2);

  for (let i = 0; i < halfLength; i++) {
    if (cleaned[i] !== cleaned[cleaned.length - 1 - i]) {
      return false;
    }
  }
  return true;
}
```

### ❌ Mistake 3: Creating unnecessary arrays

```javascript
// Wrong: Multiple array operations
function isPalindrome(str) {
  const arr = str.toLowerCase().split('');
  const filtered = arr.filter(c => /[a-z0-9]/.test(c));
  const reversed = [...filtered].reverse();
  return filtered.join('') === reversed.join('');
}
```

### ✅ Correct: Minimize array operations

```javascript
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = cleaned.length - 1;

  while (left < right) {
    if (cleaned[left++] !== cleaned[right--]) return false;
  }
  return true;
}
```

---

## Complexity Analysis

### Two-Pointer Approach (Recommended)
- **Time Complexity:** O(n) - single pass through string
- **Space Complexity:** O(n) - for cleaned string

### Array Reversal Approach
- **Time Complexity:** O(n) - split, reverse, join operations
- **Space Complexity:** O(n) - original + reversed arrays

### Recursive Approach
- **Time Complexity:** O(n) - n/2 recursive calls
- **Space Complexity:** O(n) - call stack depth

---

## Follow-Up Questions

1. **"How would you find the longest palindromic substring?"**
   - Use dynamic programming or expand around center approach
   - Track longest palindrome while checking substrings

2. **"Can you make it work with Unicode characters?"**
   - Use `String.prototype.normalize()` for Unicode normalization
   - Be careful with combining characters

3. **"What if spaces should be considered?"**
   - Remove only the `replace()` call for spaces
   - Keep case normalization

4. **"How would you handle very large strings efficiently?"**
   - Stream processing for strings that don't fit in memory
   - Early exit on first mismatch
   - Consider using character codes instead of strings

5. **"What about palindrome phrases (multiple words)?"**
   - Current solution already handles this
   - Remove all non-alphanumeric keeps word checking intact

---

## Related Problems

- `longestPalindromicSubstring` - Find longest palindrome in string
- `validPalindromeII` - Check if palindrome after removing one character
- `palindromeNumber` - Check if number is palindrome
- `palindromeLinkedList` - Check if linked list is palindrome
- `shortestPalindrome` - Find shortest palindrome by adding characters

---

[← Back to JavaScript Fundamentals](./README.md)
