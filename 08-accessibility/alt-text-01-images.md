# Alternative Text for Images

> **Focus**: Accessibility fundamentals for images, icons, and decorative content

---

## Question 1: How do you write effective alternative text for images?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Microsoft, Amazon, Meta

### Question
Explain the purpose of alternative text and best practices for writing alt text for different types of images.

### Answer

**Alternative text (alt text)** is a textual description of an image that is read by screen readers and displayed when images fail to load. It's essential for web accessibility and SEO.

**Core Principles:**

1. **Convey meaning, not description** - Focus on what the image *does* rather than what it *is*
2. **Be concise** - Aim for 125 characters or less (screen reader limit)
3. **Context matters** - Alt text should fit the surrounding content
4. **No redundancy** - Don't start with "image of" or "picture of"

### Code Example

**Informative Images:**

```html
<!-- ❌ BAD: Too vague -->
<img src="chart.png" alt="chart">

<!-- ❌ BAD: Too detailed -->
<img src="chart.png" alt="This is a bar chart showing sales data with blue bars representing Q1 and red bars representing Q2 with values ranging from 0 to 100">

<!-- ✅ GOOD: Concise and meaningful -->
<img src="chart.png" alt="Q1 sales up 25% compared to Q2">

<!-- Context example 1: Product page -->
<img src="laptop.jpg" alt="Dell XPS 13 laptop in silver">

<!-- Context example 2: Blog post -->
<img src="laptop.jpg" alt="Developer working on laptop at coffee shop">
```

**Decorative Images:**

```html
<!-- ❌ BAD: Unnecessary description -->
<img src="divider-line.png" alt="decorative line separator">

<!-- ✅ GOOD: Empty alt for decorative images -->
<img src="divider-line.png" alt="">

<!-- Alternative: Use CSS background images for decoration -->
<div style="background-image: url('divider-line.png')" role="presentation"></div>

<!-- Icons with adjacent text (decorative) -->
<button>
  <img src="search-icon.svg" alt=""> <!-- Empty alt, text provides context -->
  Search
</button>
```

**Functional Images (Links, Buttons):**

```html
<!-- ❌ BAD: Describes appearance, not function -->
<a href="/home">
  <img src="logo.png" alt="blue circular logo">
</a>

<!-- ✅ GOOD: Describes destination/action -->
<a href="/home">
  <img src="logo.png" alt="Company homepage">
</a>

<!-- Logo in navigation -->
<a href="/" aria-label="Return to homepage">
  <img src="logo.svg" alt="Acme Corp logo">
</a>

<!-- Social media icons -->
<a href="https://twitter.com/company">
  <img src="twitter-icon.svg" alt="Follow us on Twitter">
</a>

<!-- Icon buttons -->
<button type="submit">
  <img src="magnifying-glass.svg" alt="Search">
</button>
```

**Complex Images (Charts, Diagrams):**

```html
<!-- Option 1: Short alt + detailed description -->
<figure>
  <img
    src="org-chart.png"
    alt="Company organizational structure"
    aria-describedby="org-chart-details">
  <figcaption id="org-chart-details">
    The CEO oversees three departments: Engineering (50 employees),
    Sales (30 employees), and Marketing (20 employees). Each department
    has a director reporting to the CEO.
  </figcaption>
</figure>

<!-- Option 2: Short alt + link to full description -->
<img
  src="complex-diagram.png"
  alt="System architecture diagram"
  aria-describedby="diagram-desc">
<p id="diagram-desc">
  <a href="#full-description">View detailed description</a>
</p>

<!-- Option 3: Use longdesc (deprecated but still supported) -->
<img
  src="data-visualization.png"
  alt="2024 revenue trends"
  longdesc="revenue-description.html">
```

**Images of Text:**

```html
<!-- ❌ AVOID: Images of text when possible -->
<img src="call-now-button.png" alt="Call 1-800-555-0100">

<!-- ✅ BETTER: Use actual text with CSS styling -->
<button class="call-button">Call 1-800-555-0100</button>

<!-- If unavoidable (e.g., logo with text): -->
<img src="logo-with-tagline.png" alt="Acme Corp - Innovation You Can Trust">

<!-- Exception: Logos are acceptable as images -->
<img src="brand-logo.png" alt="Nike swoosh logo">
```

**Context-Specific Alt Text:**

```html
<!-- Same image, different contexts -->

<!-- E-commerce product page -->
<img src="red-dress.jpg" alt="Red evening dress, size 8, $129.99">

<!-- Fashion blog article -->
<img src="red-dress.jpg" alt="Model wearing red dress at Paris Fashion Week">

<!-- Color palette inspiration -->
<img src="red-dress.jpg" alt="Deep crimson red color inspiration">
```

**SVG Alternative Text:**

```html
<!-- Inline SVG with title and desc -->
<svg role="img" aria-labelledby="chart-title chart-desc">
  <title id="chart-title">Sales Growth Chart</title>
  <desc id="chart-desc">Bar chart showing 15% growth in Q4 2024</desc>
  <!-- SVG content -->
</svg>

<!-- SVG as img element -->
<img src="icon.svg" alt="Settings icon" role="img">

<!-- Decorative SVG -->
<svg aria-hidden="true" focusable="false">
  <!-- decorative content -->
</svg>
```

<details>
<summary><strong>🔍 Deep Dive: Screen Reader Behavior & Alt Text Processing</strong></summary>

**How Screen Readers Process Images:**

Screen readers like JAWS, NVDA, and VoiceOver follow specific algorithms when encountering images:

**1. Image Detection & Announcement:**

```html
<!-- What screen reader "sees" and announces -->

<!-- Example 1: Image with alt text -->
<img src="profile.jpg" alt="Sarah Johnson, CEO">
<!-- NVDA announces: "graphic, Sarah Johnson, CEO" -->
<!-- JAWS announces: "Sarah Johnson, CEO, graphic" -->
<!-- VoiceOver announces: "image, Sarah Johnson, CEO" -->

<!-- Example 2: Image without alt attribute -->
<img src="profile.jpg">
<!-- Screen reader announces: "graphic, profile.jpg" (filename fallback) -->
<!-- This is BAD UX - filename is meaningless to users -->

<!-- Example 3: Empty alt (decorative) -->
<img src="decoration.png" alt="">
<!-- Screen reader: SILENT (correctly skips decorative image) -->

<!-- Example 4: Missing alt and title -->
<img src="photo.jpg" title="Beautiful sunset">
<!-- Some screen readers announce: "graphic, Beautiful sunset" -->
<!-- But title is NOT a substitute for alt! -->
```

**2. Alt Text Length & Truncation:**

Different screen readers have character limits and truncation behaviors:

```html
<!-- Short alt text (ideal: under 125 characters) -->
<img src="chart.png" alt="Revenue increased 35% in Q4">
<!-- All screen readers: Reads completely -->

<!-- Long alt text (over 125 characters) -->
<img
  src="complex.png"
  alt="This is a very detailed description of a complex image that exceeds the typical character limit and may be truncated by some screen readers depending on their configuration and settings which vary across different assistive technologies">
<!-- JAWS: May split into multiple announcements -->
<!-- NVDA: Reads all, but user experience suffers -->
<!-- VoiceOver: May truncate or require user interaction to hear full text -->

<!-- BETTER: Use aria-describedby for long descriptions -->
<img
  src="complex.png"
  alt="System architecture overview"
  aria-describedby="full-description">
<div id="full-description" class="sr-only">
  Detailed description: The system consists of three layers...
  [Full detailed explanation here]
</div>
```

**3. Context & Role Detection:**

Screen readers announce images differently based on HTML context:

```html
<!-- Image in link (announces as link) -->
<a href="/products">
  <img src="product.jpg" alt="View all products">
</a>
<!-- NVDA: "link, graphic, View all products" -->
<!-- User knows this is clickable -->

<!-- Image in button (announces as button) -->
<button>
  <img src="delete.svg" alt="Delete item">
</button>
<!-- JAWS: "Delete item, button, graphic" -->

<!-- Image in figure (announces with figcaption) -->
<figure>
  <img src="photo.jpg" alt="Golden Gate Bridge at sunset">
  <figcaption>Taken from Marin Headlands, November 2024</figcaption>
</figure>
<!-- VoiceOver: "image, Golden Gate Bridge at sunset, caption: Taken from..." -->

<!-- Image with role="presentation" (decorative) -->
<img src="border.png" alt="" role="presentation">
<!-- All screen readers: SILENT (explicitly decorative) -->
```

**4. Image Format Support & Fallbacks:**

Screen readers handle different image formats with varying capabilities:

```html
<!-- Responsive images with picture element -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Sunset over mountains">
</picture>
<!-- Alt text applies to fallback img element -->
<!-- Screen reader: Ignores picture/source, reads img alt text -->

<!-- SVG images (inline vs external) -->

<!-- Inline SVG with proper ARIA -->
<svg role="img" aria-labelledby="icon-title">
  <title id="icon-title">Warning icon</title>
  <path d="..."/>
</svg>
<!-- Screen reader: "image, Warning icon" -->

<!-- External SVG as img -->
<img src="icon.svg" alt="Warning icon" role="img">
<!-- Screen reader: "image, Warning icon" -->

<!-- Icon fonts (NOT recommended for important content) -->
<i class="fa fa-warning" aria-hidden="true"></i>
<span class="sr-only">Warning</span>
<!-- Screen reader reads the hidden span, ignores icon font -->
```

**5. Browser-Specific Alt Text Rendering:**

When images fail to load, browsers display alt text differently:

```css
/* Chrome/Edge: Shows alt text in broken image placeholder */
/* Firefox: Shows alt text only if image has width/height */
/* Safari: Shows alt text with generic image icon */

/* Ensure alt text is visible on image load failure */
img {
  /* Style for broken images */
  min-height: 50px;
  display: inline-block;
  position: relative;
}

/* Display alt text when image fails */
img::before {
  content: attr(alt);
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 10px;
  background: #f0f0f0;
  border: 1px solid #ccc;
}
```

**6. Performance Considerations:**

Alt text impacts page load performance and screen reader processing time:

```javascript
// Example: Lazy-loaded images with alt text

// ❌ BAD: No alt text during lazy load
<img data-src="large-image.jpg" class="lazy">
// Screen reader during load: "graphic, [no description]"

// ✅ GOOD: Alt text present from initial render
<img
  src="placeholder.svg"
  data-src="large-image.jpg"
  alt="Product showcase image"
  class="lazy">
// Screen reader: "graphic, Product showcase image" (even before load)

// Lazy load implementation
const lazyImages = document.querySelectorAll('img.lazy');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      imageObserver.unobserve(img);
    }
  });
});

lazyImages.forEach(img => imageObserver.observe(img));
```

**7. Dynamic Alt Text Generation:**

Best practices for dynamically generated content:

```javascript
// User-uploaded images (e.g., social media posts)

// ❌ BAD: Generic or missing alt text
function displayUserPhoto(photo) {
  return `<img src="${photo.url}" alt="user photo">`;
}

// ✅ GOOD: Use user-provided description or AI-generated alt text
function displayUserPhoto(photo) {
  const altText = photo.altText
    || photo.aiGeneratedAlt
    || `Photo uploaded by ${photo.username} on ${photo.date}`;

  return `<img src="${photo.url}" alt="${escapeHTML(altText)}">`;
}

// Example: AI-generated alt text (Microsoft Azure Computer Vision)
async function generateAltText(imageUrl) {
  const response = await fetch('https://api.cognitive.microsoft.com/vision/v3.2/describe', {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': API_KEY },
    body: JSON.stringify({ url: imageUrl })
  });

  const data = await response.json();
  const description = data.description.captions[0].text;

  return description; // e.g., "a person standing on a beach"
}

// Usage in React component
function UserImage({ imageUrl, userAltText }) {
  const [altText, setAltText] = useState(userAltText);

  useEffect(() => {
    if (!userAltText) {
      generateAltText(imageUrl).then(setAltText);
    }
  }, [imageUrl, userAltText]);

  return <img src={imageUrl} alt={altText || 'Loading description...'} />;
}
```

**8. Alt Text in CSS Background Images:**

CSS background images are invisible to screen readers:

