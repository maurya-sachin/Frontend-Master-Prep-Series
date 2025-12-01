# HTML & CSS Flashcards

> **60 HTML/CSS concepts for frontend interviews**

**Time to review:** 30 minutes
**Best for:** All frontend roles, UI implementation

---

## Card 1: Semantic HTML
**Q:** Why use semantic HTML elements?

**A:** 1) Better accessibility (screen readers), 2) Improved SEO, 3) Cleaner code structure, 4) Default styling, 5) Easier maintenance. Use <header>, <nav>, <main>, <article>, <section>, <aside>, <footer>.

**Difficulty:** 🟢 Easy
**Tags:** #html #semantics #accessibility
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Interviewers often ask how to refactor a div-heavy layout. Show you understand semantic HTML benefits for accessibility (screen readers), SEO rankings, and maintainability. Mention: semantic elements provide document structure that no amount of ARIA can replace. Example: why use <article> for blog posts instead of <div class="article">?

---

## Card 2: Box Model
**Q:** Explain CSS box model layers.

**A:** From outside to inside: Margin → Border → Padding → Content. box-sizing: content-box (default, width = content only) vs border-box (width includes padding + border).

**Difficulty:** 🟢 Easy
**Tags:** #css #box-model
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Expect follow-up: "Why use border-box?" Answer: border-box makes width/padding calculations intuitive and prevents overflow surprises. Most projects use `* { box-sizing: border-box }` by default. Show understanding of why padding adds visual width with content-box (common gotcha).

---

## Card 3: Flexbox vs Grid
**Q:** When to use Flexbox vs CSS Grid?

**A:** Flexbox: one-dimensional layout (row/column), component-level, content-first. Grid: two-dimensional, page-level layouts, layout-first. Can combine both.

**Difficulty:** 🟡 Medium
**Tags:** #css #layout #flexbox #grid
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Real question: "Build a responsive card layout with images, titles, descriptions." Use Grid for 2D structure (image spanning full width in mobile), Flexbox inside cards for content alignment. Emphasize: Flexbox for 1D (navbar, space-between buttons), Grid for 2D (gallery, page structure). Show both together.

---

## Card 4: Specificity
**Q:** CSS specificity order from highest to lowest?

**A:** !important > Inline styles (1000) > IDs (100) > Classes/attributes/pseudo-classes (10) > Elements/pseudo-elements (1) > Universal selector (0).

**Difficulty:** 🟡 Medium
**Tags:** #css #specificity
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Common production issue: "Why isn't my CSS being applied?" Explain specificity wars. Show example: `.container.nav` (20) beats `#nav` (100) is FALSE—IDs always win. Mention: avoid IDs and !important. Use BEM naming to predict specificity. Calculate: how many classes equal one ID? Answer: 10.

---

## Card 5: Position Values
**Q:** Difference between position values?

**A:** static (default, normal flow), relative (offset from normal position), absolute (positioned to nearest positioned ancestor), fixed (viewport), sticky (relative + fixed hybrid).

**Difficulty:** 🟡 Medium
**Tags:** #css #position
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** "Create a sticky navbar that scrolls with page." Use position: sticky + top: 0. Key insight: sticky needs parent with overflow: visible and proper height. Common mistake: applying fixed to wrong element then wondering why it behaves oddly. Show: absolute needs positioned parent, fixed ignores all parents.

---

## Card 6: BEM Methodology
**Q:** What is BEM in CSS?

**A:** Block Element Modifier. Naming convention: .block__element--modifier. Example: .card__title--large. Benefits: avoids specificity wars, self-documenting, scalable.

**Difficulty:** 🟡 Medium
**Tags:** #css #architecture #bem
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Show you understand architecture at scale. BEM prevents selector specificity creep that plagues messy codebases. Explain: .card__title--large is flat (no nesting), so always 10 specificity. Compare to nested selectors .card .title.large that compound. In team projects, BEM makes CSS predictable and refactorable.

---

## Card 7: Viewport Units
**Q:** Difference between vh/vw and %?

