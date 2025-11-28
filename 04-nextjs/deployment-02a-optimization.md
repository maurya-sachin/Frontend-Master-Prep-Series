# Next.js Optimization

> Performance optimization: deployment, monitoring, and production best practices

---

## Question 1: How Do You Deploy Next.js Applications to Vercel and Other Platforms?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Vercel, Meta, Amazon, Microsoft

### Question
Explain the deployment process for Next.js applications on Vercel and alternative platforms. How do you manage environment variables, configure build settings, and handle different environments (staging, production)?

### Answer

**Next.js Deployment** - Deploying Next.js applications to various platforms with proper configuration for environment variables, build optimization, and environment management.

**Key Points:**

1. **Vercel Advantages** - Zero-config deployment, automatic preview deployments, edge network, built-in analytics
2. **Environment Variables** - Separate variables for build-time (NEXT_PUBLIC_) vs runtime, secure secrets management
3. **Build Configuration** - Output modes (standalone, static export), custom build commands, caching strategies
4. **Alternative Platforms** - Docker containers, AWS Amplify, Netlify, self-hosted with PM2/Docker
5. **CI/CD Integration** - Automated testing, deployment pipelines, rollback strategies

---

<details>
<summary><strong>🔍 Deep Dive: Deployment Architecture & Platform Internals</strong></summary>

**Vercel's Edge Network Architecture:**
Vercel uses a globally distributed edge network built on top of AWS, Cloudflare, and custom infrastructure. When you deploy to Vercel, your Next.js application gets compiled into three distinct outputs: API lambdas for serverless routes, static assets for images/CSS/JS, and HTML pages for SSR. The build process uses intelligent bundling—your application is analyzed for dependencies, and common chunks are extracted to maximize cache hits across deployments.

The key architectural difference: Vercel automatically parallelizes your build into multiple lambdas (one per API route + one for rendering). Each lambda is isolated, meaning if one API route has a memory leak, it doesn't affect others. The platform handles scaling transparently—if your `/api/users` endpoint suddenly gets 10,000 requests, Vercel spins up additional lambda instances automatically.

**Environment Variable Resolution at Build vs Runtime:**
This is where many deployments fail. `NEXT_PUBLIC_` variables are embedded into your JavaScript bundle at build time—they become literal strings in your compiled code. This means: (1) They're visible to anyone inspecting network traffic, (2) They must be set BEFORE the build runs, (3) Changing them requires a new build and deployment.

Regular environment variables are only available to Node.js processes on the server. They're loaded into `process.env` after the lambda starts. This means: (1) They can be changed without rebuilding, (2) They're never exposed to the client, (3) Server Components and API routes can access them.

**Docker Deployment Internals:**
When you use Docker with standalone output mode (`output: 'standalone'`), Next.js generates a minified `.next/standalone` directory containing only necessary dependencies. This is crucial for Docker efficiency—instead of bundling all 500MB of node_modules, Docker only copies ~150MB of production-only packages. The multi-stage Dockerfile (base → deps → builder → runner) allows Docker to cache each layer independently, reducing rebuild times from 5 minutes to 30 seconds when only your code changes.

The runner stage uses a non-root user (uid:1001) for security, adds comprehensive signal handlers for graceful shutdown, and configures memory limits. Most production failures occur because applications don't handle SIGTERM properly—your Node.js process needs 30 seconds to close connections, but the orchestrator only waits 10 seconds before force-killing.

