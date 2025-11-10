# Next.js Data Fetching

> getServerSideProps, getStaticProps, getStaticPaths, ISR, data fetching patterns, and caching strategies.

---

## Question 1: getServerSideProps vs getStaticProps

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Vercel, Meta, Google

### Question
What's the difference between getServerSideProps and getStaticProps? When to use each?

### Answer

| Feature | getStaticProps | getServerSideProps |
|---------|----------------|-------------------|
| When runs | Build time | Every request |
| Performance | Fastest (cached) | Slower (per-request) |
| Data freshness | Stale (until rebuild) | Always fresh |
| Use case | Blog posts, docs | User dashboards, real-time |

```typescript
// getStaticProps - Build time
export async function getStaticProps() {
  const posts = await getPosts();

  return {
    props: { posts },
    revalidate: 60 // ISR: rebuild every 60s
  };
}

// getServerSideProps - Request time
export async function getServerSideProps(context) {
  const { req, res } = context;
  const user = await getUser(req.cookies.token);

  return {
    props: { user }
  };
}
```

### Resources
- [Next.js Data Fetching](https://nextjs.org/docs/basic-features/data-fetching)

---

