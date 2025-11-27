# Regular Expressions - Advanced Patterns

> **Focus**: JavaScript Regular Expressions advanced techniques and optimization

---

## Question 1: What are quantifiers and how do they work in regex?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Amazon, Microsoft, Shopify, Netflix

### Question

Explain regex quantifiers in JavaScript. What are the different types (*, +, ?, {n}, {n,}, {n,m})? How do greedy and lazy quantifiers differ? What is catastrophic backtracking and how can you avoid it? When would you use each quantifier type?

### Answer

**Quantifiers** specify how many times a pattern element should match. JavaScript regex supports several quantifier types with different matching behaviors.

#### Basic Quantifiers

1. **`*` (Zero or more)**: Matches 0 or more occurrences
   - Pattern: `/a*/` matches "", "a", "aa", "aaa"
   - Greedy by default

2. **`+` (One or more)**: Matches 1 or more occurrences
   - Pattern: `/a+/` matches "a", "aa", "aaa" but NOT ""
   - Greedy by default

3. **`?` (Zero or one)**: Matches 0 or 1 occurrence (optional)
   - Pattern: `/colou?r/` matches "color" and "colour"
   - Makes preceding element optional

#### Specific Count Quantifiers

4. **`{n}` (Exact count)**: Matches exactly n occurrences
   - Pattern: `/a{3}/` matches "aaa" only

5. **`{n,}` (Minimum count)**: Matches n or more occurrences
   - Pattern: `/a{2,}/` matches "aa", "aaa", "aaaa"

6. **`{n,m}` (Range)**: Matches between n and m occurrences
   - Pattern: `/a{2,4}/` matches "aa", "aaa", "aaaa"

#### Greedy vs Lazy Quantifiers

**Greedy** (default): Matches as much as possible while still allowing overall pattern to match
- Quantifiers: `*`, `+`, `?`, `{n,}`, `{n,m}`
- Algorithm: Match maximum, backtrack if pattern fails

**Lazy/Non-greedy**: Matches as little as possible while still allowing pattern to match
- Quantifiers: `*?`, `+?`, `??`, `{n,}?`, `{n,m}?`
- Add `?` after quantifier to make it lazy
- Algorithm: Match minimum, expand if pattern fails

#### Backtracking and Performance

**Greedy Algorithm:**
1. Match as many characters as possible
2. If pattern fails, backtrack one character
3. Try remaining pattern
4. Repeat until success or complete failure

**Catastrophic Backtracking:**
- Occurs with nested quantifiers on overlapping patterns
- Exponential time complexity O(2^n)
- Can cause ReDoS (Regular Expression Denial of Service)
- Common in patterns like `/(a+)+b/` or `/(a*)*b/`

#### When to Use Each

- **`*`**: Optional repeating elements (whitespace, comments)
- **`+`**: Required repeating elements (words, digits)
- **`?`**: Optional single elements (protocol in URL, plurals)
- **`{n}`**: Fixed-length codes (zip codes, phone numbers)
- **`{n,m}`**: Variable length with limits (passwords, usernames)
- **Lazy quantifiers**: Extracting content between delimiters

### Code Example

```javascript
// ==========================================
// BASIC QUANTIFIERS
// ==========================================

// * - Zero or more
const zeroOrMore = /bo*/;
console.log('b'.match(zeroOrMore));      // ['b']
console.log('bo'.match(zeroOrMore));     // ['bo']
console.log('booo'.match(zeroOrMore));   // ['booo']
console.log('x'.match(zeroOrMore));      // null

// + - One or more
const oneOrMore = /bo+/;
console.log('b'.match(oneOrMore));       // null (needs at least one 'o')
console.log('bo'.match(oneOrMore));      // ['bo']
console.log('booo'.match(oneOrMore));    // ['booo']

// ? - Zero or one (optional)
const optional = /colou?r/;
console.log('color'.match(optional));    // ['color']
console.log('colour'.match(optional));   // ['colour']
console.log('colouur'.match(optional));  // null

// Real-world: HTTP/HTTPS
const urlProtocol = /^https?:\/\//;
console.log(urlProtocol.test('http://example.com'));  // true
console.log(urlProtocol.test('https://example.com')); // true

// ==========================================
// SPECIFIC COUNT QUANTIFIERS
// ==========================================

// {n} - Exact count
const zipCode = /^\d{5}$/;
console.log(zipCode.test('12345'));      // true
console.log(zipCode.test('1234'));       // false
console.log(zipCode.test('123456'));     // false

// {n,} - Minimum count
const minThreeDigits = /^\d{3,}$/;
console.log(minThreeDigits.test('12'));      // false
console.log(minThreeDigits.test('123'));     // true
console.log(minThreeDigits.test('123456'));  // true

// {n,m} - Range count
const passwordLength = /^.{8,20}$/;
console.log(passwordLength.test('pass'));        // false (too short)
console.log(passwordLength.test('password123')); // true
console.log(passwordLength.test('a'.repeat(21))); // false (too long)

// Real-world: Phone number validation
const phoneNumber = /^\d{3}-?\d{3}-?\d{4}$/;
console.log(phoneNumber.test('123-456-7890')); // true
console.log(phoneNumber.test('1234567890'));   // true
console.log(phoneNumber.test('123-456-789'));  // false

// ==========================================
// GREEDY VS LAZY QUANTIFIERS
// ==========================================

// Greedy: matches as much as possible
const html = '<div>Hello</div><div>World</div>';

const greedyPattern = /<div>.*<\/div>/;
console.log(html.match(greedyPattern)[0]);
// Output: '<div>Hello</div><div>World</div>' (entire string!)

// Lazy: matches as little as possible
const lazyPattern = /<div>.*?<\/div>/;
console.log(html.match(lazyPattern)[0]);
// Output: '<div>Hello</div>' (first tag only)

// Visual comparison with quotes
const text = 'She said "Hello" and "World" today';

const greedy = /".*"/;
console.log(text.match(greedy)[0]);
// Output: '"Hello" and "World"' (greedy takes everything between first and last quote)

const lazy = /".*?"/;
console.log(text.match(lazy)[0]);
// Output: '"Hello"' (lazy stops at first closing quote)

// Get all quoted strings (use lazy with global flag)
const allQuotes = text.match(/".*?"/g);
console.log(allQuotes);
// Output: ['"Hello"', '"World"']

// ==========================================
// CATASTROPHIC BACKTRACKING
// ==========================================

// ❌ DANGEROUS: Nested quantifiers with overlapping patterns
const dangerousPattern = /(a+)+b/;
const evilInput = 'a'.repeat(25); // No 'b' at end

console.time('catastrophic');
try {
  dangerousPattern.test(evilInput);
  // This will take FOREVER (exponential time)
  // With 25 'a's, regex engine tries 2^25 = 33 million combinations!
} catch (e) {
  console.error('Timeout or crash');
}
console.timeEnd('catastrophic');

// ✅ SAFE: Atomic grouping alternative (use specific quantifier)
const safePattern = /a+b/;
console.time('safe');
safePattern.test(evilInput); // Fast failure
console.timeEnd('safe');
// Output: safe: <1ms

// Another catastrophic example
const htmlMatcher = /<.*>.*<\/.*>/; // ❌ DANGEROUS
const htmlLazy = /<.*?>.*?<\/.*?>/; // ✅ BETTER (but still not ideal)

// ❌ Email validation with nested quantifiers
const badEmail = /^([a-zA-Z0-9_\-\.]+)+@([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}$/;
// The + after groups causes catastrophic backtracking

// ✅ Email validation without nested quantifiers
const goodEmail = /^[a-zA-Z0-9_\-\.]+@[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}$/;

// ==========================================
// REAL-WORLD VALIDATION PATTERNS
// ==========================================

// Password: 8-20 chars, at least one digit
const passwordPattern = /^(?=.*\d).{8,20}$/;
console.log(passwordPattern.test('pass'));       // false (too short)
console.log(passwordPattern.test('password'));   // false (no digit)
console.log(passwordPattern.test('password1'));  // true

// Username: 3-16 alphanumeric/underscore
const usernamePattern = /^[a-zA-Z0-9_]{3,16}$/;
console.log(usernamePattern.test('ab'));         // false
console.log(usernamePattern.test('user_123'));   // true
console.log(usernamePattern.test('user@123'));   // false

// URL with optional protocol and www
const urlPattern = /^(https?:\/\/)?(www\.)?[\w\-]+(\.[\w\-]+)+$/;
console.log(urlPattern.test('example.com'));           // true
console.log(urlPattern.test('www.example.com'));       // true
console.log(urlPattern.test('https://example.com'));   // true

// Credit card (spaces optional)
const creditCard = /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/;
console.log(creditCard.test('1234567812345678'));        // true
console.log(creditCard.test('1234 5678 1234 5678'));    // true
console.log(creditCard.test('1234-5678-1234-5678'));    // true

// ==========================================
// PERFORMANCE COMPARISON
// ==========================================

// Testing different quantifier approaches
const testString = 'a'.repeat(1000) + 'b';

// Approach 1: Greedy with specific character
console.time('greedy-specific');
/a+b/.test(testString);
console.timeEnd('greedy-specific');
// Output: <1ms

// Approach 2: Lazy with specific character
console.time('lazy-specific');
/a+?b/.test(testString);
console.timeEnd('lazy-specific');
// Output: <1ms

// Approach 3: Greedy with wildcard
console.time('greedy-wildcard');
/.*b/.test(testString);
console.timeEnd('greedy-wildcard');
// Output: ~1ms

// Approach 4: Lazy with wildcard
console.time('lazy-wildcard');
/.*?b/.test(testString);
console.timeEnd('lazy-wildcard');
// Output: ~10ms (lazy is slower for this case)

// ==========================================
// EXTRACTING REPEATED PATTERNS
// ==========================================

// Extract all words (1+ letter characters)
const sentence = 'The quick brown fox jumps';
const words = sentence.match(/[a-z]+/gi);
console.log(words);
// Output: ['The', 'quick', 'brown', 'fox', 'jumps']

// Extract all numbers (including decimals)
const data = 'Price: $19.99, Discount: 15%, Total: $16.99';
const numbers = data.match(/\d+\.?\d*/g);
console.log(numbers);
// Output: ['19.99', '15', '16.99']

// Extract hashtags (1+ word characters after #)
const tweet = 'Learning #JavaScript and #RegEx today! #coding';
const hashtags = tweet.match(/#\w+/g);
console.log(hashtags);
// Output: ['#JavaScript', '#RegEx', '#coding']

// ==========================================
// OPTIONAL ELEMENTS WITH ?
// ==========================================

// Optional plural 's'
const pluralPattern = /books?/;
console.log('book'.match(pluralPattern));   // ['book']
console.log('books'.match(pluralPattern));  // ['books']

// Optional file extension
const filePattern = /^[\w\-]+\.(jpe?g|png)$/i;
console.log(filePattern.test('image.jpg'));  // true
console.log(filePattern.test('image.jpeg')); // true
console.log(filePattern.test('image.png'));  // true
console.log(filePattern.test('image.gif'));  // false

// Optional whitespace
const datePattern = /^\d{1,2}\/\s?\d{1,2}\/\s?\d{4}$/;
console.log(datePattern.test('12/31/2024'));   // true
console.log(datePattern.test('12/ 31/ 2024')); // true

// ==========================================
// COMMON MISTAKES
// ==========================================

// ❌ Mistake 1: Forgetting anchors with quantifiers
const weakZip = /\d{5}/;
console.log(weakZip.test('12345'));       // true ✓
console.log(weakZip.test('abc12345xyz')); // true ✗ (unwanted match)

// ✅ Fix: Use anchors
const strongZip = /^\d{5}$/;
console.log(strongZip.test('12345'));       // true ✓
console.log(strongZip.test('abc12345xyz')); // false ✓

// ❌ Mistake 2: Using greedy when lazy is needed
const extractTag = /<p>.*<\/p>/;
console.log('<p>First</p><p>Second</p>'.match(extractTag)[0]);
// Output: '<p>First</p><p>Second</p>' (too much!)

// ✅ Fix: Use lazy quantifier
const extractTagLazy = /<p>.*?<\/p>/;
console.log('<p>First</p><p>Second</p>'.match(extractTagLazy)[0]);
// Output: '<p>First</p>' (correct!)

// ❌ Mistake 3: Nested quantifiers
const nestedBad = /^(a+)+$/;
// Exponential backtracking on input like 'aaaaaaaaaaaaaaab'

// ✅ Fix: Flatten quantifiers
const nestedGood = /^a+$/;
// Linear time complexity
```


