# Next.js Optimization

> Performance optimization: images, fonts, bundles, and production best practices

---

## Question 1: How Do You Optimize Images in Next.js Using next/image?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Netflix, Amazon, Vercel

### Question
Explain Next.js image optimization using the `next/image` component. How does automatic optimization work? What are the best practices for responsive images, blur placeholders, and optimizing Largest Contentful Paint (LCP)?

### Answer

**Next.js Image Optimization** - Automatic image optimization, lazy loading, modern format conversion (WebP/AVIF), responsive sizing, and blur placeholders to improve Core Web Vitals metrics.

**Key Points:**

1. **Automatic Optimization** - On-demand image optimization, format conversion to WebP/AVIF, quality adjustment, resizing based on device
2. **Lazy Loading** - Images load only when entering viewport, reducing initial bundle size and bandwidth
3. **Responsive Images** - Multiple sizes served based on device viewport using srcSet
4. **Blur Placeholders** - Low-quality image placeholders prevent layout shift and improve perceived performance
5. **Priority Loading** - Critical images (above-the-fold) load immediately to optimize LCP

---

### 🔍 Deep Dive: Image Optimization Pipeline & Browser Rendering

<details>
<summary><strong>🔍 Deep Dive: Image Optimization Pipeline & Browser Rendering</strong></summary>

**Next.js Image Optimization Architecture:**
When you use `<Image src="/hero.jpg" width={800} height={600} />`, Next.js doesn't just serve the original file. Instead, it creates an optimization pipeline that runs entirely on-demand—no build-time processing. Here's the exact flow:

1. **First request:** Browser requests `/_next/image?url=/hero.jpg&w=828&q=75`
2. **Next.js checks cache:** Is this exact size/quality already optimized? If yes, serve from cache (instant). If no, continue.
3. **Sharp library processes image:** Next.js uses Sharp (libvips wrapper) to resize the image to exactly 828px width, convert to WebP (if browser supports it), and compress to quality=75.
4. **Response headers:** Next.js sends `Cache-Control: public, max-age=31536000, immutable` for the optimized image, meaning browsers cache it for 1 year.
5. **Subsequent requests:** Browser serves from cache (0ms latency).

The critical insight: this happens on-demand, not at build time. If you have 10,000 product images, Next.js doesn't optimize all 10,000 during build—it optimizes each one when first requested. This is why Vercel charges for image optimization (compute costs).

**WebP vs AVIF Format Selection:**
Next.js automatically detects browser capabilities via the `Accept: image/avif,image/webp,image/apng,image/*` header. The priority:
1. AVIF (best compression, ~30% smaller than WebP, but slower to encode)
2. WebP (good compression, ~25% smaller than JPEG, fast encoding)
3. Original format (fallback for old browsers)

The trade-off: AVIF encoding takes 5-10x longer than WebP. For most use cases, Next.js defaults to WebP because the encoding speed matters for on-demand optimization. You can force AVIF with `formats={['image/avif', 'image/webp']}`, but expect slower initial loads.

**Responsive Image srcSet Generation:**
When you specify `sizes="(max-width: 768px) 100vw, 50vw"`, Next.js generates multiple image sizes:
```html
<img
  srcset="
    /_next/image?url=/hero.jpg&w=640 640w,
    /_next/image?url=/hero.jpg&w=750 750w,
    /_next/image?url=/hero.jpg&w=828 828w,
    /_next/image?url=/hero.jpg&w=1080 1080w,
    /_next/image?url=/hero.jpg&w=1200 1200w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

The browser chooses the optimal size: if viewport is 375px (iPhone), it downloads the 640w version (not the full 1200w). This saves bandwidth: 50KB instead of 300KB.

**Layout Shift Prevention (CLS Optimization):**
The `width` and `height` props are mandatory for a reason—they let Next.js calculate aspect ratio before the image loads. Without dimensions:
```
Before image loads: div has height=0 (collapsed)
After image loads: div expands to height=600px
Result: Content below shifts down → BAD CLS score
```

With dimensions:
```
Before image loads: div reserves height=600px (aspect ratio known)
After image loads: image fills reserved space
Result: No layout shift → GOOD CLS score (0)
```

The aspect ratio calculation: `padding-bottom = (height / width) * 100%`. For 800x600 image, Next.js applies `padding-bottom: 75%` to maintain space.

**Blur Placeholder Implementation:**
There are three placeholder strategies:

1. **blurDataURL (manual):** You provide a base64-encoded tiny image (20x20 pixels, ~1KB). Next.js embeds this directly in the HTML, so it shows instantly (no network request).

2. **placeholder="blur" (automatic, static imports only):** For local images imported with `import heroImg from './hero.jpg'`, Next.js automatically generates a tiny blur placeholder at build time and embeds it.

3. **placeholder="empty" (default for remote images):** No placeholder—image area is blank until loaded.

The base64 blur technique works because a 20x20 image is ~1KB, small enough to inline in HTML. When blurred with CSS `filter: blur(20px)`, it looks like a full-size blurred version. Once the real image loads, Next.js fades it in.

**Priority Loading for LCP:**
LCP (Largest Contentful Paint) measures when the largest visible element renders. For most websites, this is the hero image. If you lazy-load your hero image:
```
0ms: HTML loads
100ms: JavaScript loads
200ms: Image component mounts
300ms: Image starts downloading (LAZY LOADED)
1200ms: Image finishes → LCP = 1200ms (POOR)
```

With `priority={true}`:
```
0ms: HTML loads, image preload link injected
100ms: Image starts downloading (EAGER)
800ms: Image finishes → LCP = 800ms (GOOD)
```

Next.js adds `<link rel="preload" as="image" href="..." />` to the HTML head, telling the browser to download immediately.

**Image Sizing Algorithm:**
Next.js generates images at these widths: 640, 750, 828, 1080, 1200, 1920, 2048, 3840. Why these specific numbers? They're based on common device widths:
- 640: iPhone SE (375px × 2 DPR)
- 750: iPhone 12/13 (390px × 2 DPR)
- 828: iPhone 14 Pro (414px × 2 DPR)
- 1080: Desktop (1080px × 1 DPR)
- 1920: Full HD monitors
- 3840: 4K monitors

The browser picks the smallest image that's larger than the display width. For a 400px slot on a 2x DPR display (800px physical), the browser downloads the 828w version.

---

### 🐛 Real-World Scenario: E-Commerce Product Gallery Performance Crisis

**Context:** Your e-commerce site has 500 product images per category page. Users complain pages take 8-10 seconds to load, especially on mobile. LCP is 4.5 seconds (POOR), and CLS is 0.35 (POOR).

**Initial Metrics (Before Optimization):**
- Page load time: 8-10 seconds
- Total image size downloaded: 15MB (500 images × 30KB average)
- LCP: 4500ms (hero product image)
- CLS: 0.35 (images load, causing layout shifts)
- Mobile bounce rate: 68% (users leave before page loads)

**The Problem You Hit:**

You're using plain `<img>` tags:
```jsx
{products.map(product => (
  <img src={product.imageUrl} alt={product.name} />
))}
```

Issues discovered:
1. All 500 images start downloading immediately (no lazy loading)
2. Images are 3000×3000px (6MB each), but displayed at 300×300px
3. Images are PNG/JPEG (no modern formats)
4. No dimensions specified → massive CLS as images load
5. Hero image lazy loads (it's just another image in the list)

**Root Cause Analysis:**
- Browser downloads all images simultaneously → network congestion
- Massive bandwidth waste (downloading 3000px for 300px display)
- No lazy loading → 15MB downloaded even if user only sees 10 products
- No blur placeholders → white boxes flash before images load
- Hero image not prioritized → competes with 499 other images

**Solution Implementation:**

1. **Replace with next/image and add lazy loading:**
```tsx
// Before: ❌ All images load immediately
{products.map(product => (
  <img src={product.imageUrl} alt={product.name} />
))}