```css
/* ❌ PROBLEM: Background image with important content */
.hero {
  background-image: url('hero-banner.jpg');
  height: 400px;
}
/* Screen reader: SILENT (no way to describe background image) */
```

```html
<!-- ✅ SOLUTION 1: Add visually-hidden text -->
<div class="hero">
  <span class="sr-only">
    Welcome to our website - featuring our latest product launch
  </span>
</div>

<!-- ✅ SOLUTION 2: Use role="img" with aria-label -->
<div
  class="hero"
  role="img"
  aria-label="Hero banner showing our new product launch">
</div>

<!-- ✅ SOLUTION 3: Use actual img element for important content -->
<div class="hero">
  <img
    src="hero-banner.jpg"
    alt="New product launch announcement"
    class="hero-image">
</div>
```

**9. Alt Text Testing Tools:**

Built-in browser tools and automated testing:

```javascript
// Automated alt text audit
function auditAltText() {
  const images = document.querySelectorAll('img');
  const issues = [];

  images.forEach((img, index) => {
    // Check for missing alt attribute
    if (!img.hasAttribute('alt')) {
      issues.push({
        element: img,
        issue: 'Missing alt attribute',
        severity: 'error'
      });
    }

    // Check for suspicious alt text
    const alt = img.getAttribute('alt');
    if (alt && (
      alt.toLowerCase().startsWith('image of') ||
      alt.toLowerCase().startsWith('picture of') ||
      alt === img.src.split('/').pop() // filename as alt
    )) {
      issues.push({
        element: img,
        issue: 'Suspicious alt text',
        severity: 'warning',
        suggestion: 'Describe the content/purpose, not the fact it\'s an image'
      });
    }

    // Check for overly long alt text
    if (alt && alt.length > 125) {
      issues.push({
        element: img,
        issue: 'Alt text too long (>125 chars)',
        severity: 'warning',
        suggestion: 'Consider using aria-describedby for detailed description'
      });
    }

    // Check decorative images in links/buttons
    const parent = img.parentElement;
    if ((parent.tagName === 'A' || parent.tagName === 'BUTTON') && alt === '') {
      issues.push({
        element: img,
        issue: 'Decorative image in interactive element',
        severity: 'error',
        suggestion: 'Functional images must have descriptive alt text'
      });
    }
  });

  return issues;
}

// Run audit
console.table(auditAltText());
```

**10. Screen Reader Navigation Modes:**

Understanding how users navigate images:

```html
<!-- Screen readers have multiple navigation modes -->

<!-- 1. Elements List (NVDA: Insert+F7, JAWS: Insert+F5) -->
<!-- Users can list ALL images on page and jump to them -->
<!-- Alt text appears in this list - make it meaningful! -->

<!-- 2. Graphics Navigation (G key in browse mode) -->
<!-- Users can jump between images using keyboard shortcuts -->
<!-- Each jump announces: "graphic, [alt text]" -->

<!-- 3. Link Navigation (Tab key or Links List) -->
<!-- Images in links are announced as: "link, graphic, [alt text]" -->

<!-- Example page structure for navigation -->
<main>
  <h1>Product Gallery</h1>

  <!-- User presses 'G' to jump between images -->
  <img src="product1.jpg" alt="Laptop - Model X1">
  <!-- Announces: "graphic, Laptop - Model X1" -->

  <img src="product2.jpg" alt="Tablet - Model T5">
  <!-- Announces: "graphic, Tablet - Model T5" -->

  <img src="decoration.svg" alt="" role="presentation">
  <!-- SKIPPED (decorative, not announced) -->

  <a href="/product3">
    <img src="product3.jpg" alt="Smartphone - Model S9">
  </a>
  <!-- Announces: "link, graphic, Smartphone - Model S9" -->
</main>
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: E-commerce Product Images Accessibility Audit</strong></summary>

**Scenario**: You're conducting an accessibility audit for a major e-commerce site with 50,000+ product listings. Screen reader users are reporting that they can't understand what products are being shown, navigation is confusing, and many images are announced as "graphic, [filename]" which provides no useful information. The company is facing potential ADA compliance issues and losing customers who rely on assistive technology.

**Production Metrics (Before Fix):**
- 73% of product images have missing or inadequate alt text
- Average alt text quality score: 42/100 (automated audit)
- Screen reader task completion rate: 38% (vs 94% for sighted users)
- ADA compliance complaints: 18/month
- Estimated lost revenue from accessibility issues: $120,000/year
- Page load impact: 500ms average delay due to large decorative images

**The Problem Code:**

```html
<!-- ❌ CRITICAL ISSUES: Product listing page -->

<!-- Issue 1: Missing alt text -->
<div class="product-card">
  <img src="/images/products/SKU-12345-001.jpg">
  <h3>Premium Wireless Headphones</h3>
  <p>$199.99</p>
</div>
<!-- Screen reader: "graphic, SKU-12345-001.jpg" (meaningless!) -->

<!-- Issue 2: Redundant alt text -->
<div class="product-card">
  <a href="/products/laptop-pro">
    <img src="laptop.jpg" alt="laptop">
    <h3>Laptop Pro 15"</h3>
  </a>
</div>
<!-- Screen reader: "link, graphic, laptop, Laptop Pro 15 inches" (redundant) -->

<!-- Issue 3: Decorative images with alt text -->
<div class="product-card">
  <img src="badge-new.png" alt="new product badge icon">
  <img src="product.jpg" alt="Product image">
  <h3>Smart Watch</h3>
</div>
<!-- Screen reader: "graphic, new product badge icon, graphic, Product image, ..." (noise) -->

<!-- Issue 4: Images of text without proper alt -->
<img src="sale-banner.png" alt="sale banner">
<!-- Actual text in image: "50% OFF - LIMITED TIME ONLY - USE CODE SAVE50" -->
<!-- User misses critical sale information! -->

<!-- Issue 5: Complex product images without context -->
<img src="shirt-product-shot.jpg" alt="shirt">
<!-- Missing: color, size, material, pattern - critical info for shopping decision -->

<!-- Issue 6: Icon buttons without text alternatives -->
<button class="wishlist-btn">
  <img src="heart-icon.svg">
</button>
<!-- Screen reader: "button, graphic, heart-icon.svg" (confusing!) -->
```

**Debugging Process:**

**Step 1: Automated Accessibility Scan**

```javascript
// Run automated audit using axe-core
import { axe } from 'axe-core';

async function auditProductImages() {
  const results = await axe.run({
    rules: ['image-alt', 'image-redundant-alt', 'link-name']
  });

  console.log('Violations found:', results.violations.length);

  results.violations.forEach(violation => {
    console.log(`
      Rule: ${violation.id}
      Impact: ${violation.impact}
      Nodes affected: ${violation.nodes.length}
      Help: ${violation.help}
    `);

    violation.nodes.forEach(node => {
      console.log('Element:', node.html);
      console.log('Recommendation:', node.failureSummary);
    });
  });
}

// Results:
// ❌ 2,847 images missing alt attribute
// ❌ 1,234 images with redundant alt text
// ❌ 456 linked images with inadequate alt text
// ❌ 789 decorative images with unnecessary alt text
```

**Step 2: Screen Reader Testing**

```javascript
// Manual testing checklist with NVDA/JAWS

// Test 1: Navigate product grid with 'G' key (Graphics navigation)
// Result: User hears 30+ images announced before finding desired product
// Problem: Decorative images are not hidden from screen reader

// Test 2: Browse products using Tab key
// Result: Image links announced as "link, graphic, [filename]" - no context
// Problem: Missing or poor alt text on linked product images

// Test 3: Use Elements List (NVDA: Insert+F7)
// Result: List shows 100+ images, most with meaningless descriptions
// Problem: Cannot efficiently browse images by description

// Test 4: Listen to product details page
// Result: Color, size, material not announced - critical shopping info missing
// Problem: Alt text doesn't include product attributes
```

**Step 3: Fix Implementation**

```html
<!-- ✅ FIXED: Product listing page with proper alt text -->

<!-- Fix 1: Descriptive alt text with product context -->
<div class="product-card">
  <a href="/products/wireless-headphones-pro">
    <img
      src="/images/products/SKU-12345-001.jpg"
      alt="Premium Wireless Headphones in black, over-ear style">
    <h3>Premium Wireless Headphones</h3>
    <p>$199.99</p>
  </a>
</div>
<!-- Screen reader: "link, graphic, Premium Wireless Headphones in black, over-ear style" -->
<!-- User now understands: product type, color, style -->

<!-- Fix 2: Remove redundancy by checking link content -->
<div class="product-card">
  <a href="/products/laptop-pro" aria-label="Laptop Pro 15 inch in silver">
    <img
      src="laptop.jpg"
      alt=""
      role="presentation">
    <!-- Image is decorative since link has text label -->
    <h3>Laptop Pro 15"</h3>
  </a>
</div>
<!-- Screen reader: "link, Laptop Pro 15 inch in silver" (clean, concise) -->

<!-- Fix 3: Hide decorative images, enhance product image alt -->
<div class="product-card">
  <img src="badge-new.png" alt="" role="presentation">
  <!-- Decorative badge hidden from screen reader -->

  <span class="sr-only">New product</span>
  <!-- Text alternative for "new" badge -->

  <img
    src="product.jpg"
    alt="Smart Watch with blue sport band, fitness tracking display">
  <h3>Smart Watch</h3>
</div>
<!-- Screen reader: "New product, graphic, Smart Watch with blue sport band, fitness tracking display" -->

<!-- Fix 4: Replace images of text with HTML text + CSS -->
<div class="sale-banner" role="region" aria-label="Special offer">
  <h2>50% OFF</h2>
  <p>Limited Time Only</p>
  <p>Use code: <strong>SAVE50</strong></p>
</div>
<!-- If image must be used: -->
<img
  src="sale-banner.png"
  alt="50% off limited time sale, use code SAVE50">
<!-- Screen reader announces ALL critical information -->

<!-- Fix 5: Comprehensive product alt text with attributes -->
<img
  src="shirt-product-shot.jpg"
  alt="Men's cotton t-shirt in navy blue, crew neck, size medium">
<!-- Includes: gender, material, color, style, size -->

<!-- Alternative: Use aria-describedby for extensive details -->
<img
  src="shirt-product-shot.jpg"
  alt="Men's cotton t-shirt in navy blue"
  aria-describedby="product-details-12345">

<div id="product-details-12345" class="sr-only">
  Crew neck style, 100% organic cotton, available in sizes S-XXL,
  machine washable, fair trade certified.
</div>

<!-- Fix 6: Icon buttons with accessible labels -->
<button
  class="wishlist-btn"
  aria-label="Add to wishlist">
  <img src="heart-icon.svg" alt="" role="presentation">
  <!-- Icon is decorative, button has aria-label -->
</button>

<!-- Alternative with visible text -->
<button class="wishlist-btn">
  <img src="heart-icon.svg" alt="" aria-hidden="true">
  <span>Add to Wishlist</span>
</button>
```

**Step 4: Implement Automated Alt Text Generation**

```javascript
// Product alt text generation utility

function generateProductAltText(product) {
  const parts = [];

  // Product type (required)
  if (product.type) parts.push(product.type);

  // Material (if relevant)
  if (product.material) parts.push(`in ${product.material}`);

  // Primary color (critical for shopping)
  if (product.color) parts.push(product.color);

  // Key feature or style
  if (product.style) parts.push(product.style);

  // Condition (new, refurbished, etc.)
  if (product.condition && product.condition !== 'new') {
    parts.push(product.condition);
  }

  // Combine with commas
  let altText = parts.join(', ');

  // Ensure length is under 125 characters
  if (altText.length > 125) {
    // Prioritize: type > color > style > material > condition
    altText = [product.type, product.color, product.style]
      .filter(Boolean)
      .join(', ')
      .substring(0, 122) + '...';
  }

  return altText;
}

// Example usage
const product = {
  type: "Men's running shoes",
  material: "mesh",
  color: "red and black",
  style: "lightweight athletic",
  condition: "new"
};

console.log(generateProductAltText(product));
// Output: "Men's running shoes in mesh, red and black, lightweight athletic"

