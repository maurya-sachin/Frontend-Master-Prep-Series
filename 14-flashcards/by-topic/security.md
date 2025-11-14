# Security Master Flashcards

> **30 essential security concepts for frontend interviews**

**Time to review:** 15 minutes
**Best for:** Security-focused roles, senior positions

---

## Card 1: XSS Prevention
**Q:** How do you prevent XSS attacks?

**A:** Sanitize user input, escape output, use Content Security Policy, avoid dangerouslySetInnerHTML, use DOMPurify for HTML, validate on server, HTTP-only cookies.

**Difficulty:** 🟡 Medium
**Tags:** #security #xss #prevention
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 2: CSRF Protection
**Q:** How does CSRF protection work?

**A:** Anti-CSRF tokens, SameSite cookies, verify origin/referer headers, require re-authentication for sensitive actions, use POST for state changes.

**Difficulty:** 🟡 Medium
**Tags:** #security #csrf #tokens
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 3: CSP Headers
**Q:** What is Content Security Policy?

**A:** HTTP header restricting resource loading. Prevents XSS by whitelisting sources. Example: script-src 'self' cdn.example.com. Use nonces for inline scripts.

**Difficulty:** 🟡 Medium
**Tags:** #security #csp #headers
**Frequency:** ⭐⭐⭐⭐

---

## Card 4: JWT Storage
**Q:** Where should you store JWT tokens?

**A:** httpOnly cookies (best for auth), sessionStorage (XSS vulnerable), localStorage (persistent XSS risk). Never store sensitive tokens in localStorage.

**Difficulty:** 🟡 Medium
**Tags:** #security #jwt #storage
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 5: HTTPS Importance
**Q:** Why is HTTPS critical?

**A:** Encrypts data in transit, prevents man-in-the-middle attacks, required for modern APIs, enables HTTP/2, required for service workers, builds user trust.

**Difficulty:** 🟢 Easy
**Tags:** #security #https #encryption
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 6: CORS Purpose
**Q:** What problem does CORS solve?

**A:** Controls cross-origin requests, prevents unauthorized API access, protects user data. Server sets Access-Control-Allow-Origin header. Preflight for complex requests.

**Difficulty:** 🟡 Medium
**Tags:** #security #cors #cross-origin
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 7: SQL Injection Prevention
**Q:** How to prevent SQL injection in full-stack apps?

**A:** Use parameterized queries, prepared statements, ORMs, input validation, least privilege database users, never concatenate user input into SQL.

**Difficulty:** 🟡 Medium
**Tags:** #security #sql-injection #backend
**Frequency:** ⭐⭐⭐⭐

---

## Card 8: Clickjacking Prevention
**Q:** How to prevent clickjacking?

**A:** X-Frame-Options header (DENY/SAMEORIGIN), CSP frame-ancestors directive, UI redressing detection, avoid sensitive actions on GET.

**Difficulty:** 🟡 Medium
**Tags:** #security #clickjacking #headers
**Frequency:** ⭐⭐⭐

---

## Card 9: Dependency Vulnerabilities
**Q:** How to manage npm package security?

**A:** npm audit, Snyk, Dependabot, lock files, update regularly, review dependencies, use fewer dependencies, check package reputation.

**Difficulty:** 🟡 Medium
**Tags:** #security #dependencies #npm
**Frequency:** ⭐⭐⭐⭐

---

## Card 10: Secure Password Handling
**Q:** Frontend password best practices?

**A:** Never log passwords, use type="password", HTTPS only, show strength indicator, allow paste, no max length, use autocomplete="current-password".

**Difficulty:** 🟢 Easy
**Tags:** #security #passwords #forms
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 11: OAuth 2.0 Flow
**Q:** Explain OAuth 2.0 authorization code flow?

**A:** User redirects to provider, authenticates, redirects back with code, exchange code for token on backend, use token for API requests. PKCE for SPAs.

**Difficulty:** 🔴 Hard
**Tags:** #security #oauth #authentication
**Frequency:** ⭐⭐⭐⭐

---

## Card 12: Rate Limiting
**Q:** Why implement rate limiting?

**A:** Prevent brute force, DDoS protection, API abuse prevention, resource conservation. Implement on backend, use exponential backoff on frontend.

**Difficulty:** 🟡 Medium
**Tags:** #security #rate-limiting #api
**Frequency:** ⭐⭐⭐⭐

---

## Card 13: Secure Cookies
**Q:** What makes cookies secure?

**A:** HttpOnly (no JS access), Secure (HTTPS only), SameSite (CSRF protection), appropriate expiration, minimal data, domain/path scope.

**Difficulty:** 🟡 Medium
**Tags:** #security #cookies #attributes
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 14: Subresource Integrity
**Q:** What is SRI and when to use it?

**A:** integrity attribute on script/link tags. Ensures CDN resources unchanged. Example: integrity="sha384-...". Use for third-party resources.

**Difficulty:** 🟡 Medium
**Tags:** #security #sri #cdn
**Frequency:** ⭐⭐⭐

---

## Card 15: Input Validation
**Q:** Client vs server validation importance?

**A:** Client: UX, immediate feedback. Server: security (never trust client), data integrity. Always validate on server. Client validation is convenience, not security.

