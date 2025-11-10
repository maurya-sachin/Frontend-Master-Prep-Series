# Authentication and Authorization

> JWT, OAuth, session management, secure authentication patterns, and best practices.

---

## Question 1: JWT vs Session-Based Authentication

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain the difference between JWT and session-based authentication. When to use each?

### Answer

| Feature | JWT | Session |
|---------|-----|---------|
| Storage | Client (localStorage/cookie) | Server (session store) |
| Stateless | Yes | No |
| Scalability | Better (no server state) | Harder (session store) |
| Security | Token theft risk | More secure (server-side) |
| Revocation | Difficult | Easy |

```javascript
// JWT Authentication
// Login
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

res.json({ token });

// Verify
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// Session Authentication
// Login
req.session.userId = user.id;

// Verify
if (req.session.userId) {
  // User authenticated
}
```

**When to Use:**
- **JWT**: Microservices, mobile apps, stateless APIs
- **Session**: Traditional web apps, better security needs

### Resources
- [JWT.io](https://jwt.io/)
- [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