<details>
<summary><strong>🔍 Deep Dive: Quantifier Implementation in Regex Engines</strong></summary>


#### Quantifier Implementation in Regex Engines

JavaScript's regex engine (V8's Irregexp) implements quantifiers through a combination of:

1. **Bytecode Compilation**: Regex patterns compile to bytecode with specific quantifier instructions
2. **Backtracking State Machine**: Maintains stack of positions to try
3. **Optimization Passes**: Detects simple cases (like `a+`) for fast-path execution

**Internal Process for `/a{2,4}/`:**
```
1. Compile to bytecode:
   - CHECK_CHAR 'a'
   - PUSH_BACKTRACK (position + count state)
   - LOOP (min: 2, max: 4)
   - ADVANCE

2. Execution:
   - Match 'a' → increment count
   - Match 'a' → count = 2 (minimum reached)
   - Try to match more 'a' (greedy)
   - If next 'a' found and count < 4, continue
   - Save state before each additional match
   - Continue with rest of pattern
```

#### Backtracking Algorithm Deep Dive

**Greedy Quantifier Backtracking (`.*b` on "aaab"):**

```
Step 1: .* matches "aaab" (greedy - takes everything)
        Position: [aaab]|

Step 2: Try to match 'b' at end
        No characters left → FAIL

Step 3: Backtrack - .* gives back one character
        Position: [aaa]b|

Step 4: Try to match 'b' at position 3
        Match found! SUCCESS

Total steps: 4 (linear with backtrack)
```

**Lazy Quantifier Matching (`.*?b` on "aaab"):**

```
Step 1: .*? matches "" (lazy - takes minimum)
        Position: |[aaab]

Step 2: Try to match 'b' at position 0
        Found 'a' → FAIL

Step 3: .*? matches "a"
        Position: a|[aab]

Step 4: Try to match 'b' at position 1
        Found 'a' → FAIL

Step 5: .*? matches "aa"
        Position: aa|[ab]

Step 6: Try to match 'b' at position 2
        Found 'a' → FAIL

Step 7: .*? matches "aaa"
        Position: aaa|[b]

Step 8: Try to match 'b' at position 3
        Match found! SUCCESS

Total steps: 8 (more steps but still linear)
```

#### Catastrophic Backtracking Analysis

**Pattern:** `/(a+)+b/` on input `"aaaaaaaaab"` (10 a's)

**Why it's catastrophic:**
1. Outer `+` can split input into groups many ways
2. Inner `+` can match different lengths
3. Engine tries ALL possible combinations

**Combinations for 3 a's before failing:**
```
(aaa) - 1 group
(aa)(a) - 2 groups
(a)(aa) - 2 groups
(a)(a)(a) - 3 groups

Total: 4 combinations for just 3 characters
```

**For n characters:** 2^(n-1) combinations

**With 10 a's:** 2^9 = 512 combinations
**With 20 a's:** 2^19 = 524,288 combinations
**With 30 a's:** 2^29 = 536,870,912 combinations (server crash!)

**Time Complexity:**
- Best case: O(n) for simple patterns
- Worst case: O(2^n) for nested quantifiers
- Space: O(n) for backtracking stack

#### V8 Regex Optimization Strategies

**1. Fast Path Detection:**
```javascript
// V8 detects simple patterns and uses optimized code
/abc/          // Fast: literal string search
/a+/           // Fast: single-character repetition
/[a-z]+/       // Fast: character class repetition
/a+b+c+/       // Fast: sequential repetitions
/(a+)+b/       // Slow: nested quantifiers (backtracking)
```

**2. JIT Compilation:**
- Frequently used patterns compiled to machine code
- First few executions interpreted
- Hot patterns (>100 calls) get JIT compiled

**3. Irregexp Engine Optimizations:**
```
- Quick check: Analyzes pattern to see if match is possible
- Boyer-Moore: For literal string searches
- Character class bitmaps: Fast character class matching
- Backtracking limit: Prevents infinite loops (engine-specific)
```

**4. Memory Optimization:**
```javascript
// Regex objects are cached
const pattern = /test/;
// Same pattern reused → uses cached compiled version

// vs creating new regex each time
function check(str) {
  return /test/.test(str); // Recompiles every call (slower)
}
```

#### Memory Usage During Backtracking

**Backtracking Stack Structure:**
```javascript
// Each backtracking point stores:
{
  position: 5,           // Position in string (4 bytes)
  captureRegisters: [],  // Captured group values (8n bytes)
  quantifierCount: 3,    // Current quantifier iteration (4 bytes)
  instruction: 142       // Bytecode instruction pointer (4 bytes)
}

// Memory per backtrack point: ~20 bytes + captured groups
// Maximum stack depth: Usually limited to ~10,000 entries
// Total max memory: ~200KB for backtracking stack
```

**For catastrophic backtracking:**
```
Input: 30 'a' characters
Pattern: /(a+)+b/

Stack entries: 2^29 potential (536 million)
Memory needed: 10GB+ (causes crash before this)
V8 limit: Usually kills regex after 1-10 seconds
```

#### Performance Benchmarks

**Test: Matching 1000 'a' characters:**

```javascript
const input = 'a'.repeat(1000);

// Pattern 1: Specific character greedy
console.time('a+');
/a+/.test(input);
console.timeEnd('a+');
// Result: 0.05ms - V8 fast path

// Pattern 2: Wildcard greedy
console.time('.*');
/.*/.test(input);
console.timeEnd('.*');
// Result: 0.2ms - general backtracking

// Pattern 3: Character class greedy
console.time('[a]+');
/[a]+/.test(input);
console.timeEnd('[a]+');
// Result: 0.1ms - bitmap optimization

// Pattern 4: Lazy quantifier
console.time('a+?');
/a+?a/.test(input + 'a');
console.timeEnd('a+?');
// Result: 50ms - many iterations

// Pattern 5: Nested quantifiers (DANGEROUS)
console.time('(a+)+');
try {
  /(a+)+/.test(input);
} catch (e) {
  console.log('Killed by engine');
}
console.timeEnd('(a+)+');
// Result: TIMEOUT or 10000ms (engine limit)
```

**Benchmark Results:**

| Pattern | Input Length | Time (ms) | Memory |
|---------|--------------|-----------|--------|
| `a+` | 1,000 | 0.05 | 1KB |
| `a+` | 10,000 | 0.5 | 10KB |
| `a+` | 100,000 | 5 | 100KB |
| `.*` | 1,000 | 0.2 | 2KB |
| `(a+)+` | 10 | 1 | 5KB |
| `(a+)+` | 20 | 1000 | 50MB |
| `(a+)+` | 30 | TIMEOUT | N/A |


</details>


<details>
<summary><strong>🐛 Real-World Scenario: Context: Markdown Parser for Blog Platform (Medium-like)</strong></summary>


#### Context: Markdown Parser for Blog Platform (Medium-like)

**System:** Node.js blog platform serving 2M posts/day
**Traffic:** 50,000 concurrent users, 500 req/s to parser
**Tech Stack:** Express.js, markdown-it library (custom plugins)

#### Problem: Server Hanging on Specific Markdown Inputs

**Timeline:**
- **10:15 AM**: Alert - API response time jumped from 50ms → 30s
- **10:17 AM**: 503 errors, CPU at 99% on 8 app servers
- **10:20 AM**: Load balancer health checks failing, cascading failures
- **10:25 AM**: Total outage, 0 successful requests

**User Impact:**
- Blog posts not loading
- Publishing new content failing
- Mobile app crashes
- Social media complaints flooding in

#### Impact Metrics

**Downtime:** 47 minutes
**Cost:** $12,400 (SLA penalties + lost revenue)
**Affected Users:** 28,000 concurrent users
**Failed Requests:** 1.4 million
**CPU Utilization:** 99% sustained on all 8 servers
**Memory:** Ballooning from 2GB → 6GB per server before OOM

#### Debugging Process

**Step 1: Initial Investigation**
```bash
# Check Node.js processes
$ top
# PID 1234: node - 98.7% CPU, 5.9GB RAM

# Attach Node.js profiler
$ node --inspect app.js
$ chrome://inspect

# CPU Profile showed 99% time in markdown parsing
# Call stack showed regex execution
```

**Step 2: Analyze Logs**
```javascript
// Found this in application logs (repeated):
[ERROR] Request timeout after 30s
[ERROR] URL: /api/posts/12345/render
[ERROR] Stack trace:
  at RegExp.test (native)
  at parseHeadings (markdown-plugin.js:42)
  at renderMarkdown (parser.js:108)
```

**Step 3: Isolate the Input**
```javascript
// Retrieved the problematic post content from database
const problematicPost = db.posts.findOne({ id: 12345 });
console.log(problematicPost.content);

// Output: Post with 50 lines of repeated '#' characters
// (Someone pasted a large hash/code block)
/*
##########################################
##########################################
##########################################
... (50 lines)
*/
```

**Step 4: Reproduce Locally**
```javascript
// markdown-plugin.js (the culprit)
function parseHeadings(text) {
  // ❌ DANGEROUS REGEX with nested quantifiers
  const headingPattern = /^(#+\s+.*)+$/gm;

  return text.replace(headingPattern, (match) => {
    // Transform to HTML heading
    const level = match.match(/^#+/)[0].length;
    const content = match.replace(/^#+\s+/, '');
    return `<h${level}>${content}</h${level}>`;
  });
}

// Test with evil input
const evilInput = '#'.repeat(40) + '\n';
console.time('parse');
parseHeadings(evilInput.repeat(50));
console.timeEnd('parse');
// Result: HANGS (Ctrl+C to kill)
```

**Step 5: Profile the Regex**
```javascript
// Analyze backtracking behavior
const pattern = /^(#+\s+.*)+$/;
const input = '####################'; // 20 hashes, no space

// Manual trace of backtracking:
// Pattern tries to match:
// - (# # # # # # # # # # # # # # # # # # # #)+  - fails (no \s)
// - (# # # # # # # # # # # # # # # # # # #)(#)+  - fails
// - (# # # # # # # # # # # # # # # # # #)(# #)+  - fails
// ... continues trying 2^20 = 1,048,576 combinations!

// With 40 hashes: 2^40 = 1.1 TRILLION combinations
```

#### Root Cause Analysis

**The Problematic Pattern:** `/^(#+\s+.*)+$/gm`

**Issues:**
1. **Nested quantifiers:** `(#+...)+` - both `+` inside and outside parentheses
2. **Overlapping matches:** `#` can match in multiple groups
3. **Catastrophic backtracking:** Exponential combinations when match fails
4. **No backtracking limit:** Pattern kept trying until timeout

**Why it happened:**
```javascript
// Input: "#################### (no space or content)"

// The pattern /^(#+\s+.*)+$/ tries to match:
// - Group 1: "# # # # # # # # ... # (+ whitespace + content)"
// - Repeating: "(group 1)+"

// When no \s found, regex backtracks:
// - Try 1 group of 20 hashes → fail
// - Try 2 groups (19+1, 18+2, 17+3...) → all fail
// - Try 3 groups (18+1+1, 17+2+1...) → all fail
// - Try 4 groups... → all fail
// ... continues until 2^20 combinations exhausted

// Time complexity: O(2^n) where n = number of # characters
// With 40 hashes: literally years to complete
```

#### Solution Implementation

**Immediate Fix (Deployed in 10 minutes):**
```javascript
// ✅ SAFE: Removed nested quantifier, added specific requirements
function parseHeadings(text) {
  // Match only valid headings (1-6 hashes, space, content)
  const headingPattern = /^(#{1,6})\s+(.+)$/gm;

  return text.replace(headingPattern, (match, hashes, content) => {
    const level = hashes.length;
    return `<h${level}>${content}</h${level}>`;
  });
}

// Performance test
const evilInput = '#'.repeat(40) + '\n';
console.time('parse-fixed');
parseHeadings(evilInput.repeat(50));
console.timeEnd('parse-fixed');
// Result: 2ms ✓ (99.9% improvement)
```

**Long-term Solution (Deployed next day):**

**1. Input Sanitization:**
```javascript
function sanitizeMarkdown(text) {
  // Limit line length to prevent massive inputs
  const lines = text.split('\n').map(line => {
    if (line.length > 1000) {
      return line.substring(0, 1000) + '...';
    }
    return line;
  });

  // Limit total size
  const sanitized = lines.join('\n');
  if (sanitized.length > 100000) {
    throw new Error('Markdown content too large (max 100KB)');
  }

  return sanitized;
}
```

**2. Regex Timeout Wrapper:**
```javascript
function safeRegexTest(pattern, text, timeoutMs = 100) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('regex-worker.js');

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error(`Regex timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    worker.postMessage({ pattern: pattern.source, text });

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve(e.data.result);
    };
  });
}

