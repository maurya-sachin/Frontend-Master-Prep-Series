# WCAG and Accessibility Fundamentals

> **Master web accessibility - WCAG guidelines, ARIA, semantic HTML, keyboard navigation, and screen reader support**

---

## Question 1: What are WCAG guidelines and the four POUR principles?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple

### Question
Explain WCAG (Web Content Accessibility Guidelines). What are the POUR principles and their importance?

### Answer

WCAG provides standards for making web content accessible to people with disabilities.

1. **WCAG Levels**
   - **Level A** - Basic accessibility (must have)
   - **Level AA** - Standard accessibility (recommended, legal requirement in many countries)
   - **Level AAA** - Enhanced accessibility (nice to have)

2. **POUR Principles**
   - **Perceivable** - Information and UI must be presentable to users
   - **Operable** - UI components and navigation must be operable
   - **Understandable** - Information and operation must be understandable
   - **Robust** - Content must be robust enough for assistive technologies

3. **Why It Matters**
   - 15% of world population has some disability
   - Legal requirements (ADA, Section 508, AODA)
   - Better SEO and UX for everyone
   - Larger audience reach

4. **Common Disabilities**
   - Visual (blindness, low vision, color blindness)
   - Auditory (deafness, hard of hearing)
   - Motor (limited movement, tremors)
   - Cognitive (dyslexia, ADHD, learning disabilities)

### Code Example

```html
<!-- PERCEIVABLE -->

<!-- 1. Text alternatives for images -->
<img src="chart.png" alt="Sales increased 45% from Q1 to Q2">

<!-- 2. Captions for videos -->
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English">
</video>

<!-- 3. Color is not the only visual means -->
<!-- ❌ Bad: Only color indicates error -->
<input class="error" style="border-color: red;">

<!-- ✅ Good: Icon + color + text -->
<div>
  <input aria-invalid="true" aria-describedby="error-msg">
  <span id="error-msg" class="error">
    <span aria-label="Error">❌</span> Email is required
  </span>
</div>

<!-- 4. Sufficient color contrast -->
<style>
  /* ❌ Bad: Insufficient contrast (3:1) */
  .text {
    color: #777;  /* Gray */
    background: #fff;  /* White */
  }

  /* ✅ Good: AA standard (4.5:1 for normal text) */
  .text {
    color: #595959;
    background: #fff;
  }

  /* ✅ AAA standard (7:1 for normal text) */
  .text {
    color: #333;
    background: #fff;
  }
</style>

<!-- 5. Resizable text (up to 200%) -->
<style>
  /* ✅ Use relative units */
  .text {
    font-size: 1rem;  /* Not 16px */
    line-height: 1.5;
  }
</style>

<!-- OPERABLE -->

<!-- 1. Keyboard accessible -->
<!-- ❌ Bad: Not keyboard accessible -->
<div onclick="handleClick()">Click me</div>

<!-- ✅ Good: Button is focusable and keyboard accessible -->
<button onclick="handleClick()">Click me</button>

<!-- 2. Skip navigation links -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<nav>
  <!-- Navigation links -->
</nav>

<main id="main-content">
  <!-- Main content -->
</main>

<style>
  .skip-link {
    position: absolute;
    left: -9999px;
  }

  .skip-link:focus {
    left: 0;
    top: 0;
    z-index: 1000;
  }
</style>

<!-- 3. Focus visible -->
<style>
  /* ❌ Bad: Removing focus outline */
  button:focus {
    outline: none;  /* Never do this without replacement */
  }

  /* ✅ Good: Custom focus indicator */
  button:focus-visible {
    outline: 3px solid #4A90E2;
    outline-offset: 2px;
  }
</style>

<!-- 4. No keyboard traps -->
<script>
// Modal with focus trap
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef();

  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleTab(e) {
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

    modalRef.current.addEventListener('keydown', handleTab);
    firstElement.focus();

    return () => {
      modalRef.current?.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" ref={modalRef}>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
</script>

<!-- 5. Enough time -->
<div role="alert">
  Session will expire in <span id="timer">5:00</span>.
  <button onclick="extendSession()">Extend Session</button>
</div>

<!-- UNDERSTANDABLE -->

<!-- 1. Language of page -->
<html lang="en">

<!-- 2. Language of parts -->
<p>Welcome! <span lang="es">Bienvenidos!</span></p>

<!-- 3. Consistent navigation -->
<nav aria-label="Main navigation">
  <!-- Same order across all pages -->
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>

<!-- 4. Labels and instructions -->
<!-- ❌ Bad: No label -->
<input type="email" placeholder="Email">

<!-- ✅ Good: Proper label -->
<label for="email">Email address</label>
<input type="email" id="email" required aria-required="true">
<span id="email-hint">We'll never share your email</span>

<!-- 5. Error identification and suggestions -->
<form>
  <label for="username">Username</label>
  <input
    type="text"
    id="username"
    aria-invalid="true"
    aria-describedby="username-error"
  >
  <span id="username-error" role="alert">
    Username must be at least 3 characters long
  </span>
</form>

<!-- ROBUST -->

<!-- 1. Valid HTML -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Title</title>
</head>
<body>
  <!-- Properly nested elements -->
  <main>
    <article>
      <h1>Title</h1>
      <p>Content</p>
    </article>
  </main>
</body>
</html>

<!-- 2. Name, Role, Value -->
<!-- Custom checkbox -->
<div
  role="checkbox"
  aria-checked="false"
  tabindex="0"
  onclick="toggleCheckbox()"
  onkeydown="handleKeyDown(event)"
>
  Remember me
</div>

<script>
function toggleCheckbox() {
  const checkbox = event.currentTarget;
  const isChecked = checkbox.getAttribute('aria-checked') === 'true';
  checkbox.setAttribute('aria-checked', !isChecked);
}

function handleKeyDown(event) {
  if (event.key === ' ' || event.key === 'Enter') {
    toggleCheckbox();
    event.preventDefault();
  }
}
</script>

<!-- 3. Status messages -->
<div role="status" aria-live="polite">
  <!-- Screen reader announces changes -->
  Item added to cart
</div>

<div role="alert" aria-live="assertive">
  <!-- Interrupts screen reader -->
  Error: Payment failed
</div>
```

### WCAG Quick Reference

| Principle | Examples |
|-----------|----------|
| **Perceivable** | Alt text, captions, color contrast, resizable text |
| **Operable** | Keyboard access, skip links, no time limits, focus visible |
| **Understandable** | Clear language, consistent navigation, error help |
| **Robust** | Valid HTML, ARIA attributes, semantic elements |

### Color Contrast Requirements

| Text Size | Level AA | Level AAA |
|-----------|----------|-----------|
| Normal (< 18pt) | 4.5:1 | 7:1 |
| Large (≥ 18pt or bold 14pt) | 3:1 | 4.5:1 |
| UI Components | 3:1 | - |