**Self-Hosting with PM2:**
PM2 cluster mode uses Node's built-in cluster module. With `instances: 'max'`, PM2 spawns one process per CPU core. When a request arrives, the OS kernel's load balancer (not PM2) routes it to the least-loaded process. This is more efficient than thread pools because each process is independent—if one has a memory leak, others continue operating. However, you lose horizontal scaling (can't add more servers without manual config) and must implement your own health checks.

**CI/CD Integration Patterns:**
Most deployment failures happen in CI/CD. The issue: your test environment and CI environment are different. A common mistake is setting environment variables in GitHub Actions but forgetting that `NEXT_PUBLIC_` variables need to be embedded DURING build, not at runtime. Solution: use separate build secrets (for build-time public variables) and deployment secrets (for runtime variables).

**Caching Strategies Across Platforms:**
Vercel aggressively caches `.next/static` files with 1-year cache headers (immutable content). However, your HTML files use 0-second cache to ensure users get fresh content. AWS Amplify uses different defaults (30-second cache on HTML), which can cause stale pages. Self-hosted solutions need manual cache configuration in nginx/Apache.

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Multi-Environment E-Commerce Deployment</strong></summary>

**Context:** You're deploying an e-commerce platform to staging and production. Staging must use a test payment processor (Stripe test mode) and test database. Production uses live payment processing.

**Metrics Before Optimization:**
- Staging deployments: 12 minutes (waiting for builds, environment variables mismatch)
- Production incidents: 2-3 per month due to environment variable misconfiguration
- Rollback time: 8 minutes (manual process)
- Environment variable errors: Account for 40% of production incidents

**The Problem You Hit:**
1. Developer sets `NEXT_PUBLIC_STRIPE_KEY=pk_live_xxx` in staging by mistake
2. Staging builds with production Stripe key embedded
3. Users in staging accidentally charge their real credit cards
4. By the time you notice (30 minutes later), 15 charges have been made

**Root Cause Analysis:**
- No automated checks for environment variable safety
- `NEXT_PUBLIC_` vs regular variables confusion
- No pre-deployment validation
- Different staging/production configurations weren't validated

**Solution Implementation:**

1. **Create environment variable schema validation:**
```typescript
// lib/env.ts - Validates env vars at build time AND runtime
import { z } from 'zod';

const envSchema = z.object({
  // These must match between environments
  NODE_ENV: z.enum(['development', 'production', 'staging']),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(['development', 'production', 'staging']),

  // Payment processor - never embed live keys in staging
  NEXT_PUBLIC_STRIPE_KEY: z.string().refine(
    (key) => {
      if (process.env.NODE_ENV === 'staging' && key.startsWith('pk_live')) {
        throw new Error('❌ Live Stripe key detected in staging build!');
      }
      return true;
    },
    'Cannot use live Stripe key in staging'
  ),

  // Database URL - staging/production must be different
  DATABASE_URL: z.string().url().refine(
    (url) => {
      if (process.env.NODE_ENV === 'production' && url.includes('staging')) {
        throw new Error('❌ Staging database URL detected in production!');
      }
      return true;
    },
    'Database URL mismatch detected'
  ),
});

export const env = envSchema.parse(process.env);
```

2. **Configure separate environment files with validation:**
```
.env.staging:
  NODE_ENV=staging
  NEXT_PUBLIC_ENVIRONMENT=staging
  NEXT_PUBLIC_STRIPE_KEY=pk_test_xxxxx (test key)
  DATABASE_URL=postgresql://staging-db:5432/ecommerce

.env.production:
  NODE_ENV=production
  NEXT_PUBLIC_ENVIRONMENT=production
  NEXT_PUBLIC_STRIPE_KEY=pk_live_xxxxx (live key)
  DATABASE_URL=postgresql://prod-db:5432/ecommerce
```

3. **Pre-deployment validation in CI/CD:**
```yaml
# .github/workflows/deploy.yml
- name: Validate Environment Variables
  run: |
    npm run validate:env  # Custom script checking for live keys in staging

- name: Build with environment validation
  env:
    NODE_ENV: ${{ matrix.environment }}
    NEXT_PUBLIC_STRIPE_KEY: ${{ secrets[matrix.stripe_key] }}
  run: npm run build  # Build fails if env validation fails
```

**Metrics After Implementation:**
- Staging deployments: 3 minutes (cached builds, validated env vars)
- Production incidents: 0 related to environment variables (12-month track record)
- Rollback time: 1 minute (automated rollback in CI/CD)
- Build failures caught immediately: 100% of environment variable errors

**Key Lesson:** The most dangerous deployments are the ones that appear to work but use wrong configuration. Validate early, fail hard at build time rather than runtime.

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Deployment Platform Comparison</strong></summary>

**Vercel vs Docker Self-Hosting:**

| Factor | Vercel | Docker Self-Hosted |
|--------|--------|-------------------|
| **Setup Time** | 2 minutes (git push) | 2 hours (infrastructure setup) |
| **Scaling** | Automatic (transparent) | Manual (need orchestrator like K8s) |
| **Cost** | $20/month hobby → $150+/month team | $50-500/month servers (fixed) |
| **Cold Starts** | ~200ms (optimized) | ~500ms-2s (depends on orchestrator) |
| **Observability** | Built-in analytics, logs included | Must set up own logging (ELK, datadog) |
| **Deployment Speed** | 30 seconds | 5-10 minutes |
| **Vendor Lock-in** | High (Next.js specific optimizations) | Low (standard Docker) |
| **Environment Variables** | UI-based management | Must script/configure manually |

**When to choose Vercel:**
- Startup/MVP (time to market critical)
- Small team (no DevOps resources)
- Next.js specific features matter (ISR, Edge Functions)
- Global distribution important (built-in CDN)

**When to choose Docker:**
- Already using Kubernetes
- Significant cost at scale (>50M requests/month)
- Need total control over infrastructure
- Multi-language deployment (not just Node.js)
- Data residency requirements (specific countries)

**Vercel vs AWS Amplify:**

Amplify is cheaper for compute but requires more configuration. Vercel includes built-in edge functions and better Next.js integration. Both use similar underlying infrastructure (AWS Lambda). The real difference: Vercel's build system is optimized for Next.js (understands ISR, parallel routes), while Amplify is generic (treats Next.js like any Node.js app).

**Docker Multi-stage Build Trade-off:**
```
Single-stage: 1.2GB (includes all dependencies + build tools)
→ Fast to build locally (everything present)
→ Slow to deploy (large image, long upload)

Multi-stage: 350MB (production only)
→ Slow to build locally (downloads dependencies twice)
→ Fast to deploy (small image, quick upload)

Decision: Use multi-stage for production (saves 70% bandwidth), single-stage locally.
```

**Environment Variable Management Trade-off:**

Storing in version control:
- Pro: Can track changes, see history
- Con: Sensitive data exposure risk

Storing in platform UI:
- Pro: Secure, no accidental commits
- Con: Can't track changes, harder to debug

Solution: Store ALL non-secret values in .env files (committed), secrets in platform (not committed). Use git hooks to prevent committing secrets.

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Deployment Concepts & Interview Answers</strong></summary>

**1. What is Vercel and why is it popular for Next.js?**

**Analogy:** If Next.js is a specialized racing bike, Vercel is the pit crew that knows exactly how to maintain it. Most hosting platforms are "generic tire shops"—they can handle any vehicle but won't optimize for your specific bike.

**Interview Answer Template:**
"Vercel is the company that created Next.js, so they've optimized their platform specifically for it. When you deploy to Vercel, it automatically understands your Next.js project structure—it knows which routes are API routes, which can be static, which need server-side rendering. It automatically parallelizes your build across multiple lambda functions and includes a global CDN for free. Most importantly, preview deployments are automatic—every pull request gets its own live URL for testing. The main advantage over other platforms is the zero-configuration approach—git push, and it just works."

**2. What's the difference between NEXT_PUBLIC_ and regular environment variables?**

**Analogy:** Think of your house. `NEXT_PUBLIC_` variables are like your address (publicly visible, printed on envelopes). Regular environment variables are like your WiFi password (secret, only for people in your house). If you accidentally print your WiFi password on envelopes, everyone will know it.

**Interview Answer Template:**
"NEXT_PUBLIC_ variables are embedded into the client-side JavaScript bundle at build time—they become literal values in the code that the browser downloads. This means they must be set before the build runs, and anyone can inspect them in browser DevTools. Regular environment variables are only available to server-side code (API routes, Server Components, getServerSideProps). They're never sent to the browser. So if I have a database URL, I'd never prefix it with NEXT_PUBLIC_—that would expose my database location to attackers. The naming convention makes this explicit: NEXT_PUBLIC_ = safe to embed in client code, no prefix = secret, server-only."

**3. How do you handle different configurations for staging vs production?**

**Analogy:** It's like having a practice concert and a real concert. The practice version has all the same songs but maybe fewer lights and smaller audience. The real concert uses professional equipment and charges money. You need completely different setups, but the same basic structure.

**Interview Answer Template:**
"I'd create separate `.env.staging` and `.env.production` files with environment-specific values. For example, staging uses Stripe test mode (test keys), production uses live payment processing. In my deployment setup, I'd use conditional environment selection—if building for production, load `.env.production`, if for staging, load `.env.staging`. I'd also add validation at build time: if a production build somehow gets a staging database URL, the build should fail immediately rather than deploy broken code. This catches configuration mistakes before they hit users. Most companies use their deployment platform's secrets management (Vercel's UI, AWS Secrets Manager) rather than committing to git."

**4. What's a Docker deployment and when would you use it instead of Vercel?**

**Analogy:** Vercel is like renting an apartment (Vercel handles everything). Docker is like buying a house (you have total control but also total responsibility). You'd buy a house if you want to renovate exactly how you want, or if you're comparing costs across 50 houses. For a one-bedroom apartment, renting is usually cheaper.

**Interview Answer Template:**
"Docker is a containerization tool that packages your entire application with its dependencies into a container. Instead of hoping the hosting platform has the right Node version and dependencies, Docker guarantees consistency—'if it runs in Docker on my laptop, it runs the same way in production.' I'd use Docker when: (1) deploying to Kubernetes or container orchestration, (2) running multiple services besides Next.js, (3) needing to stick with open-source infrastructure, (4) cost is critical (Docker is cheaper at massive scale). The Dockerfile is basically a recipe: start with Node 18, install dependencies, build the app, then run it. The multi-stage Dockerfile is smart—it builds the app in one container (with all dev tools), then copies only the essentials to a smaller final container, reducing size from 1GB to 300MB."

**5. What happens if your environment variables are wrong during deployment?**

**Interview Answer Template:**
"It depends on which variables are wrong. If NEXT_PUBLIC_API_URL is wrong, the build might succeed but the app will try to call the wrong API endpoint—users see a broken app. If a regular environment variable like DATABASE_URL is wrong, the API routes fail with connection errors. If you're not validating, you might not notice for hours. The best practice is to validate environment variables at build time: I'd use a schema validation library (like Zod) that checks during the build—'if DATABASE_URL doesn't look like a valid Postgres URL, fail the build.' This means bad config gets caught in CI/CD, not discovered by customers. For secrets like API keys, I use the platform's native secrets management rather than committing to git. And I use separate .env files per environment so staging can't accidentally use production keys."

**Interview Answer Checklist:**
✅ Explain NEXT_PUBLIC_ vs server variables
✅ Mention validation at build time
✅ Show awareness of staging vs production
✅ Know the difference between Vercel and Docker
✅ Understand that wrong env vars cause silent failures
✅ Know how to use platform secrets management

---

### Code Example

```typescript
// ==========================================
// 1. VERCEL DEPLOYMENT (EASIEST)
// ==========================================

// Install Vercel CLI
// npm i -g vercel

// Deploy to preview environment
// vercel

// Deploy to production
// vercel --prod

// vercel.json configuration
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"], // US East (specific region)
  "env": {
    "DATABASE_URL": "@database-url", // Reference to secret
    "NEXT_PUBLIC_API_URL": "https://api.example.com"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_ANALYTICS_ID": "UA-XXXXXXXXX"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-blog/:slug",
      "destination": "/blog/:slug",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/:path*"
    }
  ]
}

// ==========================================
// 2. ENVIRONMENT VARIABLES
// ==========================================

// .env.local (local development, NOT committed)
DATABASE_URL=postgresql://localhost:5432/mydb
SECRET_KEY=local-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api

// .env.production (production defaults, CAN be committed)
NEXT_PUBLIC_API_URL=https://api.production.com
NEXT_PUBLIC_ANALYTICS_ID=UA-PRODUCTION-ID

// .env.development (development defaults, CAN be committed)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

// Accessing environment variables
// Server-side (API routes, getServerSideProps, Server Components)
export async function GET() {
  const dbUrl = process.env.DATABASE_URL; // ✅ Available
  const secretKey = process.env.SECRET_KEY; // ✅ Available
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL; // ✅ Available

  // These are NOT exposed to the client
  return Response.json({ message: 'Connected to DB' });
}

// Client-side (only NEXT_PUBLIC_ variables)
export default function Page() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // ✅ Available
  const secretKey = process.env.SECRET_KEY; // ❌ undefined (not accessible)

  return <div>API URL: {apiUrl}</div>;
}

// Type-safe environment variables
// env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SECRET_KEY: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);

// Now use env.DATABASE_URL instead of process.env.DATABASE_URL

// ==========================================
// 3. DOCKER DEPLOYMENT
// ==========================================

// Dockerfile (standalone output mode)
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

// next.config.js - Enable standalone output
module.exports = {
  output: 'standalone', // Creates optimized standalone build
};

// docker-compose.yml
version: '3.8'
services:
  nextjs:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://db:5432/mydb
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

// ==========================================
// 4. AWS DEPLOYMENT (AMPLIFY)
// ==========================================

// amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*

// Environment variables in AWS Amplify Console:
// - Go to App Settings > Environment variables
// - Add: DATABASE_URL, SECRET_KEY, etc.

// ==========================================
// 5. NETLIFY DEPLOYMENT
// ==========================================

// netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
  NEXT_TELEMETRY_DISABLED = "1"

[[redirects]]
  from = "/old-path"
  to = "/new-path"
  status = 301

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"

// ==========================================
// 6. SELF-HOSTED WITH PM2
// ==========================================

// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nextjs-app',
    script: 'npm',
    args: 'start',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};

// Start with PM2
// pm2 start ecosystem.config.js --env production
// pm2 save
// pm2 startup

// ==========================================
// 7. CI/CD PIPELINE (GITHUB ACTIONS)
// ==========================================

// .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linter
        run: npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

// ==========================================
// 8. MULTI-ENVIRONMENT SETUP
// ==========================================

// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:staging": "env-cmd -f .env.staging next build",
    "build:production": "env-cmd -f .env.production next build",
    "start": "next start",
    "deploy:staging": "vercel --env staging",
    "deploy:production": "vercel --prod"
  }
}

// .env.staging
NEXT_PUBLIC_API_URL=https://api-staging.example.com
NEXT_PUBLIC_ENVIRONMENT=staging

// .env.production
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ENVIRONMENT=production

// Use in code
export default function ApiClient() {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div>
      <p>Environment: {env}</p>
      <p>API: {apiUrl}</p>
    </div>
  );
}
```

### Common Mistakes

- ❌ **Committing .env.local** - Exposing secrets in version control
- ❌ **Using server-only env vars in client** - Expecting process.env.SECRET_KEY to work in browser
- ❌ **Not testing build locally** - Deploying without running `npm run build` first
- ❌ **Hardcoding environment values** - Putting production URLs directly in code
- ✅ **Use NEXT_PUBLIC_ prefix for client vars** - Only these are accessible in browser
- ✅ **Separate env files per environment** - .env.local, .env.staging, .env.production
- ✅ **Test builds before deploying** - Always run `npm run build && npm start` locally
- ✅ **Use Vercel secrets for sensitive data** - Store in platform, not in code

### Follow-up Questions

1. **What's the difference between NEXT_PUBLIC_ and regular env variables?** NEXT_PUBLIC_ variables are embedded in the client bundle at build time and accessible in browser. Regular env vars are only available on server-side (API routes, getServerSideProps, Server Components).

2. **How do you handle database migrations in production?** Run migrations before deployment using CI/CD pipeline, use migration tools like Prisma Migrate or Drizzle, always test migrations on staging first, have rollback plan ready.

3. **What's the benefit of Vercel's Edge Network?** Globally distributed CDN, automatic caching of static assets, edge functions run close to users (low latency), automatic HTTPS/SSL, DDoS protection included.

### Resources
- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Self-Hosting Next.js](https://nextjs.org/docs/deployment#self-hosting)

---

## Question 2: What Are the Best Practices for Next.js Error Handling and Monitoring in Production?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Netflix, Airbnb, Uber, Stripe

### Question
How do you implement comprehensive error handling and monitoring for Next.js applications in production? Explain error boundaries, API error handling, logging strategies, and monitoring tools.

### Answer

**Production Error Handling** - Systematic approach to catching, logging, and monitoring errors in Next.js applications with proper user feedback and alerting systems.

**Key Points:**

1. **Error Boundaries for React Errors** - Catch rendering errors, provide fallback UI, log errors to monitoring service
2. **API Route Error Handling** - Standardized error responses, proper status codes, error logging
3. **Global Error Pages** - Custom 404, 500 error pages with helpful messaging
4. **Monitoring and Alerting** - Sentry, LogRocket, Datadog for real-time error tracking and user session replay
5. **Logging Strategy** - Structured logging, different log levels, correlation IDs for tracing requests

---

### 🔍 Deep Dive: Error Boundaries & V8 Exception Handling

**React Error Boundaries in Next.js App Router:**
Error boundaries work differently in App Router vs Pages Router. In App Router, `error.tsx` files create boundaries at specific route segments. When a Server Component throws, Next.js serializes the error and sends it to the Client Component's error boundary. This is crucial: Server-side errors become client-side Error objects, losing some context.

The error digest (`error.digest`) is a hash of the error stack. Next.js uses this to group similar errors in Sentry. For example, two different users with the same bug will have the same digest, letting you see it affects 1,000 users, not that you have 500 different errors.

**Error Serialization in Server Components:**
This is a common trap. When a Server Component throws an error like `new Error('Database connection failed')`, Next.js must serialize it to send to the client. Serialization removes the prototype—your custom error class becomes a plain object. Your `instanceof ApiError` checks fail. Solution: check `error.name` or `error.code` instead of `instanceof`.

```javascript
// ❌ Won't work after serialization
if (error instanceof ValidationError) { }

// ✅ Works after serialization
if (error.code === 'VALIDATION_ERROR') { }
```

**V8 Stack Trace Parsing:**
When Sentry captures an error, it parses the JavaScript stack trace to show you which file and line threw. V8 (Chrome's engine) uses a specific stack format. The stack trace includes source map information—Sentry uses `.map` files to map minified code back to original code. This is why you must upload source maps to Sentry during deployment.

Sentry's breadcrumb system records the last 100 user interactions before the error. This is invaluable for reproduction: you see "user clicked button → fetched data → error threw." For performance, Sentry samples breadcrumbs (stores 1 in 100) to avoid memory bloat.

**Error Monitoring Architecture:**
When your app throws an error:
1. Browser captures exception and stack trace
2. Error is queued in memory (up to 100 errors)
3. Sentry SDK batches them and sends to Sentry servers (every 2 seconds or when queue full)
4. Network error occurs? The SDK retries 3 times, then drops
5. Sentry deduplicates by fingerprint (grouping identical errors)
6. Sentry alerts you if error rate > threshold

The key: don't send 100% of errors. A production bug affecting 10,000 users generates 10,000 errors. Sending all would overwhelm Sentry. Instead, sample: send 10% of errors, but 100% of errors affecting new users.

**Structured Logging vs String Logging:**

String logging: `console.log('User login failed: ' + userId)`
- Can't parse programmatically
- Hard to search (grep is slow)
- No built-in context

Structured logging: `logger.error({ userId, reason: 'invalid_password' }, 'User login failed')`
- Can search/filter by any field
- Aggregatable (find all login failures by user)
- Correlatable (attach request ID, trace ID)

Structured logging tools like Pino output JSON, which log aggregation systems (ELK, Datadog) parse and make searchable. Without this, you're searching megabytes of text logs with grep.

**Correlation IDs for Request Tracing:**
In microservices, a single user request might touch 5 services. Without correlation IDs:
- Service A logs "User signup started"
- Service B logs "Email service error"
- Service C logs "Database timeout"
- You can't connect which user had the problem

With correlation IDs:
1. API gateway generates UUID for each request: `correlation-id: abc123`
2. Every service logs with this ID: `{ correlationId: 'abc123', action: 'signup' }`
3. Log aggregation system shows all logs for correlation-id=abc123
4. You see the complete request flow across all services

**Error Rate Monitoring:**
Sentry tracks error rates over time. The key metric: error rate per release.
```
Release v1.2.0: 5 errors / 1M requests = 0.0005% error rate (acceptable)
Release v1.2.1: 500 errors / 1M requests = 0.05% error rate (100x worse!)
```

This automatically triggers regression detection. Sentry sees v1.2.1 is worse and alerts you. This is how you catch bugs before users see them.

---

### 🐛 Real-World Scenario: E-Commerce Checkout Error Debugging

**Context:** Your e-commerce site's checkout is broken. Users see generic "Something went wrong" errors. You have 500 failed orders per hour, each costing $50 in lost revenue.

**Initial Situation:**
- No error tracking implemented
- Application logs in text files on server
- Users report errors in support tickets with vague descriptions
- Takes 2-3 hours to find the issue in logs
- No way to reproduce locally

**Metrics Before Monitoring:**
- MTTR (Mean Time to Recovery): 180 minutes
- MTTD (Mean Time to Detect): 30 minutes (someone must complain)
- Lost revenue per incident: ~$25,000
- Incidents per month: 3-4

**The Problem You Hit:**

Saturday night: "Something went wrong" errors spike to 1000/minute. Support gets flooded.

```
User reports: "Checkout failed after I entered my credit card"
Support tech: "Can you try again?" (No logs to check)
2 hours later: Someone logs into server, finds:
  "Error: pool.query is not a function"
```

Root cause: A database driver update broke connection pooling, but the error message was swallowed.

**Solution Implementation:**

1. **Set up Sentry with Next.js:**
```typescript
// lib/sentry.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Trace sample rate: Capture 100% of errors, but only 20% of normal transactions
  tracesSampleRate: 0.2,

  // Session replay: Capture 100% when error happens (record user actions)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1, // 10% of all sessions

  // Before sending to Sentry, filter out known non-actionable errors
  beforeSend(event) {
    // Ignore ResizeObserver errors (common browser quirk)
    if (event.exception?.values?.[0]?.type === 'ResizeObserverError') {
      return null;
    }
    return event;
  },
});
```

2. **Add detailed error context to checkout:**
```typescript
// app/api/checkout/route.ts
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
  const transactionId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { cartId, customerId, amount } = body;

    logger.info(
      {
        transactionId,
        cartId,
        customerId,
        amount,
        action: 'checkout_started'
      },
      'Checkout initiated'
    );

    // Payment processing
    const paymentResult = await processPayment({
      customerId,
      amount,
      transactionId,
    });

    if (!paymentResult.success) {
      logger.warn(
        {
          transactionId,
          paymentError: paymentResult.error,
          duration: Date.now() - startTime,
        },
        'Payment declined'
      );

      return NextResponse.json(
        {
          error: 'Payment declined. Please check your card details.',
          transactionId, // User can provide this to support
        },
        { status: 402 }
      );
    }

    // Save order
    const order = await prisma.order.create({
      data: {
        customerId,
        transactionId,
        amount,
        status: 'completed',
      },
    });

    logger.info(
      {
        transactionId,
        orderId: order.id,
        duration: Date.now() - startTime,
      },
      'Checkout completed successfully'
    );

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Critical: Log detailed error information
    logger.error(
      {
        transactionId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration,
      },
      'Checkout failed'
    );

    // Send to Sentry with context
    Sentry.captureException(error, {
      contexts: {
        checkout: {
          transactionId,
          duration,
          errorStage: 'payment_processing', // Which step failed
        },
      },
    });

    return NextResponse.json(
      {
        error: 'Checkout failed. Our support team has been notified.',
        transactionId, // User provides this to support
      },
      { status: 500 }
    );
  }
}
```

3. **Client-side error tracking:**
```typescript
// app/checkout/page.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

export default function CheckoutPage() {
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          // ...checkout data
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        // If payment was declined (402), don't report to Sentry
        if (response.status === 402) {
          setError(data.error);
          return;
        }

        // Server error (500) - report to Sentry with context
        Sentry.captureException(new Error('Checkout failed'), {
          contexts: {
            checkout: {
              transactionId: data.transactionId,
              status: response.status,
            },
          },
        });

        setError(data.error);
        return;
      }

      const result = await response.json();
      // Success - redirect
      window.location.href = `/order-confirmation/${result.orderId}`;
    } catch (error) {
      // Network error
      Sentry.captureException(error);
      setError('Network error. Please check your connection.');
    }
  };

  return (
    <div>
      <button onClick={handleCheckout}>Complete Checkout</button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

**Metrics After Implementation:**
- MTTR: 15 minutes (Sentry alert → look at transaction → fix)
- MTTD: 30 seconds (Sentry automatic detection)
- Lost revenue per incident: $250 (caught almost immediately)
- Incidents per month: 1 (issues caught in staging before production)

**Key Features That Helped:**
- Transaction ID visible to user → user can reference in support chat
- Session replay shows exactly what user did
- Structured logging shows step-by-step flow
- Error context (which stage failed) narrows debugging
- Sentry's error grouping prevents alert fatigue

---

### ⚖️ Trade-offs: Monitoring Solutions Comparison

**Sentry vs LogRocket vs Datadog:**

| Aspect | Sentry | LogRocket | Datadog |
|--------|--------|-----------|---------|
| **Primary Use** | Error tracking | Session replay | Full observability |
| **Cost** | $29/month → $999/month | $99/month → $799/month | $15/host/month |
| **Session Replay** | Optional (limited) | Excellent (core feature) | Basic |
| **Error Context** | Excellent | Good (connected to replays) | Good (but not replay) |
| **API Performance Monitoring** | Good | Limited | Excellent |
| **Log Aggregation** | Limited | Not included | Excellent |
| **Setup Complexity** | Very easy (2 lines) | Easy | Moderate |
| **Best For** | Frontend error tracking | Debugging user bugs | Infrastructure teams |

**When to choose each:**

**Sentry:**
- You want 90% of the benefit with 10% of the setup
- Focused on frontend/backend error tracking
- Budget <$200/month
- Team size: 5-20 people

**LogRocket:**
- You need to debug "it works in dev but not in prod"
- Session replay is critical (fintech, healthcare)
- Can afford $500+/month

**Datadog:**
- Already using it for infrastructure monitoring
- Need full stack observability
- High-volume applications (1M+ events/minute)
- Enterprise requirements

**Error Monitoring Sample Rate Trade-off:**

Send 100% of errors:
- Pro: See every error
- Con: Sentry quota fills quickly (costs $$$), log noise

Send 10% of errors:
- Pro: 90% cheaper
- Con: Might miss rare bugs affecting 1% of users

Solution: Adaptive sampling
- Send 100% of errors affecting NEW users
- Send 100% of critical errors (500+ errors in 5 min)
- Send 10% of routine errors

**Structured Logging vs Simple Logging:**

Simple: `console.log('User login failed')`
- Pro: Works immediately
- Con: No context, unsearchable at scale

Structured: `logger.error({ userId, reason }, 'User login failed')`
- Pro: Searchable, aggregatable, correlatable
- Con: Requires library (Pino, Winston, bunyan)

Decision: Use structured logging if application handles >100 requests/second.

**Local Console vs Centralized Logging:**

Local only (logs on server):
- Pro: Free
- Con: Lost when server restarts, unsearchable at scale

Centralized (ELK, Datadog):
- Pro: Persistent, searchable, correlatable across services
- Con: Costs money, requires infrastructure

Decision: Use centralized if you have >2 servers or >1000 users.

---

### 💬 Explain to Junior: Error Handling & Monitoring Interview Answers

**1. What's an error boundary and why do you need it?**

**Analogy:** An error boundary is like a airbag in a car. When one component crashes, the airbag (error boundary) catches it so the whole car doesn't shut down. Without it, a rendering error in one component breaks the entire page.

**Interview Answer Template:**
"An error boundary is a React component that catches errors in child components during rendering. If something goes wrong (division by zero, missing data), the error boundary catches it, logs it, and shows a fallback UI instead of crashing the whole page. In Next.js App Router, you create an `error.tsx` file in your route—this becomes the error boundary for that section. For example, if your dashboard has an error, the error.tsx catches it, shows 'Dashboard failed to load,' and the rest of the page still works. The key benefit: users see a helpful message instead of a blank screen. You should log errors to a service like Sentry so you know what's breaking in production."

**2. How do you handle errors in API routes?**

**Interview Answer Template:**
"I create a custom error class hierarchy (ValidationError, NotFoundError, UnauthorizedError) so different error types return appropriate HTTP status codes. I wrap API logic in try-catch, and in the catch, I call a centralized error handler. The error handler checks the error type and returns appropriate responses: ValidationError returns 400, NotFoundError returns 404, database errors return 500. I also log all errors to Sentry with context—which endpoint, which user, what data failed. This way, I can see 'batch of 500 POST /api/users failures at 3pm because database was down.' For user-facing errors, I return helpful messages ('Invalid email format'), but I never expose stack traces in production."

**3. What's the difference between NEXT_PUBLIC_SENTRY_DSN and SENTRY_DSN?**

**Analogy:** One is a public phone number (for customers to call), one is a secret line (for staff only).

**Interview Answer Template:**
"NEXT_PUBLIC_SENTRY_DSN is the public key that goes in the browser—it tells the JavaScript code where to send errors. Any user can see this in their browser's Network tab. SENTRY_DSN is the secret key that goes on the server—it's used for server-side error reporting (API routes, Server Components). The public key only allows sending errors, not reading data. The secret key can read historical errors, so you never expose it to the client. If I accidentally expose the secret key in the browser, an attacker could query my entire error history."

**4. How do you debug a production error that you can't reproduce locally?**

**Interview Answer Template:**
"Session replay is crucial for this. I set Sentry to capture 100% of sessions where errors happen, so I can watch the user's exact clicks and actions before the error occurred. I also add context to errors—which user, which feature, what state they were in. I make sure API endpoints log structured data (not just 'Error'), so I can search logs for that user's requests. I also add transaction IDs to tracking so I can trace a single request through the entire system. With all this, I can usually reproduce: 'Oh, they were on a slow 3G connection, clicked the button 3 times, and our code didn't handle concurrent requests.' Locally, I simulate slow networks and concurrent requests to test."

**5. What's a good error monitoring strategy?**

**Interview Answer Template:**
"First, differentiate: not all errors are the same. A payment declining is expected (user error), but a database connection failing is a bug. Expected errors should log to the database (user can see 'Card declined'), but not alert engineers. Unexpected errors should go to Sentry and page engineers at 2am. Second, add context: don't just log 'Error: undefined.' Log the full picture—which user, what were they doing, what data caused it. Third, use structured logging: log JSON objects that you can search, not string concatenation. Fourth, monitor error rates by release: when you deploy, watch the error rate spike. If it does, auto-rollback. Fifth, implement session replay for the top 10% of errors—you can't replay every error (costs too much), but you can replay the critical ones."

**Interview Answer Checklist:**
✅ Understand error boundaries (React, not JavaScript)
✅ Know custom error classes for API handling
✅ Differentiate public keys (browser) vs secret keys (server)
✅ Use context and structured logging
✅ Know how session replay helps debugging
✅ Implement error rate monitoring
✅ Understand sampling (not 100% of errors)

---

### Code Example

```typescript
// ==========================================
// 1. ERROR BOUNDARIES (APP ROUTER)
// ==========================================

// app/error.tsx - Global error boundary
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    Sentry.captureException(error);
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      {error.digest && <p className="error-id">Error ID: {error.digest}</p>}

      <button onClick={reset}>
        Try again
      </button>

      <a href="/">Go home</a>
    </div>
  );
}

