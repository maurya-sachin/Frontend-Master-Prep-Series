# Content Security Policy (CSP)

> **Focus**: Implementing and configuring CSP to prevent XSS and injection attacks

---

## Question 1: What is Content Security Policy (CSP) and how does it protect against XSS attacks?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Google, Meta, Amazon, Netflix, Stripe

### Question
Explain Content Security Policy, its directives, and how to implement it to prevent XSS attacks.

### Answer

**Content Security Policy (CSP)** is a security standard that helps prevent Cross-Site Scripting (XSS), clickjacking, and other code injection attacks by controlling which resources can be loaded and executed on a webpage.

**Key Concepts:**

1. **How CSP Works**
   - Browser enforces whitelist of trusted content sources
   - Blocks inline scripts and eval() by default
   - Reports violations to specified endpoint
   - Implemented via HTTP header or meta tag

2. **Core CSP Directives**
   - `default-src`: Fallback for other directives
   - `script-src`: Controls JavaScript sources
   - `style-src`: Controls CSS sources
   - `img-src`: Controls image sources
   - `connect-src`: Controls fetch/XHR/WebSocket
   - `font-src`: Controls font sources
   - `frame-src`: Controls iframe sources
   - `report-uri`: Violation reporting endpoint

3. **CSP Levels**
   - **CSP Level 1**: Basic source whitelisting
   - **CSP Level 2**: Adds nonces, hashes, strict-dynamic
   - **CSP Level 3**: Adds worker-src, manifest-src, trusted-types

### Code Example

```javascript
// ============================================
// 1. CSP IMPLEMENTATION METHODS
// ============================================

// ✅ GOOD: HTTP Header (most secure)
// Set in server configuration (Express.js example)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' https://trusted-cdn.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://api.example.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  next();
});

// ❌ BAD: Meta tag (less secure, can't use report-uri)
// <meta http-equiv="Content-Security-Policy"
//       content="default-src 'self'">

// ============================================
// 2. CSP WITH NONCES (Recommended for SPAs)
// ============================================

// Server-side: Generate random nonce per request
const crypto = require('crypto');

app.use((req, res, next) => {
  // Generate cryptographically random nonce
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;

  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; ` +
    `script-src 'self' 'nonce-${nonce}'; ` +
    `style-src 'self' 'nonce-${nonce}'`
  );
  next();
});

// HTML template (EJS example)
/*
<!DOCTYPE html>
<html>
<head>
  <!-- ✅ Script with nonce - ALLOWED -->
  <script nonce="<%= nonce %>">
    console.log('This script is allowed');
  </script>

  <!-- ❌ Script without nonce - BLOCKED -->
  <script>
    console.log('This will be blocked');
  </script>
</head>
</html>
*/

// ============================================
// 3. CSP WITH HASHES (Static Content)
// ============================================

// Generate SHA256 hash of inline script
const scriptContent = "console.log('Hello');";
const hash = crypto
  .createHash('sha256')
  .update(scriptContent)
  .digest('base64');

// CSP header with hash
const cspWithHash =
  `script-src 'self' 'sha256-${hash}'`;

// HTML
/*
<script>console.log('Hello');</script>
<!-- This exact script will be allowed -->
*/

// ============================================
// 4. STRICT CSP (Most Secure)
// ============================================

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;

  // Strict CSP configuration
  res.setHeader(
    'Content-Security-Policy',
    // Script sources
    `script-src 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'; ` +
    // Style sources
    `style-src 'nonce-${nonce}' 'strict-dynamic'; ` +
    // Object sources (no Flash, Java, etc.)
    `object-src 'none'; ` +
    // Base URI restriction
    `base-uri 'none'; ` +
    // Upgrade insecure requests
    `upgrade-insecure-requests; ` +
    // Report violations
    `report-uri /csp-violation-report`
  );
  next();
});

// ============================================
// 5. CSP VIOLATION REPORTING
// ============================================

// Report endpoint
app.post('/csp-violation-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  const violation = req.body['csp-report'];

  console.error('CSP Violation:', {
    blockedURI: violation['blocked-uri'],
    violatedDirective: violation['violated-directive'],
    originalPolicy: violation['original-policy'],
    documentURI: violation['document-uri'],
    sourceFile: violation['source-file'],
    lineNumber: violation['line-number']
  });

  // Log to monitoring service
  logger.warn('CSP_VIOLATION', { violation });

  res.status(204).end();
});

// ============================================
// 6. REPORT-ONLY MODE (Testing)
// ============================================

// Use Content-Security-Policy-Report-Only for testing
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "report-uri /csp-violation-report"
  );
  // Reports violations but doesn't block
  next();
});

// ============================================
// 7. REACT APP CSP CONFIGURATION
// ============================================