// Usage
async function parseHeadingsSafe(text) {
  try {
    const headingPattern = /^(#{1,6})\s+(.+)$/gm;
    const result = await safeRegexTest(headingPattern, text);
    // ... process result
  } catch (err) {
    console.error('Regex timeout, using fallback parser');
    return fallbackParse(text);
  }
}
```

**3. Regex Firewall (Prevention):**
```javascript
// Detect dangerous regex patterns during deployment
function analyzeRegexSafety(pattern) {
  const patternStr = pattern.source;

  // Check for nested quantifiers
  const nestedQuantifiers = /(\*|\+|\{[\d,]+\})[^\)]*(\*|\+|\{[\d,]+\})/;
  if (nestedQuantifiers.test(patternStr)) {
    console.warn('⚠️  Potential catastrophic backtracking detected');
    console.warn('Pattern:', patternStr);
    return false;
  }

  // Check for overlapping groups
  const overlappingGroups = /\([^)]*(\*|\+)[^)]*\)(\*|\+)/;
  if (overlappingGroups.test(patternStr)) {
    console.warn('⚠️  Overlapping groups detected');
    return false;
  }

  return true;
}

// Use in tests
describe('Regex Safety', () => {
  it('should reject dangerous patterns', () => {
    const dangerous = /^(a+)+$/;
    expect(analyzeRegexSafety(dangerous)).toBe(false);
  });

  it('should accept safe patterns', () => {
    const safe = /^a+$/;
    expect(analyzeRegexSafety(safe)).toBe(true);
  });
});
```

**4. Monitoring & Alerts:**
```javascript
// Add regex execution time tracking
function monitoredReplace(text, pattern, replacer) {
  const start = performance.now();

  const result = text.replace(pattern, replacer);

  const duration = performance.now() - start;

  // Log slow regex operations
  if (duration > 10) {
    logger.warn('Slow regex detected', {
      pattern: pattern.source,
      duration,
      textLength: text.length,
      matches: result.split(pattern).length - 1
    });
  }

  // Alert on very slow operations
  if (duration > 100) {
    alerting.trigger('slow-regex', {
      pattern: pattern.source,
      duration
    });
  }

  return result;
}
```

#### Results

**Performance Improvements:**
- **Response time:** 30s → 45ms (99.8% reduction)
- **CPU usage:** 99% → 12% average
- **Memory:** Stable at 2GB (no more spikes)
- **Throughput:** Restored to 500 req/s

**Reliability:**
- **Incidents:** 0 hangs in 6 months post-fix
- **Uptime:** 99.99% (vs 99.1% before)
- **Alert triggers:** 0 regex timeouts

**Safety Measures:**
- ✅ Input sanitization (max 100KB markdown)
- ✅ Regex timeout wrapper (100ms limit)
- ✅ Dangerous pattern detection in CI/CD
- ✅ Real-time regex performance monitoring
- ✅ Automated tests for ReDoS vulnerabilities

**Cost Savings:**
- No more SLA penalty incidents ($12k/incident)
- Reduced server capacity needs (8 → 6 servers)
- Saved $4,800/month in infrastructure costs


</details>


<details>
<summary><strong>⚖️ Trade-offs: Greedy vs Lazy Quantifiers</strong></summary>


#### Greedy vs Lazy Quantifiers

**Greedy (`*`, `+`, `?`, `{n,m}`):**

**Pros:**
- Default behavior (no extra syntax)
- Faster for patterns matching entire string
- Better for extracting maximum content
- Intuitive for most use cases

**Cons:**
- Can match too much (needs backtracking)
- Worse performance when stopping early is desired
- Harder to extract first match in repeated patterns

**Best for:**
- Validating entire strings (emails, URLs)
- Extracting to end of line/string
- When maximum match is desired

**Lazy (`*?`, `+?`, `??`, `{n,m}?`):**

**Pros:**
- Stops at first valid match
- Better for extracting delimited content
- More predictable with nested patterns
- Prevents over-matching

**Cons:**
- Extra character to remember (`?`)
- Slower when matching entire string
- More iterations for long matches
- Less intuitive for beginners

**Best for:**
- Extracting content between delimiters (quotes, tags)
- Stopping at first occurrence
- Parsing structured data

**Decision Matrix:**

| Task | Use | Example |
|------|-----|---------|
| Extract first quoted string | Lazy | `/".*?"/.exec(str)` |
| Validate entire email | Greedy | `/^.+@.+\..+$/` |
| Extract all HTML tags | Lazy | `/<.*?>/g` |
| Match to end of line | Greedy | `/start.*/` |
| Extract URL parameters | Lazy | `/\?.*?&/` |

**Performance Comparison:**
```javascript
const text = 'a'.repeat(10000) + 'b';

// Greedy: Fast when matching to end
console.time('greedy');
/a+b/.test(text);
console.timeEnd('greedy'); // ~0.5ms

// Lazy: Slower due to many iterations
console.time('lazy');
/a+?b/.test(text);
console.timeEnd('lazy'); // ~5ms
```

#### Specific Counts vs Ranges

**Exact Count `{n}`:**

**Pros:**
- Fastest (no backtracking)
- Clear intent
- Deterministic behavior
- Easy to validate

**Cons:**
- Inflexible (requires exact match)
- Multiple patterns needed for variations
- Not suitable for variable-length data

**Best for:** Fixed-format codes (SSN, phone, zip)

**Range `{n,m}`:**

**Pros:**
- Flexible (accepts variations)
- Single pattern for range
- More user-friendly validation
- Handles edge cases

**Cons:**
- Slower (tries all lengths)
- Less predictable
- May match unintended lengths
- Requires backtracking

**Best for:** Passwords, usernames, flexible inputs

**Benchmark:**
```javascript
const input = '12345';

// Exact count - instant match
console.time('exact');
/^\d{5}$/.test(input);
console.timeEnd('exact'); // 0.01ms

// Range - slightly slower
console.time('range');
/^\d{3,7}$/.test(input);
console.timeEnd('range'); // 0.02ms

// Difference negligible for small inputs
// But scales: for 1M validations, 10ms vs 20ms
```

#### Different Approaches to Same Pattern

**Task:** Extract email domain

**Approach 1: Greedy with split**
```javascript
const email = 'user@example.com';
const domain = email.split('@')[1]; // 'example.com'

// Pros: Simple, fast, no regex
// Cons: Doesn't validate, breaks on invalid input
// Performance: 0.001ms
```

**Approach 2: Capturing group**
```javascript
const domain = email.match(/@(.+)$/)[1]; // 'example.com'

// Pros: Validates format, extracts in one step
// Cons: Requires regex knowledge, can fail
// Performance: 0.01ms
```

**Approach 3: Lookbehind (ES2018+)**
```javascript
const domain = email.match(/(?<=@).+$/)[0]; // 'example.com'

// Pros: No capturing group, clean extraction
// Cons: Browser compatibility, slower
// Performance: 0.05ms
```

**Approach 4: String methods**
```javascript
const atIndex = email.indexOf('@');
const domain = email.substring(atIndex + 1); // 'example.com'

// Pros: Fastest, no regex, simple
// Cons: Manual logic, no validation
// Performance: 0.0005ms
```

**Decision Matrix:**

| Approach | Speed | Validation | Readability | Compatibility |
|----------|-------|------------|-------------|---------------|
| Split | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Capturing | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Lookbehind | ⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Substring | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Recommendation:** Use capturing group for balance of performance, validation, and compatibility.


</details>


<details>
<summary><strong>💬 Explain to Junior: Simple Analogy: Quantifiers as "How Many" Instructions</strong></summary>


#### Simple Analogy: Quantifiers as "How Many" Instructions

Think of quantifiers like ordering food:

**`*` (zero or more)** = "I'll take fries... or not, up to you"
- Can have 0 fries (none) or infinite fries
- Example: `/colou*r/` matches "color" (0 u's) or "colouur" (2 u's)

**`+` (one or more)** = "I need at least ONE burger, but I'll take more"
- Must have at least 1, can have infinite
- Example: `/go+d/` matches "god", "good", "goood" (needs at least one 'o')

**`?` (zero or one)** = "Mayo? Optional, but only one serving"
- Either 0 or 1, no more
- Example: `/https?/` matches "http" or "https"

**`{3}` (exact)** = "I want EXACTLY 3 tacos"
- No more, no less
- Example: `/\d{3}/` matches "123" (exactly 3 digits)

**`{2,5}` (range)** = "Give me 2 to 5 sodas"
- Minimum 2, maximum 5
- Example: `/.{8,20}/` matches passwords 8-20 characters

#### Greedy vs Lazy: The Cookie Monster vs Polite Guest

**Greedy (default):** Cookie Monster approach
```javascript
// Cookie Monster sees a jar and takes ALL cookies
const cookies = 'cookie cookie cookie';
const greedy = /cookie.*/;  // Takes ALL remaining

console.log(cookies.match(greedy)[0]);
// Output: "cookie cookie cookie" (took everything!)
```

**Lazy:** Polite guest approach
```javascript
// Polite guest takes just enough
const cookies = 'cookie cookie cookie';
const lazy = /cookie.*?cookie/;  // Takes minimum needed

console.log(cookies.match(lazy)[0]);
// Output: "cookie cookie" (stopped at first match!)
```

#### Visual Step-by-Step: Greedy vs Lazy

**Text:** `"Hello" and "World"`
**Pattern:** `/".*"/` (greedy)

```
Step 1: Match first "
        |"Hello" and "World"|
        ↑

Step 2: .* matches EVERYTHING until last "
        |"Hello" and "World"|
         ^^^^^^^^^^^^^^^^^^^^

Result: "Hello" and "World"  (too much!)
```

**Pattern:** `/".*?"/` (lazy)

```
Step 1: Match first "
        |"Hello" and "World"|
        ↑

Step 2: .*? matches MINIMUM until next "
        |"Hello" and "World"|
         ^^^^^^

Result: "Hello"  (perfect!)
```

#### Common Mistakes and How to Avoid

**Mistake 1: Forgetting the `?` for lazy matching**

```javascript
// ❌ Wrong: Greedy takes too much
const html = '<p>First</p><p>Second</p>';
const wrong = /<p>.*<\/p>/;
console.log(html.match(wrong)[0]);
// Output: '<p>First</p><p>Second</p>' ❌

// ✅ Right: Lazy stops at first closing tag
const right = /<p>.*?<\/p>/;
console.log(html.match(right)[0]);
// Output: '<p>First</p>' ✅
```

**Mistake 2: Nested quantifiers (catastrophic backtracking)**

```javascript
// ❌ DANGER: Pattern can hang server!
const danger = /(a+)+b/;
const evilInput = 'aaaaaaaaaa'; // Just 10 a's, no 'b'

// This tries 2^10 = 1,024 combinations!
// With 20 a's: 2^20 = 1 million combinations
// With 30 a's: Your server dies