// app/dashboard/error.tsx - Section-specific error boundary
'use client';

export default function DashboardError({ error, reset }) {
  return (
    <div>
      <h2>Dashboard Error</h2>
      <p>Failed to load dashboard data</p>
      <button onClick={reset}>Retry</button>
    </div>
  );
}

// app/not-found.tsx - Custom 404 page
export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/">Return Home</a>
    </div>
  );
}

// Trigger 404 programmatically
import { notFound } from 'next/navigation';

export default async function PostPage({ params }) {
  const post = await getPost(params.id);

  if (!post) {
    notFound(); // Triggers app/not-found.tsx
  }

  return <div>{post.title}</div>;
}

// ==========================================
// 2. API ROUTE ERROR HANDLING
// ==========================================

// lib/api-error.ts - Custom error classes
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public errors: Record<string, string>) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// lib/error-handler.ts - Global error handler
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { ApiError } from './api-error';

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  // Handle known API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          ...(error instanceof ValidationError && { errors: error.errors }),
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: Record<string, unknown> };

    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: { message: 'Resource already exists', code: 'DUPLICATE' } },
        { status: 409 }
      );
    }

    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: { message: 'Resource not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }
  }

  // Log unknown errors to Sentry
  Sentry.captureException(error);

  // Generic error response
  return NextResponse.json(
    {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    },
    { status: 500 }
  );
}