**A:** vh/vw: relative to viewport (100vh = full height). %: relative to parent element. vh/vw ignore parent size, good for full-screen sections.

**Difficulty:** 🟢 Easy
**Tags:** #css #units
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Mobile gotcha: 100vh includes mobile browser URL bar (shrinks content). Better practice: use max-height: 100vh or relative units when possible. Mention: fixed backgrounds with vh units can cause mobile viewport issues. Show: use % for parent-relative sizing, vh for truly full viewport.

---

## Card 8: em vs rem
**Q:** Difference between em and rem units?

**A:** em: relative to parent font-size (compounds). rem: relative to root font-size (doesn't compound). Use rem for consistency, em for proportional scaling.

**Difficulty:** 🟡 Medium
**Tags:** #css #units
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Scalability question: "Design a type system that scales with breakpoints." Demonstrate: use rem for components (consistent), em only when you want proportional scaling (rare). Explain compounding: 2em in 2em parent = 4x root (common bug). Most codebases use rem + CSS variables now.

---

## Card 9: Pseudo-classes vs Pseudo-elements
**Q:** Difference between pseudo-classes and pseudo-elements?

**A:** Pseudo-classes (:hover, :focus, :nth-child) - select element state. Pseudo-elements (::before, ::after, ::first-line) - style part of element. Double colon for pseudo-elements.

**Difficulty:** 🟡 Medium
**Tags:** #css #selectors
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Practical use: create custom buttons with ::before for icons, ::after for tooltips. Explain: ::before/::after add virtual DOM elements (no extra HTML). Test knowledge: "Does :hover work on <div>?" Yes. "Does ::before create a real DOM element?" No—CSS only. Interview question: implement decorative borders using pseudo-elements.

---

## Card 10: Cascade & Inheritance
**Q:** How does CSS cascade work?

**A:** Order: 1) Importance (!important), 2) Specificity, 3) Source order (last wins). Inherited properties: color, font, text. Non-inherited: margin, padding, border.

**Difficulty:** 🟡 Medium
**Tags:** #css #cascade
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Explain cascade = resolve conflicts. Common confusion: "Why did padding not inherit?" Answer: padding doesn't inherit (design principle—margins vary). Inherited properties (color, font) cascade down tree. Use this strategically: set font-family on body, not every element. Show understanding of why certain properties inherit (text styling) vs not (layout).

---

## Card 11: Flexbox Properties
**Q:** Main flexbox properties on container?

**A:** display: flex, flex-direction (row/column), justify-content (main axis), align-items (cross axis), flex-wrap, gap. On items: flex-grow, flex-shrink, flex-basis, align-self.

**Difficulty:** 🟡 Medium
**Tags:** #css #flexbox
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Real interview: "Distribute 5 buttons evenly with space between." Solution: justify-content: space-between. Clarify axes: justify-content = main (row), align-items = cross (vertical in row direction). Flex item gotcha: flex: 1 = flex-grow: 1 + flex-shrink: 1 + flex-basis: 0. Show you understand shorthand.

---

## Card 12: Grid Template
**Q:** Key CSS Grid properties?

**A:** grid-template-columns, grid-template-rows, gap, grid-column/row (items), grid-template-areas (named regions), auto-fit/auto-fill (responsive).

**Difficulty:** 🟡 Medium
**Tags:** #css #grid
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Responsive grids: use repeat(auto-fit, minmax(250px, 1fr)) for card layouts—no media queries needed! Explain difference: auto-fit collapses empty tracks, auto-fill preserves them. Grid areas (named sections) make layouts semantic and maintainable. Show: Grid excels at 2D layouts where item position matters.

---

## Card 13: Media Queries
**Q:** Best practices for responsive design?

**A:** Mobile-first (min-width), common breakpoints (768px, 1024px, 1280px), prefer em/rem over px, use relative units, test on real devices.

**Difficulty:** 🟢 Easy
**Tags:** #css #responsive
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Mobile-first philosophy: write styles for mobile, then enhance for desktop. Use min-width (not max-width) to avoid cascading overrides. Realistic breakpoints: 640px (tablet), 1024px (desktop), not arbitrary numbers. Bonus: mention container queries (@container) as modern alternative—style based on parent width, not viewport.