// ✅ SAFE: Remove nested quantifier
const safe = /a+b/;
// Tries once, fails fast
```

**Mistake 3: Not using anchors**

```javascript
// ❌ Matches anywhere in string
const weak = /\d{5}/;
console.log(weak.test('abc12345xyz')); // true ❌ (unwanted)

// ✅ Matches entire string only
const strong = /^\d{5}$/;
console.log(strong.test('abc12345xyz')); // false ✅
console.log(strong.test('12345'));       // true ✅
```

#### Interview Answer Template

**Question:** "Explain greedy vs lazy quantifiers with an example."

**Answer:**

"Quantifiers in regex specify how many times a pattern should match. By default, they're **greedy**, meaning they match as much as possible while still allowing the overall pattern to succeed.

For example, if I have the pattern `/".*"/` on the string `"Hello" and "World"`, the greedy `.*` will match everything between the first and last quote, giving me `"Hello" and "World"`.

**Lazy quantifiers** match as little as possible. By adding a question mark after the quantifier (`.*?`), the pattern stops at the first valid match. So `/".*?"/` on the same string gives me just `"Hello"`.

Use **greedy** when you want to match to the end, like validating entire strings. Use **lazy** when extracting content between delimiters, like getting text between quotes or HTML tags.

A common gotcha is **catastrophic backtracking** with nested quantifiers like `/(a+)+/`. This can cause exponential time complexity. Always avoid patterns where the same input can match in multiple ways."

**Example:**
```javascript
// Greedy: extract entire line
const greedy = /start.*/;  // Matches "start" to end of line

// Lazy: extract between tags
const lazy = /<div>.*?<\/div>/;  // Stops at first closing tag

// Specific count: validation
const exact = /^\d{5}$/;  // Exactly 5 digits
```

#### Practice Exercises

**Exercise 1:** Write a regex to match optional "www." in URLs
```javascript
// Your answer:
const pattern = /^https?:\/\/(www\.)?/;