// Next.js next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
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

// ============================================
// 8. COMMON CSP PATTERNS
// ============================================

// Pattern 1: API-only app (no inline scripts)
const apiAppCSP =
  "default-src 'self'; " +
  "script-src 'self'; " +
  "style-src 'self'; " +
  "connect-src 'self' https://api.example.com; " +
  "img-src 'self' https://cdn.example.com";

// Pattern 2: Legacy app with inline styles
const legacyAppCSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline'; " +  // ⚠️ Less secure
  "style-src 'self' 'unsafe-inline'";

// Pattern 3: Modern SPA with nonce
const modernSPACSP = (nonce) =>
  `default-src 'self'; ` +
  `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; ` +
  `style-src 'self' 'nonce-${nonce}'; ` +
  `object-src 'none'; ` +
  `base-uri 'self'`;

// ============================================
// 9. CSP TESTING HELPERS
// ============================================

// Check CSP compatibility
function checkCSPSupport() {
  return 'SecurityPolicyViolationEvent' in window;
}

// Listen for CSP violations in browser
window.addEventListener('securitypolicyviolation', (e) => {
  console.error('CSP Violation:', {
    blockedURI: e.blockedURI,
    violatedDirective: e.violatedDirective,
    originalPolicy: e.originalPolicy,
    disposition: e.disposition // "enforce" or "report"
  });

  // Send to analytics
  analytics.track('csp_violation', {
    blocked: e.blockedURI,
    directive: e.violatedDirective
  });
});
```

<details>
<summary><strong>🔍 Deep Dive: CSP Internals and Browser Implementation</strong></summary>

**How Browsers Parse and Enforce CSP:**

The browser's CSP implementation involves multiple stages of parsing, validation, and enforcement at the network and rendering layers.

**1. CSP Parser Architecture:**

When a browser receives a CSP header, it goes through a multi-stage parsing process. The CSP string is tokenized into directives, each directive is parsed for source expressions, and these are compiled into an internal enforcement policy. The parser handles multiple CSP headers by creating a unified policy using the most restrictive values (intersection of policies).

For example, if you have two headers:
```
Content-Security-Policy: script-src 'self' https://cdn1.com
Content-Security-Policy: script-src 'self' https://cdn2.com
```

The browser combines them into: `script-src 'self'` (intersection of both policies).

**2. Resource Loading Pipeline with CSP:**

Every resource request goes through the CSP enforcement layer before being loaded. For scripts, the browser checks the script-src directive; for styles, it checks style-src; for XHR/fetch, it checks connect-src. If no specific directive exists, it falls back to default-src. If the source doesn't match any allowed source, the request is blocked immediately and a violation is reported.

The enforcement happens at multiple points:
- **Parse time**: Inline event handlers (`onclick="..."`) are blocked during HTML parsing
- **Execution time**: `eval()`, `new Function()`, `setTimeout(string)` are blocked during script execution
- **Network time**: External resource requests are checked before initiating the network request

**3. Nonce Implementation Deep Dive:**

Nonces work by creating a cryptographic binding between the server and allowed scripts. The server generates a random nonce value for each page load (minimum 128 bits of entropy), includes it in both the CSP header and the script tag's nonce attribute. The browser compares the nonce in the CSP header with the nonce attribute on each script tag before execution.

Security properties:
- Nonces must be unpredictable (use crypto.randomBytes, not Math.random)
- Nonces must be unique per page load (prevents replay attacks)
- Nonces must be single-use (can't reuse across page loads)
- Nonces propagate to dynamically created scripts

**4. Hash Verification Process:**

Hash-based CSP works by computing a cryptographic hash of the script content. The browser supports SHA-256, SHA-384, and SHA-512 algorithms. When an inline script is encountered, the browser:

1. Extracts the exact script content (whitespace sensitive)
2. Computes the hash using the specified algorithm
3. Encodes as base64
4. Compares with allowed hashes in CSP directive

Example: The script `console.log('Hello');` produces different hashes if you add whitespace:
```javascript
// These produce DIFFERENT hashes:
"console.log('Hello');"
" console.log('Hello');"
"console.log('Hello'); "
```

**5. 'strict-dynamic' Mechanism:**

The `'strict-dynamic'` keyword is a CSP Level 3 feature that fundamentally changes how script whitelisting works. When enabled, scripts loaded with a valid nonce or hash can load additional scripts programmatically, and those child scripts are automatically trusted.

Traditional CSP requires whitelisting every script source:
```javascript
script-src 'self' https://cdn1.com https://cdn2.com https://analytics.com
```

With strict-dynamic:
```javascript
script-src 'nonce-xyz' 'strict-dynamic'
```

Now any script with `nonce="xyz"` can dynamically load other scripts via:
- `document.createElement('script')`
- `import()` statements
- Script tags added via innerHTML (if parent had nonce)

**6. Trusted Types Integration:**

CSP Level 3 introduces Trusted Types, which prevent DOM XSS at the API level. The `require-trusted-types-for 'script'` directive forces all dangerous DOM sinks to accept only Trusted Type objects instead of strings.

Dangerous sinks include:
- `element.innerHTML`
- `element.outerHTML`
- `document.write()`
- `eval()`
- `new Function()`

Example enforcement:
```javascript
// Without Trusted Types (vulnerable)
element.innerHTML = userInput; // ❌ XSS risk

