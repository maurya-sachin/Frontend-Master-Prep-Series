# Next.js Rendering Strategies

> SSR, SSG, ISR, CSR, streaming, and when to use each rendering method.

---

## Question 1: Next.js Rendering Methods

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Vercel, Meta

### Question
Explain SSR, SSG, ISR, and CSR in Next.js. When to use each?

### Answer

**1. SSG (Static Site Generation)** - Pre-render at build time
- Use: Blog, marketing pages
- Fastest performance

**2. SSR (Server-Side Rendering)** - Render on each request
- Use: User-specific data, real-time
- Fresh data

**3. ISR (Incremental Static Regeneration)** - Rebuild on interval
- Use: E-commerce, news
- Balance speed + freshness

**4. CSR (Client-Side Rendering)** - Render in browser
- Use: Dashboards, admin panels
- Interactive apps

```jsx
// SSG
export async function getStaticProps() {}

// SSR
export async function getServerSideProps() {}

// ISR
export async function getStaticProps() {
  return {
    props: {},
    revalidate: 60 // Rebuild every 60s
  };
}

// CSR (no data fetching export)
function Dashboard() {
  const { data } = useSWR('/api/dashboard', fetcher);
  return <div>{data}</div>;
}
```

### Resources
- [Next.js Rendering](https://nextjs.org/docs/basic-features/pages)

---