### Common Mistakes

❌ **Mistake:** Using div/span for interactive elements
```html
<div onclick="submit()">Submit</div>
```

✅ **Correct:** Use semantic HTML
```html
<button onclick="submit()">Submit</button>
```

❌ **Mistake:** Placeholder as label
```html
<input type="email" placeholder="Email">
```

✅ **Correct:** Use proper label
```html
<label for="email">Email</label>
<input type="email" id="email" placeholder="you@example.com">
```

---

<details>
<summary><strong>🔍 Deep Dive: WCAG Principles and Compliance Levels</strong></summary>

### WCAG Principles and Compliance Levels

**WCAG Architecture - Three Layers:**

The Web Content Accessibility Guidelines follow a three-tier structure that's crucial to understand:

1. **Principles (Top)** - The 4 POUR principles form the foundation. Every guideline and success criterion rolls up to one of these.
2. **Guidelines (Middle)** - 13 guidelines provide the framework (e.g., "Provide text alternatives for images" is Guideline 1.1 under Perceivable)
3. **Success Criteria (Bottom)** - ~50+ testable requirements with specific levels (A, AA, AAA)

**Depth on Each Level:**

**Level A (Minimal):**
- Basic, obvious accessibility features
- ~25-30 success criteria
- Addresses the most severe disabilities
- Examples: Image alt text, keyboard access, basic color contrast
- Timeline: Immediate implementation
- Business driver: Legal minimum in some jurisdictions

**Level AA (Standard):**
- Enhanced accessibility features
- ~35-40 success criteria (includes all Level A + AA-specific)
- Addresses 80%+ of accessibility issues
- Examples: 4.5:1 color contrast, captions for video, heading hierarchy
- Timeline: 3-6 months typical implementation
- Business driver: Required by law in EU, UK, Canada, Australia, USA (ADA)
- ROI: 15% population with disabilities + 40-50% marginal users (elderly, in noisy environments)

**Level AAA (Enhanced):**
- Specialized accessibility features
- ~45-50 success criteria
- Addresses specific and complex scenarios
- Examples: Extended audio descriptions, sign language interpretation, 7:1 contrast
- Timeline: 6-12 months, requires specialized expertise
- Business driver: Government websites, healthcare, education
- Note: W3C doesn't require entire sites to be AAA - target specific sections

**WCAG 2.0 vs 2.1 vs 3.0 Roadmap:**

- **WCAG 2.0 (2008):** Original standard, still heavily used
- **WCAG 2.1 (2018):** Added ~17 new success criteria focused on mobile, low vision, cognitive disabilities
- **WCAG 3.0 (2023, draft):** Complete rewrite with outcome-focused approach, still in development
- **Migration path:** Most organizations targeting 2.1 AA currently; AAA reserved for high-stakes applications

**Perceivable Principle Deep Dive:**

Perceivable means information must be presentable to at least one sensory channel:

1. **Text Alternatives (1.1):**
   - Not just alt text (too simplistic)
   - Intent: Convey the information and purpose
   - Complex images: Use alt + detailed description on page
   - Decorative: Use alt=""
   - Images of text: Avoid when possible (resizing fails); if required, provide actual text alternative
   - SVG: Use <title>, <desc>, or aria-label
   - Canvas: Describe alternatives outside canvas element

2. **Adaptable (1.3):**
   - Information conveyed through color alone
   - Information conveyed through shape/position alone (e.g., "click the red button" vs "click the submit button")
   - Sequence matters: Read order should be logical
   - Components and relationships must be programmatically determinable

3. **Distinguishable (1.4):**
   - **Color contrast:** WCAG AA = 4.5:1 (normal text), 3:1 (large text). AAA = 7:1 and 4.5:1
   - **Resize:** Text must be readable up to 200% zoom without horizontal scrolling
   - **Audio control:** Users must be able to pause/stop auto-playing audio
   - **No seizure-inducing content:** Max 3 flashes per second

**Operable Principle Deep Dive:**

All functionality must be available via keyboard (either native or via ARIA key handlers):

1. **Keyboard Accessible (2.1):**
   - All interactive elements must be keyboard operable
   - No keyboard traps (except intentional ones like modals, with clear escape path)
   - Tab order should match visual order
   - Implementation: Use semantic HTML (<button>, <a>) OR add role + tabindex + keyboard handlers

2. **Enough Time (2.2):**
   - Session timeouts: 20-hour default recommended
   - Auto-updates: User must be able to pause/stop
   - Scrolling/animation: Must be pausable
   - Real-time events: Can't require timed response

3. **Seizure Prevention (2.3):**
   - Max 3 flashes per second in 100x100 pixel area
   - Most animations/gifs should be fine

4. **Navigable (2.4):**
   - Purpose of each link must be clear from link text alone
   - Page has proper heading hierarchy
   - Skip links for repetitive content (main nav, sidebars)
   - Focus is visible
   - Focus order is logical

**Robust Principle Deep Dive:**

Content must be compatible with current and future assistive technologies:

1. **Parsing (4.1.1):**
   - Valid HTML/XML
   - No duplicate IDs (assistive tech relies on ID uniqueness)
   - Start and end tags properly nested

2. **Name, Role, Value (4.1.2):**
   - Accessibility API must know: What is this (role), what's it called (name), what's its current state (value)
   - For HTML: Use semantic elements and ARIA
   - Custom components: Must expose all three programmatically

**Real-World Compliance Metrics:**
- Manual testing required: ~40% of checks (visual, cognitive)
- Automated testing: ~30% of checks (code-based, runs in CI/CD)
- User testing with disabilities: ~30% of checks (assistive tech usage, pain points)

</details>

<details>
<summary><strong>🐛 Real-World Scenario: E-commerce Accessibility Failure</strong></summary>

### E-commerce Accessibility Failure

**The Bug:** A major online retailer launched a product filter system that passed WCAG AA automated tests but failed real-world usage:

**Symptoms Reported:**
1. Keyboard users couldn't use the filter
2. Screen reader users heard gibberish
3. Color-blind users couldn't see the status
4. Elderly users complained about text too small
5. Mobile users experienced keyboard being completely unresponsive after filtering

**Root Causes Uncovered (in order of discovery):**

1. **Invisible Focus Management (Failed 2.4.7):**
```javascript
// ❌ Bad: JavaScript moved focus but styles hidden it
function Filter({ onApply }) {
  const handleFilter = () => {
    document.body.focus(); // Trap? Bad practice
    onApply();
  };
  return <button onClick={handleFilter}>Apply Filter</button>;
}
```
**Impact:** Keyboard users couldn't see where focus went; on mobile, keyboard appeared/disappeared without reason
**Metrics:** 8% of desktop traffic, 15% of mobile traffic affected
**Fix Metrics:** TAB key responsiveness restored, keyboard visibility increased engagement by 3.2%

