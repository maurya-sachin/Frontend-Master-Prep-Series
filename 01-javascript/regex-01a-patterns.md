# Regular Expressions - Patterns & Syntax

> **Focus**: JavaScript Regular Expressions fundamentals and practical patterns

---

## Question 1: What are Regular Expressions in JavaScript and how do you use them?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Amazon, Microsoft, Meta

### Question

Explain what Regular Expressions are in JavaScript. How do you create them? What are the different regex methods available (test, exec, match, replace, search)? What are regex flags and how do they work? When should you use regex versus string methods?

### Answer

**Regular Expressions (regex)** are patterns used to match character combinations in strings. They provide a powerful and concise way to search, validate, and manipulate text data in JavaScript.

#### Creating Regular Expressions

There are two ways to create regex patterns:

1. **Literal Notation** (preferred for static patterns):
```javascript
const pattern = /hello/i;
```

2. **Constructor Function** (for dynamic patterns):
```javascript
const pattern = new RegExp('hello', 'i');
```

#### Regex Methods

JavaScript provides several methods for working with regular expressions:

1. **`test()`** - Returns `true` if pattern matches, `false` otherwise
2. **`exec()`** - Returns array with match details or `null`
3. **`match()`** - String method that returns matches or `null`
4. **`matchAll()`** - Returns iterator of all matches (with groups)
5. **`replace()`** - Replaces first match
6. **`replaceAll()`** - Replaces all matches
7. **`search()`** - Returns index of first match or `-1`
8. **`split()`** - Splits string by pattern

#### Regex Flags

Flags modify how the regex engine processes patterns:

- **`g`** (global) - Find all matches, not just first
- **`i`** (case-insensitive) - Ignore case
- **`m`** (multiline) - `^` and `$` match line boundaries
- **`s`** (dotAll) - `.` matches newlines
- **`u`** (unicode) - Enable full unicode support
- **`y`** (sticky) - Match from `lastIndex` position only

#### When to Use Regex vs String Methods

**Use Regex when:**
- Pattern matching with wildcards or alternatives
- Validating complex formats (email, phone, URL)
- Extracting structured data
- Advanced text transformations

**Use String methods when:**
- Simple exact string matching
- Performance is critical for simple operations
- Code readability is more important
- Working with fixed strings

### Code Example

```javascript
// ============================================
// Creating Regular Expressions
// ============================================

// Literal notation (preferred for static patterns)
const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

// Constructor (for dynamic patterns)
const searchTerm = 'hello';
const dynamicPattern = new RegExp(searchTerm, 'gi');

// Dynamic pattern with escaping special characters
const userInput = 'test.example';
const safePattern = new RegExp(userInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

// ============================================
// test() - Check if pattern matches
// ============================================

const phonePattern = /^\d{3}-\d{3}-\d{4}$/;

console.log(phonePattern.test('555-123-4567')); // true
console.log(phonePattern.test('555-123-456'));  // false

// ❌ Common mistake: test() with global flag has stateful lastIndex
const statefulPattern = /test/g;
console.log(statefulPattern.test('test test')); // true
console.log(statefulPattern.test('test test')); // true (starts from lastIndex)
console.log(statefulPattern.test('test test')); // false (no match after lastIndex)

// ✅ Reset lastIndex or avoid global flag with test()
statefulPattern.lastIndex = 0; // Reset
console.log(statefulPattern.test('test test')); // true

// ============================================
// exec() - Extract match details
// ============================================

const datePattern = /(\d{4})-(\d{2})-(\d{2})/;
const result = datePattern.exec('Date: 2024-03-15');

console.log(result[0]); // '2024-03-15' (full match)
console.log(result[1]); // '2024' (first group)
console.log(result[2]); // '03' (second group)
console.log(result[3]); // '15' (third group)
console.log(result.index); // 6 (match position)

// exec() with global flag - iterative matching
const globalPattern = /\d+/g;
const text = 'I have 10 apples and 20 oranges';
let match;

while ((match = globalPattern.exec(text)) !== null) {
  console.log(`Found ${match[0]} at index ${match.index}`);
}
// Output:
// Found 10 at index 7
// Found 20 at index 21

// ============================================
// match() - String method for matching
// ============================================

const sentence = 'The quick brown fox jumps over the lazy dog';

// Without global flag - returns first match with groups
const singleMatch = sentence.match(/quick (\w+)/);
console.log(singleMatch[0]); // 'quick brown'
console.log(singleMatch[1]); // 'brown'

// With global flag - returns all matches (no groups)
const allWords = sentence.match(/\b\w{4}\b/g);
console.log(allWords); // ['quick', 'brown', 'jumps', 'over', 'lazy']

// ============================================
// matchAll() - Get all matches with groups
// ============================================

const htmlTags = '<div>Hello</div><span>World</span>';
const tagPattern = /<(\w+)>([^<]+)<\/\1>/g;

for (const match of htmlTags.matchAll(tagPattern)) {
  console.log(`Tag: ${match[1]}, Content: ${match[2]}`);
}
// Output:
// Tag: div, Content: Hello
// Tag: span, Content: World

// Convert to array
const matches = [...htmlTags.matchAll(tagPattern)];
console.log(matches.length); // 2

// ============================================
// replace() and replaceAll()
// ============================================

const message = 'Hello World, hello universe';

// replace() - replaces first match only
const replaced = message.replace(/hello/i, 'Hi');
console.log(replaced); // 'Hi World, hello universe'

// replaceAll() - replaces all matches
const replacedAll = message.replaceAll(/hello/gi, 'Hi');
console.log(replacedAll); // 'Hi World, Hi universe'

// Using capture groups in replacement
const names = 'John Doe, Jane Smith';
const swapped = names.replace(/(\w+) (\w+)/g, '$2, $1');
console.log(swapped); // 'Doe, John, Smith, Jane'

// Replace with function
const masked = 'My credit card is 1234-5678-9012-3456'.replace(
  /\d{4}-\d{4}-\d{4}-(\d{4})/,
  (match, last4) => `****-****-****-${last4}`
);
console.log(masked); // 'My credit card is ****-****-****-3456'

// ============================================
// search() - Find index of first match
// ============================================

const searchText = 'The price is $99.99';
const priceIndex = searchText.search(/\$\d+\.\d{2}/);
console.log(priceIndex); // 13

// Returns -1 if not found
console.log(searchText.search(/€\d+/)); // -1

// ============================================
// split() - Split string by pattern
// ============================================

const csv = 'apple,banana,  orange  ,   grape';

// Split by comma with optional whitespace
const fruits = csv.split(/\s*,\s*/);
console.log(fruits); // ['apple', 'banana', 'orange', 'grape']

// Split and keep separators using capture groups
const equation = '10+20-5*2';
const tokens = equation.split(/([+\-*/])/);
console.log(tokens); // ['10', '+', '20', '-', '5', '*', '2']

// ============================================
// Regex Flags Examples
// ============================================

// g (global) - Find all matches
const textWithNumbers = 'I have 10 apples, 20 oranges, and 30 bananas';
console.log(textWithNumbers.match(/\d+/));   // ['10'] (first match only)
console.log(textWithNumbers.match(/\d+/g));  // ['10', '20', '30'] (all matches)

// i (case-insensitive)
const caseText = 'Hello HELLO hello';
console.log(caseText.match(/hello/g));   // ['hello']
console.log(caseText.match(/hello/gi));  // ['Hello', 'HELLO', 'hello']

// m (multiline) - ^ and $ match line boundaries
const multiline = `line1
line2
line3`;

console.log(multiline.match(/^line/g));   // ['line'] (start of string)
console.log(multiline.match(/^line/gm));  // ['line', 'line', 'line'] (each line)

// s (dotAll) - . matches newlines
const withNewline = 'hello\nworld';
console.log(withNewline.match(/hello.world/));   // null (. doesn't match \n)
console.log(withNewline.match(/hello.world/s));  // ['hello\nworld']

// u (unicode) - Full unicode support
const emoji = '😀🎉';
console.log(emoji.match(/./g));   // ['�', '�', '�', '�'] (broken surrogates)
console.log(emoji.match(/./gu));  // ['😀', '🎉'] (correct)

// y (sticky) - Match from lastIndex only
const stickyPattern = /\d+/y;
const stickyText = '123 456 789';

stickyPattern.lastIndex = 0;
console.log(stickyPattern.exec(stickyText)); // ['123'] (from index 0)

stickyPattern.lastIndex = 4;
console.log(stickyPattern.exec(stickyText)); // ['456'] (from index 4)

stickyPattern.lastIndex = 5;
console.log(stickyPattern.exec(stickyText)); // null (no match at index 5)

// ============================================
// Common Validation Patterns
// ============================================

// Email validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
console.log(emailRegex.test('user@example.com')); // true
console.log(emailRegex.test('invalid.email'));    // false

// Phone number (US format)
const phoneRegex = /^(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
console.log(phoneRegex.test('555-123-4567'));    // true
console.log(phoneRegex.test('(555) 123-4567'));  // true
console.log(phoneRegex.test('+1-555-123-4567')); // true

// URL validation
const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
console.log(urlRegex.test('https://example.com')); // true
console.log(urlRegex.test('http://sub.example.com/path?query=value')); // true

// ============================================
// ❌ Bad Patterns vs ✅ Good Patterns
// ============================================

// ❌ Inefficient: Catastrophic backtracking
const badPattern = /^(a+)+$/;
// This pattern will freeze on: 'aaaaaaaaaaaaaaaaaaaaaaaaaaab'

// ✅ Efficient: No backtracking
const goodPattern = /^a+$/;

// ❌ Forgetting to escape special characters
const badSearch = new RegExp('example.com'); // Matches 'exampleXcom'

// ✅ Properly escaped
const goodSearch = new RegExp('example\\.com'); // Matches 'example.com' only

// ❌ Using global flag with test() (stateful)
const badTest = /\d+/g;
badTest.test('123'); // true
badTest.test('123'); // false (lastIndex moved)

// ✅ Avoid global flag with test()
const goodTest = /\d+/;
goodTest.test('123'); // true
goodTest.test('123'); // true (consistent)

// ❌ Not handling null from match()
const badMatch = 'hello'.match(/\d+/).length; // TypeError: Cannot read property 'length' of null

// ✅ Safe null handling
const goodMatch = 'hello'.match(/\d+/)?.length ?? 0; // 0

// ============================================
// Performance Considerations
// ============================================

// For simple operations, string methods are faster
const perfText = 'Find the word test in this text';

// ❌ Slower: Using regex for simple search
console.time('regex');
/test/.test(perfText);
console.timeEnd('regex'); // ~0.05ms

// ✅ Faster: Using string method
console.time('includes');
perfText.includes('test');
console.timeEnd('includes'); // ~0.01ms

// But regex is better for complex patterns
const complexText = 'Emails: user@example.com, admin@test.org';

// ✅ Regex excels at pattern matching
const emails = complexText.match(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi);
console.log(emails); // ['user@example.com', 'admin@test.org']
```


<details>
<summary><strong>🔍 Deep Dive: Regex Engine Internals: NFA vs DFA</strong></summary>


#### Regex Engine Internals: NFA vs DFA

JavaScript uses a **Nondeterministic Finite Automaton (NFA)** regex engine with backtracking, similar to most programming languages. Understanding this is crucial for writing efficient patterns.

**NFA Characteristics:**
- Text-directed: Scans through pattern for each character
- Supports backreferences and capture groups
- Can experience catastrophic backtracking
- Memory efficient but potentially slower

