# Next.js API Routes

> Creating API endpoints, middleware, authentication, error handling, and API best practices.

---

## Question 1: Next.js API Routes Basics

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Vercel, Meta

### Question
How do Next.js API routes work? How to create REST API?

### Answer

**API Routes** - Serverless functions that run on Node.js, allowing you to build API endpoints within Next.js.

**Key Points:**
1. **File-based routing** - Any file in `pages/api` is an API endpoint
2. **Serverless** - Each route is a separate serverless function
3. **Full stack** - Build frontend and backend in one project
4. **TypeScript support** - Full type safety
5. **Middleware support** - Auth, logging, etc.

### Code Example

```typescript
// 1. BASIC API ROUTE
// pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ message: 'Hello from API!' });
}

// 2. HANDLING HTTP METHODS
// pages/api/users/[id].ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      const user = await getUser(id as string);
      return res.status(200).json(user);

    case 'PUT':
      const updated = await updateUser(id as string, req.body);
      return res.status(200).json(updated);

    case 'DELETE':
      await deleteUser(id as string);
      return res.status(204).end();

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

// 3. REQUEST BODY & VALIDATION
interface CreateUserBody {
  name: string;
  email: string;
  age?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, age } = req.body as CreateUserBody;

  // Validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  if (email && !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const user = await createUser({ name, email, age });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

// 4. QUERY PARAMETERS
// GET /api/posts?page=1&limit=10&sort=desc
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    page = '1',
    limit = '10',
    sort = 'asc'
  } = req.query;

  const posts = await getPosts({
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    sort: sort as string
  });

  res.status(200).json(posts);
}

// 5. COOKIES & HEADERS
import cookie from 'cookie';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Read cookies
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;

  // Read headers
  const userAgent = req.headers['user-agent'];

  // Set cookies
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', 'abc123', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    })
  );

  // Set custom headers
  res.setHeader('X-Custom-Header', 'value');

  res.status(200).json({ success: true });
}

// 6. FILE UPLOAD
import formidable from 'formidable';
import fs from 'fs';

// Disable body parser
export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ uploadDir: './uploads', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Upload failed' });
    }

    const file = files.file;
    // Process file...

    res.status(200).json({ success: true, file: file.filepath });
  });
}

// 7. ERROR HANDLING
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await fetchData();
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Generic error
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 8. DYNAMIC ROUTES
// pages/api/posts/[postId]/comments/[commentId].ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { postId, commentId } = req.query;

  const comment = await getComment(
    postId as string,
    commentId as string
  );

  res.status(200).json(comment);
}

// 9. CATCH-ALL ROUTES
// pages/api/[...slug].ts
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query;
  // slug is an array: /api/a/b/c => ['a', 'b', 'c']

  res.status(200).json({ path: slug });
}

// 10. CORS
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Your API logic
  res.status(200).json({ message: 'CORS enabled' });
}
```

### Common Mistakes

- ❌ Not checking HTTP method (security risk)
- ❌ Not validating request body
- ❌ Exposing sensitive data in responses
- ❌ Not handling errors properly
- ✅ Always validate input
- ✅ Use TypeScript for type safety
- ✅ Set appropriate status codes

### Follow-up Questions

1. How do API routes differ from traditional Express.js?
2. Can you use API routes for GraphQL?
3. How do you handle authentication in API routes?

### Resources
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## Question 2: Middleware and Authentication

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** All companies

### Question
How do you implement middleware and authentication in Next.js API routes?

### Answer

**Middleware** - Functions that run before your API route handler.
**Authentication** - Verify user identity and protect routes.

**Key Points:**
1. **Middleware pattern** - Wrap handlers with auth logic
2. **JWT tokens** - Stateless authentication
3. **Session-based** - Server-side sessions
4. **Edge middleware** - Run at edge for performance
5. **Protected routes** - Block unauthorized access

### Code Example

```typescript
// 1. AUTH MIDDLEWARE PATTERN
// lib/middleware/auth.ts
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
  };
}

export function withAuth(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = { id: decoded.id, email: decoded.email };

      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// Usage
// pages/api/protected.ts
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // req.user is available
  res.status(200).json({ message: `Hello ${req.user!.email}` });
}

export default withAuth(handler);

// 2. LOGIN ENDPOINT
// pages/api/auth/login.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Find user
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.hashedPassword);

  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.status(200).json({ token, user: { id: user.id, email: user.email } });
}

// 3. SIGNUP ENDPOINT
// pages/api/auth/signup.ts
import bcrypt from 'bcrypt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name } = req.body;

  // Validation
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // Check if user exists
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await db.user.create({
    data: { email, name, hashedPassword }
  });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.status(201).json({ token, user: { id: user.id, email: user.email } });
}

// 4. EDGE MIDDLEWARE (Next.js 12+)
// middleware.ts (root level)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*'
};

// 5. ROLE-BASED ACCESS CONTROL (RBAC)
// lib/middleware/rbac.ts
export function withRole(role: string, handler: NextApiHandler) {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const user = await db.user.findUnique({
      where: { id: req.user!.id }
    });

    if (user?.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return handler(req, res);
  });
}

// Usage
// pages/api/admin/users.ts
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const users = await db.user.findMany();
  res.status(200).json(users);
}

export default withRole('admin', handler);

// 6. REFRESH TOKEN PATTERN
// pages/api/auth/refresh.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as any;

    // Check if refresh token is still valid in DB
    const session = await db.session.findUnique({
      where: { refreshToken }
    });

    if (!session) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

// 7. SESSION-BASED AUTH
// pages/api/auth/login-session.ts
import { ironSession } from 'iron-session/express';

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'myapp_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production'
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await ironSession(req, res, sessionOptions);

  if (req.method === 'POST') {
    const { email, password } = req.body;

    const user = await validateUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store user in session
    session.user = { id: user.id, email: user.email };
    await session.save();

    res.status(200).json({ user: session.user });
  }
}

// 8. LOGOUT
// pages/api/auth/logout.ts
export default withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
  // Clear session/token
  res.setHeader(
    'Set-Cookie',
    'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly'
  );

  res.status(200).json({ message: 'Logged out' });
});
```

