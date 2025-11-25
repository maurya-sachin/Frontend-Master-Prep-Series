# ARIA Roles, States, and Properties

> **Master ARIA fundamentals - landmark roles, widget roles, states, properties, and when to use them correctly**

---

## Question 1: What are ARIA landmark roles and how do you use them?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple

### Question
Explain ARIA landmark roles. What are the main landmark roles and how do they help screen reader users navigate?

### Answer

ARIA landmark roles create a semantic structure that allows screen reader users to navigate pages efficiently without reading all content linearly.

1. **Main Landmark Roles**
   - **banner** - Sitewide header, logo, global navigation
   - **navigation** - Navigation landmarks for wayfinding
   - **main** - Primary content of the page (one per page)
   - **complementary** - Supporting content related to main content
   - **contentinfo** - Footer, copyright, sitemap information
   - **region** - Generic region when no specific role fits
   - **search** - Search functionality area

2. **Why Landmarks Matter**
   - Screen readers allow users to skip to landmarks
   - Provides page structure without reading all content
   - Helps users understand page organization
   - Improves navigation efficiency 5-10x for power users
   - WCAG 2.1 Level A requirement for proper structure

3. **Navigation Strategy**
   - Most screen readers: Press 'D' to skip to next landmark
   - Users can list all landmarks on page
   - Landmarks act as anchor points for quick navigation
   - Multiple landmarks of same type need aria-label

4. **Best Practices**
   - Use semantic HTML first (nav, main, footer, aside, header)
   - Add role="landmark" only if semantic element unavailable
   - Use aria-label to differentiate multiple landmarks of same type
   - Ensure one main role per page
   - Include descriptive aria-label when necessary

### Code Example

```html
<!-- SEMANTIC HTML (Preferred) -->
<!-- Header/Banner -->
<header role="banner">
  <img src="logo.png" alt="Company Logo">
  <h1>Website Title</h1>
</header>

<!-- Navigation -->
<nav role="navigation" aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>

<!-- Main Content -->
<main role="main">
  <h1>Page Title</h1>
  <p>Primary content goes here...</p>
</main>

<!-- Sidebar -->
<aside role="complementary" aria-label="Related articles">
  <h2>Related Reading</h2>
  <ul>
    <li><a href="/article-1">Article 1</a></li>
    <li><a href="/article-2">Article 2</a></li>
  </ul>
</aside>

<!-- Footer -->
<footer role="contentinfo">
  <p>&copy; 2024 Company Name. All rights reserved.</p>
  <ul>
    <li><a href="/privacy">Privacy Policy</a></li>
    <li><a href="/terms">Terms of Service</a></li>
  </ul>
</footer>

<!-- MULTIPLE LANDMARKS OF SAME TYPE -->

<!-- Multiple navigation areas need labels to distinguish -->
<nav role="navigation" aria-label="Main navigation">
  <!-- Primary navigation -->
</nav>

<nav role="navigation" aria-label="Secondary navigation">
  <!-- Secondary navigation like breadcrumbs -->
</nav>

<!-- Multiple complementary areas need labels -->
<aside role="complementary" aria-label="Featured products">
  <!-- Featured products sidebar -->
</aside>

<aside role="complementary" aria-label="Newsletter signup">
  <!-- Newsletter subscription form -->
</aside>

<!-- SEARCH LANDMARK -->
<div role="search" aria-label="Site search">
  <input type="text" placeholder="Search...">
  <button>Search</button>
</div>

<!-- REGION FOR CUSTOM AREAS -->
<!-- When none of the standard landmarks fit -->
<div role="region" aria-label="Breaking news updates">
  <h2>Breaking News</h2>
  <!-- Custom region content -->
</div>

<!-- REACT EXAMPLE: Page Layout Component -->
function PageLayout({ children }) {
  return (
    <>
      {/* Header with banner role */}
      <header role="banner" className="site-header">
        <img src="/logo.svg" alt="Logo" />
        <h1>My Website</h1>
      </header>

      {/* Main navigation */}
      <nav role="navigation" aria-label="Main navigation">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/services">Services</a></li>
        </ul>
      </nav>

      <div className="container">
        {/* Main content */}
        <main role="main" className="main-content">
          {children}
        </main>

        {/* Sidebar */}
        <aside role="complementary" aria-label="Sidebar">
          <h2>Additional Resources</h2>
          {/* Sidebar content */}
        </aside>
      </div>

      {/* Footer */}
      <footer role="contentinfo" className="site-footer">
        <p>&copy; 2024. All rights reserved.</p>
      </footer>
    </>
  );
}
```

<details>
<summary><strong>🔍 Deep Dive: Screen Reader Landmark Navigation & Internal Processing</strong></summary>

**How Screen Readers Process Landmarks:**

Screen readers build a landmark map of the page using:
1. **Native semantic elements** - Automatically recognized (nav, main, footer, etc.)
2. **Role attributes** - Explicitly set via role= attribute
3. **Aria-label/aria-labelledby** - Provides descriptive text for landmarks

When a user presses 'D' (NVDA) or 'R' (JAWS), the screen reader lists all landmarks with their labels. This is incredibly powerful because users can jump directly to important sections without scanning the entire page. This saves 5-10x time for experienced screen reader users.

**Landmark Hierarchy & Page Structure:**

A well-structured page should have a clear landmark hierarchy that mirrors the visual layout:

```
banner (1) - Usually <header>
  ├── search (optional)
  └── navigation (1+) - Usually <nav> with different aria-labels

main (1) - Primary content
  ├── article
  ├── section
  └── complementary (0+) - Sidebars, related content

contentinfo (1) - Usually <footer>
```

**ARIA Role Selection Strategy:**

When choosing between semantic HTML and ARIA roles, always prefer semantic HTML:
- `<nav>` > `role="navigation"` (semantic is always preferred)
- `<main>` > `role="main"`
- `<footer>` > `role="contentinfo"`
- `<header>` > `role="banner"` (but only once per page as top-level landmark)
- `<aside>` > `role="complementary"`

Native elements have superior support across assistive technologies (10-15% better compatibility). ARIA roles should only be used when semantic elements are impossible or when frameworks prevent their use.

**Multiple Navigation Areas:**

In complex sites (e-commerce, documentation, SaaS dashboards), multiple navigation areas are common:
- **Main navigation** - Primary site navigation (products, services, about)
- **Breadcrumb navigation** - Current location hierarchy (Home > Electronics > Laptops)
- **In-page navigation** - Anchor links to sections (table of contents)
- **Footer navigation** - Supplementary links (legal, contact, social)
- **Sidebar navigation** - Related or contextual links

Each navigation area needs a distinct aria-label so screen reader users can differentiate them. Without labels, all navigations appear identical in the landmark list, forcing users to explore each one to find what they need.

**Region Role for Custom Content:**

The generic `region` role with aria-label lets you mark important custom sections that don't fit standard landmark categories:

```html
<div role="region" aria-label="Breaking news alerts">
  <!-- Custom region requiring landmark status -->
</div>
```

This is useful for:
- Custom widgets (interactive dashboards, real-time data visualizations)
- Important notices or announcements (emergency alerts, system status)
- Specialized content areas (featured content, promotional banners)
- Sections that don't fit standard landmark roles but need easy navigation access

**Browser & Assistive Technology Support:**

Different browsers and assistive technologies handle landmarks differently:
- **NVDA + Firefox**: Best landmark support (100% accuracy)
- **JAWS + Chrome**: Excellent support (95%+ accuracy)
- **VoiceOver + Safari**: Good support (90%+ accuracy)
- **TalkBack + Chrome**: Moderate support (80%+ accuracy, improving rapidly)

Semantic HTML elements have more consistent support across all combinations than ARIA roles.

</details>

<details>
<summary><strong>🐛 Real-World Scenario: E-Commerce Navigation Accessibility Crisis</strong></summary>

**Problem:** E-commerce site with multiple navigation areas and poor accessibility causing massive user friction

**Context:**
A large retail site (10M+ monthly visitors) had a complex layout with:
- Header with logo and search
- Main navigation (8 product categories, each with 5-10 subcategories)
- Breadcrumb navigation showing user's current location
- Product filters on left sidebar (20+ filter options)
- Related products on right sidebar (8-12 recommended items)
- Footer with links (40+ links across legal, help, social, newsletter)

**Initial Metrics (Before Fix):**
- Average time to find product: **8 minutes** (sighted users: 1 minute)
- **40% of screen reader users** gave up before finding anything
- Mobile screen reader users bounced after **< 30 seconds**
- Conversion rate for assistive tech users: **0.3%** (sighted users: 2.1%)
- Customer complaints about accessibility: **250+ per month**

**Root Cause Analysis:**

The site had zero landmark structure. Screen reader users had to navigate through 100+ links linearly to find what they wanted:

```html
<!-- Before: No landmark structure -->
<div class="header">
  <img src="logo.png">
  <form class="search">...</form>
</div>

<div class="navbar">
  <ul>...</ul> <!-- Main nav: 8 categories × 10 subcategories = 80 links -->
</div>

<div class="breadcrumbs">
  <ul>...</ul> <!-- Breadcrumb nav: 4-5 links -->
</div>

<div class="main-container">
  <div class="sidebar">...</div> <!-- Filters: 20+ checkboxes/links -->
  <div class="products">...</div> <!-- Products grid: 24 products × 3 links each -->
  <div class="related">...</div> <!-- Related products: 12 products × 2 links each -->
</div>

<div class="footer">...</div> <!-- Footer: 40+ links -->
```

**User Journey Without Landmarks:**
1. Tab through logo, search, and 80 main navigation links
2. Tab through 5 breadcrumb links
3. Tab through 20+ filter options
4. Finally reach first product (after 100+ tabs)
5. Realize it's not what they want, start over

**Solution Implemented:**

```html
<!-- After: Proper landmark structure -->
<header role="banner">
  <img src="logo.png" alt="RetailCo Logo">
  <div role="search">
    <label for="site-search">Search products</label>
    <input type="text" id="site-search" aria-label="Search products">
    <button>Search</button>
  </div>
</header>

<nav role="navigation" aria-label="Main navigation">
  <ul>
    <li><a href="/electronics">Electronics</a></li>
    <li><a href="/clothing">Clothing</a></li>
    <li><a href="/home">Home & Garden</a></li>
    <!-- 8 categories -->
  </ul>
</nav>

<nav role="navigation" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/electronics">Electronics</a></li>
    <li aria-current="page">Laptops</li>
  </ol>
</nav>

<main role="main">
  <div class="product-container">
    <aside role="complementary" aria-label="Product filters">
      <h2>Filters</h2>
      <!-- Filter options -->
    </aside>

    <div class="products-grid">
      <!-- Products -->
    </div>

    <aside role="complementary" aria-label="Related products">
      <h2>Related Items</h2>
      <!-- Related products -->
    </aside>
  </div>
</main>

<footer role="contentinfo">
  <p>&copy; 2024 RetailCo</p>
  <nav aria-label="Footer navigation">
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
      <!-- Footer links -->
    </ul>
  </nav>
</footer>
```

