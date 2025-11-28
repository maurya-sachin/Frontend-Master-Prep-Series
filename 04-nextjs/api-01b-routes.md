# Next.js API Routes (Part 2)

> Database integration, ORM patterns, connection pooling, and App Router Route Handlers.

---

## Question 1: Database Integration and ORM

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

<details>
<summary><strong>🔍 Deep Dive: Database Integration Architecture in Serverless</strong></summary>

## 🔍 Deep Dive: Database Integration Architecture in Serverless

Integrating databases with Next.js API routes introduces unique challenges due to the serverless execution model. Understanding these architectural constraints is essential for building performant, scalable applications.

**Connection Pooling in Serverless Environments:**

Traditional database connections are expensive to establish (50-100ms for PostgreSQL, 200-300ms for MongoDB). In long-running servers, you create a connection pool at startup and reuse connections across requests. However, serverless functions are ephemeral: each invocation might use a fresh container.

The problem: if every API route invocation creates a new database connection, you'll quickly exhaust your database's connection limit (typically 100-500 connections for managed databases). With 1,000 concurrent requests, you'd need 1,000 connections, far exceeding limits.

**Solution 1: Connection Poolers (PgBouncer, RDS Proxy)**

Connection poolers sit between your API routes and database, maintaining a pool of persistent connections. Your serverless functions connect to the pooler (fast), and the pooler manages actual database connections (reused). This reduces active database connections from thousands to tens.

PgBouncer uses "transaction pooling": a server connection is assigned to a client only during a transaction, then returned to the pool. This maximizes connection reuse. AWS RDS Proxy provides similar functionality with additional features like IAM authentication and automatic failover.

**Solution 2: Prisma Data Proxy**

Prisma Data Proxy is a managed connection pooler specifically designed for serverless. It maintains persistent connections to your database and provides a HTTP API for queries. Your serverless functions make HTTP requests to the Data Proxy instead of direct database connections.

Trade-off: adds ~10-20ms latency per query (HTTP round-trip) but eliminates cold start connection overhead (~100ms) and connection exhaustion. For most applications, this is a net performance win.

**Prisma Client Singleton Pattern:**

In serverless, Prisma Client initialization is expensive (~100-150ms). Without a singleton, every request creates a new client, adding significant latency. The global singleton pattern ensures only one Prisma Client instance per container lifecycle:

```typescript
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

This works because Node.js modules are cached. The first request initializes `prisma`, subsequent requests reuse the cached instance. The `globalForPrisma` hack prevents Next.js development mode from creating duplicate instances on hot reload.

**Query Optimization Strategies:**

Prisma generates SQL queries based on your schema and API calls. Understanding how to optimize these queries prevents N+1 problems and slow responses.

**N+1 Query Problem:** Fetching users, then fetching each user's posts in a loop creates N+1 queries (1 for users, N for posts). Solution: use `include` or `select` with relations to generate a single JOIN query.

**Index Optimization:** Database indices dramatically improve query performance. A query filtering by `userId` on a 1M row table takes ~5 seconds without an index, ~5ms with an index. Always add indices for foreign keys and frequently queried columns.

**Pagination vs. Full Scan:** Fetching all records from large tables loads everything into memory, overwhelming your serverless function (512MB-3GB limits). Use `skip` and `take` for pagination, or cursor-based pagination (`cursor` + `take`) for better performance on large datasets.

**Transaction Handling:**

Prisma transactions use `prisma.$transaction()` to ensure atomicity: either all operations succeed, or none do. This is critical for financial operations, inventory management, or any workflow requiring consistency.

Prisma provides two transaction APIs:

1. **Sequential Operations** (simpler):
```typescript
await prisma.$transaction([
  prisma.user.create({ data: { email: 'user@example.com' } }),
  prisma.post.create({ data: { title: 'Post', authorId: userId } })
]);
```

2. **Interactive Transactions** (more control):
```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: 'user@example.com' } });
  await tx.post.create({ data: { title: 'Post', authorId: user.id } });

  if (someCondition) {
    throw new Error('Rollback'); // Entire transaction rolls back
  }
});
```

Interactive transactions allow conditional logic within the transaction scope. If any operation fails or you throw an error, all changes are rolled back.

**Schema Migrations in Production:**

Prisma Migrate manages database schema changes through migration files. When you modify `schema.prisma`, run `prisma migrate dev` to generate a migration SQL file. In production, `prisma migrate deploy` applies pending migrations.

**Zero-downtime migrations:** For schema changes that could break existing code (removing columns, renaming tables), use a multi-step deployment:

1. **Step 1:** Add new column, deploy code that writes to both old and new columns
2. **Step 2:** Backfill data from old to new column
3. **Step 3:** Deploy code that reads from new column only
4. **Step 4:** Drop old column

This "expand-contract" pattern ensures your API remains available during migrations.

**Security Considerations:**

Always validate and sanitize user input before database queries. Prisma provides automatic SQL injection protection through parameterized queries, but you must still validate business logic constraints.

Never expose database error messages directly to users (reveals schema information). Wrap database operations in try-catch, log detailed errors server-side, return generic error messages to clients.

Use Prisma's `select` to prevent accidentally exposing sensitive fields (passwords, API keys). Instead of `findMany()` returning all fields, explicitly select needed fields:

```typescript
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true } // Excludes hashedPassword
});
```

**Performance Monitoring:**

Enable Prisma query logging in development to identify slow queries:

```typescript
new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
```

Use `prisma.$queryRaw` for complex analytics queries where Prisma's query builder is insufficient. This provides full SQL control while maintaining type safety through tagged templates.

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Database Connection Pool Exhaustion</strong></summary>

## 🐛 Real-World Scenario: Database Connection Pool Exhaustion

**Production Context:**
A real-time collaboration SaaS platform with 80,000 daily active users deployed on Vercel (serverless). During a product launch event, the platform experienced complete downtime for 35 minutes. All API routes returned 500 errors, and users were unable to access the application.

**Initial Incident Metrics:**
- Error rate: 98% (from 0.2% baseline)
- Database connection errors: 2,400/minute
- Average response time: Timeout (30s)
- Affected users: ~15,000 concurrent users
- Database CPU: 12% (plenty of headroom)
- Database connections: 500/500 (MAXED OUT)

**Root Cause Discovery:**

**Investigation Timeline:**

**T+5 minutes:** Monitoring alerts triggered:
```
[ERROR] PostgreSQL: FATAL: remaining connection slots are reserved for non-replication superuser connections
[ERROR] Prisma: P2024 - Timed out fetching a new connection from the pool
```

**T+10 minutes:** Checked database metrics:
```
Active Connections: 500/500 (100% utilization)
Idle Connections: 487 (97% of connections doing nothing!)
Active Queries: 13
Database CPU: 12%
Memory: 34% (plenty available)
```

**Problem identified:** Serverless functions were creating database connections but not closing them, accumulating idle connections that blocked new requests.

**T+15 minutes:** Analyzed Prisma Client instantiation:
```typescript
// ❌ FOUND IN 8 API ROUTES - CRITICAL BUG
// pages/api/users.ts
export default async function handler(req, res) {
  const prisma = new PrismaClient(); // NEW CLIENT EVERY REQUEST!

  const users = await prisma.user.findMany();

  // Missing: await prisma.$disconnect();
  // Connection never closed, stays open until container dies

  res.json(users);
}
```

**T+20 minutes:** Discovered no connection pooling:
```
// .env
DATABASE_URL=postgresql://user:pass@db.example.com:5432/prod
# Direct connection, no pooler!
# Each serverless function connects directly to database
```

**T+25 minutes:** Calculated connection usage:
```
100 concurrent Lambda functions × 5 API route invocations each = 500 connections
All 500 connections opened, never closed
New requests unable to acquire connections → errors
```

**Emergency Mitigation:**

**Immediate fix (T+30 minutes):** Restarted database to forcefully close all connections:
```bash
# Emergency action - terminates all connections
aws rds reboot-db-instance --db-instance-identifier prod-db
# Downtime: 3 minutes, but better than 30+ minutes of errors
```

**Result:** Error rate dropped from 98% to 15%, service partially restored.

**Permanent Solution Implementation:**

**Fix 1: Implemented Prisma Client singleton (CRITICAL)**
```typescript
// ✅ CORRECT IMPLEMENTATION
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POOLER // Using pooler URL
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// pages/api/users.ts - FIXED
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const users = await prisma.user.findMany();
  // Singleton client reused across requests in same container
  // No explicit disconnect needed
  res.json(users);
}
```

**Fix 2: Set up PgBouncer connection pooler**
```bash
# Deployed PgBouncer on dedicated server
# PgBouncer config:
[databases]
prod = host=actual-db.example.com port=5432 dbname=prod