// Apply to all products
document.querySelectorAll('.product-card img').forEach(img => {
  const productCard = img.closest('.product-card');
  const productData = JSON.parse(productCard.dataset.product);

  const altText = generateProductAltText(productData);
  img.setAttribute('alt', altText);
});
```

**Step 5: Quality Assurance Testing**

```javascript
// Alt text quality checker

function assessAltTextQuality(altText, context = {}) {
  const issues = [];
  let score = 100;

  // Check for missing alt
  if (altText === null || altText === undefined) {
    issues.push({ severity: 'critical', message: 'Missing alt attribute' });
    return { score: 0, issues };
  }

  // Check for empty alt (valid for decorative images)
  if (altText === '') {
    // Verify it's actually decorative
    if (context.isInLink || context.isInButton) {
      issues.push({
        severity: 'error',
        message: 'Functional image must have alt text'
      });
      score -= 100;
    }
    return { score, issues };
  }

  // Check for redundant phrases
  const redundantPhrases = [
    'image of', 'picture of', 'photo of', 'graphic of',
    'icon of', 'screenshot of', 'thumbnail of'
  ];

  if (redundantPhrases.some(phrase =>
    altText.toLowerCase().includes(phrase))) {
    issues.push({
      severity: 'warning',
      message: 'Contains redundant phrase (image of, picture of, etc.)'
    });
    score -= 20;
  }

  // Check for filename patterns
  if (/\.(jpg|jpeg|png|gif|svg|webp)/i.test(altText)) {
    issues.push({
      severity: 'error',
      message: 'Alt text appears to be a filename'
    });
    score -= 50;
  }

  // Check length
  if (altText.length > 125) {
    issues.push({
      severity: 'warning',
      message: `Alt text too long (${altText.length} chars). Consider aria-describedby`
    });
    score -= 15;
  }

  if (altText.length < 5) {
    issues.push({
      severity: 'warning',
      message: 'Alt text very short, may not be descriptive enough'
    });
    score -= 10;
  }

  // Check for generic descriptions
  const genericTerms = [
    'image', 'picture', 'photo', 'graphic', 'icon',
    'product', 'item', 'thing'
  ];

  if (genericTerms.includes(altText.toLowerCase().trim())) {
    issues.push({
      severity: 'error',
      message: 'Alt text is too generic'
    });
    score -= 60;
  }

  // Check for meaningful content (contains specific details)
  const hasColor = /\b(red|blue|green|black|white|yellow|purple|orange|pink|brown|gray|grey)\b/i.test(altText);
  const hasSize = /\b(small|medium|large|xl|xxl|\d+\s*(inch|cm|mm|ft))\b/i.test(altText);
  const hasMaterial = /\b(cotton|leather|metal|wood|plastic|glass|fabric)\b/i.test(altText);

  if (context.isProduct && !(hasColor || hasSize || hasMaterial)) {
    issues.push({
      severity: 'info',
      message: 'Product image could include more details (color, size, material)'
    });
    score -= 5;
  }

  return { score: Math.max(0, score), issues };
}

// Run quality assessment on all product images
function auditAllProductImages() {
  const productImages = document.querySelectorAll('.product-card img');
  const results = [];

  productImages.forEach(img => {
    const altText = img.getAttribute('alt');
    const isInLink = img.closest('a') !== null;
    const isInButton = img.closest('button') !== null;
    const isProduct = img.closest('.product-card') !== null;

    const assessment = assessAltTextQuality(altText, {
      isInLink,
      isInButton,
      isProduct
    });

    results.push({
      element: img,
      altText,
      score: assessment.score,
      issues: assessment.issues
    });
  });

  // Summary
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const criticalIssues = results.filter(r =>
    r.issues.some(i => i.severity === 'critical')
  ).length;

  console.log(`
    Alt Text Quality Report:
    ------------------------
    Total images: ${results.length}
    Average score: ${avgScore.toFixed(1)}/100
    Critical issues: ${criticalIssues}
    Needs improvement: ${results.filter(r => r.score < 70).length}
  `);

  return results;
}
```

**Production Metrics (After Fix):**

```javascript
// Before optimization:
// - 73% images with missing/poor alt text
// - Alt text quality score: 42/100
// - Screen reader task completion: 38%
// - ADA complaints: 18/month
// - Lost revenue: $120,000/year

// After optimization:
// - 96% images with proper alt text ✅
// - Alt text quality score: 89/100 (+112% improvement) ✅
// - Screen reader task completion: 87% (+129% improvement) ✅
// - ADA complaints: 1/month (94% reduction) ✅
// - Lost revenue: $12,000/year (90% reduction) ✅
// - Customer satisfaction (screen reader users): +156%
// - WCAG 2.1 Level AA compliance: PASSED ✅

// Additional benefits:
// - SEO improvement: +18% organic traffic from image search
// - Improved mobile experience (alt text shown while images load)
// - Better internationalization (alt text is translatable)
// - Reduced legal risk (ADA compliance)
```

**Key Lessons Learned:**

1. **Context is everything**: Same image needs different alt text in different contexts
2. **Be specific**: "Red leather handbag" > "handbag" > "product"
3. **Hide decorative content**: Use `alt=""` and `role="presentation"`
4. **Test with real users**: Automated tools catch only 30-50% of issues
5. **Automate where possible**: Generate alt text from product data
6. **Quality over quantity**: 100 good alt texts > 1000 poor ones

</details>

<details>
<summary><strong>⚖️ Trade-offs: Alt Text Length & Detail vs Conciseness</strong></summary>

**The Core Dilemma:**

How much detail should you include in alt text? Too little is unhelpful, too much is overwhelming.

| Approach | Pros | Cons | Use When |
|----------|------|------|----------|
| **Short alt (< 50 chars)** | Fast to hear, reduced cognitive load, works well for quick scanning | May miss important details, context-dependent | Simple images with one clear purpose |
| **Medium alt (50-125 chars)** | Balances detail with brevity, fits most screen reader limits | May still omit some context, requires careful word choice | Most product images, photos, simple diagrams |
| **Long alt + aria-describedby** | Comprehensive description, users can choose to hear more | Two-step process, more complex implementation | Complex diagrams, data visualizations, charts |
| **No alt (empty string)** | Reduces noise for decorative content, faster navigation | Requires correct judgment of what's decorative | Purely decorative images, redundant icons |

**Performance Comparison:**

```html
<!-- Scenario: E-commerce product grid with 100 products -->

<!-- Approach 1: Minimal alt text -->
<img src="product.jpg" alt="T-shirt">
<!-- Screen reader time: ~1 second per product -->
<!-- Time to scan 100 products: ~100 seconds -->
<!-- User experience: Fast but lacks critical info (color, style) -->

<!-- Approach 2: Detailed alt text -->
<img
  src="product.jpg"
  alt="Men's crew neck t-shirt in navy blue, 100% organic cotton, relaxed fit, available in sizes S-XXL">
<!-- Screen reader time: ~4 seconds per product -->
<!-- Time to scan 100 products: ~400 seconds (6.7 minutes!) -->
<!-- User experience: Comprehensive but slow and overwhelming -->

<!-- Approach 3: Balanced alt text -->
<img
  src="product.jpg"
  alt="Navy blue crew neck t-shirt, cotton, relaxed fit">
<!-- Screen reader time: ~2 seconds per product -->
<!-- Time to scan 100 products: ~200 seconds (3.3 minutes) -->
<!-- User experience: Good balance of speed and detail ✅ -->

<!-- Approach 4: Short alt + optional detailed description -->
<img
  src="product.jpg"
  alt="Navy blue cotton t-shirt"
  aria-describedby="product-details-123">

<div id="product-details-123" class="sr-only">
  Men's crew neck style, 100% organic cotton, relaxed fit,
  machine washable, fair trade certified, available in sizes S-XXL
</div>
<!-- Screen reader time: ~2 seconds by default (can choose to hear more) -->
<!-- User experience: Fast by default, detailed on demand ✅✅ -->
```

**Decision Matrix:**

```javascript
function determineAltTextStrategy(image) {
  // Check image purpose
  const purpose = image.dataset.purpose;

  if (purpose === 'decorative') {
    return { alt: '', describedby: null };
  }

  if (purpose === 'functional') {
    // Buttons, links - describe action
    return {
      alt: image.dataset.action || 'Click for more',
      describedby: null
    };
  }

  if (purpose === 'informative') {
    // Product images, photos - include key details
    const details = {
      type: image.dataset.productType,
      color: image.dataset.color,
      material: image.dataset.material,
      style: image.dataset.style
    };

    const shortAlt = [details.type, details.color]
      .filter(Boolean)
      .join(' ');

    const longDesc = Object.values(details)
      .filter(Boolean)
      .join(', ');

    // If detailed description is substantially longer, use aria-describedby
    if (longDesc.length > 125) {
      return { alt: shortAlt, describedby: generateDescId(longDesc) };
    }

    return { alt: longDesc, describedby: null };
  }

  if (purpose === 'complex') {
    // Charts, diagrams - short alt + long description
    return {
      alt: image.dataset.summary || 'Data visualization',
      describedby: image.dataset.detailsId || generateChartDescription(image)
    };
  }
}
```

**Memory & Performance Trade-offs:**

```javascript
// Test: Page with 500 product images

// Approach 1: All images have 200-character alt text
// DOM size: ~100KB additional (200 chars × 500 images)
// Parse time: +15ms
// Screen reader buffer size: Large (may impact performance)

// Approach 2: Images have 50-character alt + aria-describedby
// DOM size: ~125KB (50 chars × 500 + hidden divs with details)
// Parse time: +18ms
// Screen reader buffer size: Normal (details loaded on demand)

// Approach 3: Dynamic alt text generation (fetch on focus)
// DOM size: ~25KB (50 chars × 500, details fetched via API)
// Parse time: +5ms
// Network requests: 1-10 (only for focused images)
// User experience: Slight delay for detailed description

// Winner: Approach 2 (balanced DOM size + immediate availability)
```

**SEO vs Accessibility Trade-offs:**

```html
<!-- SEO wants: Detailed, keyword-rich alt text -->
<img
  src="luxury-watch.jpg"
  alt="Luxury Swiss automatic watch for men with stainless steel band and sapphire crystal, waterproof to 100m, perfect gift for anniversaries and special occasions">
<!-- Good for SEO (keywords: luxury, Swiss, automatic, men, gift, anniversary) -->
<!-- BAD for accessibility (too long, keyword stuffing obvious) -->

<!-- Accessibility wants: Concise, meaningful description -->
<img
  src="luxury-watch.jpg"
  alt="Swiss automatic watch, stainless steel">
<!-- Good for accessibility (concise, informative) -->
<!-- Less ideal for SEO (fewer keywords) -->

<!-- Balanced approach: -->
<img
  src="luxury-watch.jpg"
  alt="Men's Swiss automatic watch with steel band"
  aria-describedby="watch-details">

<div id="watch-details" class="sr-only">
  Sapphire crystal face, waterproof to 100 meters,
  suitable for anniversaries and special occasions
</div>

<!-- Add schema.org structured data for SEO -->
<script type="application/ld+json">
{
  "@type": "Product",
  "name": "Men's Swiss Automatic Watch",
  "description": "Luxury Swiss automatic watch with stainless steel band and sapphire crystal",
  "keywords": "luxury watch, Swiss watch, automatic movement, men's accessories"
}
</script>
<!-- Result: Accessible alt text + SEO benefits from structured data ✅ -->
```

**Internationalization Trade-offs:**

```html
<!-- Challenge: Alt text must be translated -->

<!-- Approach 1: Hardcoded alt text (requires manual translation) -->
<img src="product.jpg" alt="Red leather handbag">
<!-- Translation cost: High (manual per language) -->
<!-- Consistency: Low (translation errors possible) -->

<!-- Approach 2: Generated from data (automatic translation) -->
<img
  src="product.jpg"
  :alt="$t('product.alt', { color: product.color, material: product.material, type: product.type })">
<!-- i18n template: "{color} {material} {type}" -->
<!-- Translation cost: Low (one template, reused) -->
<!-- Consistency: High (automated) -->
<!-- Flexibility: Medium (limited by template structure) -->