// After: ✅ Lazy load images, auto-optimize
{products.map((product, index) => (
  <Image
    src={product.imageUrl}
    alt={product.name}
    width={300}
    height={300}
    sizes="(max-width: 768px) 50vw, 300px"
    loading={index < 4 ? 'eager' : 'lazy'} // First 4 eager, rest lazy
    placeholder="blur"
    blurDataURL={product.blurDataUrl} // Generated server-side
  />
))}
```

2. **Generate blur placeholders server-side:**
```typescript
// lib/generate-blur.ts
import { getPlaiceholder } from 'plaiceholder';

export async function getProductsWithBlur(products) {
  return Promise.all(
    products.map(async (product) => {
      const { base64 } = await getPlaiceholder(product.imageUrl);
      return {
        ...product,
        blurDataUrl: base64, // Tiny base64 image
      };
    })
  );
}

// app/products/page.tsx
export default async function ProductsPage() {
  const products = await getProducts();
  const productsWithBlur = await getProductsWithBlur(products);

  return <ProductGrid products={productsWithBlur} />;
}
```

3. **Prioritize hero image:**
```tsx
// Hero product (above-the-fold)
<Image
  src={heroProduct.imageUrl}
  alt={heroProduct.name}
  width={800}
  height={600}
  priority={true} // ✅ Preload, don't lazy load
  placeholder="blur"
  blurDataURL={heroProduct.blurDataUrl}
/>
```

4. **Configure next.config.js for external images:**
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.shopify.com', 's3.amazonaws.com'],
    formats: ['image/avif', 'image/webp'], // Enable modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // Cache for 1 year
  },
};
```

5. **Add responsive sizing:**
```tsx
<Image
  src={product.imageUrl}
  alt={product.name}
  width={300}
  height={300}
  sizes="
    (max-width: 640px) 50vw,
    (max-width: 1024px) 33vw,
    300px
  "
  // Mobile: 50% of viewport, Tablet: 33% of viewport, Desktop: 300px fixed
/>
```

**Metrics After Implementation:**
- Page load time: 2.1 seconds (75% improvement)
- Total image size downloaded (initial): 800KB (15MB → 800KB, 95% reduction)
- LCP: 1.2 seconds (4.5s → 1.2s, 73% improvement)
- CLS: 0.02 (0.35 → 0.02, 94% improvement)
- Mobile bounce rate: 22% (68% → 22%, 67% reduction)

**Bandwidth Savings Breakdown:**
- Original: 500 images × 6MB = 3000MB (before compression)
- With lazy loading: Only 10 visible images × 30KB = 300KB
- With WebP: 300KB × 0.7 (30% smaller) = 210KB
- With proper sizing: 210KB × 0.5 (half the pixels) = 105KB
- **Total: 3000MB → 105KB initial load (28,571x reduction)**

**Key Techniques That Worked:**
1. Lazy loading reduced initial bandwidth by 98%
2. WebP conversion saved 30% on each image
3. Proper sizing (300px vs 3000px) saved 90% bandwidth
4. Blur placeholders eliminated CLS
5. Priority on hero image improved LCP by 73%

**Lesson Learned:** The combination of lazy loading + modern formats + proper sizing is exponentially more powerful than any single optimization. Each multiplies the previous savings.

</details>

---

### ⚖️ Trade-offs: Image Optimization Strategies

<details>
<summary><strong>⚖️ Trade-offs: Image Optimization Strategies</strong></summary>

**next/image vs Plain <img> Tag:**

| Factor | next/image | Plain <img> |
|--------|-----------|-------------|
| **Setup Complexity** | Requires Next.js config | Works everywhere |
| **Automatic Optimization** | ✅ Auto WebP/AVIF conversion | ❌ Manual conversion needed |
| **Lazy Loading** | ✅ Built-in | ❌ Manual `loading="lazy"` |
| **Responsive Images** | ✅ Auto srcSet generation | ❌ Manual srcSet |
| **Layout Shift (CLS)** | ✅ Prevented (requires width/height) | ❌ Common issue |
| **Performance** | Excellent (optimized sizes) | Poor (full-size images) |
| **Bundle Size** | +30KB (Image component JS) | 0KB |
| **Browser Support** | All modern browsers | All browsers |

**When to use next/image:**
- E-commerce product images (need optimization)
- Blog hero images (LCP critical)
- User-uploaded content (unknown sizes)
- High-traffic pages (bandwidth costs matter)

