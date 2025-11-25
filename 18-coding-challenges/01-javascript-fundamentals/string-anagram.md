# Check Anagram

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Amazon, Google, Microsoft, Meta, Apple, Netflix
**Time:** 15-20 minutes

---

## Problem Statement

Determine if two strings are anagrams of each other. An anagram is a word or phrase formed by rearranging the letters of another word or phrase, using all original letters exactly once.

### Requirements

- ✅ Ignore case sensitivity
- ✅ Ignore spaces and special characters (optional based on requirements)
- ✅ Handle empty strings
- ✅ Both strings must have same length after cleaning
- ✅ Each character must appear same number of times

---

## Solution

```javascript
function isAnagram(str1, str2) {
  // Clean and normalize strings
  const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const cleaned1 = clean(str1);
  const cleaned2 = clean(str2);

  // Quick length check
  if (cleaned1.length !== cleaned2.length) {
    return false;
  }

  // Count character frequencies
  const charCount = {};

  // Add characters from first string
  for (let char of cleaned1) {
    charCount[char] = (charCount[char] || 0) + 1;
  }

  // Subtract characters from second string
  for (let char of cleaned2) {
    if (!charCount[char]) {
      return false; // Character not in first string
    }
    charCount[char]--;
  }

  return true;
}

// Usage
isAnagram("listen", "silent");  // true
isAnagram("hello", "world");    // false
isAnagram("Astronomer", "Moon starer");  // true
```

---

## Alternative Solutions

### Using Sorting

```javascript
function isAnagram(str1, str2) {
  const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const sorted1 = clean(str1).split('').sort().join('');
  const sorted2 = clean(str2).split('').sort().join('');

  return sorted1 === sorted2;
}
```

**Pros:**
- Very simple and readable
- Easy to understand
- Less code

**Cons:**
- O(n log n) time complexity due to sorting
- Creates multiple intermediate arrays
- Less efficient for large strings

### Using Map

```javascript
function isAnagram(str1, str2) {
  const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const cleaned1 = clean(str1);
  const cleaned2 = clean(str2);

  if (cleaned1.length !== cleaned2.length) {
    return false;
  }

  const charMap1 = new Map();
  const charMap2 = new Map();

  // Build frequency maps
  for (let char of cleaned1) {
    charMap1.set(char, (charMap1.get(char) || 0) + 1);
  }

  for (let char of cleaned2) {
    charMap2.set(char, (charMap2.get(char) || 0) + 1);
  }

  // Compare maps
  if (charMap1.size !== charMap2.size) {
    return false;
  }

  for (let [char, count] of charMap1) {
    if (charMap2.get(char) !== count) {
      return false;
    }
  }

  return true;
}
```

**Pros:**
- Modern JavaScript (Map)
- Clear separation of concerns
- O(n) time complexity

**Cons:**
- More verbose
- Uses more memory (two maps)
- Overkill for simple cases

### Using Array (Character Code)

```javascript
function isAnagram(str1, str2) {
  const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const cleaned1 = clean(str1);
  const cleaned2 = clean(str2);

  if (cleaned1.length !== cleaned2.length) {
    return false;
  }

  // Assuming only lowercase letters (a-z)
  const count = new Array(26).fill(0);

  for (let i = 0; i < cleaned1.length; i++) {
    count[cleaned1.charCodeAt(i) - 97]++; // 'a' = 97
    count[cleaned2.charCodeAt(i) - 97]--;
  }

  return count.every(c => c === 0);
}
```

**Pros:**
- Very fast for lowercase letters only
- Fixed space O(26)
- Single pass

**Cons:**
- Only works for lowercase letters
- Less flexible
- Harder to understand

### Single Object Approach (Optimal)

```javascript
function isAnagram(str1, str2) {
  const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const cleaned1 = clean(str1);
  const cleaned2 = clean(str2);

  if (cleaned1.length !== cleaned2.length) {
    return false;
  }

  const charCount = {};

  // Single pass: increment for str1, decrement for str2
  for (let i = 0; i < cleaned1.length; i++) {
    const char1 = cleaned1[i];
    const char2 = cleaned2[i];

    charCount[char1] = (charCount[char1] || 0) + 1;
    charCount[char2] = (charCount[char2] || 0) - 1;
  }

  // All counts should be 0
  return Object.values(charCount).every(count => count === 0);
}
```

---

## Test Cases

