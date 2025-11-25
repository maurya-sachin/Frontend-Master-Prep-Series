# Character Frequency Count

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Companies:** Amazon, Google, Microsoft, Meta, Bloomberg
**Time:** 10-15 minutes

---

## Problem Statement

Count the frequency of each character in a string and return an object/map with character counts.

### Requirements

- ✅ Count all characters (letters, numbers, symbols)
- ✅ Handle case sensitivity (optional based on requirements)
- ✅ Handle empty strings
- ✅ Return object with character as key and count as value
- ✅ O(n) time complexity

---

## Solution

```javascript
function characterCount(str) {
  const charFreq = {};

  for (let char of str) {
    charFreq[char] = (charFreq[char] || 0) + 1;
  }

  return charFreq;
}

// Usage
characterCount("hello");
// { h: 1, e: 1, l: 2, o: 1 }

characterCount("Hello World!");
// { H: 1, e: 1, l: 3, o: 2, ' ': 1, W: 1, r: 1, d: 1, '!': 1 }

characterCount("");
// {}
```

---

## Alternative Solutions

### Using Map (Modern)

```javascript
function characterCount(str) {
  const charFreq = new Map();

  for (let char of str) {
    charFreq.set(char, (charFreq.get(char) || 0) + 1);
  }

  return charFreq;
}

// Usage
const freq = characterCount("hello");
console.log(freq.get('l')); // 2
console.log(freq.has('h')); // true
console.log([...freq]); // [['h', 1], ['e', 1], ['l', 2], ['o', 1]]
```

**Pros:**
- Better performance for large datasets
- Preserves insertion order
- Methods like `has()`, `get()`, `delete()`
- Can use any type as key

**Cons:**
- Less familiar to some developers
- Requires conversion for JSON serialization

### Using reduce()

```javascript
function characterCount(str) {
  return str.split('').reduce((freq, char) => {
    freq[char] = (freq[char] || 0) + 1;
    return freq;
  }, {});
}
```

**Pros:**
- Functional programming style
- Concise one-liner logic
- Immutable approach possible

**Cons:**
- Less readable for beginners
- Creates intermediate array
- Slightly less performant

### Case-Insensitive Version

```javascript
function characterCountCaseInsensitive(str) {
  const charFreq = {};

  for (let char of str.toLowerCase()) {
    charFreq[char] = (charFreq[char] || 0) + 1;
  }

  return charFreq;
}

// Usage
characterCountCaseInsensitive("Hello World");
// { h: 1, e: 1, l: 3, o: 2, ' ': 1, w: 1, r: 1, d: 1 }
```

### Letters Only (Ignore Special Characters)

```javascript
function characterCountLettersOnly(str) {
  const charFreq = {};

  for (let char of str) {
    // Only count letters
    if (/[a-zA-Z]/.test(char)) {
      const lowerChar = char.toLowerCase();
      charFreq[lowerChar] = (charFreq[lowerChar] || 0) + 1;
    }
  }

  return charFreq;
}

// Usage
characterCountLettersOnly("Hello World! 123");
// { h: 1, e: 1, l: 3, o: 2, w: 1, r: 1, d: 1 }
```

### Using Array for Lowercase Letters (Optimal)

```javascript
function characterCountArray(str) {
  // For lowercase letters only (a-z)
  const freq = new Array(26).fill(0);

  for (let char of str.toLowerCase()) {
    const code = char.charCodeAt(0);
    if (code >= 97 && code <= 122) { // a-z
      freq[code - 97]++;
    }
  }

  // Convert back to object
  const result = {};
  for (let i = 0; i < 26; i++) {
    if (freq[i] > 0) {
      result[String.fromCharCode(i + 97)] = freq[i];
    }
  }

  return result;
}
```

**Pros:**
- Very fast for lowercase letters
- Fixed space complexity O(26)
- Cache-friendly

**Cons:**
- Limited to lowercase letters
- More complex code
- Less flexible

---

## Test Cases