**Example of NFA Backtracking:**
```javascript
// Pattern: /a.*b/ against text "axxxc"
// 1. 'a' matches, .* tries to consume "xxxc"
// 2. No 'b' found at end, backtrack
// 3. .* releases 'c', tries again
// 4. No 'b', backtrack again
// 5. Eventually fails after trying all possibilities
```

**DFA (Deterministic Finite Automaton):**
- Pattern-directed: Processes each character once
- No backtracking, always linear time O(n)
- Cannot support backreferences
- More memory intensive
- Used in tools like `grep -F`, `awk`

**Why JavaScript Uses NFA:**
1. **Feature richness**: Backreferences, capture groups, lookarounds
2. **Flexibility**: Dynamic patterns, complex replacements
3. **Memory efficiency**: DFA state explosion for complex patterns
4. **Standard compliance**: Matches ECMAScript specification

#### V8 Regex Engine: Irregexp

V8 (Chrome/Node.js) uses **Irregexp** (Irregular Expressions), a hybrid approach:

```javascript
// Irregexp compilation strategies:

// 1. Interpreted mode (simple patterns)
/abc/.test('abcd'); // Bytecode interpreter

// 2. Native code compilation (hot patterns)
const pattern = /complex(pattern)+/;
for (let i = 0; i < 10000; i++) {
  pattern.test(text); // Compiles to native after ~100 iterations
}

// 3. Irregexp optimizations:
// - Specialized bytecode instructions
// - Boyer-Moore for literal strings
// - Quick checks before full matching
// - Inline caching for common patterns
```

**Performance Characteristics:**
- Cold pattern (first use): ~100-500 CPU cycles
- Hot pattern (compiled): ~10-50 CPU cycles
- Compilation threshold: ~100 executions
- Memory overhead: ~2KB per compiled pattern

#### Catastrophic Backtracking (ReDoS)

The most critical regex performance issue:

```javascript
// ❌ DANGEROUS: Exponential time complexity
const vulnerable = /^(a+)+$/;

// Testing against: 'aaaaaaaaaaaaaaaaaaaaaaaab'
// Backtracking steps: 2^n (exponential!)
// 20 'a's: 1,048,576 steps
// 25 'a's: 33,554,432 steps (seconds)
// 30 'a's: 1,073,741,824 steps (freeze!)

// Why? Each (a+)+ can match in multiple ways:
// 'aaa' = a|aa|aaa × a|aa|aaa × ... (multiplicative combinations)

// ✅ SAFE: Linear time complexity
const safe = /^a+$/; // Single path, no alternatives

// ✅ SAFE: Atomic grouping simulation
const safer = /^(?:a+)*$/; // Non-capturing, but still vulnerable

// ✅ BEST: Possessive quantifier simulation
const safest = /^a*$/; // Simplest solution
```

**Detecting Vulnerable Patterns:**
1. Nested quantifiers: `(a+)+`, `(a*)*`, `(a+)*`
2. Overlapping alternatives: `(a|a)+`, `(a|ab)+`
3. Adjacent repetitions: `.*.*`, `.+.+`

**Safe Pattern Rules:**
```javascript
// Rule 1: Avoid nested quantifiers
// ❌ /(a+)+/
// ✅ /a+/

// Rule 2: Make alternatives mutually exclusive
// ❌ /(a|ab)+/
// ✅ /(ab|a)+/ (longer first) or /(a(?:b)?)+/

// Rule 3: Use atomic groups (simulate with lookahead)
// ❌ /.*foo/
// ✅ /(?:[^f]|f(?!oo))*foo/ (atomic-like)

// Rule 4: Set input length limits
function safeRegexTest(pattern, text, maxLength = 1000) {
  if (text.length > maxLength) {
    throw new Error('Input too long for pattern');
  }
  return pattern.test(text);
}
```

#### Unicode Handling and Surrogate Pairs

JavaScript strings are UTF-16 encoded, causing issues with characters outside the Basic Multilingual Plane (BMP):

```javascript
// Emoji = 2 code units (surrogate pair)
const emoji = '😀'; // U+1F600

// ❌ Without unicode flag
console.log(emoji.length);              // 2 (not 1!)
console.log(/^.$/.test(emoji));         // false (. matches 1 code unit)
console.log(/^..$/.test(emoji));        // true (matches 2 code units)
console.log(emoji.match(/./g).length);  // 2 (broken into surrogates)

// ✅ With unicode flag
console.log(/^.$/u.test(emoji));        // true (. matches 1 code point)
console.log(emoji.match(/./gu).length); // 1 (correct)

// Unicode property escapes (require u flag)
const mixedText = 'Hello123привет你好😀';

// Match all letters (any language)
console.log(mixedText.match(/\p{L}+/gu));
// ['Hello', 'привет', '你好']

// Match all numbers
console.log(mixedText.match(/\p{N}+/gu));
// ['123']

// Match all emoji
console.log(mixedText.match(/\p{Emoji}/gu));
// ['😀']

// Categories available:
// \p{L}  - Letters
// \p{N}  - Numbers
// \p{P}  - Punctuation
// \p{S}  - Symbols
// \p{M}  - Marks
// \p{Z}  - Separators
// \p{Emoji} - Emoji characters
```

**Memory Impact:**
- Without `u` flag: Pattern compiles for UTF-16 code units
- With `u` flag: Pattern compiles for Unicode code points (larger state machine)
- Unicode properties: Additional lookup tables loaded (~50KB)

#### Sticky Flag Behavior

The `y` flag provides different semantics from `g`:

```javascript
const text = '  abc  def  ';

// Global flag: Searches from lastIndex forward
const globalPattern = /\w+/g;
console.log(globalPattern.exec(text)); // ['abc'] at index 2
console.log(globalPattern.exec(text)); // ['def'] at index 7

// Sticky flag: Must match exactly at lastIndex
const stickyPattern = /\w+/y;
console.log(stickyPattern.exec(text)); // null (whitespace at index 0)

stickyPattern.lastIndex = 2;
console.log(stickyPattern.exec(text)); // ['abc'] (matches at index 2)

stickyPattern.lastIndex = 7;
console.log(stickyPattern.exec(text)); // ['def'] (matches at index 7)
```

**Use Cases for Sticky Flag:**
1. **Tokenizers/Parsers**: Match sequential tokens without gaps
2. **State machines**: Ensure patterns match at specific positions
3. **Performance**: Avoids unnecessary searching when position is known

```javascript
// Tokenizer example
function* tokenize(text) {
  const patterns = [
    { type: 'NUMBER', regex: /\d+/y },
    { type: 'OPERATOR', regex: /[+\-*/]/y },
    { type: 'WHITESPACE', regex: /\s+/y }
  ];

  let pos = 0;
  while (pos < text.length) {
    let matched = false;

    for (const { type, regex } of patterns) {
      regex.lastIndex = pos;
      const match = regex.exec(text);

      if (match) {
        if (type !== 'WHITESPACE') {
          yield { type, value: match[0], pos };
        }
        pos = regex.lastIndex;
        matched = true;
        break;
      }
    }

    if (!matched) {
      throw new Error(`Unexpected character at ${pos}`);
    }
  }
}

// Usage
const tokens = [...tokenize('10 + 20 * 5')];
console.log(tokens);
// [
//   { type: 'NUMBER', value: '10', pos: 0 },
//   { type: 'OPERATOR', value: '+', pos: 3 },
//   { type: 'NUMBER', value: '20', pos: 5 },
//   { type: 'OPERATOR', value: '*', pos: 8 },
//   { type: 'NUMBER', value: '5', pos: 10 }
// ]
```

#### Comparison with Other Languages

JavaScript regex vs other implementations:

| Feature | JavaScript | Python | Java | PCRE |
|---------|-----------|--------|------|------|
| Engine | NFA | NFA | NFA/DFA | NFA |
| Backreferences | ✅ | ✅ | ✅ | ✅ |
| Lookahead | ✅ | ✅ | ✅ | ✅ |
| Lookbehind | ✅ (ES2018) | ✅ | ✅ | ✅ |
| Possessive quantifiers | ❌ | ❌ | ✅ | ✅ |
| Atomic groups | ❌ | ❌ | ✅ | ✅ |
| Unicode properties | ✅ (ES2018) | ✅ | ✅ | ✅ |
| Named groups | ✅ (ES2018) | ✅ | ✅ | ✅ |
| Conditionals | ❌ | ✅ | ❌ | ✅ |

**Key Differences:**
```javascript
// JavaScript lacks possessive quantifiers
// ❌ Cannot write: /a++/ (possessive)
// ✅ Must simulate: /(?=(a+))\1/

// JavaScript lacks atomic groups
// ❌ Cannot write: /(?>a+)b/
// ✅ Must simulate: /(?=(a+))(?!\1.+b)b/

// But JavaScript has sticky flag (unique)
// ✅ /pattern/y (not in most other languages)
```


</details>


<details>
<summary><strong>🐛 Real-World Scenario: Context: E-commerce Search Feature Causing Page Freezes</strong></summary>


#### Context: E-commerce Search Feature Causing Page Freezes

**Company:** Mid-size e-commerce platform (500K monthly users)
**Team:** Frontend team (4 developers)
**Timeline:** Bug discovered in production, 3-day investigation and fix

#### Problem Discovery

User complaints started coming in:
- "Search page freezes when I type certain queries"
- "Browser becomes unresponsive, have to force quit"
- "Searching for product names crashes the tab"

**Initial Metrics:**
- Affected users: ~2.3% (11,500 users/month)
- Average freeze duration: 15-23 seconds
- Browser crash rate: 34% of affected searches
- Peak CPU usage: 99.9% during freeze

#### Investigation Process

**Step 1: Reproduce the Issue**
```javascript
// QA team found specific search queries triggering freeze
const problematicQueries = [
  'aaaaaaaaaaaaaaaaaaaaab',
  'product-name-with-lots-of-dashes---------------x',
  'user+entered+++++++++++++query'
];
```

**Step 2: Chrome DevTools Performance Profiling**
```
Performance recording showed:
- Main thread blocked: 18,456ms
- Single function: validateSearchQuery()
- Self time: 99.8% of total time
- Call stack: RegExp.prototype.test() executing
```

**Step 3: Code Review**

Found the culprit in `SearchBar.jsx`:
```javascript
// ❌ VULNERABLE CODE
function validateSearchQuery(query) {
  // Regex to validate: alphanumeric, spaces, hyphens, plus signs
  const pattern = /^([a-zA-Z0-9\s\-+]+)+$/;

  if (!pattern.test(query)) {
    showError('Invalid search query format');
    return false;
  }

  return true;
}

// Called on every keystroke
<input
  onChange={(e) => {
    if (validateSearchQuery(e.target.value)) {
      performSearch(e.target.value);
    }
  }}
/>
```

**Step 4: Identify Root Cause**

The pattern `/^([a-zA-Z0-9\s\-+]+)+$/` exhibits **catastrophic backtracking**:

```javascript
// Testing: 'aaaaaaaaaaaaaaaaab'
// Inner ([a-zA-Z0-9\s\-+]+) can match in multiple ways:
// - All 18 'a's at once
// - 17 'a's, then 1 'a'
// - 16 'a's, then 2 'a's
// - ... (millions of combinations)
// Outer + tries each combination when 'b' doesn't match

// Backtracking steps calculation:
// For n characters: approximately 2^n attempts
// 20 chars = 1,048,576 operations
// 25 chars = 33,554,432 operations (seconds)
// 30 chars = 1,073,741,824 operations (freeze!)
```

**Step 5: Measure Performance Impact**

