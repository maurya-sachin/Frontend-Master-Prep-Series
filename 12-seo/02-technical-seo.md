# Technical SEO

> Page speed, Core Web Vitals, mobile-first indexing, HTTPS, URL structure, and technical optimization.

---

## Question 1: Core Web Vitals and SEO

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta

### Question
Explain Core Web Vitals. How do they affect SEO?

### Answer

**Core Web Vitals (Google Ranking Factors):**

1. **LCP (Largest Contentful Paint)** - Loading performance
   - Target: < 2.5s
   - Measures: When main content loads

2. **FID (First Input Delay)** - Interactivity
   - Target: < 100ms
   - Measures: Time to first interaction

3. **CLS (Cumulative Layout Shift)** - Visual stability
   - Target: < 0.1
   - Measures: Unexpected layout shifts

```javascript
// Measure Core Web Vitals
import {getLCP, getFID, getCLS} from 'web-vitals';

getLCP(console.log);
getFID(console.log);
getCLS(console.log);
```

**Optimization:**
- LCP: Optimize images, use CDN, preload critical assets
- FID: Minimize JavaScript, use web workers
- CLS: Set image dimensions, avoid inserting content above viewport

### Resources
- [Web Vitals](https://web.dev/vitals/)

---

