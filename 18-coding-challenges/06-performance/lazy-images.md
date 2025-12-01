# Lazy Image Loading with Intersection Observer

**Difficulty:** 🟡 Medium-Advanced
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Google, Meta, Amazon, Netflix, Instagram, Pinterest
**Time to Solve:** 40-50 minutes
**Focus:** Core Web Vitals (LCP, CLS), Performance Optimization

---

## Problem Statement

Implement a lazy image loading system that:
1. Defers loading of off-screen images to improve **Largest Contentful Paint (LCP)**
2. Prevents **Cumulative Layout Shift (CLS)** with proper placeholders
3. Handles responsive images with `srcset` and `sizes`
4. Supports blur-up and progressive image loading
5. Works with both vanilla JS and React

**Real-World Scenario:**
Your e-commerce site has an image gallery with 1000+ product images. Initial page load is taking 5.2 seconds, with Core Web Vitals showing:
- **LCP: 3.8 seconds** (target: < 2.5s)
- **CLS: 0.25** (target: < 0.1)
- **FCP: 2.1 seconds** (acceptable)

Users below the fold never see images, but they're all downloaded. You need to implement lazy loading to improve metrics.

---

## Requirements

- [ ] Load images only when they enter the viewport
- [ ] Support `loading="lazy"` as baseline
- [ ] Implement Intersection Observer API solution
- [ ] Handle placeholder/blur-up technique
- [ ] Prevent layout shift with aspect ratio or dimensions
- [ ] Support responsive images (srcset)
- [ ] Handle error cases (404, timeout)
- [ ] Provide React hook (`useImageLazyLoad`)
- [ ] Support preloading above-the-fold images
- [ ] Track performance metrics
- [ ] Implement retry logic for failed images

---

## Solution 1: Native Loading Attribute (Baseline)

```javascript
// Simplest approach - native browser support
// Browser Support: Chrome 76+, Edge 79+, Firefox 75+ (3+ years old)

function renderImageGallery(images) {
  return images.map(img => `
    <img
      src="${img.src}"
      alt="${img.alt}"
      loading="lazy"
      decoding="async"
      width="${img.width}"
      height="${img.height}"
      class="gallery-image"
    />
  `).join('');
}

// Trade-offs:
// ✅ No JavaScript needed, native browser implementation
// ✅ Good browser support (96%+ of users)
// ✅ Automatically handles threshold tuning
// ❌ Limited control (can't customize threshold)
// ❌ No blur-up or progressive loading
// ❌ No retry logic
// ❌ Inconsistent implementation across browsers
```

---

## Solution 2: Intersection Observer API (Production Standard)

```javascript
class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0,
      errorRetries: options.errorRetries || 3,
      ...options
    };

    this.retries = new Map();
    this.createObserver();
  }

  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    // Preload image to check if it's valid
    const tempImg = new Image();

    tempImg.onload = () => {
      this.applyImage(img, src, srcset);
      this.clearError(img);
    };

    tempImg.onerror = () => {
      this.handleLoadError(img, src);
    };

    // Start loading
    img.classList.add('lazy-loading');

    if (srcset) {
      tempImg.srcset = srcset;
    }

    tempImg.src = src;
  }

  applyImage(img, src, srcset) {
    if (srcset) {
      img.srcset = srcset;
    }
    img.src = src;

    // Remove placeholder and blur class
    img.classList.add('lazy-loaded');
    img.classList.remove('lazy-loading');

    // Trigger optional callback
    if (this.options.onImageLoad) {
      this.options.onImageLoad(img);
    }
  }

  handleLoadError(img, src) {
    const retryCount = this.retries.get(src) || 0;

    if (retryCount < this.options.errorRetries) {
      this.retries.set(src, retryCount + 1);

      // Retry after exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      setTimeout(() => {
        this.loadImage(img);
      }, delay);
    } else {
      // Max retries reached
      img.classList.add('lazy-error');
      img.alt = img.dataset.altError || 'Failed to load image';

      if (this.options.onImageError) {
        this.options.onImageError(img);
      }
    }
  }

  clearError(img) {
    this.retries.delete(img.dataset.src);
  }

  observe(selector) {
    const images = document.querySelectorAll(selector);
    images.forEach(img => this.observer.observe(img));
    return images.length;
  }

  unobserveAll() {
    this.observer.disconnect();
  }
}

// Usage:
const lazyLoader = new LazyImageLoader({
  rootMargin: '50px',
  threshold: 0,
  errorRetries: 3,
  onImageLoad: (img) => {
    console.log('Image loaded:', img.src);
  },
  onImageError: (img) => {
    console.error('Failed to load:', img.src);
  }
});

lazyLoader.observe('img[data-src]');
```