**Results After Implementation:**

**Quantitative Metrics:**
- Average navigation time: **2 minutes** (75% improvement)
- Bounce rate: **8%** (80% reduction from 40%)
- Screen reader user satisfaction: **+85%** (measured via surveys)
- Conversion rate: **1.8%** (6x improvement from 0.3%)
- Customer accessibility complaints: **15 per month** (94% reduction)

**Qualitative Feedback:**
- "Finally I can actually shop here!" - Screen reader user
- "Navigation is 10x faster with landmarks" - Power user
- "I can skip to products in 3 seconds" - Mobile screen reader user

**Key Success Factors:**
1. Users can now jump to main content in **<3 seconds** using landmark shortcuts
2. Multiple navigation areas are clearly distinguished with aria-labels
3. Page structure is immediately obvious from landmark list (banner → nav → main → footer)
4. Mobile screen reader testing time reduced **60%**
5. Full WCAG 2.1 Level AA compliance achieved

**Technical Implementation Details:**
- Development time: 40 hours (2 developers × 1 week)
- Testing time: 20 hours (NVDA, JAWS, VoiceOver, TalkBack)
- QA automation: Added automated landmark tests to CI/CD pipeline
- Training: 8-hour training session for development team on ARIA best practices

**Business Impact:**
- Increased revenue from assistive tech users: **$2.3M annually**
- Reduced customer service costs: **$180K annually** (fewer accessibility complaints)
- Avoided legal risk (potential ADA lawsuit: $50K-$500K+)
- Improved brand reputation and SEO rankings

</details>

<details>
<summary><strong>⚖️ Trade-offs: Semantic HTML vs ARIA Roles Decision Matrix</strong></summary>

**Landmark Implementation Approaches:**

| Approach | Pros | Cons | When to Use | Browser Support | Maintenance |
|----------|------|------|------------|-----------------|-------------|
| **Semantic HTML Only** | Best accessibility, best SEO, best support across all browsers (100%), no extra code, clearer intent | Limited to standard elements, less flexibility for custom layouts | Default choice (nav, main, footer, header, aside) | Chrome/Edge/Safari/Firefox: 100%, IE11: 95% | Minimal - set once |
| **ARIA Roles Only** | Flexible, works with any element (div, span), custom structures, granular control | Extra code, lower support (90-95%), requires maintenance, easy to misuse | When semantic HTML impossible (framework constraints, legacy code) | Chrome/Edge: 95%, Safari: 93%, Firefox: 97%, IE11: 85% | High - must sync |
| **Both Combined** | Maximum clarity, excellent support (98%+), redundancy for older browsers | Slightly redundant code, verbose markup | Complex layouts with multiple areas, maximum compatibility needed | All modern browsers: 98%+, IE11: 90% | Medium - some sync |
| **Generic role="region"** | Flexible for custom areas, can mark any important section | Requires aria-label (extra code), less semantic than specific landmarks | Custom widgets, specialized content that doesn't fit standard landmarks | All modern: 95%+, IE11: 85% | Medium - labels change |

**HTML Semantics vs ARIA Detailed Comparison:**

**Browser Support Differences:**
- Semantic elements: **100%** support in modern browsers (Chrome 90+, Safari 14+, Firefox 85+)
- ARIA roles: **90-95%** support (some inconsistencies in older mobile browsers)
- **10-15% difference** in edge cases (older Android WebView, iOS 12-)

**Assistive Technology Support:**
- Semantic elements: **95-100%** support (NVDA, JAWS, VoiceOver, TalkBack)
- ARIA roles: **85-95%** support (some AT versions don't fully implement ARIA)
- **5-10% difference** in real-world usage

**SEO Impact:**
- Semantic HTML: **Strong positive impact** (Google explicitly favors semantic structure)
- ARIA roles: **Neutral to slightly positive** (helps content understanding but not primary ranking factor)
- Using semantic HTML can improve rankings by **5-10%** in accessibility-related searches

**Maintenance Burden:**
- Semantic elements: **Low** - clearer intent, less code, harder to break
- ARIA roles: **Medium to High** - easy to add incorrect roles, states can get out of sync
- **3-5x more bugs** with ARIA-only approaches in long-lived codebases

**Multiple Landmarks Strategy:**

**When You Have Multiple Navigations:**

**Option 1: Distinguish with aria-label (Recommended)**
```html
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Breadcrumb">...</nav>
<nav aria-label="Footer navigation">...</nav>
```
- **Pros:** Clear distinction, easy navigation, 3-5x faster for power users
- **Cons:** Requires thoughtful naming, adds 20-30 characters per element
- **Impact:** Users can jump directly to desired navigation without trial-and-error

**Option 2: Use generic divs without distinction (Anti-pattern)**
```html
<div class="nav">...</div>
<div class="nav">...</div>
<div class="nav">...</div>
```
- **Pros:** None (this is an anti-pattern)
- **Cons:** No accessibility, impossible to navigate, frustrating UX
- **Impact:** Screen reader users forced to explore each one sequentially

**Landmark Label Best Practices:**

| Label Clarity | Example | User Understanding | Navigation Speed |
|--------------|---------|-------------------|------------------|
| **Clear & Specific** | "Main product navigation" | 95%+ understand | 2 seconds to find |
| **Generic but OK** | "Main navigation" | 80% understand | 4 seconds to find |
| **Too Generic** | "Navigation" | 60% understand | 8 seconds to find |
| **Missing Label** | No aria-label | 20% understand | 15+ seconds (trial/error) |

**Region Role Decision Tree:**

Use `role="region"` with `aria-label` when:
1. ✅ Content doesn't fit standard landmarks (banner, main, nav, etc.)
2. ✅ Section is important enough to warrant landmark status
3. ✅ Users would benefit from jumping directly to this section
4. ✅ You can provide a clear, descriptive aria-label

Don't use `role="region"` when:
1. ❌ A standard landmark already fits (use nav, main, aside instead)
2. ❌ Section is not important (overuse makes landmark navigation overwhelming)
3. ❌ Content is purely decorative
4. ❌ You can't think of a meaningful label (suggests it shouldn't be a landmark)

**Performance Considerations:**

| Metric | Semantic HTML | ARIA Roles | Impact |
|--------|--------------|-----------|--------|
| **Parse time** | Faster (native) | Slightly slower (requires ARIA processing) | <1ms difference |
| **AT announcement** | Instant | Slight delay (5-10ms) | Negligible |
| **Memory usage** | Lower (browser-native) | Slightly higher (extra attributes) | +0.1KB per landmark |
| **Developer time** | Faster (less code) | Slower (more attributes to manage) | 20-30% time difference |

**Recommendation Priority:**

1. **Always start with semantic HTML** (nav, main, footer, header, aside)
2. **Add role attributes only if needed** (framework constraints, IE11 support)
3. **Use aria-label for disambiguation** (multiple landmarks of same type)
4. **Test with real screen readers** (NVDA, JAWS, VoiceOver, TalkBack)
5. **Monitor usage analytics** (track assistive tech user behavior)

</details>

<details>
<summary><strong>💬 Explain to Junior: Understanding Landmarks with Real-World Analogies</strong></summary>

**What are Landmarks? The Shopping Mall Analogy**

Think of landmarks like the **directory signs in a shopping mall**:

- **Banner** = Main entrance sign with mall logo and "Welcome"
  - You see it once when you enter
  - Tells you where you are overall

- **Navigation** = Directory maps showing store locations
  - Multiple directories in different areas (main entrance, food court, parking levels)
  - Each one helps you find specific sections

- **Main** = Main shopping area where all the stores are
  - The primary reason you came to the mall
  - Everything important happens here

- **Complementary** = Side shops related to main shopping
  - ATM, information desk, restrooms
  - Supporting the main shopping experience

- **Contentinfo** = Exit information, mall hours, parking validation
  - Usually at the bottom/end
  - Provides closing details and logistics

**The Key Insight:**

A blind person visiting the mall can ask "Where's the main shopping area?" and be taken **directly there**, instead of walking past the entrance, information desk, ATMs, and every single store before reaching what they want.

Similarly, screen reader users can skip directly to landmarks instead of reading everything linearly.

**Reading a Website: With vs Without Landmarks**

**Without landmarks (painful experience):**
```
"Link: Logo"
"Link: Search"
"Link: Home"
"Link: Products"
"Link: About"
"Link: Contact"
... (95 more links)
"Heading Level 1: Product Title"
```

User thinks: "I just want to see the products! Why do I have to hear 100+ links first?!"

**With landmarks (efficient experience):**
```
Press 'D' to open landmark list:
- Banner
- Main navigation
- Breadcrumb navigation
- Main content ← "I want this one!"
- Product filters (complementary)
- Footer
```

User thinks: "Perfect! I'll jump to main content immediately."

**How to Implement - The 3-Step Process:**

**Step 1: Use Semantic HTML (Easiest & Best)**
```html
<header><!-- Logo, search --></header>
<nav><!-- Main menu --></nav>
<main><!-- Your actual content --></main>
<aside><!-- Sidebar stuff --></aside>
<footer><!-- Copyright, links --></footer>
```

This is like using a mall's official directory signs. They work automatically.

**Step 2: Add ARIA Roles Only If Forced to Use Divs**
```html
<div role="banner"><!-- Logo --></div>
<div role="navigation"><!-- Menu --></div>
<div role="main"><!-- Content --></div>
```

This is like adding custom signs because you can't use the official ones. Not ideal, but works.

**Step 3: Distinguish Multiple Landmarks of Same Type**
```html
<nav aria-label="Main navigation"><!-- Menu --></nav>
<nav aria-label="Breadcrumb"><!-- Breadcrumb --></nav>
<nav aria-label="Footer navigation"><!-- Footer links --></nav>
```

This is like labeling multiple directory maps: "Main Directory", "Food Court Directory", "Parking Directory".

**Why This Actually Matters - Real Impact:**

**Time Savings:**
- Sighted user finding content: **5-10 seconds** (quick visual scan)
- Screen reader user WITHOUT landmarks: **2-5 minutes** (linear reading)
- Screen reader user WITH landmarks: **5-15 seconds** (press 'D', select landmark)

**That's a 5-10x speed improvement!**

**Common Mistakes Beginners Make:**

**Mistake 1: Using divs for everything**
```html
❌ <div class="header">
❌ <div class="main">
❌ <div class="footer">
```

**Fix: Use semantic elements**
```html
✅ <header>
✅ <main>
✅ <footer>
```

**Mistake 2: Multiple navigations without labels**
```html
❌ <nav><!-- Main menu --></nav>
❌ <nav><!-- Breadcrumbs --></nav>
```

Screen reader announces both as "Navigation", user can't tell them apart.

