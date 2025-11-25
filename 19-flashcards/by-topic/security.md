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

**💡 Interview Tip:** Ask "What's more dangerous—reflected or stored XSS?" Show you understand reflected hits immediately, stored persists. Mention React escapes by default but `dangerouslySetInnerHTML` bypasses this. A real senior avoids the danger method entirely—if you need HTML, use libraries like DOMPurify that whitelist safe tags.

---

## Card 2: CSRF Protection
**Q:** How does CSRF protection work?

**A:** Anti-CSRF tokens, SameSite cookies, verify origin/referer headers, require re-authentication for sensitive actions, use POST for state changes.

**Difficulty:** 🟡 Medium
**Tags:** #security #csrf #tokens
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Explain that CSRF exploits the browser's automatic cookie inclusion. The attacker's site can make requests to your bank, and your credentials go with it. CSRF tokens break this: a unique per-request token proves the user genuinely visited your site. SameSite=Strict is more modern but less compatible—good engineers know both approaches and their trade-offs.

---

## Card 3: CSP Headers
**Q:** What is Content Security Policy?

**A:** HTTP header restricting resource loading. Prevents XSS by whitelisting sources. Example: script-src 'self' cdn.example.com. Use nonces for inline scripts.

**Difficulty:** 🟡 Medium
**Tags:** #security #csp #headers
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real engineers use CSP in "report-only" mode first to catch issues without breaking the app. Mention nonces for inline scripts—each script tag gets a unique token generated server-side. Experienced candidates know CSP breaks analytics/ads; they discuss the trade-off between security and tracking tools pragmatically.

---

## Card 4: JWT Storage
**Q:** Where should you store JWT tokens?

**A:** httpOnly cookies (best for auth), sessionStorage (XSS vulnerable), localStorage (persistent XSS risk). Never store sensitive tokens in localStorage.

**Difficulty:** 🟡 Medium
**Tags:** #security #jwt #storage
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** The killer insight: if XSS is exploited, localStorage tokens are stolen immediately. httpOnly cookies are immune to JS access, mitigating XSS impact (though CSRF risk remains). Explain the real trade-off: httpOnly + SameSite loses convenience but gains security. Fresh engineers always say "localStorage for persistence"—seniors recognize this is wrong for auth.

---

## Card 5: HTTPS Importance
**Q:** Why is HTTPS critical?

**A:** Encrypts data in transit, prevents man-in-the-middle attacks, required for modern APIs, enables HTTP/2, required for service workers, builds user trust.

**Difficulty:** 🟢 Easy
**Tags:** #security #https #encryption
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** HTTP exposes passwords, payment data, session tokens to WiFi eavesdropping. Show you know certificate pinning exists for apps needing extreme security. Mention HTTP/2 multiplexing only works over HTTPS. Senior engineers understand HTTPS isn't just encryption—it's identity verification via certificates, proving you reached the real server.

---

## Card 6: CORS Purpose
**Q:** What problem does CORS solve?

**A:** Controls cross-origin requests, prevents unauthorized API access, protects user data. Server sets Access-Control-Allow-Origin header. Preflight for complex requests.

**Difficulty:** 🟡 Medium
**Tags:** #security #cors #cross-origin
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Common misconception: CORS blocks requests on the frontend. Wrong—the browser blocks the response. Your backend MUST enforce CORS; frontend can't. Mention preflight OPTIONS requests for non-simple requests. Show you understand credentials: include requires both Access-Control-Allow-Credentials and wildcard restrictions, catching many engineers off guard.

---

## Card 7: SQL Injection Prevention
**Q:** How to prevent SQL injection in full-stack apps?

**A:** Use parameterized queries, prepared statements, ORMs, input validation, least privilege database users, never concatenate user input into SQL.