**When to use plain <img>:**
- Tiny icons (<5KB, not worth optimization overhead)
- SVG images (don't need raster optimization)
- Base64 embedded images (already inlined)

**Blur Placeholder vs Empty Placeholder:**

**Blur placeholder:**
- Pro: Better perceived performance (users see something immediately)
- Pro: Eliminates layout shift
- Con: +1KB per image (base64 inline)
- Con: Build time increases (must generate placeholders)

**Empty placeholder:**
- Pro: No extra bytes
- Pro: No build time overhead
- Con: White boxes flash before images load (poor UX)
- Con: Potential layout shift if dimensions missing

**Decision:** Use blur for critical images (hero, above-fold), empty for below-fold.

**Priority Loading vs Lazy Loading:**

**priority={true} (eager):**
- Use for: Hero images, LCP elements, above-the-fold content
- Effect: Image preloaded in <head>, downloads immediately
- Trade-off: Competes with other critical resources (CSS, JS)

**loading="lazy" (default):**
- Use for: Below-fold images, galleries, thumbnails
- Effect: Image only downloads when 1000px from viewport
- Trade-off: Slight delay when scrolling fast

**Decision:** Priority for top 1-3 images, lazy for everything else.

**Local vs Remote Image Optimization:**

**Local images (import):**
- Pro: Automatic blur placeholder generation
- Pro: Build-time optimization possible
- Con: Increases build time
- Con: All images in git repo (bloat)

**Remote images (CDN URL):**
- Pro: No build time impact
- Pro: Easier content management
- Con: Must manually generate blur placeholders
- Con: Requires domain whitelist in next.config.js

**Image Format Priority:**

```
AVIF: 30% smaller than WebP, but 5-10x slower encoding
WebP: 25% smaller than JPEG, fast encoding
JPEG: Universal support, no encoding overhead
```

**Recommendation:**
- Production: WebP (best balance)
- High-end photography sites: AVIF (worth the encoding cost)
- Legacy browser support: JPEG fallback

**On-Demand vs Build-Time Optimization:**

**On-demand (Next.js default):**
- Pro: No build time impact (scales to millions of images)
- Pro: Only optimizes images that are actually viewed
- Con: First request is slow (300-500ms encoding)
- Con: Compute costs on Vercel ($0.40 per 1000 optimizations)

**Build-time (custom solution):**
- Pro: First request is instant (pre-optimized)
- Pro: No ongoing compute costs
- Con: Build time scales linearly (10,000 images = 30min build)
- Con: Can't handle user-uploaded content

**Decision:** Use on-demand for dynamic content, build-time for static marketing sites.

</details>

---

### 💬 Explain to Junior: Image Optimization Interview Answers

<details>
<summary><strong>💬 Explain to Junior: Image Optimization Interview Answers</strong></summary>

**1. Why can't you just use <img> tags in Next.js?**

**Analogy:** Using plain <img> is like serving a pizza the size of a dining table when someone ordered a personal pizza. Next.js Image is like a smart kitchen that automatically resizes the pizza to match the order.

**Interview Answer Template:**
"You CAN use plain <img> tags, but you lose massive performance benefits. Next.js Image component automatically: (1) converts images to modern formats like WebP (30% smaller), (2) resizes images to match the user's screen (don't send 3000px to a 300px display), (3) lazy loads images so they only download when visible, (4) prevents layout shift by reserving space. Without these, you're sending 10x more data than needed, hurting load times and Core Web Vitals. The trade-off is Next.js Image requires width/height props and adds ~30KB to your bundle, but for any non-trivial site, the bandwidth savings massively outweigh this cost."

**2. What's the difference between priority and lazy loading?**

**Analogy:** Priority loading is like calling ahead to a restaurant so your order is ready when you arrive. Lazy loading is like ordering when you get there.

**Interview Answer Template:**
"By default, Next.js lazy loads all images—they only download when the user scrolls within ~1000px of the image. This saves bandwidth, but if your hero image is lazy loaded, it won't start downloading until JavaScript loads and mounts the component. This delays LCP (Largest Contentful Paint). The `priority` prop tells Next.js to add a preload link in the HTML head, so the browser downloads the image immediately, even before JavaScript executes. Use `priority` for your above-the-fold images (hero, main product image), and lazy load everything else. If you priority-load 50 images, you've defeated the purpose—only priority-load the critical 1-3 images."

**3. What are blur placeholders and how do they work?**

**Analogy:** A blur placeholder is like showing a pixelated preview of a movie trailer while the full HD version loads. You see something immediately instead of a blank screen.

**Interview Answer Template:**
"A blur placeholder is a tiny (20×20 pixel), heavily compressed version of the image that's embedded directly in the HTML as base64. It's only ~1KB, so it shows instantly. When blurred with CSS, it looks like a blurred version of the full image. This improves perceived performance—users see something immediately instead of blank white boxes. It also prevents layout shift because the placeholder reserves the correct aspect ratio. For local images (imported), Next.js generates blur placeholders automatically at build time. For remote images (CDN URLs), you must generate them yourself using libraries like Plaiceholder. The trade-off: each placeholder adds ~1KB to your HTML, so only use it for important images."

**4. How does Next.js know what size image to serve?**

**Interview Answer Template:**
"Next.js uses the `sizes` prop combined with the browser's viewport to determine which image size to download. The `sizes` prop is a media query that tells the browser: 'On mobile (<768px), this image takes 100% of viewport width. On desktop, it takes 50%.' Based on this and the user's screen width, the browser picks the optimal size from the srcSet. For example, if I'm on a 375px iPhone and `sizes="100vw"`, the browser needs a 375px image. But my iPhone has 2× pixel density, so it actually needs 750px. Next.js generated images at 640w, 750w, 828w, etc., so the browser picks 750w. This ensures you never download a 3000px image when you only need 750px."

**5. What's LCP and how do images affect it?**

**Analogy:** LCP is like measuring how long it takes for the main actor to appear on stage. If the hero image is the main actor and it takes 5 seconds to load, the audience is staring at an empty stage.

**Interview Answer Template:**
"LCP (Largest Contentful Paint) measures when the largest visible element renders. For most websites, this is the hero image. If your LCP is slow (>2.5 seconds), Google considers your page slow, which hurts SEO rankings. Images affect LCP in several ways: (1) If you lazy load your hero image, it won't start downloading until JavaScript mounts, delaying LCP by hundreds of milliseconds. Use `priority` to preload critical images. (2) If you serve massive images (3MB hero image), LCP is delayed while the image downloads. Optimize with next/image to serve WebP at the right size. (3) Layout shifts hurt LCP—if the image area isn't reserved (no width/height), the browser repaints when the image loads, delaying LCP. Always specify dimensions."

**6. How do you handle images from external CDNs?**

**Interview Answer Template:**
"Next.js requires you to whitelist external image domains in `next.config.js` for security—this prevents someone from using your site to optimize random images from the internet (costing you money). You add the CDN domain to the `images.domains` array. For example, if you're pulling product images from Shopify's CDN, you'd add `'cdn.shopify.com'`. Next.js then proxies these images through `/_next/image?url=...` and optimizes them on-the-fly. The trade-off: the first request is slow (100-300ms to optimize), but subsequent requests are cached. For remote images, blur placeholders aren't automatic—you must generate them yourself, usually server-side at build time or when fetching data."

**Interview Answer Checklist:**
✅ Explain automatic format conversion (WebP/AVIF)
✅ Understand lazy loading vs priority loading
✅ Know how to prevent layout shift (width/height)
✅ Explain blur placeholders and when to use them
✅ Understand responsive images (sizes, srcSet)
✅ Know LCP optimization (priority, proper sizing)
✅ Handle external images (domains whitelist)

</details>

---

### Code Example

```tsx
// ==========================================
// 1. BASIC IMAGE USAGE
// ==========================================

import Image from 'next/image';

// Local image (automatic optimization + blur placeholder)
import heroImg from '@/public/hero.jpg';

export default function HomePage() {
  return (
    <div>
      {/* ✅ Local image with auto blur */}
      <Image
        src={heroImg}
        alt="Hero"
        placeholder="blur" // Automatic blur placeholder
        priority // LCP optimization
      />

      {/* ✅ Remote image with manual blur */}
      <Image
        src="https://example.com/product.jpg"
        alt="Product"
        width={800}
        height={600}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Manual
      />
    </div>
  );
}

// ==========================================
// 2. RESPONSIVE IMAGES
// ==========================================

export function ProductCard({ product }) {
  return (
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={400}
      height={400}
      sizes="
        (max-width: 640px) 100vw,
        (max-width: 1024px) 50vw,
        400px
      "
      // Mobile: full width, Tablet: half width, Desktop: 400px fixed
    />
  );
}

// ==========================================
// 3. PRIORITY VS LAZY LOADING
// ==========================================

export function HeroSection({ products }) {
  return (
    <div>
      {/* Above-the-fold hero: priority load */}
      <Image
        src={products[0].imageUrl}
        alt={products[0].name}
        width={1200}
        height={600}
        priority={true} // ✅ Preload immediately
        placeholder="blur"
        blurDataURL={products[0].blurDataUrl}
      />

      {/* Below-fold products: lazy load */}
      <div className="product-grid">
        {products.slice(1).map((product) => (
          <Image
            key={product.id}
            src={product.imageUrl}
            alt={product.name}
            width={300}
            height={300}
            loading="lazy" // Default behavior (can omit)
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. GENERATING BLUR PLACEHOLDERS
// ==========================================

import { getPlaiceholder } from 'plaiceholder';

export async function getServerSideProps() {
  const products = await fetchProducts();

  // Generate blur placeholders for all products
  const productsWithBlur = await Promise.all(
    products.map(async (product) => {
      const { base64, img } = await getPlaiceholder(product.imageUrl, {
        size: 10, // 10x10 pixel placeholder
      });

      return {
        ...product,
        blurDataUrl: base64,
        img, // Optional: contains width, height
      };
    })
  );

  return {
    props: {
      products: productsWithBlur,
    },
  };
}

// ==========================================
// 5. FILL MODE (BACKGROUND IMAGES)
// ==========================================

export function ProductHero({ backgroundImage }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <Image
        src={backgroundImage}
        alt="Background"
        fill // Replaces layout="fill"
        style={{ objectFit: 'cover' }} // CSS object-fit
        priority
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1>Product Title</h1>
      </div>
    </div>
  );
}

// ==========================================
// 6. NEXT.CONFIG.JS CONFIGURATION
// ==========================================

// next.config.js
module.exports = {
  images: {
    // Allowed external image domains
    domains: [
      'cdn.shopify.com',
      's3.amazonaws.com',
      'images.unsplash.com',
    ],

    // Or use remotePatterns (more flexible)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/images/**',
      },
    ],

    // Image formats (in order of preference)
    formats: ['image/avif', 'image/webp'],

    // Device breakpoints for srcSet
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Icon sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,

    // Disable image optimization (not recommended)
    unoptimized: false,
  },
};

// ==========================================
// 7. PROGRESSIVE LOADING PATTERN
// ==========================================

'use client';

import { useState } from 'react';
import Image from 'next/image';

export function ProgressiveImage({ src, alt, blurDataURL }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoadingComplete={() => setIsLoading(false)}
        className={`
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. IMAGE GALLERY WITH LAZY LOADING
// ==========================================

export function ImageGallery({ images }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image, index) => (
        <Image
          key={image.id}
          src={image.url}
          alt={image.alt}
          width={400}
          height={300}
          loading={index < 6 ? 'eager' : 'lazy'}
          // Load first 6 images eagerly (above fold),
          // rest lazy load
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ))}
    </div>
  );
}

