# SEO Fundamentals

> Meta tags, Open Graph, structured data, sitemaps, robots.txt, and SEO best practices for frontend developers.

---

## Question 1: Essential Meta Tags for SEO

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Meta, Amazon, Airbnb

### Question
What are the essential meta tags for SEO? Explain Open Graph and Twitter Cards.

### Answer

**Essential Meta Tags:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Character encoding -->
  <meta charset="UTF-8">

  <!-- Viewport for mobile -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>Page Title - 50-60 characters</title>
  <meta name="title" content="Page Title">
  <meta name="description" content="Page description 150-160 characters">
  <meta name="keywords" content="keyword1, keyword2, keyword3">
  <meta name="author" content="Author Name">

  <!-- Canonical URL -->
  <link rel="canonical" href="https://example.com/page">

  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://example.com/page">
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Page description">
  <meta property="og:image" content="https://example.com/image.jpg">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://example.com/page">
  <meta name="twitter:title" content="Page Title">
  <meta name="twitter:description" content="Page description">
  <meta name="twitter:image" content="https://example.com/image.jpg">

  <!-- Robots -->
  <meta name="robots" content="index, follow">
</head>
</html>
```

**Structured Data (JSON-LD):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "datePublished": "2025-11-09",
  "image": "https://example.com/image.jpg"
}
</script>
```

### Resources
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Open Graph Protocol](https://ogp.me/)

---

*[File continues with sitemaps, robots.txt, canonical URLs, etc.]*