```javascript
describe('characterCount', () => {
  test('counts characters in simple string', () => {
    expect(characterCount('hello')).toEqual({
      h: 1, e: 1, l: 2, o: 1
    });
  });

  test('handles empty string', () => {
    expect(characterCount('')).toEqual({});
  });

  test('handles single character', () => {
    expect(characterCount('a')).toEqual({ a: 1 });
  });

  test('handles repeated characters', () => {
    expect(characterCount('aaaa')).toEqual({ a: 4 });
  });

  test('handles mixed case', () => {
    expect(characterCount('AaBbCc')).toEqual({
      A: 1, a: 1, B: 1, b: 1, C: 1, c: 1
    });
  });

  test('counts spaces and special characters', () => {
    expect(characterCount('hello world!')).toEqual({
      h: 1, e: 1, l: 3, o: 2, ' ': 1, w: 1, r: 1, d: 1, '!': 1
    });
  });

  test('handles numbers', () => {
    expect(characterCount('abc123')).toEqual({
      a: 1, b: 1, c: 1, '1': 1, '2': 1, '3': 1
    });
  });

  test('handles unicode characters', () => {
    expect(characterCount('hello🌍')).toEqual({
      h: 1, e: 1, l: 2, o: 1, '🌍': 1
    });
  });
});
```

---

## Real-World Use Cases

### 1. Text Analysis

```javascript
function analyzeText(text) {
  const freq = characterCount(text.toLowerCase());

  // Find most common character
  const mostCommon = Object.entries(freq)
    .filter(([char]) => /[a-z]/.test(char)) // Letters only
    .sort((a, b) => b[1] - a[1])[0];

  return {
    totalChars: text.length,
    uniqueChars: Object.keys(freq).length,
    mostCommon: mostCommon ? {
      char: mostCommon[0],
      count: mostCommon[1]
    } : null,
    frequencies: freq
  };
}

const analysis = analyzeText("The quick brown fox jumps over the lazy dog");
console.log(analysis);
// { totalChars: 44, uniqueChars: 27, mostCommon: { char: 'o', count: 4 }, ... }
```

### 2. Password Strength Checker

```javascript
function checkPasswordStrength(password) {
  const freq = characterCount(password);

  const hasLowercase = Object.keys(freq).some(c => /[a-z]/.test(c));
  const hasUppercase = Object.keys(freq).some(c => /[A-Z]/.test(c));
  const hasNumber = Object.keys(freq).some(c => /[0-9]/.test(c));
  const hasSpecial = Object.keys(freq).some(c => /[^a-zA-Z0-9]/.test(c));

  // Check for repeated characters
  const maxRepeat = Math.max(...Object.values(freq));
  const hasRepeatedChars = maxRepeat > 2;

  let strength = 0;
  if (hasLowercase) strength++;
  if (hasUppercase) strength++;
  if (hasNumber) strength++;
  if (hasSpecial) strength++;
  if (password.length >= 8) strength++;
  if (!hasRepeatedChars) strength++;

  return {
    strength: ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength],
    score: strength,
    suggestions: []
  };
}
```

### 3. Detect Duplicates

```javascript
function findDuplicateCharacters(str) {
  const freq = characterCount(str);

  return Object.entries(freq)
    .filter(([char, count]) => count > 1)
    .map(([char, count]) => ({ char, count }));
}

console.log(findDuplicateCharacters("programming"));
// [{ char: 'g', count: 2 }, { char: 'r', count: 2 }, { char: 'm', count: 2 }]
```

### 4. Histogram Visualization

```javascript
function createHistogram(str) {
  const freq = characterCount(str.toLowerCase());

  // Filter letters only and sort by frequency
  const sorted = Object.entries(freq)
    .filter(([char]) => /[a-z]/.test(char))
    .sort((a, b) => b[1] - a[1]);

  // Create visual histogram
  console.log('\nCharacter Frequency:');
  sorted.forEach(([char, count]) => {
    const bar = '█'.repeat(count);
    console.log(`${char}: ${bar} (${count})`);
  });
}

createHistogram("hello world");
// Character Frequency:
// l: ███ (3)
// o: ██ (2)
// h: █ (1)
// e: █ (1)
// w: █ (1)
// r: █ (1)
// d: █ (1)
```

### 5. Spell Checker (Basic)

```javascript
function findSuspiciousWords(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const suspicious = [];

  for (let word of words) {
    const freq = characterCount(word);
    const maxRepeat = Math.max(...Object.values(freq));

    // Flag words with 3+ consecutive same letters
    if (maxRepeat >= 3) {
      suspicious.push({
        word,
        reason: `Character repeated ${maxRepeat} times`
      });
    }
  }

  return suspicious;
}

console.log(findSuspiciousWords("I looove programming soooo much!"));
// [{ word: 'looove', reason: 'Character repeated 4 times' }, ...]
```

