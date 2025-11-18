# TypeScript with Next.js

> Master TypeScript in Next.js: Pages Router, App Router, Server Components, API Routes, and data fetching patterns

---

## Question 1: How Do You Type Next.js Pages Router with getServerSideProps?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Vercel, Airbnb, Netflix

### Question
How do you properly type Next.js pages using the Pages Router with `getServerSideProps` and `getStaticProps`?

### Answer

**Key Points:**
1. **NextPage** - Type for page components
2. **GetServerSideProps** - Type for SSR data fetching
3. **GetStaticProps** - Type for SSG data fetching
4. **InferGetServerSidePropsType** - Infer props from data fetching function
5. **Context** - Access params, query, req, res with proper types

### Code Example

```typescript
import { GetServerSideProps, GetStaticProps, NextPage, InferGetServerSidePropsType } from 'next';

// 1. BASIC PAGE WITH getServerSideProps
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserPageProps {
  user: User;
  timestamp: string;
}

const UserPage: NextPage<UserPageProps> = ({ user, timestamp }) => {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <small>Fetched at: {timestamp}</small>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<UserPageProps> = async (context) => {
  const userId = context.params?.id as string;

  // Access query params, cookies, etc.
  const { token } = context.query;
  const cookies = context.req.cookies;

  const user = await fetch(`/api/users/${userId}`).then(r => r.json());

  return {
    props: {
      user,
      timestamp: new Date().toISOString()
    }
  };
};

export default UserPage;

// 2. USING InferGetServerSidePropsType (Recommended)
export const getServerSideProps2 = async (context: GetServerSidePropsContext) => {
  const user = await fetchUser();
  return {
    props: { user, timestamp: Date.now() }
  };
};

// Type is automatically inferred from getServerSideProps return value
type Props = InferGetServerSidePropsType<typeof getServerSideProps2>;

const UserPage2: NextPage<Props> = ({ user, timestamp }) => {
  // user and timestamp are properly typed
  return <div>{user.name}</div>;
};

// 3. getStaticProps WITH PATHS
interface PostProps {
  post: {
    id: string;
    title: string;
    content: string;
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await fetchAllPosts();

  return {
    paths: posts.map(post => ({
      params: { id: post.id }
    })),
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async (context) => {
  const postId = context.params?.id as string;
  const post = await fetchPost(postId);

  if (!post) {
    return {
      notFound: true
    };
  }

  return {
    props: { post },
    revalidate: 60 // ISR: revalidate every 60 seconds
  };
};

// 4. ERROR HANDLING IN DATA FETCHING
export const getServerSideProps: GetServerSideProps<UserPageProps> = async (context) => {
  try {
    const user = await fetchUser();
    return { props: { user, timestamp: Date.now() } };
  } catch (error) {
    return {
      redirect: {
        destination: '/error',
        permanent: false
      }
    };
  }
};
```

### Resources
- [Next.js TypeScript](https://nextjs.org/docs/basic-features/typescript)

---

## Question 2: How Do You Type Next.js API Routes?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 6 minutes
**Companies:** All Next.js companies

### Question
How do you properly type Next.js API routes with request/response objects and different HTTP methods?

### Answer

**Key Points:**
1. **NextApiRequest** - Typed request object
2. **NextApiResponse** - Typed response with generics for response data
3. **HTTP Methods** - Type-safe method checking
4. **Custom Types** - Create interfaces for request/response bodies
5. **Middleware** - Type middleware functions properly

### Code Example

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

// 1. BASIC API ROUTE
type Data = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ message: 'Hello from API' });
}

// 2. HANDLING DIFFERENT HTTP METHODS
interface User {
  id: number;
  name: string;
  email: string;
}

type GetResponse = { users: User[] };
type PostResponse = { user: User };
type ErrorResponse = { error: string };