2. **Color-Only Status Indicator (Failed 1.4.1 - Distinguishable):**
```jsx
// ❌ Bad: Only color indicates status
<div className={filterActive ? 'active-red' : 'inactive-gray'}>
  {filterCount} filters
</div>

// ✅ Good: Color + text + icon
<div className={filterActive ? 'active-red' : 'inactive-gray'}>
  {filterActive && <CheckIcon aria-hidden="true" />}
  <span className={filterActive ? 'font-bold' : ''}>
    {filterCount} active filters
  </span>
</div>
```
**Impact:** Color-blind users (8% of males, 0.5% of females) couldn't tell if filters were applied
**Metrics:** Bounce rate +12% in color-blind demographic
**Fix Time:** 4 hours (logic) + 2 hours (testing with color-blind user)

3. **Aria-live Without Atomic Update (Failed 4.1.2):**
```jsx
// ❌ Bad: Announces piece-by-piece
<div aria-live="polite">
  <span>Filter: </span>
  <span>Price $10-$50</span>
  <span> applied</span>
</div>

// ✅ Good: Atomic announcement
<div aria-live="polite" aria-atomic="true">
  Filter: Price $10-$50 applied
</div>
```
**Impact:** NVDA screen reader announced fragments: "Filter...Price...50...$...applied" instead of complete message
**Metrics:** Screen reader users spent 40 seconds vs 4 seconds understanding filter status
**Fix Time:** 15 minutes

4. **Fixed Font Size in Mobile Filter (Failed 1.4.4 - Resizable Text):**
```css
/* ❌ Bad: Fixed pixel size, can't scale */
.filter-label {
  font-size: 12px;  /* Can't scale beyond browser zoom */
}

/* ✅ Good: Relative unit */
.filter-label {
  font-size: 0.875rem;  /* Scales with user's base font size */
}
```
**Impact:** Elderly users (23% of demographic) with sight issues couldn't read filter labels even at 200% zoom
**Metrics:** +0.8s per task, 18% gave up on filtering
**Fix Time:** 30 minutes (CSS) + 1 hour (QA across browsers/sizes)

5. **No Focus Trap Escape in Modal Filter (Failed 2.1.1 - Keyboard Accessible):**
```jsx
// ❌ Bad: No way out of keyboard trap
function FilterModal({ isOpen, onClose }) {
  return (
    <div role="dialog">
      <Filters />
      {/* No close button with keyboard support */}
    </div>
  );
}

// ✅ Good: Escape key + visible close button
function FilterModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true">
      <Filters />
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```
**Impact:** 5% of users (power users, keyboard shortcuts users) completely unable to navigate
**Metrics:** Session abandonment rate 22% for power users
**Fix Time:** 2 hours

**Business Impact Summary:**
- **Affected Users:** 22% of traffic (keyboard, screen reader, color-blind, elderly, mobile)
- **Revenue Loss:** $2.4M (estimated from 15% bounce rate increase across segments)
- **Investigation Time:** 40 hours (manual testing + user feedback)
- **Fix Time:** 8 hours (development + testing)
- **Preventive Cost:** 20 hours upfront accessibility audit
- **ROI of Accessibility:** 1 prevention = 2 firefighting hours saved

**Post-Fix Metrics:**
- Bounce rate: -12% overall
- Keyboard user satisfaction: +34% (CSAT survey)
- Mobile engagement: +8% (better keyboard handling)
- Page load performance: +15% (removed JS complexity from focus management)

</details>

<details>
<summary><strong>⚖️ Trade-offs: Accessibility vs Design vs Performance</strong></summary>

### Accessibility vs Design vs Performance

**Trade-off Matrix:**

| Scenario | Requirement | Design Impact | Performance | Best Practice |
|----------|-------------|----------------|-------------|----------------|
| **Dense Dashboard** | 4.5:1 contrast | Lighter colors = less contrast | No impact | Use borders/shapes in addition to color |
| **Video Content** | Captions + transcripts | 20-30% longer load | +2-3 seconds | Lazy-load captions, use tracks element |
| **Form Validation** | ARIA live regions | Must be visible + announced | Minimal | Use aria-live + visible text |
| **Animation** | No seizure-inducing flashes | Can't use strobing effects | Saves bandwidth | Use fade/slide transitions |
| **Resize to 200%** | Responsive layout | Complex CSS media queries | No impact | Mobile-first approach helps |
| **Keyboard Nav** | Tab order = visual order | Tab traps require logic | +500ms for init | Pre-plan tabindex strategy |
| **Dark Mode** | Different contrast requirements | Need 2 color schemes | +1 second CSS | CSS custom properties save effort |

**Design vs Accessibility Conflicts:**

1. **Icon-Only Buttons (Contrast vs Minimalism):**
```jsx
// ❌ Design: Clean icon
<button><SearchIcon /></button>

// ⚖️ Trade-off: Icon + visible text OR aria-label
<button aria-label="Search"><SearchIcon /></button>
// OR
<button>
  <SearchIcon aria-hidden="true" />
  <span>Search</span>
</button>
```
**Decision:** If brand requires minimal UI, use aria-label + ensure :focus style is visible

2. **Scrolling vs Keyboard Navigation:**
```jsx
// ❌ Design: Smooth scroll on wheel
<div onWheel={(e) => scroll(e.deltaY)}>

// ⚖️ Trade-off: Allow keyboard + maintain smooth scroll
<div
  onWheel={(e) => scroll(e.deltaY)}
  onKeyDown={(e) => {
    if (e.key === 'ArrowDown') scroll(50);
  }}
>
```
**Decision:** Keyboard is mandatory; scroll smoothness is nice-to-have

3. **Decorative Content (Clean Design vs Screen Reader Clarity):**
```jsx
// ❌ Design: Lots of visual decorations
<div>
  <span aria-hidden="true">⭐⭐⭐⭐⭐</span>
  4.5 stars
</div>

// ✅ Good: Decorative + text
<div>
  <span aria-hidden="true">⭐⭐⭐⭐⭐</span>
  <span className="sr-only">Rated 4.5 out of 5 stars</span>
</div>
```
**Decision:** Use aria-hidden for pure decoration; communicate info textually

**Performance Trade-offs:**

1. **Polite vs Assertive Live Regions:**
```jsx
// ❌ Bad: Assertive interrupts screen reader mid-sentence
<div aria-live="assertive">New message: {message}</div>

// ✅ Good: Polite waits for pause
<div aria-live="polite">New message: {message}</div>

// Frequency matters
// If >10 per second: Performance degrades + accessibility broken
// If 1-2 per second: Acceptable (live regions are lightweight)
```