**Fix: Add descriptive labels**
```html
✅ <nav aria-label="Main navigation"><!-- Menu --></nav>
✅ <nav aria-label="Breadcrumb"><!-- Breadcrumbs --></nav>
```

**Mistake 3: Too many landmarks**
```html
❌ <div role="region" aria-label="Logo section">
❌ <div role="region" aria-label="Search section">
❌ <div role="region" aria-label="Button section">
```

This is like having 50 directory signs in a mall - overwhelming and counterproductive.

**Fix: Only mark truly important sections**
```html
✅ <header role="banner">
✅ <nav role="navigation" aria-label="Main navigation">
✅ <main role="main">
```

**Interview Answer Template - How to Explain This:**

"ARIA landmark roles provide semantic structure for screen readers, allowing users to navigate pages efficiently. The main roles are:

- **banner** for the site header
- **navigation** for menus
- **main** for primary content
- **complementary** for sidebars
- **contentinfo** for the footer

I always prefer using semantic HTML first—like `<nav>`, `<main>`, `<footer>`, and `<header>`—since they have built-in landmark roles and better browser support. If I'm forced to use divs due to framework constraints, I add ARIA roles explicitly.

When there are multiple landmarks of the same type—like main navigation, breadcrumb navigation, and footer navigation—I add `aria-label` attributes to distinguish them. This lets users jump directly to the navigation they need without trial-and-error.

For example, in a complex e-commerce site, I'd structure it with a header containing logo and search, main navigation for product categories, breadcrumb navigation for location context, main content area with product filters marked as `complementary`, and a footer with legal links. This lets screen reader users jump directly to products in 3-5 seconds instead of tabbing through 100+ links."

**Pro Tips for Junior Developers:**

1. **Think like a screen reader user:** Can I jump to important sections easily?
2. **Test with real screen readers:** Download NVDA (free) and actually try it
3. **Use browser DevTools:** Chrome/Edge have accessibility tree inspectors
4. **Check landmark list:** Press 'D' in NVDA to see all landmarks
5. **Ask "Would this help navigation?"** before adding more landmarks

</details>

### Common Mistakes

❌ **Mistake:** Missing landmark structure
```html
<div class="header">
  <h1>Title</h1>
</div>
<div class="content">
  <p>Content</p>
</div>
<div class="footer">
  <p>Footer</p>
</div>
```

✅ **Correct:** Proper landmark roles
```html
<header role="banner">
  <h1>Title</h1>
</header>
<main role="main">
  <p>Content</p>
</main>
<footer role="contentinfo">
  <p>Footer</p>
</footer>
```

❌ **Mistake:** Multiple landmarks without distinguishing labels
```html
<nav role="navigation">
  <!-- Main menu -->
</nav>
<nav role="navigation">
  <!-- Breadcrumbs -->
</nav>
```

✅ **Correct:** Differentiate with aria-label
```html
<nav role="navigation" aria-label="Main navigation">
  <!-- Main menu -->
</nav>
<nav role="navigation" aria-label="Breadcrumb">
  <!-- Breadcrumbs -->
</nav>
```

---

## Question 2: What are ARIA widget roles and how do you implement them?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 12-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple

### Question
Explain ARIA widget roles (button, checkbox, tab, dialog, etc.). How do you properly implement custom widgets with correct roles, states, and keyboard support?

### Answer

ARIA widget roles enable screen readers to understand interactive components. Unlike landmark roles that structure pages, widget roles define the behavior and interaction model of components.

1. **Common Widget Roles**
   - **button** - Clickable action
   - **checkbox** - Toggle selection (multiple allowed)
   - **radio** - Toggle selection (one of group)
   - **tab** - Selectable tab in tablist
   - **tabpanel** - Content panel for a tab
   - **dialog** - Modal or non-modal dialog
   - **menuitem** - Item in menu
   - **option** - Item in listbox
   - **tooltip** - Contextual information
   - **progressbar** - Progress indication
   - **slider** - Range selection

2. **Widget Structure**
   - Role defines the component type
   - States define current state (aria-checked, aria-expanded, etc.)
   - Properties define relationships (aria-controls, aria-labelledby, etc.)
   - Keyboard support enables interaction via keyboard

3. **Accessibility Requirements**
   - Must have proper role
   - Must have perceivable name (label)
   - Must support keyboard navigation
   - Must announce state changes
   - Must work with screen readers and voice control

4. **When to Use Widgets**
   - Building custom UI components
   - Modifying behavior of standard elements
   - Creating complex interactive patterns
   - When semantic HTML can't express intent

### Code Example

```html
<!-- CUSTOM BUTTON -->
<!-- ❌ Bad: No accessibility -->
<div onclick="submit()">Submit</div>

<!-- ✅ Good: Semantic button -->
<button onclick="submit()">Submit</button>

<!-- ✅ Good: Custom button with ARIA -->
<div
  role="button"
  tabindex="0"
  onclick="submit()"
  onkeypress="handleKeyPress(event)"
  aria-label="Submit form"
>
  Submit
</div>

<!-- CUSTOM CHECKBOX -->
<!-- ❌ Bad: No accessibility -->
<div class="checkbox" onclick="toggleCheck()">
  <div class="checkmark"></div>
  Remember me
</div>

<!-- ✅ Good: Semantic checkbox -->
<label>
  <input type="checkbox" id="remember">
  Remember me
</label>

<!-- ✅ Good: Custom checkbox with ARIA -->
<div
  role="checkbox"
  aria-checked="false"
  aria-label="Remember me"
  tabindex="0"
  onclick="toggleCheckbox()"
  onkeydown="handleCheckboxKeyDown(event)"
>
  <div class="checkmark"></div>
  <span>Remember me</span>
</div>

<script>
function toggleCheckbox() {
  const checkbox = event.currentTarget;
  const isChecked = checkbox.getAttribute('aria-checked') === 'true';
  checkbox.setAttribute('aria-checked', !isChecked);
}

function handleCheckboxKeyDown(event) {
  if (event.key === ' ' || event.key === 'Enter') {
    toggleCheckbox();
    event.preventDefault();
  }
}
</script>

<!-- CUSTOM DROPDOWN / COMBOBOX -->
<!-- ❌ Bad: No accessibility -->
<div class="custom-dropdown" onclick="toggleDropdown()">
  <div class="selected-value">Select Option</div>
  <ul class="dropdown-menu" style="display:none">
    <li onclick="selectOption('opt1')">Option 1</li>
    <li onclick="selectOption('opt2')">Option 2</li>
    <li onclick="selectOption('opt3')">Option 3</li>
  </ul>
</div>

<!-- ✅ Good: Native select -->
<label for="options">Choose option:</label>
<select id="options">
  <option>Option 1</option>
  <option>Option 2</option>
  <option>Option 3</option>
</select>

<!-- ✅ Good: Custom dropdown with ARIA -->
<div class="custom-dropdown">
  <label id="dropdown-label">Choose option:</label>

  <button
    id="dropdown-trigger"
    aria-haspopup="listbox"
    aria-expanded="false"
    aria-labelledby="dropdown-label"
    onclick="toggleDropdown()"
  >
    <span id="selected-value">Select Option</span>
    <span aria-hidden="true">▼</span>
  </button>

  <ul
    role="listbox"
    id="dropdown-menu"
    aria-labelledby="dropdown-label"
    hidden
  >
    <li role="option" aria-selected="true" data-value="opt1">
      Option 1
    </li>
    <li role="option" aria-selected="false" data-value="opt2">
      Option 2
    </li>
    <li role="option" aria-selected="false" data-value="opt3">
      Option 3
    </li>
  </ul>
</div>

<script>
let currentSelection = 'opt1';

function toggleDropdown() {
  const button = document.getElementById('dropdown-trigger');
  const menu = document.getElementById('dropdown-menu');
  const isOpen = button.getAttribute('aria-expanded') === 'true';

  button.setAttribute('aria-expanded', !isOpen);
  menu.hidden = isOpen;

  if (!isOpen) {
    menu.focus();
  }
}

function selectOption(value) {
  const button = document.getElementById('dropdown-trigger');
  const menu = document.getElementById('dropdown-menu');
  const options = menu.querySelectorAll('[role="option"]');

  // Update selected value
  currentSelection = value;
  document.getElementById('selected-value').textContent =
    Array.from(options).find(opt => opt.dataset.value === value).textContent;

  // Update aria-selected on all options
  options.forEach(opt => {
    opt.setAttribute('aria-selected', opt.dataset.value === value);
  });

  // Close dropdown
  button.setAttribute('aria-expanded', 'false');
  menu.hidden = true;
  button.focus();
}

// Keyboard support
document.getElementById('dropdown-menu').addEventListener('keydown', (e) => {
  const options = Array.from(e.currentTarget.querySelectorAll('[role="option"]'));
  const current = document.activeElement;
  const currentIndex = options.indexOf(current);

  if (e.key === 'ArrowDown' && currentIndex < options.length - 1) {
    options[currentIndex + 1].focus();
    e.preventDefault();
  } else if (e.key === 'ArrowUp' && currentIndex > 0) {
    options[currentIndex - 1].focus();
    e.preventDefault();
  } else if (e.key === 'Enter' || e.key === ' ') {
    selectOption(current.dataset.value);
    e.preventDefault();
  } else if (e.key === 'Escape') {
    document.getElementById('dropdown-trigger').setAttribute('aria-expanded', 'false');
    document.getElementById('dropdown-menu').hidden = true;
    document.getElementById('dropdown-trigger').focus();
    e.preventDefault();
  }
});
</script>

<!-- TAB INTERFACE -->
<!-- ❌ Bad: No accessibility -->
<div class="tabs">
  <div class="tab-buttons">
    <button class="tab-btn active" onclick="showTab('tab1')">Tab 1</button>
    <button class="tab-btn" onclick="showTab('tab2')">Tab 2</button>
  </div>

  <div id="tab1" class="tab-panel">Content 1</div>
  <div id="tab2" class="tab-panel" style="display:none">Content 2</div>
</div>

<!-- ✅ Good: Tabs with ARIA -->
<div class="tabs">
  <div role="tablist" aria-label="Settings tabs">
    <button
      role="tab"
      id="tab-1"
      aria-selected="true"
      aria-controls="panel-1"
      onclick="switchTab('tab-1')"
    >
      General
    </button>

    <button
      role="tab"
      id="tab-2"
      aria-selected="false"
      aria-controls="panel-2"
      onclick="switchTab('tab-2')"
    >
      Privacy
    </button>

    <button
      role="tab"
      id="tab-3"
      aria-selected="false"
      aria-controls="panel-3"
      onclick="switchTab('tab-3')"
    >
      Notifications
    </button>
  </div>

  <div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
    <h2>General Settings</h2>
    <!-- General settings content -->
  </div>

  <div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
    <h2>Privacy Settings</h2>
    <!-- Privacy settings content -->
  </div>

  <div role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>
    <h2>Notification Settings</h2>
    <!-- Notification settings content -->
  </div>
</div>

<script>
function switchTab(tabId) {
  const tabs = document.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"]');

  // Hide all panels
  panels.forEach(panel => panel.hidden = true);

  // Deselect all tabs
  tabs.forEach(tab => {
    tab.setAttribute('aria-selected', 'false');
    tab.tabIndex = -1;
  });

  // Show selected tab panel
  const selectedTab = document.getElementById(tabId);
  const panelId = selectedTab.getAttribute('aria-controls');
  document.getElementById(panelId).hidden = false;

  // Select current tab
  selectedTab.setAttribute('aria-selected', 'true');
  selectedTab.tabIndex = 0;
  selectedTab.focus();
}

// Keyboard support for tabs
document.querySelectorAll('[role="tablist"]').forEach(tablist => {
  tablist.addEventListener('keydown', (e) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const currentTab = document.activeElement;
    const currentIndex = tabs.indexOf(currentTab);

    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % tabs.length;
      tabs[nextIndex].focus();
      switchTab(tabs[nextIndex].id);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : tabs.length - 1;
      tabs[prevIndex].focus();
      switchTab(tabs[prevIndex].id);
      e.preventDefault();
    } else if (e.key === 'Home') {
      tabs[0].focus();
      switchTab(tabs[0].id);
      e.preventDefault();
    } else if (e.key === 'End') {
      tabs[tabs.length - 1].focus();
      switchTab(tabs[tabs.length - 1].id);
      e.preventDefault();
    }
  });
});
</script>

<!-- MODAL DIALOG -->
<!-- ❌ Bad: No accessibility -->
<div class="modal" id="dialog" style="display:none">
  <div class="modal-content">
    <h2>Confirm Delete</h2>
    <p>Are you sure?</p>
    <button onclick="deleteItem(); closeDialog()">Delete</button>
    <button onclick="closeDialog()">Cancel</button>
  </div>
</div>

<!-- ✅ Good: Modal with ARIA -->
<div
  role="dialog"
  id="delete-dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  hidden
>
  <div class="modal-content">
    <h2 id="dialog-title">Confirm Delete</h2>
    <p id="dialog-desc">This action cannot be undone. Are you sure?</p>

    <div class="modal-buttons">
      <button onclick="confirmDelete()">Delete</button>
      <button onclick="closeDialog()">Cancel</button>
    </div>
  </div>
</div>

<script>
let previouslyFocused = null;

function openDialog() {
  previouslyFocused = document.activeElement;

  const dialog = document.getElementById('delete-dialog');
  dialog.hidden = false;

  // Trap focus within dialog
  const focusableElements = dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Focus first button
  firstElement.focus();

  // Trap tab key
  dialog.addEventListener('keydown', trapFocus);

  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  // Handle Escape key
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDialog();
    }
  });
}

function closeDialog() {
  const dialog = document.getElementById('delete-dialog');
  dialog.hidden = true;

  // Restore focus
  if (previouslyFocused) {
    previouslyFocused.focus();
  }
}

function confirmDelete() {
  // Delete logic
  closeDialog();
}

// Open dialog button
document.querySelector('[onclick="openDialog()"]')?.addEventListener('click', openDialog);
</script>

<!-- REACT EXAMPLE: Accessible Accordion -->
function AccordionItem({ title, children, isOpen, onToggle, id }) {
  return (
    <div className="accordion-item">
      <button
        role="button"
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
        onClick={onToggle}
        className="accordion-trigger"
      >
        {title}
        <span aria-hidden="true">{isOpen ? '▼' : '▶'}</span>
      </button>

      <div
        id={`panel-${id}`}
        role="region"
        aria-labelledby={`trigger-${id}`}
        hidden={!isOpen}
        className="accordion-panel"
      >
        {children}
      </div>
    </div>
  );
}

function Accordion({ items }) {
  const [openItem, setOpenItem] = useState(null);

  return (
    <div role="region" aria-label="Accordion">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          id={index}
          title={item.title}
          children={item.content}
          isOpen={openItem === index}
          onToggle={() => setOpenItem(openItem === index ? null : index)}
        />
      ))}
    </div>
  );
}
```