**HTML Structure:**
```html
<!-- Off-screen image -->
<img
  class="lazy-image"
  data-src="https://cdn.example.com/product-1.jpg"
  data-srcset="
    https://cdn.example.com/product-1-400w.jpg 400w,
    https://cdn.example.com/product-1-800w.jpg 800w,
    https://cdn.example.com/product-1-1200w.jpg 1200w
  "
  data-alt-error="Product image unavailable"
  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0'/%3E%3C/svg%3E"
  alt="Product 1"
  width="400"
  height="300"
/>
```

---

## Solution 3: Blur-up Progressive Loading

```javascript
class BlurUpImageLoader extends LazyImageLoader {
  constructor(options = {}) {
    super(options);
    this.placeholderCache = new Map();
  }

  loadImage(img) {
    const src = img.dataset.src;
    const blurSrc = img.dataset.blurSrc; // Low-quality placeholder

    // Step 1: Show blur placeholder immediately
    if (blurSrc) {
      this.applyBlurPlaceholder(img, blurSrc);
    }

    img.classList.add('lazy-loading');

    // Step 2: Load full quality image
    const tempImg = new Image();

    tempImg.onload = () => {
      this.applyImage(img, src);
      // Fade from blur to sharp
      img.classList.add('image-loaded');
      this.clearError(img);
    };

    tempImg.onerror = () => {
      this.handleLoadError(img, src);
    };

    if (img.dataset.srcset) {
      tempImg.srcset = img.dataset.srcset;
    }

    tempImg.src = src;
  }

  applyBlurPlaceholder(img, blurSrc) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width || 400;
    canvas.height = img.height || 300;

    // Create SVG-based blur or use low-res image
    if (blurSrc.startsWith('data:')) {
      // Data URL - use directly
      img.src = blurSrc;
      img.classList.add('blur-placeholder');
    } else {
      // Regular image - load as placeholder
      const placeholderImg = new Image();
      placeholderImg.onload = () => {
        img.src = placeholderImg.src;
        img.classList.add('blur-placeholder');
      };
      placeholderImg.src = blurSrc;
    }
  }

  applyImage(img, src) {
    img.classList.remove('blur-placeholder');
    super.applyImage(img, src);
  }
}

// Alternate: Generate blur from full image server-side
// Base64 encoded 50x38 JPEG (~1.5KB)
const blurhash = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...';
```

**CSS for smooth transition:**
```css
.lazy-image {
  background-color: #f0f0f0;
  aspect-ratio: 16 / 9;
}

.blur-placeholder {
  filter: blur(10px);
  transition: filter 0.3s ease-out;
}

.image-loaded {
  filter: blur(0px);
}

.lazy-loading {
  opacity: 0.8;
}

.lazy-loaded {
  opacity: 1;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.lazy-error {
  background-color: #ffe0e0;
  border: 1px solid #ff6b6b;
}
```

---

## Solution 4: React Hook (useImageLazyLoad)

```javascript
import { useEffect, useRef, useState } from 'react';

function useImageLazyLoad(options = {}) {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadImage(img);
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  const loadImage = (img) => {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    const tempImg = new Image();

    tempImg.onload = () => {
      if (srcset) {
        img.srcset = srcset;
      }
      img.src = src;
      setIsLoaded(true);
      setIsError(false);
    };

    tempImg.onerror = () => {
      setIsError(true);
      setIsLoaded(false);
    };

    if (srcset) {
      tempImg.srcset = srcset;
    }

    tempImg.src = src;
  };

  return {
    ref: imgRef,
    isLoaded,
    isError
  };
}

// Usage in component:
function ImageGallery({ images }) {
  return (
    <div className="gallery">
      {images.map((img) => (
        <LazyImage
          key={img.id}
          src={img.src}
          srcset={img.srcset}
          alt={img.alt}
        />
      ))}
    </div>
  );
}

function LazyImage({ src, srcset, alt, blurSrc }) {
  const { ref, isLoaded, isError } = useImageLazyLoad({
    rootMargin: '50px'
  });

  return (
    <div className={`image-wrapper ${isLoaded ? 'loaded' : ''}`}>
      <img
        ref={ref}
        data-src={src}
        data-srcset={srcset}
        src={blurSrc || 'data:image/svg+xml,%3Csvg xmlns=...'}
        alt={alt}
        className={`lazy-image ${isLoaded ? 'visible' : ''} ${isError ? 'error' : ''}`}
        width="400"
        height="300"
      />
      {isError && <p className="error-message">Failed to load image</p>}
    </div>
  );
}
```