2. **Captions Encoding (File Size vs Accessibility):**
   - WebVTT captions: ~1-2 KB per minute video
   - Transcripts: ~500 bytes per minute video
   - Both together: ~2.5 KB per minute video
   - For 1 hour video: 150 KB additional = 1.2% bandwidth hit
   - Recommendation: Always include; cost negligible vs accessibility benefit

**Business Decision Framework:**

```
Priority 1 (Mandatory, No Trade-off):
- Keyboard access (affects 15-20% of users)
- Screen reader compatibility (affects 2-4% directly, 20% marginal)
- Color contrast (affects 10% color-blind, 20% in bright sunlight)

Priority 2 (High Value, Consider Trade-offs):
- Captions (affects 5% deaf/HoH, but helps 20% in noisy environments)
- Resizable text (affects 8% low vision, helps older users)
- Error messages (affects 10% with cognitive disabilities)

Priority 3 (Nice-to-Have):
- Sign language interpretation (~0.1% deaf users)
- Extended descriptions (affects 1% blind users, helps others)
- AAA contrast level (helps 2-3% vs AA's 10%)
```

**When to Choose Performance Over Accessibility (Rarely):**
- Critical path optimization: First 3 seconds = 2% conversion/second
- Accessibility cost: +400ms to 3-second budget is 4% traffic loss
- ROI: Only if <0.1% of traffic is accessibility-dependent
- Example: None - accessibility rarely costs >5% performance

</details>

<details>
<summary><strong>💬 Explain to Junior: POUR Principles as a House</strong></summary>

### POUR Principles as a House

**Analogy: Building an Accessible House**

Imagine WCAG POUR principles as building a house where everyone - whether they use a wheelchair, are blind, deaf, or elderly - should be able to function normally.

**Perceivable = Everyone Must Be Able to See/Sense the House**

Your house has:
- A sign at the entrance (alt text for images)
- Street address on mailbox (text alternatives for icons)
- Proper lighting - not too dark, not too dim (color contrast)
- Text on signs is large enough to read from 10 feet away (resizable text)
- You describe each room when guests arrive (labels for buttons/forms)

❌ Bad: "Click the blue button" - What if someone is colorblind or can't see the button?
✅ Good: "Click the APPLY button" - Everyone knows what to do

**Operable = Everyone Must Be Able to Navigate the House**

Your house has:
- Doors that anyone can open (keyboard accessible - not just mouse clicks)
- Wheelchair ramps and hallways (all interactive elements accessible)
- Light switches within reach (no keyboard traps)
- Clear signs showing where to go (logical tab order)
- A doorbell that always works (focus visible)

❌ Bad:
```html
<div onclick="submit()">Submit</div>  <!-- Can't tab to it -->
```
✅ Good:
```html
<button onclick="submit()">Submit</button>  <!-- Can tab, press Enter -->
```

**Understandable = Everyone Must Know How to Use the House**

Your house:
- Has clear instructions posted everywhere (labels on forms)
- Signs are consistent - bathroom signs look the same on each floor (consistent navigation)
- If you make a mistake, you get help ("Password must be 8+ characters, not what you entered")
- Written in simple language everyone understands (plain language)

❌ Bad:
```html
<input placeholder="Email">  <!-- Where's the label? What's this for? -->
```
✅ Good:
```html
<label for="email">Email address</label>
<input id="email" type="email" required>
<span id="hint">We'll never share your email</span>
```

**Robust = The House Works With All Tools Everyone Uses**

Your house:
- Uses standard building codes (valid HTML) so any contractor can fix it
- All doors have standard handles (semantic elements everyone knows)
- House blueprints are properly documented (proper HTML structure)
- Works with wheelchairs, walkers, guide dogs, hearing aids (assistive technology compatible)

❌ Bad:
```html
<div role="button" onclick="submit()">
  Submit
</div>  <!-- Screen readers confused about role + no keyboard support -->
```
✅ Good:
```html
<button onclick="submit()">Submit</button>
<!-- Browser/screen reader know this is a button -->
```

---

**WCAG Levels as House Inspection Scores:**

**Level A = Habitable (D grade)**
- Electricity works
- Plumbing works
- Roof doesn't leak
- Wheelchair can get through front door
- Not good, but not uninhabitable
- Example: Image has alt text, but it's vague ("image123")

**Level AA = Meets Code (B grade)**
- Everything from Level A
- Plus: Lights bright enough to see
- Hallways wide enough for wheelchair + another person
- Grab bars in bathrooms
- Clear signage throughout
- This is the industry standard - what you should aim for
- Example: Image has descriptive alt text ("Chart showing 45% sales increase Q1-Q2")

**Level AAA = Premium (A grade)**
- Everything from AA
- Plus: Smart home features (bonus)
- Massage chairs in every room (bonus)
- Specially trained staff to help guests
- Overkill for most homes, but necessary for hospitals, government buildings
- Example: Image has alt text PLUS extended description + SVG version

---

**Interview Answer Template:**

"WCAG has 4 POUR principles:

1. **Perceivable** - Information must be readable by all senses. Alt text for images, color + text for status, proper contrast.

2. **Operable** - Everything keyboard accessible. No focus traps. Skip links. All interactive elements reachable via Tab key.

3. **Understandable** - Clear labels, consistent design, error messages that help. Form hints and instructions.

4. **Robust** - Valid HTML, semantic elements, ARIA for complex components. Must work with assistive tech today and tomorrow.

I always aim for **Level AA** - it's the legal standard in most countries and accessible to 80%+ of users with disabilities. It's the sweet spot between effort and impact. Level AAA is reserved for high-stakes situations like healthcare or government."

</details>

### Follow-up Questions

- "How do you test for accessibility?"
- "What's the difference between Level AA and AAA?"
- "How do screen readers interact with web pages?"
- "What are the legal requirements for accessibility?"
- "How do you handle dynamic content updates with screen readers?"
- "What's the difference between aria-label, aria-labelledby, and aria-describedby?"

### Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

---

## Question 2: What is ARIA and how do you use it correctly?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain ARIA (Accessible Rich Internet Applications). What are roles, properties, and states? When should you use ARIA?

### Answer

ARIA provides semantics for assistive technologies when HTML semantics are insufficient.

1. **First Rule of ARIA**
   - Don't use ARIA if semantic HTML exists
   - Use `<button>` instead of `<div role="button">`
   - Native elements have built-in accessibility

2. **ARIA Roles**
   - Define what an element is
   - Examples: button, navigation, dialog, alert

3. **ARIA Properties**
   - Define relationships or extra information
   - Examples: aria-label, aria-labelledby, aria-describedby

4. **ARIA States**
   - Define current state of element
   - Examples: aria-expanded, aria-checked, aria-hidden

5. **Live Regions**
   - Announce dynamic content changes
   - aria-live: polite, assertive, off