**Difficulty:** 🟡 Medium
**Tags:** #security #sql-injection #backend
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Parameterized queries work by separating SQL structure from data—the database never interprets data as code. Raw string concatenation `"SELECT * FROM users WHERE id=" + userId` is vulnerable even with "validation." ORMs abstract this but can still be misused. Real engineers think: the database layer decides trust boundaries, not the app logic.

---

## Card 8: Clickjacking Prevention
**Q:** How to prevent clickjacking?

**A:** X-Frame-Options header (DENY/SAMEORIGIN), CSP frame-ancestors directive, UI redressing detection, avoid sensitive actions on GET.

**Difficulty:** 🟡 Medium
**Tags:** #security #clickjacking #headers
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Clickjacking overlays your site in an invisible iframe, tricking users into unwanted clicks (transfer money, follow account). X-Frame-Options: DENY is simple but breaks legitimate embedded use cases. Show pragmatism: SAMEORIGIN for internal apps, CSP frame-ancestors for flexibility. Mention "UI redressing"—attackers can partially see your UI through opacity tricks.

---

## Card 9: Dependency Vulnerabilities
**Q:** How to manage npm package security?

**A:** npm audit, Snyk, Dependabot, lock files, update regularly, review dependencies, use fewer dependencies, check package reputation.

**Difficulty:** 🟡 Medium
**Tags:** #security #dependencies #npm
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** npm audit reports known CVEs but has false positives; good engineers don't blindly update. Explain supply chain attacks: even popular packages are compromised (leftpad, event-stream). Lock files prevent version creep. Show decision-making: sometimes ditch a package entirely if unmaintained. Ask "Have you evaluated a package's maintenance history?" to impress interviewers.

---

## Card 10: Secure Password Handling
**Q:** Frontend password best practices?

**A:** Never log passwords, use type="password", HTTPS only, show strength indicator, allow paste, no max length, use autocomplete="current-password".

**Difficulty:** 🟢 Easy
**Tags:** #security #passwords #forms
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** The killer mistake: arbitrary max-length fields (why cap at 20 characters?). Passphrases are longer and stronger. Password fields hide input but type="password" doesn't prevent copy—just prevents shoulder surfing. Allow paste; blocking paste forces weak passwords. autocomplete="current-password" helps password managers, improving security. Real engineers prioritize user experience alongside security.

---

## Card 11: OAuth 2.0 Flow
**Q:** Explain OAuth 2.0 authorization code flow?

**A:** User redirects to provider, authenticates, redirects back with code, exchange code for token on backend, use token for API requests. PKCE for SPAs.

**Difficulty:** 🔴 Hard
**Tags:** #security #oauth #authentication
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** The key insight: the authorization code is useless without the client secret (held securely on backend). Frontend never sees the secret. PKCE (Proof Key for Public Clients) adds code_challenge to prevent authorization code interception in SPAs—ask you understand this. Mention refresh tokens: access tokens are short-lived, refresh tokens obtain new ones silently.

---

## Card 12: Rate Limiting
**Q:** Why implement rate limiting?

**A:** Prevent brute force, DDoS protection, API abuse prevention, resource conservation. Implement on backend, use exponential backoff on frontend.

**Difficulty:** 🟡 Medium
**Tags:** #security #rate-limiting #api
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Brute-force password attacks exploit unlimited login attempts; rate limiting throttles them. DDoS exploits unlimited requests to crash servers. Show nuance: limit by IP, user ID, API key depending on context. Frontend exponential backoff improves UX; users see "try again in 60 seconds" instead of hammering a dead API. Mention token bucket algorithms for smooth rate limiting.

---

## Card 13: Secure Cookies
**Q:** What makes cookies secure?

**A:** HttpOnly (no JS access), Secure (HTTPS only), SameSite (CSRF protection), appropriate expiration, minimal data, domain/path scope.