// With Trusted Types (safe)
const policy = trustedTypes.createPolicy('myPolicy', {
  createHTML: (input) => DOMPurify.sanitize(input)
});
element.innerHTML = policy.createHTML(userInput); // ✅ Safe
```

**7. CSP Bypasses and Mitigations:**

Common CSP bypass techniques and their countermeasures:

**Bypass 1: JSONP endpoints**
- Attack: `script-src 'self' https://api.example.com` but `https://api.example.com/jsonp?callback=alert(1)`
- Mitigation: Remove JSONP endpoints or use `'strict-dynamic'`

**Bypass 2: Angular template injection**
- Attack: CDN hosting old Angular versions with template injection bugs
- Mitigation: Use nonces/hashes, avoid whitelisting entire CDNs

**Bypass 3: Base tag injection**
- Attack: Inject `<base href="https://evil.com">` to redirect relative URLs
- Mitigation: Use `base-uri 'self'` or `base-uri 'none'`

**8. Performance Impact:**

CSP enforcement has minimal performance overhead (typically <1% of page load time). The parser runs during HTML parsing (which happens anyway), source matching uses efficient trie data structures for O(1) lookups, nonce/hash verification is single-pass O(n) on script content. The main performance benefit is blocking malicious scripts before they execute, preventing the performance cost of injected cryptocurrency miners, analytics scripts, or ad networks.

**9. CSP Reporting Pipeline:**

Violation reports are sent as POST requests with JSON payload:
```json
{
  "csp-report": {
    "document-uri": "https://example.com/page",
    "referrer": "",
    "violated-directive": "script-src 'self'",
    "effective-directive": "script-src",
    "original-policy": "script-src 'self'; report-uri /csp",
    "blocked-uri": "https://evil.com/script.js",
    "status-code": 200,
    "source-file": "https://example.com/page",
    "line-number": 42,
    "column-number": 15
  }
}
```

Reports are queued and batched by browsers to prevent performance issues. Most browsers limit report queue to ~100 violations per page load. Use `report-uri` for CSP Level 2, `report-to` for CSP Level 3 with Reporting API.

</details>

<details>
<summary><strong>🐛 Real-World Scenario: CSP Blocking Legitimate Analytics at E-commerce Platform</strong></summary>

**Context:**

ShopNow, a mid-sized e-commerce platform with 2M monthly active users, decided to implement Content Security Policy to protect against XSS attacks after a security audit. The security team deployed a strict CSP policy across all pages to achieve compliance with PCI-DSS requirements for payment processing.

**Problem:**

Within 2 hours of deploying CSP to production, the engineering team received urgent alerts:

1. **Complete Analytics Blackout**: Google Analytics, Mixpanel, and Segment stopped working across all pages
2. **Payment Gateway Failures**: Stripe Checkout failed to load, preventing all transactions
3. **Chat Widget Broken**: Intercom chat widget disappeared from all pages
4. **Custom Features Down**: Internal A/B testing framework stopped functioning
5. **Revenue Impact**: $45,000/hour revenue loss due to broken checkout

**Metrics Before Fix:**