### Common Mistakes

❌ **Mistake:** Widget without keyboard support
```html
<div role="button" onclick="delete()">Delete</div>
```

✅ **Correct:** Add keyboard support
```html
<div
  role="button"
  tabindex="0"
  onclick="delete()"
  onkeydown="event.key === 'Enter' && delete()"
>
  Delete
</div>
```

❌ **Mistake:** No state indication
```html
<div role="checkbox" onclick="toggle()">
  Agree to terms
</div>
```

✅ **Correct:** Indicate state
```html
<div
  role="checkbox"
  aria-checked="false"
  onclick="toggle()"
  onkeydown="event.key === ' ' && toggle()"
>
  Agree to terms
</div>
```

<details>
<summary><strong>🔍 Deep Dive: ARIA Widget Role Implementation & Browser Processing</strong></summary>

**Widget Role Categories & Their Purposes:**

ARIA widget roles fall into distinct categories based on their interaction patterns:

**1. Button-like Widgets** (button, link, menuitem)
- Activated by click or keyboard (Enter/Space)
- No persistent state (except toggle buttons with aria-pressed)
- Simple interaction model: user triggers action, widget executes

**2. Selection Widgets** (checkbox, radio, switch, option)
- Maintain state (checked/unchecked, selected/not selected)
- Announce current state to assistive technologies
- Support toggle interaction (Space key typically)
- Multiple checkboxes allowed, radios are mutually exclusive

**3. Container Widgets** (listbox, menu, menubar, tablist, tree, grid)
- Manage collections of child widgets
- Handle keyboard navigation between children (Arrow keys)
- Maintain focus and selection state
- Complex focus management (roving tabindex pattern)

**4. Panel Widgets** (tabpanel, region, dialog, alertdialog)
- Display related content
- Often controlled by other widgets (tabs control tabpanels)
- May trap focus (modals) or allow escape (non-modals)
- Require proper labeling and relationships

**5. Feedback Widgets** (alert, status, progressbar, timer)
- Communicate state or progress to users
- Use aria-live for dynamic announcements
- Don't require direct interaction
- Critical for asynchronous operations

**How Browsers Process Widget Roles:**

When a browser encounters a widget role, it:

1. **Creates Accessibility Tree Node**: Maps the DOM element to an accessible object
2. **Assigns Role**: Sets the accessible role (button, checkbox, etc.)
3. **Computes Name**: Determines accessible name from aria-label, aria-labelledby, or content
4. **Determines State**: Reads ARIA state attributes (aria-checked, aria-expanded, etc.)
5. **Builds Properties**: Collects ARIA properties (aria-controls, aria-describedby, etc.)
6. **Exposes to AT**: Makes information available via platform accessibility APIs (IA2, UIA, AX API)

**State Management Patterns:**

Each widget type requires specific state attributes:

**Checkbox Pattern:**
```javascript
// When implementing custom checkbox
element.setAttribute('role', 'checkbox');
element.setAttribute('aria-checked', 'false');  // Initial state
element.setAttribute('tabindex', '0');  // Keyboard focusable

// On toggle
element.setAttribute('aria-checked', !isChecked);
// Screen reader announces: "Checkbox checked" or "Checkbox not checked"
```

**Tab Pattern:**
```javascript
// Tab must announce selected state
tab.setAttribute('role', 'tab');
tab.setAttribute('aria-selected', 'true');  // Active tab
tab.setAttribute('aria-controls', 'panel-id');  // Which panel it controls
tab.setAttribute('tabindex', '0');  // Active tab is focusable

// Inactive tabs
inactiveTabs.forEach(t => {
  t.setAttribute('aria-selected', 'false');
  t.setAttribute('tabindex', '-1');  // Not in tab order
});
```

**Dialog Pattern:**
```javascript
// Modal dialog must trap focus
dialog.setAttribute('role', 'dialog');
dialog.setAttribute('aria-modal', 'true');  // Informs AT of modal behavior
dialog.setAttribute('aria-labelledby', 'title-id');  // Accessible name

// When dialog opens
previousFocus = document.activeElement;  // Remember where user was
dialog.querySelector('[autofocus]').focus();  // Focus first element
trapFocus(dialog);  // Prevent tab escaping dialog

// When dialog closes
previousFocus.focus();  // Return focus
```

**Keyboard Interaction Patterns (ARIA Authoring Practices Guide):**

Each widget type has standardized keyboard behaviors:

**Button:**
- Enter: Activates button
- Space: Activates button

**Checkbox:**
- Space: Toggles checked state

**Radio Group:**
- Tab: Moves focus into/out of radio group
- Arrow keys: Move focus between radios and select
- Space: Selects focused radio (if not already)

**Tab Panel:**
- Tab: Moves focus into tab list (first time), then normally through content
- Arrow Left/Right: Navigate between tabs
- Home: First tab
- End: Last tab
- Activation follows focus automatically or on Enter/Space

**Menu:**
- Arrow Up/Down: Navigate between menu items
- Home/End: First/last menu item
- Enter/Space: Activate menu item
- Escape: Close menu
- Character keys: Type-ahead to menu items

**Dialog:**
- Tab: Cycles through focusable elements in dialog
- Escape: Closes dialog
- Focus trap: Tab never leaves dialog while open

**Focus Management Strategies:**

**Roving Tabindex Pattern (for toolbars, menus, grids):**
```javascript
// Only one child is in tab order at a time
container.addEventListener('keydown', (e) => {
  const items = Array.from(container.querySelectorAll('[role="menuitem"]'));
  const currentIndex = items.indexOf(document.activeElement);

  if (e.key === 'ArrowDown') {
    // Remove current from tab order
    items[currentIndex].tabIndex = -1;

    // Add next to tab order and focus
    const nextIndex = (currentIndex + 1) % items.length;
    items[nextIndex].tabIndex = 0;
    items[nextIndex].focus();

    e.preventDefault();
  }
});
```

**Focus Trap Pattern (for modals):**
```javascript
function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {  // Shift+Tab
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {  // Tab
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });
}
```

**Testing Widget Accessibility:**

Comprehensive widget testing requires:

1. **Screen Reader Testing:**
   - Role announced correctly? ("button", "checkbox checked", "tab", etc.)
   - State changes announced? (checking checkbox, expanding accordion)
   - Name and description clear?
   - Relationships understood? (tab controls tabpanel)

2. **Keyboard Testing:**
   - All interactions possible without mouse?
   - Keyboard shortcuts match expected patterns?
   - Focus visible at all times?
   - Focus trap works in modals?

3. **Voice Control Testing:**
   - Can user say "click Submit button"?
   - Voice commands work with custom widgets?
   - Labels are speakable?

4. **Cross-browser Testing:**
   - Works in Chrome, Firefox, Safari, Edge?
   - Mobile browsers (iOS Safari, Chrome Android)?
   - ARIA support consistent across browsers?

5. **Assistive Technology Combination Testing:**
   - NVDA + Firefox (Windows)
   - JAWS + Chrome (Windows)
   - VoiceOver + Safari (Mac/iOS)
   - TalkBack + Chrome (Android)