// Test:
console.log(pattern.test('https://example.com'));     // true
console.log(pattern.test('https://www.example.com')); // true
```

**Exercise 2:** Extract all hashtags from a tweet (1+ word characters after #)
```javascript
// Your answer:
const hashtags = 'Love #JavaScript and #Regex!'.match(/#\w+/g);
console.log(hashtags); // ['#JavaScript', '#Regex']
```

**Exercise 3:** Validate password (8-20 chars)
```javascript
// Your answer:
const password = /^.{8,20}$/;

console.log(password.test('short'));   // false
console.log(password.test('goodpass123')); // true
```

**Exercise 4:** Extract text between quotes (use lazy)
```javascript
// Your answer:
const text = 'She said "Hello" and "World"';
const quotes = text.match(/".*?"/g);
console.log(quotes); // ['"Hello"', '"World"']
```


</details>

---

## Question 2: What are lookaheads, lookbehinds, and capturing groups?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Airbnb

### Question

Explain regex assertions (lookaheads and lookbehinds) and capturing groups in JavaScript. What's the difference between positive/negative lookahead `(?=...)` `(?!...)` and lookbehind `(?<=...)` `(?<!...)`? How do capturing groups `(...)`, non-capturing groups `(?:...)`, and named groups `(?<name>...)` work? When would you use each? What are backreferences and how are they used?

### Answer

#### Zero-Width Assertions (Lookaround)

**Zero-width** means the assertion matches a position, not characters. The engine checks if a pattern exists ahead/behind but doesn't consume characters.

#### Lookahead Assertions

**Positive Lookahead `(?=...)`**: Asserts that pattern ahead matches
```javascript
// Syntax: x(?=y) - matches x only if followed by y
const pattern = /\d(?=px)/;
'12px'.match(pattern); // ['1'] - matches '1' before 'px'
```

**Negative Lookahead `(?!...)`**: Asserts that pattern ahead does NOT match
```javascript
// Syntax: x(?!y) - matches x only if NOT followed by y
const pattern = /\d(?!px)/;
'12px 12pt'.match(pattern); // ['2', '1', '2'] - digits not before 'px'
```

#### Lookbehind Assertions (ES2018)

**Positive Lookbehind `(?<=...)`**: Asserts that pattern behind matches
```javascript
// Syntax: (?<=y)x - matches x only if preceded by y
const pattern = /(?<=\$)\d+/;
'$100'.match(pattern); // ['100'] - matches digits after '$'
```

**Negative Lookbehind `(?<!...)`**: Asserts that pattern behind does NOT match
```javascript
// Syntax: (?<!y)x - matches x only if NOT preceded by y
const pattern = /(?<!\$)\d+/;
'$100 200'.match(pattern); // ['00', '200'] - digits not after '$'
```

#### Capturing Groups

**Capturing Groups `(...)`**: Groups pattern and captures matched text
- Creates a numbered reference ($1, $2, etc.)
- Accessible via match array or replace function
- Used for extracting parts of a match

```javascript
const pattern = /(\d{3})-(\d{3})-(\d{4})/;
const match = '123-456-7890'.match(pattern);
// match[1] = '123', match[2] = '456', match[3] = '7890'
```

**Non-Capturing Groups `(?:...)`**: Groups pattern without capturing
- Groups for applying quantifiers
- No memory overhead
- Faster than capturing groups
- Use when you don't need the captured text

```javascript
const pattern = /(?:https?):\/\//;
// Groups 'http' or 'https' but doesn't capture
```

**Named Capturing Groups `(?<name>...)`** (ES2018): Named references instead of numbers
- More readable than numbered groups
- Accessible via `groups` property
- Self-documenting patterns

```javascript
const pattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = '2024-12-31'.match(pattern);
// match.groups.year = '2024'
// match.groups.month = '12'
// match.groups.day = '31'
```

#### Backreferences

**Numbered Backreferences `\1`, `\2`**: Reference captured group by number
```javascript
// \1 refers to first capturing group
const duplicateWord = /\b(\w+)\s+\1\b/;
'hello hello'.match(duplicateWord); // Matches repeated word
```

**Named Backreferences `\k<name>`**: Reference named group
```javascript
const pattern = /(?<quote>['"]).*?\k<quote>/;
'"hello"'.match(pattern);  // Matches same quote type
"'world'".match(pattern);  // Matches same quote type
```

#### When to Use Each

**Lookahead:**
- Password validation (multiple conditions)
- Validating format without consuming characters
- Complex validation rules

**Lookbehind:**
- Extracting values after prefix
- Currency amounts, units
- Context-dependent matching

**Capturing Groups:**
- Extracting parts of a match (dates, phones, URLs)
- Reordering in replace operations
- Backreferences for finding duplicates

**Non-Capturing Groups:**
- Grouping for quantifiers without memory overhead
- Performance optimization
- When you only need grouping, not extraction

**Named Groups:**
- Complex patterns with many groups
- Self-documenting code
- When numbered references are confusing

### Code Example

```javascript
// ==========================================
// POSITIVE LOOKAHEAD (?=...)
// ==========================================

// Match word followed by exclamation
const excited = /\w+(?=!)/;
console.log('Hello! World.'.match(excited));
// Output: ['Hello'] - matches 'Hello' before '!'

// Password: must contain digit (lookahead)
const hasDigit = /^(?=.*\d).+$/;
console.log(hasDigit.test('password'));   // false
console.log(hasDigit.test('password1'));  // true

// Complex password validation (multiple lookaheads)
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
console.log(strongPassword.test('weak'));           // false
console.log(strongPassword.test('Weak123'));        // false (no special char)
console.log(strongPassword.test('Strong123!'));     // true ✓

// Breakdown:
// (?=.*[a-z])  - must contain lowercase
// (?=.*[A-Z])  - must contain uppercase
// (?=.*\d)     - must contain digit
// (?=.*[@$!%*?&]) - must contain special char
// .{8,}        - minimum 8 characters

// Find numbers followed by 'px' (CSS units)
const pxValues = '12px 14pt 16px 18em'.match(/\d+(?=px)/g);
console.log(pxValues);
// Output: ['12', '16'] - only digits before 'px'

// ==========================================
// NEGATIVE LOOKAHEAD (?!...)
// ==========================================

// Match word NOT followed by exclamation
const notExcited = /\w+(?!!)/g;
console.log('Hello! World.'.match(notExcited));
// Output: ['Hello', 'World'] - both match (different logic than you might expect)

// Better example: Match digits NOT followed by 'px'
const notPx = /\d+(?!px)\b/g;
console.log('12px 14pt 16px 18em'.match(notPx));
// Output: ['14', '18'] - digits not before 'px'

// Validate: no consecutive repeated characters
const noRepeats = /^(?!.*(.)\1).+$/;
console.log(noRepeats.test('hello'));   // false (has 'll')
console.log(noRepeats.test('world'));   // true
console.log(noRepeats.test('aabbcc'));  // false

// Exclude certain usernames
const noAdmin = /^(?!admin|root|test)\w+$/i;
console.log(noAdmin.test('admin'));     // false
console.log(noAdmin.test('user123'));   // true
console.log(noAdmin.test('root'));      // false

// ==========================================
// POSITIVE LOOKBEHIND (?<=...)
// ==========================================

// Extract price (digits after $)
const price = /(?<=\$)\d+(\.\d{2})?/;
console.log('Price: $99.99'.match(price));
// Output: ['99.99'] - extracts amount after '$'

// Extract all prices
const prices = 'Items: $10, $20.50, €30'.match(/(?<=\$)\d+(\.\d{2})?/g);
console.log(prices);
// Output: ['10', '20.50'] - only after '$', not '€'

// Extract @mentions (after @)
const mentions = '@john said hi to @jane'.match(/(?<=@)\w+/g);
console.log(mentions);
// Output: ['john', 'jane']

// Extract hashtags (after #)
const hashtags = 'Love #JavaScript #Regex'.match(/(?<=#)\w+/g);
console.log(hashtags);
// Output: ['JavaScript', 'Regex']

// Extract URL protocol (digits after version string)
const version = 'Version v1.2.3'.match(/(?<=v)\d+\.\d+\.\d+/);
console.log(version);
// Output: ['1.2.3']

// ==========================================
// NEGATIVE LOOKBEHIND (?<!...)
// ==========================================

// Match digits NOT preceded by '$'
const notCurrency = /(?<!\$)\d+/g;
console.log('$100 200 $300'.match(notCurrency));
// Output: ['00', '200', '00'] - digits not after '$'
// (Note: '00' from $100 and $300 because '1' and '3' ARE after $)

// Better example: Match whole numbers not preceded by '$'
const notPrice = /(?<!\$)\b\d+\b/g;
console.log('$100 200 $300 400'.match(notPrice));
// Output: ['200', '400']

// Match words NOT preceded by '@' (non-mentions)
const notMentions = /(?<!@)\b\w{3,}\b/g;
console.log('@john said hello world'.match(notMentions));
// Output: ['said', 'hello', 'world'] - excludes 'john' after '@'

// Match emails NOT from gmail
const notGmail = /\b[\w.]+@(?!gmail\.com)\w+\.\w+\b/g;
console.log('user@gmail.com admin@company.com'.match(notGmail));
// Output: ['admin@company.com']

// ==========================================
// CAPTURING GROUPS (...)
// ==========================================

// Basic capture: phone number parts
const phone = /(\d{3})-(\d{3})-(\d{4})/;
const phoneMatch = '123-456-7890'.match(phone);
console.log(phoneMatch[0]); // '123-456-7890' (full match)
console.log(phoneMatch[1]); // '123' (area code)
console.log(phoneMatch[2]); // '456' (prefix)
console.log(phoneMatch[3]); // '7890' (line number)

// Date parsing: extract year, month, day
const datePattern = /(\d{4})-(\d{2})-(\d{2})/;
const dateMatch = '2024-12-31'.match(datePattern);
const [fullDate, year, month, day] = dateMatch;
console.log({ year, month, day });
// Output: { year: '2024', month: '12', day: '31' }

// URL parsing: protocol, domain, path
const urlPattern = /(https?):\/\/([^/]+)(\/.*)?/;
const urlMatch = 'https://example.com/path'.match(urlPattern);
console.log(urlMatch[1]); // 'https' (protocol)
console.log(urlMatch[2]); // 'example.com' (domain)
console.log(urlMatch[3]); // '/path' (path)

// Replace with capturing groups
const name = 'John Doe';
const reversed = name.replace(/(\w+)\s(\w+)/, '$2, $1');
console.log(reversed);
// Output: 'Doe, John'

// Reformat date from MM/DD/YYYY to YYYY-MM-DD
const usDate = '12/31/2024';
const isoDate = usDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2');
console.log(isoDate);
// Output: '2024-12-31'

// Extract and transform
const text = 'The price is $99.99';
const transformed = text.replace(/\$(\d+\.\d{2})/, 'only $$$1!');
console.log(transformed);
// Output: 'The price is only $99.99!'

// ==========================================
// NON-CAPTURING GROUPS (?:...)
// ==========================================

// Group without capture (for quantifiers)
const urlProtocol = /(?:https?):\/\//;
console.log(urlProtocol.test('https://example.com')); // true
// No capture, just groups 'http' or 'https'

// Performance comparison
const capturing = /(foo|bar)+/;
const nonCapturing = /(?:foo|bar)+/;

// Non-capturing is faster (no memory allocation)
const testStr = 'foobarfoobar'.repeat(100);
console.time('capturing');
for (let i = 0; i < 10000; i++) capturing.test(testStr);
console.timeEnd('capturing');   // ~50ms

console.time('non-capturing');
for (let i = 0; i < 10000; i++) nonCapturing.test(testStr);
console.timeEnd('non-capturing'); // ~40ms (20% faster)

// Use when you only need grouping
const imageExt = /\.(jpe?g|png|gif)$/i;
// Captures 'jpeg|png|gif' (needed for replace)

const imageExtNonCapture = /\.(?:jpe?g|png|gif)$/i;
// Doesn't capture (better if only validating)

// ==========================================
// NAMED CAPTURING GROUPS (?<name>...)
// ==========================================

// Date with named groups (much clearer!)
const namedDate = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const namedMatch = '2024-12-31'.match(namedDate);
console.log(namedMatch.groups);
// Output: { year: '2024', month: '12', day: '31' }

// Destructuring named groups
const { year: y, month: m, day: d } = namedMatch.groups;
console.log(`${m}/${d}/${y}`); // '12/31/2024'

// Email parsing with named groups
const emailPattern = /(?<user>[\w.]+)@(?<domain>[\w.]+)/;
const emailMatch = 'user@example.com'.match(emailPattern);
console.log(emailMatch.groups);
// Output: { user: 'user', domain: 'example.com' }

// URL with all parts named
const fullUrl = /(?<protocol>https?):\/\/(?<domain>[^/:]+)(:(?<port>\d+))?(?<path>\/.*)?/;
const urlTest = 'https://example.com:8080/path/to/page';
const urlParts = urlTest.match(fullUrl).groups;
console.log(urlParts);
// Output: { protocol: 'https', domain: 'example.com', port: '8080', path: '/path/to/page' }

// Replace with named groups
const formatted = '2024-12-31'.replace(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
  '$<month>/$<day>/$<year>'
);
console.log(formatted);
// Output: '12/31/2024'

// ==========================================
// BACKREFERENCES
// ==========================================

// Numbered backreference: find duplicate words
const duplicateWord = /\b(\w+)\s+\1\b/;
console.log('hello hello'.match(duplicateWord));  // ['hello hello', 'hello']
console.log('hello world'.match(duplicateWord));  // null

// Find repeated characters
const repeatedChar = /(.)\1+/g;
console.log('hello'.match(repeatedChar));  // ['ll']
console.log('aabbcc'.match(repeatedChar)); // ['aa', 'bb', 'cc']

// Match same opening/closing quote
const matchingQuotes = /(['"]).*?\1/;
console.log('"hello"'.match(matchingQuotes));  // ['"hello"', '"']
console.log("'world'".match(matchingQuotes));  // ["'world'", "'"]
console.log(`"mixed'`.match(matchingQuotes));  // null (quotes don't match)

// Named backreference
const namedQuote = /(?<quote>['"]).*?\k<quote>/;
console.log('"hello"'.match(namedQuote));     // ['"hello"']
console.log("'world'".match(namedQuote));     // ["'world'"]

// HTML tag matching (same opening/closing)
const htmlTag = /<(\w+)>.*?<\/\1>/;
console.log('<div>content</div>'.match(htmlTag));   // ['<div>content</div>', 'div']
console.log('<div>content</span>'.match(htmlTag));  // null (tags don't match)

// Find consecutive duplicates
const consecutiveDupes = /\b(\w+)\b(?:\s+\1\b)+/g;
const text = 'the the quick brown brown brown fox';
console.log(text.replace(consecutiveDupes, '$1'));
// Output: 'the quick brown fox'

// ==========================================
// COMBINED EXAMPLES
// ==========================================

// Password validation (lookaheads + groups)
const passwordValidator = {
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  validate(password) {
    return this.pattern.test(password);
  },

  getErrors(password) {
    const errors = [];
    if (!/(?=.*[a-z])/.test(password)) errors.push('Need lowercase letter');
    if (!/(?=.*[A-Z])/.test(password)) errors.push('Need uppercase letter');
    if (!/(?=.*\d)/.test(password)) errors.push('Need digit');
    if (!/(?=.*[@$!%*?&])/.test(password)) errors.push('Need special char');
    if (password.length < 8) errors.push('Minimum 8 characters');
    return errors;
  }
};

console.log(passwordValidator.validate('weak'));
// Output: false
console.log(passwordValidator.getErrors('weak'));
// Output: ['Need uppercase letter', 'Need digit', 'Need special char', 'Minimum 8 characters']

console.log(passwordValidator.validate('Strong123!'));
// Output: true

// Extract markdown links with named groups
const markdown = '[Google](https://google.com) and [GitHub](https://github.com)';
const linkPattern = /\[(?<text>[^\]]+)\]\((?<url>[^)]+)\)/g;

const links = [...markdown.matchAll(linkPattern)].map(m => m.groups);
console.log(links);
// Output: [
//   { text: 'Google', url: 'https://google.com' },
//   { text: 'GitHub', url: 'https://github.com' }
// ]

// Reformat markdown links to HTML
const html = markdown.replace(
  linkPattern,
  '<a href="$<url>">$<text></a>'
);
console.log(html);
// Output: '<a href="https://google.com">Google</a> and <a href="https://github.com">GitHub</a>'

// ==========================================
// REAL-WORLD: LOG PARSING
// ==========================================

const logLine = '[2024-12-31 10:30:45] ERROR: Database connection failed';

const logPattern = /\[(?<date>\d{4}-\d{2}-\d{2})\s(?<time>\d{2}:\d{2}:\d{2})\]\s(?<level>\w+):\s(?<message>.*)/;

const parsed = logLine.match(logPattern);
console.log(parsed.groups);
// Output: {
//   date: '2024-12-31',
//   time: '10:30:45',
//   level: 'ERROR',
//   message: 'Database connection failed'
// }

// ==========================================
// COMMON PITFALLS
// ==========================================

// ❌ Mistake 1: Forgetting lookbehind is zero-width
const wrong = /(?<=\$)\d+/;
console.log('$100'.match(wrong)[0]); // '100' (no '$')
// Lookbehind checks but doesn't include

// ✅ If you want to include, use capturing group
const right = /(\$\d+)/;
console.log('$100'.match(right)[0]); // '$100'

// ❌ Mistake 2: Using lookahead when simple group is better
const overcomplicated = /\w+(?=\.com)/;
// Just extracts domain name before '.com'

// ✅ Simpler with capturing group
const simpler = /(\w+)\.com/;

// ❌ Mistake 3: Forgetting backreference starts at \1 (not \0)
const wrongBackref = /(\w+)\s+\0/; // \0 is not a backreference
// Should be \1

// ✅ Correct
const correctBackref = /(\w+)\s+\1/;
```


<details>
<summary><strong>🔍 Deep Dive: Zero-Width Assertion Implementation</strong></summary>


#### Zero-Width Assertion Implementation

**Concept:** Assertions match a **position**, not characters. They don't consume input or advance the match position.

**Internal Engine Process for Lookahead `(?=...)`:**

```
Pattern: /foo(?=bar)/
Input: "foobar"

Step 1: Match 'foo' at position 0
        Position: [foo]bar
                     ↑ (position 3)

Step 2: Lookahead assertion (?=bar)
        - Save current position (3)
        - Try to match 'bar' starting at position 3
        - Position: foo[bar]
                       ↑
        - Match succeeds
        - RESTORE position to 3 (zero-width!)

Step 3: Return match 'foo' (positions 0-3)
        Assertion succeeded but consumed nothing

Result: match = 'foo', lastIndex = 3
```

**For Lookbehind `(?<=...)`:**

```
Pattern: /(?<=foo)bar/
Input: "foobar"

Step 1: Try to match 'bar' at position 3
        Position: foo[bar]
                     ↑

Step 2: Lookbehind assertion (?<=foo)
        - Save current position (3)
        - Move backward and try to match 'foo'
        - Position: [foo]bar
                       ↑ (checking positions 0-3)
        - Match succeeds
        - RESTORE position to 3

Step 3: Match 'bar' starting at position 3
        Position: foo[bar]

Result: match = 'bar', lastIndex = 6
```

#### Lookahead vs Lookbehind Performance

**Key Differences:**

1. **Lookahead** (always supported): O(m) where m = lookahead pattern length
2. **Lookbehind** (ES2018+): O(m × n) where n = variable lookbehind width

**Why lookbehind is slower:**
- Must check all possible lengths for variable-width patterns
- Fixed-width lookbehinds are optimized (same speed as lookahead)
- Engines cache lookbehind results to avoid re-checking

**Benchmark:**

```javascript
const text = 'word '.repeat(1000);

// Lookahead: fast
console.time('lookahead');
text.match(/\w+(?=\s)/g);
console.timeEnd('lookahead');
// Result: ~1ms

// Fixed-width lookbehind: fast
console.time('lookbehind-fixed');
text.match(/(?<=\s)\w+/g);
console.timeEnd('lookbehind-fixed');
// Result: ~1ms

// Variable-width lookbehind: slower
console.time('lookbehind-variable');
text.match(/(?<=\s*)\w+/g);
console.timeEnd('lookbehind-variable');
// Result: ~5ms (5x slower)
```

#### V8 Lookbehind Implementation (ES2018)

**History:**
- Lookahead: Supported since JavaScript 1.0 (1995)
- Lookbehind: Added in ES2018 (released 2018)
- V8 shipped lookbehind in Chrome 62 (Oct 2017)

**Implementation Details:**

V8 uses different strategies based on lookbehind type:

**1. Fixed-width lookbehind** (optimized fast path):
```javascript
// Pattern: /(?<=foo)bar/
// Lookbehind is exactly 3 characters

// V8 optimization:
// - Calculate exact position (current - 3)
// - Direct match check at that position
// - No iteration needed

// Pseudocode:
if (position >= 3) {
  if (input.substring(position - 3, position) === 'foo') {
    // Proceed with 'bar' match
  }
}
```

**2. Variable-width lookbehind** (slower):
```javascript
// Pattern: /(?<=fo+)bar/
// Lookbehind can be 2-N characters

// V8 must try multiple positions:
// - Check position - 2
// - Check position - 3
// - Check position - 4
// ... until lookbehind fails or succeeds

// Pseudocode:
for (let len = minLength; len <= maxLength; len++) {
  if (position >= len) {
    if (matches(input, position - len, lookbehindPattern)) {
      // Proceed with 'bar' match
      break;
    }
  }
}
```

**3. Unbounded lookbehind** (worst case):
```javascript
// Pattern: /(?<=.*foo)bar/
// Lookbehind could match from start to current position

// V8 limits search or uses heuristics
// May cap at ~1000 characters back
```

#### Capturing Group Implementation

**Memory Structure:**

```javascript
// Pattern: /(\d{3})-(\d{3})-(\d{4})/
// Input: "123-456-7890"

// Internal capture registers (array):
[
  "123-456-7890",  // $0 or match[0] - full match
  "123",           // $1 or match[1] - first capture
  "456",           // $2 or match[2] - second capture
  "7890"           // $3 or match[3] - third capture
]

// Each capture register stores:
{
  start: number,  // Start position in string
  end: number,    // End position in string
}

// Memory per capture: ~8 bytes (2 pointers)
// Plus actual string data (shared, not copied)
```

**Numbered vs Named Groups:**

```javascript
// Numbered groups: Array indexed storage
// Pattern: /(\d+)-(\d+)/
// Storage: [fullMatch, capture1, capture2]
// Access: O(1) by index

// Named groups: Map/Object storage
// Pattern: /(?<area>\d+)-(?<code>\d+)/
// Storage: { area: "value", code: "value" }
// Access: O(1) by name (hash lookup)
// Extra memory: ~32 bytes per name (string key + pointer)
```

#### Backreference Algorithm and Limitations

**How Backreferences Work:**

```javascript
// Pattern: /(\w+)\s+\1/
// Input: "hello hello"

Step 1: Match (\w+) → captures "hello"
        Capture register 1: "hello"

Step 2: Match \s+ → matches " "

Step 3: Match \1
        - Retrieve value from capture register 1: "hello"
        - Match literal "hello" (not regex pattern)
        - Compare character by character

Result: Match succeeds
```

**Key Limitation:** Backreferences match the **captured text**, not the pattern.

```javascript
// This WORKS:
/(\d+)\s+\1/
// If first group captures "123", \1 matches literal "123"

// This is DIFFERENT from:
/(\d+)\s+(\d+)/
// Second group matches ANY digits, not necessarily the same
```

**Performance Impact:**

```javascript
// Without backreference: O(n)
const simple = /(\w+)\s+\w+/;

// With backreference: O(n × m) where m = captured text length
const backref = /(\w+)\s+\1/;

// For each position where \1 could match:
// - Retrieve captured text (O(1))
// - Compare each character (O(m))
// - Backtrack if comparison fails

// Example:
const text = 'a'.repeat(100) + ' ' + 'a'.repeat(100);
console.time('backref');
/(\w+)\s+\1/.test(text);
console.timeEnd('backref');
// Result: ~0.1ms (compares 100 characters)
```

#### Memory Allocation for Captured Groups

**Storage Overhead:**

```javascript
// Pattern with 10 capturing groups
const pattern = /(a)(b)(c)(d)(e)(f)(g)(h)(i)(j)/;

// Memory allocation per match:
// - Capture registers: 10 × 8 bytes = 80 bytes
// - Named group map (if used): ~320 bytes
// - Match object overhead: ~100 bytes
// Total: ~500 bytes per match

// For 1000 matches:
const matches = text.match(pattern + '/g');
// Memory: ~500KB just for match metadata
```

**Why Non-Capturing Groups Save Memory:**

```javascript
// ❌ Capturing (allocates memory)
const capturing = /(foo|bar|baz)+/g;
// Allocates: N matches × 8 bytes per capture

// ✅ Non-capturing (no allocation)
const nonCapturing = /(?:foo|bar|baz)+/g;
// Allocates: 0 bytes for captures

// Difference for 10,000 matches: ~80KB saved
```

#### Browser Compatibility for Lookbehinds

**Support Timeline:**

| Browser | Version | Release Date | Notes |
|---------|---------|--------------|-------|
| Chrome | 62+ | Oct 2017 | ✅ Full support |
| Firefox | 78+ | June 2020 | ✅ Full support |
| Safari | 16.4+ | March 2023 | ⚠️ Recent support |
| Edge | 79+ | Jan 2020 | ✅ Chromium-based |
| Node.js | 9.0+ | Oct 2017 | ✅ V8 support |

**Fallback Strategy:**

```javascript
// Check support
const hasLookbehind = (() => {
  try {
    new RegExp('(?<=a)b');
    return true;
  } catch (e) {
    return false;
  }
})();

// Use lookbehind if supported, otherwise fallback
function extractPrices(text) {
  if (hasLookbehind) {
    // ✅ Modern: Use lookbehind
    return text.match(/(?<=\$)\d+(\.\d{2})?/g);
  } else {
    // ⚠️ Fallback: Capture and extract
    const matches = text.match(/\$(\d+(?:\.\d{2})?)/g);
    return matches ? matches.map(m => m.substring(1)) : null;
  }
}
```

#### Performance Analysis with Benchmarks

**Test: Extract 10,000 prices from text**

```javascript
const text = 'Price $19.99 '.repeat(10000);

// Method 1: Lookbehind (zero-width)
console.time('lookbehind');
const prices1 = text.match(/(?<=\$)\d+\.\d{2}/g);
console.timeEnd('lookbehind');
// Result: ~15ms

// Method 2: Capturing group + map
console.time('capture-map');
const prices2 = text.match(/\$(\d+\.\d{2})/g).map(m => m.substring(1));
console.timeEnd('capture-map');
// Result: ~20ms (slower - extra processing)

// Method 3: Split approach
console.time('split');
const prices3 = text.split('$').slice(1).map(s => s.match(/\d+\.\d{2}/)[0]);
console.timeEnd('split');
// Result: ~25ms (slowest - multiple operations)

// Winner: Lookbehind (if supported)
```

**Memory Usage Comparison:**

```javascript
// Test: 1 million phone number extractions

// Capturing groups: Allocates capture registers
const capturing = /(\d{3})-(\d{3})-(\d{4})/g;
// Memory: 1M matches × 3 captures × 8 bytes = 24MB

// Non-capturing + lookbehind: No captures
const efficient = /(?<=\d{3}-)\d{3}(?=-\d{4})/g;
// Memory: 1M matches × 0 captures = 0 bytes for captures

// Savings: 24MB (significant for large datasets)
```


</details>


<details>
<summary><strong>🐛 Real-World Scenario: Context: Banking App Password Validator</strong></summary>


#### Context: Banking App Password Validator

**System:** Mobile banking app (iOS/Android + React Native)
**Users:** 2.5 million active accounts
**Compliance:** PCI-DSS, SOC 2, financial regulations
**Security:** High-security tier, handles $500M transactions/month

#### Problem: Weak Passwords Bypassing Validation

**Timeline:**
- **March 2024**: Security audit finds weak passwords in production
- **Audit Finding**: 47 accounts compromised in 6 months via credential stuffing
- **Impact**: $18k fraudulent transactions, regulatory fine pending
- **Root Cause**: Password validation regex incorrect

**Discovered Issues:**
1. Passwords like "password1" passing validation (too weak)
2. Validation allowing partial matches instead of full string
3. No uppercase/special character requirements
4. Regex pattern vulnerable to bypass techniques

#### Impact Metrics

**Security Incidents:** 47 compromised accounts (Jan-June 2024)
**Fraudulent Transactions:** $18,340
**Regulatory Fine:** $250,000 (PCI-DSS compliance violation)
**Reputation Damage:** 1,200 app store reviews mentioning security concerns
**User Impact:** 47 users filed complaints, 12 closed accounts
**Compliance Status:** Failed security audit, required remediation plan

**Password Strength Distribution (Before Fix):**
- Weak (e.g., "password1"): 34% of users
- Medium (e.g., "Password1"): 51% of users
- Strong (e.g., "P@ssw0rd!"): 15% of users

#### Debugging Process

**Step 1: Reproduce the Issue**

```javascript
// FOUND IN CODE (production)
function validatePassword(password) {
  // ❌ BROKEN: This pattern has MAJOR issues!
  const pattern = /(?=.*\d).{8,}/;

  return pattern.test(password);
}

// Test with known weak passwords
console.log(validatePassword('password'));    // false ✓ (no digit)
console.log(validatePassword('password1'));   // true ❌ (WEAK but passes!)
console.log(validatePassword('12345678'));    // true ❌ (all digits!)
console.log(validatePassword('aaaaaaa1'));    // true ❌ (too simple!)
```

**Issues Identified:**
1. No uppercase requirement
2. No special character requirement
3. No lowercase requirement (could be all uppercase + digit)
4. Pattern doesn't anchor (could match partial strings)

**Step 2: Analyze Bypass Techniques**

```javascript
// User discovered they could bypass by:

// Technique 1: Minimum effort passwords
'password1'  // ✅ Passes (has digit, 8+ chars)
'test1234'   // ✅ Passes

// Technique 2: All digits (not even a password!)
'12345678'   // ✅ Passes ❌ (should fail)

// Technique 3: Repeated characters
'aaaaaaa1'   // ✅ Passes ❌ (too weak)

// All of these are TERRIBLE passwords but passed validation!
```

**Step 3: Check Security Logs**

```javascript
// Analysis of 47 compromised accounts
const compromisedPasswords = [
  'password1',    // 12 accounts
  'test1234',     // 8 accounts
  'admin123',     // 6 accounts
  '12345678',     // 5 accounts
  'user12345',    // 4 accounts
  // ... 12 more weak passwords
];

// ALL of these passed the validation regex
// ALL were found in common password dictionaries
// ALL were cracked via credential stuffing attacks
```

**Step 4: Test with Industry Standards**

```javascript
// NIST Guidelines (SP 800-63B):
// - Minimum 8 characters
// - At least one lowercase
// - At least one uppercase
// - At least one digit
// - At least one special character
// - No common passwords (check against dictionary)

// Current pattern FAILS 4 out of 6 requirements!
```

#### Root Cause Analysis

**The Broken Pattern:** `/(?=.*\d).{8,}/`

**Critical Flaws:**

1. **Missing Anchors:**
```javascript
// ❌ No anchors - matches substring!
const pattern = /(?=.*\d).{8,}/;
'invalid123'.substring(0, 8); // Could match part of longer string

// ✅ Should use anchors
const fixed = /^(?=.*\d).{8,}$/;
```

2. **Incomplete Requirements:**
```javascript
// ❌ Only checks for digit
(?=.*\d)  // Has digit? ✓
// Missing: lowercase, uppercase, special char

// ✅ Should check all requirements
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])
```

3. **No Maximum Length:**
```javascript
// ❌ Accepts unlimited length
.{8,}  // 8 to infinity

// ✅ Should cap at reasonable length (prevent DoS)
.{8,64}  // 8 to 64 characters
```

4. **No Character Restrictions:**
```javascript
// ❌ Accepts ANY characters
.{8,}  // Allows Unicode, emoji, etc.

// ✅ Should limit to safe characters
[A-Za-z\d@$!%*?&]{8,64}
```

**Why Attacks Succeeded:**

```javascript
// Attackers used credential stuffing:
// 1. Obtain leaked password lists from other breaches
// 2. Try common weak passwords like "password1"
// 3. These passwords PASSED our validation (major flaw!)
// 4. Users reused these weak passwords across sites
// 5. Attackers gained access to 47 accounts

// Our validation SHOULD have prevented these passwords
// But the regex was too permissive
```

#### Solution Implementation

**Immediate Fix (Deployed within 24 hours):**

```javascript
// ✅ SECURE: Comprehensive password validation
function validatePasswordSecure(password) {
  // Check length
  if (password.length < 8 || password.length > 64) {
    return {
      valid: false,
      errors: ['Password must be 8-64 characters']
    };
  }

  // Multiple positive lookaheads for each requirement
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;

  if (!pattern.test(password)) {
    const errors = [];
    if (!/(?=.*[a-z])/.test(password)) errors.push('Need lowercase letter');
    if (!/(?=.*[A-Z])/.test(password)) errors.push('Need uppercase letter');
    if (!/(?=.*\d)/.test(password)) errors.push('Need digit');
    if (!/(?=.*[@$!%*?&])/.test(password)) errors.push('Need special character (@$!%*?&)');

    return { valid: false, errors };
  }

  // Check against common passwords
  if (isCommonPassword(password)) {
    return {
      valid: false,
      errors: ['Password is too common, please choose a stronger password']
    };
  }

  return { valid: true, errors: [] };
}

// Common password check (top 10,000 most common)
function isCommonPassword(password) {
  const commonPasswords = new Set([
    'password1', 'password123', '12345678', 'qwerty123',
    'admin123', 'welcome1', 'test1234', 'user12345',
    // ... 10,000 most common passwords
  ]);

  return commonPasswords.has(password.toLowerCase());
}

// Test with previous bypass attempts
console.log(validatePasswordSecure('password1'));
// { valid: false, errors: ['Need uppercase letter', 'Need special character', 'Password is too common'] }

console.log(validatePasswordSecure('Password1'));
// { valid: false, errors: ['Need special character'] }

console.log(validatePasswordSecure('P@ssw0rd!'));
// { valid: true, errors: [] } ✅
```

**Pattern Breakdown:**

```javascript
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/

// ^                      - Start of string (prevent partial match)
// (?=.*[a-z])            - Lookahead: at least one lowercase
// (?=.*[A-Z])            - Lookahead: at least one uppercase
// (?=.*\d)               - Lookahead: at least one digit
// (?=.*[@$!%*?&])        - Lookahead: at least one special char
// [A-Za-z\d@$!%*?&]{8,64} - Match 8-64 allowed characters
// $                      - End of string (prevent partial match)

// All lookaheads are ZERO-WIDTH
// They check requirements without consuming characters
// Then {8,64} validates length and allowed characters
```

**Long-term Security Enhancements:**

**1. Password Strength Meter (Real-time Feedback):**

```javascript
function calculatePasswordStrength(password) {
  let score = 0;
  const feedback = [];

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 2; // Special chars worth more

  // Penalties
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeated characters');
  }

  if (/(?:012|123|234|345|456|567|678|789|890)/.test(password)) {
    score -= 1;
    feedback.push('Avoid sequential numbers');
  }

  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    score -= 1;
    feedback.push('Avoid sequential letters');
  }

  // Common password check
  if (isCommonPassword(password)) {
    score = 0;
    feedback.push('Password is too common');
  }

  // Strength levels
  const strength = score < 3 ? 'weak' :
                   score < 5 ? 'medium' :
                   score < 7 ? 'strong' : 'very strong';

  return { score, strength, feedback };
}

// Usage in UI
const result = calculatePasswordStrength('P@ssw0rd!');
console.log(result);
// { score: 6, strength: 'strong', feedback: [] }
```

**2. Entropy Calculation (Advanced Security):**

```javascript
function calculatePasswordEntropy(password) {
  let charsetSize = 0;

  if (/[a-z]/.test(password)) charsetSize += 26; // lowercase
  if (/[A-Z]/.test(password)) charsetSize += 26; // uppercase
  if (/\d/.test(password)) charsetSize += 10;    // digits
  if (/[@$!%*?&]/.test(password)) charsetSize += 8; // special

  // Entropy = log2(charsetSize^length)
  const entropy = password.length * Math.log2(charsetSize);

  // NIST recommends minimum 30 bits of entropy
  // Strong passwords: 60+ bits
  // Very strong: 80+ bits

  return {
    entropy: Math.round(entropy),
    strength: entropy < 30 ? 'weak' :
              entropy < 60 ? 'medium' :
              entropy < 80 ? 'strong' : 'very strong'
  };
}

console.log(calculatePasswordEntropy('P@ssw0rd!'));
// { entropy: 59, strength: 'medium' }

console.log(calculatePasswordEntropy('C0mpl3x!P@ssW0rd#2024'));
// { entropy: 138, strength: 'very strong' }
```

**3. Multi-Factor Authentication (Defense in Depth):**

```javascript
// Even with strong passwords, add MFA as second layer
// This prevented further breaches after password fix

// Implementation: SMS/Email OTP, Authenticator App (TOTP), Biometric
```

**4. Password Breach Check (Have I Been Pwned API):**

```javascript
async function checkPasswordBreach(password) {
  // Use k-Anonymity model (safe, doesn't send full password)
  const sha1 = await hashPassword(password);
  const prefix = sha1.substring(0, 5);
  const suffix = sha1.substring(5);

  // Query Have I Been Pwned API
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const hashes = await response.text();

  // Check if password hash is in breached database
  const isBreached = hashes.split('\n').some(line => {
    const [hash] = line.split(':');
    return hash === suffix.toUpperCase();
  });

  return isBreached;
}

// Integrate into validation
async function validatePasswordWithBreachCheck(password) {
  const result = validatePasswordSecure(password);

  if (result.valid) {
    const isBreached = await checkPasswordBreach(password);
    if (isBreached) {
      result.valid = false;
      result.errors.push('This password has been found in a data breach. Please choose a different password.');
    }
  }

  return result;
}
```

**5. Forced Password Reset for Existing Users:**

```javascript
// Migration script for existing users
async function forcePasswordResetForWeakPasswords() {
  // Identify users with weak passwords (that passed old validation)
  const weakPasswordUsers = await db.users.find({
    passwordCreatedAt: { $lt: new Date('2024-03-15') }, // Before fix
    passwordStrength: { $in: ['weak', 'medium'] }
  });

  // Force reset on next login
  for (const user of weakPasswordUsers) {
    await db.users.updateOne(
      { _id: user._id },
      {
        $set: {
          requirePasswordReset: true,
          passwordResetReason: 'Security enhancement - please create a stronger password'
        }
      }
    );

    // Send email notification
    await sendPasswordResetEmail(user.email);
  }

  console.log(`Flagged ${weakPasswordUsers.length} users for password reset`);
}

// Result: 850,000 users flagged (34% of user base)
// 98% completed reset within 30 days
```

#### Results

**Security Improvements:**
- **Compromised accounts:** 47 (6 months before) → 0 (6 months after)
- **Password strength distribution:**
  - Weak: 34% → 2%
  - Medium: 51% → 18%
  - Strong: 15% → 80%
- **Fraud prevention:** $0 in fraudulent transactions post-fix

**Compliance:**
- ✅ Passed follow-up security audit (June 2024)
- ✅ PCI-DSS compliance restored
- ✅ SOC 2 certification maintained
- ✅ Regulatory fine waived due to rapid remediation

**User Experience:**
- **Password reset completion:** 98% within 30 days
- **Customer support tickets:** Reduced by 65% (clearer error messages)
- **App store rating:** Improved from 3.2 → 4.1 stars
- **Security-related complaints:** Down 87%

**Cost Savings:**
- **Regulatory fine:** $250,000 avoided (waived due to quick fix)
- **Fraud prevention:** Estimated $50k/year saved
- **Customer retention:** 12 accounts saved (~$60k annual value)

**Lessons Learned:**
1. ✅ Always use multiple lookaheads for complex validation
2. ✅ Anchor patterns with `^` and `$` to prevent partial matches
3. ✅ Test with common weak passwords and breach databases
4. ✅ Provide real-time feedback (strength meter)
5. ✅ Defense in depth: MFA, breach checks, monitoring
6. ✅ Regular security audits catch issues before incidents


</details>


<details>
<summary><strong>⚖️ Trade-offs: Lookahead vs Capturing Groups for Validation</strong></summary>


#### Lookahead vs Capturing Groups for Validation

**Lookahead `(?=...)`:**

**Pros:**
- Zero-width (doesn't consume characters)
- Can check multiple conditions independently
- Clearer logic for complex validations
- No memory overhead for captures

**Cons:**
- More complex syntax
- Harder for beginners to understand
- Can't extract matched portions
- Slightly slower for simple cases

**Best for:** Password validation, format checking, multiple requirements

**Capturing Groups `(...)`:**

**Pros:**
- Extracts matched portions
- Simpler syntax for basic cases
- Can use in replace operations
- Widely understood

**Cons:**
- Consumes characters (changes match position)
- Memory overhead for captures
- Can't check overlapping conditions easily
- Numbered references can be confusing

**Best for:** Parsing, extraction, transformation

**Decision Matrix:**

| Task | Use | Reason |
|------|-----|--------|
| Password must have digit | Lookahead | Check without consuming |
| Extract date parts | Capturing | Need extracted values |
| Validate email format | Capturing | Extract user/domain |
| Multiple password rules | Lookahead | Independent checks |
| Reformat phone number | Capturing | Need parts for rearranging |
| Check not followed by X | Negative lookahead | Condition check only |

**Performance Comparison:**

```javascript
// Task: Validate password has lowercase, uppercase, digit

// Method 1: Multiple lookaheads (recommended)
const lookaheads = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
console.time('lookaheads');
for (let i = 0; i < 100000; i++) {
  lookaheads.test('Password123');
}
console.timeEnd('lookaheads');
// Result: ~50ms

// Method 2: Separate tests
console.time('separate');
for (let i = 0; i < 100000; i++) {
  const pwd = 'Password123';
  /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd) && pwd.length >= 8;
}
console.timeEnd('separate');
// Result: ~80ms (slower - multiple regex compilations)

// Winner: Lookaheads (faster + cleaner)
```

#### Named vs Numbered Capturing Groups

**Named Groups `(?<name>...)`:**

**Pros:**
- Self-documenting code
- No counting needed
- Immune to group reordering
- Clearer in complex patterns
- Better maintainability

**Cons:**
- ES2018+ only (compatibility)
- Slightly more memory (~32 bytes per name)
- More typing (syntax overhead)
- Not all regex flavors support

**Best for:** Complex patterns, team projects, long-term code

**Numbered Groups `(...)`:**

**Pros:**
- Universal support (all browsers)
- Less memory overhead
- Shorter syntax
- Faster (marginally)

**Cons:**
- Hard to maintain (counting groups)
- Breaks when adding/removing groups
- Unclear intent in complex patterns
- Easy to make off-by-one errors

**Best for:** Simple patterns, temporary code, maximum compatibility

**Comparison:**

```javascript
// Task: Parse date string

// ❌ Numbered groups - hard to maintain
const numbered = /(\d{4})-(\d{2})-(\d{2})/;
const match1 = '2024-12-31'.match(numbered);
const year = match1[1];  // Is this year? Month? Have to count!
const month = match1[2];
const day = match1[3];

// ✅ Named groups - self-documenting
const named = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match2 = '2024-12-31'.match(named);
const { year: y, month: m, day: d } = match2.groups; // Clear!

// Maintainability: Named groups win
// If pattern changes, names stay meaningful
```

**Memory Benchmark:**

```javascript
// 10,000 date matches

// Numbered groups
const num = /(\d{4})-(\d{2})-(\d{2})/g;
const text = '2024-12-31 '.repeat(10000);
const matches1 = text.match(num);
// Memory: ~240KB (10K matches × 3 captures × 8 bytes)

// Named groups
const name = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/g;
const matches2 = text.match(name);
// Memory: ~560KB (captures + name storage)

// Difference: 320KB extra for named groups
// Trade-off: Readability vs memory (usually worth it)
```

#### Positive vs Negative Assertions

**Positive Assertions `(?=...)` `(?<=...)`:**

**Pros:**
- States what MUST be present
- Intuitive for most use cases
- Easier to reason about
- More common (familiar pattern)

**Cons:**
- Can be verbose for exclusions
- May need multiple assertions
- Harder to express "not X"

**Best for:** Validation, format checking, inclusion logic

**Negative Assertions `(?!...)` `(?<!...)`:**

**Pros:**
- Concise for exclusions
- Efficient for blacklisting
- Better for "not X" logic
- Prevents unwanted matches

**Cons:**
- Less intuitive (double negative logic)
- Harder to debug
- Easy to misuse

**Best for:** Exclusions, blacklisting, preventing matches

**Examples:**

```javascript
// Task: Match words not followed by '!'

// Positive approach (harder)
/\w+(?=\s|$)/  // Words followed by space or end
// But this still matches words before '!'

// Negative approach (better)
/\w+(?!!)/  // Words NOT followed by '!'
// More direct and clear intent

// Task: Extract usernames (not admin/root)

// Positive approach
/^(?:(?!admin|root)\w)+$/
// Complex double negative

// Better: Validate separately
/^\w+$/.test(username) && !['admin', 'root'].includes(username)
// Clearer logic
```

#### Multiple Patterns vs Complex Single Pattern

**Multiple Simple Patterns:**

**Pros:**
- Easier to understand
- Easier to maintain
- Can provide specific error messages
- Better debuggability
- Each pattern focused on one rule

**Cons:**
- Multiple regex compilations (slower)
- More verbose code
- Can't be used in single replace
- More test executions

**Best for:** Validation with detailed errors, maintainability

**Single Complex Pattern:**

**Pros:**
- Single compilation (faster)
- One test execution
- Concise code
- Can be used in replace
- Atomic validation

**Cons:**
- Hard to understand
- Hard to maintain
- Generic error messages
- Difficult to debug

**Best for:** Performance-critical code, simple validation

**Comparison:**

```javascript
// Task: Validate strong password

// ❌ Single complex pattern
const complex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;
if (!complex.test(password)) {
  return 'Invalid password'; // Generic error - not helpful!
}

// ✅ Multiple simple patterns with specific errors
const errors = [];
if (!/[a-z]/.test(password)) errors.push('Need lowercase letter');
if (!/[A-Z]/.test(password)) errors.push('Need uppercase letter');
if (!/\d/.test(password)) errors.push('Need digit');
if (!/[@$!%*?&]/.test(password)) errors.push('Need special char');
if (password.length < 8) errors.push('Minimum 8 characters');
if (password.length > 64) errors.push('Maximum 64 characters');

if (errors.length > 0) {
  return errors; // Specific, helpful feedback!
}

// Trade-off: Slower (6 tests) but much better UX
// For user-facing validation: Multiple patterns win
// For internal checks: Single pattern acceptable
```

**Performance Benchmark:**

```javascript
// 100,000 password validations

// Single pattern
console.time('single');
for (let i = 0; i < 100000; i++) {
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,64}$/.test('Password123!');
}
console.timeEnd('single');
// Result: ~100ms

// Multiple patterns
console.time('multiple');
for (let i = 0; i < 100000; i++) {
  const pwd = 'Password123!';
  /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[@$!%*?&]/.test(pwd);
}
console.timeEnd('multiple');
// Result: ~150ms (50% slower)

// Difference: 50ms for 100K validations
// Real-world impact: Negligible (<1ms per validation)
// Recommendation: Prioritize UX (multiple patterns with clear errors)
```


</details>


<details>
<summary><strong>💬 Explain to Junior: Simple Analogy: Lookaround as Peeking Ahead/Behind</strong></summary>


#### Simple Analogy: Lookaround as Peeking Ahead/Behind

**Lookahead** = "Check what's coming, but don't move forward"

Think of it like checking if the next car at a stoplight is a police car **before** you decide to speed up. You peek ahead but stay in your current position.

```javascript
// Find numbers that will be followed by 'px'
// But don't include the 'px' in the match

const css = '12px 14pt 16px';
const pxNumbers = css.match(/\d+(?=px)/g);
console.log(pxNumbers);
// Output: ['12', '16']
// We "peeked ahead" to check for 'px' but didn't include it
```

**Lookbehind** = "Check what came before, but don't move backward"

Think of checking your rearview mirror to see if a cop car is behind you, but you're still looking forward and driving ahead.

```javascript
// Find prices (numbers after '$')
// But don't include the '$' in the match

const text = 'Price: $99.99';
const price = text.match(/(?<=\$)\d+\.\d{2}/);
console.log(price[0]);
// Output: '99.99'
// We "looked behind" to check for '$' but didn't include it
```

#### Visual Diagrams: Zero-Width Matching

**Example:** Find "bar" preceded by "foo"

**Without lookbehind (capturing group):**
```
Pattern: /(foo)(bar)/
Input: "foobar"

Position: [foobar]
          ↑
Step 1: Match 'foo' → Capture group 1
Position: [foo][bar]
             ↑↑↑
Step 2: Match 'bar' → Capture group 2
Position: [foo][bar]
                 ↑↑↑

Result:
- match[0] = 'foobar'
- match[1] = 'foo'  ← Included in result
- match[2] = 'bar'
```

**With lookbehind (zero-width):**
```
Pattern: /(?<=foo)bar/
Input: "foobar"

Position: [foobar]
          ↑↑↑
Step 1: Lookbehind (?<=foo)
        - Check positions 0-3 for 'foo' ✓
        - DON'T consume characters
        - Stay at position 3
Position: foo[bar]
             ↑

Step 2: Match 'bar'
Position: foo[bar]
             ↑↑↑

Result:
- match[0] = 'bar'  ← Only 'bar', 'foo' not included!
```

**Key Insight:** Lookaround matches a **position**, not characters!

#### Password Validation Step-by-Step

**Goal:** Password must have lowercase, uppercase, and digit

**Pattern:** `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/`

**Test:** `"Password123"`

```
Step 1: ^
Position: |[Password123]
          ↑
Match start of string ✓

Step 2: (?=.*[a-z])
Position: |[Password123]
          ↑ (still at start - zero-width!)
Lookahead: Check entire string for lowercase
Found 'a', 's', 's', 'w', 'o', 'r', 'd' ✓
Stay at position 0

Step 3: (?=.*[A-Z])
Position: |[Password123]
          ↑ (still at start!)
Lookahead: Check entire string for uppercase
Found 'P' ✓
Stay at position 0

Step 4: (?=.*\d)
Position: |[Password123]
          ↑ (still at start!)
Lookahead: Check entire string for digit
Found '1', '2', '3' ✓
Stay at position 0

Step 5: .{8,}
Position: |[Password123]
          ↑ (now we actually consume!)
Match any 8+ characters
Matches 'Password123' (11 characters) ✓

Step 6: $
Position: [Password123]|
                       ↑
Match end of string ✓

Result: MATCH ✅
```

**If password was `"password"` (no uppercase/digit):**

```
Step 1-2: Same (^ and (?=.*[a-z]) pass)

Step 3: (?=.*[A-Z])
Lookahead: Check for uppercase
Found NONE ✗
Result: FAIL ❌ (stops here)
```

#### Common Mistakes and Gotchas

**Mistake 1: Thinking lookahead consumes characters**

```javascript
// ❌ Wrong expectation
const pattern = /foo(?=bar)/;
const text = 'foobar';
console.log(text.match(pattern)[0]);
// You might expect: 'foobar'
// Actual output: 'foo' (lookahead doesn't include 'bar')

// ✅ Understanding: Lookahead checks but doesn't consume
// Only 'foo' is in the match, 'bar' was just checked
```

**Mistake 2: Confusing positive and negative lookahead**

```javascript
// ❌ Common mistake
const notExcited = /\w+(?=!)/; // ← This is POSITIVE lookahead!
console.log('Hello! World.'.match(notExcited));
// Expectation: ['World'] (words NOT followed by !)
// Reality: ['Hello'] (words followed by !)

// ✅ Correct: Use negative lookahead
const correctPattern = /\w+(?!!)/;
console.log('Hello! World.'.match(correctPattern));
// Output: ['ello', 'World'] (words NOT followed by !)
```

**Mistake 3: Forgetting backreferences match captured text, not pattern**

```javascript
// ❌ Misconception
const pattern = /(\d+)\s+\1/;
const text = '123 456'; // Different numbers
console.log(pattern.test(text));
// Expectation: true (both are digits)
// Reality: false (\1 matches literal '123', not any digits)

// ✅ Correct: Backreference matches exact text
console.log(/(\d+)\s+\1/.test('123 123')); // true ✓
```

**Mistake 4: Using capturing group when non-capturing is better**

```javascript
// ❌ Unnecessary capture
const urlPattern = /(https?):\/\/(.+)/;
// Creates 2 captures you might not need

// ✅ Better: Non-capturing if not using captured values
const betterPattern = /(?:https?):\/\/(.+)/;
// Only captures the domain (second group)
```

#### Interview Answer Template

**Question:** "Explain lookahead and how you'd use it for password validation."

**Answer:**

"A **lookahead** is a zero-width assertion that checks if a pattern exists ahead without consuming characters. It's written as `(?=...)` for positive lookahead (pattern must exist) or `(?!...)` for negative lookahead (pattern must NOT exist).

For password validation, lookaheads are perfect because we need to check multiple requirements independently without consuming the string.

**Example:** Validate password has lowercase, uppercase, and digit:

```javascript
const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// How it works:
// 1. ^ - Start of string
// 2. (?=.*[a-z]) - Lookahead: must have lowercase (doesn't consume)
// 3. (?=.*[A-Z]) - Lookahead: must have uppercase (doesn't consume)
// 4. (?=.*\d) - Lookahead: must have digit (doesn't consume)
// 5. .{8,} - Now match 8+ characters (consumes)
// 6. $ - End of string

pattern.test('Password123'); // true ✓
pattern.test('password123'); // false (no uppercase)
```

The key insight is that all lookaheads check from the **same position** (start of string), so we can verify all requirements before actually consuming any characters. This is cleaner than using multiple capturing groups or separate tests.

For **capturing groups**, I use them when I need to **extract** parts of a match, like parsing dates:

```javascript
const datePattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const { year, month, day } = '2024-12-31'.match(datePattern).groups;
// Now I have extracted values to work with
```

I prefer **named groups** for complex patterns because they're self-documenting and easier to maintain than numbered references."

#### Copy-Paste Validation Patterns

**Strong Password (8+ chars, lowercase, uppercase, digit, special):**
```javascript
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/
```

**Email:**
```javascript
/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
```

**Phone (US):**
```javascript
/^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/
```

**URL:**
```javascript
/^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/.*)?$/
```

**Credit Card:**
```javascript
/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/
```

**Hex Color:**
```javascript
/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
```

#### Practice Exercises with Solutions

**Exercise 1:** Write a regex to match prices (numbers after '$') without including the '$'

```javascript
// Solution:
const pricePattern = /(?<=\$)\d+(\.\d{2})?/g;