// ==========================================
// 9. ART DIRECTION (DIFFERENT IMAGES PER BREAKPOINT)
// ==========================================

export function ArtDirectedImage() {
  return (
    <picture>
      <source
        media="(max-width: 768px)"
        srcSet="/_next/image?url=/mobile-hero.jpg&w=828&q=75"
      />
      <source
        media="(min-width: 769px)"
        srcSet="/_next/image?url=/desktop-hero.jpg&w=1920&q=75"
      />
      <Image
        src="/desktop-hero.jpg"
        alt="Hero"
        width={1920}
        height={1080}
        priority
      />
    </picture>
  );
}

// ==========================================
// 10. CUSTOM LOADER (CDN INTEGRATION)
// ==========================================

// Custom loader for Cloudinary
const cloudinaryLoader = ({ src, width, quality }) => {
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
  return `https://res.cloudinary.com/demo/image/upload/${params.join(',')}${src}`;
};

export function CloudinaryImage() {
  return (
    <Image
      loader={cloudinaryLoader}
      src="/sample.jpg"
      alt="Cloudinary"
      width={800}
      height={600}
    />
  );
}

// ==========================================
// 11. BATCH BLUR PLACEHOLDER GENERATION
// ==========================================

// scripts/generate-blur-placeholders.js
import { getPlaiceholder } from 'plaiceholder';
import fs from 'fs/promises';

async function generateBlurPlaceholders() {
  const images = [
    '/images/hero1.jpg',
    '/images/hero2.jpg',
    '/images/hero3.jpg',
  ];

  const placeholders = {};

  for (const imagePath of images) {
    const { base64 } = await getPlaiceholder(`./public${imagePath}`);
    placeholders[imagePath] = base64;
  }

  await fs.writeFile(
    './lib/blur-placeholders.json',
    JSON.stringify(placeholders, null, 2)
  );

  console.log('✅ Generated blur placeholders');
}

generateBlurPlaceholders();

// Usage
import blurPlaceholders from '@/lib/blur-placeholders.json';