- **Analytics Coverage**: 0% (complete blackout)
- **Checkout Completion Rate**: 0% (down from 68%)
- **Error Rate**: 847% spike in JavaScript errors
- **CSP Violations**: 127,000 reports in first hour
- **Customer Support Tickets**: +340% increase
- **Page Load Performance**: Actually improved by 15% (blocked scripts weren't loading)

**Root Cause:**

The security team deployed an overly restrictive CSP without testing:

```javascript
// ❌ TOO RESTRICTIVE - Breaks everything
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self'
```

This policy:
- Blocked all third-party scripts (analytics, payments, chat)
- Blocked all inline scripts (React app, embedded widgets)
- Blocked all inline styles (styled-components, CSS-in-JS)
- Blocked all external fonts, images from CDNs

**Debugging Process:**

**Step 1: Immediate Rollback** (5 minutes)
```bash
# Emergency rollback
git revert HEAD
git push origin main
# Deployed within 5 minutes using blue-green deployment
```

**Step 2: CSP Violation Analysis** (30 minutes)

Set up violation reporting endpoint:
```javascript
app.post('/csp-report', (req, res) => {
  const violation = req.body['csp-report'];

  // Log to Elasticsearch for analysis
  logger.warn('CSP_VIOLATION', {
    blockedURI: violation['blocked-uri'],
    violatedDirective: violation['violated-directive'],
    page: violation['document-uri'],
    timestamp: new Date()
  });

  res.status(204).end();
});
```

Analyzed top violations in Kibana:
- 45,000 violations: Google Analytics (`https://www.google-analytics.com/analytics.js`)
- 28,000 violations: Stripe Checkout (`https://js.stripe.com/v3/`)
- 18,000 violations: Inline React scripts (nonce missing)
- 12,000 violations: Intercom widget (`https://widget.intercom.io/`)
- 11,000 violations: CDN images (`https://cdn.shopnow.com/`)

**Step 3: Gradual CSP Implementation** (2 weeks)

Deployed in phases using Report-Only mode:

**Phase 1: Report-Only with Permissive Policy** (Days 1-3)
```javascript
Content-Security-Policy-Report-Only:
  default-src 'self' https:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
  report-uri /csp-report
```

Collected 2.4M violation reports over 3 days, categorized by legitimacy.

**Phase 2: Whitelist Third-Party Services** (Days 4-7)
```javascript
const trustedDomains = {
  analytics: [
    'https://www.google-analytics.com',
    'https://api.mixpanel.com',
    'https://cdn.segment.com'
  ],
  payments: [
    'https://js.stripe.com',
    'https://checkout.stripe.com'
  ],
  widgets: [
    'https://widget.intercom.io',
    'https://js.intercomcdn.com'
  ],
  cdn: [
    'https://cdn.shopnow.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ]
};

const csp = `
  default-src 'self';
  script-src 'self' ${trustedDomains.analytics.join(' ')} ${trustedDomains.payments.join(' ')} ${trustedDomains.widgets.join(' ')};
  connect-src 'self' https://api.shopnow.com ${trustedDomains.analytics.join(' ')};
  img-src 'self' ${trustedDomains.cdn.join(' ')} data: https:;
  font-src 'self' ${trustedDomains.cdn.join(' ')};
  frame-src ${trustedDomains.payments.join(' ')};
  style-src 'self' 'unsafe-inline';
  report-uri /csp-report
`;
```

Still in Report-Only mode. Violations dropped to 12,000/day (99.5% reduction).

**Phase 3: Implement Nonces for First-Party Scripts** (Days 8-12)

Updated SSR pipeline to inject nonces:
```javascript
// Server-side nonce generation
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

// CSP header with nonce
app.use((req, res, next) => {
  const nonce = res.locals.cspNonce;
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    `script-src 'self' 'nonce-${nonce}' ${trustedDomains.analytics.join(' ')} ...`
  );
  next();
});

// HTML template (server-rendered)
`
<script nonce="${nonce}">
  window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
</script>
<script nonce="${nonce}" src="/app.js"></script>
`
```

Violations dropped to 800/day (remaining were legitimate blocks of suspicious activity).

**Phase 4: Enforcement Mode** (Days 13-14)

Changed from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`. Monitored for 48 hours with no critical issues.

**Solution:**

Final production CSP policy:
```javascript
const generateCSP = (nonce) => {
  const policy = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      'https://www.google-analytics.com',
      'https://api.mixpanel.com',
      'https://cdn.segment.com',
      'https://js.stripe.com',
      'https://widget.intercom.io'
    ],
    'style-src': [
      "'self'",
      `'nonce-${nonce}'`,
      'https://fonts.googleapis.com'
    ],
    'connect-src': [
      "'self'",
      'https://api.shopnow.com',
      'https://www.google-analytics.com',
      'https://api.mixpanel.com',
      'https://api.segment.io'
    ],
    'img-src': [
      "'self'",
      'https://cdn.shopnow.com',
      'data:',
      'https:'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'https://cdn.shopnow.com'
    ],
    'frame-src': [
      'https://checkout.stripe.com',
      'https://js.stripe.com'
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
    'report-uri': ['/csp-report']
  };

  return Object.entries(policy)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};