### Common Mistakes

- ❌ Storing passwords in plain text
- ❌ Not validating JWT properly
- ❌ Exposing JWT_SECRET in client code
- ❌ Not using HTTPS in production
- ✅ Hash passwords with bcrypt
- ✅ Use environment variables for secrets
- ✅ Implement refresh token rotation

### Follow-up Questions

1. What's the difference between JWT and session-based auth?
2. How do you handle token refresh?
3. What is Edge Middleware and when to use it?

### Resources
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [NextAuth.js](https://next-auth.js.org/)

---

## Question 3: Database Integration and ORM

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** All full-stack teams

### Question
How do you integrate databases with Next.js API routes? What are best practices?

### Answer

**Database Integration** - Connect API routes to databases using ORMs or query builders.

**Key Points:**
1. **Prisma** - Modern ORM with great TypeScript support
2. **Connection pooling** - Reuse database connections
3. **Serverless** - Handle cold starts and connection limits
4. **Migrations** - Version control for database schema
5. **Type safety** - Auto-generated types from schema

### Code Example

```typescript
// 1. PRISMA SETUP
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}

// 2. PRISMA CLIENT SINGLETON
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 3. CREATE USER
// pages/api/users.ts
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { email, name } = req.body;

    try {
      const user = await prisma.user.create({
        data: { email, name }
      });

      res.status(201).json(user);
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        res.status(409).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  }

  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      include: {
        posts: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(users);
  }
}

// 4. COMPLEX QUERIES
// pages/api/posts/search.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, published } = req.query;

  const posts = await prisma.post.findMany({
    where: {
      AND: [
        published === 'true' ? { published: true } : {},
        query
          ? {
              OR: [
                { title: { contains: query as string, mode: 'insensitive' } },
                { content: { contains: query as string, mode: 'insensitive' } }
              ]
            }
          : {}
      ]
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20
  });

  res.status(200).json(posts);
}

// 5. TRANSACTIONS
// pages/api/transfer.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { fromUserId, toUserId, amount } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Deduct from sender
      const sender = await prisma.account.update({
        where: { userId: fromUserId },
        data: { balance: { decrement: amount } }
      });

      if (sender.balance < 0) {
        throw new Error('Insufficient funds');
      }

      // Add to receiver
      const receiver = await prisma.account.update({
        where: { userId: toUserId },
        data: { balance: { increment: amount } }
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          fromUserId,
          toUserId,
          amount,
          status: 'completed'
        }
      });

      return { sender, receiver, transaction };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// 6. PAGINATION
// pages/api/posts/paginated.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.post.count()
  ]);

  res.status(200).json({
    posts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
}

// 7. RAW SQL (when needed)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const results = await prisma.$queryRaw`
    SELECT u.name, COUNT(p.id) as post_count
    FROM "User" u
    LEFT JOIN "Post" p ON p."authorId" = u.id
    GROUP BY u.id, u.name
    ORDER BY post_count DESC
    LIMIT 10
  `;

  res.status(200).json(results);
}

// 8. CONNECTION POOLING (Serverless)
// For serverless, use connection pooler like PgBouncer

// DATABASE_URL="postgresql://user:pass@localhost:5432/db"
// DATABASE_URL_POOLER="postgresql://user:pass@localhost:6543/db?pgbouncer=true"

// Use pooler URL in production
const databaseUrl = process.env.NODE_ENV === 'production'
  ? process.env.DATABASE_URL_POOLER
  : process.env.DATABASE_URL;
```

### Common Mistakes

- ❌ Creating new Prisma client on every request
- ❌ Not using connection pooling in serverless
- ❌ Exposing sensitive data in API responses
- ❌ Not handling database errors properly
- ✅ Use singleton pattern for Prisma client
- ✅ Use connection pooler for serverless
- ✅ Validate and sanitize input

### Follow-up Questions

1. How do you handle database migrations in production?
2. What's the difference between Prisma and traditional ORMs?
3. How do you optimize database queries?

### Resources
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js with Databases](https://nextjs.org/docs/basic-features/data-fetching/database)

---

**[← Back to Next.js README](./README.md)**