### Code Example

```html
<!-- SEMANTIC HTML FIRST -->

<!-- ❌ Bad: Using ARIA unnecessarily -->
<div role="button" tabindex="0" onclick="submit()">Submit</div>

<!-- ✅ Good: Native button -->
<button onclick="submit()">Submit</button>

<!-- ❌ Bad: Div as heading -->
<div role="heading" aria-level="1">Title</div>

<!-- ✅ Good: Semantic heading -->
<h1>Title</h1>

<!-- ARIA ROLES -->

<!-- Navigation landmark -->
<nav role="navigation" aria-label="Main">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

<!-- Main content landmark -->
<main role="main">
  <article>Content</article>
</main>

<!-- Complementary content -->
<aside role="complementary" aria-label="Related articles">
  <h2>Related</h2>
</aside>

<!-- Dialog -->
<div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
  <h2 id="dialog-title">Confirm Delete</h2>
  <p>Are you sure?</p>
  <button>Delete</button>
  <button>Cancel</button>
</div>

<!-- Tab interface -->
<div role="tablist" aria-label="Settings">
  <button role="tab" aria-selected="true" aria-controls="panel-1">
    General
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">
    Privacy
  </button>
</div>

<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  <!-- General settings -->
</div>

<div role="tabpanel" id="panel-2" hidden aria-labelledby="tab-2">
  <!-- Privacy settings -->
</div>

<!-- ARIA PROPERTIES -->

<!-- Labeling -->
<button aria-label="Close dialog">×</button>

<!-- Labeling by reference -->
<div id="dialog-title">Confirm Action</div>
<div role="dialog" aria-labelledby="dialog-title">
  <!-- Dialog content -->
</div>

<!-- Description -->
<button aria-describedby="save-desc">Save</button>
<span id="save-desc">Saves your changes permanently</span>

<!-- Required field -->
<label for="email">Email</label>
<input type="email" id="email" aria-required="true" required>

<!-- Invalid field -->
<label for="password">Password</label>
<input
  type="password"
  id="password"
  aria-invalid="true"
  aria-describedby="password-error"
>
<span id="password-error">Password must be at least 8 characters</span>

<!-- ARIA STATES -->

<!-- Expanded/Collapsed -->
<button
  aria-expanded="false"
  aria-controls="menu"
  onclick="toggleMenu()"
>
  Menu
</button>
<ul id="menu" hidden>
  <li><a href="/home">Home</a></li>
  <li><a href="/about">About</a></li>
</ul>

<script>
function toggleMenu() {
  const button = event.currentTarget;
  const menu = document.getElementById('menu');
  const isExpanded = button.getAttribute('aria-expanded') === 'true';

  button.setAttribute('aria-expanded', !isExpanded);
  menu.hidden = isExpanded;
}
</script>

<!-- Checked state -->
<div
  role="checkbox"
  aria-checked="true"
  tabindex="0"
  onclick="toggleCheckbox()"
>
  Subscribe to newsletter
</div>

<!-- Pressed state (toggle button) -->
<button aria-pressed="false" onclick="toggleMute()">
  Mute
</button>

<!-- Current page -->
<nav>
  <a href="/" aria-current="page">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>

<!-- Disabled -->
<button disabled aria-disabled="true">
  Save
</button>

<!-- LIVE REGIONS -->

<!-- Polite announcements (don't interrupt) -->
<div role="status" aria-live="polite">
  5 items in cart
</div>

<!-- Assertive announcements (interrupt) -->
<div role="alert" aria-live="assertive">
  Error: Payment failed
</div>

<!-- Atomic updates -->
<div aria-live="polite" aria-atomic="true">
  <span>Step 2</span> of <span>5</span>
</div>

<!-- Relevant updates -->
<div aria-live="polite" aria-relevant="additions removals">
  <!-- Only announce additions and removals, not text changes -->
</div>

<!-- HIDING CONTENT -->

<!-- Visually hidden but available to screen readers -->
<span class="sr-only">Click to open menu</span>

<style>
.sr-only {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>

<!-- Hidden from everyone -->
<div hidden>
  This content is hidden
</div>

<!-- Hidden from screen readers only -->
<div aria-hidden="true">
  <span>★★★★★</span>  <!-- Decorative stars -->
</div>
<span class="sr-only">Rated 5 out of 5 stars</span>

<!-- REACT EXAMPLES -->

// Custom select component
function CustomSelect({ options, value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const listboxRef = useRef();

  return (
    <div>
      <label id="select-label">{label}</label>
      <button
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="select-label"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || 'Select...'}
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-labelledby="select-label"
          ref={listboxRef}
        >
          {options.map(option => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Loading indicator
function LoadingButton({ isLoading, children, ...props }) {
  return (
    <button
      {...props}
      aria-busy={isLoading}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span aria-hidden="true">⏳</span>
          <span class="sr-only">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Form error announcements
function FormField({ label, error, ...inputProps }) {
  const errorId = `${inputProps.id}-error`;

  return (
    <div>
      <label htmlFor={inputProps.id}>{label}</label>
      <input
        {...inputProps}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

### ARIA Roles Reference

| Category | Roles |
|----------|-------|
| **Landmarks** | banner, navigation, main, complementary, contentinfo, search |
| **Widget** | button, checkbox, tab, tabpanel, dialog, tooltip |
| **Document** | article, document, feed, figure, table |
| **Status** | alert, status, log, timer |

### Common Mistakes

❌ **Mistake:** Using ARIA when HTML is sufficient
```html
<div role="button" tabindex="0">Click</div>
```

✅ **Correct:** Use native elements
```html
<button>Click</button>
```

❌ **Mistake:** Conflicting roles
```html
<button role="link">Click</button>
```

✅ **Correct:** Use appropriate element
```html
<a href="/page">Click</a>
```

---

<details>
<summary><strong>🔍 Deep Dive: ARIA Architecture and When to Use It</strong></summary>

### ARIA Architecture and When to Use It

**The First Rule of ARIA (Critical):**

"No ARIA is better than bad ARIA" - from the W3C ARIA specification. This is not a suggestion; it's a fundamental principle. ARIA never adds functionality; it only provides semantic information to assistive technologies.

**Why This Matters:**
- Screen readers depend on accurate ARIA labels
- Incorrect ARIA misleads users ("it says button but acts like a link")
- Native HTML elements have built-in keyboard support, accessibility, and styling
- Using ARIA when HTML suffices adds maintenance burden

**The ARIA Decision Tree:**

```
Does semantic HTML exist for this?
├── YES → Use HTML semantic element
│         (Examples: <button>, <nav>, <main>, <article>)
│
└── NO → Use ARIA role
         (Examples: <div role="dialog">, <div role="combobox">)
         BUT: Add tabindex, keyboard handlers, and all required states