```

**Results After Fix:**

- **Analytics Coverage**: 99.8% (back to normal)
- **Checkout Completion Rate**: 69% (above pre-CSP baseline)
- **CSP Violations**: 400-600/day (only suspicious activity)
- **Blocked XSS Attempts**: 23 attempts blocked in first month
- **Security Score**: A+ on Mozilla Observatory
- **PCI-DSS Compliance**: Achieved
- **Performance**: No measurable impact on page load time

**Prevention Strategies:**

1. **Always Use Report-Only Mode First**
   ```javascript
   // ✅ Test with Report-Only for 1-2 weeks
   Content-Security-Policy-Report-Only: ...

   // ❌ Never deploy enforcement mode without testing
   Content-Security-Policy: default-src 'self'
   ```

2. **Automated CSP Testing**
   ```javascript
   // Cypress test for CSP compliance
   it('should load all critical third-party scripts', () => {
     cy.visit('/');
     cy.window().then((win) => {
       expect(win.ga).to.exist; // Google Analytics loaded
       expect(win.Stripe).to.exist; // Stripe loaded
       expect(win.Intercom).to.exist; // Intercom loaded
     });
   });
   ```

3. **CSP Violation Monitoring**
   ```javascript
   // Set up alerting for CSP violation spikes
   const violationRate = violations.length / totalPageViews;
   if (violationRate > 0.01) { // 1% threshold
     alerting.send('CSP_VIOLATION_SPIKE', {
       rate: violationRate,
       topViolations: getTopViolations(violations, 10)
     });
   }
   ```

4. **Documentation and Runbooks**
   - Maintain list of all whitelisted domains with justification
   - Create runbook for adding new third-party services
   - Quarterly audit of CSP policy to remove unused domains

**Monitoring Going Forward:**

- CSP violation dashboard in Grafana
- Weekly reports of top violation sources
- Automated alerts for >5% spike in violations
- Monthly security reviews of whitelisted domains

</details>

<details>
<summary><strong>⚖️ Trade-offs: CSP Implementation Strategies</strong></summary>

**Comparing Different CSP Approaches:**

| **Strategy** | **Security Level** | **Developer Experience** | **Third-Party Support** | **Maintenance** | **Best For** |
|-------------|-------------------|-------------------------|------------------------|----------------|-------------|
| **Nonce-based** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Modern SSR apps |
| **Hash-based** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Static sites |
| **Whitelist-based** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | Legacy apps |
| **Strict-dynamic** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | SPAs with bundlers |
| **Trusted Types** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | High-security apps |

**1. Nonce-based CSP vs Hash-based CSP:**

**Nonce-based (Dynamic Content):**
```javascript
// ✅ GOOD: For server-rendered apps with dynamic content
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader('Content-Security-Policy',
    `script-src 'nonce-${nonce}' 'strict-dynamic'`);
  next();
});

// Pros:
// - Works with dynamic inline scripts
// - No need to update hashes when content changes
// - Compatible with strict-dynamic
// - Good for A/B testing, personalization

// Cons:
// - Requires server-side rendering or SSR
// - Nonce must be unique per request (more complex)
// - Can't cache HTML with nonces (different per request)
```

**Hash-based (Static Content):**
```javascript
// ✅ GOOD: For static sites or build-time known scripts
const scriptHash = 'sha256-xyz123...';
res.setHeader('Content-Security-Policy',
  `script-src 'self' '${scriptHash}'`);

// Pros:
// - Perfect for static sites (Gatsby, Hugo, Jekyll)
// - HTML can be cached (hashes don't change)
// - No server-side logic needed
// - Works with CDNs

// Cons:
// - Must recalculate hashes on every content change
// - Not suitable for dynamic content
// - Build process must compute hashes
// - Whitespace changes break hashes
```

**When to Choose:**
- **Nonce**: Next.js, Remix, server-rendered React/Vue
- **Hash**: Static site generators, cached content, CDN-heavy sites

**2. CSP Level Comparison:**

**CSP Level 1 (Whitelist-only):**
```javascript
// Basic source whitelisting
"script-src 'self' https://trusted.com"

// Pros: Wide browser support (IE11+)
// Cons:
// - No nonce/hash support
// - 'unsafe-inline' defeats purpose
// - CDN whitelisting can be bypassed
```

**CSP Level 2 (Nonces & Hashes):**
```javascript
// Modern approach with nonces
"script-src 'nonce-abc123' 'strict-dynamic'"

// Pros:
// - Strong XSS protection
// - Works with modern apps
// - Backward compatible with Level 1

// Cons:
// - Not supported in IE11
// - Requires implementation changes
```

**CSP Level 3 (Trusted Types):**
```javascript
// DOM XSS prevention
"require-trusted-types-for 'script'; trusted-types myPolicy"

// Pros:
// - Prevents DOM XSS at API level
// - Catches vulnerabilities at runtime
// - Forces sanitization

// Cons:
// - Limited browser support (Chrome 83+)
// - Requires significant code changes
// - Not compatible with many libraries
```

**3. Inline Scripts Trade-offs:**

**Approach 1: No Inline Scripts**
```javascript
// ❌ BAD: Requires 'unsafe-inline'
<script>
  window.config = { apiKey: '...' };
</script>