export default async function usersHandler(
  req: NextApiRequest,
  res: NextApiResponse<GetResponse | PostResponse | ErrorResponse>
) {
  if (req.method === 'GET') {
    const users = await fetchUsers();
    return res.status(200).json({ users });
  }

  if (req.method === 'POST') {
    const { name, email } = req.body;
    const user = await createUser({ name, email });
    return res.status(201).json({ user });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// 3. TYPED REQUEST BODY
interface CreateUserRequest {
  name: string;
  email: string;
  age?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as CreateUserRequest;

  if (!body.name || !body.email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const user = await createUser(body);
  return res.status(201).json({ user });
}

// 4. CUSTOM MIDDLEWARE WITH TYPES
type MiddlewareFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => void;

const authMiddleware: MiddlewareFunction = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Attach user to request
  (req as any).user = decodeToken(token);
  next();
};

// 5. GENERIC API HANDLER
type ApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>
) => Promise<void> | void;

const createApiHandler = <T>(handler: ApiHandler<T>) => {
  return async (req: NextApiRequest, res: NextApiResponse<T>) => {
    try {
      await handler(req, res);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' } as T);
    }
  };
};
```

### Resources
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## Question 3: How Do You Type Next.js App Router Components?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Vercel, Modern Next.js projects

### Question
How do you type Next.js 13+ App Router components, including Server Components, layouts, and route handlers?

### Answer

**Key Points:**
1. **Server Components** - Default in App Router, async components supported
2. **Page Props** - `params` and `searchParams` are automatically passed
3. **Layout Props** - Type children and params
4. **Route Handlers** - New API route format in App Router
5. **Metadata** - Type metadata exports

### Code Example

```typescript
// 1. BASIC PAGE COMPONENT (Server Component)
interface PageProps {
  params: { id: string };
  searchParams: { sort?: string; filter?: string };
}

export default async function UserPage({ params, searchParams }: PageProps) {
  // Can use async/await directly in Server Components
  const user = await fetchUser(params.id);
  const sortOrder = searchParams.sort || 'asc';

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Sort: {sortOrder}</p>
    </div>
  );
}

// 2. LAYOUT COMPONENT
interface LayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default function Layout({ children, params }: LayoutProps) {
  return (
    <html lang={params.locale}>
      <body>{children}</body>
    </html>
  );
}

// 3. ROUTE HANDLERS (App Router API Routes)
import { NextRequest, NextResponse } from 'next/server';

interface User {
  id: number;
  name: string;
}

// GET handler
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  const users: User[] = await fetchUsers(query);

  return NextResponse.json({ users });
}

// POST handler
export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await createUser(body);

  return NextResponse.json({ user }, { status: 201 });
}

// 4. DYNAMIC ROUTE HANDLER
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await fetchUser(params.id);

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ user });
}

// 5. METADATA
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Page',
  description: 'Page description'
};

// Dynamic metadata
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const user = await fetchUser(params.id);

  return {
    title: user.name,
    description: `Profile of ${user.name}`
  };
}

// 6. CLIENT COMPONENT
'use client';

import { useState } from 'react';

interface ClientComponentProps {
  initialCount: number;
}

