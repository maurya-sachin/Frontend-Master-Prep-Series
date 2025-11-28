# Image Optimization

> Image formats, lazy loading, responsive images, WebP, next/image, and performance best practices.

---

## Question 1: Image Optimization Techniques

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Google, Meta

### Question
What are the best practices for optimizing images in web applications?

### Answer

**Optimization Techniques:**
1. Modern formats (WebP, AVIF)
2. Lazy loading
3. Responsive images
4. CDN delivery
5. Compression

```html
<!-- Responsive images -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>

<!-- Srcset for resolution switching -->
<img
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
  src="medium.jpg"
  alt="Responsive image"
  loading="lazy"
>
```

```jsx
// Next.js Image optimization
import Image from 'next/image';

<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  quality={85}
  placeholder="blur"
  loading="lazy"
/>
```

### Resources
- [Image Optimization](https://web.dev/fast/#optimize-your-images)

---

<details>
<summary>🔍 <strong>Deep Dive: Image Optimization Under the Hood</strong></summary>

**Modern Image Format Compression:**

**WebP vs AVIF vs JPEG:**
- **WebP**: Google's format, ~30% smaller than JPEG with same quality
  - Uses VP8 video codec technology
  - Supports lossy and lossless compression
  - Browser support: 96%+
- **AVIF**: Next-gen format based on AV1 video codec
  - ~50% smaller than JPEG, ~20% smaller than WebP
  - Better compression at low bitrates
  - Browser support: 85%+ (growing)
- **JPEG-XL**: Emerging format, even better compression
  - Limited browser support (in development)

**How `loading="lazy"` Works:**
```javascript
// Browser's lazy loading algorithm
1. Calculate viewport + threshold (typically 1-2 screens ahead)
2. Check if image intersection ratio > 0 within threshold
3. If yes, start loading image
4. Use Intersection Observer API internally

// Polyfill implementation
const lazyImages = document.querySelectorAll('img[loading="lazy"]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
}, {
  rootMargin: '50px' // Load 50px before entering viewport
});

lazyImages.forEach(img => imageObserver.observe(img));
```

**Next.js Image Component Optimizations:**
1. **Automatic format detection**: Serves WebP/AVIF to supporting browsers
2. **Dynamic resizing**: Generates multiple sizes on-demand
3. **Blur placeholder**: Uses tiny base64-encoded version (< 1KB)
4. **Priority loading**: `priority` prop uses preload/prefetch
5. **CDN optimization**: Automatically uses Vercel's image CDN

**Responsive Images Algorithm:**
```javascript
// Browser's srcset selection algorithm
function selectImage(srcset, sizes, viewportWidth, devicePixelRatio) {
  // 1. Parse srcset: "small.jpg 480w, medium.jpg 800w"
  const candidates = parseSrcset(srcset);

  // 2. Evaluate sizes attribute
  const targetWidth = evaluateSizes(sizes, viewportWidth);

  // 3. Calculate effective width
  const effectiveWidth = targetWidth * devicePixelRatio;

  // 4. Select best candidate (closest width without going under)
  const selected = candidates
    .filter(c => c.width >= effectiveWidth)
    .sort((a, b) => a.width - b.width)[0]
    || candidates[candidates.length - 1]; // Fallback to largest

  return selected.url;
}

// Example: iPhone 14 Pro (390px viewport, 3x DPR)
// sizes="(max-width: 600px) 100vw, 50vw"
// Evaluates to: 390px * 1.0 (100vw) * 3 (DPR) = 1170px
// Selects: 1200w image (closest without going under)
```

**CDN Image Optimization Pipeline:**
```
1. Client requests: /image.jpg?w=800&q=80&f=webp
2. CDN checks cache for transformed version
3. If miss:
   a. Fetch original from origin server
   b. Decode image
   c. Resize to 800px width
   d. Compress with quality=80
   e. Encode to WebP
   f. Cache result (TTL: 1 year)
   g. Add Cache-Control: immutable header
4. Serve optimized image (~70% smaller than original)
```

**Compression Quality Trade-offs:**
- **Quality 100**: Lossless/near-lossless, file size ~100%
- **Quality 85**: Sweet spot - minimal visual loss, ~50% size reduction
- **Quality 60**: Noticeable compression artifacts, ~30% size
- **Quality 40**: Significant degradation, only for thumbnails

</details>

---

<details>
<summary>🐛 <strong>Real-World Scenario: E-commerce Product Gallery Performance Crisis</strong></summary>

**Problem:**
E-commerce site with 50 product images per page experiencing:
- LCP: 8.2s (target: < 2.5s)
- Page weight: 25MB
- Bounce rate: 67% on mobile
- Lost revenue: ~$45K/month from slow load times

**Investigation with Chrome DevTools:**

```javascript
// Step 1: Audit current images
performance.getEntriesByType('resource')
  .filter(r => r.initiatorType === 'img')
  .forEach(img => {
    console.log(`${img.name}: ${(img.transferSize / 1024).toFixed(2)} KB, ${img.duration.toFixed(2)}ms`);
  });

// Results:
// product-1.jpg: 1,247 KB, 3,240ms
// product-2.jpg: 1,189 KB, 3,120ms
// product-3.jpg: 1,302 KB, 3,450ms
// ... (all images loading immediately, blocking LCP)

// Step 2: Check image rendering
const lcpEntry = performance.getEntriesByType('largest-contentful-paint')[0];
console.log('LCP element:', lcpEntry.element); // <img id="hero-product">
console.log('LCP time:', lcpEntry.renderTime); // 8,234ms
```

**Root Causes:**
1. ❌ Original 4K images (3840×2160) served to all devices
2. ❌ JPEG format only (no WebP/AVIF)
3. ❌ All 50 images load immediately (no lazy loading)
4. ❌ No responsive images (same file for mobile/desktop)
5. ❌ Hero image at bottom of HTML (render-blocking)

**Solution Implementation:**

```jsx
// Before (React component)
function ProductGallery({ products }) {
  return (
    <div className="gallery">
      {products.map(product => (
        <img
          src={`/images/${product.id}.jpg`}
          alt={product.name}
        />
      ))}
    </div>
  );
}

// After (optimized)
import Image from 'next/image';

function ProductGallery({ products }) {
  return (
    <div className="gallery">
      {products.map((product, index) => (
        <Image
          key={product.id}
          src={`/images/${product.id}.jpg`}
          alt={product.name}
          width={600}
          height={400}
          quality={85}
          placeholder="blur"
          blurDataURL={product.blurDataURL}
          loading={index < 6 ? 'eager' : 'lazy'} // First 6 eager, rest lazy
          priority={index === 0} // Preload hero image
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ))}
    </div>
  );
}

// Generate blur placeholders (build time)
import sharp from 'sharp';

async function generateBlurDataURL(imagePath) {
  const buffer = await sharp(imagePath)
    .resize(10, 10, { fit: 'inside' })
    .webp({ quality: 20 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString('base64')}`;
}
```

**Results After Optimization:**
```
Metric                Before    After     Improvement
─────────────────────────────────────────────────────
LCP                   8.2s      1.8s      -78%
Page weight (images)  25MB      3.2MB     -87%
Initial load images   50        6         -88%
Mobile LCP            12.4s     2.1s      -83%
Bounce rate           67%       31%       -54%
Revenue impact        -$45K/mo  +$62K/mo  +238%
```

**Additional Optimizations:**
```javascript
// Preload hero image in <head>
<link
  rel="preload"
  as="image"
  href="/images/hero-product.webp"
  imagesrcset="/images/hero-product-480.webp 480w, /images/hero-product-800.webp 800w"
  imagesizes="100vw"