---

## Card 14: Z-index
**Q:** How does z-index work?

**A:** Controls stacking order. Only works on positioned elements (not static). Creates stacking context. Higher value = on top. Parent context matters.

**Difficulty:** 🟡 Medium
**Tags:** #css #z-index
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Gotcha: z-index: 9999 doesn't win if parent has lower z-index and creates stacking context. Stacking context resets hierarchy. Common issue: modals behind content because parent has z-index. Solution: manage z-index with CSS variables or layering system (modals always highest context). Show understanding of stacking context creation.

---

## Card 15: Display Property
**Q:** Common display values and use cases?

**A:** block (full width, new line), inline (no width/height), inline-block (inline with dimensions), flex (flexbox), grid (CSS grid), none (hidden).

**Difficulty:** 🟢 Easy
**Tags:** #css #display
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Know the difference: display: none removes element from layout (no space), visibility: hidden hides it (space preserved). Inline elements ignore width/height (margin-top/bottom too)—use inline-block for sizing. Modern practice: avoid inline-block, use flexbox/grid. Mention: display: contents (rare but powerful—element disappears, children take its place).

---

## Card 16: CSS Variables
**Q:** Benefits of CSS custom properties?

**A:** Runtime changeable (JS), cascading/inheriting, scoped, media query support, no build step. Syntax: --name: value; use: var(--name).

**Difficulty:** 🟢 Easy
**Tags:** #css #variables
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Practical use: change theme colors with `document.documentElement.style.setProperty('--primary-color', '#fff')`. CSS variables cascade (override in specific scope), fallbacks work: `var(--color, blue)`. Show understanding: no preprocessing needed, works in modern browsers. Use for responsive: set different --spacing on breakpoints.

---

## Card 17: Transitions vs Animations
**Q:** When to use CSS transitions vs animations?

**A:** Transitions: simple A→B state changes (hover, focus). Animations: complex, multi-step, repeating, auto-starting. Keyframes for animations.

**Difficulty:** 🟡 Medium
**Tags:** #css #animations
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Transitions respond to user action (hover, focus, JS class toggle). Animations start automatically and loop. Performance: both use GPU acceleration if animating transform/opacity. Avoid animating layout properties (width, height, left). Show: use transition for 90% of cases (smoother UX), animations for special effects (loading spinners, attention-grabbing).

---

## Card 18: Transform Property
**Q:** Common CSS transform functions?

**A:** translate(x, y), rotate(deg), scale(x, y), skew(x, y). Hardware accelerated. Use for animations (better than left/top). No reflow.

**Difficulty:** 🟢 Easy
**Tags:** #css #transform
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Performance insight: animating transform/opacity is GPU-accelerated (60fps possible). Animating left/top triggers reflow/repaint (jank). Show: transform: translateX(10px) better than left: 10px for animations. Explain: transform happens in compositor thread, not main thread. Essential for smooth scroll animations and interactions.

---

## Card 19: Will-change
**Q:** What is will-change property?

**A:** Hints browser to optimize element. Use sparingly: will-change: transform, opacity. Apply before change, remove after. Overuse hurts performance.

**Difficulty:** 🔴 Hard
**Tags:** #css #performance
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Over-applying will-change can tank performance (creates unnecessary layers). Use only for elements that actually animate frequently. Real scenario: will-change: transform on hover target before transition. Advanced: understand it creates new stacking context (can affect z-index). Best practice: remove will-change after animation completes to save memory.

---

## Card 20: Contain Property
**Q:** What does CSS contain do?

**A:** Isolates element for performance. Values: layout, paint, size, style. Tells browser element content won't affect outside. Improves rendering performance.

**Difficulty:** 🔴 Hard
**Tags:** #css #performance
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** contain: paint helps with lists—browser skips rendering off-screen items. contain: layout isolates child layout calculations (improves performance on complex components). Real use: contain: strict on cards in grid—tells browser card layout doesn't affect siblings. Less known than will-change but more powerful. Show understanding of paint/layout optimization.