[pgbouncer]
pool_mode = transaction  # Return connection after transaction
max_client_conn = 10000  # Allow many serverless functions
default_pool_size = 20   # But only use 20 actual DB connections
reserve_pool_size = 5    # Reserve for emergencies
```

**Updated environment variables:**
```
# .env.production
DATABASE_URL=postgresql://user:pass@actual-db.example.com:5432/prod
DATABASE_URL_POOLER=postgresql://user:pass@pgbouncer.example.com:6432/prod?pgbouncer=true

# Use pooler URL in production
```

**Fix 3: Added connection monitoring and alerts**
```typescript
// lib/monitoring.ts
import { prisma } from './prisma';

export async function checkDatabaseHealth() {
  try {
    // Test query
    await prisma.$queryRaw`SELECT 1`;

    // Get connection pool metrics
    const metrics = await prisma.$metrics.json();

    // Alert if connection pool utilization > 80%
    if (metrics.poolConnections > metrics.poolSize * 0.8) {
      console.warn('High database connection pool utilization', metrics);
      // Send alert to Slack/PagerDuty
    }

    return { healthy: true, metrics };
  } catch (error) {
    console.error('Database health check failed', error);
    return { healthy: false, error: error.message };
  }
}
```

**Fix 4: Implemented query optimization**
```typescript
// ❌ BEFORE: N+1 query problem
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { authorId: user.id } });
  // 1 query for users + N queries for posts = N+1!
}