/>

// Implement progressive JPEG for remaining JPEGs
// (loads low-res preview, then full quality)
```

</details>

---

<details>
<summary>⚖️ <strong>Trade-offs: Image Optimization Decisions</strong></summary>

**1. Format Selection:**

| Format | Pros | Cons | Use When |
|--------|------|------|----------|
| **AVIF** | Best compression (50% smaller) | Limited support (85%), slower encoding | Modern apps, acceptable fallbacks |
| **WebP** | Great compression (30% smaller), fast encode | 96% support (IE unsupported) | Primary choice for most apps |
| **JPEG** | Universal support (100%) | Larger files, no transparency | Legacy support, fallback |
| **PNG** | Lossless, transparency | 3-5× larger than WebP | Logos, icons, screenshots |
| **SVG** | Infinitely scalable, tiny for simple graphics | Not for photos | Icons, logos, illustrations |

**Decision Matrix:**
```javascript
function chooseFormat(imageType, targetAudience) {
  if (imageType === 'icon' || imageType === 'logo') return 'SVG';
  if (needsTransparency && !isPhoto) return 'PNG';

  if (targetAudience.modernBrowsers > 0.95) {
    return 'AVIF with WebP fallback';
  }
  if (targetAudience.modernBrowsers > 0.85) {
    return 'WebP with JPEG fallback';
  }
  return 'JPEG with progressive encoding';
}
```

**2. Lazy Loading Strategies:**

| Strategy | Loading Behavior | Pros | Cons | Use Case |
|----------|-----------------|------|------|----------|
| **Native `loading="lazy"`** | Browser decides when to load | Simple, no JS, performant | Less control over threshold | General use, blog posts |
| **Intersection Observer** | Custom threshold (e.g., 200px ahead) | Full control, can track visibility | Requires JS, polyfill for old browsers | Image galleries, infinite scroll |
| **On-scroll event** | Load when user scrolls near | Maximum control | Performance issues (many scroll events) | Avoid (legacy approach) |
| **Eager loading** | Load immediately | Faster perceived load for ATF | Wastes bandwidth on unseen images | Hero images, above-fold only |

**Trade-off Example:**
```javascript
// Decision: First 3 images eager, rest lazy
// Rationale: Balance initial LCP vs total page weight