```javascript
// Performance test harness
const testQueries = [
  'normal',
  'aaaaaaaaaa',
  'aaaaaaaaaaaaaaaa',
  'aaaaaaaaaaaaaaaaaaaaab', // 20 chars
  'aaaaaaaaaaaaaaaaaaaaaaaaaab' // 25 chars
];

function measureRegexPerformance(pattern, text) {
  const start = performance.now();
  const timeout = setTimeout(() => {
    throw new Error('Regex timeout - potential ReDoS');
  }, 1000);

  pattern.test(text);
  clearTimeout(timeout);

  const duration = performance.now() - start;
  return duration;
}

// Results:
// 'normal': 0.05ms
// 'aaaaaaaaaa': 0.12ms
// 'aaaaaaaaaaaaaaaa': 45ms
// 'aaaaaaaaaaaaaaaaaaaaab': 3,456ms (3.4 seconds!)
// 'aaaaaaaaaaaaaaaaaaaaaaaaaab': TIMEOUT (>1 second)
```

#### Impact Analysis

**Business Impact:**
- Lost searches: ~11,500 failed searches/month
- Estimated revenue loss: $87,000/month (based on 7.5% conversion rate, $100 AOV)
- Customer satisfaction: NPS dropped 12 points
- Support tickets: 284 tickets opened (23.5 hours support time)

**Technical Impact:**
- Page performance: 99th percentile load time increased 85%
- Error rate: 2.3% of all search requests
- Browser crashes: 34% of affected users had to force-quit browser
- Server load: No impact (client-side issue)

#### Solution Implementation

**Fix 1: Remove Nested Quantifiers**
```javascript
// ✅ SAFE: Simplified pattern without nested quantifiers
function validateSearchQuery(query) {
  // Remove the nested + quantifier
  const pattern = /^[a-zA-Z0-9\s\-+]+$/;

  // Add input length limit as additional safety
  if (query.length > 200) {
    showError('Search query too long (max 200 characters)');
    return false;
  }

  if (!pattern.test(query)) {
    showError('Invalid search query format');
    return false;
  }

  return true;
}
```

**Fix 2: Add Debouncing and Timeout Protection**
```javascript
import { debounce } from 'lodash';

// Debounce validation to reduce calls
const debouncedValidation = debounce((query, callback) => {
  const result = validateSearchQuery(query);
  callback(result);
}, 300);

// Add regex timeout protection
function safeRegexTest(pattern, text, timeoutMs = 100) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('regex-worker.js');

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error('Regex timeout'));
    }, timeoutMs);

    worker.postMessage({ pattern: pattern.source, flags: pattern.flags, text });

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve(e.data.result);
    };
  });
}
```

**Fix 3: Enhanced Input Component**
```javascript
function SearchBar() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setError('');

    // Quick length check (no regex needed)
    if (value.length > 200) {
      setError('Search query too long');
      return;
    }

    // Debounced validation
    setIsValidating(true);
    debouncedValidation(value, (isValid) => {
      setIsValidating(false);
      if (!isValid) {
        setError('Invalid search query format');
      } else {
        performSearch(value);
      }
    });
  };

  return (
    <div>
      <input
        value={query}
        onChange={handleChange}
        placeholder="Search products..."
        maxLength={200}
      />
      {isValidating && <Spinner />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}
```

**Fix 4: Add Monitoring**
```javascript
// Monitor regex performance in production
function monitoredRegexTest(pattern, text, context) {
  const start = performance.now();
  let result;

  try {
    result = pattern.test(text);
  } catch (error) {
    // Log regex errors
    analytics.track('regex_error', {
      pattern: pattern.source,
      textLength: text.length,
      context,
      error: error.message
    });
    throw error;
  } finally {
    const duration = performance.now() - start;

    // Alert on slow regex execution
    if (duration > 50) {
      analytics.track('slow_regex', {
        pattern: pattern.source,
        textLength: text.length,
        duration,
        context
      });
    }
  }

  return result;
}
```

#### Results After Fix

**Performance Improvements:**
- CPU usage during search: 99.9% → 3.2% (97% reduction)
- Validation time: 15,000ms → 0.8ms (99.99% faster)
- Page freeze incidents: 11,500/month → 0
- Browser crashes: 34% → 0%

**Business Improvements:**
- Failed searches: 2.3% → 0.02%
- Revenue recovery: $87,000/month
- NPS score: +15 points (3 points above pre-bug level)
- Support tickets: 284 → 8 (97% reduction)

**Key Learnings:**
1. **Never nest quantifiers**: Patterns like `(a+)+` are almost always wrong
2. **Always set input limits**: Validate length before complex regex
3. **Test with malicious input**: Include adversarial test cases
4. **Monitor regex performance**: Track slow patterns in production
5. **Use debouncing**: Don't validate on every keystroke
6. **Consider alternatives**: Sometimes string methods are better than regex

**Prevention Checklist:**
```javascript
// Add to code review checklist
const regexSafetyChecklist = [
  'No nested quantifiers (e.g., (a+)+, (a*)*)',
  'No overlapping alternatives (e.g., (a|ab)+)',
  'Input length limits enforced',
  'Performance tested with long inputs',
  'Timeout protection for user input',
  'Monitoring in place for slow regex'
];

// Automated test
describe('Regex Safety', () => {
  it('should handle long input without freeze', () => {
    const pattern = /^[a-zA-Z0-9\s\-+]+$/;
    const longInput = 'a'.repeat(10000) + 'b';

    const start = Date.now();
    pattern.test(longInput);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100); // Must complete in <100ms
  });
});
```


</details>


<details>
<summary><strong>⚖️ Trade-offs: Regex vs String Methods</strong></summary>


#### Regex vs String Methods

| Aspect | Regular Expressions | String Methods |
|--------|-------------------|----------------|
| **Performance (simple)** | 5-10x slower | ✅ Faster (native code) |
| **Performance (complex)** | ✅ Faster (pattern matching) | Slower or impossible |
| **Code readability** | Lower (learning curve) | ✅ Higher (intuitive) |
| **Flexibility** | ✅ Very flexible (patterns) | Limited (exact matching) |
| **Maintainability** | Lower (cryptic syntax) | ✅ Higher (explicit) |
| **Error-prone** | ✅ Higher (ReDoS risk) | Lower (predictable) |
| **Feature set** | ✅ Rich (groups, lookarounds) | Basic (search, replace) |
| **Memory usage** | Higher (compilation) | ✅ Lower (simple ops) |

**Use String Methods When:**
```javascript
// ✅ Simple exact matching
text.includes('hello');        // Instead of /hello/.test(text)
text.startsWith('prefix');     // Instead of /^prefix/.test(text)
text.endsWith('suffix');       // Instead of /suffix$/.test(text)

// ✅ Simple replacement
text.replace('old', 'new');    // Instead of /old/.replace(...)

// ✅ Case-insensitive simple search
text.toLowerCase().includes('hello'); // Instead of /hello/i.test(text)

// ✅ Performance-critical tight loops
for (let i = 0; i < 1000000; i++) {
  text.includes('search'); // Faster than regex
}
```

**Use Regex When:**
```javascript
// ✅ Pattern matching with wildcards
/^user_\d+$/.test(username);

// ✅ Multiple alternatives
/\b(cat|dog|bird)\b/i.test(text);

// ✅ Complex validation
/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);

// ✅ Extracting structured data
const matches = text.match(/\d{4}-\d{2}-\d{2}/g);

// ✅ Advanced replacements
text.replace(/(\w+)\s(\w+)/, '$2, $1');
```

#### Different Regex Patterns for Same Task

**Email Validation Trade-offs:**

```javascript
// 1. Simple (permissive)
const simple = /^[^@]+@[^@]+\.[^@]+$/;
// ✅ Pros: Fast, easy to read, covers 98% of cases
// ❌ Cons: Accepts invalid emails, no spec compliance

// 2. Moderate (balanced)
const moderate = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
// ✅ Pros: Good balance, rejects obvious invalids
// ❌ Cons: Rejects some valid edge cases (e.g., +, internationalized)

// 3. Strict (RFC 5322 compliant)
const strict = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
// ✅ Pros: Spec-compliant, validates all edge cases
// ❌ Cons: Complex, hard to maintain, 5x slower

// 4. Server validation only
// ✅ Pros: Most reliable (send test email)
// ❌ Cons: Slower, requires backend
```

**Recommendation:** Use moderate pattern + server validation

#### Performance vs Readability

```javascript
// Scenario: Extract all numbers from string

// Option 1: Readable but slower
const numbers = text
  .split(/\D+/)
  .filter(s => s.length > 0)
  .map(Number);
// Time: ~1.2ms for 1000 numbers
// ✅ Pros: Clear intent, easy to understand
// ❌ Cons: Multiple passes, array allocations

// Option 2: Fast but cryptic
const numbers = (text.match(/\d+/g) || []).map(Number);
// Time: ~0.3ms for 1000 numbers
// ✅ Pros: Single pass, faster
// ❌ Cons: Harder to modify, null handling

// Option 3: Optimal but verbose
const numbers = [];
const regex = /\d+/g;
let match;
while ((match = regex.exec(text)) !== null) {
  numbers.push(Number(match[0]));
}
// Time: ~0.15ms for 1000 numbers
// ✅ Pros: Fastest, no temporary arrays
// ❌ Cons: More code, while loop complexity

// Recommendation:
// - Prototype: Use Option 1 (readable)
// - Production (normal traffic): Use Option 2 (balanced)
// - Performance-critical: Use Option 3 (optimal)
```

#### Client-Side vs Server-Side Validation

| Aspect | Client-Side | Server-Side |
|--------|------------|-------------|
| **User experience** | ✅ Instant feedback | Delayed (network) |
| **Security** | ❌ Can be bypassed | ✅ Secure |
| **Performance impact** | ✅ No server load | Server CPU usage |
| **Consistency** | Risk of drift | ✅ Single source |
| **Complexity** | Duplicate logic | ✅ One implementation |
| **Reliability** | ❌ Can be disabled | ✅ Always runs |

**Best Practice: Both**
```javascript
// Client-side: Fast feedback
function validateEmail(email) {
  const pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  return pattern.test(email);
}

// Server-side: Security + verification
app.post('/signup', async (req, res) => {
  const { email } = req.body;

  // Validate format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Check if email exists
  const exists = await checkEmailExists(email);
  if (exists) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // Verify email is real (send verification)
  await sendVerificationEmail(email);

  res.json({ success: true });
});
```

#### Decision Matrix

| Use Case | Best Approach | Rationale |
|----------|--------------|-----------|
| Form validation | Client regex + Server | UX + Security |
| Search query | String methods | Performance |
| URL parsing | Built-in URL API | Reliability |
| Email validation | Simple regex + Server | Balance |
| Phone format | Regex | Structured pattern |
| Password strength | Regex | Multiple criteria |
| Syntax highlighting | Regex | Pattern matching |
| SQL injection | Parameterized queries | Security |


</details>


<details>
<summary><strong>💬 Explain to Junior: Simple Analogy</strong></summary>


#### Simple Analogy

Think of **Regular Expressions** like advanced search commands in a text editor:

**Normal search:** "Find exactly the word 'cat'"
```javascript
text.includes('cat');
```

**Regex search:** "Find 'cat' or 'cats' or 'Cat' at the beginning of any word"
```javascript
/\bCats?\b/i.test(text);
```

It's like having a super-powered search tool with wildcards, alternatives, and special conditions!

#### Step-by-Step Explanation

**Level 1: Basic Matching**
```javascript
// Think of regex as a pattern template
// "Does this text match this pattern?"

const pattern = /hello/;
// Pattern: "Find the exact word 'hello'"

pattern.test('hello world');     // true - 'hello' exists
pattern.test('Hello world');     // false - capital H doesn't match
pattern.test('goodbye world');   // false - no 'hello'
```