// ✅ AFTER: Single query with join
const users = await prisma.user.findMany({
  include: {
    posts: {
      select: { id: true, title: true, createdAt: true }
    },
    _count: {
      select: { posts: true }
    }
  }
});
// Single query with LEFT JOIN - much faster
```

**Fix 5: Added database connection limits per serverless function**
```typescript
// lib/prisma.ts - Enhanced with connection limits
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POOLER
    }
  },
  // Limit connections per Prisma Client instance
  __internal: {
    engine: {
      connection_limit: 1 // Each serverless function uses max 1 connection
    }
  }
});
```

**Post-Fix Performance Metrics:**
- Error rate: 0.1% (98% → 0.1% - **99% improvement**)
- Database connections: 18/500 average, 45/500 peak (91% reduction)
- Response time p50: 42ms (from timeout)
- Response time p95: 180ms (from timeout)
- Database CPU: 8-15% (efficient utilization)
- Cost reduction: $340/month (fewer database resources needed)

**Lessons Learned:**

1. **Never create new Prisma Client per request** - Use singleton pattern
2. **Always use connection pooling** (PgBouncer, RDS Proxy, or Prisma Data Proxy) in serverless
3. **Monitor connection pool utilization** - Alert before exhaustion
4. **Optimize queries** - Avoid N+1 problems, use joins
5. **Test under load** - Connection exhaustion only appears at scale
6. **Have emergency runbooks** - Know how to quickly restart database
7. **Use connection limits** - Prevent runaway connection creation
8. **Prefer managed pooling** - PgBouncer/RDS Proxy eliminate entire class of issues

**Prevention Checklist for Serverless + Database:**
- [ ] Prisma Client singleton implemented
- [ ] Connection pooler configured (PgBouncer/RDS Proxy)
- [ ] Environment variables separated (direct URL vs pooler URL)
- [ ] Connection pool monitoring and alerts
- [ ] Load testing performed (simulate real traffic)
- [ ] Database query optimization (no N+1 queries)
- [ ] Error handling for connection failures
- [ ] Emergency procedures documented

</details>

<details>
<summary><strong>⚖️ Trade-offs: Database Integration Decisions</strong></summary>

## ⚖️ Trade-offs: Database Integration Decisions

### 1. Prisma vs. Drizzle vs. Kysely - ORM Comparison

**Scenario: E-commerce API (500 products, 10k users)**

**Prisma (Full-Featured ORM):**

**Performance:**
- Query overhead: ~10-15ms vs raw SQL
- Cold start: +120ms (client initialization)
- Bundle size: +580KB
- Memory usage: ~25MB base

**Developer Experience:**
- Type safety: Excellent (auto-generated from schema)
- Learning curve: Medium (schema language)
- Migration system: Built-in, robust
- IDE autocomplete: Excellent
- Query builder: Declarative (find, create, update)

**Pros:**
- Best-in-class TypeScript support
- Automatic migrations with rollback
- Visual database browser (Prisma Studio)
- Comprehensive relation handling
- Built-in connection pooling
- Large community and ecosystem

**Cons:**
- Larger bundle size impacts cold starts
- Some complex queries need raw SQL
- Vendor lock-in (Prisma-specific)
- Limited control over generated SQL
- Slower than raw SQL for complex analytics

**Code Example:**
```typescript
// Prisma - Declarative, type-safe
const users = await prisma.user.findMany({
  where: { email: { contains: 'gmail' } },
  include: { posts: true },
  orderBy: { createdAt: 'desc' },
  take: 10
});
// Type: User[] with posts: Post[] - fully typed!
```

**Best For:**
- Full-stack apps needing rapid development
- Teams prioritizing type safety
- Projects with complex relationships
- When you want built-in migrations

---

**Drizzle ORM (Lightweight, SQL-like):**

**Performance:**
- Query overhead: ~2-5ms vs raw SQL
- Cold start: +30ms
- Bundle size: +120KB
- Memory usage: ~8MB base

**Developer Experience:**
- Type safety: Excellent (TypeScript-first)
- Learning curve: Low (if you know SQL)
- Migration system: Manual or kit
- IDE autocomplete: Good
- Query builder: SQL-like syntax

**Pros:**
- Minimal overhead (close to raw SQL performance)
- Smaller bundle size (better for serverless)
- SQL-like syntax (familiar to SQL developers)
- Edge runtime compatible
- Fine control over SQL generation

**Cons:**
- Less mature ecosystem than Prisma
- Manual migration management (unless using Drizzle Kit)
- Fewer batteries included
- Less comprehensive documentation
- Smaller community

**Code Example:**
```typescript
// Drizzle - SQL-like, type-safe
import { users, posts } from './schema';

const result = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(posts.authorId, users.id))
  .where(like(users.email, '%gmail%'))
  .orderBy(desc(users.createdAt))
  .limit(10);
// Fully typed based on schema
```

**Best For:**
- Performance-critical applications
- Edge runtime deployments
- SQL experts who want type safety
- Serverless apps minimizing cold starts

---

**Kysely (Type-safe Query Builder):**

**Performance:**
- Query overhead: ~1-3ms vs raw SQL
- Cold start: +20ms
- Bundle size: +85KB
- Memory usage: ~5MB base

**Developer Experience:**
- Type safety: Excellent (database schema types)
- Learning curve: Low-Medium
- Migration system: Manual
- IDE autocomplete: Excellent
- Query builder: Fluent, SQL-like

**Pros:**
- Lightest weight with full type safety
- Excellent autocomplete (knows your schema)
- Very close to raw SQL performance
- Works with any database (Postgres, MySQL, SQLite)
- No schema language (use existing database)

**Cons:**
- No migration system (DIY)
- No ORM features (relations manual)
- Need to manually maintain type definitions
- Less abstraction than Prisma
- No visual tools

**Code Example:**
```typescript
// Kysely - Fluent query builder, type-safe
const users = await db
  .selectFrom('users')
  .leftJoin('posts', 'posts.author_id', 'users.id')
  .where('users.email', 'like', '%gmail%')
  .orderBy('users.created_at', 'desc')
  .limit(10)
  .execute();