function OptimizedGallery({ images }) {
  return images.map((img, i) => (
    <img
      src={img.src}
      loading={i < 3 ? 'eager' : 'lazy'}
      // Trade-off: 3 eager images = ~600KB vs 50 images = 10MB
      // Result: LCP -2.1s, total load -9.4MB
    />
  ));
}
```

**3. Responsive Images Complexity:**

| Approach | Complexity | Performance | Maintenance | Use When |
|----------|-----------|-------------|-------------|----------|
| **Single size** | Low | Poor (overserving) | Easy | Prototypes, admin dashboards |
| **2-3 breakpoints** | Medium | Good (covers 90% cases) | Moderate | Most production apps |
| **5+ breakpoints** | High | Excellent (optimal for all) | Difficult | Image-heavy (photography, e-commerce) |
| **Art direction** | Very high | Best (different crops) | Very difficult | Hero images, marketing pages |

**Complexity vs Performance:**
```javascript
// Simple (1 size): Maintenance 1/10, Performance 4/10
<img src="image.jpg" alt="Product" />

// Balanced (3 sizes): Maintenance 4/10, Performance 8/10
<img
  srcset="small.webp 480w, medium.webp 800w, large.webp 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
  src="medium.jpg"
  alt="Product"
/>

// Complex (art direction): Maintenance 9/10, Performance 10/10
<picture>
  <source media="(max-width: 600px)" srcset="mobile-crop.webp">
  <source media="(max-width: 900px)" srcset="tablet-crop.webp">
  <img src="desktop-crop.webp" alt="Product" />
</picture>
```

**4. Quality vs File Size:**

```javascript
// Compression quality trade-offs
const qualityImpact = {
  100: { size: '100%', visual: 'Perfect', use: 'Never (wasteful)' },
  85:  { size: '45%',  visual: 'Imperceptible', use: 'Default choice' },
  75:  { size: '35%',  visual: 'Slight softness', use: 'Thumbnails' },
  60:  { size: '25%',  visual: 'Noticeable blur', use: 'Tiny previews' },
};