**Level 2: Adding Flags**
```javascript
// Flags are like search options
const pattern = /hello/i;
//                      ^ i = ignore case

pattern.test('Hello');  // true - case doesn't matter now
pattern.test('HELLO');  // true
pattern.test('hello');  // true

const globalPattern = /a/g;
//                        ^ g = find all matches

'banana'.match(/a/);   // ['a'] - finds first 'a'
'banana'.match(/a/g);  // ['a', 'a', 'a'] - finds all 'a's
```

**Level 3: Special Characters**
```javascript
// . = any character (wildcard)
/h.t/.test('hat');    // true - 'a' matches .
/h.t/.test('hot');    // true - 'o' matches .
/h.t/.test('h t');    // true - space matches .

// + = one or more
/a+/.test('a');       // true - one 'a'
/a+/.test('aaa');     // true - three 'a's
/a+/.test('b');       // false - no 'a'

// * = zero or more
/a*/.test('');        // true - zero 'a's is okay
/a*/.test('aaa');     // true - three 'a's

// ? = optional (zero or one)
/colou?r/.test('color');   // true - 'u' is optional
/colou?r/.test('colour');  // true - 'u' is present
```

**Level 4: Common Use Cases**
```javascript
// Email validation (simplified)
const emailPattern = /^[a-z0-9]+@[a-z0-9]+\.[a-z]+$/i;
//                    ^ start  @  domain  . extension  $ end

emailPattern.test('user@example.com'); // true
emailPattern.test('invalid.email');    // false

// Phone number
const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
//                    3 digits - 3 digits - 4 digits

phonePattern.test('555-123-4567'); // true
phonePattern.test('555-1234');     // false
```

#### Common Mistakes (and How to Avoid Them)

```javascript
// ❌ Mistake 1: Forgetting the global flag
const pattern = /a/;
'banana'.match(pattern); // ['a'] - only first match

// ✅ Fix: Add g flag for all matches
'banana'.match(/a/g);    // ['a', 'a', 'a']

// ❌ Mistake 2: Not escaping special characters
const dotPattern = /./;
dotPattern.test('x'); // true - . matches any character!

// ✅ Fix: Escape with backslash
const correctPattern = /\./;
correctPattern.test('.'); // true - matches literal dot
correctPattern.test('x'); // false

// ❌ Mistake 3: Using test() with global flag repeatedly
const globalTest = /a/g;
globalTest.test('a'); // true
globalTest.test('a'); // false (!)  - lastIndex moved

// ✅ Fix: Don't use global flag with test()
const simpleTest = /a/;
simpleTest.test('a'); // true
simpleTest.test('a'); // true (consistent)

// ❌ Mistake 4: Not handling null from match()
const numbers = text.match(/\d+/);
const count = numbers.length; // TypeError if no match!

// ✅ Fix: Use optional chaining or default
const count = text.match(/\d+/)?.length ?? 0;
```

#### Interview Answer Template

**Question: "What are regular expressions and when would you use them?"**

**Template Answer:**
```
"Regular expressions, or regex, are patterns used to match and manipulate text
in JavaScript. I use them when I need to:

1. Validate input formats - like emails, phone numbers, or URLs
2. Search for patterns - not just exact strings but patterns like 'any 3 digits'
3. Extract data - pulling specific information from structured text
4. Replace text - doing complex find-and-replace operations

For example, if I need to validate an email address, I'd use:
/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i

This checks that the email has the right structure: username, @, domain, and
extension.

However, I'm careful with regex performance. Complex patterns can cause
performance issues if not written carefully, so for simple string operations,
I prefer using built-in string methods like includes() or startsWith(), which
are faster and more readable.

The key is choosing the right tool: regex for pattern matching, string methods
for simple exact matches."
```

**Follow-up Question: "How do regex flags work?"**

**Template Answer:**
```
"Flags modify how the regex engine processes the pattern. The most common ones
I use are:

- 'i' (case-insensitive): /hello/i matches 'Hello', 'HELLO', 'hello'
- 'g' (global): Finds all matches instead of just the first
- 'm' (multiline): Makes ^ and $ match line boundaries, not just string boundaries

For example, if I'm searching for all email addresses in a document:
text.match(/\w+@\w+\.\w+/gi)

The 'g' finds all emails, and 'i' ensures I don't miss ones with capital letters.

One gotcha: using the 'g' flag with test() can cause unexpected behavior because
it maintains state between calls via lastIndex. For simple tests, I avoid the
global flag."
```

#### Practice Tips

**Beginner Exercises:**
1. Write regex to match phone numbers: `555-123-4567`
2. Validate username: only letters, numbers, underscore
3. Find all words that start with capital letter
4. Match dates in format: `YYYY-MM-DD`

**Tools for Practice:**
- **regex101.com** - Interactive testing with explanations
- **regexr.com** - Visual regex builder
- **MDN Regex Guide** - Comprehensive reference

**Learning Path:**
```
Week 1: Basic patterns (literal, ., +, *, ?)
Week 2: Character classes ([abc], \d, \w)
Week 3: Anchors and boundaries (^, $, \b)
Week 4: Groups and capturing ((abc), $1)
Week 5: Real-world patterns (email, phone, URL)
```


</details>

---

## Question 2: What are character classes and common regex patterns?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Amazon, Microsoft, Shopify

### Question

Explain character classes in regular expressions. What are the different types (custom classes, ranges, negated classes)? What are shorthand character classes? How do you use them for common validation patterns like email, phone numbers, URLs, and dates? What are Unicode property escapes?

### Answer

**Character classes** define sets of characters to match at a single position in a string. They are fundamental building blocks for creating flexible and powerful regex patterns.

#### Types of Character Classes

**1. Custom Character Classes `[...]`**
- Match any single character from the set
- Example: `[abc]` matches 'a', 'b', or 'c'

**2. Character Ranges `[a-z]`**
- Match any character in a range
- Example: `[a-z]` matches any lowercase letter
- Example: `[0-9]` matches any digit
- Can combine: `[a-zA-Z0-9]` matches any alphanumeric

**3. Negated Classes `[^...]`**
- Match any character NOT in the set
- Example: `[^0-9]` matches any non-digit
- Example: `[^aeiou]` matches any non-vowel

#### Shorthand Character Classes

Common patterns have shorthand notations:

- **`\d`** - Digits: `[0-9]`
- **`\D`** - Non-digits: `[^0-9]`
- **`\w`** - Word characters: `[a-zA-Z0-9_]`
- **`\W`** - Non-word characters: `[^a-zA-Z0-9_]`
- **`\s`** - Whitespace: `[ \t\r\n\f]`
- **`\S`** - Non-whitespace: `[^ \t\r\n\f]`

#### Special Metacharacters

- **`.`** - Any character except newline (unless `s` flag)
- **`^`** - Start of string (or line with `m` flag)
- **`$`** - End of string (or line with `m` flag)
- **`\b`** - Word boundary
- **`\B`** - Non-word boundary

#### Unicode Property Escapes (`\p{...}`)

Match characters by Unicode properties (requires `u` flag):

- **`\p{L}`** - All letters (any language)
- **`\p{N}`** - All numbers
- **`\p{P}`** - All punctuation
- **`\p{S}`** - All symbols
- **`\p{Emoji}`** - Emoji characters
- **`\p{Script=Greek}`** - Greek alphabet characters

#### Escaping Special Characters

To match literal special characters, escape with backslash:
```
\. \^ \$ \* \+ \? \( \) \[ \] \{ \} \| \\
```

#### Common Validation Patterns

**Email:**
```javascript
/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
```

**Phone (US):**
```javascript
/^(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
```

**URL:**
```javascript
/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/
```

**Date (YYYY-MM-DD):**
```javascript
/^\d{4}-\d{2}-\d{2}$/
```

**Credit Card:**
```javascript
/^\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}$/
```

### Code Example