```

**Understanding ARIA Architecture - 3 Layers:**

1. **ARIA Roles** (What is this thing?)
   - Landmark roles: banner, navigation, main, contentinfo, search
   - Widget roles: button, checkbox, tab, dialog, tooltip, listbox, combobox
   - Document roles: article, table, figure, note
   - Live region roles: alert, status, log, timer

2. **ARIA Properties** (Extra information about relationships)
   - aria-label: "Search" (direct name)
   - aria-labelledby: Points to element ID containing the name
   - aria-describedby: Points to element ID with description
   - aria-owns: Defines parent-child relationships outside DOM
   - aria-haspopup: "menu", "dialog", "listbox" (what opens when clicked)

3. **ARIA States** (Current status)
   - aria-checked: true/false/mixed (checkbox, radio, switch)
   - aria-expanded: true/false (accordion, menu button)
   - aria-pressed: true/false (toggle button)
   - aria-disabled: true/false (disabled state)
   - aria-selected: true/false (selected item in listbox)
   - aria-hidden: true/false (hide from accessibility tree)

**Deep Understanding of Common ARIA Attributes:**

**aria-label vs aria-labelledby vs aria-describedby:**

```html
<!-- aria-label: Direct text name (simple cases) -->
<button aria-label="Close dialog">×</button>

<!-- aria-labelledby: Name from another element (reuse) -->
<h2 id="dialog-title">Confirm Delete</h2>
<div role="dialog" aria-labelledby="dialog-title">
  <!-- Screen reader says: "Confirm Delete dialog" -->
</div>

<!-- aria-describedby: Additional description (separate from name) -->
<label for="password">Password</label>
<input id="password" type="password" aria-describedby="pwd-hint">
<span id="pwd-hint">8+ characters, must include number and symbol</span>
<!-- Screen reader says: "Password" (label) then "8+ characters..." (description) -->
```

**Decision Matrix:**
| Scenario | Use |
|----------|-----|
| Button with icon only | aria-label |
| Dialog with heading | aria-labelledby (points to h2) |
| Form field with instructions | aria-describedby (points to hint span) |
| Multiple related labels | aria-labelledby (multiple IDs space-separated) |
| Decorative/redundant content | aria-hidden="true" |
| Complement visual content | aria-label (concise) |

**aria-live Regions - The Complete Picture:**

Live regions announce content changes to screen readers without requiring focus change:

```html
<!-- aria-live="polite" (default)
     Waits for screen reader to finish current announcement
     Use for: non-critical updates, suggestions, form hints
     Example: Item added to cart (not urgent) -->
<div aria-live="polite">
  Item added to cart
</div>

<!-- aria-live="assertive"
     Interrupts current announcement immediately
     Use for: critical alerts, errors, urgent messages
     Example: Server error, payment failed
     WARNING: Overuse frustrates screen reader users! -->
<div aria-live="assertive">
  Error: Payment failed. Please try again.
</div>

<!-- aria-atomic="true"
     Announces entire region, not just changed text
     Example: "Step 1 of 5" - both numbers important
     Default: false (announces only changed parts) -->
<div aria-live="polite" aria-atomic="true">
  <span>Step</span> <span>1</span> <span>of</span> <span>5</span>
</div>

<!-- aria-relevant
     Controls what types of changes are announced
     "additions" = new content added
     "removals" = content removed
     "text" = text changed
     "all" = all changes (default) -->
<div aria-live="polite" aria-relevant="additions">
  Items in cart: 3
  <!-- Only announces when new items added, not count changes -->
</div>
```

**Custom Component Pattern with ARIA:**

When building custom interactive components, you MUST implement:

```jsx
// ❌ WRONG: Div with role but no keyboard support
<div role="button" onclick="submit()">
  Submit
</div>

// ✅ CORRECT: Role + tabindex + keyboard handler + ARIA states
<div
  role="button"
  tabindex="0"  // Makes it focusable
  aria-pressed={isPressed}  // Updates aria state on change
  onClick={handleClick}
  onKeyDown={handleKeyDown}  // Space/Enter support
>
  Toggle Feature
</div>
```

**ARIA Roles vs HTML Semantics - Real Comparison:**

| Task | HTML | ARIA | When to Use ARIA |
|------|------|------|------------------|
| Button | `<button>` | `<div role="button">` | Never (use <button>) |
| Link | `<a href>` | `<div role="link">` | Never (use <a>) |
| Heading | `<h1>-<h6>` | `<div role="heading" aria-level="2">` | Never (use <h2>) |
| Navigation | `<nav>` | `<div role="navigation">` | Rarely (use <nav>) |
| Main content | `<main>` | `<div role="main">` | Never (use <main>) |
| Dialog | `<dialog>` or custom div | `<div role="dialog">` | When <dialog> not supported (IE11) |
| Tab panel | Custom div | `<div role="tabpanel">` | Standard pattern (no semantic HTML) |
| Listbox | Custom div | `<div role="listbox">` | Standard pattern (no semantic HTML) |

**ARIA Anti-patterns (Common Mistakes):**

1. **Using aria-label on interactive element that already has text:**
```jsx
// ❌ Bad: aria-label overrides visible text
<button aria-label="Click here">Submit Form</button>
// Screen readers say "Click here" not "Submit Form"
// Mismatch causes confusion

// ✅ Good: Only use aria-label for icons
<button aria-label="Close" title="Close">×</button>
```

2. **Aria-hidden on focusable elements:**
```jsx
// ❌ Bad: Hidden from SR but still focusable
<button aria-hidden="true">Focus but no context</button>

// ✅ Good: Use hidden attribute for complete removal
<button hidden>Not in accessibility tree</button>
```

3. **Live regions that fire too frequently:**
```jsx
// ❌ Bad: Fires every keystroke
<input
  onKeyUp={(e) => {
    announceToSR(`You typed: ${e.target.value}`);
  }}
/>

// ✅ Good: Announce only meaningful state changes
const [searchResults, setSearchResults] = useState([]);
<div aria-live="polite">
  {searchResults.length} results found
</div>
```

4. **Missing required ARIA on custom components:**
```jsx
// ❌ Bad: Custom checkbox missing required attributes
<div role="checkbox" onClick={toggle}>
  Remember me
</div>

// ✅ Good: Include all required ARIA
<div
  role="checkbox"
  aria-checked={isChecked}
  tabindex="0"
  onClick={toggle}
  onKeyDown={(e) => {
    if (e.key === ' ' || e.key === 'Enter') toggle();
  }}
>
  Remember me
</div>
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Broken Custom Select Component</strong></summary>

### Broken Custom Select Component

**The Bug:** A company built a "modern" custom select component using ARIA to replace HTML `<select>`. It passed automated accessibility tests but screen reader users reported it was unusable.