**Difficulty:** 🟢 Easy
**Tags:** #security #validation #forms
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 16: API Key Exposure
**Q:** How to handle API keys in frontend?

**A:** Never commit to git, use environment variables, backend proxy for sensitive APIs, rotate regularly, restrict by domain/IP, use backend for secret keys.

**Difficulty:** 🟡 Medium
**Tags:** #security #api-keys #secrets
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 17: Session Management
**Q:** Best practices for session security?

**A:** Regenerate session ID after login, timeout inactive sessions, secure session storage, logout on all tabs, invalidate on server.

**Difficulty:** 🟡 Medium
**Tags:** #security #sessions #authentication
**Frequency:** ⭐⭐⭐⭐

---

## Card 18: DOM-based XSS
**Q:** What is DOM-based XSS?

**A:** Vulnerability in client-side code. User input directly manipulated into DOM. Example: innerHTML with unsanitized data. Use textContent or sanitize.

**Difficulty:** 🔴 Hard
**Tags:** #security #xss #dom
**Frequency:** ⭐⭐⭐⭐

---

## Card 19: Security Headers
**Q:** Essential security headers for SPAs?

**A:** CSP, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy, Permissions-Policy. Configure on server/CDN.

**Difficulty:** 🟡 Medium
**Tags:** #security #headers #configuration
**Frequency:** ⭐⭐⭐⭐

---

## Card 20: Prototype Pollution
**Q:** What is prototype pollution?

**A:** Modifying Object.prototype affects all objects. Attack via user input into object merge. Prevent: Object.create(null), Object.freeze, input validation.

**Difficulty:** 🔴 Hard
**Tags:** #security #javascript #vulnerabilities
**Frequency:** ⭐⭐⭐

---

## Card 21: Open Redirect
**Q:** How to prevent open redirect vulnerabilities?

**A:** Whitelist allowed redirect URLs, validate redirect parameter, use relative URLs, warn users for external redirects, server-side validation.

**Difficulty:** 🟡 Medium
**Tags:** #security #redirects #validation
**Frequency:** ⭐⭐⭐

---

## Card 22: Auth Token Refresh
**Q:** How to handle token refresh securely?

**A:** Short-lived access tokens, long-lived refresh tokens in httpOnly cookies, refresh before expiry, revoke on logout, detect token theft.

**Difficulty:** 🔴 Hard
**Tags:** #security #tokens #authentication
**Frequency:** ⭐⭐⭐⭐

---

## Card 23: Secure File Upload
**Q:** Frontend file upload security?

**A:** Validate file type/size client-side, server validates MIME type and content, limit file size, scan for malware, unique filenames, CDN storage.

**Difficulty:** 🟡 Medium
**Tags:** #security #file-upload #validation
**Frequency:** ⭐⭐⭐⭐

---

## Card 24: Third-Party Scripts
**Q:** Risks of third-party scripts?

**A:** Can access entire DOM, steal data, inject code. Mitigate: CSP, SRI, sandbox iframes, minimal permissions, audit regularly.

**Difficulty:** 🟡 Medium
**Tags:** #security #third-party #risks
**Frequency:** ⭐⭐⭐⭐

---

## Card 25: Secrets in Git
**Q:** What to do if secrets committed to git?

**A:** Rotate immediately, git filter-branch to remove, .gitignore for future, use git-secrets, environment variables, secrets management tools.

**Difficulty:** 🟡 Medium
**Tags:** #security #git #secrets
**Frequency:** ⭐⭐⭐⭐

---

## Card 26: iframe Security
**Q:** How to secure iframes?

**A:** sandbox attribute, CSP frame-ancestors, X-Frame-Options, postMessage for communication, validate message origin, minimal permissions.

**Difficulty:** 🟡 Medium
**Tags:** #security #iframe #sandbox
**Frequency:** ⭐⭐⭐

---

## Card 27: Timing Attacks
**Q:** What are timing attacks?

**A:** Exploit time differences in operations to infer information. Example: password comparison. Prevent with constant-time comparisons, rate limiting.

**Difficulty:** 🔴 Hard
**Tags:** #security #timing #attacks
**Frequency:** ⭐⭐

---

## Card 28: Security Auditing
**Q:** How to audit frontend security?

**A:** npm audit, OWASP ZAP, penetration testing, code review, security headers check, dependency scanning, manual testing.

**Difficulty:** 🟡 Medium
**Tags:** #security #auditing #testing
**Frequency:** ⭐⭐⭐⭐

---

## Card 29: Secure WebSockets
**Q:** WebSocket security considerations?

**A:** Use WSS (encrypted), validate origin, authenticate connections, rate limit, validate all messages, timeout idle connections.

**Difficulty:** 🟡 Medium
**Tags:** #security #websockets #real-time
**Frequency:** ⭐⭐⭐

---

## Card 30: Content Sniffing
**Q:** What is MIME sniffing and how to prevent?

**A:** Browser guesses content type, security risk. Prevent with X-Content-Type-Options: nosniff header. Ensure correct Content-Type headers.

**Difficulty:** 🟡 Medium
**Tags:** #security #mime #headers
**Frequency:** ⭐⭐⭐

---

[← Back to Flashcards](../README.md)
