# TypeScript with Next.js

> Typing Next.js pages, API routes, getStaticProps, getServerSideProps, and App Router with TypeScript.

---

## Question 1: Typing Next.js Pages and Data Fetching

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Meta, Vercel

### Question
How do you type Next.js pages, getServerSideProps, and API routes?

### Answer

```typescript
// Page with getServerSideProps
import { GetServerSideProps, NextPage } from 'next';

interface PageProps {
  user: User;
}

const UserPage: NextPage<PageProps> = ({ user }) => {
  return <div>{user.name}</div>;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const user = await fetchUser(context.params?.id as string);

  return {
    props: { user }
  };
};

export default UserPage;

// API Route
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ message: 'Hello' });
}
```

### Resources
- [Next.js TypeScript](https://nextjs.org/docs/basic-features/typescript)

---

