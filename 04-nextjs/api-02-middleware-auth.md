# Next.js Middleware and Authentication

> Middleware, authentication patterns, protected routes, JWT, and session management.

---

## Question 1: How Does Next.js Middleware Work and When Should You Use It?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Vercel, Stripe, Airbnb, Shopify

### Question
Explain Next.js middleware architecture, execution flow, and common use cases. How does it differ from API route middleware?

### Answer

**Next.js Middleware** - Code that runs before a request is completed, allowing you to modify responses, redirect, rewrite, set headers, or block requests based on conditions.

**Key Points:**

1. **Runs on Edge Runtime** - Executes on CDN edge nodes (not Node.js), with fast cold starts and global distribution
2. **Executes Before Everything** - Runs before pages, API routes, static files, and even before the request reaches your application
3. **Limited to Edge-Compatible APIs** - Cannot use Node.js APIs (no fs, no native crypto), uses Web APIs instead
4. **Path Matching with Matchers** - Use config.matcher to specify which routes trigger middleware
5. **Response Manipulation** - Can redirect, rewrite, set headers/cookies, or modify request/response objects

### Code Example

```typescript
// ==========================================
// 1. BASIC MIDDLEWARE STRUCTURE
// ==========================================

// middleware.ts (at root of project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Access request details
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  // Get cookies
  const token = request.cookies.get('auth-token');

  // Log request
  console.log(`[Middleware] ${request.method} ${pathname}`);

  // Continue to next step
  return NextResponse.next();
}

// Specify which routes trigger middleware
export const config = {
  matcher: [
    // Match all routes except static files and _next
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

// ==========================================
// 2. AUTHENTICATION MIDDLEWARE
// ==========================================

// ❌ BAD: Blocking all requests without token
export function badMiddleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token) {
    // This blocks EVERYTHING including login page!
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// ✅ GOOD: Selective protection with public routes
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token');

  // Define public routes that don't need auth
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Define protected routes that require auth
  const protectedRoutes = ['/dashboard', '/profile', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Remember where user was going
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing login page with valid token
  if (isPublicRoute && token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// ==========================================
// 3. JWT VERIFICATION IN MIDDLEWARE
// ==========================================

import { jwtVerify } from 'jose'; // Edge-compatible JWT library

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (pathname.startsWith('/api/auth') || pathname === '/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify JWT token
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // Add user info to request headers (accessible in pages/API routes)
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId as string);
      requestHeaders.set('x-user-role', payload.role as string);

      // Continue with modified headers
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Invalid token - clear cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  return NextResponse.next();
}

// ==========================================
// 4. ROLE-BASED ACCESS CONTROL (RBAC)
// ==========================================

interface UserPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Admin routes require admin role
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret) as { payload: UserPayload };

      // Check if user has admin role
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Add user context to headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// ==========================================
// 5. RATE LIMITING WITH MIDDLEWARE
// ==========================================

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis client and rate limiter
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return response;
  }

  return NextResponse.next();
}

// ==========================================
// 6. GEOLOCATION AND A/B TESTING
// ==========================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get user's country from Vercel's geo headers
  const country = request.geo?.country || 'US';
  const city = request.geo?.city;

  // Regional redirects
  if (pathname === '/' && country === 'FR') {
    return NextResponse.rewrite(new URL('/fr', request.url));
  }

  // A/B testing based on cookie
  const variant = request.cookies.get('ab-test-variant')?.value;

  if (pathname === '/pricing' && !variant) {
    // Randomly assign variant
    const newVariant = Math.random() > 0.5 ? 'A' : 'B';
    const response = NextResponse.rewrite(
      new URL(`/pricing-${newVariant.toLowerCase()}`, request.url)
    );
    response.cookies.set('ab-test-variant', newVariant, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  // Add geo headers for pages to use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-country', country);
  if (city) requestHeaders.set('x-user-city', city);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

// ==========================================
// 7. MAINTENANCE MODE
// ==========================================

export function middleware(request: NextRequest) {
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  const { pathname } = request.nextUrl;

  // Allow access to maintenance page and admin routes during maintenance
  const allowedRoutes = ['/maintenance', '/admin'];
  const isAllowed = allowedRoutes.some(route => pathname.startsWith(route));

  if (isMaintenanceMode && !isAllowed) {
    return NextResponse.rewrite(new URL('/maintenance', request.url));
  }

  return NextResponse.next();
}

// ==========================================
// 8. MATCHER CONFIGURATION PATTERNS
// ==========================================

// Match specific paths
export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};

// Match all except static files (recommended)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

// Multiple matchers with different logic
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/((?!_next|api|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
```