```javascript
// ============================================
// Custom Character Classes
// ============================================

// Match vowels only
const vowelPattern = /[aeiou]/gi;
console.log('hello'.match(vowelPattern)); // ['e', 'o']

// Match consonants (negated vowels)
const consonantPattern = /[^aeiou\s]/gi;
console.log('hello world'.match(consonantPattern)); // ['h', 'l', 'l', 'w', 'r', 'l', 'd']

// Match hex digits
const hexPattern = /[0-9a-fA-F]+/g;
console.log('Color: #FF5733'.match(hexPattern)); // ['FF5733']

// Match specific punctuation
const punctuation = /[.!?,;:]/g;
console.log('Hello! How are you?'.match(punctuation)); // ['!', '?']

// ============================================
// Character Ranges
// ============================================

// Lowercase letters
const lowercase = /[a-z]+/g;
console.log('Hello World 123'.match(lowercase)); // ['ello', 'orld']

// Uppercase letters
const uppercase = /[A-Z]+/g;
console.log('Hello World'.match(uppercase)); // ['H', 'W']

// All letters (case-insensitive)
const allLetters = /[a-zA-Z]+/g;
console.log('Hello123World'.match(allLetters)); // ['Hello', 'World']

// Alphanumeric
const alphanumeric = /[a-zA-Z0-9]+/g;
console.log('User123 logged in!'.match(alphanumeric)); // ['User123', 'logged', 'in']

// Digits
const digits = /[0-9]+/g;
console.log('I have 10 apples and 20 oranges'.match(digits)); // ['10', '20']

// Multiple ranges combined
const mixed = /[a-zA-Z0-9_-]+/g;
console.log('user-name_123'.match(mixed)); // ['user-name_123']

// ============================================
// Negated Character Classes
// ============================================

// Match everything except digits
const nonDigits = /[^0-9]+/g;
console.log('abc123def456'.match(nonDigits)); // ['abc', 'def']

// Match non-whitespace
const nonWhitespace = /[^\s]+/g;
console.log('hello   world'.match(nonWhitespace)); // ['hello', 'world']

// Match non-letters
const nonLetters = /[^a-zA-Z]+/g;
console.log('Hello123World!'.match(nonLetters)); // ['123', '!']

// Remove all non-alphanumeric
const text = 'Hello, World! 123';
const cleaned = text.replace(/[^a-zA-Z0-9\s]/g, '');
console.log(cleaned); // 'Hello World 123'

// ============================================
// Shorthand Character Classes
// ============================================

// \d - Digits (equivalent to [0-9])
console.log('Order #12345'.match(/\d+/g)); // ['12345']

// \D - Non-digits (equivalent to [^0-9])
console.log('Order #12345'.match(/\D+/g)); // ['Order #']

// \w - Word characters (equivalent to [a-zA-Z0-9_])
console.log('user_name123'.match(/\w+/g)); // ['user_name123']

// \W - Non-word characters (equivalent to [^a-zA-Z0-9_])
console.log('hello, world!'.match(/\W+/g)); // [', ', '!']

// \s - Whitespace (space, tab, newline)
const multiline = 'line1\nline2\tline3';
console.log(multiline.split(/\s+/)); // ['line1', 'line2', 'line3']

// \S - Non-whitespace
console.log('hello   world'.match(/\S+/g)); // ['hello', 'world']

// Combining shorthand classes
// Match word followed by digits
console.log('user123'.match(/\w+\d+/)); // ['user123']

// Match identifier (letter/underscore followed by word chars)
const identifier = /^[a-zA-Z_]\w*$/;
console.log(identifier.test('_variable1')); // true
console.log(identifier.test('123invalid')); // false (starts with digit)

// ============================================
// Special Metacharacters
// ============================================

// . - Any character (except newline by default)
console.log('cat'.match(/c.t/)); // ['cat']
console.log('cut'.match(/c.t/)); // ['cut']
console.log('c\nt'.match(/c.t/)); // null (newline doesn't match .)

// With s flag (dotAll), . matches newlines
console.log('c\nt'.match(/c.t/s)); // ['c\nt']

// ^ - Start of string
console.log(/^hello/.test('hello world')); // true
console.log(/^hello/.test('say hello'));   // false

// $ - End of string
console.log(/world$/.test('hello world')); // true
console.log(/world$/.test('world hello')); // false

// \b - Word boundary
const wordBoundary = /\bcat\b/;
console.log(wordBoundary.test('cat'));      // true
console.log(wordBoundary.test('cats'));     // false (no boundary after 'cat')
console.log(wordBoundary.test('the cat')); // true
console.log(wordBoundary.test('category')); // false

// \B - Non-word boundary
const nonBoundary = /\Bcat\B/;
console.log(nonBoundary.test('cat'));       // false
console.log(nonBoundary.test('concatenate')); // true ('cat' in middle)

// ============================================
// Escaping Special Characters
// ============================================

// ❌ Incorrect: . matches any character
const wrongDot = /example.com/;
console.log(wrongDot.test('exampleXcom')); // true (unintended)

// ✅ Correct: Escape the dot
const correctDot = /example\.com/;
console.log(correctDot.test('example.com')); // true
console.log(correctDot.test('exampleXcom')); // false

// Escape all special characters
const specialChars = /[\.\^\$\*\+\?\(\)\[\]\{\}\|\\]/g;
const text = 'Price: $10.99 (USD)';
console.log(text.match(specialChars)); // ['$', '.', '(', ')']

// Helper function to escape regex special characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const userInput = 'example.com';
const safePattern = new RegExp(escapeRegex(userInput));
console.log(safePattern.test('example.com')); // true
console.log(safePattern.test('exampleXcom')); // false

// ============================================
// Unicode Property Escapes (ES2018)
// ============================================

// \p{L} - All letters (any language)
const letters = /\p{L}+/gu;
console.log('Hello мир 世界'.match(letters));
// ['Hello', 'мир', '世界']

// \p{N} - All numbers
const numbers = /\p{N}+/gu;
console.log('Room 123, Floor ⅔'.match(numbers));
// ['123', '⅔']

// \p{P} - All punctuation
const punct = /\p{P}+/gu;
console.log('Hello, world! How are you?'.match(punct));
// [',', '!', '?']

// \p{S} - All symbols
const symbols = /\p{S}+/gu;
console.log('Price: $100, €85, ¥1000'.match(symbols));
// ['$', '€', '¥']

// \p{Emoji} - Emoji characters
const emoji = /\p{Emoji}/gu;
console.log('Hello 😀 World 🌍!'.match(emoji));
// ['😀', '🌍']

// \p{Script=Greek} - Greek alphabet
const greek = /\p{Script=Greek}+/gu;
console.log('Hello Γεια σου'.match(greek));
// ['Γεια', 'σου']

// Negated Unicode properties
const nonLetters = /\P{L}+/gu; // NOT letters
console.log('Hello123!'.match(nonLetters));
// ['123!']

// ============================================
// Common Validation Patterns
// ============================================

// Email validation (comprehensive)
const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

console.log(emailPattern.test('user@example.com'));      // true
console.log(emailPattern.test('user.name@example.com')); // true
console.log(emailPattern.test('user+tag@example.com'));  // true
console.log(emailPattern.test('invalid@'));              // false
console.log(emailPattern.test('@example.com'));          // false

// Phone number validation (US format - flexible)
const phonePattern = /^(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

console.log(phonePattern.test('555-123-4567'));    // true
console.log(phonePattern.test('(555) 123-4567'));  // true
console.log(phonePattern.test('555.123.4567'));    // true
console.log(phonePattern.test('+1-555-123-4567')); // true
console.log(phonePattern.test('5551234567'));      // true
console.log(phonePattern.test('123-456'));         // false

// URL validation
const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

console.log(urlPattern.test('https://example.com'));                 // true
console.log(urlPattern.test('http://www.example.com/path'));         // true
console.log(urlPattern.test('https://sub.example.com/path?q=value')); // true
console.log(urlPattern.test('not-a-url'));                           // false
console.log(urlPattern.test('ftp://example.com'));                   // false

// Date validation (YYYY-MM-DD)
const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

console.log(datePattern.test('2024-03-15')); // true
console.log(datePattern.test('2024-12-31')); // true
console.log(datePattern.test('2024-13-01')); // false (invalid month)
console.log(datePattern.test('2024-03-32')); // false (invalid day)
console.log(datePattern.test('24-03-15'));   // false (wrong year format)

// Time validation (HH:MM 24-hour)
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

console.log(timePattern.test('09:30')); // true
console.log(timePattern.test('23:59')); // true
console.log(timePattern.test('24:00')); // false (invalid hour)
console.log(timePattern.test('12:60')); // false (invalid minute)

// Credit card validation (basic format check)
const creditCardPattern = /^\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}$/;

console.log(creditCardPattern.test('1234-5678-9012-3456')); // true
console.log(creditCardPattern.test('1234 5678 9012 3456')); // true
console.log(creditCardPattern.test('1234567890123456'));    // true
console.log(creditCardPattern.test('1234-5678-9012'));      // false

// IP address validation (IPv4)
const ipPattern = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;

console.log(ipPattern.test('192.168.1.1'));   // true
console.log(ipPattern.test('255.255.255.255')); // true
console.log(ipPattern.test('256.1.1.1'));     // false (invalid octet)
console.log(ipPattern.test('192.168.1'));     // false (incomplete)

// Username validation (alphanumeric + underscore, 3-16 chars)
const usernamePattern = /^[a-zA-Z0-9_]{3,16}$/;

console.log(usernamePattern.test('user_name'));  // true
console.log(usernamePattern.test('user123'));    // true
console.log(usernamePattern.test('ab'));         // false (too short)
console.log(usernamePattern.test('user-name'));  // false (hyphen not allowed)

// Password strength (8+ chars, 1 upper, 1 lower, 1 digit, 1 special)
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

console.log(passwordPattern.test('Password123!'));  // true
console.log(passwordPattern.test('weakpass'));      // false (no upper/digit/special)
console.log(passwordPattern.test('PASSWORD123!'));  // false (no lowercase)

// Hex color code
const hexColorPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

console.log(hexColorPattern.test('#FFF'));     // true (shorthand)
console.log(hexColorPattern.test('#FF5733'));  // true
console.log(hexColorPattern.test('#GGG'));     // false (invalid hex)
console.log(hexColorPattern.test('FF5733'));   // false (missing #)

// ============================================
// ❌ Incorrect vs ✅ Correct Patterns
// ============================================

// ❌ Not escaping special characters in email
const wrongEmail = /^[a-z]+@[a-z]+.[a-z]+$/i;
// This allows 'user@exampleXcom' (. matches any char)

// ✅ Properly escaped
const correctEmail = /^[a-z]+@[a-z]+\.[a-z]+$/i;

// ❌ Allowing invalid phone formats
const loosePhone = /\d{3}\d{3}\d{4}/;
// Matches '1234567890' anywhere in string

// ✅ Strict format with anchors
const strictPhone = /^\d{3}-\d{3}-\d{4}$/;

// ❌ Using [a-Z] (invalid range)
const invalidRange = /[a-Z]+/; // Includes special chars between Z and a

// ✅ Correct letter range
const validRange = /[a-zA-Z]+/;

// ❌ Forgetting ^ and $ anchors
const partialMatch = /\d{4}/; // Matches ANY 4 digits
console.log(partialMatch.test('abc1234def')); // true (unintended)

// ✅ Full string match with anchors
const fullMatch = /^\d{4}$/; // Matches ONLY 4 digits
console.log(fullMatch.test('1234'));       // true
console.log(fullMatch.test('abc1234def')); // false

// ❌ Not handling international characters
const asciiOnly = /^[a-zA-Z]+$/;
console.log(asciiOnly.test('José')); // false (rejects valid name)

// ✅ Unicode-aware pattern
const unicodeAware = /^\p{L}+$/u;
console.log(unicodeAware.test('José'));   // true
console.log(unicodeAware.test('Владимир')); // true
console.log(unicodeAware.test('李明'));    // true

// ============================================
// Performance Considerations
// ============================================

// For simple operations, optimize character classes

// ❌ Inefficient: Multiple alternatives
const slowAlternatives = /cat|dog|bird|fish/g;

// ✅ More efficient: Character class (when possible)
const fastClass = /[cdmw]at/g; // For similar patterns

// ❌ Catastrophic backtracking with character classes
const vulnerable = /^([a-z]+)+$/;
// Still vulnerable despite using character class

// ✅ Safe pattern
const safe = /^[a-z]+$/;

// Benchmark: Character class vs alternatives
console.time('alternatives');
for (let i = 0; i < 100000; i++) {
  /cat|dog|bird/.test('dog');
}
console.timeEnd('alternatives'); // ~25ms

console.time('optimized');
for (let i = 0; i < 100000; i++) {
  /[cdb][ao][tgr]/.test('dog');
}
console.timeEnd('optimized'); // ~18ms
```


<details>
<summary><strong>🔍 Deep Dive: Character Class Optimization in V8</strong></summary>


#### Character Class Optimization in V8

V8's Irregexp engine applies several optimizations to character classes:

**1. Range Compression**
```javascript
// Pattern: /[a-zA-Z0-9]/
// Instead of 62 individual checks, V8 compiles to:
// - Range check: (c >= 'a' && c <= 'z')
// - Range check: (c >= 'A' && c <= 'Z')
// - Range check: (c >= '0' && c <= '9')

// Bytecode optimization:
// LOAD_CURRENT_CHAR
// CHECK_CHAR_IN_RANGE 'a', 'z', success
// CHECK_CHAR_IN_RANGE 'A', 'Z', success
// CHECK_CHAR_IN_RANGE '0', '9', success
// FAIL

// Time complexity: O(3) range checks vs O(62) individual checks
```

**2. Bitmap Optimization**
```javascript
// For character classes with many individual characters:
// /[abcdefghij]/

// V8 creates a bitmap:
// Bit 0: 'a', Bit 1: 'b', ..., Bit 9: 'j'
// Lookup: bitmap[charCode] ? match : fail

// Memory: 32 bytes (256 bits for ASCII)
// Time: O(1) lookup vs O(n) comparisons
```

**3. Shorthand Expansion**
```javascript
// \d, \w, \s are pre-compiled as optimized range checks
// \d -> CHECK_CHAR_IN_RANGE '0', '9'
// \w -> Multiple range checks (optimized)
// \s -> Bitmap lookup for whitespace chars

// Performance comparison:
const custom = /[0-9]+/g;    // 3 bytecode instructions
const shorthand = /\d+/g;    // 1 optimized instruction (30% faster)
```

**4. Negated Class Optimization**
```javascript
// /[^abc]/ compiles differently than /[def...xyz]/

// Negated: Single check
// IF (c == 'a' || c == 'b' || c == 'c') FAIL
// ELSE SUCCESS

// Positive (inverse): Multiple checks
// IF (c == 'd' || ... || c == 'z') SUCCESS
// ELSE FAIL

// Negated classes are more efficient for excluding few characters
```

#### Unicode Categories and Properties

Unicode defines 30+ categories for character classification:

