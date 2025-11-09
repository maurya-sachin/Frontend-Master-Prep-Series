# Content SEO

> Semantic HTML for SEO, heading hierarchy, alt text, internal linking, and content optimization strategies.

---

## Question 1: Semantic HTML for SEO

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Google, Airbnb

### Question
How does semantic HTML improve SEO?

### Answer

**Semantic Elements Help Search Engines:**
- Understand content structure
- Identify main content vs navigation
- Determine content hierarchy

```html
<!-- ✅ Semantic (Better for SEO) -->
<header>
  <h1>Main Heading</h1>
  <nav>
    <a href="/">Home</a>
  </nav>
</header>

<main>
  <article>
    <h2>Article Title</h2>
    <p>Content...</p>
  </article>
</main>

<footer>
  <p>&copy; 2025</p>
</footer>

<!-- ❌ Non-Semantic (Poor for SEO) -->
<div class="header">
  <div class="title">Main Heading</div>
  <div class="nav">
    <a href="/">Home</a>
  </div>
</div>
```

**Heading Hierarchy:**
```html
<h1>Page Title</h1>  <!-- Only one H1 -->
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
    <h3>Subsection 1.2</h3>
  <h2>Section 2</h2>
```

### Resources
- [Semantic HTML](https://web.dev/learn/html/semantic-html/)

---