<!-- Approach 3: AI-generated per language -->
<img src="product.jpg" :alt="generateLocalizedAlt(product, currentLocale)">
<!-- Translation cost: Medium (AI API calls) -->
<!-- Consistency: Medium (AI variation) -->
<!-- Flexibility: High (natural language per locale) -->
```

**Recommendation Matrix:**

| Image Type | Recommended Strategy | Example |
|------------|---------------------|---------|
| Simple icon | Short alt (< 30 chars) | "Search" |
| Product photo | Medium alt (50-100 chars) | "Blue denim jeans, straight leg, size 32" |
| Complex chart | Short alt + aria-describedby | alt="Sales growth 2024" + detailed description |
| Decorative | Empty alt (`alt=""`) | `<img src="divider.png" alt="">` |
| Logo in nav | Function-focused alt | "Return to homepage" |
| Infographic | Short alt + link to text version | alt="User journey map" + link to /user-journey-text |

</details>

<details>
<summary><strong>💬 Explain to Junior: Alternative Text for Images</strong></summary>

**Simple Explanation:**

Imagine you're describing a photo to a friend over the phone. You wouldn't say:

❌ "It's a picture" (too vague)
❌ "It's a rectangular digital photograph showing a visual representation of..." (too technical)

You'd say:

✅ "It's a golden retriever puppy playing with a tennis ball"

That's exactly what alt text is - **describing an image to someone who can't see it**.

**Why It Matters:**

Three types of people rely on alt text:

1. **Screen reader users** (blind or visually impaired)
   - Can't see the image at all
   - Screen reader reads alt text aloud

2. **People with slow internet** (image hasn't loaded yet)
   - See alt text while waiting for image to download

3. **Search engines** (Google, Bing)
   - Can't "see" images, read alt text to understand content

**The Simple Rules:**

```html
<!-- 1. Describe what the image SHOWS, not what it IS -->
❌ <img src="dog.jpg" alt="image">
✅ <img src="dog.jpg" alt="Golden retriever puppy">

<!-- 2. Don't say "image of" or "picture of" -->
❌ <img src="sunset.jpg" alt="picture of a sunset">
✅ <img src="sunset.jpg" alt="Sunset over the ocean">

<!-- 3. Keep it short (like a tweet - under 125 characters) -->
❌ <img src="product.jpg" alt="This is a really nice product that we are selling which is available in multiple colors and sizes and can be purchased on our website">
✅ <img src="product.jpg" alt="Blue cotton t-shirt, size M">

<!-- 4. If image is just decoration, use empty alt -->
❌ <img src="decorative-line.png" alt="horizontal line separator">
✅ <img src="decorative-line.png" alt="">

<!-- 5. For buttons/links, describe what clicking DOES -->
❌ <button><img src="trash.svg" alt="trash can icon"></button>
✅ <button><img src="trash.svg" alt="Delete item"></button>
```

**Real-World Example:**

```html
<!-- Imagine you're selling shoes online -->

<!-- ❌ BAD alt text: -->
<img src="shoe-001.jpg" alt="shoe">
<!-- Screen reader user thinks: "Okay, it's a shoe... but what kind? What color? Is it for men or women?" -->

<!-- ✅ GOOD alt text: -->
<img src="shoe-001.jpg" alt="Women's running shoe, white with pink accents">
<!-- Screen reader user thinks: "Perfect! I'm looking for women's running shoes, and I like white. Let me click to see more!" -->
```

**The Phone Call Test:**

When writing alt text, imagine describing the image to someone on the phone:

```html
<!-- Product page image -->
<img src="laptop.jpg" alt="???">

<!-- On the phone, you'd say: -->
"It's a silver laptop, probably 13 inches, with the lid open showing the screen"

<!-- That's your alt text! -->
<img src="laptop.jpg" alt="Silver 13-inch laptop with open lid">
```

**Common Mistakes Juniors Make:**

```html
<!-- ❌ MISTAKE 1: Using the filename -->
<img src="IMG_20240315_001.jpg" alt="IMG_20240315_001.jpg">
<!-- Nobody cares about the filename! Describe what's IN the image. -->

<!-- ❌ MISTAKE 2: Being too technical -->
<img src="graph.png" alt="A bar chart with blue bars representing data points">
<!-- Just tell me what the data MEANS! -->
✅ <img src="graph.png" alt="Sales increased 25% in Q4">

<!-- ❌ MISTAKE 3: Forgetting alt attribute completely -->
<img src="important-info.jpg">
<!-- Screen reader says: "graphic, important-info.jpg" - useless! -->

<!-- ❌ MISTAKE 4: Writing a novel -->
<img src="team.jpg" alt="This is a photo of our team taken at the annual company retreat in 2024 where we all gathered together to celebrate our achievements and plan for the future while enjoying beautiful weather and great food">
<!-- TOO LONG! Screen reader users will get bored. -->
✅ <img src="team.jpg" alt="Company team at 2024 annual retreat">
```

**Quick Decision Tree:**

```
Is the image important to understanding the content?
├─ YES → Write descriptive alt text
│   └─ "Blue cotton t-shirt"
│
└─ NO → Is it just decoration?
    ├─ YES → Use empty alt: alt=""
    │   └─ <img src="decoration.png" alt="">
    │
    └─ NO → Is it inside a link/button?
        ├─ YES → Describe what clicking does
        │   └─ <img src="icon.svg" alt="Go to homepage">
        │
        └─ NO → When in doubt, describe it!
            └─ <img src="photo.jpg" alt="Sunset over mountains">
```

**Analogy for a PM:**

"Alt text is like a product description for an image. If you were selling a product on a website, you wouldn't just say 'product' - you'd say 'Blue wireless headphones with noise cancellation.' Alt text is the same - give enough detail for someone to understand and make a decision without seeing the image."

**Practice Exercise:**

```html
<!-- Try writing alt text for these: -->

<!-- 1. Company logo at top of page (links to homepage) -->
<a href="/">
  <img src="logo.svg" alt="???">
</a>
<!-- Answer: "Company name homepage" or "Return to homepage" -->

<!-- 2. Decorative icon next to "New!" text -->
<span>
  <img src="star.svg" alt="???"> New!
</span>
<!-- Answer: alt="" (decorative, text already says "New!") -->

<!-- 3. Product photo on e-commerce site -->
<img src="dress.jpg" alt="???">
<!-- Answer: "Red evening dress, knee-length, size 8" -->
```

**Remember:**
- Alt text = describing to a friend on the phone
- Short and sweet (< 125 characters)
- Meaningful, not technical
- Empty (`alt=""`) for decoration
- Action-focused for buttons/links

</details>

### Common Mistakes

❌ **Wrong**: No alt attribute
```html
<img src="important.jpg">
```

✅ **Correct**: Always include alt attribute
```html
<img src="important.jpg" alt="Descriptive text">
<!-- Or empty for decorative: -->
<img src="decoration.png" alt="">
```

❌ **Wrong**: Redundant phrasing
```html
<img src="sunset.jpg" alt="Image of a sunset over the ocean">
```

✅ **Correct**: Direct description
```html
<img src="sunset.jpg" alt="Sunset over the ocean">
```

❌ **Wrong**: Using title instead of alt
```html
<img src="product.jpg" title="Blue shirt">
```

✅ **Correct**: Use alt (title is supplementary)
```html
<img src="product.jpg" alt="Blue cotton shirt, size M" title="Click to enlarge">
```

### Follow-up Questions

1. How do you handle images with text embedded in them?
2. What's the difference between `alt`, `title`, and `aria-label`?
3. When should you use `aria-describedby` instead of long alt text?
4. How do you make SVG images accessible?
5. What's the best approach for image galleries with many similar images?

### Resources

- [WebAIM: Alternative Text](https://webaim.org/techniques/alttext/)
- [W3C: Alt Decision Tree](https://www.w3.org/WAI/tutorials/images/decision-tree/)
- [MDN: HTML img element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#accessibility_concerns)

---

## Question 2: How do you handle decorative vs informative images?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** Microsoft, Google, Amazon, Apple

### Question
Explain the difference between decorative and informative images, and how to mark them appropriately for screen readers.

### Answer

**Decorative images** add visual style but don't convey meaningful content. They should be hidden from screen readers.

**Informative images** provide content or functionality essential to understanding the page. They require descriptive alt text.

**The Key Decision:**
> If removing the image would cause a loss of information or functionality, it's informative. Otherwise, it's decorative.

### Code Example

**Decorative Images:**

```html
<!-- ✅ Method 1: Empty alt attribute -->
<img src="decorative-border.png" alt="">
<!-- Screen reader: SILENT (skips image) -->

<!-- ✅ Method 2: role="presentation" -->
<img src="divider-line.svg" alt="" role="presentation">
<!-- Explicitly marks as decorative -->

<!-- ✅ Method 3: aria-hidden="true" -->
<img src="background-pattern.png" alt="" aria-hidden="true">
<!-- Hides from accessibility tree -->

<!-- ✅ Method 4: CSS background images (automatically hidden) -->
<div class="hero" style="background-image: url('hero-bg.jpg')">
  <h1>Welcome</h1>
</div>
<!-- Screen reader: Only reads "Welcome" -->

<!-- Examples of decorative images: -->
<ul>
  <li>
    <img src="bullet-point-icon.svg" alt="" role="presentation">
    List item text
  </li>
</ul>

<!-- Decorative icon next to text -->
<h2>
  <img src="star-icon.svg" alt="" aria-hidden="true">
  Featured Products
</h2>

<!-- Decorative separator -->
<img src="separator-line.png" alt="" role="presentation">

<!-- Purely aesthetic images -->
<div class="card">
  <img src="gradient-bg.png" alt="" role="presentation">
  <p>Card content</p>
</div>
```

**Informative Images:**

```html
<!-- ✅ Informative: Provides content -->
<img src="chart-q4-sales.png" alt="Q4 sales increased 35% compared to Q3">
<!-- Screen reader: "graphic, Q4 sales increased 35% compared to Q3" -->

<!-- ✅ Informative: Functional (in link) -->
<a href="/products">
  <img src="product-icon.svg" alt="View all products">
</a>
<!-- Screen reader: "link, graphic, View all products" -->

<!-- ✅ Informative: Conveys meaning -->
<img src="error-icon.svg" alt="Error">
<p>Your session has expired.</p>
<!-- Icon provides important status information -->

<!-- ✅ Informative: Replaces text -->
<img src="logo-with-text.png" alt="Acme Corporation">
<!-- Logo contains company name as text -->
```

**Edge Cases & Context-Dependent:**

```html
<!-- Same image, different contexts -->

<!-- Context 1: DECORATIVE (text provides all info) -->
<button>
  <img src="download-icon.svg" alt="" aria-hidden="true">
  Download Report
</button>
<!-- Text says "Download Report", icon is redundant -->

<!-- Context 2: INFORMATIVE (icon is only indicator) -->
<button aria-label="Download report">
  <img src="download-icon.svg" alt="Download">
</button>
<!-- No visible text, icon must have alt text -->

<!-- Context 3: Icon in data table (INFORMATIVE) -->
<table>
  <tr>
    <td>John Doe</td>
    <td><img src="checkmark.svg" alt="Active"></td>
    <td><img src="x-mark.svg" alt="Inactive"></td>
  </tr>
</table>
<!-- Icons convey status, must have alt text -->

<!-- Context 4: Icon in legend (DECORATIVE) -->
<ul class="legend">
  <li>
    <img src="checkmark.svg" alt="" role="presentation">
    <span>Active</span>
  </li>
  <li>
    <img src="x-mark.svg" alt="" role="presentation">
    <span>Inactive</span>
  </li>
</ul>
<!-- Text provides meaning, icons are visual reinforcement -->
```

**Complex Scenarios:**

```html
<!-- Scenario 1: Logo as decoration vs branding -->

<!-- ❌ WRONG: Logo in navigation (should be informative) -->
<nav>
  <a href="/">
    <img src="logo.svg" alt="" role="presentation">
  </a>
</nav>
<!-- User can't navigate home! -->

<!-- ✅ CORRECT: Logo as functional link -->
<nav>
  <a href="/" aria-label="Return to homepage">
    <img src="logo.svg" alt="Company name logo">
  </a>
</nav>

<!-- Scenario 2: Social media icons -->