### Common Mistakes

- ❌ **Not checking public routes** - Blocking login page itself with auth middleware
- ❌ **Using Node.js APIs** - Middleware runs on Edge, cannot use `fs`, `crypto`, etc.
- ❌ **Blocking static assets** - Incorrectly matching `_next/static` or images
- ❌ **Not handling errors** - JWT verification fails without try-catch, crashing middleware
- ✅ **Define public routes whitelist** - Clearly separate public vs protected routes
- ✅ **Use Edge-compatible libraries** - `jose` for JWT, `@upstash/redis` for rate limiting
- ✅ **Set appropriate matchers** - Exclude static files and internal Next.js routes
- ✅ **Pass user context via headers** - Add `x-user-id` to headers for downstream use

### Follow-up Questions

1. **How does middleware differ from API route middleware?** Middleware runs before all requests (including static files), while API route middleware only runs for specific API endpoints. Middleware uses Edge Runtime, API routes use Node.js runtime.

2. **Can you access database in middleware?** Only if using Edge-compatible database clients (Upstash Redis, PlanetScale, Supabase). Traditional ORMs like Prisma don't work on Edge Runtime.

3. **How to test middleware locally?** Run `next dev` and add console logs. For Edge Runtime behavior, deploy to Vercel preview deployments or use `next start` after building.