**Browser Accessibility API Mapping:**

Different platforms expose ARIA differently:

| Platform | API | Role Mapping | State Exposure |
|----------|-----|--------------|----------------|
| Windows | IA2 (IAccessible2) | role="button" → ROLE_PUSH_BUTTON | aria-checked → STATE_CHECKED |
| Windows | UIA (UI Automation) | role="button" → ControlType.Button | aria-checked → ToggleState |
| macOS/iOS | AX API | role="button" → AXButton | aria-checked → AXValue |
| Linux | ATK/AT-SPI | role="button" → ATK_ROLE_PUSH_BUTTON | aria-checked → STATE_CHECKED |
| Android | Accessibility API | role="button" → Button | aria-checked → isChecked() |

This is why testing across platforms matters—each may expose ARIA slightly differently.

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Inaccessible Custom Date Picker Causing User Dropoff</strong></summary>

**Problem:** Popular SaaS application's custom date picker was completely unusable for keyboard and screen reader users, causing 40% task abandonment rate.

**Context:**

A project management SaaS with 500K+ users released a beautiful custom date picker for selecting task deadlines. The design team created a visually stunning component with smooth animations and a modern UI. However, they used entirely `<div>` and `<span>` elements with CSS and JavaScript, no semantic HTML.

**Initial Metrics (Before Fix):**

**Accessibility Failures:**
- Keyboard-only users: **0% success rate** (completely unusable)
- Screen reader users: **5% success rate** (only found input by chance)
- Mobile screen reader users: **0% success rate** (couldn't even open calendar)
- Voice control users: **0% success rate** (no voice commands worked)

**Business Impact:**
- Task creation abandonment: **40%** when date picker appeared
- Support tickets: **150+ per month** about "can't select dates"
- Legal risk: ADA compliance violation (received complaint from user)
- User sentiment: Net Promoter Score dropped **15 points**

**Root Cause Analysis:**

The custom date picker had zero accessibility features:

```javascript
// BEFORE: Completely inaccessible implementation
function DatePicker() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <div className="datepicker">
      {/* No role, no keyboard support, no labels */}
      <div onClick={() => setMonth(month - 1)} className="prev-btn">
        &lt;  {/* Decorative arrow, meaningless to screen readers */}
      </div>

      <div className="month-year">
        {formatMonth(month)} {year}  {/* Screen reader reads separately */}
      </div>

      <div onClick={() => setMonth(month + 1)} className="next-btn">
        &gt;
      </div>

      <div className="calendar">
        {getDaysInMonth(month, year).map(day => (
          <div
            key={day}
            onClick={() => selectDate(day)}
            className={isToday(day) ? 'today' : ''}
          >
            {day}  {/* Just a number, no context */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**User Testing Revealed:**

**Screen Reader User (NVDA + Firefox):**
- Encounters date picker: "Clickable clickable clickable... wait, what is this?"
- Tries to navigate: "I hear numbers but don't know what they mean"
- Gives up after 3 minutes: "I'll just skip setting a due date"

**Keyboard-only User:**
- Presses Tab: Focus skips entire date picker (no tabindex)
- Clicks outside date picker: "Can I even use this with keyboard?"
- Abandons task creation entirely

**Mobile Screen Reader User (VoiceOver + iOS Safari):**
- Taps date picker area: "Button. Button. Double-tap to activate."
- Double-taps: Nothing happens (onClick doesn't work with VoiceOver)
- Tries swiping: Gets stuck in calendar grid with no way to escape

**Solution Implemented:**

```javascript
// AFTER: Fully accessible date picker
function AccessibleDatePicker({ value, onChange, label, id }) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(new Date(value).getMonth());
  const [year, setYear] = useState(new Date(value).getFullYear());
  const [focusedDate, setFocusedDate] = useState(value.getDate());
  const dialogRef = useRef();
  const triggerRef = useRef();
  const previousFocus = useRef();

  // Handle opening dialog
  const openDialog = () => {
    previousFocus.current = document.activeElement;
    setIsOpen(true);
    setTimeout(() => {
      // Focus first element in dialog
      const firstFocusable = dialogRef.current.querySelector('button');
      firstFocusable?.focus();
    }, 100);
  };

  // Handle closing dialog
  const closeDialog = () => {
    setIsOpen(false);
    // Return focus to trigger button
    triggerRef.current?.focus();
  };

  // Handle month navigation
  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    // Announce month change to screen readers
    announce(`${formatMonth(month - 1)} ${month === 0 ? year - 1 : year}`);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    announce(`${formatMonth(month + 1)} ${month === 11 ? year + 1 : year}`);
  };

  // Handle date selection
  const handleDayClick = (day) => {
    const selectedDate = new Date(year, month, day);
    onChange(selectedDate);
    setIsOpen(false);
    announce(`Selected ${formatDate(selectedDate)}`);
    triggerRef.current?.focus();
  };

  // Keyboard navigation in calendar grid
  const handleCalendarKeyDown = (e, currentDay) => {
    const daysInMonth = getDaysInMonth(year, month).filter(d => d > 0);
    const currentIndex = daysInMonth.indexOf(currentDay);

    let nextDay = currentDay;

    switch (e.key) {
      case 'ArrowLeft':
        nextDay = currentIndex > 0 ? daysInMonth[currentIndex - 1] : currentDay;
        break;
      case 'ArrowRight':
        nextDay = currentIndex < daysInMonth.length - 1 ? daysInMonth[currentIndex + 1] : currentDay;
        break;
      case 'ArrowUp':
        nextDay = currentIndex >= 7 ? daysInMonth[currentIndex - 7] : currentDay;
        break;
      case 'ArrowDown':
        nextDay = currentIndex + 7 < daysInMonth.length ? daysInMonth[currentIndex + 7] : currentDay;
        break;
      case 'Home':
        nextDay = daysInMonth[0];
        break;
      case 'End':
        nextDay = daysInMonth[daysInMonth.length - 1];
        break;
      case 'PageUp':
        handlePrevMonth();
        return;
      case 'PageDown':
        handleNextMonth();
        return;
      case 'Escape':
        closeDialog();
        return;
      case 'Enter':
      case ' ':
        handleDayClick(currentDay);
        e.preventDefault();
        return;
      default:
        return;
    }

    if (nextDay !== currentDay) {
      setFocusedDate(nextDay);
      e.preventDefault();
      // Focus will update after state change
    }
  };

  return (
    <div className="date-picker-container">
      {/* Input trigger */}
      <label id={`${id}-label`} htmlFor={`${id}-input`}>
        {label}
      </label>

      <input
        id={`${id}-input`}
        ref={triggerRef}
        type="text"
        value={formatDate(value)}
        readOnly
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={openDialog}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            openDialog();
            e.preventDefault();
          }
        }}
      />

      {/* Calendar dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-dialog-title`}
          ref={dialogRef}
          className="datepicker-dialog"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeDialog();
            }
          }}
        >
          <div className="datepicker-header">
            <button
              onClick={handlePrevMonth}
              aria-label={`Previous month, ${formatMonth(month - 1 >= 0 ? month - 1 : 11)}`}
              className="month-nav-btn"
            >
              &lt;
            </button>

            <h2 id={`${id}-dialog-title`} aria-live="polite">
              {formatMonth(month)} {year}
            </h2>

            <button
              onClick={handleNextMonth}
              aria-label={`Next month, ${formatMonth(month + 1 <= 11 ? month + 1 : 0)}`}
              className="month-nav-btn"
            >
              &gt;
            </button>
          </div>

          <div className="weekday-labels" role="row">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} role="columnheader" aria-label={day}>
                {day.charAt(0)}
              </div>
            ))}
          </div>

          <div className="calendar-grid" role="grid" aria-labelledby={`${id}-dialog-title`}>
            {getDaysInMonth(year, month).map((day, index) => (
              day ? (
                <button
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day)}
                  onKeyDown={(e) => handleCalendarKeyDown(e, day)}
                  aria-label={`${formatMonth(month)} ${day}, ${year}${isToday(day, month, year) ? ', today' : ''}`}
                  aria-current={isToday(day, month, year) ? 'date' : undefined}
                  className={`calendar-day ${isToday(day, month, year) ? 'today' : ''} ${focusedDate === day ? 'focused' : ''}`}
                  tabIndex={focusedDate === day ? 0 : -1}
                  autoFocus={focusedDate === day}
                >
                  {day}
                </button>
              ) : (
                <div key={`empty-${index}`} className="empty-cell" role="gridcell" />
              )
            ))}
          </div>

          <div className="datepicker-actions">
            <button onClick={closeDialog}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Live region for announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {/* Announcements appear here */}
      </div>
    </div>
  );
}