---

## Real-World Example: E-Commerce Gallery with 1000+ Images

```javascript
class ECommerceImageGallery {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.lazyLoader = new LazyImageLoader({
      rootMargin: '100px',
      errorRetries: 3,
      ...options
    });

    this.stats = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      startTime: Date.now(),
      imageLoadTimes: []
    };

    this.setupEventTracking();
  }

  async renderProducts(products) {
    const html = products.map(product => this.createProductHTML(product)).join('');

    this.container.innerHTML = html;

    // Track initial state before lazy loading
    const beforeLCP = performance.now();

    // Start observing lazy images
    const count = this.lazyLoader.observe('img.product-image');
    this.stats.totalImages = count;

    console.log(`Observing ${count} lazy images`);

    return {
      imagesObserved: count,
      timeToSetup: performance.now() - beforeLCP
    };
  }

  createProductHTML(product) {
    const { id, name, price, image, imageWebP, blurHash } = product;

    return `
      <div class="product-card" data-product-id="${id}">
        <div class="image-container" style="aspect-ratio: 1/1;">
          <img
            class="product-image"
            data-src="${image.src}"
            data-srcset="${image.src} 1x, ${image.src2x} 2x"
            data-blur-src="${blurHash}"
            data-alt-error="Product image unavailable"
            src="${blurHash}"
            alt="${name}"
            width="400"
            height="400"
            loading="lazy"
            decoding="async"
          />
          <noscript>
            <img src="${image.src}" alt="${name}" width="400" height="400" />
          </noscript>
        </div>
        <div class="product-info">
          <h3>${name}</h3>
          <p class="price">₹${price.toLocaleString('en-IN')}</p>
        </div>
      </div>
    `;
  }

  setupEventTracking() {
    this.lazyLoader.options.onImageLoad = (img) => {
      this.stats.loadedImages++;
      this.trackImageLoadTime(img);
      this.updateProgressBar();
    };

    this.lazyLoader.options.onImageError = (img) => {
      this.stats.failedImages++;
      this.updateProgressBar();
    };
  }

  trackImageLoadTime(img) {
    const loadTime = Date.now() - this.stats.startTime;
    this.stats.imageLoadTimes.push(loadTime);
  }

  updateProgressBar() {
    const percentage = Math.round(
      (this.stats.loadedImages / this.stats.totalImages) * 100
    );
    console.log(`Loading progress: ${percentage}%`);
  }

  getMetrics() {
    const loadedCount = this.stats.loadedImages;
    const times = this.stats.imageLoadTimes;

    return {
      totalImages: this.stats.totalImages,
      loadedImages: loadedCount,
      failedImages: this.stats.failedImages,
      successRate: ((loadedCount / this.stats.totalImages) * 100).toFixed(2) + '%',
      averageLoadTime: times.length > 0
        ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(0) + 'ms'
        : 'N/A',
      fastestLoad: times.length > 0 ? Math.min(...times) + 'ms' : 'N/A',
      slowestLoad: times.length > 0 ? Math.max(...times) + 'ms' : 'N/A',
      totalLoadTime: (Date.now() - this.stats.startTime) + 'ms'
    };
  }

  printMetrics() {
    const metrics = this.getMetrics();
    console.table(metrics);
    return metrics;
  }
}

// Usage:
const gallery = new ECommerceImageGallery('product-gallery', {
  rootMargin: '100px'
});

// Simulate loading 1000 products
const mockProducts = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.random() * 10000,
  image: {
    src: `https://cdn.example.com/products/${i + 1}.jpg`,
    src2x: `https://cdn.example.com/products/${i + 1}@2x.jpg`
  },
  imageWebP: `https://cdn.example.com/products/${i + 1}.webp`,
  blurHash: 'data:image/svg+xml,%3Csvg...' // Base64 blur placeholder
}));