// Fully typed based on database schema types
```

**Best For:**
- Existing databases (brownfield projects)
- Performance-sensitive applications
- SQL experts wanting type safety
- Teams comfortable with manual migrations

---

**Decision Matrix:**

| Requirement | Prisma | Drizzle | Kysely |
|-------------|--------|---------|--------|
| Type safety | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Performance | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Bundle size | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Migrations | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Relations | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Learning curve | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Ecosystem | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Edge runtime | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Real-World Performance Comparison:**

```typescript
// Test: Fetch 100 users with posts (1000 total posts)

// Raw SQL: 23ms
const result = await db.query(
  'SELECT u.*, p.* FROM users u LEFT JOIN posts p ON p.author_id = u.id LIMIT 100'
);

// Kysely: 25ms (+2ms overhead)
const users = await kysely.selectFrom('users')...

// Drizzle: 28ms (+5ms overhead)
const users = await drizzle.select()...

// Prisma: 38ms (+15ms overhead)
const users = await prisma.user.findMany({ include: { posts: true }, take: 100 });
```

**Recommendation:**
- **Choose Prisma if:** Rapid development, complex relations, want batteries-included
- **Choose Drizzle if:** Edge runtime, good balance of DX and performance
- **Choose Kysely if:** Maximum performance, existing database, SQL expertise
- **Choose Raw SQL if:** Analytics, complex reporting, maximum control

---

### 2. Connection Pooling: PgBouncer vs. RDS Proxy vs. Prisma Data Proxy

**PgBouncer (Open Source, Self-Hosted):**

**Setup Complexity:** Medium-High (deploy, configure, maintain)

**Performance:**
- Latency: +1-2ms (local network)
- Connection acquisition: < 1ms
- Max client connections: 10,000+
- Pool size: Configurable (typically 10-50)

**Pros:**
- Free and open source
- Full control over configuration
- Works with any PostgreSQL database
- Transaction/session pooling modes
- Battle-tested (used by giants)

**Cons:**
- Requires separate server/container
- Manual setup and maintenance
- Need monitoring and alerting
- Doesn't work with SSL client certs easily
- Single point of failure (need HA setup)

**Cost:**
- Software: $0 (open source)
- Hosting: ~$20-50/month (small EC2/Cloud Run instance)
- Total: ~$20-50/month

**Best For:**
- Cost-conscious startups
- Teams with DevOps expertise
- Any cloud provider (AWS, GCP, Azure)
- Maximum customization needs

---

**AWS RDS Proxy (Managed, AWS-Only):**

**Setup Complexity:** Low (managed service)

**Performance:**
- Latency: +2-4ms (AWS network)
- Connection acquisition: < 1ms
- Max client connections: 200,000 (adjustable)
- Pool size: Auto-scaled by RDS Proxy

**Pros:**
- Fully managed (no maintenance)
- Auto-scaling connection pools
- IAM database authentication
- Automatic failover during DB maintenance
- Integrates with AWS Secrets Manager
- Built-in monitoring (CloudWatch)

**Cons:**
- AWS-only (vendor lock-in)
- More expensive than PgBouncer
- Fixed configuration options
- Slight latency overhead vs. self-hosted
- Only works with RDS/Aurora

**Cost:**
- Proxy instance: ~$15/month base
- vCPU usage: ~$0.015/vCPU-hour
- Total: ~$30-80/month (small app)

**Best For:**
- AWS-heavy infrastructure
- Teams wanting managed solution
- Production apps needing HA
- When IAM auth is required

---

**Prisma Data Proxy (Managed, Platform-Agnostic):**

**Setup Complexity:** Very Low (one config change)

**Performance:**
- Latency: +10-20ms (HTTP overhead)
- Connection acquisition: ~5ms
- Max client connections: Unlimited (HTTP-based)
- Pool size: Managed by Prisma

**Pros:**
- Zero infrastructure setup
- Works from Edge runtime (Cloudflare Workers)
- Handles connection pooling automatically
- Platform-agnostic (any database, any cloud)
- Integrated with Prisma ecosystem
- Solves cold start issues

**Cons:**
- HTTP overhead (10-20ms added latency)
- Prisma-only (can't use with other ORMs)
- Less control vs. self-hosted
- Additional cost per connection
- Newer service (less battle-tested)

**Cost:**
- Free tier: 10,000 requests/month
- Pro: $25/month + $0.10 per 10k requests
- Total: ~$25-100/month (depends on usage)

**Best For:**
- Prisma users on serverless
- Edge runtime deployments
- Teams wanting zero DevOps
- Multi-cloud or hybrid deployments

---

**Decision Matrix:**

| Factor | PgBouncer | RDS Proxy | Prisma Data Proxy |
|--------|-----------|-----------|-------------------|
| Cost | $ | $$ | $$$ |
| Setup | Hard | Easy | Very Easy |
| Latency | +1-2ms | +2-4ms | +10-20ms |
| AWS-only | No | Yes | No |
| Managed | No | Yes | Yes |
| Edge support | No | No | Yes |
| HA built-in | No | Yes | Yes |

**Real-World Latency Comparison:**

```
Direct connection (no pooler):
- Cold start: +100ms (establish connection)
- Warm: 25ms query time
- Total: 125ms (cold), 25ms (warm)