// Helper function to announce to screen readers
function announce(message) {
  const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
  if (liveRegion) {
    liveRegion.textContent = message;
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
}
```

**Results After Implementation:**

**Accessibility Metrics:**
- Keyboard-only users: **95% success rate** (from 0%)
- Screen reader users: **90% success rate** (from 5%)
- Mobile screen reader users: **85% success rate** (from 0%)
- Voice control users: **92% success rate** (from 0%)

**Business Metrics:**
- Task creation abandonment: **12%** (from 40%, 70% improvement)
- Support tickets: **8 per month** (from 150+, 95% reduction)
- Legal risk: Complaint resolved, ADA compliance achieved
- User sentiment: Net Promoter Score **+22 points** recovery

**User Feedback:**
- "Finally I can set due dates!" - Screen reader user
- "Arrow keys work perfectly for navigation" - Keyboard user
- "I can say 'click next month button' and it works!" - Voice control user
- "Mobile VoiceOver actually works now" - iPhone user

**Technical Achievements:**
- Full WCAG 2.1 Level AA compliance
- Works with all major screen readers (NVDA, JAWS, VoiceOver, TalkBack)
- Keyboard navigation matches ARIA Authoring Practices Guide standards
- Voice control compatible (clear button labels)
- Focus management perfect (focus trap in dialog, returns to trigger on close)
- Live regions announce month changes dynamically

**Implementation Details:**
- Development time: **80 hours** (2 developers × 2.5 weeks)
- Testing time: **40 hours** (comprehensive AT testing)
- Training: **12 hours** for team on widget accessibility patterns
- Documentation: Created internal accessibility widget library

**Cost-Benefit Analysis:**
- Development cost: $12,000 (80 hours × $150/hr average)
- Support cost savings: $42,000/year (142 fewer tickets × $25/ticket × 12 months)
- Legal risk avoided: $50,000-$500,000 (potential ADA lawsuit)
- ROI: **350%+ in first year** from support savings alone

</details>

<details>
<summary><strong>⚖️ Trade-offs: Native HTML vs Custom ARIA Widgets Decision Matrix</strong></summary>

**Widget Implementation Approaches:**

| Widget Type | Native HTML | Custom ARIA | Use Native When | Use Custom When | Complexity | Maintenance |
|-------------|-------------|-------------|-----------------|-----------------|------------|-------------|
| **Button** | `<button>` | `role="button"` | Always (99% of cases) | Extreme styling needs prevent native button | Low | Minimal |
| **Checkbox** | `<input type="checkbox">` | `role="checkbox"` | Always (95% of cases) | Custom visual design impossible with CSS | Low | Low |
| **Radio** | `<input type="radio">` | `role="radio"` | Always (95% of cases) | Custom visual design needed | Low | Low |
| **Dropdown** | `<select>` | `role="combobox"` | Simple selections (< 20 options) | Search/filter needed, complex UI, grouping | High | High |
| **Dialog** | `<dialog>` | `role="dialog"` | Modern browsers only (90%+ support) | Need IE11 support, complex interactions | Medium | Medium |
| **Tabs** | No native equivalent | `role="tablist"` + `role="tab"` | N/A (no native HTML) | Always use ARIA for tabs | Medium | Medium |
| **Accordion** | `<details>`/`<summary>` | `role="button"` + `aria-expanded` | Simple expand/collapse | Need custom animation, complex state | Low-Medium | Low-Medium |
| **Date Picker** | `<input type="date">` | Custom with ARIA | Mobile, simple date selection | Desktop, complex date rules, range selection | Very High | Very High |

**Semantic HTML vs Custom ARIA Detailed Comparison:**

**1. Button**

**Native HTML:**
```html
<button onclick="submit()">Submit</button>
```
- **Pros:** Zero ARIA needed, works everywhere, keyboard support automatic, screen reader compatible
- **Cons:** Limited styling (but CSS can handle 95% of needs)
- **Browser support:** 100% across all browsers
- **Accessibility:** Perfect out-of-box
- **Maintenance:** Minimal

**Custom ARIA:**
```html
<div
  role="button"
  tabindex="0"
  onclick="submit()"
  onkeydown="handleKeyPress(event)"
  aria-label="Submit form"
>
  Submit
</div>
```
- **Pros:** Unlimited styling freedom
- **Cons:** 5-10x more code, keyboard handler required, tabindex management, easier to break
- **Browser support:** 95%+ (some older mobile browsers inconsistent)
- **Accessibility:** Requires manual implementation
- **Maintenance:** High (easy to break during refactoring)

**Recommendation:** **Always use `<button>`** unless you have an extremely compelling visual design reason that CSS absolutely cannot solve (happens < 1% of the time).

**2. Checkbox**

**Native HTML:**
```html
<label>
  <input type="checkbox" id="agree">
  I agree to terms
</label>
```
- **Pros:** Zero ARIA, keyboard support (Space), state management automatic, label association built-in
- **Cons:** Limited visual customization (but CSS custom checkboxes work great)
- **Styling solution:** Use CSS to hide input, style label with ::before/::after
- **Maintenance:** Minimal

**Custom ARIA:**
```html
<div
  role="checkbox"
  aria-checked="false"
  aria-label="I agree to terms"
  tabindex="0"
  onclick="toggle()"
  onkeydown="handleSpace(event)"
>
  <div class="checkmark"></div>
  <span>I agree to terms</span>
</div>
```
- **Pros:** Complete visual control
- **Cons:** 10x more code, state management manual, keyboard handler needed, mixed state (indeterminate) harder
- **Maintenance:** High (state sync bugs common)

**Recommendation:** **Use native `<input type="checkbox">`** and style with CSS. Custom ARIA checkbox only if client demands impossible-to-achieve visual design.

**3. Dropdown/Select**

**Native HTML:**
```html
<label for="options">Choose option:</label>
<select id="options">
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
  <option value="3">Option 3</option>
</select>
```
- **Pros:** Zero ARIA, perfect accessibility, mobile-optimized (OS picker), fast performance
- **Cons:** Very limited styling, no search/filter, no custom rendering
- **Use for:** Simple selections, mobile-first apps, when < 20 options

**Custom ARIA Combobox:**
```html
<div class="custom-dropdown">
  <label id="dropdown-label">Choose option:</label>
  <button
    aria-haspopup="listbox"
    aria-expanded="false"
    aria-labelledby="dropdown-label"
  >
    Select Option
  </button>
  <ul role="listbox" aria-labelledby="dropdown-label" hidden>
    <li role="option" aria-selected="true">Option 1</li>
    <li role="option" aria-selected="false">Option 2</li>
  </ul>
</div>
```
- **Pros:** Unlimited styling, search/filter possible, custom rendering (icons, images)
- **Cons:** 50-100x more code, complex keyboard navigation (Arrow keys, Home/End, type-ahead), state management, mobile UX worse than native
- **Use for:** Complex selections, desktop apps, when search needed

**Recommendation:** **Default to `<select>`** for simple cases. Only build custom combobox when you need search, filtering, or complex rendering that justifies the 50-100 hour implementation cost.

**4. Dialog/Modal**

**Native `<dialog>`:**
```html
<dialog id="myDialog">
  <h2>Dialog Title</h2>
  <p>Content...</p>
  <button onclick="closeDialog()">Close</button>
</dialog>
<script>
  myDialog.showModal();  // Focus trap automatic!
</script>
```
- **Pros:** Focus trap automatic, ESC key support built-in, backdrop clicks handled, minimal ARIA needed
- **Cons:** Browser support only 90%+ (no IE11)
- **Use for:** Modern apps that don't need IE11

**Custom ARIA Dialog:**
```html
<div role="dialog" aria-modal="true" aria-labelledby="title">
  <h2 id="title">Dialog Title</h2>
  <p>Content...</p>
  <button>Close</button>
</div>
```
Plus 50-100 lines of JavaScript for:
- Focus trap implementation
- ESC key handling
- Backdrop click handling
- Focus return on close

**Recommendation:** **Use native `<dialog>`** if you can drop IE11 support. Otherwise, use custom ARIA dialog or a battle-tested library (Reach UI, Radix UI).

**Performance Considerations:**

| Approach | Parse Time | Memory Usage | First Paint | Interaction Latency |
|----------|-----------|--------------|-------------|---------------------|
| **Native HTML** | Fast (browser-optimized) | Low (native elements) | Faster (less CSS) | Instant (native behavior) |
| **Custom ARIA** | Slower (more DOM nodes) | Higher (extra divs/spans) | Slower (more CSS rules) | Depends on JS quality |
| **Impact** | 10-50ms difference | 1-5KB per widget | 20-100ms difference | 0-50ms difference |

**Maintenance Burden Over Time:**

| Year | Native HTML Bugs | Custom ARIA Bugs | Notes |
|------|------------------|------------------|-------|
| Year 1 | 0-2 bugs | 5-15 bugs | Initial development, QA catches most issues |
| Year 2 | 0-1 bugs | 3-8 bugs | State sync bugs emerge, edge cases discovered |
| Year 3+ | 0-1 bugs | 2-5 bugs | Ongoing issues with browser updates, refactoring |
| **Total** | 1-4 bugs | 10-28 bugs | **5-7x more bugs with custom ARIA** |

**Decision Framework:**

Use **Native HTML** when:
1. ✅ Native element exists and does 80%+ of what you need
2. ✅ Styling needs can be met with CSS (use creative solutions first)
3. ✅ Mobile users are significant (20%+ traffic)
4. ✅ Team lacks deep accessibility expertise
5. ✅ Fast time-to-market is critical

Use **Custom ARIA** when:
1. ✅ No native element exists (tabs, tooltips, steppers)
2. ✅ Visual design absolutely cannot be achieved with CSS (confirmed by 2+ senior devs)
3. ✅ Advanced features needed (search in dropdown, complex keyboard shortcuts)
4. ✅ Desktop-only app or enterprise internal tool
5. ✅ Team has accessibility expertise AND can commit 50-200 hours per complex widget

**Real-World Cost Comparison:**

| Widget | Native HTML Cost | Custom ARIA Cost | ROI of Custom |
|--------|------------------|------------------|---------------|
| Button | 1 hour | 5-10 hours | Negative (rarely worth it) |
| Checkbox | 2 hours | 10-15 hours | Negative (rarely worth it) |
| Dropdown (simple) | 2 hours | 50-80 hours | Negative (almost never worth it) |
| Dropdown (searchable) | N/A (native can't do it) | 80-120 hours | Positive if search is critical |
| Date Picker | 3 hours (input type="date") | 100-200 hours | Depends on features needed |
| Tabs | N/A (no native) | 20-40 hours | Neutral (necessary if needed) |
| Dialog | 5 hours (native `<dialog>`) | 40-60 hours | Negative (use native if possible) |

**Progressive Enhancement Strategy:**

Best approach for many widgets:

1. **Start with native HTML** (works for 80% of users)
2. **Add CSS enhancements** (works for 95% of users)
3. **Add ARIA improvements** (works for 98% of users)
4. **Add custom JS only when absolutely necessary** (works for 100%, but costs 10x more)

Example:
```html
<!-- Step 1: Native HTML (works everywhere) -->
<select id="options">
  <option>Option 1</option>
</select>

<!-- Step 2: CSS enhancement (styled but still native) -->
<select id="options" class="custom-select-styling">
  <option>Option 1</option>
</select>

<!-- Step 3: Only if client demands search feature... -->
<!-- ...then build custom combobox with full ARIA -->
```

This approach minimizes cost while maximizing accessibility.

</details>

<details>
<summary><strong>💬 Explain to Junior: Understanding Widget Roles Through Everyday Analogies</strong></summary>

**What are Widget Roles? The Remote Control Analogy**

Think of widget roles like **buttons on a TV remote control**:

**Without ARIA (a custom div):**
```
You hand someone a blank rectangle of plastic. They press it. Nothing happens. They have no idea what it does or if it's even a button.
```

**With ARIA role="button":**
```
You hand someone a button labeled "Power". They know:
1. It's a button (not a slider or switch)
2. What it does (turns TV on/off)
3. How to use it (press it)
```

**Widget Roles Tell Screen Readers:**
1. **What is it?** (button, checkbox, tab, slider)
2. **What's it called?** (via aria-label or text content)
3. **What state is it in?** (checked, expanded, pressed)
4. **How do I interact with it?** (click, toggle, select)

**Common Widget Roles You'll Use:**

**1. Button (role="button")**

Think: A doorbell

```html
<div role="button" tabindex="0">Click me</div>
```

- **What it does:** Triggers an action when pressed
- **Keyboard:** Space or Enter activates it
- **Screen reader says:** "Click me, button"

**Real-world example:** Submit button, Delete button, "Add to cart" button

**2. Checkbox (role="checkbox" + aria-checked)**

Think: A light switch (can be on or off)

```html
<div role="checkbox" aria-checked="false" tabindex="0">
  Agree to terms
</div>
```

- **What it does:** Toggles between checked/unchecked
- **Keyboard:** Space toggles it
- **Screen reader says:** "Agree to terms, checkbox, not checked"
- **After toggle:** "Agree to terms, checkbox, checked"

**Real-world example:** "Remember me" login checkbox, email subscription checkbox

**3. Tab (role="tab" + aria-selected)**

Think: Folders in a filing cabinet (only one open at a time)

```html
<button role="tab" aria-selected="false" aria-controls="panel-2">
  Settings
</button>
```

- **What it does:** Shows associated content panel when selected
- **Keyboard:** Arrow keys move between tabs
- **Screen reader says:** "Settings, tab, 2 of 4, not selected"

**Real-world example:** Settings tabs (General, Privacy, Notifications)

**4. Dialog (role="dialog" + aria-modal="true")**

Think: A popup window that demands your attention

```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Delete</h2>
  <p>Are you sure?</p>
  <button>Delete</button>
  <button>Cancel</button>
</div>
```

- **What it does:** Shows important information/asks for input
- **Keyboard:** Tab cycles through buttons, ESC closes
- **Screen reader says:** "Confirm Delete, dialog"

**Real-world example:** Confirmation dialogs, login modals, image lightboxes

**The Minimum Requirements for ANY Widget:**

Every custom widget needs **4 essential pieces**:

**1. Role** - What is it?
```html
<div role="button">
```

**2. Label** - What's it called?
```html
<div role="button" aria-label="Submit form">
```

**3. Keyboard support** - How do I use it without a mouse?
```html
<div
  role="button"
  tabindex="0"
  onclick="submit()"
  onkeydown="if(event.key==='Enter') submit()"
>
```

**4. State** - What condition is it in? (if applicable)
```html
<div
  role="checkbox"
  aria-checked="false"
  tabindex="0"
  onclick="toggle()"
>
```

**Why Native HTML is Better (The "Don't Reinvent the Wheel" Principle):**

**Native button:**
```html
<button onclick="submit()">Submit</button>
```

✅ Automatic keyboard support (Space, Enter)
✅ Automatic screen reader announcement
✅ Automatic focus management
✅ Automatic role
✅ Works everywhere
✅ 1 line of code

**Custom button with ARIA:**
```html
<div
  role="button"
  tabindex="0"
  onclick="submit()"
  onkeydown="handleKeyPress(event)"
  aria-label="Submit"
>
  Submit
</div>

<script>
function handleKeyPress(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    submit();
    e.preventDefault();
  }
}
</script>
```

❌ Manual keyboard support
❌ Manual screen reader setup
❌ Manual focus management
❌ Manual role assignment
❌ More code = more bugs
❌ 15 lines of code

**Rule of Thumb:** If native HTML element exists, **use it**. Only use ARIA when native HTML can't do what you need.

**Common Mistakes Beginners Make:**

**Mistake 1: Forgetting keyboard support**
```html
❌ <div role="button" onclick="delete()">Delete</div>
```
Keyboard users can't activate this!

**Fix:**
```html
✅ <div
     role="button"
     tabindex="0"
     onclick="delete()"
     onkeydown="e.key==='Enter' && delete()"
   >
   Delete
   </div>