gallery.renderProducts(mockProducts).then(result => {
  console.log('Gallery setup complete:', result);

  // Print metrics after all images load (simulate)
  setTimeout(() => {
    gallery.printMetrics();
  }, 30000);
});
```

---

## Core Web Vitals Impact Analysis

### Before Lazy Loading:
```
Metric                  Before          After           Improvement
─────────────────────────────────────────────────────────────────
LCP (Largest Paint)     3.8 sec         1.2 sec         68% ⬇️
FCP (First Paint)       2.1 sec         2.0 sec         5% ⬇️
CLS (Layout Shift)      0.25            0.02            92% ⬇️
Initial Bandwidth       8.5 MB          2.1 MB          75% ⬇️
Time to Interactive     5.2 sec         2.8 sec         46% ⬇️
```

**Why LCP improves:**
- Above-fold images load immediately
- Below-fold images don't block rendering
- Placeholders prevent layout shift

**Why CLS improves:**
- Fixed aspect ratio prevents jumps
- Blur placeholders show dimensions
- No surprise image loads

---

## Test Cases

```javascript
describe('LazyImageLoader', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <img class="lazy" data-src="image1.jpg" src="placeholder.jpg" />
      <img class="lazy" data-src="image2.jpg" src="placeholder.jpg" />
      <div style="height: 2000px;"></div>
      <img class="lazy" data-src="image3.jpg" src="placeholder.jpg" />
    `;
  });

  test('observes all images on initialization', () => {
    const loader = new LazyImageLoader();
    const count = loader.observe('.lazy');

    expect(count).toBe(3);
  });

  test('loads image when entering viewport', async () => {
    const loader = new LazyImageLoader();
    loader.observe('.lazy');

    const img = document.querySelector('.lazy');
    const entries = [{ target: img, isIntersecting: true }];

    // Simulate intersection
    loader.observer.constructor = jest.fn();
    // Trigger callback manually
    loader.loadImage(img);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(img.src).toBe('image1.jpg');
    expect(img.classList.contains('lazy-loaded')).toBe(true);
  });

  test('retries failed image with exponential backoff', async () => {
    const loader = new LazyImageLoader({ errorRetries: 3 });
    loader.observe('.lazy');

    const img = document.querySelector('.lazy');
    img.dataset.src = 'broken.jpg';

    const spy = jest.spyOn(loader, 'loadImage');
    loader.loadImage(img);

    // First attempt fails, retry after 1s
    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(spy).toHaveBeenCalledTimes(2); // Initial + 1 retry
  });

  test('handles missing data-src gracefully', () => {
    const img = document.querySelector('.lazy');
    delete img.dataset.src;

    const loader = new LazyImageLoader();
    expect(() => {
      loader.loadImage(img);
    }).not.toThrow();
  });

  test('unobserves image after loading', async () => {
    const loader = new LazyImageLoader();
    loader.observe('.lazy');

    const img = document.querySelector('.lazy');
    const spy = jest.spyOn(loader.observer, 'unobserve');

    loader.loadImage(img);

    expect(spy).toHaveBeenCalledWith(img);
  });

  test('applies blur placeholder correctly', () => {
    const loader = new BlurUpImageLoader();
    const img = document.querySelector('.lazy');
    img.dataset.blurSrc = 'blur.jpg';

    loader.applyBlurPlaceholder(img, 'blur.jpg');

    expect(img.classList.contains('blur-placeholder')).toBe(true);
  });

  test('handles srcset attribute', async () => {
    const loader = new LazyImageLoader();
    const img = document.querySelector('.lazy');
    img.dataset.src = 'image.jpg';
    img.dataset.srcset = 'image-400w.jpg 400w, image-800w.jpg 800w';

    loader.loadImage(img);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(img.srcset).toBe('image-400w.jpg 400w, image-800w.jpg 800w');
  });

  test('respects error retry limit', async () => {
    const loader = new LazyImageLoader({ errorRetries: 2 });
    const img = document.querySelector('.lazy');
    img.dataset.src = 'broken.jpg';

    loader.loadImage(img);

    // Wait for 3 retries (1s + 2s + 4s = 7s)
    await new Promise(resolve => setTimeout(resolve, 7100));

    expect(img.classList.contains('lazy-error')).toBe(true);
  });

  test('triggers onImageLoad callback', async () => {
    const callback = jest.fn();
    const loader = new LazyImageLoader({
      onImageLoad: callback
    });

    const img = document.querySelector('.lazy');
    loader.loadImage(img);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(callback).toHaveBeenCalledWith(img);
  });

  test('executes onImageError callback on failure', async () => {
    const callback = jest.fn();
    const loader = new LazyImageLoader({
      errorRetries: 0,
      onImageError: callback
    });

    const img = document.querySelector('.lazy');
    img.dataset.src = 'broken.jpg';
    loader.loadImage(img);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(callback).toHaveBeenCalledWith(img);
  });
});

describe('useImageLazyLoad Hook', () => {
  test('lazy loads image on intersection', () => {
    const { result } = renderHook(() => useImageLazyLoad());

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  test('sets isLoaded to true on successful load', async () => {
    const { result } = renderHook(() => useImageLazyLoad());

    act(() => {
      // Simulate successful load
      result.current.ref.current?.onload?.();
    });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
  });

  test('sets isError on load failure', async () => {
    const { result } = renderHook(() => useImageLazyLoad());

    act(() => {
      result.current.ref.current?.onerror?.();
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

---

## Common Mistakes & Solutions

### ❌ Mistake 1: Missing Placeholders (CLS Issue)
```javascript
// BAD: No placeholder, image jumps into place
<img class="lazy" data-src="image.jpg" />

// GOOD: Fixed dimensions + placeholder
<img
  class="lazy"
  data-src="image.jpg"
  src="data:image/svg+xml,%3Csvg..."
  width="400"
  height="300"
  style="aspect-ratio: 4/3;"
/>
```

### ❌ Mistake 2: No Error Handling
```javascript
// BAD: Silent failure
tempImg.onload = () => {
  img.src = src;
};
// Missing onerror handler

// GOOD: Retry + fallback
tempImg.onerror = () => {
  this.handleLoadError(img, src);
};
```

### ❌ Mistake 3: Loading Everything at Once
```javascript
// BAD: Observe all without cleanup
images.forEach(img => {
  observer.observe(img);
});
// No disconnect, keeps observing after unmount

// GOOD: Disconnect in cleanup
useEffect(() => {
  observer.observe(img);
  return () => observer.disconnect();
}, []);
```

### ❌ Mistake 4: Ignoring srcset
```javascript
// BAD: Ignores responsive images
img.src = src;

// GOOD: Applies srcset for responsive
img.srcset = srcset;
img.src = src;
```

### ❌ Mistake 5: Browser Compatibility
```javascript
// BAD: Assumes Intersection Observer exists
const observer = new IntersectionObserver(...);

// GOOD: Fallback for older browsers
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(...);
} else {
  // Fallback: load all images
  images.forEach(img => {
    img.src = img.dataset.src;
  });
}
```

---

## Performance Metrics Tracking

```javascript
class ImagePerformanceMonitor {
  constructor() {
    this.metrics = {
      imagesInViewport: 0,
      imageLoadStartTime: {},
      imageLoadEndTime: {},
      imageLazyLoadSavings: 0
    };
  }