export function ImageWithStaticBlur() {
  return (
    <Image
      src="/images/hero1.jpg"
      alt="Hero"
      width={1200}
      height={600}
      placeholder="blur"
      blurDataURL={blurPlaceholders['/images/hero1.jpg']}
    />
  );
}
```

### Common Mistakes

- ❌ **Not specifying width/height** - Causes layout shift (CLS), hurts Core Web Vitals
- ❌ **Priority loading all images** - Defeats the purpose, slows down critical resources
- ❌ **Using fill without container dimensions** - Image won't display correctly
- ❌ **Forgetting to whitelist external domains** - Images from CDN won't load
- ✅ **Always specify dimensions** - Prevents layout shift, reserves space
- ✅ **Use priority for hero images only** - First 1-3 images, lazy load rest
- ✅ **Generate blur placeholders** - Improves perceived performance
- ✅ **Use responsive sizes** - Serve appropriate image size per device

### Follow-up Questions

1. **What's the difference between width/height props and fill mode?** Width/height specify exact dimensions (aspect ratio preserved). Fill mode makes image fill parent container (requires parent with position: relative and defined dimensions).

2. **How does Next.js handle retina displays?** Next.js automatically generates 2x versions of images. Browser's device pixel ratio determines which to download (828w for iPhone = 414px × 2 DPR).

3. **Can you use next/image with SVG?** Yes, but optimization is skipped (SVG is vector format). For icons, consider using plain <img> or inline SVG instead.

### Resources
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [next/image API Reference](https://nextjs.org/docs/app/api-reference/components/image)
- [Plaiceholder (blur generation)](https://plaiceholder.co/)
- [Core Web Vitals](https://web.dev/vitals/)

---

## Question 2: How Do You Optimize Fonts and Scripts in Next.js?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Google, Meta, Vercel, Shopify, Stripe

### Question
Explain Next.js font optimization using `next/font` and script optimization using `next/script`. How do you prevent FOUT (Flash of Unstyled Text), optimize third-party scripts, and improve FCP (First Contentful Paint)?

### Answer

**Font and Script Optimization** - Automatic font subsetting, self-hosting Google Fonts, zero layout shift, third-party script loading strategies (defer, lazy, worker), and performance monitoring.

**Key Points:**

1. **next/font Automatic Optimization** - Self-hosts Google Fonts, font subsetting, zero layout shift, preload critical fonts
2. **FOUT/FOIT Prevention** - Font display strategies (swap, optional, fallback), size-adjust for fallback fonts
3. **Script Loading Strategies** - beforeInteractive, afterInteractive, lazyOnload, worker (Web Worker isolation)
4. **Third-Party Scripts** - Google Analytics, Facebook Pixel, Stripe, Intercom optimization patterns
5. **Performance Metrics** - FCP improvement, CLS prevention, blocking time reduction

---

### 🔍 Deep Dive: Font Loading Pipeline & Browser Rendering Internals

<details>
<summary><strong>🔍 Deep Dive: Font Loading Pipeline & Browser Rendering Internals</strong></summary>

**next/font Architecture (Google Fonts Self-Hosting):**
When you use `import { Inter } from 'next/font/google'`, Next.js doesn't just add a link to Google Fonts' CDN. Instead, at build time, it downloads the font files, hosts them locally, and generates optimized CSS. Here's the exact flow:

1. **Build time:** Next.js downloads `Inter-Regular.woff2` from Google Fonts' servers
2. **Font subsetting:** Next.js analyzes which characters your app actually uses (latin, latin-ext, cyrillic, etc.) and generates subset font files
3. **Self-hosting:** Font files are placed in `.next/static/media/` with cache-busting hashes
4. **CSS generation:** Next.js generates `@font-face` CSS with preload hints and size-adjust
5. **Runtime:** Browser downloads fonts from your domain (no third-party request), with immutable caching

The critical advantage: Google Fonts requires a DNS lookup to fonts.googleapis.com + fonts.gstatic.com (two separate domains). This adds 100-300ms latency. Self-hosting eliminates this—fonts come from the same origin as your HTML.

**Font Subsetting Deep Dive:**
The full `Inter` font family includes ~1500 glyphs (characters) covering 100+ languages. The file size: ~400KB. But if your site only uses English text, you only need ~200 glyphs. Next.js automatically creates a subset:

```
Full Inter font: 400KB (1500 glyphs)
Latin subset: 120KB (200 glyphs)
Latin-extended subset: 180KB (400 glyphs)
```

You specify the subset in `next/font`:
```typescript
const inter = Inter({
  subsets: ['latin'], // Download only latin characters
  weight: ['400', '700'], // Only regular and bold
});
```

This reduces font size by 70% (400KB → 120KB). The trade-off: if a user enters non-latin text (e.g., ñ in "español"), the character won't render (shows fallback font or ☐).

**FOUT vs FOIT (Flash of Unstyled Text vs Flash of Invisible Text):**

When a browser encounters a custom font:
1. **FOUT (font-display: swap):** Browser immediately shows text in fallback font (Arial), then swaps to custom font when loaded. Effect: text flashes from Arial → Inter.
2. **FOIT (font-display: block):** Browser hides text until custom font loads. Effect: blank text for 1-3 seconds, then Inter appears.
3. **font-display: optional:** Browser shows fallback font immediately. Custom font only applies if it loads within 100ms, otherwise fallback remains for the entire page load.

The Next.js default is `swap`—this is optimal for performance because users see text immediately (no blank content), and the flash is brief.

**Size-Adjust for Zero Layout Shift:**
Different fonts have different character widths. Arial's "Hello" is 50px wide, but Inter's "Hello" might be 48px wide. When the font swaps (FOUT), text reflows, causing CLS (layout shift).

Next.js solves this with `size-adjust`:
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2');
  size-adjust: 104%; /* Make Inter match Arial's width */
}
```

Now Arial's "Hello" (50px) and Inter's "Hello" (48px × 1.04 = 50px) are the same width. No reflow, no CLS.

**Preload vs Prefetch:**
Next.js automatically adds:
```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
```

This tells the browser: "This font is critical, download immediately." Without preload, the browser discovers fonts only after parsing CSS, delaying text rendering by 200-500ms.

**Script Loading Strategies (beforeInteractive, afterInteractive, lazyOnload):**

1. **beforeInteractive:** Script loads BEFORE page becomes interactive. Use for: critical polyfills, A/B testing (must run before first render).
   ```
   0ms: HTML loads
   100ms: beforeInteractive script downloads
   200ms: beforeInteractive script executes
   300ms: React hydrates (page interactive)
   ```

2. **afterInteractive (default):** Script loads AFTER page becomes interactive. Use for: analytics, chat widgets, non-critical third-party code.
   ```
   0ms: HTML loads
   100ms: React hydrates (page interactive)
   200ms: afterInteractive script downloads
   300ms: afterInteractive script executes
   ```

3. **lazyOnload:** Script loads during browser idle time (when CPU is free). Use for: non-critical widgets, social media embeds.
   ```
   0ms: HTML loads
   100ms: React hydrates (page interactive)
   200ms: User starts scrolling (browser busy)
   1000ms: Browser idle → lazyOnload script downloads
   ```

The key difference: `beforeInteractive` blocks interactivity (use sparingly), `afterInteractive` doesn't block, `lazyOnload` waits for idle time.

**Web Worker Script Loading (strategy="worker"):**
Next.js 13+ supports Partytown integration via `strategy="worker"`. This runs third-party scripts in a Web Worker, isolating them from the main thread.

Why this matters: Google Analytics runs on the main thread, competing with your React code for CPU time. If GA takes 50ms to execute, that's 50ms users can't interact with your page (blocking time). With Web Workers:
```
Main thread: React rendering (0ms blocked)
Web Worker thread: Google Analytics (isolated, no blocking)
```

The trade-off: Web Workers can't access the DOM directly. Partytown uses a proxy to forward DOM access requests to the main thread. This adds latency (10-30ms per DOM access), making worker scripts slightly slower, but they don't block the main thread.

**Third-Party Script Performance Impact:**
Google Tag Manager, Facebook Pixel, and similar scripts are notoriously slow. Example metrics:

```
Without GTM: FCP = 1.2s, TTI = 2.5s, TBT = 100ms
With GTM (default): FCP = 1.8s (+50%), TTI = 4.2s (+68%), TBT = 450ms (+350%)
With GTM (afterInteractive): FCP = 1.2s, TTI = 3.0s (+20%), TBT = 200ms (+100%)
With GTM (lazyOnload): FCP = 1.2s, TTI = 2.6s (+4%), TBT = 120ms (+20%)
```

The lesson: **never** load third-party scripts synchronously (inline <script> tag). Always use `next/script` with `afterInteractive` or `lazyOnload`.