```

**Mistake 2: Forgetting state**
```html
❌ <div role="checkbox" onclick="toggle()">Agree</div>
```
Screen reader doesn't know if it's checked or not!

**Fix:**
```html
✅ <div
     role="checkbox"
     aria-checked="false"
     onclick="toggle()"
   >
   Agree
   </div>
```

**Mistake 3: Using divs when native HTML exists**
```html
❌ <div role="button" onclick="submit()">Submit</div>
```
Why use 5 attributes when you can use one element?

**Fix:**
```html
✅ <button onclick="submit()">Submit</button>
```

**Mistake 4: Forgetting focus management in dialogs**
```javascript
❌ // Open dialog but don't move focus
openDialog() {
  dialog.hidden = false;
}
```
Screen reader user doesn't know dialog opened!

**Fix:**
```javascript
✅ // Open dialog AND move focus
openDialog() {
  previousFocus = document.activeElement;
  dialog.hidden = false;
  dialog.querySelector('button').focus();  // Move focus to first button
}

closeDialog() {
  dialog.hidden = true;
  previousFocus.focus();  // Return focus to where user was
}
```

**Interview Answer Template - How to Explain This:**

"Widget roles like button, checkbox, and tab tell assistive technologies what interactive components are and how they behave. When I build a custom button, I add `role='button'` so screen readers know it's clickable. I also add `tabindex='0'` so it's keyboard focusable, keyboard event handlers for Space and Enter keys, and `aria-label` for a clear name.

For example, if I'm building a custom checkbox for special styling, I'd use `role='checkbox'`, `aria-checked` to reflect the state, keyboard support for Space to toggle, and `aria-label` for the label. Then I test with a screen reader like NVDA to ensure it announces the role, name, and state correctly.

However, I always prefer using native HTML elements first—like `<button>`, `<input type='checkbox'>`, and `<select>`—because they have built-in accessibility, keyboard support, and require zero ARIA. I only build custom ARIA widgets when:
1. No native element exists (like tabs or tooltips)
2. The visual design absolutely cannot be achieved with CSS
3. Advanced features are needed that native elements don't support

The key is: **role** defines what it is, **aria-label** defines its name, **keyboard handlers** define how to interact, and **state attributes** like aria-checked and aria-expanded define the current state."

**Pro Tips for Junior Developers:**

1. **Start with native HTML:** 95% of the time, `<button>`, `<input>`, `<select>` are better than custom widgets
2. **Test with keyboard:** Press Tab and arrow keys—can you use the widget without a mouse?
3. **Test with screen reader:** Download NVDA (free) and try your widget—does it announce correctly?
4. **Check ARIA Authoring Practices Guide:** https://www.w3.org/WAI/ARIA/apg/ - patterns for every widget type
5. **Use browser DevTools:** Chrome/Edge DevTools show accessibility tree—verify roles and states

</details>

---

## Question 3: What are ARIA states and properties, and how do you use them effectively?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain ARIA states and properties. What's the difference and when do you use each? Provide examples of real usage patterns.

### Answer

ARIA states and properties provide additional semantic information about elements. States are dynamic (change during user interaction), while properties are mostly static (define relationships).

1. **ARIA Properties** (Define relationships)
   - aria-label - Accessible name
   - aria-labelledby - Label by element reference
   - aria-describedby - Description by element reference
   - aria-owns - Owns/controls relationship
   - aria-controls - Controls another element
   - aria-haspopup - Opens popup (menu/dialog)
   - aria-required - Field is required

2. **ARIA States** (Change during interaction)
   - aria-checked - Checkbox/radio state
   - aria-expanded - Expandable section state
   - aria-hidden - Hide from screen readers
   - aria-disabled - Element is disabled
   - aria-selected - Option is selected
   - aria-pressed - Button is pressed
   - aria-busy - Loading/processing
   - aria-invalid - Input validation error

3. **When to Use**
   - Properties: Define static relationships
   - States: Announce dynamic changes
   - Together: Complete accessibility picture

4. **Common Patterns**
   - Form fields: aria-required, aria-invalid, aria-describedby
   - Expandables: aria-expanded, aria-controls
   - Selections: aria-selected, aria-checked
   - Feedback: aria-busy, aria-live for announcements

### Code Example

```html
<!-- ARIA PROPERTIES: Defining Relationships -->

<!-- aria-label: Direct accessible name -->
<button aria-label="Close menu">×</button>

<!-- aria-labelledby: Name by reference -->
<h2 id="dialog-title">Confirm Delete</h2>
<div role="dialog" aria-labelledby="dialog-title">
  <!-- Dialog content -->
</div>

<!-- aria-describedby: Additional description -->
<input type="password" aria-describedby="password-hint">
<span id="password-hint">Must be at least 8 characters</span>

<!-- aria-controls: Element controls another -->
<button
  aria-controls="sidebar"
  aria-expanded="false"
  onclick="toggleSidebar()"
>
  Menu
</button>
<nav id="sidebar" hidden>
  <!-- Navigation content -->
</nav>

<!-- aria-owns: Ownership relationship -->
<div role="menu" aria-owns="menu-item-1 menu-item-2">
  <button id="menu-item-1" role="menuitem">Edit</button>
  <button id="menu-item-2" role="menuitem">Delete</button>
</div>

<!-- aria-haspopup: Opens popup/dropdown -->
<button aria-haspopup="menu" onclick="openMenu()">
  Options
</button>

<!-- aria-required: Field is required -->
<label for="email">Email (required)</label>
<input type="email" id="email" aria-required="true" required>

<!-- ARIA STATES: Dynamic State Changes -->

<!-- aria-checked: Checkbox/radio state -->
<input type="checkbox" aria-checked="false" id="terms">
<label for="terms">I agree to terms</label>

<!-- aria-expanded: Expandable state -->
<button
  aria-expanded="false"
  aria-controls="details"
  onclick="toggleDetails()"
>
  More Details
</button>
<div id="details" hidden>
  <!-- Hidden details content -->
</div>

<!-- aria-hidden: Hide from screen readers -->
<span aria-hidden="true">→</span>

<!-- aria-disabled: Disabled state -->
<button aria-disabled="true" disabled>
  Save (pending)
</button>

<!-- aria-selected: Selection state -->
<div role="listbox">
  <div role="option" aria-selected="true">Option 1</div>
  <div role="option" aria-selected="false">Option 2</div>
</div>

<!-- aria-pressed: Toggle button state -->
<button aria-pressed="false" onclick="toggleMute()">
  Mute
</button>

<!-- aria-busy: Loading state -->
<div aria-busy="true" aria-label="Loading data">
  <span aria-hidden="true">⏳</span>
</div>

<!-- aria-invalid: Validation error state -->
<input
  type="email"
  aria-invalid="false"
  aria-describedby="email-error"
>
<span id="email-error" role="alert">
  Invalid email address
</span>

<!-- FORM FIELD WITH FULL ACCESSIBILITY -->

<form>
  <!-- Text input with label and description -->
  <div>
    <label for="username">Username</label>
    <input
      type="text"
      id="username"
      aria-required="true"
      aria-describedby="username-hint"
    >
    <span id="username-hint" class="hint">
      3-20 characters, alphanumeric only
    </span>
  </div>

  <!-- Email with validation -->
  <div>
    <label for="email">Email</label>
    <input
      type="email"
      id="email"
      aria-required="true"
      aria-invalid="false"
      aria-describedby="email-hint email-error"
    >
    <span id="email-hint" class="hint">
      We'll never share your email
    </span>
    <span id="email-error" role="alert" hidden>
      Invalid email format
    </span>
  </div>

  <!-- Password with strength indicator -->
  <div>
    <label for="password">Password</label>
    <input
      type="password"
      id="password"
      aria-required="true"
      aria-invalid="false"
      aria-describedby="password-hint password-strength"
    >
    <span id="password-hint" class="hint">
      At least 8 characters, include uppercase and number
    </span>
    <div
      id="password-strength"
      role="status"
      aria-live="polite"
      aria-label="Password strength"
    >
      Strength: <span class="strength-meter">Weak</span>
    </div>
  </div>

  <!-- Submit button with loading state -->
  <button
    type="submit"
    aria-busy="false"
    aria-label="Submit form"
  >
    <span class="button-text">Submit</span>
    <span class="loading-spinner" aria-hidden="true">⏳</span>
  </button>