```javascript
describe('isAnagram', () => {
  test('returns true for simple anagrams', () => {
    expect(isAnagram('listen', 'silent')).toBe(true);
  });

  test('returns true for anagrams with different case', () => {
    expect(isAnagram('Listen', 'Silent')).toBe(true);
  });

  test('returns true for anagrams with spaces', () => {
    expect(isAnagram('conversation', 'voices rant on')).toBe(true);
  });

  test('returns true for anagrams with punctuation', () => {
    expect(isAnagram('Astronomer', 'Moon starer!')).toBe(true);
  });

  test('returns false for non-anagrams', () => {
    expect(isAnagram('hello', 'world')).toBe(false);
  });

  test('returns false for different lengths', () => {
    expect(isAnagram('hello', 'helloworld')).toBe(false);
  });

  test('returns true for empty strings', () => {
    expect(isAnagram('', '')).toBe(true);
  });

  test('returns true for single character', () => {
    expect(isAnagram('a', 'a')).toBe(true);
  });

  test('returns false for single character mismatch', () => {
    expect(isAnagram('a', 'b')).toBe(false);
  });

  test('returns true for anagrams with numbers', () => {
    expect(isAnagram('abc123', '321cba')).toBe(true);
  });

  test('returns false for similar but not anagram', () => {
    expect(isAnagram('aabbcc', 'aabbc')).toBe(false);
  });

  test('handles repeated characters', () => {
    expect(isAnagram('aaaaaa', 'aaaaaa')).toBe(true);
    expect(isAnagram('aaaaaa', 'aaaaa')).toBe(false);
  });
});
```

---

## Real-World Use Cases

### 1. Word Game Validation

```javascript
function isValidWordPlay(word, tiles) {
  // Check if word can be formed from available tiles
  return isAnagram(word, tiles);
}

// Scrabble-like game
const availableTiles = "RSTLNE";
console.log(isValidWordPlay("LISTEN", availableTiles)); // true
console.log(isValidWordPlay("MASTER", availableTiles)); // false
```

### 2. Find All Anagrams in Array

```javascript
function groupAnagrams(words) {
  const groups = new Map();

  for (let word of words) {
    // Use sorted string as key
    const key = word.toLowerCase().split('').sort().join('');

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(word);
  }

  return Array.from(groups.values());
}

const words = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
console.log(groupAnagrams(words));
// [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
```

### 3. Anagram Detection in Search

```javascript
function findAnagramMatches(searchTerm, dictionary) {
  return dictionary.filter(word => isAnagram(searchTerm, word));
}

const dictionary = ['listen', 'silent', 'enlist', 'hello', 'world'];
console.log(findAnagramMatches('listen', dictionary));
// ['listen', 'silent', 'enlist']
```

### 4. Plagiarism Detection (Basic)

```javascript
function hasSuspiciousAnagrams(text1, text2) {
  const words1 = text1.toLowerCase().match(/\b\w+\b/g) || [];
  const words2 = text2.toLowerCase().match(/\b\w+\b/g) || [];

  const anagrams = [];

  for (let word1 of words1) {
    for (let word2 of words2) {
      if (word1.length > 3 && isAnagram(word1, word2) && word1 !== word2) {
        anagrams.push({ original: word1, anagram: word2 });
      }
    }
  }

  return anagrams;
}
```

### 5. Crossword Puzzle Helper

```javascript
function findPossibleWords(letters, wordList) {
  const sorted = letters.toLowerCase().split('').sort().join('');

  return wordList.filter(word => {
    const wordSorted = word.toLowerCase().split('').sort().join('');
    return wordSorted === sorted;
  });
}

const availableLetters = "ACER";
const dictionary = ["RACE", "CARE", "ACRE", "SCAR"];
console.log(findPossibleWords(availableLetters, dictionary));
// ["RACE", "CARE", "ACRE"]
```

---

## Performance Optimization

### Optimized for Multiple Comparisons

```javascript
// Pre-compute sorted representation for faster comparisons
class AnagramChecker {
  constructor(str) {
    this.original = str;
    this.normalized = this.normalize(str);
    this.sorted = this.normalized.split('').sort().join('');
  }

  normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  isAnagramOf(other) {
    if (typeof other === 'string') {
      other = new AnagramChecker(other);
    }
    return this.sorted === other.sorted;
  }
}

// Usage for multiple comparisons
const word = new AnagramChecker("listen");
console.log(word.isAnagramOf("silent")); // true
console.log(word.isAnagramOf("enlist")); // true
console.log(word.isAnagramOf("hello"));  // false
```