**General Categories:**
```javascript
// Letter categories
\p{L}   // All letters
\p{Ll}  // Lowercase letters: a-z, α-ω, etc.
\p{Lu}  // Uppercase letters: A-Z, Α-Ω, etc.
\p{Lt}  // Titlecase letters: Dž, Lj, etc.
\p{Lm}  // Modifier letters: ʰ, ʲ, etc.
\p{Lo}  // Other letters: 中, א, etc.

// Number categories
\p{N}   // All numbers
\p{Nd}  // Decimal digits: 0-9, ०-९, etc.
\p{Nl}  // Letter numbers: Ⅰ, Ⅱ, Ⅲ, etc.
\p{No}  // Other numbers: ½, ¾, etc.

// Punctuation categories
\p{P}   // All punctuation
\p{Pc}  // Connector: _, ‿, etc.
\p{Pd}  // Dash: -, –, —, etc.
\p{Ps}  // Open: (, [, {, etc.
\p{Pe}  // Close: ), ], }, etc.
\p{Pi}  // Initial quote: ", ', etc.
\p{Pf}  // Final quote: ", ', etc.
\p{Po}  // Other: !, ?, etc.

// Symbol categories
\p{S}   // All symbols
\p{Sm}  // Math: +, =, ×, etc.
\p{Sc}  // Currency: $, €, ¥, etc.
\p{Sk}  // Modifier: ^, `, etc.
\p{So}  // Other: ©, ®, ™, etc.

// Mark categories
\p{M}   // All marks (diacritics)
\p{Mn}  // Non-spacing: ́, ̀, etc.
\p{Mc}  // Spacing combining: ा, ि, etc.
\p{Me}  // Enclosing: ⃝, ⃞, etc.

// Separator categories
\p{Z}   // All separators
\p{Zs}  // Space: space, nbsp, etc.
\p{Zl}  // Line separator
\p{Zp}  // Paragraph separator

// Other categories
\p{C}   // All other (control, format, etc.)
```

**Script Properties:**
```javascript
// Match specific writing systems
\p{Script=Latin}      // Latin alphabet: A-Z, a-z, À-ÿ
\p{Script=Greek}      // Greek: Α-Ω, α-ω
\p{Script=Cyrillic}   // Cyrillic: А-Я, а-я
\p{Script=Arabic}     // Arabic: ا-ي
\p{Script=Hebrew}     // Hebrew: א-ת
\p{Script=Han}        // Chinese characters
\p{Script=Hiragana}   // Japanese hiragana
\p{Script=Katakana}   // Japanese katakana

// Example: Validate Greek text only
const greekOnly = /^\p{Script=Greek}+$/u;
console.log(greekOnly.test('Γεια σου')); // true
console.log(greekOnly.test('Hello'));    // false
```

**Emoji Properties:**
```javascript
\p{Emoji}                    // All emoji characters
\p{Emoji_Presentation}       // Emoji by default (not text)
\p{Emoji_Modifier}           // Skin tone modifiers
\p{Emoji_Modifier_Base}      // Accepts modifiers (👋)
\p{Emoji_Component}          // Emoji components

// Example: Extract all emoji
const emojiPattern = /\p{Emoji}/gu;
const text = 'Hello 👋 World 🌍! 😀';
console.log(text.match(emojiPattern)); // ['👋', '🌍', '😀']

// Example: Match emoji with skin tone
const withSkinTone = /\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?/gu;
console.log('👋👋🏻👋🏿'.match(withSkinTone)); // ['👋', '👋🏻', '👋🏿']
```

**Performance Implications:**
```javascript
// Unicode property matching requires:
// 1. Unicode data tables (~50KB loaded on first use)
// 2. More complex lookup logic (slower than ASCII)
// 3. UTF-16 surrogate pair handling

// Benchmark: ASCII vs Unicode
console.time('ascii');
/[a-zA-Z]+/g.exec('hello world'.repeat(1000));
console.timeEnd('ascii'); // ~0.5ms

console.time('unicode');
/\p{L}+/gu.exec('hello world'.repeat(1000));
console.timeEnd('unicode'); // ~1.2ms (2.4x slower)

// Recommendation: Use ASCII ranges when possible
// ✅ /[a-zA-Z]/ for English text
// ✅ /\p{L}/u for international text
```

#### Word Boundaries and Lookarounds with Character Classes

**Word Boundaries (`\b`) Behavior:**
```javascript
// \b matches between \w and \W (or string boundaries)
// \w = [a-zA-Z0-9_]
// \W = [^a-zA-Z0-9_]

// Boundary positions:
//   \b       \b \b      \b
//    |       |   |      |
//   "hello world, how are_you?"
//        |     |   |   |  |
//        \b    \W  \b  \b \b

// Examples:
console.log('hello'.match(/\bhello\b/));     // ['hello']
console.log('hello-world'.match(/\bhello\b/)); // null ('-' is \W, no end boundary)
console.log('hello_world'.match(/\bhello\b/)); // null ('_' is \w, no boundary)

// Custom word boundaries using lookarounds
// Match words ending with vowels
const vowelEnd = /\b\w+[aeiou]\b/gi;
console.log('hello world pizza code'.match(vowelEnd));
// ['hello', 'pizza', 'code']

// Match words NOT followed by punctuation
const noPunct = /\b\w+\b(?![.!?])/g;
console.log('Hello world. How are you?'.match(noPunct));
// ['Hello', 'are']
```

**Lookarounds with Character Classes:**
```javascript
// Positive lookahead: Match only if followed by pattern
// Syntax: (?=pattern)

// Example: Extract words followed by numbers
const wordBeforeNum = /\w+(?=\d)/g;
console.log('user123 test456 hello'.match(wordBeforeNum));
// ['user', 'test']

// Negative lookahead: Match only if NOT followed by pattern
// Syntax: (?!pattern)

// Example: Match digits NOT part of a date
const nonDateDigits = /\d+(?!-\d{2}-\d{2})/g;
console.log('2024-03-15 order 12345'.match(nonDateDigits));
// ['15', '12345']

// Positive lookbehind: Match only if preceded by pattern
// Syntax: (?<=pattern)

// Example: Extract prices (numbers after $)
const prices = /(?<=\$)\d+(\.\d{2})?/g;
console.log('Items: $10.99 $25 €15'.match(prices));
// ['10.99', '25']

// Negative lookbehind: Match only if NOT preceded by pattern
// Syntax: (?<!pattern)