**Font Loading Performance Metrics:**

FCP (First Contentful Paint): When text first appears. Slow fonts delay FCP.
```
Font preloaded: FCP = 1.0s
Font not preloaded: FCP = 1.5s (+50%)
```

CLS (Cumulative Layout Shift): Font swap causes layout shift if widths differ.
```
Without size-adjust: CLS = 0.15 (poor)
With size-adjust: CLS = 0.02 (good)
```

**Variable Fonts Optimization:**
Instead of loading separate files for each weight:
```
Inter-Regular.woff2: 120KB
Inter-Bold.woff2: 125KB
Total: 245KB
```

Use a variable font:
```
Inter-Variable.woff2: 180KB (includes all weights 100-900)
Savings: 245KB → 180KB (27% reduction)
```

Next.js supports variable fonts:
```typescript
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // CSS variable
  weight: ['400', '700'], // Not needed for variable fonts
});
```

</details>

---

### 🐛 Real-World Scenario: SaaS Dashboard Font/Script Performance Crisis

<details>
<summary><strong>🐛 Real-World Scenario: SaaS Dashboard Font/Script Performance Crisis</strong></summary>

**Context:** Your SaaS dashboard uses custom fonts (Inter) and multiple third-party scripts (Google Analytics, Intercom chat, Stripe). Users complain the page feels slow and "janky."

**Initial Metrics (Before Optimization):**
- FCP (First Contentful Paint): 2.8 seconds
- LCP (Largest Contentful Paint): 3.5 seconds
- CLS (Cumulative Layout Shift): 0.28 (poor)
- TBT (Total Blocking Time): 680ms (poor)
- Third-party script count: 7 scripts (GA, GTM, Intercom, Stripe, Hotjar, Facebook Pixel, Segment)

**The Problem You Hit:**

1. **Fonts loading slowly:**
   - Using Google Fonts CDN link: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap">`
   - DNS lookup to fonts.googleapis.com: +150ms
   - Download CSS: +50ms
   - Discover font URLs in CSS: +100ms
   - Download fonts: +200ms
   - **Total delay: 500ms before text renders**

2. **FOUT causing layout shift:**
   - Browser shows Arial initially (50px width)
   - Inter loads (48px width)
   - All text reflows → CLS = 0.28

3. **Third-party scripts blocking main thread:**
   - All scripts loaded with `<script src="...">` (blocking)
   - Google Tag Manager: 300ms execution time (blocks rendering)
   - Intercom chat widget: 200ms execution time
   - Total blocking time: 680ms

4. **Race condition with Intercom:**
   - Intercom script loads before React hydration
   - Tries to mount chat widget, but DOM isn't ready
   - Throws error, re-initializes after hydration (double initialization)

**Root Cause Analysis:**
- Google Fonts CDN adds unnecessary network hops
- No font preloading → browser discovers fonts late
- No size-adjust → font swap causes layout shift
- Third-party scripts loaded synchronously → block rendering
- No script loading strategy → everything loads eagerly

**Solution Implementation:**

1. **Replace Google Fonts CDN with next/font:**
```typescript
// Before: ❌ Google Fonts CDN
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />

// After: ✅ next/font self-hosting
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  variable: '--font-inter',
  preload: true,
  adjustFontFallback: true, // Automatic size-adjust
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

2. **Optimize third-party scripts:**
```tsx
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Critical: Load before page interactive */}
        <Script
          id="gtm"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-XXXXX');
            `,
          }}
        />
      </head>
      <body>
        {children}

        {/* Analytics: Load after page interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA-XXXXX"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA-XXXXX');
          `}
        </Script>

        {/* Chat widget: Load during idle time */}
        <Script
          src="https://widget.intercom.io/widget/APP_ID"
          strategy="lazyOnload"
          onLoad={() => {
            console.log('Intercom loaded');
            window.Intercom('boot', { app_id: 'APP_ID' });
          }}
        />

        {/* Facebook Pixel: Lazy load */}
        <Script
          id="fb-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){...}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', 'PIXEL_ID');
              fbq('track', 'PageView');
            `,
          }}
        />
      </body>
    </html>
  );
}
```

3. **Add font fallback optimization:**
```css
/* globals.css */
:root {
  --font-inter: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  font-family: var(--font-inter);
}

/* Manual size-adjust (if not using adjustFontFallback) */
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  size-adjust: 104%; /* Match Inter's metrics */
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
```

4. **Defer non-critical Stripe:**
```tsx
// app/checkout/page.tsx
'use client';

import Script from 'next/script';
import { useState } from 'react';

export default function CheckoutPage() {
  const [stripeLoaded, setStripeLoaded] = useState(false);

  return (
    <div>
      {/* Only load Stripe when user visits checkout */}
      <Script
        src="https://js.stripe.com/v3/"
        strategy="lazyOnload"
        onLoad={() => setStripeLoaded(true)}
      />

      {stripeLoaded ? (
        <StripeCheckoutForm />
      ) : (
        <div>Loading payment form...</div>
      )}
    </div>
  );
}
```

**Metrics After Implementation:**
- FCP: 1.1 seconds (2.8s → 1.1s, 61% improvement)
- LCP: 1.8 seconds (3.5s → 1.8s, 49% improvement)
- CLS: 0.03 (0.28 → 0.03, 89% improvement)
- TBT: 180ms (680ms → 180ms, 74% improvement)
- Font load time: 150ms (500ms → 150ms, 70% improvement)

**Breakdown of Improvements:**

1. **next/font self-hosting:**
   - Eliminated 150ms DNS lookup (fonts.googleapis.com)
   - Fonts preloaded in <head> → 200ms earlier discovery
   - Same-origin download → better caching

2. **Size-adjust (automatic):**
   - Prevented font swap layout shift
   - CLS improved from 0.28 → 0.03