// ✅ GOOD: External script
// config.js
window.config = { apiKey: '...' };
// CSP: script-src 'self'

// Pros: Simplest CSP policy
// Cons: Extra HTTP request, can't pass dynamic data easily
```

**Approach 2: Nonces for Inline Scripts**
```javascript
// ✅ GOOD: Inline with nonce
<script nonce="abc123">
  window.config = { apiKey: '<%= apiKey %>' };
</script>

// Pros: Dynamic data, strong security
// Cons: Requires SSR, no HTML caching
```

**Approach 3: Data Attributes**
```javascript
// ✅ GOOD: Pass data via data attributes
<div id="app" data-api-key="..."></div>
<script src="/app.js"></script>

// app.js
const apiKey = document.getElementById('app').dataset.apiKey;

// Pros: No inline scripts needed, CSP-friendly
// Cons: Limited to string data, visible in DOM
```

**4. Third-Party Scripts Trade-offs:**

**Approach 1: Direct Whitelisting**
```javascript
"script-src 'self' https://www.google-analytics.com https://cdn.segment.com"

// Pros: Simple to implement
// Cons:
// - Long CSP header (10+ domains common)
// - Each new service requires CSP update
// - Subdomains might be compromised
```

**Approach 2: Nonce + strict-dynamic**
```javascript
"script-src 'nonce-xyz' 'strict-dynamic'"

// Load third-party scripts dynamically
<script nonce="xyz">
  const script = document.createElement('script');
  script.src = 'https://www.google-analytics.com/analytics.js';
  document.head.appendChild(script);
  // This script inherits trust from parent
</script>

// Pros:
// - Short CSP policy
// - Third-party scripts loaded programmatically are trusted
// - Easy to add new services

// Cons:
// - Requires loading all scripts dynamically
// - Browser support (CSP Level 3)
```

**5. Performance vs Security Trade-offs:**

**Maximum Security (May Impact Features):**
```javascript
const strictCSP = {
  'default-src': ["'none'"],
  'script-src': [`'nonce-${nonce}'`],
  'style-src': [`'nonce-${nonce}'`],
  'img-src': ["'self'"],
  'connect-src': ["'self'"],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'none'"],
  'form-action': ["'self'"]
};