// Decision: Quality 85 for product images (best balance)
// Saves 55% bandwidth with no visible quality loss in user testing
```

**5. CDN vs Self-hosted:**

| Aspect | CDN (Cloudinary/Imgix) | Self-hosted (Next.js Image) | Hybrid |
|--------|------------------------|----------------------------|--------|
| **Cost** | $$$ ($0.10-0.50/GB) | $ (hosting only) | $$ |
| **Setup** | Easy (plug & play) | Medium (configure build) | Complex |
| **Control** | Limited (vendor lock-in) | Full control | Balanced |
| **Performance** | Excellent (global edge) | Good (single region) | Excellent |
| **Use case** | High traffic, global | Small apps, single region | Large enterprise |

**Recommendation Matrix:**
- **< 10K monthly visitors**: Self-hosted Next.js Image
- **10K-100K visitors**: Hybrid (critical images on CDN)
- **100K+ visitors**: Full CDN solution

</details>

---

<details>
<summary>💬 <strong>Explain to Junior: Image Optimization Made Simple</strong></summary>

**The Restaurant Menu Analogy:**

Imagine a restaurant that sends you the ENTIRE menu (all 500 pages with high-res photos) every time you ask for a drink. That's what unoptimized websites do with images!

**Smart restaurant approach:**
1. **Send just the drinks page** (lazy loading - only load visible images)
2. **Use a small photo for your phone, large photo for a poster** (responsive images)
3. **Use compressed photos instead of originals** (WebP/AVIF formats)
4. **Show a blurred preview while getting the real photo** (blur placeholder)

**Basic Concepts:**

**1. Lazy Loading = "Load Only When Needed"**
```html
<!-- Without lazy loading: Browser loads ALL 50 images immediately -->
<img src="photo1.jpg"> <!-- Downloads now -->
<img src="photo2.jpg"> <!-- Downloads now -->
...
<img src="photo50.jpg"> <!-- Downloads now (waste!) -->

<!-- With lazy loading: Browser loads only visible images -->
<img src="photo1.jpg" loading="lazy"> <!-- Downloads when user scrolls near it -->
```

**Why it matters:** If user only scrolls through 5 images, you saved 45 unnecessary downloads!

**2. Responsive Images = "Right Size for Each Device"**
```html
<!-- Bad: Sending 4K image to phone (4MB download) -->
<img src="huge-4k-photo.jpg">

<!-- Good: Phone gets small version (200KB), Desktop gets large (800KB) -->
<img
  srcset="small.jpg 480w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, 1200px"
  src="large.jpg"
>
```

**Analogy:** Like getting size S shirt for kids, size XL for adults. Perfect fit!

**3. Modern Formats = "Better Compression"**
```html
<!-- JPEG: 1,000 KB -->
<img src="photo.jpg">

<!-- WebP: 700 KB (same quality, 30% smaller!) -->
<img src="photo.webp">

<!-- AVIF: 500 KB (same quality, 50% smaller!) -->
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg"> <!-- Fallback -->
</picture>
```

**Analogy:** Like ZIP files - same content, smaller package!

**Interview Answer Template:**

**Q: "How would you optimize images in a web app?"**

**Answer:**
"I'd use four main strategies:

**First, lazy loading** - Only load images when users scroll near them using `loading='lazy'` attribute. This reduces initial page weight dramatically, especially for image galleries.

**Second, responsive images** - Serve different sizes based on device. Use `srcset` and `sizes` attributes so mobile gets 480px images while desktop gets 1200px versions. This can cut mobile bandwidth by 70%.

**Third, modern formats** - Use WebP or AVIF instead of JPEG. They're 30-50% smaller with same quality. Use `<picture>` element with fallbacks for older browsers.

**Fourth, compression and CDN** - Compress to quality 85 (sweet spot for size vs quality) and serve through a CDN for faster global delivery.

For example, in a React/Next.js app, I'd use the Next.js Image component which handles all this automatically:

```jsx
<Image
  src="/photo.jpg"
  alt="Product"
  width={800}
  height={600}
  quality={85}
  loading="lazy"
/>
```

This approach reduced our e-commerce site's LCP from 8s to 1.8s and cut bounce rate in half."

**Key Metrics to Remember:**
- LCP target: < 2.5 seconds
- Quality sweet spot: 85 (imperceptible loss, 55% size reduction)
- Lazy load all images below the fold
- Use WebP (96% browser support) with JPEG fallback

**Common Mistakes to Avoid:**
1. ❌ Loading all images eagerly
2. ❌ Same image size for mobile and desktop
3. ❌ Using PNG for photos (3× larger than WebP)
4. ❌ Forgetting `alt` text (accessibility + SEO)
5. ❌ Not testing on slow 3G connections

</details>

---