3. **Script optimization:**
   - GTM: beforeInteractive (necessary for tracking)
   - GA: afterInteractive (doesn't block interactivity)
   - Intercom: lazyOnload (loads during idle, no blocking)
   - Stripe: lazyOnload + conditional (only on checkout page)
   - **Result: TBT reduced from 680ms → 180ms**

4. **Performance budget:**
   - Removed Hotjar, Segment, Facebook Pixel (not critical)
   - 7 scripts → 3 scripts
   - Page load reduced by 1.2 seconds

**Key Lesson:** Third-party scripts are the #1 cause of slow sites. Audit aggressively, load lazily, and consider removing non-essential scripts.

</details>

---

### ⚖️ Trade-offs: Font and Script Optimization Strategies

<details>
<summary><strong>⚖️ Trade-offs: Font and Script Optimization Strategies</strong></summary>

**next/font vs Google Fonts CDN:**

| Factor | next/font (Self-Hosted) | Google Fonts CDN |
|--------|------------------------|------------------|
| **Setup** | `import { Inter } from 'next/font/google'` | `<link href="fonts.googleapis.com">` |
| **DNS Lookup** | None (same origin) | +100-200ms (third-party) |
| **Caching** | 1 year immutable | Varies (Google controls) |
| **Font Subsetting** | Automatic | Manual (URL params) |
| **Layout Shift** | Prevented (size-adjust) | Common (no size-adjust) |
| **Privacy** | No third-party requests | Google tracks users |
| **Build Time** | +5-10 seconds (downloads fonts) | 0 seconds |
| **GDPR** | Compliant (no third-party) | May require consent |

**When to use next/font:**
- Production apps (performance matters)
- Privacy-conscious apps (GDPR compliance)
- Custom font families (not just Google Fonts)

**When to use CDN:**
- Prototypes (speed over optimization)
- Already using Google Fonts elsewhere (shared cache)

**font-display Strategies:**

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| **swap** | Show fallback immediately, swap when loaded | Best for most sites (default) |
| **optional** | Show fallback, only use custom font if loads <100ms | Performance-critical (news sites) |
| **block** | Hide text until font loads (max 3s) | Branding-critical (logos) |
| **fallback** | Show fallback, swap within 3s, or keep fallback | Compromise between swap/optional |

**Recommendation:** Use `swap` (default) for optimal balance.

**Script Loading Strategy Decision Tree:**

**beforeInteractive:**
- Use for: A/B testing (must run before first render), critical polyfills
- Trade-off: Blocks page interactivity (use sparingly)

**afterInteractive (default):**
- Use for: Analytics, error tracking, non-critical widgets
- Trade-off: Competes with React hydration (minor delay)

**lazyOnload:**
- Use for: Chat widgets, social media embeds, non-critical tracking
- Trade-off: May load too late (user leaves before chat widget appears)

**worker (Partytown):**
- Use for: Heavy third-party scripts (GTM, GA, Facebook Pixel)
- Trade-off: Setup complexity, slight latency for DOM access

**Inline Script vs External Script:**

**Inline:**
```html
<script>gtag('config', 'GA-XXX');</script>
```
- Pro: No network request, executes immediately
- Con: Can't be cached (increases HTML size)

**External:**
```html
<script src="/gtag.js"></script>
```
- Pro: Cached across pages (faster subsequent loads)
- Con: Extra network request (first load slower)

**Decision:** Inline if <5KB and critical, external otherwise.

**Variable Font vs Multiple Weights:**

**Multiple weights:**
```
Regular (400): 120KB
Bold (700): 125KB
Total: 245KB
```

**Variable font:**
```
Variable (100-900): 180KB
```

**Decision:** Use variable font if you need 3+ weights.

</details>

---

### 💬 Explain to Junior: Font and Script Optimization Interview Answers

<details>
<summary><strong>💬 Explain to Junior: Font and Script Optimization Interview Answers</strong></summary>

**1. What's next/font and why should you use it?**

**Analogy:** Imagine ordering pizza from a restaurant across town (Google Fonts CDN) vs having a pizza oven in your house (next/font). The across-town order requires: (1) finding the restaurant's address (DNS lookup), (2) driving there (network latency), (3) waiting for them to make it. Your own oven: instant, no travel time.

**Interview Answer Template:**
"next/font is Next.js's built-in font optimization system. Instead of linking to Google Fonts' CDN, next/font downloads the fonts at build time and self-hosts them. This eliminates the DNS lookup to fonts.googleapis.com (saves 100-200ms), enables better caching (fonts are immutable for 1 year), and automatically generates font subsets (latin only vs full character set, saving 70% file size). It also prevents layout shift by automatically adding size-adjust to match the fallback font's width. The trade-off is a slightly longer build time (Next.js downloads fonts), but the runtime performance gain is massive—faster FCP, no third-party requests, and zero layout shift."

**2. What's the difference between FOUT and FOIT?**

**Interview Answer Template:**
"FOUT (Flash of Unstyled Text) is when the browser shows text in the fallback font (Arial) immediately, then swaps to the custom font when it loads. You see a brief flash as the font changes. FOIT (Flash of Invisible Text) is when the browser hides text until the custom font loads—users see blank space for 1-3 seconds. The choice is controlled by `font-display` in CSS: `swap` causes FOUT, `block` causes FOIT. Next.js defaults to `swap` because showing text immediately (even in Arial) is better than showing nothing. The downside of FOUT is layout shift if the fonts have different widths, but Next.js solves this with automatic size-adjust."

**3. What are the script loading strategies in next/script?**

**Interview Answer Template:**
"`beforeInteractive` loads the script before the page becomes interactive—it blocks React hydration. Use this only for critical things like A/B testing that must run before first render. `afterInteractive` (default) loads the script after the page becomes interactive—React hydrates first, then the script loads. Use this for analytics and tracking. `lazyOnload` loads the script during browser idle time (when CPU is free)—use this for non-critical widgets like chat or social media embeds. The key trade-off: beforeInteractive blocks the page (bad for performance), afterInteractive doesn't block but still competes with React, lazyOnload has zero performance impact but may load too late."

**4. How do you prevent layout shift when fonts load?**

**Interview Answer Template:**
"Layout shift happens when the fallback font and custom font have different character widths. Arial's 'Hello' might be 50px wide, but Inter's 'Hello' is 48px. When the font swaps, all text reflows, causing CLS. Next.js solves this with `size-adjust`—a CSS property that scales the fallback font to match the custom font's metrics. With `adjustFontFallback: true` in next/font, Next.js automatically calculates the size-adjust value so Arial and Inter have identical widths. Now when the font swaps, there's no reflow, and CLS stays at zero."

**5. Why are third-party scripts slow and how do you optimize them?**

**Interview Answer Template:**
"Third-party scripts like Google Analytics or Facebook Pixel are slow because: (1) they execute on the main thread, competing with your React code for CPU time, (2) they often load additional resources (more scripts, images, tracking pixels), and (3) they're outside your control (you can't optimize their code). To optimize, use next/script with the right strategy. For analytics, use `afterInteractive` so it doesn't block the initial render. For chat widgets, use `lazyOnload` so it loads during idle time. For heavy scripts like GTM, consider `strategy='worker'` (Partytown) to run them in a Web Worker, isolating them from the main thread. The key is to defer everything that's not critical."

**6. What's font subsetting and why does it matter?**

**Interview Answer Template:**
"Font subsetting is splitting a font into smaller files containing only specific character sets. The full Inter font includes 1500+ glyphs covering 100+ languages (400KB). But if your English-only site only needs 200 glyphs (letters A-Z, numbers, punctuation), you can subset to just those characters (120KB). Next.js does this automatically with the `subsets` option: `subsets: ['latin']` downloads only latin characters, saving 70% file size. The trade-off: if a user enters non-latin text (like ñ or 中), it won't render correctly. For most English-only sites, latin subset is perfect."

**Interview Answer Checklist:**
✅ Understand next/font self-hosting benefits
✅ Know FOUT vs FOIT (swap vs block)
✅ Explain script loading strategies (before, after, lazy)
✅ Understand size-adjust for zero layout shift
✅ Know how to defer third-party scripts
✅ Explain font subsetting and file size savings

</details>

---

### Code Example

```tsx
// ==========================================
// 1. NEXT/FONT WITH GOOGLE FONTS
// ==========================================

import { Inter, Roboto_Mono } from 'next/font/google';

// Load Inter font with optimization
const inter = Inter({
  subsets: ['latin'], // Only latin characters
  display: 'swap', // Show fallback immediately, swap when loaded
  weight: ['400', '700'], // Regular and bold only
  variable: '--font-inter', // CSS variable
  preload: true, // Preload in <head>
  adjustFontFallback: true, // Automatic size-adjust
});

// Load Roboto Mono for code blocks
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

// Use in Tailwind CSS
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-roboto-mono)'],
      },
    },
  },
};

// ==========================================
// 2. NEXT/FONT WITH LOCAL FONTS
// ==========================================

import localFont from 'next/font/local';

const customFont = localFont({
  src: [
    {
      path: '../public/fonts/custom-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/custom-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-custom',
});

export default function Layout({ children }) {
  return (
    <html className={customFont.variable}>
      <body>{children}</body>
    </html>
  );
}

// ==========================================
// 3. VARIABLE FONTS
// ==========================================

import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  // Variable fonts support all weights (100-900)
  // No need to specify weight array
});

// Use in CSS
// styles.css
.heading {
  font-family: var(--font-inter);
  font-weight: 600; /* Any weight 100-900 works */
}

// ==========================================
// 4. SCRIPT LOADING STRATEGIES
// ==========================================

import Script from 'next/script';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}

        {/* beforeInteractive: Blocks page interactive */}
        <Script
          id="ab-test"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.AB_TEST_VARIANT = Math.random() > 0.5 ? 'A' : 'B';
            `,
          }}
        />

        {/* afterInteractive: Loads after page interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA-XXX"
          strategy="afterInteractive"
        />

        {/* lazyOnload: Loads during idle time */}
        <Script
          src="https://widget.intercom.io/widget/APP_ID"
          strategy="lazyOnload"
          onLoad={() => console.log('Intercom loaded')}
          onError={(e) => console.error('Script failed to load', e)}
        />

        {/* worker: Runs in Web Worker (Partytown) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA-XXX"
          strategy="worker"
        />
      </body>
    </html>
  );
}

// ==========================================
// 5. CONDITIONAL SCRIPT LOADING
// ==========================================

'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export function ConditionalScripts() {
  const pathname = usePathname();

  // Only load Stripe on checkout page
  if (pathname === '/checkout') {
    return (
      <Script
        src="https://js.stripe.com/v3/"
        strategy="lazyOnload"
        onLoad={() => console.log('Stripe loaded')}
      />
    );
  }

  return null;
}

// app/layout.tsx
export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ConditionalScripts />
      </body>
    </html>
  );
}

// ==========================================
// 6. GOOGLE ANALYTICS OPTIMIZATION
// ==========================================

// app/layout.tsx
import Script from 'next/script';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}

        {/* Load GA script after page interactive */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />

        {/* Initialize GA */}
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </body>
    </html>
  );
}