// Impact:
// - No third-party scripts (analytics, chat, payments)
// - No CDN images/fonts
// - All scripts must have nonce
// - May break user experience
```

**Balanced Security (Production Recommended):**
```javascript
const balancedCSP = {
  'default-src': ["'self'"],
  'script-src': [`'nonce-${nonce}'`, 'https://trusted-analytics.com'],
  'style-src': [`'nonce-${nonce}'`, "'unsafe-inline'"], // For CSS-in-JS
  'img-src': ["'self'", 'https://cdn.example.com', 'data:', 'https:'],
  'connect-src': ["'self'", 'https://api.example.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'report-uri': ['/csp-report']
};

// Balance:
// - Essential third-party services allowed
// - Developer-friendly (CSS-in-JS works)
// - Strong XSS protection maintained
// - Violation reporting enabled
```

**6. Development vs Production CSP:**

**Development (Permissive):**
```javascript
if (process.env.NODE_ENV === 'development') {
  return "default-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
         "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
         "connect-src 'self' ws://localhost:*"; // For HMR
}

// Allows:
// - Hot Module Replacement
// - Inline scripts (React DevTools)
// - eval() (webpack dev server)
```

**Production (Strict):**
```javascript
if (process.env.NODE_ENV === 'production') {
  return `default-src 'self'; ` +
         `script-src 'nonce-${nonce}' 'strict-dynamic'; ` +
         `object-src 'none'; ` +
         `report-uri /csp-report`;
}
```

**Decision Matrix:**

| **Requirement** | **Recommended CSP Strategy** |
|----------------|------------------------------|
| Static site (Hugo, Jekyll) | Hash-based CSP |
| SSR app (Next.js, Remix) | Nonce-based CSP |
| SPA (React, Vue) | strict-dynamic with nonce |
| Legacy app with inline scripts | Gradual whitelist → nonce migration |
| High security (banking, healthcare) | Nonce + Trusted Types |
| Many third-party scripts | Nonce + strict-dynamic |
| E-commerce (Stripe, analytics) | Whitelist + nonce hybrid |

**Best Practices:**

1. **Start with Report-Only mode** for 1-2 weeks
2. **Use nonces over hashes** for dynamic apps
3. **Avoid 'unsafe-inline'** and 'unsafe-eval' in production
4. **Implement violation reporting** from day one
5. **Audit CSP quarterly** to remove unused domains
6. **Use strict-dynamic** for modern browsers
7. **Test CSP changes** in staging with real traffic

</details>

<details>
<summary><strong>💬 Explain to Junior: Understanding Content Security Policy</strong></summary>

**Real-Life Analogy:**

Think of your website as a **nightclub**, and Content Security Policy (CSP) is the **bouncer with a guest list**.

**Without CSP (No Bouncer):**
- Anyone can walk in and do anything
- Random people can spike drinks (inject malicious scripts)
- Troublemakers can cause chaos (XSS attacks)
- You have no control over who enters

**With CSP (Bouncer with Guest List):**
- Only people on the list can enter (whitelisted domains)
- Each guest gets a special wristband (nonce)
- If someone not on the list tries to enter, they're blocked
- You get a report of who was turned away (violation reports)

**Why This Matters:**

Imagine you built a banking website. Without CSP, an attacker could inject JavaScript that:
1. Steals login credentials as users type
2. Redirects payments to attacker's account
3. Sends user data to malicious servers

CSP is like having a security guard that says: "Only scripts from our bank's servers can run. Everything else is blocked."

**In Simple Terms:**

CSP is a security feature that tells the browser: **"Only load and execute code from sources I trust."**

It's like childproofing your house - you lock away dangerous stuff and only allow safe activities in specific rooms.

**How CSP Works (Kitchen Analogy):**

Imagine CSP as rules for your kitchen:

```javascript
// CSP Policy = Kitchen Rules
"script-src 'self' https://recipes.com"

// Translation:
// - 'self': Only use ingredients from MY pantry
// - 'https://recipes.com': Also allowed to use recipes from this trusted cookbook
// - Everything else: BLOCKED
```

If someone tries to use ingredients from an unknown source (malicious script), CSP blocks it:
```javascript
// ❌ Attacker tries to inject
<script src="https://evil-hacker.com/steal-cookies.js"></script>

// CSP says: "Not on the list! BLOCKED! "
// Browser doesn't load the script
```

**Common Scenarios:**

**Scenario 1: Inline Scripts (The Stranger Danger)**

Without CSP:
```html
<!-- ❌ Anyone can inject this -->
<button onclick="alert('You are hacked!')">Click me</button>
```

With CSP:
```javascript
// CSP blocks inline event handlers
"script-src 'self'"

// Now the malicious onclick is blocked!
```

**Scenario 2: Using Nonces (The VIP Wristband)**

Think of a nonce as a VIP wristband that changes for each event (page load):

```javascript
// Server generates unique wristband for this page load
const nonce = "abc123"; // Changes every time

// CSP: "Only scripts with THIS wristband can enter"
"script-src 'nonce-abc123'"
```

```html
<!-- ✅ This script has the wristband - ALLOWED -->
<script nonce="abc123">
  console.log("I'm trusted!");
</script>

<!-- ❌ This script has NO wristband - BLOCKED -->
<script>
  console.log("I'm blocked!");
</script>
```

**Scenario 3: Third-Party Scripts (The Guest List)**

Your website needs Google Analytics, but you don't want random scripts:

```javascript
// CSP: "Allow scripts from my site AND Google Analytics"
"script-src 'self' https://www.google-analytics.com"

// Allowed:
// ✅ Your own scripts
// ✅ Google Analytics
// ❌ Everything else
```

**Common Beginner Mistakes:**

**Mistake 1: Using 'unsafe-inline' (Defeating the Purpose)**
```javascript
// ❌ BAD: This allows ANY inline script
"script-src 'self' 'unsafe-inline'"

// This is like having a bouncer who lets everyone in!
// XSS attacks can still work.

// ✅ GOOD: Use nonces instead
"script-src 'self' 'nonce-xyz123'"
```

**Mistake 2: Forgetting to Whitelist Needed Services**
```javascript
// ❌ BAD: Too restrictive, breaks everything
"script-src 'self'"
// Blocks Google Analytics, Stripe, everything!

// ✅ GOOD: Whitelist what you need
"script-src 'self' https://www.google-analytics.com https://js.stripe.com"
```

**Mistake 3: Not Testing Before Deployment**
```javascript
// ❌ BAD: Deploy CSP directly to production
res.setHeader('Content-Security-Policy', "script-src 'self'");
// Breaks production immediately!

// ✅ GOOD: Test with Report-Only first
res.setHeader('Content-Security-Policy-Report-Only', "script-src 'self'");
// Reports violations but doesn't block
// Test for 1-2 weeks, then switch to enforcement
```

**Interview Answer Template:**

**Question: "What is Content Security Policy and why is it important?"**

**2-Minute Answer:**

"Content Security Policy (CSP) is a security standard that prevents Cross-Site Scripting (XSS) attacks by controlling which resources can load and execute on a webpage.

**How it works:** You define a whitelist of trusted sources in an HTTP header. The browser enforces this policy and blocks any content from unauthorized sources.

**Example:** If your CSP says `script-src 'self'`, only scripts from your own domain can run. If an attacker tries to inject a script from evil.com, the browser blocks it automatically.

**Key benefits:**
1. **XSS Prevention**: Even if an attacker finds an injection point, their malicious code won't execute
2. **Defense in Depth**: Works alongside input sanitization as an additional security layer
3. **Violation Reporting**: You get reports when something tries to violate your policy

**In practice:** For a modern React app, I'd use nonce-based CSP:

```javascript
// Generate unique nonce per request
const nonce = crypto.randomBytes(16).toString('base64');

// Set CSP header
res.setHeader('Content-Security-Policy',
  `script-src 'nonce-${nonce}' 'strict-dynamic'; object-src 'none'`
);

// Add nonce to script tags
<script nonce={nonce} src="/app.js"></script>
```

**Important:** Always start with Report-Only mode to test your policy before enforcing it, otherwise you risk breaking legitimate functionality.

**Common pitfall:** Don't use `'unsafe-inline'` in production as it defeats the purpose of CSP. Use nonces or hashes instead."

**Follow-Up Concepts:**

**Q: "What's the difference between CSP and input sanitization?"**

A: "They're complementary security layers:
- **Input Sanitization**: Prevents malicious code from being saved to your database (e.g., using DOMPurify)
- **CSP**: Prevents malicious code from executing even if it gets into your HTML

Think of it like a house:
- Sanitization = Locking your doors (prevent entry)
- CSP = Security system (block threats that get past the lock)

You need BOTH for complete protection."

**Q: "When would you use nonces vs hashes?"**

A: "
- **Nonces**: For server-rendered apps with dynamic content (Next.js, Remix)
  - Content changes per request
  - Personalization, A/B tests
  - Example: User-specific data in inline scripts

- **Hashes**: For static sites with fixed content (Gatsby, Hugo)
  - Content is the same for all users
  - Can cache HTML aggressively
  - Example: Blog posts, documentation sites

I prefer nonces for most modern apps because they're more flexible and work well with 'strict-dynamic'."

**Visual Learning Aid:**

```
CSP Enforcement Flow:
┌─────────────────┐
│  Browser loads  │
│   HTML page     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Check CSP header        │
│ script-src 'self'       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Script tag encountered: │
│ <script src="...">      │
└────────┬────────────────┘
         │
         ├─────────────────┐
         ▼                 ▼
┌──────────────┐   ┌─────────────┐
│ From 'self'? │   │ From other? │
│   ✅ ALLOW   │   │  ❌ BLOCK   │
└──────────────┘   └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │ Send report │
                   │ to server   │
                   └─────────────┘
```

**Key Takeaways:**

1. CSP is a **whitelist** of trusted sources
2. Use **nonces** for dynamic content
3. Start with **Report-Only mode**
4. **Never use** 'unsafe-inline' in production
5. CSP + sanitization = **defense in depth**

</details>

### Common Mistakes

❌ **Wrong**: Using 'unsafe-inline' in production
```javascript
// Defeats the purpose of CSP
res.setHeader('Content-Security-Policy',
  "script-src 'self' 'unsafe-inline'");
// XSS attacks still work!
```

✅ **Correct**: Use nonces or hashes
```javascript
const nonce = crypto.randomBytes(16).toString('base64');
res.setHeader('Content-Security-Policy',
  `script-src 'self' 'nonce-${nonce}'`);
```

---

❌ **Wrong**: Deploying CSP directly to production without testing
```javascript
// Can break critical functionality
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

✅ **Correct**: Test with Report-Only mode first
```javascript
// Test for 1-2 weeks before enforcing
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy-Report-Only',
    "default-src 'self'; report-uri /csp-report");
  next();
});
```

---

❌ **Wrong**: Whitelisting entire CDNs
```javascript
// CDN compromise affects all customers
"script-src 'self' https://cdn.example.com"
// If cdn.example.com is compromised, your site is too
```

✅ **Correct**: Use specific paths or strict-dynamic
```javascript
// More specific whitelisting
"script-src 'self' https://cdn.example.com/lib/v1.2.3/"

// Or use strict-dynamic with nonces
"script-src 'nonce-xyz' 'strict-dynamic'"
```

### Follow-up Questions

1. "How do you handle CSP for a SPA using a bundler like Webpack?"
2. "What are Trusted Types and how do they enhance CSP?"
3. "How would you debug CSP violations in production?"
4. "Can CSP prevent all XSS attacks? What are its limitations?"
5. "How do you implement CSP for third-party iframes?"

### Resources

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Google: CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [CSP Level 3 Specification](https://www.w3.org/TR/CSP3/)
- [OWASP: Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

---