<!-- ❌ WRONG: Decorative treatment -->
<div class="social-links">
  <a href="https://twitter.com/company">
    <img src="twitter.svg" alt="">
  </a>
</div>
<!-- User doesn't know where link goes! -->

<!-- ✅ CORRECT: Informative alt text -->
<div class="social-links">
  <a href="https://twitter.com/company">
    <img src="twitter.svg" alt="Follow us on Twitter">
  </a>
</div>

<!-- Scenario 3: User avatars -->

<!-- Profile page (INFORMATIVE) -->
<img src="user-avatar.jpg" alt="Profile picture of John Doe">

<!-- Comment section (DECORATIVE if name is adjacent) -->
<div class="comment">
  <img src="user-avatar.jpg" alt="" role="presentation">
  <span class="username">John Doe</span>
  <p>Comment text...</p>
</div>
<!-- Name is already in text, avatar is decorative -->

<!-- User list (INFORMATIVE if no text) -->
<ul class="user-grid">
  <li>
    <a href="/users/johndoe">
      <img src="user-avatar.jpg" alt="John Doe">
    </a>
  </li>
</ul>
<!-- Avatar is the only way to identify user -->
```

**Testing Decorative vs Informative:**

```html
<!-- Use this decision matrix: -->

<!-- Question 1: Is there text that conveys the same info? -->
<button>
  <img src="save-icon.svg" alt="???">
  Save Changes
</button>
<!-- Answer: YES (button text says "Save Changes") -->
<!-- Conclusion: Icon is DECORATIVE, use alt="" -->

<!-- Question 2: Would removing the image lose information? -->
<div class="status">
  <img src="warning-icon.svg" alt="???">
  <p>Your payment is overdue</p>
</div>
<!-- Answer: YES (icon indicates warning level/severity) -->
<!-- Conclusion: Icon is INFORMATIVE, use alt="Warning" -->

<!-- Question 3: Is the image inside a link or button? -->
<a href="/settings">
  <img src="gear-icon.svg" alt="???">
</a>
<!-- Answer: YES, and no other text -->
<!-- Conclusion: Icon is INFORMATIVE, use alt="Settings" or aria-label on link -->

<!-- Question 4: Does the image convey data or structure? -->
<img src="org-chart.png" alt="???">
<!-- Answer: YES (shows organizational hierarchy) -->
<!-- Conclusion: INFORMATIVE, use descriptive alt + aria-describedby for details -->
```

**CSS Background Images (Always Decorative):**

```html
<!-- Background images are NEVER accessible to screen readers -->
<!-- Only use for decorative content -->

<!-- ✅ GOOD: Decorative hero background -->
<div class="hero" style="background-image: url('hero-bg.jpg')">
  <h1>Welcome to Our Site</h1>
  <p>Important content in HTML text</p>
</div>

<!-- ❌ BAD: Important content as background image -->
<div class="announcement" style="background-image: url('sale-50-percent-off.png')">
  <!-- No text alternative! Screen reader users miss the sale! -->
</div>

<!-- ✅ FIXED: Use img or HTML text -->
<div class="announcement">
  <img src="sale-badge.png" alt="50% off sale">
  <p>50% off all items - use code SAVE50</p>
</div>
```

<details>
<summary><strong>🔍 Deep Dive: Decorative Image Detection Algorithms & Screen Reader Heuristics</strong></summary>

**How Screen Readers Determine If an Image Is Decorative:**

Modern screen readers use sophisticated algorithms to decide whether to announce an image. Understanding this helps developers make better accessibility decisions.

**Algorithm Decision Tree (NVDA/JAWS/VoiceOver):**

```javascript
// Simplified representation of screen reader logic

function shouldAnnounceImage(imgElement) {
  // Step 1: Check explicit decorative markers
  if (imgElement.getAttribute('role') === 'presentation' ||
      imgElement.getAttribute('role') === 'none') {
    return false; // Explicitly decorative
  }

  if (imgElement.getAttribute('aria-hidden') === 'true') {
    return false; // Hidden from accessibility tree
  }

  // Step 2: Check alt attribute
  const alt = imgElement.getAttribute('alt');

  if (alt === null) {
    // Missing alt - BAD PRACTICE
    // Screen readers announce filename as fallback
    return true; // Announces: "graphic, [filename]"
  }

  if (alt === '') {
    // Empty alt - explicitly decorative
    return false; // SILENT (correct behavior)
  }

  // Step 3: Check context (is image functional?)
  const parent = imgElement.parentElement;

  if (parent.tagName === 'A' || parent.tagName === 'BUTTON') {
    // Image inside interactive element

    // Check if there's other accessible text
    const hasTextContent = parent.textContent.trim().length > 0;
    const hasAriaLabel = parent.hasAttribute('aria-label') ||
                         parent.hasAttribute('aria-labelledby');

    if (!hasTextContent && !hasAriaLabel && alt === '') {
      // ERROR: Interactive element with no accessible name!
      console.warn('Functional image must have alt text or parent needs aria-label');
      return true; // Announces filename as fallback
    }

    if (hasTextContent || hasAriaLabel) {
      // Parent has accessible name
      if (alt === '') {
        return false; // Icon is decorative, skip it
      }
      // Both image and parent have text - may be redundant
      return true; // Announces alt text
    }
  }

  // Step 4: Check dimensions
  const width = imgElement.width || imgElement.naturalWidth;
  const height = imgElement.height || imgElement.naturalHeight;

  if (width < 5 || height < 5) {
    // Likely a tracking pixel or spacer
    if (alt === '') {
      return false; // SILENT
    }
    // Has alt text but tiny size - suspicious
    console.warn('Tiny image with alt text - may be incorrectly marked as informative');
  }

  // Step 5: Default behavior - announce image
  return true; // Announces: "graphic, [alt text]"
}

// Example usage
const img = document.querySelector('img');
console.log('Should announce:', shouldAnnounceImage(img));
```

**Screen Reader Heuristics for Context:**

Different screen readers use various heuristics to improve UX by detecting common patterns:

```html
<!-- Pattern 1: Icon + Text (Common Button Pattern) -->
<button>
  <img src="trash.svg" alt="Delete">
  Delete Item
</button>

<!-- NVDA behavior: -->
<!-- Announces: "Delete Item, button, graphic, Delete" -->
<!-- Redundant! User hears "Delete" twice -->

<!-- JAWS behavior: -->
<!-- Announces: "Delete Item, button" (may skip icon if redundant) -->
<!-- Smarter - detects redundancy -->

<!-- VoiceOver behavior: -->
<!-- Announces: "Delete Item, button" (skips alt if matches text) -->

<!-- BEST PRACTICE: Mark icon as decorative to avoid redundancy -->
<button>
  <img src="trash.svg" alt="" aria-hidden="true">
  Delete Item
</button>
<!-- All screen readers: "Delete Item, button" ✅ -->

<!-- Pattern 2: Adjacent Icon + Text (List Items) -->
<ul class="status-list">
  <li>
    <img src="checkmark.svg" alt="Complete">
    Task 1 - Complete
  </li>
</ul>

<!-- Problem: "Complete" announced twice -->
<!-- JAWS/NVDA: "Complete, Task 1 - Complete" -->

<!-- Solution 1: Make icon decorative -->
<li>
  <img src="checkmark.svg" alt="" role="presentation">
  Task 1 - Complete
</li>
<!-- Announces: "Task 1 - Complete" ✅ -->

<!-- Solution 2: Use aria-hidden if status is in text -->
<li>
  <img src="checkmark.svg" alt="Complete" aria-hidden="true">
  <span class="sr-only">Status:</span> Complete - Task 1
</li>
<!-- Announces: "Status: Complete - Task 1" ✅ -->

<!-- Pattern 3: Data Table Icons -->
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email Verified</th>
      <th>Account Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td><img src="checkmark.svg" alt="Verified"></td>
      <td><img src="active-badge.svg" alt="Active"></td>
    </tr>
  </tbody>
</table>

<!-- Screen reader (table navigation mode): -->
<!-- Column 1: "John Doe" -->
<!-- Column 2: "graphic, Verified" ✅ (informative - conveys data) -->
<!-- Column 3: "graphic, Active" ✅ (informative - conveys data) -->

<!-- Icons in tables are usually INFORMATIVE (convey cell data) -->
```

**Automatic Decorative Detection (Browser/AT Heuristics):**

Some browsers and assistive technologies attempt to detect decorative images automatically:

```javascript
// Chrome Accessibility Tree - Decorative Detection

function chromeAccessibilityTreeLogic(img) {
  // Chrome marks image as "ignored" in accessibility tree if:

  // 1. alt="" (explicit decorative)
  if (img.alt === '') return 'IGNORED';

  // 2. role="presentation" or role="none"
  if (['presentation', 'none'].includes(img.role)) return 'IGNORED';

  // 3. aria-hidden="true"
  if (img.ariaHidden === 'true') return 'IGNORED';

  // 4. CSS: display:none or visibility:hidden
  const style = getComputedStyle(img);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return 'IGNORED';
  }

  // 5. Tiny dimensions (< 5px)
  if (img.clientWidth < 5 || img.clientHeight < 5) {
    // Likely tracking pixel
    if (img.alt === '') return 'IGNORED';
    // Has alt text - probably incorrect usage
    console.warn('Tiny image with alt text:', img);
  }

  // 6. Inside <picture> element (only <img> fallback is exposed)
  if (img.closest('picture')) {
    // Only the <img> element is in accessibility tree
    // <source> elements are ignored
  }

  // Otherwise, image is in accessibility tree
  return 'INCLUDED';
}
```

**Machine Learning Approaches (Emerging):**

Modern browsers are experimenting with ML to detect decorative images:

```javascript
// Experimental: Chrome's AutoML for Decorative Image Detection
// (Not yet in production, but research direction)

async function detectDecorativeImageML(imgElement) {
  // Features extracted from image and context
  const features = {
    // Visual features
    aspectRatio: imgElement.width / imgElement.height,
    fileSize: await getFileSize(imgElement.src),
    hasTransparency: await checkTransparency(imgElement.src),
    colorCount: await analyzeColorPalette(imgElement.src),

    // Contextual features
    inLink: imgElement.closest('a') !== null,
    inButton: imgElement.closest('button') !== null,
    hasAdjacentText: hasTextNearby(imgElement, 50), // within 50px

    // Semantic features (from alt text NLP)
    altTextLength: imgElement.alt.length,
    altContainsActionWords: /click|view|open|go|visit/i.test(imgElement.alt),
    altMatchesNearbyText: altMatchesNearbyText(imgElement),

    // Structural features
    cssClasses: Array.from(imgElement.classList),
    isBackgroundStyled: hasBackgroundStyling(imgElement.parentElement),

    // Common decorative patterns
    filenamePatterns: /icon|decoration|border|divider|spacer|bullet/i.test(imgElement.src),
    commonDecorativeSize: [1, 10, 16, 24, 32, 48].includes(imgElement.width)
  };

  // ML model prediction
  const predictionScore = await ml.predict(features);

  // Score > 0.8 = likely decorative
  // Score < 0.2 = likely informative
  // Score 0.2-0.8 = uncertain (use developer's markup)

  return {
    score: predictionScore,
    confidence: Math.abs(predictionScore - 0.5) * 2,
    suggestion: predictionScore > 0.8
      ? 'Consider adding role="presentation"'
      : predictionScore < 0.2
      ? 'Ensure alt text is descriptive'
      : 'Uncertain - manual review recommended'
  };
}

// Example usage
const img = document.querySelector('img.icon');
const analysis = await detectDecorativeImageML(img);

console.log(`
  Decorative score: ${analysis.score.toFixed(2)}
  Confidence: ${(analysis.confidence * 100).toFixed(0)}%
  Suggestion: ${analysis.suggestion}
`);

// Output example:
// Decorative score: 0.92
// Confidence: 84%
// Suggestion: Consider adding role="presentation"
```

**Performance Impact of Decorative Image Handling:**

```javascript
// Test: Page with 200 images (100 decorative, 100 informative)

// Scenario 1: All images marked with alt text (no decorative markers)
// Screen reader announces: 200 images
// Time to navigate page: ~120 seconds
// Cognitive load: HIGH (user must process 200 image announcements)

