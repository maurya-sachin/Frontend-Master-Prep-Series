# Next.js API Routes

> Creating API endpoints, middleware, authentication, error handling, and API best practices.

---

## Question 1: Next.js API Routes

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Vercel, Meta

### Question
How do Next.js API routes work? How to create REST API?

### Answer

```typescript
// pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const user = await getUser(id as string);
    return res.status(200).json(user);
  }

  if (req.method === 'PUT') {
    const updated = await updateUser(id as string, req.body);
    return res.status(200).json(updated);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
```

### Resources
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