// app/api/users/[id]/route.ts - Using error handler
import { NextRequest } from 'next/server';
import { handleApiError, NotFoundError, ValidationError } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    if (!userId) {
      throw new ValidationError('User ID is required', {
        id: 'User ID cannot be empty',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

// ==========================================
// 3. SENTRY INTEGRATION
// ==========================================

// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // Adjust for production (0.1 = 10%)

  // Session replay for debugging
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  beforeSend(event, hint) {
    // Filter out known issues
    if (event.exception) {
      const error = hint.originalException;
      if (error && error.message?.includes('ResizeObserver')) {
        return null; // Don't send to Sentry
      }
    }
    return event;
  },
});

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// next.config.js - Sentry webpack plugin
const { withSentryConfig } = require('@sentry/nextjs');

const moduleExports = {
  // Your Next.js config
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: 'your-org',
  project: 'your-project',
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);

// ==========================================
// 4. STRUCTURED LOGGING
// ==========================================

// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

// Usage in API routes
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    logger.info({ requestId, path: request.url }, 'Processing request');

    // ... business logic

    logger.info({ requestId, userId: user.id }, 'Request completed');

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(
      { requestId, error: error.message, stack: error.stack },
      'Request failed'
    );

    return handleApiError(error);
  }
}

// ==========================================
// 5. CLIENT-SIDE ERROR TRACKING
// ==========================================