---

## Card 21: Aspect Ratio
**Q:** How to maintain aspect ratio?

**A:** Modern: aspect-ratio: 16/9. Legacy: padding-top hack (padding: 56.25% for 16:9). Use for responsive images, videos.

**Difficulty:** 🟡 Medium
**Tags:** #css #layout
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Aspect ratio prevents layout shift (CLS—Core Web Vitals metric). Always set aspect-ratio on <img> or video containers for better perceived performance. Old method (padding hack) is obsolete but show you know it. Modern: aspect-ratio works cross-browser now. Mention: improves Cumulative Layout Shift scores (Google rankings).

---

## Card 22: Object-fit
**Q:** What does object-fit do?

**A:** Controls replaced element content fitting. Values: fill, contain (fit inside), cover (fill, crop), none, scale-down. Use for images, videos.

**Difficulty:** 🟡 Medium
**Tags:** #css #images
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real use: background-image alternative. object-fit: cover for hero images (crop intelligently), object-fit: contain for product images (show full content). Pair with object-position (where to crop). Example: crop face from top in portrait photos. Shows understanding of image handling beyond basic img tags.

---

## Card 23: Overflow
**Q:** Overflow property values?

**A:** visible (default, overflow visible), hidden (clip), scroll (always scrollbars), auto (scrollbars when needed). overflow-x/y for specific axis.

**Difficulty:** 🟢 Easy
**Tags:** #css #overflow
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Common use: overflow: hidden creates BFC (Block Formatting Context—fixes margin collapse bugs). overflow: auto on containers with max-height enables scrolling without fixed height. Gotcha: overflow: hidden clips content—use with caution on dropdowns, tooltips. Horizontal scroll: overflow-x: auto + white-space: nowrap on flex container.

---

## Card 24: Float & Clear
**Q:** When to use float (if ever)?

**A:** Mostly legacy (use flexbox/grid instead). Still valid for: text wrapping around images. Use clear to prevent wrapping. Clearfix hack for container height.

**Difficulty:** 🟡 Medium
**Tags:** #css #float
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Float is outdated for layout but shows understanding of CSS history. Text wrapping around images (rare use) still uses float. Clearfix hack (overflow: hidden on parent) was standard before flexbox. Show you know why float is problematic (collapses parent height, confusing behavior). If interviewer asks, explain migration to flexbox/grid instead.

---

## Card 25: Vertical Centering
**Q:** Modern ways to center vertically?

**A:** Flexbox: display: flex; align-items: center. Grid: display: grid; place-items: center. Position: position: absolute; top: 50%; transform: translateY(-50%).

**Difficulty:** 🟢 Easy
**Tags:** #css #centering
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Flexbox is easiest (works on any element). Grid place-items: center centers both axes (more elegant). Absolute + transform works for fixed sizing (older approach). Show context matters: use flexbox in navbar, grid in modal. Mention: margin: auto trick on positioned absolute elements (also works but less readable).

---

## Card 26: CSS Reset vs Normalize
**Q:** Difference between CSS reset and normalize?

**A:** Reset: removes all default styles (zero everything). Normalize: preserves useful defaults, fixes inconsistencies. Normalize preferred for modern projects.

**Difficulty:** 🟡 Medium
**Tags:** #css #architecture
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Reset strips everything (aggressive). Normalize fixes browser inconsistencies while keeping sensible defaults (buttons still look like buttons). Modern approach: minimal reset + CSS variables for theming. Mention: most projects use neither anymore—modern browsers are consistent. Show understanding of why this matters at scale (team standardization).

---

## Card 27: Form Elements
**Q:** Important form accessibility attributes?

**A:** <label for="id">, aria-label, aria-describedby, required, aria-required, role, type, name, autocomplete. Associate labels with inputs.

**Difficulty:** 🟡 Medium
**Tags:** #html #forms #accessibility
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Accessibility requirement: every input needs label (for screen readers). Click the label text should focus input. aria-describedby links input to error messages (screen reader announces them). Show understanding: proper <label> eliminates need for aria-label in most cases. Mention: autocomplete attributes help password managers.