**Symptoms:**
1. Screen readers announced "combobox" but users couldn't understand what to do
2. Keyboard users couldn't navigate options with arrow keys
3. Screen reader didn't announce selected value
4. Live region spammed announcements on every keystroke
5. Focus management was chaotic - focus disappeared into void

**Root Causes:**

1. **Missing required ARIA attributes (Failed 4.1.2):**
```jsx
// ❌ Bad: Bare combobox without required attributes
function CustomSelect({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      {value || 'Select...'}
    </button>
  );
}

// ✅ Good: Complete ARIA implementation
function CustomSelect({ options, value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listboxRef = useRef();

  return (
    <div>
      <label id="select-label">{label}</label>
      <button
        id="select-button"
        aria-haspopup="listbox"  // Tells SR: "this opens a listbox"
        aria-expanded={isOpen}    // Tells SR: "is listbox open?"
        aria-labelledby="select-label"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || 'Select...'}
      </button>

      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          aria-labelledby="select-label"  // Associates with button
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```
**Impact:** 2-4% of screen reader users (primary disability), but affects 20% of keyboard-first users
**Metrics:** Session time +3 minutes, bounce rate +8% for keyboard users
**Investigation Time:** 3 hours (realized it was custom select issue)
**Fix Time:** 4 hours (full ARIA implementation + testing with NVDA)

2. **No Keyboard Support (Failed 2.1.1):**
```jsx
// ❌ Bad: No arrow key navigation
<ul role="listbox">
  {options.map(option => (
    <li role="option" onClick={selectOption}>
      {option.label}
    </li>
  ))}
</ul>

// ✅ Good: Arrow keys + Enter
const handleKeyDown = (e) => {
  if (e.key === 'ArrowDown') {
    setFocusedIndex(i => Math.min(i + 1, options.length - 1));
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    setFocusedIndex(i => Math.max(i - 1, -1));
    e.preventDefault();
  } else if (e.key === 'Enter') {
    if (focusedIndex >= 0) {
      onChange(options[focusedIndex].value);
      setIsOpen(false);
    }
  }
};
```
**Impact:** Keyboard users completely unable to navigate options
**Metrics:** Task completion rate 0% for keyboard-only users
**Fix Time:** 1 hour

3. **Spam Announcements from Live Region (Failed 4.1.2):**
```jsx
// ❌ Bad: Fires every keystroke
<div aria-live="assertive">
  {focusedIndex} / {options.length}
</div>

// ✅ Good: Announce only on selection
<div aria-live="polite">
  {isOpen && `${options[focusedIndex].label} focused`}
</div>
```
**Impact:** Screen reader users disabled live region entirely (defeating purpose)
**Metrics:** Cognitive load +200% (information overload)
**Fix Time:** 15 minutes

4. **Focus Management Issues (Failed 2.4.3):**
```jsx
// ❌ Bad: Focus lost when listbox opens
const handleOpen = () => {
  setIsOpen(true);
  // No focus management - focus stays on button but focus visual gone
};

// ✅ Good: Move focus to first option
const handleOpen = () => {
  setIsOpen(true);
  setTimeout(() => {
    listboxRef.current?.children[0]?.focus();
  }, 0);
};
```
**Impact:** Keyboard users couldn't see where focus was
**Metrics:** Time to complete task +40 seconds
**Fix Time:** 30 minutes

**Business Impact Summary:**
- **Affected Users:** 2-4% screen readers, 10-15% keyboard-first
- **Time Loss Per User:** 3-5 minutes per interaction
- **Bounce Rate Increase:** +12% for accessibility users
- **Investigation Cost:** 3 hours
- **Fix Cost:** 6 hours (implementation + testing)
- **Better Solution:** Use native `<select>` (already accessible)

**Key Lesson:** Native HTML elements are almost always better than custom ARIA implementations. If you must build custom, ensure:
1. All required ARIA attributes present
2. Full keyboard support (arrow keys, Enter, Escape)
3. Focused announcements (not spam)
4. Logical focus management
5. Real user testing with actual screen readers

</details>

<details>
<summary><strong>⚖️ Trade-offs: ARIA Complexity vs Native HTML</strong></summary>

### ARIA Complexity vs Native HTML

**The Cost-Benefit Analysis:**

| Approach | Dev Time | Testing Time | Maintenance | Keyboard Support | Screen Reader | Notes |
|----------|----------|--------------|-------------|-----------------|---------------|-------|
| **Native `<select>`** | 0 hours | 5 min | Minimal | Built-in | Perfect | Best choice |
| **Native `<button>` + CSS** | 1 hour | 15 min | Easy | Built-in | Perfect | Recommended |
| **Custom div + Full ARIA** | 6-8 hours | 2 hours | Ongoing | Must code | Must test | Last resort |

**When Native HTML is Insufficient:**

1. **Custom Functionality Required (Design System):**
```jsx
// Problem: Need complex filtering + custom look
// Solution: Use native select as fallback, custom for modern browsers

<>
  {/* Hidden native select for accessibility fallback */}
  <select aria-label="Sort by" style={{ display: 'none' }}>
    {options.map(opt => <option>{opt}</option>)}
  </select>

  {/* Enhanced custom version for modern browsers */}
  <div role="combobox" aria-owns="options-list">
    {/* Custom implementation with full ARIA */}
  </div>
</>
```

2. **Browser Compatibility (Legacy):**
   - Native `<select>` styling is limited
   - Custom ARIA select allows full CSS control
   - Trade-off: +2 hours dev time per platform
   - ROI: Only if ≥5% of users on legacy browsers

**Decision Framework:**

```
Need custom styling?
├── NO → Use native HTML element
├── YES, but basic → Use native + CSS (border, padding, font)
└── YES, complex →
    ├── Mobile/modern browsers? → Custom ARIA
    └── Include IE11/legacy? → Native fallback + custom overlay
```

**ARIA Complexity Levels:**

**Level 1 (Simple, Recommended):**
- aria-label, aria-describedby
- Development: 30 minutes
- Testing: 15 minutes
- Example: "Close" button as ×

**Level 2 (Moderate, Acceptable):**
- aria-expanded, aria-controls, aria-owns
- Development: 1-2 hours
- Testing: 30 minutes
- Example: Accordion, dropdown menu

**Level 3 (Complex, Last Resort):**
- Full widget with aria-labelledby, aria-activedescendant, live regions
- Development: 4-6 hours
- Testing: 2+ hours
- Example: Custom combobox, data grid
- Real case: Slack's custom emoji picker = 3 weeks of accessibility work

**Performance Impact of ARIA:**

Minimal if done correctly:
- aria-* attributes: ~0.1 KB each in HTML
- Keyboard handlers: 1-2 milliseconds latency
- Live regions: Only browser repaints affected area
- Screen reader communication: No performance impact (assistive tech side)