  onImageStart(imgId) {
    this.metrics.imageLoadStartTime[imgId] = performance.now();
  }

  onImageEnd(imgId) {
    this.metrics.imageLoadEndTime[imgId] = performance.now();
    const duration = this.metrics.imageLoadEndTime[imgId] -
                     this.metrics.imageLoadStartTime[imgId];
    console.log(`Image ${imgId} loaded in ${duration.toFixed(0)}ms`);
  }

  measureLazyLoadSavings(totalImages, lazyLoadedImages) {
    // Savings = (images not loaded initially) * avg image size
    const avgImageSize = 250; // KB
    const savedBytes = (totalImages - lazyLoadedImages) * avgImageSize * 1024;

    this.metrics.imageLazyLoadSavings = savedBytes;

    return {
      savedBytes,
      savedMB: (savedBytes / 1024 / 1024).toFixed(2),
      percentageReduction: ((savedBytes / (totalImages * avgImageSize * 1024)) * 100).toFixed(1)
    };
  }

  getLCP() {
    const paint = performance.getEntriesByType('largest-contentful-paint');
    if (paint.length) {
      return paint[paint.length - 1].renderTime || paint[paint.length - 1].loadTime;
    }
    return null;
  }

  getCLS() {
    let cls = 0;
    for (const entry of performance.getEntriesByType('layout-shift')) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    }
    return cls;
  }

  generateReport(totalImages, lazyLoadedImages) {
    const savings = this.measureLazyLoadSavings(totalImages, lazyLoadedImages);

    return {
      metrics: this.metrics,
      coreWebVitals: {
        LCP: this.getLCP() + 'ms',
        CLS: this.getCLS().toFixed(3)
      },
      savings,
      recommendation: this.generateRecommendation(savings)
    };
  }

  generateRecommendation(savings) {
    if (savings.savedMB > 10) {
      return 'Lazy loading highly effective. Consider adding blur-up for better UX.';
    } else if (savings.savedMB > 1) {
      return 'Lazy loading moderately effective. Monitor for improvement opportunities.';
    } else {
      return 'Lazy loading provides minimal benefit. Consider other optimizations.';
    }
  }
}
```

---

## Follow-Up Questions & Advanced Topics

### Q1: How do you handle responsive images with srcset?
```javascript
// Use sizes attribute to match media queries
<img
  data-src="image.jpg"
  data-srcset="
    small.jpg 400w,
    medium.jpg 800w,
    large.jpg 1200w
  "
  data-sizes="
    (max-width: 600px) 100vw,
    (max-width: 1200px) 50vw,
    33vw
  "
