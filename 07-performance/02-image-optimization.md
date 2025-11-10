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