### Resources
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
- [jose JWT Library](https://github.com/panva/jose)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)

---

## Question 2: What Are the Best Patterns for Implementing Authentication in Next.js?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 12 minutes
**Companies:** Meta, Google, Netflix, Stripe, Airbnb

### Question
Compare different authentication strategies in Next.js (JWT, sessions, NextAuth.js). How do you implement secure authentication with refresh tokens, CSRF protection, and proper cookie handling?

### Answer

**Next.js Authentication** - Implementing secure user authentication with various strategies, token management, and protection against common security vulnerabilities.

**Key Points:**

1. **JWT vs Session-Based Auth** - JWTs are stateless and good for APIs/microservices, sessions are stateful and better for traditional web apps
2. **Refresh Token Pattern** - Use short-lived access tokens (15 min) with long-lived refresh tokens (7 days) to balance security and UX
3. **Secure Cookie Flags** - Always use `httpOnly`, `secure`, `sameSite` flags to prevent XSS and CSRF attacks
4. **NextAuth.js Benefits** - Handles OAuth providers, session management, JWT, and database adapters out of the box
5. **Server-Side Token Verification** - Never trust client-side tokens; always verify on server before granting access

### Code Example

```typescript
// ==========================================
// 1. JWT AUTHENTICATION - COMPLETE FLOW
// ==========================================

// lib/auth.ts - JWT utilities
import { SignJWT, jwtVerify } from 'jose';

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);

export async function generateAccessToken(userId: string, email: string, role: string) {
  return await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // Short-lived
    .sign(ACCESS_TOKEN_SECRET);
}

export async function generateRefreshToken(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Long-lived
    .sign(REFRESH_TOKEN_SECRET);
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_TOKEN_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

// ==========================================
// 2. LOGIN API ROUTE WITH SECURE COOKIES
// ==========================================

// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = await generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    // Store refresh token in database (for revocation)
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Set cookies with security flags
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // ✅ GOOD: Secure cookie configuration
    response.cookies.set('access-token', accessToken, {
      httpOnly: true,      // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',  // CSRF protection
      maxAge: 15 * 60,     // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/api/auth/refresh', // Only sent to refresh endpoint
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ==========================================
// 3. REFRESH TOKEN ENDPOINT
// ==========================================

// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh-token')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'No refresh token' },
      { status: 401 }
    );
  }

  // Verify refresh token
  const payload = await verifyRefreshToken(refreshToken);

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 401 }
    );
  }

  // Check if refresh token exists in database (not revoked)
  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: refreshToken,
      userId: payload.userId as string,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!storedToken) {
    return NextResponse.json(
      { error: 'Refresh token revoked or expired' },
      { status: 401 }
    );
  }

  // Generate new access token
  const user = storedToken.user;
  const newAccessToken = await generateAccessToken(user.id, user.email, user.role);

  // Return new access token
  const response = NextResponse.json({ success: true });

  response.cookies.set('access-token', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60,
    path: '/',
  });

  return response;
}

// ==========================================
// 4. PROTECTED API ROUTE
// ==========================================

// app/api/protected/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Get access token from cookie
  const accessToken = request.cookies.get('access-token')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Verify token
  const payload = await verifyAccessToken(accessToken);

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user });
}

// ==========================================
// 5. NEXTAUTH.JS SETUP (EASIER ALTERNATIVE)
// ==========================================

// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Email/Password login
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isValidPassword = await compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),

    // OAuth providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt', // Use JWT instead of database sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    // Add custom fields to JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },

    // Add custom fields to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/error',
  },
});

export { handler as GET, handler as POST };

// ==========================================
// 6. CLIENT-SIDE AUTH WITH NEXTAUTH
// ==========================================

// app/dashboard/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true, // Redirect to login if not authenticated
    onUnauthenticated() {
      redirect('/login');
    },
  });

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {session!.user.name}!</h1>
      <p>Email: {session!.user.email}</p>
      <p>Role: {session!.user.role}</p>

      <button onClick={() => signOut()}>
        Sign Out
      </button>
    </div>
  );
}

// ==========================================
// 7. SERVER-SIDE AUTH CHECK
// ==========================================

// app/admin/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getServerSession();

  // Check if user is authenticated
  if (!session) {
    redirect('/login');
  }

  // Check if user has admin role
  if (session.user.role !== 'admin') {
    redirect('/unauthorized');
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Only admins can see this page</p>
    </div>
  );
}

// ==========================================
// 8. CSRF PROTECTION WITH TOKENS
// ==========================================

// lib/csrf.ts
import { randomBytes } from 'crypto';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function verifyCsrfToken(token: string, storedToken: string): boolean {
  return token === storedToken;
}

// app/api/protected/action/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfToken } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  const csrfToken = request.headers.get('x-csrf-token');
  const storedToken = request.cookies.get('csrf-token')?.value;

  if (!csrfToken || !storedToken || !verifyCsrfToken(csrfToken, storedToken)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  // Process request
  return NextResponse.json({ success: true });
}
```

### Common Mistakes

- ❌ **Storing tokens in localStorage** - Vulnerable to XSS attacks, use httpOnly cookies instead
- ❌ **Not implementing refresh tokens** - Forces users to re-login frequently
- ❌ **Missing secure cookie flags** - Exposes tokens to XSS and CSRF attacks
- ❌ **Not revoking refresh tokens** - Cannot invalidate sessions on logout or security breach
- ✅ **Use httpOnly cookies for tokens** - Protected from XSS attacks
- ✅ **Implement token rotation** - Generate new refresh token on each refresh
- ✅ **Store refresh tokens in database** - Enables revocation and session management
- ✅ **Add CSRF protection for state-changing operations** - Prevents cross-site request forgery

### Follow-up Questions

1. **When should you use JWT vs session-based auth?** Use JWT for stateless APIs, microservices, or mobile apps. Use sessions for traditional web apps where you need better control over session revocation.

2. **How do you handle token expiration on the client?** Implement automatic token refresh with an interceptor that catches 401 responses and calls the refresh endpoint. If refresh fails, redirect to login.

3. **What's the difference between authentication and authorization?** Authentication verifies who you are (login), authorization verifies what you can access (permissions). Use JWT claims or database roles for authorization.

### Resources
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [OAuth 2.0 and OpenID Connect](https://oauth.net/2/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## Question 3: How Do You Implement Protected Routes in Next.js App Router?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Vercel, Airbnb, Shopify, Stripe

### Question
Explain different approaches to protecting routes in Next.js App Router. How do you handle authentication in Server Components, Client Components, and middleware?

### Answer

**Protected Routes** - Restricting access to certain pages or sections based on authentication status and user permissions using various Next.js patterns.

**Key Points:**

1. **Three Protection Layers** - Middleware (edge), Server Components (server), Client Components (client)
2. **Middleware for Early Blocking** - Redirect unauthenticated users before page even loads
3. **Server Components for Data** - Check auth status when fetching data on server
4. **Client Components for UI** - Show loading states and handle conditional rendering
5. **Layout-Based Protection** - Protect entire sections of app by checking auth in layout files

### Code Example

```typescript
// ==========================================
// 1. MIDDLEWARE-BASED PROTECTION (FASTEST)
// ==========================================

// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Protected route patterns
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin',
  ];

  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without token
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Prevent authenticated users from accessing auth pages
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

// ==========================================
// 2. SERVER COMPONENT PROTECTION
// ==========================================

// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/auth';

export default async function DashboardPage() {
  // Get token from cookies
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  // Redirect if no token
  if (!token) {
    redirect('/login?callbackUrl=/dashboard');
  }

  // Verify token
  const payload = await verifyAccessToken(token);

  if (!payload) {
    // Invalid token - redirect to login
    redirect('/login?error=invalid-token');
  }

  // Fetch user-specific data
  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
  });

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}!</p>
    </div>
  );
}

// ==========================================
// 3. REUSABLE AUTH CHECK FUNCTION
// ==========================================

// lib/getUser.ts
import { cookies } from 'next/headers';
import { verifyAccessToken } from './auth';
import { prisma } from './prisma';

export async function getUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyAccessToken(token);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return user;
}

// Usage in any Server Component
export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return <div>Profile for {user.name}</div>;
}

// ==========================================
// 4. LAYOUT-BASED PROTECTION
// ==========================================

// app/dashboard/layout.tsx
import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // Protect entire dashboard section
  if (!user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <div>
      <nav>
        <p>Logged in as: {user.email}</p>
        <a href="/dashboard">Dashboard</a>
        <a href="/dashboard/settings">Settings</a>
      </nav>

      <main>{children}</main>
    </div>
  );
}

// Now all pages under /dashboard/* are automatically protected
// app/dashboard/page.tsx
export default function DashboardPage() {
  // No need to check auth here - layout already did it
  return <div>Dashboard content</div>;
}

// ==========================================
// 5. CLIENT COMPONENT WITH AUTH CONTEXT
// ==========================================

// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch current user on mount
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// ==========================================
// 6. PROTECTED CLIENT COMPONENT
// ==========================================

// components/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

// Usage
export default function ClientDashboard() {
  return (
    <ProtectedRoute>
      <div>Protected dashboard content</div>
    </ProtectedRoute>
  );
}

// ==========================================
// 7. ROLE-BASED COMPONENT PROTECTION
// ==========================================

// components/RoleGuard.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || <div>You don't have permission to view this.</div>;
  }

  return <>{children}</>;
}

// Usage
export default function AdminSettings() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div>Admin-only settings</div>
    </RoleGuard>
  );
}

// ==========================================
// 8. MIXED APPROACH (BEST PRACTICE)
// ==========================================

// ✅ RECOMMENDED: Combine all three layers

// 1. Middleware - Fast redirect for obvious cases
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// 2. Layout - Protect section and verify token
// app/dashboard/layout.tsx
export default async function DashboardLayout({ children }) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <AuthProvider initialUser={user}>
      <Sidebar user={user} />
      <main>{children}</main>
    </AuthProvider>
  );
}

// 3. Page - Fetch user-specific data
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const user = await getUser(); // Already verified in layout, but still check
  const stats = await getUserStats(user!.id);

  return <div>Dashboard with stats: {stats}</div>;
}

// 4. Client Component - Interactive UI
// components/UserMenu.tsx
'use client';

export function UserMenu() {
  const { user, logout } = useAuth();

  return (
    <div>
      <p>{user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Common Mistakes

- ❌ **Only protecting on client side** - User can bypass by disabling JavaScript or modifying code
- ❌ **Not checking auth in API routes** - Client can directly call API endpoints
- ❌ **Showing flash of unauthenticated content** - Check auth in middleware or layout, not in page
- ❌ **Not handling loading states** - Shows blank screen while checking authentication
- ✅ **Protect at multiple layers** - Middleware + Server Component + Client Component
- ✅ **Use layouts for section-wide protection** - All child pages automatically protected
- ✅ **Verify tokens on server** - Never trust client-side authentication state
- ✅ **Handle auth state in context** - Avoid prop drilling and make auth accessible anywhere

### Follow-up Questions

1. **What's the difference between redirecting in middleware vs Server Component?** Middleware runs on Edge (faster, globally distributed), Server Component runs on your server (can access database). Use middleware for simple token checks, Server Components for role-based or data-dependent protection.

2. **How do you handle authentication in API routes?** Same as Server Components - get token from cookies, verify it, return 401 if invalid. Always verify on server, never trust client headers.

3. **Should you use client-side or server-side protection?** Both. Middleware/Server Components for security (user can't bypass), Client Components for UX (loading states, conditional UI). Security on server, UX on client.

### Resources
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Next.js Middleware Patterns](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)

---