**Hidden Costs of Custom ARIA:**

1. **Browser Testing:** ×3 browsers (Chrome, Firefox, Safari)
2. **Screen Reader Testing:** ×3 readers (NVDA, JAWS, VoiceOver)
3. **Keyboard Testing:** ×5 scenarios (Tab, Arrow keys, Enter, Escape, Shift+Tab)
4. **Maintenance:** Any UI change = accessibility retest
5. **Staff Training:** Team needs accessibility knowledge

**Better Alternative - Hybrid Approach:**

```jsx
function SmartSelect({ options, value, onChange, label }) {
  const [useNative, setUseNative] = useState(false);

  // Fallback to native select on mobile / keyboard focus
  if (useNative || !CSS.supports('--custom-properties: true')) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  // Custom version for modern browsers
  return <CustomSelectWithARIA {...props} />;
}
```

This approach:
- Guarantees accessibility (native fallback)
- Provides enhanced UX for modern browsers
- Reduces development time by 40%
- Eliminates many testing scenarios

</details>

<details>
<summary><strong>💬 Explain to Junior: ARIA as a Translator</strong></summary>

### ARIA as a Translator

**Analogy: ARIA as a Real-Time Translator**

Screen readers can only "see" what's in the HTML/CSS/JavaScript accessibility tree. They're like a translator reading a script of your website to someone who can't see it.

**The Problem ARIA Solves:**

Imagine you have this code:
```html
<div onclick="submitForm()">✉️</div>  <!-- An envelope icon button -->
```

A screen reader sees: "Div" - Wait, what? What does this do? Is it clickable? What's an envelope?

With ARIA:
```html
<div
  role="button"
  aria-label="Send email"
  onclick="submitForm()"
>
  ✉️
</div>
```

Now screen reader says: "Send email, button" - Ah! I know what this does.

**Three ARIA Superpowers:**

**1. ARIA Roles = "What is this thing?"**

```html
<!-- Without role: "Div" - Very confusing -->
<div></div>

<!-- With role: "Button" - Now it makes sense -->
<div role="button">Click me</div>

<!-- Even better: Use native <button> - Built-in accessibility -->
<button>Click me</button>
```

**2. ARIA Properties = "What's it called and what does it do?"**

```html
<!-- aria-label: Directly name something -->
<button aria-label="Close dialog">×</button>

<!-- aria-describedby: Explain what something does -->
<button aria-describedby="save-desc">Save</button>
<span id="save-desc">Saves your changes permanently</span>

<!-- aria-labelledby: Name it using another element -->
<h2 id="dialog-title">Confirm Delete</h2>
<div role="dialog" aria-labelledby="dialog-title"></div>
```

**3. ARIA States = "What's the current situation?"**

```html
<!-- Is this menu open or closed? -->
<button aria-expanded="false">Menu</button>

<!-- Is this checkbox checked? -->
<div role="checkbox" aria-checked="true">Remember me</div>

<!-- Is this currently selected? -->
<li role="option" aria-selected="true">Option 1</li>
```

**Key Insight: ARIA is Invisible to Sighted Users**

```html
<!-- This looks like a button to you: -->
<div role="button" style="padding: 10px; background: blue; color: white;">
  Click me
</div>

<!-- Screen reader says: "Click me, button"
     You see: A blue clickable-looking thing
     Both understand it's a button, but for different reasons -->
```

**The Golden Rule Illustrated:**

```jsx
// ❌ Bad: Adding ARIA when HTML works fine
<div role="button" onclick="submit()">Submit</div>

// Why it's bad:
// - Missing keyboard support (what if user presses Tab + Enter?)
// - ARIA is fake - it only talks to screen readers
// - Developer must manually add keyboard handlers
// - Extra maintenance burden

// ✅ Good: Use native button
<button onclick="submit()">Submit</button>

// Why it's good:
// - Built-in keyboard support (Tab + Enter work automatically)
// - Built-in ARIA (says "button" automatically)
// - Looks right in all browsers
// - Zero maintenance overhead
```

**Real Interview Template:**

"ARIA stands for Accessible Rich Internet Applications. It's a way to describe interactive elements to screen readers when HTML semantics aren't available.

ARIA has three parts:
1. **Roles** - What is this (button, dialog, menu)
2. **Properties** - How is it named and described (aria-label, aria-describedby)
3. **States** - What's happening now (aria-expanded, aria-checked)

The first rule of ARIA is: **Don't use ARIA if HTML already does it**. Always prefer native `<button>`, `<nav>`, `<main>` over `<div role=...>`.

I use ARIA only for custom components that HTML doesn't support, like custom comboboxes or date pickers. And even then, I test with actual screen readers (NVDA, JAWS) because writing correct ARIA is tricky.

The big gotcha: ARIA is invisible to sighted users. You can't tell if ARIA is correct just by looking. You must test with screen readers or automatic tools like axe or Lighthouse."

**Common ARIA Mistakes to Avoid:**

1. **aria-label on elements that already have text:**
```jsx
// ❌ Bad: aria-label overrides the visible text
<a href="/home" aria-label="Click here">Home</a>
// SR says "Click here" but you see "Home" - confusing mismatch

// ✅ Good: aria-label only for icons/symbols
<a href="/home">Home</a>  // SR says "Home, link"
<button aria-label="Close">×</button>  // SR says "Close, button"
```

2. **Forgetting keyboard support on ARIA widgets:**
```jsx
// ❌ Bad: Role but no keyboard
<div role="button" onclick="action()">
  Click me  <!-- User can click, but can't Tab to it or press Enter -->
</div>

// ✅ Good: Role + keyboard support
<div
  role="button"
  tabindex="0"
  onclick="action()"
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      action();
      e.preventDefault();
    }
  }}
>
  Click me
</div>
```

3. **aria-hidden on the wrong elements:**
```jsx
// ❌ Bad: Hiding interactive content
<button aria-hidden="true">Delete</button>
// Button is hidden from SR but still focusable - very confusing

// ✅ Good: Only hide decorative content
<span aria-hidden="true">★★★★★</span>  <!-- Decorative stars -->
<span className="sr-only">5 out of 5 stars</span>  <!-- Real info -->
```

</details>

### Follow-up Questions

- "When should you use aria-label vs aria-labelledby?"
- "What's the difference between aria-hidden and display:none?"
- "How do you create an accessible modal dialog?"
- "What are live region politeness levels?"
- "How do you handle aria-activedescendant in custom comboboxes?"
- "What's the difference between role and semantic HTML?"

### Resources

- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Using ARIA](https://www.w3.org/TR/using-aria/)
- [ARIA Examples](https://www.w3.org/WAI/ARIA/apg/example-index/)

---

[← Back to Accessibility README](./README.md)

**Progress:** 2 of 5 accessibility questions