**Difficulty:** 🟡 Medium
**Tags:** #security #cookies #attributes
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** HttpOnly prevents JavaScript theft; Secure prevents HTTP transmission. SameSite=Strict blocks cross-origin requests entirely; Lax allows top-level navigations. Show you've debugged this: SameSite=None requires Secure attribute, breaking HTTPS transitions. Veteran engineers explain cookie scope: domain=".example.com" affects subdomains, path=/admin limits scope. Discuss session fixation attacks when misusing cookies.

---

## Card 14: Subresource Integrity
**Q:** What is SRI and when to use it?

**A:** integrity attribute on script/link tags. Ensures CDN resources unchanged. Example: integrity="sha384-...". Use for third-party resources.

**Difficulty:** 🟡 Medium
**Tags:** #security #sri #cdn
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** CDN can be hacked or hijacked; SRI prevents malicious file delivery. If a CDN serves modified Bootstrap, integrity hash fails and the resource loads nowhere. Real use case: jQuery from CDN with SRI. Trade-off: updates require hash regeneration. Show you understand: SRI doesn't prevent the network request, just validates the response matches the hash.

---

## Card 15: Input Validation
**Q:** Client vs server validation importance?

**A:** Client: UX, immediate feedback. Server: security (never trust client), data integrity. Always validate on server. Client validation is convenience, not security.

**Difficulty:** 🟢 Easy
**Tags:** #security #validation #forms
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** A fundamental rule: never trust the client. An attacker can bypass your JavaScript validation entirely via cURL or browser dev tools. Client validation improves UX; server validation prevents security breaches. Both matter—combine them. Show you've experienced this: email format validation client-side, uniqueness check server-side. This separates juniors from seniors immediately.

---

## Card 16: API Key Exposure
**Q:** How to handle API keys in frontend?

**A:** Never commit to git, use environment variables, backend proxy for sensitive APIs, rotate regularly, restrict by domain/IP, use backend for secret keys.

**Difficulty:** 🟡 Medium
**Tags:** #security #api-keys #secrets
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Public keys in frontend are unavoidable for some APIs (Google Maps); restrict them by domain. Secret keys belong on the backend. GitHub scans public repos for credentials automatically. Show pragmatism: .env files prevent accidental commits; ask, "Have you ever leaked credentials?" and discuss recovery. Environment variables at build time inject keys securely.

---

## Card 17: Session Management
**Q:** Best practices for session security?

**A:** Regenerate session ID after login, timeout inactive sessions, secure session storage, logout on all tabs, invalidate on server.

**Difficulty:** 🟡 Medium
**Tags:** #security #sessions #authentication
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Session fixation attacks reuse old session IDs after login. Regenerating them prevents this. Inactive timeouts prevent stolen sessions from lasting forever. Cross-tab logout is tricky—show you know: localStorage/sessionStorage events notify other tabs, triggering logout. Server-side invalidation is critical: client says "log out," backend deletes the session, making the session ID worthless even if stolen.

---

## Card 18: DOM-based XSS
**Q:** What is DOM-based XSS?

**A:** Vulnerability in client-side code. User input directly manipulated into DOM. Example: innerHTML with unsanitized data. Use textContent or sanitize.

**Difficulty:** 🔴 Hard
**Tags:** #security #xss #dom
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Server provides safe data, but JavaScript mangles it: `element.innerHTML = userInput` is vulnerable. React prevents this via automatic escaping. Vanilla JavaScript devs must use textContent for text, innerHTML only for trusted HTML (then sanitize with DOMPurify). Show you understand the attack: `<img src=x onerror="alert('xss')">` in innerHTML executes. Common in search implementations—user searches "test", click search, URL contains injection.

---

## Card 19: Security Headers
**Q:** Essential security headers for SPAs?

**A:** CSP, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy, Permissions-Policy. Configure on server/CDN.

**Difficulty:** 🟡 Medium
**Tags:** #security #headers #configuration
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** These headers are invisible to users but critical for security. CSP prevents XSS; X-Frame-Options prevents clickjacking; Strict-Transport-Security forces HTTPS. Permissions-Policy (formerly Feature-Policy) blocks geolocation/camera/microphone access. Referrer-Policy controls what previous URL is shared. Practical: use a header checklist (OWASP), test with tools, enable gradually to avoid breaking the app.