PgBouncer:
- Cold start: +1ms
- Warm: 25ms + 1ms = 26ms
- Total: 26ms (cold and warm)

RDS Proxy:
- Cold start: +3ms
- Warm: 25ms + 3ms = 28ms
- Total: 28ms (cold and warm)

Prisma Data Proxy:
- Cold start: +12ms
- Warm: 25ms + 12ms = 37ms
- Total: 37ms (cold and warm)
```

**Recommendation:**
- **Choose PgBouncer if:** Budget-conscious, have DevOps skills, maximum performance
- **Choose RDS Proxy if:** AWS infrastructure, want managed solution, need IAM auth
- **Choose Prisma Data Proxy if:** Edge runtime, Prisma user, zero DevOps
- **Hybrid approach:** PgBouncer for main API + Prisma Data Proxy for edge functions

</details>

<details>
<summary><strong>💬 Explain to Junior: Database Integration in Next.js</strong></summary>

## 💬 Explain to Junior: Database Integration in Next.js

**Beginner-Friendly Explanation:**

Think of a database like a giant filing cabinet where you store all your app's information (users, posts, orders). Your Next.js API routes are like office workers who need to access this filing cabinet to read or update files.

**Simple Analogy:**

**Without database integration:**
Your API routes have nowhere to permanently store data. Users create accounts, but if the server restarts, everything is gone (like writing on a whiteboard that gets erased).

**With database integration:**
Your API routes connect to a database (the filing cabinet) to store and retrieve data permanently. Even if your server restarts, the data persists.

**Why Use Prisma (ORM):**

An ORM (Object-Relational Mapping) is like a translator between your JavaScript code and the database's SQL language. Instead of writing raw SQL queries, you write JavaScript, and Prisma translates it to SQL.

**Without Prisma (raw SQL):**
```javascript
// Hard to write, easy to mess up, no type checking
const result = await database.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
// What's in result? TypeScript doesn't know!
```

**With Prisma:**
```typescript
// Easy to write, type-safe, autocomplete works!
const user = await prisma.user.findUnique({
  where: { email: email }
});
// TypeScript knows exactly what fields user has!
```

**Basic Setup for Beginners:**

**Step 1: Define your database schema**
```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

Think of this as designing your filing cabinet's folder structure. Each `model` is a type of folder (users, posts, etc.).

**Step 2: Create Prisma client singleton**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Create one Prisma client for the entire app
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Why singleton? Creating Prisma client is slow (~100ms)
// Reusing it makes your API fast!
```

**Step 3: Use in API routes**
```typescript
// pages/api/users.ts
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all users from database
    const users = await prisma.user.findMany();
    return res.json(users);
  }

  if (req.method === 'POST') {
    // Create a new user
    const { email, name } = req.body;

    const user = await prisma.user.create({
      data: { email, name }
    });

    return res.status(201).json(user);
  }
}
```

**Key Concepts Simplified:**

**1. CRUD Operations (Create, Read, Update, Delete):**

```typescript
// CREATE a user
const newUser = await prisma.user.create({
  data: { email: 'john@example.com', name: 'John' }
});

