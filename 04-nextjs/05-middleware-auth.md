# Next.js Middleware and Authentication

> Middleware, authentication patterns, protected routes, JWT, and session management.

---

## Question 1: Next.js Middleware

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Vercel

### Question
What is Next.js middleware? How to implement authentication?

### Answer

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
```

### Resources
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)

---