---

## Card 28: ARIA Roles
**Q:** What are ARIA roles?

**A:** Accessibility attributes. role="button", "navigation", "main", "complementary". Use semantic HTML first. ARIA when semantic HTML insufficient.

**Difficulty:** 🟡 Medium
**Tags:** #html #aria #accessibility
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Common mistake: adding ARIA without semantic HTML. If you can use <button>, don't use <div role="button">. ARIA is for custom components only (e.g., tabs, trees, sliders). Show understanding: screen reader announces role (button, navigation, main). Mention: ARIA doesn't add keyboard behavior—still need JS for that. Required in accessibility audits.

---

## Card 29: Alt Text
**Q:** Best practices for alt text?

**A:** Describe image content/function. Empty alt="" for decorative. Don't say "image of". Be concise. Essential for accessibility and SEO.

**Difficulty:** 🟢 Easy
**Tags:** #html #accessibility #seo
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Real impact: screen readers depend on alt text. Bad: "photo of person". Good: "Smiling woman at desk using laptop". Empty alt="" (not omitted!) for decorative images. SEO benefit: Google indexes alt text (image search ranking). Show: you understand alt text benefits both accessibility and search rankings simultaneously.

---

## Card 30: Picture Element
**Q:** When to use <picture> element?

**A:** Multiple image sources: art direction (different crops), format fallbacks (WebP → JPG), responsive images. More control than img srcset.

**Difficulty:** 🟡 Medium
**Tags:** #html #images
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Use <picture> for art direction (different images per breakpoint). Use srcset on <img> for resolution-based selection (1x vs 2x). Common use: portrait crops on mobile, landscape on desktop. Performance benefit: smaller images on mobile (bandwidth savings). Show: <picture> + <source media queries> + WebP format fallback = full solution.

---

## Card 31: Lazy Loading
**Q:** How to lazy load images?

**A:** Native: loading="lazy" attribute. Modern browsers only. Intersection Observer for more control. Improves initial page load.

**Difficulty:** 🟢 Easy
**Tags:** #html #performance
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Native loading="lazy" is simplest (browser handles it). Intersection Observer gives control (load before visible, fire analytics). Real scenario: infinite scroll + lazy loading = huge performance boost. Show: combine with placeholder/blur effect (perceived performance). Mention: important for Core Web Vitals (LCP optimization).

---

## Card 32: Meta Tags
**Q:** Essential meta tags for SEO?

**A:** <title>, <meta name="description">, viewport, charset="UTF-8", Open Graph (og:), Twitter Card, canonical. robots meta for crawling.

**Difficulty:** 🟡 Medium
**Tags:** #html #seo
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Title (60 chars) + description (160 chars) = Google search snippet. Open Graph tags = social media preview. Canonical tag prevents duplicate content (SEO penalty). Viewport meta essential for responsive design. Show understanding: these aren't just markup—they directly impact rankings, click-through rates, and UX.

---

## Card 33: Preload vs Prefetch
**Q:** Difference between preload and prefetch link?

**A:** <link rel="preload">: high-priority, current page. <link rel="prefetch">: low-priority, future navigation. Use preload for critical resources.

**Difficulty:** 🟡 Medium
**Tags:** #html #performance
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Preload fonts (improves perceived performance). Prefetch next page resources (if you predict navigation). Real use: preload hero image, prefetch data for anticipated user action. Show understanding: preload uses bandwidth now, prefetch only when idle. Mention: relates to Core Web Vitals (LCP = Largest Contentful Paint uses preload strategy).

---

## Card 34: Content Visibility
**Q:** What is content-visibility CSS property?

**A:** Skips rendering off-screen content. Values: auto (skip when off-screen), hidden (always skip), visible (default). Huge performance boost for long pages.