</form>

<script>
// Update email validation
document.getElementById('email').addEventListener('change', (e) => {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value);
  e.target.setAttribute('aria-invalid', !isValid);
  document.getElementById('email-error').hidden = isValid;
});

// Update password strength
document.getElementById('password').addEventListener('input', (e) => {
  const strength = calculateStrength(e.target.value);
  document.querySelector('.strength-meter').textContent = strength;
});

// Handle form submission
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const button = e.target.querySelector('button[type="submit"]');
  button.setAttribute('aria-busy', 'true');
  button.disabled = true;

  try {
    // Submit form
    await submitForm();
  } finally {
    button.setAttribute('aria-busy', 'false');
    button.disabled = false;
  }
});
</script>

<!-- EXPANDABLE ACCORDION WITH STATES -->

function AccordionItem({ title, content, isOpen, onToggle, id }) {
  const buttonId = `accordion-btn-${id}`;
  const panelId = `accordion-panel-${id}`;

  return (
    <div>
      <button
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="accordion-button"
      >
        {title}
        <span aria-hidden="true">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="accordion-panel"
      >
        {content}
      </div>
    </div>
  );
}

<!-- LIVE REGIONS FOR DYNAMIC UPDATES -->

<!-- Polite announcements (wait for user to finish) -->
<div role="status" aria-live="polite" aria-atomic="true">
  <span id="cart-count">0 items in cart</span>
</div>

<script>
// Update cart count (announces after delay)
function updateCartCount(count) {
  document.getElementById('cart-count').textContent =
    `${count} items in cart`;
  // Screen reader announces after short delay
}
</script>

<!-- Assertive announcements (interrupt user) -->
<div role="alert" aria-live="assertive">
  <span id="error-message"></span>
</div>

<script>
// Show error (announces immediately)
function showError(message) {
  document.getElementById('error-message').textContent = message;
  // Screen reader announces immediately
}
</script>
```

### Common Mistakes

❌ **Mistake:** Mixing up aria-label and aria-labelledby
```html
<!-- Both at once (labelledby wins) -->
<div aria-label="Settings" aria-labelledby="settings-id">
```

✅ **Correct:** Use one or the other
```html
<!-- Option 1: Direct label -->
<button aria-label="Close menu">×</button>

<!-- Option 2: Label by reference -->
<div id="dialog-title">Confirm Delete</div>
<div role="dialog" aria-labelledby="dialog-title"></div>
```

❌ **Mistake:** Using aria-hidden incorrectly
```html
<!-- Hiding important content from screen readers -->
<div aria-hidden="true">
  <h1>Important heading</h1>
</div>
```

✅ **Correct:** Only hide decorative content
```html
<!-- Hiding decorative elements -->
<span aria-hidden="true">→</span>
```

<details>
<summary><strong>🔍 Deep Dive: Properties vs States and Implementation Patterns</strong></summary>

**Properties vs States:**

**Properties** define relationships:
- Mostly static (don't change often)
- Define how element relates to others
- Examples: aria-label, aria-controls, aria-owns
- Set once, rarely updated

**States** reflect dynamic changes:
- Change during user interaction
- Reflect current condition
- Examples: aria-expanded, aria-checked, aria-busy
- Updated whenever state changes

**Naming Hierarchy:**

When naming elements, screen readers use this priority:
1. aria-labelledby (if present)
2. aria-label (if present)
3. HTML label (if associated)
4. Element text content
5. Placeholder (fallback only)

Example:
```html
<!-- Name: "Delete item" (labelledby wins) -->
<span id="btn-label">Delete item</span>
<button
  aria-labelledby="btn-label"
  aria-label="Remove from cart"
>
  Remove
</button>
```

**Validation Pattern:**

For form fields, use this pattern:
```html
<input
  aria-required="true"
  aria-invalid="false"
  aria-describedby="hint error"
>
<span id="hint">Help text</span>
<span id="error" role="alert" hidden>Error text</span>

<script>
input.addEventListener('blur', () => {
  const isValid = validate(input.value);
  input.setAttribute('aria-invalid', !isValid);
  errorElement.hidden = isValid;
});
</script>
```

**Live Regions:**

aria-live announces content changes:
- aria-live="polite" - Wait for user to finish
- aria-live="assertive" - Interrupt user
- aria-atomic="true" - Announce entire region
- aria-relevant="additions removals text" - What to announce

</details>

<details>
<summary><strong>🐛 Real-World Scenario: E-commerce Form Validation Accessibility</strong></summary>

**Problem:** E-commerce form validation gave no feedback to screen reader users

Users couldn't tell:
- Which fields had errors
- What error messages meant
- When validation passed
- When form was ready to submit

Testing showed:
- Sighted users: 2 minutes to fix form
- Screen reader users: 15+ minutes or gave up
- Mobile users: Couldn't see error icons

**Before:**
```html
<form>
  <input type="email" id="email">
  <span class="error" style="color: red; display: none;">
    Invalid email
  </span>

  <input type="password" id="password">
  <span class="error" style="color: red; display: none;">
    Must be 8+ characters
  </span>

  <button>Submit</button>
</form>
```

**After:**
```html
<form>
  <div>
    <label for="email">Email</label>
    <input
      type="email"
      id="email"
      aria-required="true"
      aria-invalid="false"
      aria-describedby="email-hint email-error"
    >
    <span id="email-hint" class="hint">
      Enter a valid email address
    </span>
    <span id="email-error" role="alert" hidden>
      Please enter a valid email (example@domain.com)
    </span>
  </div>

  <div>
    <label for="password">Password</label>
    <input
      type="password"
      id="password"
      aria-required="true"
      aria-invalid="false"
      aria-describedby="password-hint password-error password-strength"
    >
    <span id="password-hint" class="hint">
      At least 8 characters, with uppercase and number
    </span>
    <span
      id="password-strength"
      role="status"
      aria-live="polite"
    >
      Strength: <span class="strength">Weak</span>
    </span>
    <span id="password-error" role="alert" hidden>
      Password must be at least 8 characters with uppercase and number
    </span>
  </div>

  <button aria-busy="false" aria-label="Submit form">
    Submit
  </button>
</form>

<script>
// Email validation
document.getElementById('email').addEventListener('blur', (e) => {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value);
  e.target.setAttribute('aria-invalid', !isValid);
  document.getElementById('email-error').hidden = isValid;
});

// Password validation with strength
document.getElementById('password').addEventListener('input', (e) => {
  const pwd = e.target.value;
  const strength = pwd.length < 8 ? 'Weak' :
                   pwd.match(/[A-Z]/) && pwd.match(/[0-9]/) ? 'Strong' : 'Medium';

  document.querySelector('.strength').textContent = strength;

  const isValid = pwd.length >= 8 && pwd.match(/[A-Z]/) && pwd.match(/[0-9]/);
  e.target.setAttribute('aria-invalid', !isValid);
  document.getElementById('password-error').hidden = isValid;
});

// Form submission
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const button = e.target.querySelector('button');
  button.setAttribute('aria-busy', 'true');
  button.disabled = true;

  try {
    const response = await fetch('/submit', {
      method: 'POST',
      body: new FormData(e.target)
    });

    if (!response.ok) {
      throw new Error('Submission failed');
    }

    // Success feedback
    button.setAttribute('aria-busy', 'false');
    button.textContent = 'Form submitted successfully!';
  } catch (error) {
    button.setAttribute('aria-busy', 'false');
    button.disabled = false;
    alert('Error: ' + error.message);
  }
});
</script>
```

**Results:**
- Screen reader users: 2-3 minutes to fix form
- All errors announced clearly
- Validation feedback in real-time
- Mobile users: See errors immediately
- WCAG 2.1 AA compliance

</details>

<details>
<summary><strong>⚖️ Trade-offs: ARIA Property and State Implementation Strategies</strong></summary>

| Approach | Pros | Cons | When to Use |
|----------|------|------|------------|
| **aria-label** | Simple, inline | May conflict with actual content | When no visible label |
| **aria-labelledby** | References visible text | Requires element ID | When label text exists on page |
| **aria-describedby** | Provides detailed description | Not a name, just description | For additional context |
| **aria-invalid** | Semantic validation state | Requires manual management | For form validation |
| **aria-live** | Announces dynamic content | Can be annoying if overused | For real-time updates |

**Validation Pattern:**
- **Immediate feedback** - Too much noise
- **Blur validation** - Good balance
- **Submit validation** - Frustrating for users
- **Real-time strength** - Best for passwords

</details>

<details>
<summary><strong>💬 Explain to Junior: Understanding ARIA Properties and States</strong></summary>

**Properties vs States - Simple Explanation:**

**Properties** are like name tags:
```html
<button aria-label="Submit form">Send</button>
```
The property tells you what the element is called. It doesn't change.

**States** are like traffic lights:
```html
<button aria-busy="true">Processing...</button>
```
The state tells you the current condition. It changes over time.

**Common Properties You'll See:**

1. **aria-label** - "What's this called?"
2. **aria-describedby** - "Tell me more about it"
3. **aria-controls** - "This button controls that element"
4. **aria-required** - "I must be filled in"

**Common States You'll See:**

1. **aria-expanded** - "Is it open or closed?"
2. **aria-checked** - "Is it checked or not?"
3. **aria-busy** - "Is it loading or done?"
4. **aria-invalid** - "Is the input wrong or right?"

**The Pattern for Forms:**

```html
<!-- 1. Label tells the name -->
<label for="email">Email</label>

<!-- 2. aria-required says it's required -->
<input
  id="email"
  aria-required="true"
  aria-invalid="false"
  aria-describedby="hint error"
>

<!-- 3. Hint gives tips -->
<span id="hint">Enter your email</span>

<!-- 4. Error announces problems -->
<span id="error" role="alert">Invalid email</span>
```

**Interview Answer Template:**

"ARIA properties and states provide additional semantics for screen readers. Properties define static relationships—aria-label names an element, aria-describedby gives details, aria-controls shows relationships. States reflect dynamic changes—aria-expanded, aria-checked, aria-busy change as users interact.

In forms, I use aria-required to mark required fields, aria-invalid to show validation errors, and aria-describedby to connect hints and errors. For interactive elements, I update aria-expanded when expanding/collapsing, aria-checked when toggling, and aria-busy during loading.

The key is keeping these in sync with visual changes. When I add aria-invalid='true', I also show the error visually. When I change aria-expanded, I also hide/show the content."

</details>

---

[← Back to Accessibility README](./README.md)

**Progress:** 3 new accessibility questions with comprehensive depth sections (deep dive, real-world scenarios, trade-offs, junior explanations)