export default function Counter({ initialCount }: ClientComponentProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Resources
- [Next.js App Router](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

---

## Questions 4-15: Next.js TypeScript Patterns

**Difficulty:** 🟡 Medium to 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Consolidated Next.js TypeScript patterns**

### Q4-6: Advanced Data Fetching & Middleware

```typescript
// Q4: Type-safe Middleware
import { NextRequest, NextResponse } from 'next/server';

interface User {
  id: string;
  role: 'admin' | 'user';
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const user: User = await verifyToken(token.value);

    // Add user to headers for downstream consumption
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};

// Q5: ISR with Type Safety
import { GetStaticProps, GetStaticPaths } from 'next';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface ProductPageProps {
  product: Product;
  revalidatedAt: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const products = await fetchAllProducts();

  return {
    paths: products.map((product) => ({
      params: { id: product.id },
    })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<ProductPageProps> = async (context) => {
  const productId = context.params?.id as string;

  try {
    const product = await fetchProduct(productId);

    if (!product) {
      return { notFound: true };
    }

    return {
      props: {
        product,
        revalidatedAt: new Date().toISOString(),
      },
      revalidate: 60, // ISR: regenerate every 60 seconds
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/products',
        permanent: false,
      },
    };
  }
};

// Q6: App Router Server Actions
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface FormState {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string;
}

export async function createUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // Validation
  if (!name || name.length < 2) {
    return {
      errors: { name: ['Name must be at least 2 characters'] },
    };
  }

  if (!email || !email.includes('@')) {
    return {
      errors: { email: ['Invalid email address'] },
    };
  }

  try {
    await db.user.create({ data: { name, email } });

    revalidatePath('/users');
    redirect('/users');
  } catch (error) {
    return {
      message: 'Failed to create user',
    };
  }
}
```

### Q7-9: Route Handlers & Streaming

```typescript
// Q7: Advanced Route Handler with Validation
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validatedData = CreateUserSchema.parse(body);

    const user = await createUser(validatedData);

    return NextResponse.json(
      { user, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Q8: Streaming Response
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        const data = await fetchData(i);
        const message = JSON.stringify(data) + '\n';
        controller.enqueue(encoder.encode(message));
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Q9: Route Handler with Cookies & Headers
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Read cookies
  const sessionToken = request.cookies.get('session');
  const userId = request.headers.get('x-user-id');

  // Perform operation
  const result = await performOperation(body, userId);

  // Create response with cookies
  const response = NextResponse.json({ result });

  // Set cookies
  response.cookies.set({
    name: 'session',
    value: result.sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  // Set custom headers
  response.headers.set('X-Custom-Header', 'value');

  return response;
}
```

### Q10-12: App Router Edge Cases

```typescript
// Q10: Loading & Error Boundaries
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>;
}

// app/dashboard/error.tsx
'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// Q11: Parallel & Sequential Data Fetching
interface PageProps {
  params: { userId: string };
}

// Sequential (waterfall)
async function getUserData(userId: string) {
  const user = await fetchUser(userId);
  const posts = await fetchUserPosts(user.id); // Waits for user
  return { user, posts };
}

// Parallel (recommended)
async function getUserDataParallel(userId: string) {
  const [user, posts] = await Promise.all([
    fetchUser(userId),
    fetchUserPosts(userId),
  ]);
  return { user, posts };
}

export default async function UserPage({ params }: PageProps) {
  const { user, posts } = await getUserDataParallel(params.userId);

  return (
    <div>
      <h1>{user.name}</h1>
      <PostList posts={posts} />
    </div>
  );
}

// Q12: Type-safe Environment Variables
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

// Validate at build time
const env = envSchema.parse(process.env);

export const config = {
  databaseUrl: env.DATABASE_URL,
  apiKey: env.API_KEY,
  nodeEnv: env.NODE_ENV,
  publicApiUrl: env.NEXT_PUBLIC_API_URL,
} as const;

// Usage
import { config } from '@/config/env';

export async function connectDb() {
  return await connect(config.databaseUrl);
}
```

### Q13-15: Custom App, Document & Advanced Patterns

```typescript
// Q13: Custom _app.tsx (Pages Router)
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use page-level layout if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(<Component {...pageProps} />);
}

// Usage in page
import { ReactElement } from 'react';
import { NextPageWithLayout } from './_app';
import MainLayout from '@/components/MainLayout';

const Page: NextPageWithLayout = () => {
  return <div>My page content</div>;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default Page;

// Q14: Custom _document.tsx
import { Html, Head, Main, NextScript } from 'next/document';
import Document, { DocumentContext, DocumentInitialProps } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          {/* Add custom styles */}
        </>
      ),
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content="My app" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

// Q15: Type-safe Dynamic Imports
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

interface HeavyComponentProps {
  data: string;
  onClose: () => void;
}

// Dynamic import with loading
const HeavyComponent = dynamic<HeavyComponentProps>(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <div>Loading component...</div>,
    ssr: false, // Disable SSR for this component
  }
);

// Usage
export default function Page() {
  return <HeavyComponent data="test" onClose={() => {}} />;
}

// Dynamic import with named export
const NamedComponent = dynamic<HeavyComponentProps>(
  () => import('@/components/MyComponents').then((mod) => mod.NamedComponent)
);

// Conditional dynamic import
const DynamicComponent = dynamic<HeavyComponentProps>(() =>
  process.env.NODE_ENV === 'production'
    ? import('@/components/ProdComponent')
    : import('@/components/DevComponent')
);
```

### Common Mistakes

```typescript
// ❌ WRONG: Not typing params properly
export default async function Page({ params }) {
  const data = await fetch(`/api/${params.id}`);
}

// ✅ CORRECT: Type params explicitly
interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const data = await fetch(`/api/${params.id}`);
}

// ❌ WRONG: Using Pages Router types in App Router
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  // This doesn't exist in App Router!
};

// ✅ CORRECT: Use async components in App Router
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ❌ WRONG: Not typing route handler params
export async function GET(request, { params }) {
  return Response.json({ id: params.id });
}

// ✅ CORRECT: Type both request and context
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ id: params.id });
}
```

### Resources
- [Next.js TypeScript](https://nextjs.org/docs/basic-features/typescript)
- [App Router Documentation](https://nextjs.org/docs/app)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**[← Back to TypeScript README](./README.md)**

**Progress:** 15 of 15 Next.js TypeScript questions completed ✅