---

## Card 20: Prototype Pollution
**Q:** What is prototype pollution?

**A:** Modifying Object.prototype affects all objects. Attack via user input into object merge. Prevent: Object.create(null), Object.freeze, input validation.

**Difficulty:** 🔴 Hard
**Tags:** #security #javascript #vulnerabilities
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** An attacker passes `{"__proto__": {"isAdmin": true}}` which pollutes Object.prototype, granting admin to all objects. Vulnerable in object merge operations (`Object.assign`, spread operator). Prevention: avoid merging user data with Object.prototype-based objects, use Object.create(null), or validate keys (reject "__proto__"). This is rare but devastating when it happens—show knowledge of deep merge libraries' vulnerabilities.

---

## Card 21: Open Redirect
**Q:** How to prevent open redirect vulnerabilities?

**A:** Whitelist allowed redirect URLs, validate redirect parameter, use relative URLs, warn users for external redirects, server-side validation.

**Difficulty:** 🟡 Medium
**Tags:** #security #redirects #validation
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Attacker crafts `yoursite.com/login?redirect=evil.com/phishing`, logs in, user redirected to fake site. Prevention: maintain a whitelist of safe redirects. Relative URLs (`/dashboard`) are always safe. External redirects should warn users or require re-authentication. Show you understand: JavaScript `window.location = userInput` is dangerous. Server-side validation is essential; frontend can be bypassed.

---

## Card 22: Auth Token Refresh
**Q:** How to handle token refresh securely?

**A:** Short-lived access tokens, long-lived refresh tokens in httpOnly cookies, refresh before expiry, revoke on logout, detect token theft.

**Difficulty:** 🔴 Hard
**Tags:** #security #tokens #authentication
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Access tokens expire in minutes; if stolen, exposure is limited. Refresh tokens last days but are httpOnly (safe from XSS). Silently refresh in background (Axios interceptors, fetch wrappers). Theft detection: if a refresh token refreshes multiple times in parallel, someone stole it—revoke all sessions. Show understanding: automatic refresh improves UX without sacrificing security.

---

## Card 23: Secure File Upload
**Q:** Frontend file upload security?

**A:** Validate file type/size client-side, server validates MIME type and content, limit file size, scan for malware, unique filenames, CDN storage.

**Difficulty:** 🟡 Medium
**Tags:** #security #file-upload #validation
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Attackers rename .exe to .jpg and upload; checking extension is useless. Server must inspect actual file content (magic bytes). Limit file size to prevent DoS. Rename files (`uuid-originalname.jpg`) prevents directory traversal attacks. Store on CDN, not your server. Malware scanning (VirusTotal API) is expensive but critical for financial/health apps. Show you know: a junior checks MIME type, a senior validates content.

---

## Card 24: Third-Party Scripts
**Q:** Risks of third-party scripts?

**A:** Can access entire DOM, steal data, inject code. Mitigate: CSP, SRI, sandbox iframes, minimal permissions, audit regularly.