// Scenario 2: Decorative images marked with alt=""
// Screen reader announces: 100 images (50% reduction)
// Time to navigate page: ~60 seconds (50% faster)
// Cognitive load: MEDIUM (still processes 100 announcements)

// Scenario 3: Decorative images with role="presentation"
// Screen reader announces: 100 images
// Time to navigate page: ~60 seconds
// Cognitive load: MEDIUM
// Accessibility tree size: 50% smaller (better performance)

// Scenario 4: Decorative images with aria-hidden="true"
// Screen reader announces: 100 images
// Time to navigate page: ~60 seconds
// Cognitive load: MEDIUM
// Accessibility tree size: 50% smaller
// Bonus: Removed from all AT (not just screen readers)

// Benchmark: Accessibility tree construction time
console.time('Build accessibility tree');

// Without decorative markers
document.querySelectorAll('img').forEach(img => {
  // Browser creates AXNode for each image
  // Cost: ~0.5ms per image
});
// Time: ~100ms for 200 images

console.timeEnd('Build accessibility tree');

// With decorative markers (role="presentation")
document.querySelectorAll('img[role="presentation"]').forEach(img => {
  // Browser skips AXNode creation (marked as ignored)
  // Cost: ~0.1ms per image (just to check role)
});
// Time: ~30ms for 200 images (70% faster!)
```

**Advanced: CSS-Generated Content & Decorative Images:**

```css
/* CSS-generated images via ::before/::after */

/* Example 1: Icon via CSS (automatically decorative) */
.icon-checkmark::before {
  content: url('checkmark.svg');
}
/* Screen reader: SILENT (CSS content is decorative by default) */

/* Problem: Can't add alt text to CSS content! */
/* Solution: Use aria-label on element */
.status.complete::before {
  content: url('checkmark.svg');
}

<span class="status complete" aria-label="Complete">
  Task 1
</span>
/* Screen reader: "Complete, Task 1" */

/* Example 2: Background image via CSS */
.hero {
  background-image: url('hero-banner.jpg');
  background-size: cover;
}
/* Screen reader: SILENT (background images are never announced) */

/* If background image is informative, must add text alternative */
.hero[role="img"][aria-label="Hero banner showing product launch"] {
  background-image: url('hero-banner.jpg');
}
/* Screen reader: "image, Hero banner showing product launch" */
```

**Testing Tools for Decorative Detection:**

```javascript
// Automated test: Check if decorative images are properly marked

function auditDecorativeImages() {
  const images = document.querySelectorAll('img');
  const issues = [];

  images.forEach(img => {
    const isMarkedDecorative =
      img.alt === '' ||
      img.role === 'presentation' ||
      img.role === 'none' ||
      img.ariaHidden === 'true';

    // Check if image appears decorative (heuristics)
    const seemsDecorative =
      img.width < 20 && img.height < 20 || // Tiny icon
      /icon|decoration|border|divider|spacer/i.test(img.src) || // Filename
      /icon|decoration|border|divider/i.test(img.className); // Class name

    if (seemsDecorative && !isMarkedDecorative && img.alt) {
      issues.push({
        element: img,
        issue: 'Appears decorative but has alt text',
        suggestion: 'Consider using alt="" or role="presentation"'
      });
    }

    // Check functional images (in links/buttons)
    const inInteractive = img.closest('a, button');
    if (inInteractive) {
      const hasAccessibleName =
        inInteractive.textContent.trim() ||
        inInteractive.hasAttribute('aria-label') ||
        inInteractive.hasAttribute('aria-labelledby');

      if (!hasAccessibleName && isMarkedDecorative) {
        issues.push({
          element: img,
          issue: 'Functional image marked as decorative',
          severity: 'CRITICAL',
          suggestion: 'Add alt text or aria-label to parent element'
        });
      }
    }
  });

  return issues;
}

// Run audit
console.table(auditDecorativeImages());
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Over-Accessible Blog Platform</strong></summary>

**Scenario**: You're debugging a popular blogging platform where authors are complaining that their articles are "too long" when read by screen readers. User testing reveals that screen reader users are taking 3x longer to read articles compared to sighted users. Analysis shows the issue: every single image, including hundreds of decorative icons, bullets, and dividers, is being announced with alt text, creating an overwhelming amount of noise.

**Production Metrics (Before Fix):**
- Average article word count: 1,500 words
- Average decorative images per article: 45 images
- Screen reader reading time: 18 minutes (vs 6 minutes for sighted readers)
- User frustration score: 8.2/10 (very high)
- Screen reader user bounce rate: 67% (users give up mid-article)
- Accessibility complaints: 34/month ("too many images being announced")

**The Problem Code:**

```html
<!-- ❌ CRITICAL ISSUE: All images have alt text, even decorative ones -->

<article class="blog-post">
  <h1>
    <img src="star-icon.svg" alt="featured icon">
    10 Tips for Better Web Development
  </h1>
  <!-- Screen reader: "graphic, featured icon, heading level 1, 10 Tips..." -->
  <!-- User hears "featured icon" which adds no value -->

  <img src="divider-line.png" alt="decorative line separator">
  <!-- Screen reader: "graphic, decorative line separator" -->
  <!-- Ironic: alt text says "decorative" but image isn't marked as such! -->

  <h2>
    <img src="tip-number-1.svg" alt="tip number 1 icon">
    Tip #1: Write Semantic HTML
  </h2>
  <!-- Screen reader: "graphic, tip number 1 icon, heading level 2, Tip #1..." -->
  <!-- Redundant: icon shows "1", heading already says "Tip #1" -->

  <p>
    <img src="quote-start.svg" alt="opening quote mark">
    Semantic HTML is crucial for accessibility.
    <img src="quote-end.svg" alt="closing quote mark">
  </p>
  <!-- Screen reader: "graphic, opening quote mark, Semantic HTML..., graphic, closing quote mark" -->
  <!-- Quotes are visual style, not content - should be CSS! -->

  <ul>
    <li>
      <img src="checkmark-bullet.svg" alt="checkmark bullet point">
      Use semantic elements
    </li>
    <li>
      <img src="checkmark-bullet.svg" alt="checkmark bullet point">
      Write meaningful alt text
    </li>
    <li>
      <img src="checkmark-bullet.svg" alt="checkmark bullet point">
      Test with screen readers
    </li>
  </ul>
  <!-- Screen reader hears "checkmark bullet point" 3 times! -->
  <!-- List bullets are already announced by screen reader -->

  <div class="author-bio">
    <img src="avatar-border-decoration.png" alt="avatar border decoration">
    <img src="author-photo.jpg" alt="author headshot photo">
    <img src="verified-badge.svg" alt="verified author badge icon">
    <p>Written by Jane Doe, Senior Developer</p>
  </div>
  <!-- Screen reader: 3 images announced before author name -->
  <!-- Only author photo is informative, others are decorative -->

  <!-- Social sharing icons -->
  <div class="social-share">
    <img src="share-icon.svg" alt="share icon">
    <a href="/share/twitter">
      <img src="twitter-icon.svg" alt="Twitter icon">
    </a>
    <a href="/share/facebook">
      <img src="facebook-icon.svg" alt="Facebook icon">
    </a>
    <a href="/share/linkedin">
      <img src="linkedin-icon.svg" alt="LinkedIn icon">
    </a>
  </div>
  <!-- Screen reader: "graphic, share icon, link, graphic, Twitter icon..." -->
  <!-- "Twitter icon" doesn't say what the link DOES -->
</article>

<!-- Result: User hears 45+ image announcements, most are useless noise -->
```

**Debugging Process:**

**Step 1: Screen Reader User Testing**

```javascript
// Test with NVDA using "Browse by Graphics" mode (G key)

// User presses 'G' to jump between images
// Expected: Jump to informative images (charts, photos, diagrams)
// Actual: Jumps through 45 images, most are decorative

// Recording of screen reader output:
// "graphic, featured icon"
// "graphic, decorative line separator"
// "graphic, tip number 1 icon"
// "graphic, opening quote mark"
// "graphic, checkmark bullet point"
// "graphic, checkmark bullet point"
// "graphic, checkmark bullet point"
// "graphic, avatar border decoration"
// "graphic, author headshot photo" ✅ (only this one is useful!)
// "graphic, verified author badge icon"
// ...

// User feedback: "I just wanted to find the author photo and diagrams.
// Why are there so many images?"
```

**Step 2: Quantitative Analysis**

```javascript
// Automated audit of blog articles

function analyzeImageAccessibility(articleElement) {
  const images = articleElement.querySelectorAll('img');
  const stats = {
    total: images.length,
    withAlt: 0,
    emptyAlt: 0,
    decorativeMarkers: 0,
    likelyDecorative: 0,
    likelyInformative: 0,
    inInteractive: 0
  };

  images.forEach(img => {
    // Count alt attributes
    if (img.hasAttribute('alt')) {
      stats.withAlt++;
      if (img.alt === '') stats.emptyAlt++;
    }

    // Count decorative markers
    if (img.role === 'presentation' || img.ariaHidden === 'true') {
      stats.decorativeMarkers++;
    }

    // Heuristic: Likely decorative?
    const isSmall = img.width < 50 && img.height < 50;
    const hasDecorativeKeywords =
      /icon|decoration|border|divider|bullet|separator/i.test(img.src) ||
      /icon|decoration|border|divider|bullet/i.test(img.alt);

    if (isSmall || hasDecorativeKeywords) {
      stats.likelyDecorative++;
    } else {
      stats.likelyInformative++;
    }

    // Check if in interactive element
    if (img.closest('a, button')) {
      stats.inInteractive++;
    }
  });

  return stats;
}

// Run on 100 sample articles
const articles = document.querySelectorAll('article.blog-post');
const aggregateStats = {
  avgTotalImages: 0,
  avgDecorative: 0,
  avgInformative: 0,
  decorativeMarkedProperly: 0
};

articles.forEach(article => {
  const stats = analyzeImageAccessibility(article);
  aggregateStats.avgTotalImages += stats.total;
  aggregateStats.avgDecorative += stats.likelyDecorative;
  aggregateStats.avgInformative += stats.likelyInformative;
  aggregateStats.decorativeMarkedProperly +=
    stats.decorativeMarkers / Math.max(stats.likelyDecorative, 1);
});

aggregateStats.avgTotalImages /= articles.length;
aggregateStats.avgDecorative /= articles.length;
aggregateStats.avgInformative /= articles.length;
aggregateStats.decorativeMarkedProperly /= articles.length;

console.log(`
  Image Accessibility Audit (100 articles):
  ------------------------------------------
  Average total images: ${aggregateStats.avgTotalImages.toFixed(1)}
  Average decorative: ${aggregateStats.avgDecorative.toFixed(1)} (${(aggregateStats.avgDecorative / aggregateStats.avgTotalImages * 100).toFixed(0)}%)
  Average informative: ${aggregateStats.avgInformative.toFixed(1)} (${(aggregateStats.avgInformative / aggregateStats.avgTotalImages * 100).toFixed(0)}%)
  Decorative properly marked: ${(aggregateStats.decorativeMarkedProperly * 100).toFixed(0)}%

  CRITICAL FINDING: Only 3% of likely decorative images are properly marked!
`);

// Output:
// Average total images: 47.3
// Average decorative: 42.1 (89%)
// Average informative: 5.2 (11%)
// Decorative properly marked: 3%
//
// CRITICAL FINDING: Only 3% of likely decorative images are properly marked!
```

**Step 3: Fix Implementation**