// Example: Match numbers NOT preceded by #
const nonHashNum = /(?<!#)\d+/g;
console.log('#123 order 456'.match(nonHashNum));
// ['456']

// Complex example: Password validation with lookarounds
// At least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special
const passwordValidation = /^
  (?=.*[a-z])          // Lookahead: at least 1 lowercase
  (?=.*[A-Z])          // Lookahead: at least 1 uppercase
  (?=.*\d)             // Lookahead: at least 1 digit
  (?=.*[@$!%*?&])      // Lookahead: at least 1 special char
  [A-Za-z\d@$!%*?&]    // Allowed characters
  {8,}                 // At least 8 characters
$/x;

console.log(passwordValidation.test('Password1!')); // true
console.log(passwordValidation.test('password'));   // false (no upper/digit/special)
```

#### Negated Classes vs Lookahead Performance

**Performance Comparison:**
```javascript
// Scenario: Match words NOT containing vowels

// Approach 1: Negated character class
const negated = /\b[^aeiou\s]+\b/gi;

// Approach 2: Negative lookahead
const lookahead = /\b(?![aeiou])\w+\b/gi;

// Benchmark:
const text = 'the quick brown fox jumps over the lazy dog'.repeat(1000);

console.time('negated');
for (let i = 0; i < 1000; i++) {
  text.match(negated);
}
console.timeEnd('negated'); // ~45ms

console.time('lookahead');
for (let i = 0; i < 1000; i++) {
  text.match(lookahead);
}
console.timeEnd('lookahead'); // ~78ms

// Result: Negated classes are ~40% faster
// Reason: Single character check vs lookahead evaluation at each position
```

**When to Use Each:**

**Use Negated Classes When:**
- Excluding specific characters: `[^0-9]` for non-digits
- Simple exclusion logic
- Performance critical

**Use Negative Lookahead When:**
- Complex exclusion patterns: `(?!pattern)`
- Need to check ahead without consuming characters
- Validating multiple conditions

**Example Trade-off:**
```javascript
// Task: Match words that don't start with 'un-'

// ❌ Cannot use negated class alone
// [^un] doesn't work (matches single char)

// ✅ Must use negative lookahead
const notUnPrefix = /\b(?!un)\w+\b/gi;
console.log('happy unhappy lucky unlucky'.match(notUnPrefix));
// ['happy', 'lucky']
```


</details>


<details>
<summary><strong>🐛 Real-World Scenario: Context: International E-commerce Platform - Username Validation</strong></summary>


#### Context: International E-commerce Platform - Username Validation

**Company:** Global e-commerce platform (15 million users across 50+ countries)
**Team:** Registration & Identity team (8 developers)
**Timeline:** Bug discovered through user feedback, 2-week investigation and rollout

#### Problem Discovery

Customer support reported increasing complaints:
- "Can't create account - username rejected"
- "My name has special characters and system won't accept it"
- "English names work but mine doesn't"

**Initial Metrics:**
- Signup rejection rate: 23% in non-English markets
- Support tickets: 1,847 tickets/month related to username issues
- Regional breakdown:
  - Latin America: 31% rejection
  - Eastern Europe: 28% rejection
  - Middle East: 41% rejection
  - East Asia: 38% rejection
  - English markets: 3% rejection

#### Investigation Process

**Step 1: Analyze Rejected Usernames**

Sampled 500 rejected usernames:
```javascript
const rejectedSamples = [
  'José_García',      // Latin America (accented letters)
  'Владимир',         // Eastern Europe (Cyrillic)
  'محمد',             // Middle East (Arabic)
  '李明',             // East Asia (Chinese)
  'François_Müller',  // Europe (mixed accents)
  'Søren_Ørsted',     // Scandinavia (special letters)
  'Αθηνά',           // Greece (Greek alphabet)
];
```

**Step 2: Review Current Validation Code**

Found in `UserRegistration.jsx`:
```javascript
// ❌ PROBLEMATIC CODE
function validateUsername(username) {
  // Only allows ASCII alphanumeric and underscore
  const pattern = /^[a-zA-Z0-9_]{3,20}$/;

  if (!pattern.test(username)) {
    return {
      valid: false,
      error: 'Username must be 3-20 characters (letters, numbers, underscore only)'
    };
  }

  return { valid: true };
}
```

**Step 3: Identify Root Cause**

The pattern `/^[a-zA-Z0-9_]{3,20}$/` only matches ASCII characters:
- Accepts: `John_Doe`, `user123`, `test_user`
- Rejects: `José`, `Владимир`, `محمد`, `李明`

This excludes billions of valid names worldwide!

**Step 4: Test with Real-World Names**

```javascript
const testCases = [
  // English (should pass with old code)
  { name: 'John_Smith', expected: true },

  // Latin with accents (rejected by old code)
  { name: 'José', expected: true },
  { name: 'François', expected: true },

  // Cyrillic (rejected by old code)
  { name: 'Владимир', expected: true },
  { name: 'Дмитрий', expected: true },

  // Arabic (rejected by old code)
  { name: 'محمد', expected: true },
  { name: 'فاطمة', expected: true },

  // Chinese (rejected by old code)
  { name: '李明', expected: true },
  { name: '王芳', expected: true },

  // Greek (rejected by old code)
  { name: 'Αθηνά', expected: true },

  // Mixed scripts (should still pass)
  { name: 'John_李', expected: true },

  // Should still reject
  { name: 'ab', expected: false },          // too short
  { name: 'a'.repeat(25), expected: false }, // too long
  { name: 'user@name', expected: false },   // invalid char
];

// Old code results:
const oldPattern = /^[a-zA-Z0-9_]{3,20}$/;
testCases.forEach(({ name, expected }) => {
  const result = oldPattern.test(name);
  console.log(`${name}: ${result} (expected: ${expected})`);
});

// Results: 67% failure rate for international names!
```

**Step 5: Measure Business Impact**

**Signup Impact:**
- Lost signups: 23% of 50,000 monthly non-English signups = 11,500 lost users/month
- Estimated revenue loss: $575,000/month
  - Calculation: 11,500 users × $50 LTV
- Market penetration: Unable to grow in key markets

**Support Impact:**
- Support tickets: 1,847/month @ 15min avg = 462 hours/month
- Support cost: $13,860/month (@ $30/hour)

**Brand Impact:**
- Social media mentions: 234 negative posts about "English-only" usernames
- NPS score: -18 in affected markets (vs +45 in English markets)

#### Solution Implementation

**Fix 1: Use Unicode Property Escapes**
```javascript
// ✅ NEW: Unicode-aware validation
function validateUsername(username) {
  // Allow letters from any language, numbers, underscore
  const pattern = /^[\p{L}\p{N}_]{3,20}$/u;
  //                  ^^^^^^^^^^^^
  //                  \p{L} = all letters (any script)
  //                  \p{N} = all numbers (any script)
  //                  _ = underscore
  //                  u = unicode flag (required)

  if (!pattern.test(username)) {
    return {
      valid: false,
      error: 'Username must be 3-20 characters (letters, numbers, underscore)'
    };
  }

  return { valid: true };
}

// Test with international names
console.log(validateUsername('José'));      // ✅ { valid: true }
console.log(validateUsername('Владимир'));  // ✅ { valid: true }
console.log(validateUsername('محمد'));      // ✅ { valid: true }
console.log(validateUsername('李明'));      // ✅ { valid: true }
console.log(validateUsername('user@name')); // ❌ { valid: false }
```

**Fix 2: Enhanced Validation with Mixed Scripts**
```javascript
// Additional check: Prevent mixed script confusion attacks
// (e.g., mixing Cyrillic 'а' that looks like Latin 'a')

function detectMixedScripts(username) {
  const scripts = new Set();

  for (const char of username) {
    // Skip neutral characters (numbers, underscore)
    if (/[\p{N}_]/u.test(char)) continue;

    // Detect script
    if (/\p{Script=Latin}/u.test(char)) scripts.add('Latin');
    else if (/\p{Script=Cyrillic}/u.test(char)) scripts.add('Cyrillic');
    else if (/\p{Script=Arabic}/u.test(char)) scripts.add('Arabic');
    else if (/\p{Script=Han}/u.test(char)) scripts.add('Han');
    else if (/\p{Script=Greek}/u.test(char)) scripts.add('Greek');
    // Add more as needed
  }

  return scripts.size;
}

function validateUsername(username) {
  // Basic pattern check
  const pattern = /^[\p{L}\p{N}_]{3,20}$/u;

  if (!pattern.test(username)) {
    return {
      valid: false,
      error: 'Username must be 3-20 characters (letters, numbers, underscore)'
    };
  }

  // Check for mixed scripts (security)
  const scriptCount = detectMixedScripts(username);
  if (scriptCount > 2) {
    return {
      valid: false,
      error: 'Username contains too many different writing systems'
    };
  }

  return { valid: true };
}

// Examples:
console.log(validateUsername('John_李'));    // ✅ Valid (2 scripts okay)
console.log(validateUsername('José'));      // ✅ Valid (1 script)
console.log(validateUsername('JohnАли李')); // ❌ Invalid (3+ scripts - security risk)
```

**Fix 3: UI/UX Improvements**
```javascript
function UsernameInput() {
  const [username, setUsername] = useState('');
  const [validation, setValidation] = useState(null);
  const [detectedScript, setDetectedScript] = useState('');

  useEffect(() => {
    if (!username) return;

    // Real-time validation
    const result = validateUsername(username);
    setValidation(result);

    // Detect primary script for user feedback
    if (/\p{Script=Latin}/u.test(username)) {
      setDetectedScript('Latin');
    } else if (/\p{Script=Cyrillic}/u.test(username)) {
      setDetectedScript('Cyrillic');
    } else if (/\p{Script=Arabic}/u.test(username)) {
      setDetectedScript('Arabic (Right-to-left)');
    } else if (/\p{Script=Han}/u.test(username)) {
      setDetectedScript('Chinese');
    }
  }, [username]);

  return (
    <div>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username (any language)"
        dir="auto" // Auto-detect text direction (important for RTL scripts)
      />

      {detectedScript && (
        <p>Detected script: {detectedScript}</p>
      )}

      {validation && !validation.valid && (
        <ErrorMessage>{validation.error}</ErrorMessage>
      )}

      <InfoBox>
        ℹ️ You can use letters from any language, numbers, and underscores.
        Examples: José, Владимир, محمد, 李明, John_Smith
      </InfoBox>
    </div>
  );
}
```

**Fix 4: Backend Validation (Security)**
```javascript
// Server-side validation (Node.js/Express)
app.post('/api/register', async (req, res) => {
  const { username } = req.body;

  // Validate format
  const usernamePattern = /^[\p{L}\p{N}_]{3,20}$/u;
  if (!usernamePattern.test(username)) {
    return res.status(400).json({
      error: 'Invalid username format'
    });
  }

  // Check mixed scripts
  const scriptCount = detectMixedScripts(username);
  if (scriptCount > 2) {
    return res.status(400).json({
      error: 'Username contains too many different writing systems'
    });
  }

  // Check for confusable characters (homograph attack prevention)
  if (containsConfusableChars(username)) {
    return res.status(400).json({
      error: 'Username contains confusing characters'
    });
  }

  // Check uniqueness (case-insensitive + Unicode normalization)
  const normalizedUsername = username.normalize('NFC').toLowerCase();
  const exists = await db.users.findOne({
    username_normalized: normalizedUsername
  });

  if (exists) {
    return res.status(409).json({
      error: 'Username already taken'
    });
  }

  // Create user
  await db.users.create({
    username,
    username_normalized: normalizedUsername
  });

  res.json({ success: true });
});
```

**Fix 5: Database Indexing**
```javascript
// MongoDB: Index normalized usernames for case-insensitive + unicode-aware uniqueness
db.users.createIndex(
  { username_normalized: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

// SQL: Use COLLATION for case-insensitive Unicode comparisons
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(20) NOT NULL,
  username_normalized VARCHAR(20) NOT NULL UNIQUE,
  INDEX idx_username_normalized (username_normalized)
) COLLATE utf8mb4_unicode_ci;
```

#### Results After Fix

**Signup Improvements:**
- Rejection rate: 23% → 1.8% (92% improvement)
- New signups (non-English): +11,200 users/month
- Revenue recovery: $560,000/month

**Regional Impact:**
- Latin America: 31% rejection → 2.1%
- Eastern Europe: 28% rejection → 1.9%
- Middle East: 41% rejection → 2.3%
- East Asia: 38% rejection → 1.6%

**Support & Brand:**
- Support tickets: 1,847/month → 87/month (95% reduction)
- Support cost savings: $13,200/month
- NPS score: -18 → +32 in affected markets (50-point improvement!)
- Positive social media mentions: 456 posts thanking for international support

**Key Learnings:**
1. **Always consider internationalization**: ASCII is not sufficient for global apps
2. **Use Unicode property escapes**: `\p{L}` includes all letters from all languages
3. **Normalize usernames**: Use `.normalize('NFC')` for consistent comparisons
4. **Prevent homograph attacks**: Check for confusable characters across scripts
5. **Test with real international names**: Include diverse test cases from different cultures
6. **Add helpful UI feedback**: Show detected script, give examples

**Prevention Checklist:**
```javascript
const i18nValidationChecklist = [
  'Use \\p{L} for letters, \\p{N} for numbers (not [a-zA-Z0-9])',
  'Add unicode flag (u) to all patterns',
  'Normalize strings with .normalize("NFC")',
  'Test with names from 10+ different languages',
  'Check for mixed script attacks',
  'Use dir="auto" for RTL language support',
  'Validate on both client and server',
  'Document supported scripts'
];
```


</details>


<details>
<summary><strong>⚖️ Trade-offs: Character Class Approaches</strong></summary>


#### Character Class Approaches

| Approach | Use Case | Pros | Cons |
|----------|----------|------|------|
| **ASCII Only** `[a-zA-Z]` | English-only apps | ✅ Fast, simple | ❌ Excludes international users |
| **Unicode Properties** `\p{L}` | Global apps | ✅ Inclusive, correct | ❌ Slightly slower, requires `u` flag |
| **Specific Scripts** `\p{Script=Latin}` | Known languages | ✅ Precise control | ❌ Must enumerate scripts |
| **Negated Classes** `[^0-9]` | Exclusion logic | ✅ Simple, fast | ❌ Limited to simple exclusions |

**Recommendation by Use Case:**
```javascript
// English-only app (e.g., internal tool)
/^[a-zA-Z0-9_]{3,20}$/

// Global consumer app
/^[\p{L}\p{N}_]{3,20}$/u

// Specific language (e.g., Greek forum)
/^[\p{Script=Greek}\p{N}_]{3,20}$/u

// Mixed with Latin (e.g., international business)
/^[\p{Script=Latin}\p{Script=Cyrillic}\p{N}_]{3,20}$/u
```

#### Whitelist vs Blacklist Validation

| Aspect | Whitelist (Allow) | Blacklist (Deny) |
|--------|------------------|------------------|
| **Security** | ✅ More secure (explicit allow) | ❌ Less secure (implicit allow) |
| **Maintenance** | ✅ Easier (add as needed) | ❌ Harder (always chasing threats) |
| **User Experience** | ❌ May reject valid input | ✅ More permissive |
| **False Positives** | ❌ Higher (rejects valid) | ✅ Lower |
| **False Negatives** | ✅ Lower (rejects unknown) | ❌ Higher (allows unknown) |

**Examples:**
```javascript
// Whitelist approach (recommended for security)
function sanitizeInput(input) {
  // ONLY allow alphanumeric and spaces
  return input.replace(/[^\p{L}\p{N}\s]/gu, '');
}

console.log(sanitizeInput('Hello <script>alert(1)</script>'));
// Output: 'Hello scriptalert1script'
// ✅ Removes all dangerous characters

// Blacklist approach (risky)
function sanitizeInputBlacklist(input) {
  // Try to remove dangerous characters
  return input
    .replace(/<script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror=/gi, '');
}

console.log(sanitizeInputBlacklist('<SCRIPT>alert(1)</SCRIPT>'));
// Output: 'alert(1)'
// ✅ Blocked <script>

console.log(sanitizeInputBlacklist('<img src=x onerror=alert(1)>'));
// Output: '<img src=x alert(1)>'
// ✅ Blocked onerror=

console.log(sanitizeInputBlacklist('<img src=x onload=alert(1)>'));
// Output: '<img src=x onload=alert(1)>'
// ❌ FAILED! Didn't blacklist 'onload'
```

**Recommendation:**
- **Security-critical**: Always use whitelist
- **User-generated content**: Whitelist + HTML sanitization library
- **Search/autocomplete**: Blacklist (for UX) + server-side whitelist

#### Strict vs Permissive Patterns

**Email Validation Example:**

```javascript
// Ultra-permissive (too loose)
const permissive = /^[^@]+@[^@]+$/;
// ✅ Pros: Accepts edge cases, better UX
// ❌ Cons: Accepts invalid emails (e.g., 'a@b')

// Balanced (recommended)
const balanced = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
// ✅ Pros: Good balance, rejects obvious invalids
// ❌ Cons: May reject rare valid formats

// Strict (RFC 5322 compliant)
const strict = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
// ✅ Pros: Spec-compliant, comprehensive
// ❌ Cons: Complex, slow, hard to maintain

// Test cases:
const tests = [
  'user@example.com',           // All pass
  'user.name@example.com',      // All pass
  'user+tag@example.com',       // Balanced & Strict pass
  '"user name"@example.com',    // Only Strict passes
  'user@[192.168.1.1]',        // Only Strict passes
  'a@b',                        // Only Permissive passes
];
```

**Decision Matrix:**

| Use Case | Recommended Approach | Reason |
|----------|---------------------|--------|
| User signup | Balanced | Good UX, prevents typos |
| Email verification | Permissive | Let server verify actual delivery |
| Internal validation | Strict | Ensure data quality |
| Public API | Balanced | Balance security & usability |

#### Performance Implications of Character Classes

**Benchmark: Different Approaches**

```javascript
const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'.repeat(1000);
const iterations = 10000;

// Test 1: Simple range [a-z]
console.time('simple-range');
for (let i = 0; i < iterations; i++) {
  text.match(/[a-z]+/g);
}
console.timeEnd('simple-range'); // ~180ms

// Test 2: Multiple ranges [a-zA-Z]
console.time('multi-range');
for (let i = 0; i < iterations; i++) {
  text.match(/[a-zA-Z]+/g);
}
console.timeEnd('multi-range'); // ~210ms (+17%)

// Test 3: Unicode property \p{L}
console.time('unicode-property');
for (let i = 0; i < iterations; i++) {
  text.match(/\p{L}+/gu);
}
console.timeEnd('unicode-property'); // ~450ms (+150%)

// Test 4: Shorthand \w
console.time('shorthand');
for (let i = 0; i < iterations; i++) {
  text.match(/\w+/g);
}
console.timeEnd('shorthand'); // ~160ms (fastest)

// Test 5: Negated class [^0-9]
console.time('negated');
for (let i = 0; i < iterations; i++) {
  text.match(/[^0-9]+/g);
}
console.timeEnd('negated'); // ~190ms
```

**Performance Ranking (Fastest to Slowest):**
1. Shorthand classes (`\w`, `\d`, `\s`): 1.0x baseline
2. Simple ranges (`[a-z]`, `[0-9]`): 1.1x
3. Negated classes (`[^...]`): 1.2x
4. Multiple ranges (`[a-zA-Z0-9]`): 1.3x
5. Unicode properties (`\p{L}`, `\p{N}`): 2.5x-3x

**Recommendation:**
```javascript
// Performance-critical (English text)
/\w+/g               // Use shorthand

// International text (necessary)
/\p{L}+/gu          // Accept slower performance

// Balance (known languages)
/[a-zA-ZÀ-ÿ]+/g     // Manually include accented letters
```

#### Comparison Table: Validation Strategies

| Strategy | Example | Security | Performance | Maintenance | UX |
|----------|---------|----------|-------------|-------------|-----|
| **Regex only** | `/^[a-z]+$/` | Medium | ✅ Fast | Easy | Poor |
| **Regex + Length** | `/^[a-z]{3,20}$/` | Medium | ✅ Fast | Easy | Good |
| **Regex + Server** | Client regex + email verification | ✅ High | Medium | Medium | ✅ Best |
| **Built-in API** | `new URL()` for URLs | ✅ High | ✅ Fast | ✅ Easy | Good |
| **Library** | `validator.js`, `yup` | ✅ High | Medium | ✅ Easy | ✅ Best |

**Recommended Stack:**
```javascript
// Frontend: Quick feedback
import validator from 'validator';

function validateEmail(email) {
  // Use library for consistency
  return validator.isEmail(email);
}

// Backend: Secure validation
app.post('/signup', async (req, res) => {
  const { email } = req.body;

  // Validate format
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  // Send verification email
  await sendVerificationEmail(email);

  res.json({ success: true });
});
```


</details>


<details>
<summary><strong>💬 Explain to Junior: Simple Analogy</strong></summary>


#### Simple Analogy

Think of **character classes** as **filters for a treasure hunt**:

**Without character class:** "Find the exact treasure: 'gold coin'"
**With character class:** "Find ANY treasure: gold coin, silver coin, or bronze coin"

```javascript
// Find exact word 'cat'
/cat/

// Find 'cat', 'cot', 'cut', or any 'c_t'
/c[aou]t/
```

It's like having a shopping list where you can say "buy ANY fruit" instead of listing every fruit!

#### Step-by-Step Explanation

**Level 1: Basic Character Classes**

```javascript
// Square brackets [ ] mean "match any ONE of these"
const pattern = /[abc]/;

pattern.test('a'); // true - 'a' is in the class
pattern.test('b'); // true - 'b' is in the class
pattern.test('x'); // false - 'x' is NOT in the class

// Real example: Match vowels
const vowels = /[aeiou]/gi;
'hello'.match(vowels); // ['e', 'o']
```

**Level 2: Ranges (Shortcuts)**

```javascript
// Instead of writing [abcdefghijklmnopqrstuvwxyz]
// Use a range: [a-z]

const lowercase = /[a-z]/;   // Any lowercase letter
const uppercase = /[A-Z]/;   // Any uppercase letter
const digits = /[0-9]/;      // Any digit

// Combine ranges
const alphanumeric = /[a-zA-Z0-9]/; // Letters OR numbers
```

**Level 3: Negated Classes (Opposite)**

```javascript
// ^ inside [ ] means "NOT these"
const notDigit = /[^0-9]/;

notDigit.test('a'); // true - 'a' is NOT a digit
notDigit.test('5'); // false - '5' IS a digit

// Real example: Remove all non-letters
const text = 'Hello123!';
const onlyLetters = text.replace(/[^a-zA-Z]/g, '');
console.log(onlyLetters); // 'Hello'
```

**Level 4: Shorthand Classes (Quick Codes)**

```javascript
// Instead of [0-9], use \d (digit)
/\d/     // Same as [0-9]
/\d+/    // One or more digits

// Instead of [a-zA-Z0-9_], use \w (word character)
/\w/     // Same as [a-zA-Z0-9_]
/\w+/    // One or more word characters

// Instead of [ \t\r\n], use \s (whitespace)
/\s/     // Space, tab, newline
/\s+/    // One or more whitespace

// Capital letters = opposite
/\D/     // NOT a digit (same as [^0-9])
/\W/     // NOT a word character
/\S/     // NOT whitespace
```

#### Common Validation Patterns (Copy-Paste Ready)

```javascript
// Email (simple)
const emailSimple = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

// Email (better)
const emailBetter = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone (US): 555-123-4567
const phone = /^\d{3}-\d{3}-\d{4}$/;

// Phone (flexible): (555) 123-4567 or 555-123-4567 or 555.123.4567
const phoneFlexible = /^(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

// Date: YYYY-MM-DD
const date = /^\d{4}-\d{2}-\d{2}$/;

// Username: letters, numbers, underscore, 3-16 chars
const username = /^[a-zA-Z0-9_]{3,16}$/;

// Password: 8+ chars, 1 upper, 1 lower, 1 digit
const password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Hex color: #FFF or #FF5733
const hexColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// URL: http://example.com or https://example.com
const url = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/;
```

#### Common Mistakes (and Fixes)

```javascript
// ❌ Mistake 1: Forgetting to escape special characters in classes
const wrong = /[.]/;  // Actually doesn't need escaping inside [ ]!
const right = /[.]/;  // Same! . is literal inside [ ]

// But escaping doesn't hurt
const alsoRight = /[\.]/; // Also works

// ❌ Mistake 2: Wrong position of ^
const wrong = /[abc]^/;  // ^ is literal, not anchor!
const right = /^[abc]/;  // ^ outside [ ] = anchor

// ❌ Mistake 3: Forgetting ^ and $ anchors
const wrong = /\d{4}/;           // Matches ANY 4 digits ANYWHERE
console.log(wrong.test('abc1234def')); // true (unintended)

const right = /^\d{4}$/;         // Matches ONLY 4 digits
console.log(right.test('1234'));       // true
console.log(right.test('abc1234def')); // false

// ❌ Mistake 4: Using [^...] when you meant ^[...]
const wrong = /[^abc]/;   // Matches anything NOT a, b, or c
const right = /^[abc]/;   // Matches a, b, or c at START

// ❌ Mistake 5: Not handling international characters
const wrong = /^[a-zA-Z]+$/;         // Rejects 'José'
const right = /^[\p{L}]+$/u;         // Accepts ALL letters (any language)
```

#### Interview Answer Template

**Question: "What are character classes in regex?"**

**Template Answer:**
```
"Character classes in regex allow you to match any one character from a set
of characters. They're defined using square brackets.

For example:
- [abc] matches 'a', 'b', or 'c'
- [a-z] matches any lowercase letter
- [0-9] matches any digit

There are also shorthand character classes:
- \d for digits (same as [0-9])
- \w for word characters (letters, numbers, underscore)
- \s for whitespace

You can negate a class with ^:
- [^0-9] matches anything that's NOT a digit

I use character classes frequently for validation, like checking if a username
only contains allowed characters: /^[a-zA-Z0-9_]{3,16}$/ ensures the username
is 3-16 characters and only contains letters, numbers, or underscores.

For international apps, I use Unicode property escapes like \p{L} to match
letters from any language, not just ASCII."
```

**Follow-up: "How do you validate an email with regex?"**

**Template Answer:**
```
"For email validation, I use a balanced pattern:

/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

Breaking it down:
- [a-zA-Z0-9._%+-]+ = username part (letters, numbers, some punctuation)
- @ = literal @
- [a-zA-Z0-9.-]+ = domain name
- \. = literal dot (escaped)
- [a-zA-Z]{2,} = domain extension (at least 2 letters)

This catches most typos while accepting valid emails. However, regex alone isn't
enough for email validation - I always verify emails work by sending a
confirmation link. Regex is just the first line of defense for obvious mistakes."
```

#### Practice Exercises

**Beginner:**
1. Write a regex to match any 3-digit number
2. Match words that contain only vowels
3. Remove all punctuation from a string
4. Validate a hex color code (#FFF or #FF5733)

**Intermediate:**
5. Match phone numbers in format: (555) 123-4567
6. Validate dates in MM/DD/YYYY format
7. Extract all hashtags from a tweet (#example)
8. Match words that start and end with the same letter

**Advanced:**
9. Validate strong passwords (8+ chars, upper, lower, digit, special)
10. Match Unicode names (any language)

**Solutions:**
```javascript
// 1. Three-digit number
/^\d{3}$/

// 2. Words with only vowels
/^[aeiou]+$/i

// 3. Remove punctuation
text.replace(/[^\w\s]/g, '')

// 4. Hex color
/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

// 5. Phone number
/^\(\d{3}\)\s\d{3}-\d{4}$/

// 6. Date MM/DD/YYYY
/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/

// 7. Hashtags
/#\w+/g

// 8. Same start/end letter
/\b([a-z])\w*\1\b/i

// 9. Strong password
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// 10. Unicode names
/^[\p{L}\p{M}]+$/u
```


</details>

---

## 📚 Additional Resources

- [MDN: Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [MDN: Character Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Character_Classes)
- [Regex101](https://regex101.com/) - Interactive regex tester with explanation
- [RegExr](https://regexr.com/) - Learn, build, and test regex
- [Unicode Character Database](https://unicode.org/reports/tr44/) - Unicode property reference
- [JavaScript.info: Regexp](https://javascript.info/regular-expressions)
