# Next.js Deployment and Optimization

> Vercel deployment, optimization techniques, environment variables, and production best practices.

---

## Question 1: Next.js Production Optimization

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Vercel, Meta

### Question
How do you optimize Next.js for production?

### Answer

**Optimization Techniques:**
1. Image Optimization (next/image)
2. Code Splitting (automatic)
3. Font Optimization
4. Script Optimization
5. Bundle Analysis

```jsx
// 1. Optimize Images
import Image from 'next/image';

<Image
  src="/photo.jpg"
  alt="Photo"
  width={500}
  height={300}
  priority // LCP optimization
/>

// 2. Font Optimization
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// 3. Script Optimization
import Script from 'next/script';

<Script src="analytics.js" strategy="lazyOnload" />

// 4. Bundle Analysis
// next.config.js
module.exports = {
  webpack: (config) => {
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(new BundleAnalyzerPlugin());
    }
    return config;
  }
};
```

### Resources
- [Next.js Optimization](https://nextjs.org/docs/going-to-production)

---