```html
<!-- ✅ FIXED: Properly mark decorative vs informative images -->

<article class="blog-post">
  <!-- Fix 1: Remove decorative icon from heading -->
  <h1>
    <img src="star-icon.svg" alt="" role="presentation">
    10 Tips for Better Web Development
  </h1>
  <!-- Screen reader: "heading level 1, 10 Tips for Better Web Development" ✅ -->

  <!-- Fix 2: Divider as CSS, or hide from screen reader -->
  <img src="divider-line.png" alt="" role="presentation">
  <!-- Screen reader: SILENT ✅ -->

  <!-- Better: Use CSS border instead -->
  <hr class="visual-divider">
  <style>
    .visual-divider {
      border: 0;
      height: 2px;
      background: linear-gradient(to right, transparent, #ccc, transparent);
    }
  </style>
  <!-- Screen reader: "separator" (semantic HR element) -->

  <!-- Fix 3: Hide redundant tip number icon -->
  <h2>
    <img src="tip-number-1.svg" alt="" aria-hidden="true">
    Tip #1: Write Semantic HTML
  </h2>
  <!-- Screen reader: "heading level 2, Tip #1: Write Semantic HTML" ✅ -->

  <!-- Fix 4: Use CSS for quote marks, or semantic <blockquote> -->
  <blockquote>
    Semantic HTML is crucial for accessibility.
  </blockquote>
  <style>
    blockquote::before { content: '"'; }
    blockquote::after { content: '"'; }
  </style>
  <!-- Screen reader: "block quote, Semantic HTML is crucial for accessibility" ✅ -->

  <!-- Fix 5: Hide bullet icons (list semantics provide structure) -->
  <ul>
    <li>
      <img src="checkmark-bullet.svg" alt="" role="presentation">
      Use semantic elements
    </li>
    <li>
      <img src="checkmark-bullet.svg" alt="" role="presentation">
      Write meaningful alt text
    </li>
    <li>
      <img src="checkmark-bullet.svg" alt="" role="presentation">
      Test with screen readers
    </li>
  </ul>
  <!-- Screen reader: "list 3 items, bullet, Use semantic elements, bullet, Write..." ✅ -->
  <!-- No more "checkmark bullet point" announcements! -->

  <!-- Fix 6: Author bio - only author photo is informative -->
  <div class="author-bio">
    <img src="avatar-border-decoration.png" alt="" role="presentation">
    <img src="author-photo.jpg" alt="Jane Doe profile picture">
    <img src="verified-badge.svg" alt="" aria-hidden="true">
    <span class="sr-only">Verified author</span>
    <p>Written by Jane Doe, Senior Developer</p>
  </div>
  <!-- Screen reader: "image, Jane Doe profile picture, Verified author, Written by..." ✅ -->

  <!-- Fix 7: Social sharing - describe action, hide decorative icon -->
  <div class="social-share">
    <span class="sr-only">Share this article:</span>
    <img src="share-icon.svg" alt="" aria-hidden="true">
    <a href="/share/twitter" aria-label="Share on Twitter">
      <img src="twitter-icon.svg" alt="" role="presentation">
    </a>
    <a href="/share/facebook" aria-label="Share on Facebook">
      <img src="facebook-icon.svg" alt="" role="presentation">
    </a>
    <a href="/share/linkedin" aria-label="Share on LinkedIn">
      <img src="linkedin-icon.svg" alt="" role="presentation">
    </a>
  </div>
  <!-- Screen reader: "Share this article: link, Share on Twitter, link, Share on..." ✅ -->
</article>

<!-- Result: User now hears only 1-2 informative images instead of 45! -->
```

**Step 4: Automated Decorative Detection & Fix**

```javascript
// Script to automatically fix common decorative image patterns

function autoFixDecorativeImages() {
  const fixes = {
    applied: 0,
    patterns: []
  };

  // Pattern 1: Icons in headings (likely decorative)
  document.querySelectorAll('h1 img, h2 img, h3 img, h4 img, h5 img, h6 img').forEach(img => {
    if (img.width < 50 && img.height < 50) {
      img.setAttribute('role', 'presentation');
      img.setAttribute('alt', '');
      fixes.applied++;
      fixes.patterns.push('heading-icon');
    }
  });

  // Pattern 2: Bullet/list icons
  document.querySelectorAll('li > img:first-child').forEach(img => {
    if (/bullet|checkmark|arrow|icon/i.test(img.src)) {
      img.setAttribute('role', 'presentation');
      img.setAttribute('alt', '');
      fixes.applied++;
      fixes.patterns.push('list-bullet');
    }
  });

  // Pattern 3: Divider/separator images
  document.querySelectorAll('img').forEach(img => {
    if (/divider|separator|line|border/i.test(img.src) ||
        /divider|separator|line|border/i.test(img.alt)) {
      img.setAttribute('role', 'presentation');
      img.setAttribute('alt', '');
      fixes.applied++;
      fixes.patterns.push('divider');
    }
  });

  // Pattern 4: Quote mark images
  document.querySelectorAll('img').forEach(img => {
    if (/quote|quotation/i.test(img.src) || img.width < 30) {
      const text = img.closest('p, blockquote')?.textContent;
      if (text && text.length > 50) {
        // Likely decorative quote mark
        img.setAttribute('role', 'presentation');
        img.setAttribute('alt', '');
        fixes.applied++;
        fixes.patterns.push('quote-mark');
      }
    }
  });

  // Pattern 5: Avatar borders/frames
  document.querySelectorAll('.author-bio img, .user-profile img').forEach(img => {
    if (/border|frame|decoration/i.test(img.src)) {
      img.setAttribute('role', 'presentation');
      img.setAttribute('alt', '');
      fixes.applied++;
      fixes.patterns.push('avatar-decoration');
    }
  });

  // Pattern 6: Social media icons in links (add aria-label to parent)
  document.querySelectorAll('a img[src*="twitter"], a img[src*="facebook"], a img[src*="linkedin"]').forEach(img => {
    const link = img.closest('a');
    if (!link.hasAttribute('aria-label')) {
      const platform = img.src.match(/(twitter|facebook|linkedin)/i)[1];
      link.setAttribute('aria-label', `Share on ${platform}`);
    }
    img.setAttribute('role', 'presentation');
    img.setAttribute('alt', '');
    fixes.applied++;
    fixes.patterns.push('social-icon');
  });

  console.log(`Auto-fix applied ${fixes.applied} changes`);
  console.log('Pattern breakdown:',
    fixes.patterns.reduce((acc, p) => {
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {})
  );

  return fixes;
}

// Run on all articles
document.querySelectorAll('article.blog-post').forEach(autoFixDecorativeImages);

// Output:
// Auto-fix applied 4,237 changes across 100 articles
// Pattern breakdown:
// {
//   "heading-icon": 342,
//   "list-bullet": 1,834,
//   "divider": 198,
//   "quote-mark": 456,
//   "avatar-decoration": 267,
//   "social-icon": 1,140
// }
```

**Production Metrics (After Fix):**

```javascript
// Before optimization:
// - Average decorative images per article: 45
// - Screen reader reading time: 18 minutes
// - User frustration score: 8.2/10
// - Bounce rate: 67%
// - Complaints: 34/month

// After optimization:
// - Average decorative images per article: 45 (same number)
// - BUT: Now properly marked with alt="" or role="presentation"
// - Images announced by screen reader: 5.2 (down from 47.3, 89% reduction!) ✅
// - Screen reader reading time: 6.5 minutes (64% faster!) ✅
// - User frustration score: 2.1/10 (74% improvement) ✅
// - Bounce rate: 23% (66% reduction) ✅
// - Complaints: 2/month (94% reduction) ✅
// - User satisfaction: +183%

// Additional benefits:
// - Accessibility tree size: 42% smaller (better AT performance)
// - Screen reader navigation: 3x faster (fewer stops with 'G' key)
// - Cognitive load: Significantly reduced (only hear relevant images)
// - Author productivity: Template now auto-marks decorative images
```

**Key Lessons:**

1. **More images ≠ less accessible**: It's about marking them correctly
2. **Context matters**: Same icon can be decorative in one place, informative in another
3. **Test with real users**: Automated tools miss this type of issue
4. **Semantic HTML helps**: Use `<hr>`, `<blockquote>`, `<ul>` instead of images when possible
5. **Automate where possible**: Detect common patterns and apply fixes programmatically

</details>

<details>
<summary><strong>⚖️ Trade-offs: Empty alt vs role="presentation" vs aria-hidden</strong></summary>

**Three ways to mark images as decorative - which should you use?**

| Method | Syntax | Screen Reader Behavior | Accessibility Tree | Use When |
|--------|--------|------------------------|-------------------|----------|
| **Empty alt** | `alt=""` | SILENT (skipped) | Included (marked as decorative) | Standard decorative images |
| **role="presentation"** | `role="presentation"` | SILENT (skipped) | Excluded (ignored node) | Explicit decorative intent |
| **aria-hidden** | `aria-hidden="true"` | SILENT (completely hidden) | Excluded (removed from tree) | Hide from ALL assistive tech |

**Performance Comparison:**

```html
<!-- Test: Page with 500 decorative images -->

<!-- Method 1: Empty alt="" -->
<img src="decoration.png" alt="">
<!-- Accessibility tree: Creates node, marks as "decorative" -->
<!-- AT processing time: ~0.3ms per image -->
<!-- Total: ~150ms for 500 images -->
<!-- Memory: Small AXNode created for each image -->

<!-- Method 2: role="presentation" -->
<img src="decoration.png" alt="" role="presentation">
<!-- Accessibility tree: Creates "ignored" node (minimal) -->
<!-- AT processing time: ~0.2ms per image -->
<!-- Total: ~100ms for 500 images (33% faster) -->
<!-- Memory: Minimal AXNode (marked ignored early) -->

<!-- Method 3: aria-hidden="true" -->
<img src="decoration.png" alt="" aria-hidden="true">
<!-- Accessibility tree: Completely excluded (no node) -->
<!-- AT processing time: ~0.1ms per image (just checks attribute) -->
<!-- Total: ~50ms for 500 images (67% faster) -->
<!-- Memory: No AXNode created (smallest footprint) -->

<!-- Winner for decorative images: aria-hidden="true" (best performance) -->
<!-- BUT: Use with caution - hides from ALL AT, not just screen readers -->
```

**Semantic Differences:**

```html
<!-- Empty alt="" - "This image is decorative" -->
<img src="icon.svg" alt="">
<!-- Meaning: Image exists but provides no information -->
<!-- Still accessible to assistive tech (e.g., voice control can target it) -->
<!-- Example: "Click image" command might work -->

<!-- role="presentation" - "Ignore this image's semantic role" -->
<img src="icon.svg" alt="" role="presentation">
<!-- Meaning: Image exists but should be treated as decoration -->
<!-- Removed from accessibility tree's semantic structure -->
<!-- Better performance than alt="" alone -->

<!-- aria-hidden="true" - "Hide this from ALL assistive technology" -->
<img src="icon.svg" alt="" aria-hidden="true">
<!-- Meaning: Image should not exist in accessibility layer at all -->
<!-- Completely removed from accessibility tree -->
<!-- Cannot be targeted by voice control or other AT -->
<!-- Use when image is truly invisible to all users -->
```

**When to Use Each:**

```html
<!-- Scenario 1: Decorative icon next to text -->
<button>
  <img src="save-icon.svg" alt="">
  Save Changes
</button>
<!-- ✅ Use: alt="" (standard, sufficient) -->
<!-- Why: Screen reader correctly skips icon, reads "Save Changes, button" -->

<!-- Scenario 2: Many decorative icons (performance concern) -->
<ul class="large-list">
  <!-- 1000+ list items with bullet icons -->
  <li>
    <img src="bullet.svg" alt="" role="presentation">
    List item text
  </li>
  <!-- ... 1000 more ... -->
</ul>
<!-- ✅ Use: role="presentation" (better performance at scale) -->
<!-- Why: Accessibility tree is 30% smaller, faster to construct -->

<!-- Scenario 3: CSS-controlled decorative images -->
<div class="decorative-background">
  <img src="pattern.png" alt="" aria-hidden="true" style="position: absolute; z-index: -1;">
  <div class="content">Actual content here</div>
</div>
<!-- ✅ Use: aria-hidden="true" (hidden from ALL users) -->
<!-- Why: Image is purely visual, positioned behind content, not interactive -->

<!-- Scenario 4: Loading spinners / progress indicators (dynamic) -->
<div class="loading">
  <img src="spinner.gif" alt="" aria-hidden="true">
  <span aria-live="polite" aria-atomic="true">Loading...</span>
</div>
<!-- ✅ Use: aria-hidden="true" on image + aria-live on text -->
<!-- Why: Spinner is visual-only, text provides status for screen readers -->

<!-- Scenario 5: Icon in link (functional context) -->
<a href="/settings">
  <img src="gear-icon.svg" alt="">
</a>
<!-- ❌ WRONG: Image is functional (link has no other text) -->
<!-- ✅ FIX: Add aria-label to link -->
<a href="/settings" aria-label="Settings">
  <img src="gear-icon.svg" alt="" role="presentation">
</a>
```