// Track page views in App Router
// app/analytics.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: pathname + (searchParams.toString() ? `?${searchParams}` : ''),
      });
    }
  }, [pathname, searchParams]);

  return null;
}

// ==========================================
// 7. INTERCOM CHAT WIDGET OPTIMIZATION
// ==========================================

// app/layout.tsx
import Script from 'next/script';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}

        {/* Load Intercom lazily */}
        <Script
          id="intercom"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){
                ic('reattach_activator');ic('update',w.intercomSettings);
              }else{var d=document;var i=function(){i.c(arguments);};i.q=[];
                i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){
                var s=d.createElement('script');s.type='text/javascript';s.async=true;
                s.src='https://widget.intercom.io/widget/${process.env.NEXT_PUBLIC_INTERCOM_APP_ID}';
                var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};
                if(document.readyState==='complete'){l();}else if(w.attachEvent){
                w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
            `,
          }}
        />

        {/* Initialize Intercom after script loads */}
        <Script id="intercom-init" strategy="lazyOnload">
          {`
            window.Intercom('boot', {
              app_id: '${process.env.NEXT_PUBLIC_INTERCOM_APP_ID}',
              // Add user data if logged in
            });
          `}
        </Script>
      </body>
    </html>
  );
}

// ==========================================
// 8. FACEBOOK PIXEL OPTIMIZATION
// ==========================================

import Script from 'next/script';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}

        <Script id="fb-pixel" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      </body>
    </html>
  );
}

// ==========================================
// 9. FONT PRELOADING (CUSTOM)
// ==========================================

// app/layout.tsx
export default function Layout({ children }) {
  return (
    <html>
      <head>
        {/* Manually preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/inter-bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

// ==========================================
// 10. MEASURING FONT PERFORMANCE
// ==========================================

'use client';

import { useEffect } from 'react';

export function FontPerformanceMonitor() {
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.initiatorType === 'font') {
            console.log('Font loaded:', {
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize,
            });

            // Send to analytics
            if (typeof window.gtag !== 'undefined') {
              window.gtag('event', 'font_loaded', {
                font_name: entry.name,
                load_time: entry.duration,
              });
            }
          }
        }
      });

      observer.observe({ type: 'resource', buffered: true });

      return () => observer.disconnect();
    }
  }, []);

  return null;
}
```

### Common Mistakes

- ❌ **Using Google Fonts CDN** - Adds DNS lookup, slower than self-hosting with next/font
- ❌ **Loading all scripts with beforeInteractive** - Blocks page interactivity, hurts performance
- ❌ **No font-display strategy** - Causes FOIT (invisible text), delays FCP
- ❌ **Not subsetting fonts** - Downloads 400KB when only 120KB needed
- ✅ **Use next/font for self-hosting** - Faster, better caching, automatic optimization
- ✅ **Defer third-party scripts** - Use afterInteractive or lazyOnload
- ✅ **Subset fonts** - Only load character sets you need (latin vs full)
- ✅ **Use font-display: swap** - Show text immediately in fallback font

### Follow-up Questions

1. **What's the difference between preload and prefetch for fonts?** Preload downloads the resource immediately (high priority). Prefetch downloads during idle time for future navigation (low priority). Use preload for critical fonts.

2. **How does strategy="worker" improve performance?** Runs scripts in a Web Worker, isolating them from the main thread. This prevents third-party scripts from blocking React rendering, improving TTI and TBT.

3. **What's the trade-off between font-display swap and optional?** swap shows fallback immediately, then swaps to custom font (causes brief flash). optional only uses custom font if it loads within 100ms, otherwise keeps fallback for entire page load (no flash).

### Resources
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Next.js Script Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)
- [next/font API Reference](https://nextjs.org/docs/app/api-reference/components/font)
- [Partytown (Web Worker Scripts)](https://partytown.builder.io/)

---