// app/layout.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Global error handler
    window.addEventListener('error', (event) => {
      Sentry.captureException(event.error);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      Sentry.captureException(event.reason);
    });
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

// Custom error tracking hook
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export function useErrorTracking(componentName: string) {
  useEffect(() => {
    Sentry.setContext('component', { name: componentName });

    return () => {
      Sentry.setContext('component', null);
    };
  }, [componentName]);
}

// Usage
export default function Dashboard() {
  useErrorTracking('Dashboard');

  return <div>Dashboard</div>;
}
```

### Common Mistakes

- ❌ **Not catching API errors** - Letting errors crash the application without proper handling
- ❌ **Exposing stack traces in production** - Showing detailed error info to users
- ❌ **No error monitoring** - Deploying without Sentry/LogRocket and being blind to issues
- ❌ **Generic error messages** - "Something went wrong" without any context
- ✅ **Use error boundaries** - Catch React rendering errors and show fallback UI
- ✅ **Implement structured logging** - Use correlation IDs to trace requests across services
- ✅ **Monitor production errors** - Set up Sentry with alerting for critical errors
- ✅ **Custom error pages** - Provide helpful 404/500 pages with navigation

### Follow-up Questions

1. **How do you handle errors in Server Components?** Use error.tsx files for error boundaries, return error states from async functions, use try-catch in server actions, redirect to error pages with proper messages.

2. **What's the difference between error.tsx and global-error.tsx?** error.tsx catches errors in specific route segments, global-error.tsx catches errors in root layout (must be in app directory root). global-error.tsx replaces entire page including layout.

3. **How do you prevent error monitoring from impacting performance?** Sample errors (don't send 100%), use async error reporting, filter out known issues, set appropriate trace sample rates (10-20% for production).

### Resources
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Pino Logger](https://github.com/pinojs/pino)
- [LogRocket](https://logrocket.com/)

</details>

---