/>

// Intersection Observer applies srcset automatically
img.srcset = img.dataset.srcset;
img.sizes = img.dataset.sizes;
```

### Q2: How do you implement WebP fallback?
```javascript
function loadImageWithFallback(img) {
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  const src = supportsWebP() ? img.dataset.srcWebp : img.dataset.src;
  img.src = src;
}
```

### Q3: How do you handle sticky headers (position: fixed)?
```javascript
// Use rootMargin with negative value to account for fixed header
const loader = new LazyImageLoader({
  rootMargin: '-80px 0px 0px 0px' // 80px fixed header
});
```

### Q4: How do you preload critical images?
```javascript
function preloadCriticalImages(selectors) {
  selectors.forEach(selector => {
    const img = document.querySelector(selector);
    if (img && img.dataset.src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.dataset.src;
      document.head.appendChild(link);
    }
  });
}

// Usage: Preload hero image and first 3 gallery images
preloadCriticalImages([
  '.hero-image',
  '.gallery-image:nth-child(1)',
  '.gallery-image:nth-child(2)',
  '.gallery-image:nth-child(3)'
]);
```

### Q5: How do you measure actual bandwidth savings?
```javascript
class BandwidthMonitor {
  measureSavings() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.transferSize === 0) {
          console.log('Cache hit:', entry.name);
        } else {
          console.log(`${entry.name}: ${(entry.transferSize / 1024).toFixed(1)}KB`);
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    return {
      totalBytes: performance.getEntriesByType('resource')
        .reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
      totalEntries: performance.getEntriesByType('resource').length
    };
  }
}
```

---

## Summary: Choose the Right Approach

| Approach | Pros | Cons | Use Case |
|----------|------|------|----------|
| **loading="lazy"** | Native, zero JS, simple | Limited control, inconsistent | Simple galleries, low traffic |
| **Intersection Observer** | Full control, retry logic, compatible | More code, manual setup | E-commerce, high traffic |
| **Blur-up** | Great UX, perceived speed | Extra HTTP request, complex | Premium image galleries |
| **React Hook** | Reusable, component-scoped | Overkill for simple cases | React applications |
| **Server-side** | Best caching, CDN optimization | Backend changes needed | Enterprise systems |

---

## Key Takeaways

1. **LCP Impact:** Lazy loading immediately improves Largest Contentful Paint by 60-70%
2. **CLS Prevention:** Fixed aspect ratios and placeholders prevent layout shift
3. **Bandwidth:** Save 50-75% of image bytes on typical e-commerce sites
4. **Retry Logic:** Exponential backoff handles network failures gracefully
5. **Responsive:** Always use srcset and sizes for optimal images
6. **Testing:** Monitor Core Web Vitals before/after implementation

---

[← Back to Performance Challenges](./README.md)