// Test:
const text = 'Items: $10, $20.50, $30';
console.log(text.match(pricePattern));
// Output: ['10', '20.50', '30']
```

**Exercise 2:** Match words that are NOT followed by an exclamation mark

```javascript
// Solution:
const notExcitedPattern = /\w+(?!!)\b/g;

// Test:
const text = 'Hello! World. Great! Day.';
console.log(text.match(notExcitedPattern));
// Output: ['ello', 'World', 'reat', 'Day']
// (Note: 'H' from Hello is not matched because 'Hello!' ends with !)
```

**Exercise 3:** Extract hashtags (text after '#') from a tweet

```javascript
// Solution:
const hashtagPattern = /(?<=#)\w+/g;

// Test:
const tweet = 'Love #JavaScript and #Regex! #coding';
console.log(tweet.match(hashtagPattern));
// Output: ['JavaScript', 'Regex', 'coding']
```

**Exercise 4:** Parse a date and reformat from YYYY-MM-DD to MM/DD/YYYY

```javascript
// Solution:
const datePattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const date = '2024-12-31';
const formatted = date.replace(datePattern, '$<month>/$<day>/$<year>');

console.log(formatted);
// Output: '12/31/2024'
```

**Exercise 5:** Find duplicate consecutive words

```javascript
// Solution:
const duplicatePattern = /\b(\w+)\s+\1\b/g;

// Test:
const text = 'the the quick brown brown brown fox';
console.log(text.match(duplicatePattern));
// Output: ['the the', 'brown brown']

// Replace duplicates:
console.log(text.replace(duplicatePattern, '$1'));
// Output: 'the quick brown brown fox'
// (Only removes first duplicate in sequence)
```


</details>

---

## 📚 Additional Resources

- [MDN: Assertions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Assertions)
- [MDN: Quantifiers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Quantifiers)
- [MDN: Groups and Backreferences](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Backreferences)
- [Regex Lookahead/Lookbehind Tutorial](https://www.regular-expressions.info/lookaround.html)
- [ReDoS Attacks (OWASP)](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS)
- [V8 Regex Optimization](https://v8.dev/blog/irregexp)
- [Catastrophic Backtracking Examples](https://www.regular-expressions.info/catastrophic.html)
- [Have I Been Pwned API](https://haveibeenpwned.com/API/v3)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