### Early Exit Optimization

```javascript
function isAnagramFast(str1, str2) {
  // Clean strings
  const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleaned1 = clean(str1);
  const cleaned2 = clean(str2);

  // Early exit: different lengths
  if (cleaned1.length !== cleaned2.length) {
    return false;
  }

  // Early exit: different character sets
  const set1 = new Set(cleaned1);
  const set2 = new Set(cleaned2);
  if (set1.size !== set2.size) {
    return false;
  }

  // Actual frequency check
  const charCount = {};
  for (let char of cleaned1) {
    charCount[char] = (charCount[char] || 0) + 1;
  }

  for (let char of cleaned2) {
    if (!charCount[char]) return false;
    charCount[char]--;
    if (charCount[char] < 0) return false;
  }

  return true;
}
```

---

## Common Mistakes

### ❌ Mistake 1: Not handling case sensitivity

```javascript
// Wrong: Case-sensitive comparison
function isAnagram(str1, str2) {
  const sorted1 = str1.split('').sort().join('');
  const sorted2 = str2.split('').sort().join('');
  return sorted1 === sorted2;
}

isAnagram("Listen", "Silent"); // false (should be true)
```

### ✅ Correct: Normalize case

```javascript
function isAnagram(str1, str2) {
  const sorted1 = str1.toLowerCase().split('').sort().join('');
  const sorted2 = str2.toLowerCase().split('').sort().join('');
  return sorted1 === sorted2;
}
```

### ❌ Mistake 2: Forgetting length check

```javascript
// Wrong: No length validation
function isAnagram(str1, str2) {
  const charCount = {};
  for (let char of str1) charCount[char] = (charCount[char] || 0) + 1;
  for (let char of str2) charCount[char]--;
  return Object.values(charCount).every(c => c === 0);
}

// This would incorrectly return true for different lengths
```

### ✅ Correct: Add length check

```javascript
function isAnagram(str1, str2) {
  if (str1.length !== str2.length) return false;
  // ... rest of logic
}
```

### ❌ Mistake 3: Not handling special characters consistently

```javascript
// Wrong: Inconsistent cleaning
function isAnagram(str1, str2) {
  str1 = str1.replace(/\s/g, ''); // Only removes spaces
  str2 = str2.toLowerCase(); // Only lowercases
  // ...
}
```

### ✅ Correct: Consistent cleaning

```javascript
function isAnagram(str1, str2) {
  const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  str1 = clean(str1);
  str2 = clean(str2);
  // ...
}
```

---

## Complexity Analysis

### Hash Map Approach (Recommended)
- **Time Complexity:** O(n) - two passes through strings
- **Space Complexity:** O(k) - k unique characters

### Sorting Approach
- **Time Complexity:** O(n log n) - due to sorting
- **Space Complexity:** O(n) - for sorted arrays

### Array Count Approach (Letters Only)
- **Time Complexity:** O(n) - single pass
- **Space Complexity:** O(1) - fixed array size (26)

---

## Follow-Up Questions

1. **"How would you find all anagrams of a word in a dictionary?"**
   - Use hash map with sorted string as key
   - Group all anagrams together
   - Return group containing target word

2. **"What if you need to check anagrams frequently?"**
   - Pre-compute and cache sorted representations
   - Use class-based approach for reusability
   - Consider using hash functions

3. **"How would you handle Unicode characters?"**
   - Use `String.prototype.normalize()` for Unicode
   - Be careful with combining characters
   - Consider using `Intl.Collator` for locale-aware comparison

4. **"Can you optimize for very long strings?"**
   - Early exit on length mismatch
   - Use character set comparison first
   - Consider streaming for strings that don't fit in memory

5. **"What about partial anagrams?"**
   - Check if all characters of smaller string exist in larger
   - Don't require exact count match
   - Useful for games like Scrabble

---

## Related Problems

- `groupAnagrams` - Group strings that are anagrams
- `findAnagrams` - Find all anagram substrings in a string
- `validAnagramII` - Check with wildcard characters
- `anagramSubstrings` - Count anagram substrings
- `minimumWindowSubstring` - Find minimum window containing all characters

---

[← Back to JavaScript Fundamentals](./README.md)