### 6. Anagram Detector Helper

```javascript
function canFormAnagram(str1, str2) {
  const freq1 = characterCount(str1.toLowerCase());
  const freq2 = characterCount(str2.toLowerCase());

  // Check if freq2 is subset of freq1
  for (let char in freq2) {
    if ((freq1[char] || 0) < freq2[char]) {
      return false;
    }
  }

  return true;
}

console.log(canFormAnagram("listen", "silent")); // true
console.log(canFormAnagram("hello", "billion")); // false
```

---

## Performance Optimization

### Optimized for Large Strings

```javascript
function characterCountOptimized(str) {
  const freq = {};
  const len = str.length;

  // Use traditional for loop (faster than for...of)
  for (let i = 0; i < len; i++) {
    const char = str[i];
    freq[char] = (freq[char] || 0) + 1;
  }

  return freq;
}
```

### With Filtering

```javascript
function characterCountFiltered(str, filter = (char) => true) {
  const freq = {};

  for (let char of str) {
    if (filter(char)) {
      freq[char] = (freq[char] || 0) + 1;
    }
  }

  return freq;
}

// Usage: Count only letters
const lettersOnly = characterCountFiltered(
  "Hello World! 123",
  char => /[a-zA-Z]/.test(char)
);

// Usage: Count only alphanumeric
const alphanumeric = characterCountFiltered(
  "Hello World! 123",
  char => /[a-zA-Z0-9]/.test(char)
);
```

---

## Common Mistakes

### ❌ Mistake 1: Not initializing count

```javascript
// Wrong: Will get NaN
function characterCount(str) {
  const freq = {};
  for (let char of str) {
    freq[char]++; // NaN if undefined
  }
  return freq;
}
```

### ✅ Correct: Initialize or use default

```javascript
function characterCount(str) {
  const freq = {};
  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  return freq;
}
```

### ❌ Mistake 2: Mutating input

```javascript
// Wrong: Modifies original string
function characterCount(str) {
  str = str.toLowerCase(); // Mutates parameter (bad practice)
  // ...
}
```

### ✅ Correct: Work with copy

```javascript
function characterCount(str, caseInsensitive = false) {
  const normalized = caseInsensitive ? str.toLowerCase() : str;
  // ...
}
```

### ❌ Mistake 3: Using split unnecessarily

```javascript
// Wrong: Creates unnecessary array
function characterCount(str) {
  const freq = {};
  str.split('').forEach(char => {
    freq[char] = (freq[char] || 0) + 1;
  });
  return freq;
}
```

### ✅ Correct: Iterate directly

```javascript
function characterCount(str) {
  const freq = {};
  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  return freq;
}
```

---

## Complexity Analysis

### Hash Map Approach (Recommended)
- **Time Complexity:** O(n) - single pass through string
- **Space Complexity:** O(k) - k unique characters

### Array Approach (Letters Only)
- **Time Complexity:** O(n) - single pass through string
- **Space Complexity:** O(1) - fixed array size (26)

---

## Follow-Up Questions

1. **"How would you find the first non-repeating character?"**
   - Build frequency map
   - Iterate through original string
   - Return first character with count === 1

2. **"What if you need to find the kth most frequent character?"**
   - Use heap or priority queue
   - Sort by frequency
   - Return kth element

3. **"How would you handle streaming data?"**
   - Maintain running frequency map
   - Update as new characters arrive
   - Use sliding window for fixed-size analysis

4. **"Can you optimize for memory with very large strings?"**
   - Stream processing
   - Use fixed-size array for known character set
   - Consider approximate counting (Count-Min Sketch)

5. **"What about Unicode and emoji?"**
   - JavaScript handles this naturally with for...of
   - Be aware of combining characters
   - Consider using `Array.from()` for accurate count

---

## Related Problems

- `firstUniqueCharacter` - Find first non-repeating character
- `kthMostFrequent` - Find kth most frequent element
- `sortCharactersByFrequency` - Sort string by character frequency
- `isAnagram` - Check if two strings are anagrams
- `groupAnagrams` - Group strings by anagram

---

[← Back to JavaScript Fundamentals](./README.md)