// READ users
const allUsers = await prisma.user.findMany();
const oneUser = await prisma.user.findUnique({ where: { id: '123' } });

// UPDATE a user
const updated = await prisma.user.update({
  where: { id: '123' },
  data: { name: 'John Doe' }
});

// DELETE a user
await prisma.user.delete({ where: { id: '123' } });
```

**2. Relationships (like folders inside folders):**

```prisma
model User {
  id    String @id
  name  String
  posts Post[]  // User has many posts
}

model Post {
  id       String @id
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
```

**Fetch user with their posts:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: '123' },
  include: { posts: true } // Include related posts
});

// Result: { id: '123', name: 'John', posts: [{ id: '1', title: '...' }, ...] }
```

**3. The N+1 Problem (Common Beginner Mistake):**

**❌ BAD: N+1 queries (slow!)**
```typescript
const users = await prisma.user.findMany(); // 1 query

for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { authorId: user.id }
  }); // N queries (one per user)
}

// Total: 1 + N queries (if 100 users = 101 queries!) → SLOW
```

**✅ GOOD: Single query with join (fast!)**
```typescript
const users = await prisma.user.findMany({
  include: { posts: true } // Uses SQL JOIN
});

// Total: 1 query → FAST
```

**4. Connection Pooling (Why it matters for serverless):**

**Problem without pooling:**
```
Request 1 → Creates database connection → Query → Connection stays open
Request 2 → Creates another connection → Query → Connection stays open
Request 3 → Creates another connection → Query → Connection stays open
...
Request 100 → Database says: "Too many connections! ERROR!"
```

**Solution with pooling:**
```
PgBouncer maintains 10 connections to database
Request 1-100 → Share these 10 connections
Requests wait their turn, reuse connections
Database happy: Only 10 connections needed!
```

**Common Beginner Mistakes:**

**Mistake 1: Creating new Prisma Client on every request**
```typescript
// ❌ BAD: Creates client every request (slow!)
export default async function handler(req, res) {
  const prisma = new PrismaClient(); // +100ms each request!
  const users = await prisma.user.findMany();
  res.json(users);
}

// ✅ GOOD: Use singleton from lib/prisma.ts
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const users = await prisma.user.findMany(); // Fast!
  res.json(users);
}
```

**Mistake 2: Not handling database errors**
```typescript
// ❌ BAD: Errors crash your API
export default async function handler(req, res) {
  const user = await prisma.user.create({ data: req.body });
  res.json(user); // What if email already exists? Error!
}

// ✅ GOOD: Handle errors gracefully
export default async function handler(req, res) {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      // Prisma error code for unique constraint violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
}
```

**Mistake 3: Exposing sensitive data**
```typescript
// ❌ BAD: Returns password hash to client!
const user = await prisma.user.findUnique({ where: { id: '123' } });
res.json(user); // Includes hashedPassword field!

// ✅ GOOD: Select only safe fields
const user = await prisma.user.findUnique({
  where: { id: '123' },
  select: { id: true, email: true, name: true } // Excludes hashedPassword
});
res.json(user);
```

**Interview Answer Template:**

"Database integration in Next.js API routes typically uses an ORM like Prisma for type-safe database access. We define our schema in a Prisma schema file, generate a type-safe client, and use it in API routes.

The most important pattern is the Prisma Client singleton - creating a single instance that's reused across requests to avoid slow initialization on every request. This is especially critical in serverless environments.

For serverless deployments, we use connection pooling (PgBouncer or RDS Proxy) to prevent connection exhaustion. Serverless functions are ephemeral, so without pooling, each function creates its own database connection, quickly hitting connection limits.

Common patterns include: CRUD operations with findMany/create/update/delete, using `include` for relations to avoid N+1 queries, error handling for unique constraints and validation errors, and selecting only needed fields to avoid exposing sensitive data.

For complex queries beyond Prisma's capabilities, we can use `$queryRaw` for raw SQL while maintaining type safety through tagged templates."

**When to Use What:**
- **Prisma**: Most apps, rapid development, type safety priority
- **Raw SQL**: Complex analytics, reporting, performance-critical queries
- **PgBouncer**: Serverless apps, prevent connection exhaustion
- **Transactions**: Financial operations, multi-step workflows requiring atomicity

</details>

---

## Question 2: App Router Route Handlers

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Vercel, Modern Next.js teams

### Question
What are Route Handlers in Next.js App Router? How do they differ from Pages Router API routes?

### Answer

**Route Handlers** are Next.js App Router's way to create API endpoints using Web Request/Response APIs instead of Node.js-specific APIs.

**Key Points:**
1. **File convention**: `route.ts` in `app` directory
2. **Web APIs**: Uses standard Request/Response objects
3. **HTTP methods**: Named exports (GET, POST, PUT, DELETE, etc.)
4. **Streaming support**: Built-in support for streaming responses
5. **Colocation**: Can coexist with pages and components

### Code Example

```typescript
// 1. BASIC ROUTE HANDLER
// app/api/hello/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello from App Router!' });
}

// 2. MULTIPLE HTTP METHODS
// app/api/users/route.ts
export async function GET(request: NextRequest) {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await prisma.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}

// 3. DYNAMIC ROUTES
// app/api/users/[id]/route.ts
interface RouteContext {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const user = await prisma.user.findUnique({
    where: { id: params.id }
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  await prisma.user.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

// 4. QUERY PARAMETERS
// app/api/posts/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const posts = await prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit
  });

  return NextResponse.json(posts);
}

// 5. REQUEST BODY
// app/api/login/route.ts
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const user = await validateUser(email, password);

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ user });

  // Set cookies
  response.cookies.set('token', createToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  return response;
}

// 6. HEADERS
// app/api/data/route.ts
export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  const userAgent = request.headers.get('user-agent');

  const data = await fetchData();

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'X-Custom-Header': 'value'
    }
  });
}

// 7. STREAMING RESPONSES
// app/api/stream/route.ts
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        controller.enqueue(encoder.encode(`Message ${i}\n`));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked'
    }
  });
}

// 8. ERROR HANDLING
// app/api/protected/route.ts
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    const data = await fetchProtectedData(user.id);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Route handler error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 9. CORS
// app/api/public/route.ts
export async function GET(request: NextRequest) {
  const data = await fetchPublicData();

  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// 10. FILE UPLOADS
// app/api/upload/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save file or upload to cloud storage
  const url = await saveFile(buffer, file.name);

  return NextResponse.json({ url });
}

// 11. ROUTE SEGMENT CONFIG
// app/api/config-example/route.ts
export const dynamic = 'force-dynamic'; // Disable caching
export const runtime = 'edge'; // Use edge runtime

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Running on Edge!' });
}
```

### Pages Router vs App Router Comparison

```typescript
// PAGES ROUTER (Old)
// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const users = await getUsers();
    return res.status(200).json(users);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// APP ROUTER (New)
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = await getUsers();
  return NextResponse.json(users);
}
// No need to check req.method - GET function only handles GET
```

### Common Mistakes

- ❌ Using `default export` (use named exports: GET, POST, etc.)
- ❌ Trying to use `req.query` or `res.status()` (use Web APIs instead)
- ❌ Forgetting to await `request.json()` or `request.formData()`
- ❌ Not handling OPTIONS for CORS preflight
- ✅ Use named exports for HTTP methods
- ✅ Use standard Web Request/Response APIs
- ✅ Leverage streaming for large responses
- ✅ Use segment config for runtime/caching options

### Follow-up Questions

1. How do you stream responses in Route Handlers?
2. What's the difference between `dynamic = 'force-dynamic'` and `revalidate = 0`?
3. Can Route Handlers run on Edge runtime?

### Resources
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Web Request API](https://developer.mozilla.org/en-US/docs/Web/API/Request)

---

**[← Back to Next.js README](./README.md)**
