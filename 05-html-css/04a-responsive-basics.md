# Responsive Design Basics

> Media queries, viewport, and responsive fundamentals

---

## Question 1: Mobile-First Responsive Design

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Amazon, Airbnb

### Question
What is mobile-first design? How do you implement it with media queries?

### Answer

**Mobile-first** means designing for mobile devices first, then progressively enhancing for larger screens using `min-width` media queries.

**Key Points:**

1. **Start Small** - Base styles for smallest screens, add complexity for larger
2. **min-width Over max-width** - Build up instead of breaking down
3. **Performance** - Mobile users load minimal CSS first
4. **Accessibility** - Forces focus on essential content
5. **Future-Proof** - Easier to add features than remove them

### Code Example

```css
/* =========================================== */
/* 1. MOBILE-FIRST APPROACH */
/* =========================================== */

/* ❌ DESKTOP-FIRST (Old way - avoid) */
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Desktop first */
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: repeat(2, 1fr); /* Override for tablet */
  }
}

@media (max-width: 480px) {
  .container {
    grid-template-columns: 1fr; /* Override for mobile */
  }
}

/* ✅ MOBILE-FIRST (Modern way - recommended) */
.container {
  display: grid;
  grid-template-columns: 1fr; /* Mobile first (base) */
}

@media (min-width: 480px) {
  .container {
    grid-template-columns: repeat(2, 1fr); /* Tablet */
  }
}

@media (min-width: 768px) {
  .container {
    grid-template-columns: repeat(4, 1fr); /* Desktop */
  }
}

/*
MOBILE-FIRST BENEFITS:
- Simpler code (add vs remove)
- Better performance (progressive enhancement)
- Accessibility first
*/
```

```css
/* =========================================== */
/* 2. COMMON BREAKPOINTS */
/* =========================================== */

/* Mobile first breakpoints */
/* Base: Mobile (< 480px) */

/* Small devices (landscape phones, 480px and up) */
@media (min-width: 480px) { }

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) { }

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) { }

/* Extra large devices (large desktops, 1280px and up) */
@media (min-width: 1280px) { }

/* Using CSS custom properties for consistency */
:root {
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

```css
/* =========================================== */
/* 3. PRACTICAL EXAMPLE */
/* =========================================== */

/* Typography - mobile first */
body {
  font-size: 16px; /* Mobile base */
  line-height: 1.5;
}

@media (min-width: 768px) {
  body {
    font-size: 18px; /* Tablet */
  }
}

@media (min-width: 1024px) {
  body {
    font-size: 20px; /* Desktop */
  }
}

/* Navigation - mobile first */
.nav {
  display: flex;
  flex-direction: column; /* Stacked on mobile */
}

@media (min-width: 768px) {
  .nav {
    flex-direction: row; /* Horizontal on tablet+ */
  }
}

/* Layout - mobile first */
.layout {
  display: grid;
  grid-template-areas:
    "header"
    "content"
    "sidebar"
    "footer";
}

@media (min-width: 1024px) {
  .layout {
    grid-template-areas:
      "header header"
      "content sidebar"
      "footer footer";
    grid-template-columns: 1fr 300px;
  }
}
```

### Common Mistakes

❌ **Wrong**: Desktop-first with max-width
```css
.element {
  width: 1200px; /* Desktop first */
}

@media (max-width: 768px) {
  .element {
    width: 100%; /* Undo desktop styles */
  }
}
```

✅ **Correct**: Mobile-first with min-width
```css
.element {
  width: 100%; /* Mobile first */
}

@media (min-width: 768px) {
  .element {
    width: 1200px; /* Add desktop styles */
  }
}
```

### Follow-up Questions
1. "What are the standard breakpoints?"
2. "How do you test responsive designs?"
3. "What's the difference between responsive and adaptive design?"
4. "How do you handle images in responsive design?"

### Resources
- [MDN: Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)
- [Responsive Design Best Practices](https://web.dev/responsive-web-design-basics/)

---