**Difficulty:** 🔴 Hard
**Tags:** #css #performance
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Transforms performance on long pages (thousands of items). content-visibility: auto + contain-intrinsic-size = browser skips rendering below fold. Real benchmark: 1000-item list loads 10x faster. Pair with Intersection Observer for infinite scroll. Advanced: understand tradeoff (reduced interactivity until scrolled). Impresses senior interviewers (cutting-edge optimization).

---

## Card 35: Clip-path
**Q:** Use cases for clip-path?

**A:** Create non-rectangular shapes, masks, reveals, interesting designs. Values: polygon(), circle(), ellipse(), inset(). Can animate.

**Difficulty:** 🟡 Medium
**Tags:** #css #shapes
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Decorative: clip-path: polygon() for custom shapes (hero sections). Functional: mask reveal animations on scroll. Performance: clip-path uses GPU (hardware accelerated). Gotcha: clip-path doesn't affect hit-area (interactive elements outside path still work—use pointer-events: none). Good for animations (creates impressive scrollytelling effects).

---

## Card 36: CSS Grid Auto-placement
**Q:** How does CSS Grid auto-placement work?

**A:** grid-auto-flow: row (default), column, dense (fill holes). Auto-places items if not explicitly positioned. Dense packs tightly.

**Difficulty:** 🔴 Hard
**Tags:** #css #grid
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Advanced use: grid-auto-flow: dense fills gaps (useful for masonry layouts). Default behavior predictable: flows left-to-right, top-to-bottom. Show understanding: CSS Grid automatically places items you don't explicitly position. Mention: dense can cause reordering issues (visual vs DOM order mismatch—bad for accessibility).

---

## Card 37: Line Clamping
**Q:** How to truncate multi-line text?

**A:** display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden. Shows ellipsis after N lines.

**Difficulty:** 🟡 Medium
**Tags:** #css #text
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Common UI pattern: card descriptions clamped to 2 lines. Vendor-prefixed but widely supported (works in all modern browsers). Real use: prevent content overflow in card grids. Better alternative coming: CSS text-overflow (not yet stable). Show: use for content truncation without JS. Mention: one-line clamping uses text-overflow: ellipsis + white-space: nowrap instead.

---

## Card 38: Scrollbar Styling
**Q:** How to style scrollbars?

**A:** Webkit: ::-webkit-scrollbar, ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-track. Firefox: scrollbar-width, scrollbar-color. Limited cross-browser.

**Difficulty:** 🟡 Medium
**Tags:** #css #scrollbar
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Cross-browser scrollbar styling is still fragmented (Firefox and Webkit differ). Be cautious: custom scrollbars can hurt accessibility and feel weird. Only use for brand consistency in modern apps. Show understanding: scrollbar-color and scrollbar-width (Firefox) are new standards-track. Mention: consider cost vs benefit (most users expect default scrollbars).

---

## Card 39: Focus States
**Q:** Why are focus states important?

**A:** Accessibility (keyboard navigation), usability, WCAG requirement. Never remove :focus outline without replacement. Use :focus-visible for mouse vs keyboard.

**Difficulty:** 🟡 Medium
**Tags:** #css #accessibility
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** WCAG requires visible focus indicator. Never do `outline: none` without replacement. Accessibility impact: keyboard users depend on focus visibility. Use :focus-visible to show outline only for keyboard (not mouse). Show understanding: 15% of users use keyboard exclusively. Common violation: remove outline on buttons (WCAG AA failure). Interview test: ask how to customize focus appearance.

---

## Card 40: CSS Container Queries
**Q:** What are container queries?

**A:** Style based on parent size (not viewport). @container (min-width: 400px). Useful for responsive components. Better than media queries for components.

**Difficulty:** 🔴 Hard
**Tags:** #css #responsive
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Next-gen responsive design (2024+). Components style themselves based on container size, not viewport. Solves problem: same component looks different in sidebar vs main content. Implementation: wrap container-type: inline-size, then use @container rules. Shows cutting-edge knowledge. Mention: browser support growing (Chrome, Firefox). Future of responsive components (replaces media queries for many cases).

---

[Continue with 20 more advanced HTML/CSS cards...]

---

[← Back to Flashcards](../README.md)
