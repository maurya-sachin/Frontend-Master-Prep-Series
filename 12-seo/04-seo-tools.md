# SEO Tools and Monitoring

> Google Search Console, Lighthouse, schema markup validators, analytics integration, and SEO monitoring strategies.

---

## Question 1: Google Search Console for Frontend Developers

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Google, Airbnb

### Question
How do you use Google Search Console to monitor SEO health?

### Answer

**Key Features:**
1. **Performance Report** - Clicks, impressions, CTR, position
2. **Coverage Report** - Indexing errors
3. **Core Web Vitals** - Performance metrics
4. **Mobile Usability** - Mobile issues
5. **Sitemaps** - Submit and monitor sitemaps

```javascript
// Lighthouse CI for automated SEO audits
{
  "ci": {
    "collect": {
      "url": ["https://example.com"],
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "assertions": {
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

### Resources
- [Google Search Console](https://search.google.com/search-console)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