**Compatibility & Browser Support:**

```javascript
// Browser support matrix

// alt="" - Universal support
// Supported: ALL browsers, ALL screen readers
// Since: HTML 4.0 (1997)
// Recommendation: ALWAYS USE as baseline

// role="presentation" - Widely supported
// Supported: Chrome, Firefox, Safari, Edge (all modern)
// Screen readers: NVDA, JAWS, VoiceOver, TalkBack
// Since: ARIA 1.0 (2008)
// Recommendation: Use for explicit decorative intent

// aria-hidden="true" - Widely supported with caveats
// Supported: ALL modern browsers
// Caveats:
//   - Hides from ALL AT (not just screen readers)
//   - Can break voice control ("click image" won't work)
//   - Must not be used on focusable elements
// Recommendation: Use sparingly, only for truly hidden content
```

**Decision Matrix:**

```javascript
function chooseDecorativeMethod(image) {
  // Question 1: Is image in interactive element?
  const inInteractive = image.closest('a, button, [role="button"]');
  if (inInteractive) {
    // Check if interactive element has accessible name
    const hasAccessibleName =
      inInteractive.textContent.trim() ||
      inInteractive.hasAttribute('aria-label') ||
      inInteractive.hasAttribute('aria-labelledby');

    if (!hasAccessibleName) {
      return {
        method: 'ERROR',
        reason: 'Image is functional - must have alt text or parent needs aria-label'
      };
    }

    // Interactive element has name, image can be decorative
    return {
      method: 'role="presentation"',
      reason: 'Decorative in functional context - explicit marker preferred'
    };
  }

  // Question 2: Is image purely visual (CSS layer)?
  const isPurelyVisual =
    image.style.position === 'absolute' &&
    parseInt(image.style.zIndex) < 0;

  if (isPurelyVisual) {
    return {
      method: 'aria-hidden="true"',
      reason: 'Purely visual decoration - hide from all AT'
    };
  }

  // Question 3: Many similar decorative images (performance)?
  const similarImages = document.querySelectorAll(`img[src="${image.src}"]`);
  if (similarImages.length > 50) {
    return {
      method: 'role="presentation"',
      reason: 'Many instances - performance benefit from excluding from tree'
    };
  }

  // Default: Standard decorative image
  return {
    method: 'alt=""',
    reason: 'Standard decorative image - alt="" is sufficient'
  };
}

// Example usage
const img = document.querySelector('img.icon');
const recommendation = chooseDecorativeMethod(img);
console.log(`Recommended: ${recommendation.method}`);
console.log(`Reason: ${recommendation.reason}`);
```

**Common Mistakes:**

```html
<!-- ❌ MISTAKE 1: Using aria-hidden on focusable elements -->
<button aria-hidden="true">
  Click me
</button>
<!-- Button is hidden from screen readers but still keyboard-focusable! -->
<!-- Creates confusing experience: user tabs to "nothing" -->

<!-- ✅ FIX: Don't hide focusable elements -->
<button>
  <img src="icon.svg" alt="" aria-hidden="true">
  Click me
</button>
<!-- Only icon is hidden, button text is accessible -->

<!-- ❌ MISTAKE 2: Using role="presentation" on informative images -->
<img src="product-photo.jpg" alt="Blue cotton t-shirt" role="presentation">
<!-- Conflicting signals: alt text says informative, role says decorative -->
<!-- Screen reader behavior: Unpredictable (may skip image) -->

<!-- ✅ FIX: Don't use role="presentation" on informative images -->
<img src="product-photo.jpg" alt="Blue cotton t-shirt">

<!-- ❌ MISTAKE 3: Forgetting alt="" when using role="presentation" -->
<img src="decoration.png" role="presentation">
<!-- Missing alt attribute - some validators will flag this -->

<!-- ✅ FIX: Always include alt="" even with role="presentation" -->
<img src="decoration.png" alt="" role="presentation">

<!-- ❌ MISTAKE 4: Using aria-hidden on parent of interactive elements -->
<div aria-hidden="true">
  <button>Click me</button>
</div>
<!-- Button is keyboard-focusable but hidden from screen readers! -->

<!-- ✅ FIX: Only hide truly decorative containers -->
<div aria-hidden="true">
  <img src="background-pattern.png" alt="">
</div>
<button>Click me</button>
```

**Recommendation Summary:**

| Use Case | Recommended Method | Reasoning |
|----------|-------------------|-----------|
| Standard decorative image | `alt=""` | Simple, universal, sufficient |
| Decorative in interactive element | `alt="" role="presentation"` | Explicit intent, clearer semantics |
| Purely visual (CSS layer) | `alt="" aria-hidden="true"` | Not interactive, hidden from all AT |
| Many instances (performance) | `alt="" role="presentation"` | Smaller accessibility tree |
| Dynamic content (loading spinners) | `alt="" aria-hidden="true"` | Visual-only, use aria-live for status |

</details>

<details>
<summary><strong>💬 Explain to Junior: Decorative vs Informative Images</strong></summary>

**Simple Explanation:**

Imagine you're describing your website to a friend over the phone. Would you mention the image?

**Decorative Image (don't mention it):**
- Friend: "What's on your homepage?"
- You: "There's a headline that says 'Welcome to Our Site' and..."
- ❌ You DON'T say: "Oh, and there's a little star icon next to the headline"

**Informative Image (mention it):**
- Friend: "What products do you sell?"
- You: "We sell blue cotton t-shirts, red leather jackets..."
- ✅ You DO say: "Here's a photo of our bestselling blue t-shirt"

**The Simple Test:**

> **If removing the image would lose information, it's informative.**
> **If removing the image wouldn't change anything, it's decorative.**

**Real Examples:**

```html
<!-- DECORATIVE IMAGES (mark with alt="") -->

<!-- 1. Bullet points / icons -->
<ul>
  <li>
    <img src="checkmark.svg" alt="">
    Write clean code
  </li>
</ul>
<!-- Why decorative? The text already says "Write clean code" - the checkmark is just visual style -->

<!-- 2. Divider lines -->
<img src="divider-line.png" alt="">
<!-- Why decorative? It's just visual spacing - no information lost if removed -->

<!-- 3. Background patterns -->
<div style="background-image: url('pattern.png')">
  <h1>Welcome</h1>
</div>
<!-- Why decorative? Pattern is just visual design - content is "Welcome" -->

<!-- 4. Decorative icon next to text -->
<h2>
  <img src="star.svg" alt="">
  Featured Products
</h2>
<!-- Why decorative? Heading already says "Featured" - star is just visual emphasis -->

<!-- INFORMATIVE IMAGES (describe with alt text) -->

<!-- 1. Product photos -->
<img src="laptop.jpg" alt="Silver 13-inch laptop">
<!-- Why informative? User needs to know what product looks like -->

<!-- 2. Charts / graphs -->
<img src="sales-chart.png" alt="Sales increased 25% in Q4">
<!-- Why informative? Conveys data - critical information -->

<!-- 3. Icons without text -->
<button>
  <img src="trash.svg" alt="Delete">
</button>
<!-- Why informative? Only way to know button's purpose -->

<!-- 4. User profile pictures -->
<img src="user-avatar.jpg" alt="John Doe's profile picture">
<!-- Why informative? Identifies the user -->
```

**The "Phone Call" Test:**

Describe your page to someone on the phone:

```html
<!-- Example page -->
<header>
  <img src="logo.svg" alt="???">
  <h1>
    <img src="star-icon.svg" alt="???">
    Welcome to Our Store
  </h1>
</header>

<main>
  <img src="divider.png" alt="???">

  <section>
    <h2>Featured Product</h2>
    <img src="blue-tshirt.jpg" alt="???">
    <p>$29.99</p>
  </section>
</main>

<!-- Phone call: -->
"Hi! The page has a logo at the top, then a heading 'Welcome to Our Store'.
Below that is a featured product - a blue t-shirt for $29.99."

<!-- What did you NOT mention? -->
- Star icon next to heading (decorative)
- Divider line (decorative)

<!-- What DID you mention? -->
- Logo (informative - identifies company)
- Blue t-shirt photo (informative - shows product)

<!-- So: -->
<img src="logo.svg" alt="Company Name"> ✅ Informative
<img src="star-icon.svg" alt=""> ✅ Decorative
<img src="divider.png" alt=""> ✅ Decorative
<img src="blue-tshirt.jpg" alt="Blue cotton t-shirt"> ✅ Informative
```

**Common Junior Mistakes:**

```html
<!-- ❌ MISTAKE: "I'll just describe everything to be safe" -->
<button>
  <img src="save-icon.svg" alt="save icon">
  Save Changes
</button>
<!-- Screen reader: "save icon, Save Changes, button" -->
<!-- User hears "save" twice - annoying! -->

<!-- ✅ FIX: Icon is decorative (button text already says "Save") -->
<button>
  <img src="save-icon.svg" alt="">
  Save Changes
</button>
<!-- Screen reader: "Save Changes, button" ✅ -->

<!-- ❌ MISTAKE: "The image says 'decorative' so it must be decorative" -->
<img src="important-chart.png" alt="">
<!-- Just because YOU think it's decorative doesn't make it so! -->
<!-- Does it convey information? YES → Informative! -->

<!-- ✅ FIX: Chart shows data = informative -->
<img src="important-chart.png" alt="Revenue growth chart showing 25% increase">

<!-- ❌ MISTAKE: "It's small, so it's decorative" -->
<img src="warning-icon.svg" alt="" width="16" height="16">
<p>Your payment failed</p>
<!-- Icon indicates severity - important information! -->

<!-- ✅ FIX: Size doesn't determine importance -->
<img src="warning-icon.svg" alt="Warning" width="16" height="16">
<p>Your payment failed</p>
```

**Visual Decision Tree:**

```
Ask yourself: "Would removing this image lose information?"
├─ YES → INFORMATIVE
│   └─ Write descriptive alt text: alt="Blue cotton t-shirt"
│
└─ NO → DECORATIVE
    ├─ Is there text nearby that says the same thing?
    │   └─ YES → alt="" (decorative)
    │
    └─ Is it just visual style (borders, dividers, backgrounds)?
        └─ YES → alt="" (decorative)
```

**Analogy for a PM:**

"Decorative vs informative is like the difference between:

**Decorative:** Styling a PowerPoint slide with fancy borders and icons
- Removing them doesn't change the message
- Just makes it look pretty

**Informative:** Actual charts and data on the slide
- Removing them loses critical information
- Essential to understanding the content

In web accessibility, decorative images get `alt=""` (silent), informative images get descriptive alt text."

**Quick Reference:**

```html
<!-- ✅ DECORATIVE (use alt="") -->
- Bullets, icons next to text
- Dividers, borders, backgrounds
- Purely visual decorations
- Icons when text already explains

<!-- ✅ INFORMATIVE (use descriptive alt) -->
- Product photos
- Charts, graphs, diagrams
- Logos (in navigation)
- Icons without text
- User avatars (when identifying user)
- Any image that conveys data
```

</details>

### Common Mistakes

❌ **Wrong**: Describing decorative images
```html
<img src="decoration.png" alt="decorative border">
```

✅ **Correct**: Empty alt for decorative
```html
<img src="decoration.png" alt="">
```

❌ **Wrong**: Missing alt on informative images
```html
<a href="/products">
  <img src="icon.svg">
</a>
```

✅ **Correct**: Describe function
```html
<a href="/products">
  <img src="icon.svg" alt="View products">
</a>
```

### Follow-up Questions

1. When should you use `role="presentation"` vs empty alt?
2. How do you handle CSS background images that convey information?
3. What's the impact of incorrect decorative/informative classification?
4. How do you audit images to determine if they're decorative?
5. What are the performance implications of decorative image handling?

### Resources

- [W3C: Decorative Images](https://www.w3.org/WAI/tutorials/images/decorative/)
- [WebAIM: Images Concepts](https://webaim.org/articles/images/)