**Difficulty:** 🟡 Medium
**Tags:** #security #third-party #risks
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Analytics, ads, chat widgets—all have access to the page. They can steal credit card data, plant malware, harvest user data. Show pragmatism: these are sometimes necessary for business. Mitigate with CSP (restrict what third-party scripts load), SRI (ensure they're unmodified), lazy-load (delay until needed). Sandbox iframes limit damage. Ask vendors about their security practices—a good vendor shares their security policies.

---

## Card 25: Secrets in Git
**Q:** What to do if secrets committed to git?

**A:** Rotate immediately, git filter-branch to remove, .gitignore for future, use git-secrets, environment variables, secrets management tools.

**Difficulty:** 🟡 Medium
**Tags:** #security #git #secrets
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** API keys in git history are exposed forever; GitHub and attackers scan public repos. Rotate all exposed secrets immediately (they're public). git filter-branch rewrites history to remove them (complex). Prevention: .gitignore keeps secrets local, pre-commit hooks (git-secrets) catch commits, environment variables at deployment. Modern approach: secrets management (HashiCorp Vault, AWS Secrets Manager). Show you've handled this incident before.

---

## Card 26: iframe Security
**Q:** How to secure iframes?

**A:** sandbox attribute, CSP frame-ancestors, X-Frame-Options, postMessage for communication, validate message origin, minimal permissions.

**Difficulty:** 🟡 Medium
**Tags:** #security #iframe #sandbox
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** iframes embed untrusted content; sandbox restricts permissions: no scripts, no form submission, no popups. Enable only necessary: `sandbox="allow-scripts allow-same-origin"`. postMessage allows parent-iframe communication safely. Critical: validate message origin (`event.origin === expectedOrigin`). Parents can click iframes invisibly (clickjacking); use X-Frame-Options: SAMEORIGIN to prevent this. Show you've built secure embedded experiences.

---

## Card 27: Timing Attacks
**Q:** What are timing attacks?

**A:** Exploit time differences in operations to infer information. Example: password comparison. Prevent with constant-time comparisons, rate limiting.

**Difficulty:** 🔴 Hard
**Tags:** #security #timing #attacks
**Frequency:** ⭐⭐

**💡 Interview Tip:** Comparing passwords naively: `password === userInput` returns false after 1 character if wrong, false after 2 if first char wrong. An attacker measures response times, deduces characters. Constant-time comparison checks all characters regardless of match. Frontend timing attacks are rare but backend password checks must be constant-time. Show sophistication: mention crypto-js libraries handle this. Rate limiting prevents brute force regardless.

---

## Card 28: Security Auditing
**Q:** How to audit frontend security?

**A:** npm audit, OWASP ZAP, penetration testing, code review, security headers check, dependency scanning, manual testing.

**Difficulty:** 🟡 Medium
**Tags:** #security #auditing #testing
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** npm audit lists known CVEs; Snyk/Dependabot automate updates. OWASP ZAP scans for XSS, clickjacking, misconfigurations automatically. Penetration testing: hire professionals to attack your app. Security headers: use securityheaders.com. Code review: pair developers with security mindset. Show pragmatism: automated tools catch 80%, manual testing finds the clever attacks. Real-world: regular audits are compliance requirements, not one-time checks.

---

## Card 29: Secure WebSockets
**Q:** WebSocket security considerations?

**A:** Use WSS (encrypted), validate origin, authenticate connections, rate limit, validate all messages, timeout idle connections.

**Difficulty:** 🟡 Medium
**Tags:** #security #websockets #real-time
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** WebSockets bypass CORS (they upgrade from HTTP), requiring explicit origin validation. Every WebSocket connection must authenticate (JWT, session cookie). Validate all messages; don't trust client input. Rate limit to prevent flooding. Idle timeout prevents zombie connections. Show you understand: WebSockets are persistent; one malicious connection lingers, consuming resources. Real-time apps need different security thinking than stateless REST.

---

## Card 30: Content Sniffing
**Q:** What is MIME sniffing and how to prevent?

**A:** Browser guesses content type, security risk. Prevent with X-Content-Type-Options: nosniff header. Ensure correct Content-Type headers.

**Difficulty:** 🟡 Medium
**Tags:** #security #mime #headers
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Without nosniff, a .jpg uploaded to your CDN could be executed as JavaScript if the browser detects script tags inside. Attackers upload `<script>steal()</script>` with a fake .jpg extension. X-Content-Type-Options: nosniff forces the browser to respect Content-Type (image/jpeg stays an image). Always set correct Content-Type headers. CDNs should enable nosniff by default. Show you think about entire request-response flow.

---

[← Back to Flashcards](../README.md)
