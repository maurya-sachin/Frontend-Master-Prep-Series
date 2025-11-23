# React Lazy Loading: Images & Performance Optimization

## Question 1: How to implement lazy loading for images in React?

### Main Answer

Lazy loading images in React is implemented through three primary approaches: the HTML `loading="lazy"` attribute for native browser support, the IntersectionObserver API for custom logic, and third-party libraries like react-lazyload or react-intersection-observer. The native `loading="lazy"` attribute is the simplest solution for modern browsers, automatically deferring image loading until the image is about to enter the viewport.

For more control, IntersectionObserver provides a performant way to detect when elements enter the viewport. This involves creating an observer instance, defining a callback function that runs when images become visible, and observing image elements. Libraries like react-lazyload abstract this further by providing reusable components that handle lazy loading automatically.

A basic React implementation combines these approaches: use `loading="lazy"` for fallback support, implement IntersectionObserver for dynamic image sources, and consider blur-up or LQIP (Low Quality Image Placeholder) techniques for perceived performance improvement. Progressive loading stacks multiple image sources - a small placeholder, a medium-quality image, and finally the full-resolution image - creating a smooth visual progression.

Performance metrics are critical: measure First Contentful Paint (FCP), Largest Contentful Paint (LCP), and Cumulative Layout Shift (CLS). Proper implementation reduces initial payload by 40-70% while maintaining visual quality.

---

### 🔍 Deep Dive

#### Native HTML loading Attribute
The `loading="lazy"` attribute on `<img>` tags tells the browser to defer loading until the image is close to the viewport. The browser uses its own intersection detection mechanism, typically starting to load images when they're approximately 50px away from the viewport (varies by browser).

```javascript
// Browser automatically defers loading
<img src="large-image.jpg" loading="lazy" alt="description" />
<img src="another-image.jpg" loading="lazy" alt="description" />
```

This is supported in modern browsers (Chrome 76+, Firefox 75+, Edge 79+, Safari 15.1+). For older browsers, loading attribute is simply ignored, and images load normally.

#### IntersectionObserver API
IntersectionObserver provides fine-grained control over viewport detection with better performance than scroll event listeners. It runs on a separate thread, avoiding main thread blocking.

```javascript
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;  // Load actual image
      img.classList.add('loaded');
      observer.unobserve(img);    // Stop observing
    }
  });
}, {
  rootMargin: '50px'  // Start loading 50px before visible
});

// Observe all lazy images
document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});
```

#### React Implementation Patterns

**Functional Component with useEffect:**
```javascript
import { useEffect, useRef } from 'react';

const LazyImage = ({ src, placeholder, alt }) => {
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={placeholder}
      data-src={src}
      alt={alt}
      className="lazy-image"
    />
  );
};
```

**Custom Hook:**
```javascript
const useLazyLoad = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { rootMargin: options.rootMargin || '50px' });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

// Usage
const [imgRef, isVisible] = useLazyLoad();
<img ref={imgRef} src={isVisible ? actualSrc : placeholder} />
```

#### Progressive Image Loading
Implement a three-stage loading strategy for better perceived performance:

```javascript
const ProgressiveImage = ({ thumbnail, lowRes, highRes, alt }) => {
  const [src, setSrc] = useState(thumbnail);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stage 1: Load low-resolution version
          const lowResImg = new Image();
          lowResImg.src = lowRes;
          lowResImg.onload = () => setSrc(lowRes);

          // Stage 2: Load high-resolution version
          const highResImg = new Image();
          highResImg.src = highRes;
          highResImg.onload = () => setSrc(highRes);

          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '100px' });

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      style={{ filter: src === thumbnail ? 'blur(10px)' : 'none' }}
      onLoad={e => e.target.style.filter = 'none'}
    />
  );
};
```

#### Image Loading Libraries

**react-intersection-observer:**
```javascript
import { useInView } from 'react-intersection-observer';

const LazyImage = ({ src, alt }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '50px'
  });

  return (
    <img
      ref={ref}
      src={inView ? src : 'placeholder.jpg'}
      alt={alt}
    />
  );
};
```

**next/image (Next.js):**
```javascript
import Image from 'next/image';

// Automatic lazy loading built-in
<Image
  src="/image.jpg"
  alt="description"
  width={800}
  height={600}
  loading="lazy"
/>
```

#### Optimization Metrics
- **Bytes saved on initial load:** 40-70% reduction
- **Time to interactive (TTI):** 20-30% improvement
- **LCP (Largest Contentful Paint):** Critical for above-the-fold images
- **CLS (Cumulative Layout Shift):** Use width/height attributes to prevent layout shifts

---

### 🐛 Real-World Scenario

**Problem:** E-commerce product listing page with 200+ product images loading on initial page load.

**Symptoms Observed:**
- Initial bundle size: 45MB (all product images)
- Time to Interactive: 8.2 seconds
- First Contentful Paint: 3.1 seconds
- Mobile users experiencing blank screen for 5+ seconds
- High bounce rate on mobile traffic
- Lighthouse Performance score: 28/100

**Root Cause Analysis:**
```javascript
// BEFORE: All images load immediately
<div className="product-grid">
  {products.map(product => (
    <img key={product.id} src={product.imageUrl} alt={product.name} />
  ))}
</div>
```

The browser downloads all 200 image files sequentially, consuming bandwidth and blocking other resources. Mobile users with slower connections experience extended blank screens.

**Implementation Solution:**

```javascript
// AFTER: Progressive lazy loading with IntersectionObserver
import { useLazyLoad } from './hooks/useLazyLoad';

const ProductCard = ({ product }) => {
  const [imgRef, isVisible] = useLazyLoad({ rootMargin: '100px' });

  return (
    <div className="product-card">
      <img
        ref={imgRef}
        src={isVisible ? product.imageUrl : '/placeholder.svg'}
        alt={product.name}
        className="product-image"
        loading="lazy"
      />
      <h3>{product.name}</h3>
    </div>
  );
};

const ProductListing = ({ products }) => {
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

**Added blur-up effect for perceived performance:**
```javascript
const ProgressiveProductImage = ({ thumbnail, fullRes, alt }) => {
  const [src, setSrc] = useState(thumbnail);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.src = fullRes;
          img.onload = () => {
            setSrc(fullRes);
            setIsLoaded(true);
          };
        }
      });
    }, { rootMargin: '50px' });

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      style={{
        filter: isLoaded ? 'none' : 'blur(10px)',
        transition: 'filter 0.3s ease-out'
      }}
    />
  );
};
```

**Performance Impact:**
- Initial payload: 45MB → 2.1MB (95% reduction)
- Time to Interactive: 8.2s → 1.8s (78% improvement)
- First Contentful Paint: 3.1s → 0.6s (81% improvement)
- Lighthouse score: 28 → 92
- Mobile bounce rate: 42% → 8%
- User engagement: +156% page scroll depth

**Monitoring Implementation:**
```javascript
// Track lazy loading effectiveness
useEffect(() => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Log image load performance
        const loadTime = performance.now();
        const img = entry.target;
        img.onload = () => {
          const duration = performance.now() - loadTime;
          analytics.track('image_lazy_loaded', {
            product_id: img.dataset.productId,
            load_duration: duration,
            image_size: img.naturalWidth + 'x' + img.naturalHeight
          });
        };
      }
    });
  }, { rootMargin: '50px' });

  document.querySelectorAll('.lazy-image').forEach(img => {
    observer.observe(img);
  });
}, []);
```

---

### ⚖️ Trade-offs

#### Native Loading Attribute vs IntersectionObserver

| Aspect | loading="lazy" | IntersectionObserver |
|--------|---|---|
| Browser Support | Chrome 76+, Firefox 75+, Edge 79+, Safari 15.1+ | All modern browsers, IE 11+ with polyfill |
| Custom Logic | None | Full control over intersection logic |
| Performance Overhead | Minimal (browser-native) | Slightly higher (JS execution) |
| Rootmargin Support | No (browser decides ~50px) | Yes, customizable |
| Progressive Loading | No | Yes, can implement blur-up |
| Debugging | Harder (black box) | Full visibility into behavior |
| Use Case | Simple images, basic lazy loading | Complex scenarios, blur-up, analytics |

**Decision Matrix:**
- Simple product listings → Use `loading="lazy"`
- Complex animations on load → Use IntersectionObserver
- Progressive image loading → IntersectionObserver
- Analytics on image visibility → IntersectionObserver
- Maximum browser support → Hybrid approach (both)

#### Eager vs Lazy Loading Trade-offs

**Eager Loading (No Lazy Loading):**
```
✅ Pros:
- Simple implementation
- No JavaScript required
- No layout shift concerns (images load first)
- Better for critical images above fold

❌ Cons:
- Large initial payload
- Slower Time to Interactive
- Wastes bandwidth on images user never sees
- Poor mobile performance
```

**Lazy Loading:**
```
✅ Pros:
- Reduced initial payload (40-70%)
- Faster Time to Interactive
- Lower bandwidth consumption
- Better mobile performance
- Improved Core Web Vitals

❌ Cons:
- Requires JavaScript (non-critical)
- Potential layout shift if dimensions not specified
- Network requests spread over time
- May delay visibility of below-fold content
- More complex implementation
```

#### Library vs Custom Implementation

**react-lazyload:**
```
✅ Pros:
- Simple component-based API
- Built-in scrolling optimization
- Works with images, videos, iframes
- Popular and well-maintained

❌ Cons:
- Additional dependency (15KB gzipped)
- Less control over intersection logic
- Specific to React
```

**react-intersection-observer:**
```
✅ Pros:
- Lightweight hook-based API
- More control than react-lazyload
- Framework-agnostic core library
- Good TypeScript support

❌ Cons:
- Requires observer setup in each component
- Not as feature-rich as full solutions
```

**Custom Implementation:**
```
✅ Pros:
- Zero dependencies
- Full control over behavior
- Can optimize for specific use case
- Smallest bundle footprint

❌ Cons:
- More development time
- Edge cases to handle
- Harder to maintain
- Need to test cross-browser compatibility
```

#### Performance vs Functionality Trade-off

```javascript
// Fast but limited
<img src={src} loading="lazy" alt={alt} />

// Slower but feature-rich
<img
  ref={imgRef}
  src={isVisible ? fullRes : thumbnail}
  alt={alt}
  onLoad={handleImageLoad}
  className={isLoaded ? 'loaded' : 'loading'}
/>
```

**When to prioritize performance:** Above-the-fold images, critical product images, high-traffic pages

**When to add features:** Below-the-fold decorative images, analytics requirements, user experience enhancement

#### Placeholder Strategy Trade-offs

| Strategy | Bundle Size | User Experience | Complexity |
|----------|---|---|---|
| Solid color | Tiny | Poor (boring) | Simple |
| Blurred thumbnail | Small (5-10KB) | Good (elegant) | Moderate |
| LQIP (Low Quality) | Tiny (1-2KB) | Good | Moderate |
| Skeleton loader | None | Good (engagement) | Moderate |
| No placeholder | None | Poor (flash) | Simple |

---

### 💬 Explain to Junior

**What is Lazy Loading? (Simple Analogy)**

Imagine you're at a bookstore with thousands of books. When you enter, you don't immediately read every book on every shelf. Instead, you:
1. Browse a few nearby books first
2. When you move to a new section, you check out books there
3. You only fully read books you're interested in

Lazy loading images works the same way. Instead of loading all 200 product images when the page loads, the browser:
1. Loads images that are visible on your screen
2. Waits until you scroll to load images in new sections
3. Never loads images you never scroll to see

This saves bandwidth and makes pages load faster.

**Basic Implementation Step-by-Step:**

```javascript
// Step 1: Create a custom hook
const useLazyLoad = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Step 2: Create observer
    const observer = new IntersectionObserver(([entry]) => {
      // Step 3: Check if element is in viewport
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Step 4: Stop observing once loaded
        observer.unobserve(entry.target);
      }
    });

    // Step 5: Start watching the element
    if (ref.current) {
      observer.observe(ref.current);
    }

    // Step 6: Clean up when component unmounts
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

// Step 7: Use in component
const MyImage = ({ src }) => {
  const [ref, isVisible] = useLazyLoad();
  return (
    <img
      ref={ref}
      src={isVisible ? src : 'placeholder.jpg'}
      alt="lazy loaded"
    />
  );
};
```

**Interview Answer Template:**

"Lazy loading is a technique where we defer loading images until they're about to appear on the user's screen. Instead of loading all images when the page loads, we only load them when needed.

There are three approaches:
1. **Native HTML:** `<img loading="lazy" />` - Simplest, browser handles it
2. **IntersectionObserver:** Custom hook that detects when images enter viewport
3. **Libraries:** react-lazyload or react-intersection-observer for abstraction

I typically use a custom hook with IntersectionObserver. Here's how it works:
- Create an observer instance
- When image enters viewport, load the actual image
- Stop observing once loaded

For performance, I use the `rootMargin` option to start loading before the image is visible. For perceived performance, I use blur-up effect with low-quality placeholders.

This reduces initial bundle size by 40-70%, improves Time to Interactive, and saves bandwidth."

**Common Mistakes Juniors Make:**

```javascript
// ❌ Mistake 1: Not cleaning up observer
useEffect(() => {
  const observer = new IntersectionObserver(callback);
  observer.observe(ref.current);
  // Missing: return () => observer.disconnect();
}, []);

// ✅ Correct: Cleanup prevents memory leaks
useEffect(() => {
  const observer = new IntersectionObserver(callback);
  observer.observe(ref.current);
  return () => observer.disconnect();
}, []);

// ❌ Mistake 2: Loading actual image synchronously
if (isIntersecting) {
  img.src = actualSrc;  // Blocks during load
}

// ✅ Correct: Use Image constructor for async loading
if (isIntersecting) {
  const img = new Image();
  img.onload = () => setSrc(actualSrc);
  img.src = actualSrc;
}

// ❌ Mistake 3: No dimensions on image element
<img src={src} alt="product" />

// ✅ Correct: Prevents Cumulative Layout Shift
<img src={src} alt="product" width={800} height={600} />

// ❌ Mistake 4: Observing too many elements
document.querySelectorAll('img').forEach(img => {
  observer.observe(img);
});  // Creates one observer, many observations (OK)

// ✅ Better: Reuse single observer instance
const observer = new IntersectionObserver(callback);
document.querySelectorAll('img').forEach(img => {
  observer.observe(img);
});
```

**Why Lazy Loading Matters for Interviews:**

1. **Performance awareness:** Shows you understand Core Web Vitals (LCP, CLS, FID)
2. **Production thinking:** Real-world optimization beyond "make it work"
3. **User experience:** Balancing performance with perceived performance
4. **API knowledge:** IntersectionObserver is modern browser API
5. **Trade-off analysis:** Know when to use native vs custom vs library solutions

**Real Interview Scenario:**

Interviewer: "We have a product listing with 500+ images. Page load time is 12 seconds. How would you optimize?"

Your answer:
"First, I'd measure current performance with Lighthouse. Then I'd implement lazy loading:
1. Use `loading="lazy"` for quick win
2. Replace with IntersectionObserver for more control
3. Add blur-up effect using low-quality placeholders
4. Use correct image dimensions to prevent layout shift
5. Monitor with analytics to see actual improvement

This should reduce initial payload by 60-70% and TTI by 70-80%. For critical above-fold images, I'd keep eager loading."

---

## Question 2: What are intersection observer patterns for lazy loading?

### Main Answer

Intersection Observer patterns in lazy loading define specific strategies for detecting element visibility in the viewport and triggering load actions. The core pattern involves creating an IntersectionObserver instance with specific options, defining a callback that executes when visibility changes, and observing target elements. Multiple patterns exist for different scenarios: basic lazy loading (load immediately when visible), progressive loading (load in stages), virtual scrolling (render only visible items), and image gallery patterns (preload adjacent images).

Key patterns include the "load once" pattern where elements are observed once then unobserved, the "continuous" pattern where elements remain observed for repeated visibility checks, and the "threshold-based" pattern where actions trigger at specific visibility percentages. The rootMargin option enables predictive loading, starting image downloads before elements become visible, improving perceived performance.

Advanced patterns combine IntersectionObserver with other techniques: blur-up loading sequences, LQIP (Low Quality Image Placeholder), multiple image sources, and performance monitoring. React implementations typically wrap these patterns in custom hooks or higher-order components for reusability. Understanding which pattern to apply depends on use case: single images use simple patterns, image galleries need preloading patterns, and large lists require virtual scrolling patterns for optimal performance.

---

### 🔍 Deep Dive

#### Pattern 1: Basic Load-Once Pattern

```javascript
const BasicLazyLoadPattern = () => {
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Load image
        const img = entry.target;
        img.src = img.dataset.src;

        // Stop observing (memory efficient)
        observer.unobserve(img);
      }
    });

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      data-src="actual-image.jpg"
      src="placeholder.jpg"
      alt="lazy loaded"
    />
  );
};
```

**Use case:** Single images, product images, blog post images
**Benefits:** Memory efficient, simple implementation
**Drawbacks:** No continuous observation, limited control

#### Pattern 2: Threshold-Based Pattern

Trigger different actions based on visibility percentage:

```javascript
const ThresholdPattern = ({ onPartialVisible, onFullyVisible }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // threshold: 0 = any part visible
        // threshold: 0.5 = 50% visible
        // threshold: 1.0 = fully visible
        if (entry.isIntersecting) {
          if (entry.intersectionRatio >= 1.0) {
            onFullyVisible();
          } else if (entry.intersectionRatio >= 0.5) {
            onPartialVisible();
          }
        }
      },
      {
        threshold: [0, 0.5, 1.0]  // Trigger at 0%, 50%, 100%
      }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [onPartialVisible, onFullyVisible]);

  return <div ref={elementRef}>Content</div>;
};

// Usage
<ThresholdPattern
  onPartialVisible={() => console.log('Load low-res')}
  onFullyVisible={() => console.log('Load high-res')}
/>
```

#### Pattern 3: Predictive Loading Pattern

Use rootMargin to load before elements are visible:

```javascript
const PredictiveLoadPattern = ({ images }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Load images 200px before they become visible
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;

            // Trigger actual load
            const actualImage = new Image();
            actualImage.src = img.dataset.src;
            actualImage.onload = () => {
              img.src = img.dataset.src;
              img.classList.add('loaded');
            };
          }
        });
      },
      {
        rootMargin: '200px'  // Start loading 200px before visible
      }
    );

    containerRef.current?.querySelectorAll('[data-src]').forEach(img => {
      observer.observe(img);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      {images.map(img => (
        <img
          key={img.id}
          data-src={img.src}
          src={img.placeholder}
          alt={img.alt}
        />
      ))}
    </div>
  );
};
```

#### Pattern 4: Progressive Loading Pattern

Load multiple image qualities in sequence:

```javascript
const ProgressiveLoadPattern = ({ thumb, medium, full, alt }) => {
  const [src, setSrc] = useState(thumb);
  const [stage, setStage] = useState('thumbnail');
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Stage 1: Load medium quality
            const mediumImg = new Image();
            mediumImg.src = medium;
            mediumImg.onload = () => {
              setSrc(medium);
              setStage('medium');
            };

            // Stage 2: Load full quality
            const fullImg = new Image();
            fullImg.src = full;
            fullImg.onload = () => {
              setSrc(full);
              setStage('full');
            };

            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [medium, full]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      style={{
        filter: stage === 'thumbnail' ? 'blur(10px)' : 'none',
        transition: 'filter 0.3s ease-out'
      }}
      className={`image-${stage}`}
    />
  );
};
```

#### Pattern 5: Virtual Scrolling Pattern

For large lists, only render visible items:

```javascript
const VirtualScrollPattern = ({ items, itemHeight }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const { index } = entry.target.dataset;

          if (entry.isIntersecting) {
            // Load adjacent items for smooth scrolling
            const start = Math.max(0, parseInt(index) - 10);
            const end = Math.min(items.length, parseInt(index) + 30);
            setVisibleRange({ start, end });
          }
        });
      },
      { rootMargin: '500px' }  // Load items far ahead
    );

    containerRef.current?.querySelectorAll('[data-index]').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items.length]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div ref={containerRef} style={{ overflow: 'auto', height: '600px' }}>
      <div style={{ height: visibleRange.start * itemHeight }} />
      {visibleItems.map((item, idx) => (
        <div
          key={item.id}
          data-index={visibleRange.start + idx}
          style={{ height: itemHeight }}
        >
          {item.name}
        </div>
      ))}
      <div style={{ height: (items.length - visibleRange.end) * itemHeight }} />
    </div>
  );
};
```

#### Pattern 6: Image Gallery Preload Pattern

Preload adjacent images in gallery:

```javascript
const GalleryPreloadPattern = ({ images, currentIndex }) => {
  const [loadedIndexes, setLoadedIndexes] = useState(new Set([currentIndex]));

  useEffect(() => {
    const preloadImage = (index) => {
      if (index >= 0 && index < images.length && !loadedIndexes.has(index)) {
        const img = new Image();
        img.src = images[index].src;
        img.onload = () => {
          setLoadedIndexes(prev => new Set([...prev, index]));
        };
      }
    };

    // Preload current, previous, and next images
    preloadImage(currentIndex - 1);
    preloadImage(currentIndex);
    preloadImage(currentIndex + 1);
  }, [currentIndex, images, loadedIndexes]);

  return (
    <div>
      <img
        src={images[currentIndex].src}
        alt={images[currentIndex].alt}
        className="gallery-main"
      />
      <div className="gallery-thumbnails">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={loadedIndexes.has(idx) ? img.thumb : img.placeholder}
            alt={img.alt}
            className={idx === currentIndex ? 'active' : ''}
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
};
```

#### Pattern 7: Reactive Pattern with useReducer

State machine for complex loading scenarios:

```javascript
const ReactiveLoadPattern = ({ src, fallback }) => {
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'VISIBLE':
          return { ...state, isVisible: true };
        case 'LOADING':
          return { ...state, isLoading: true };
        case 'LOADED':
          return { ...state, isLoading: false, loaded: true };
        case 'ERROR':
          return { ...state, isLoading: false, error: action.payload };
        case 'HIDDEN':
          return { ...state, isVisible: false };
        default:
          return state;
      }
    },
    { isVisible: false, isLoading: false, loaded: false, error: null }
  );

  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            dispatch({ type: 'VISIBLE' });

            dispatch({ type: 'LOADING' });
            const img = new Image();
            img.src = src;
            img.onload = () => dispatch({ type: 'LOADED' });
            img.onerror = (err) => dispatch({ type: 'ERROR', payload: err });
          } else {
            dispatch({ type: 'HIDDEN' });
          }
        });
      },
      { rootMargin: '100px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div ref={imgRef}>
      {state.error && <img src={fallback} alt="error" />}
      {state.isLoading && <div className="skeleton" />}
      {state.loaded && <img src={src} alt="loaded" />}
    </div>
  );
};
```

#### Pattern 8: Custom Hook Pattern

Reusable pattern for DRY code:

```javascript
const useImageLazyLoad = (src, options = {}) => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsLoading(true);
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setImage(src);
              setIsLoading(false);
            };
            img.onerror = (err) => {
              setError(err);
              setIsLoading(false);
            };
          }
        });
      },
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0
      }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return {
    imgRef,
    image,
    error,
    isLoading
  };
};

// Usage in any component
const MyComponent = ({ src }) => {
  const { imgRef, image, isLoading } = useImageLazyLoad(src);

  return (
    <>
      {isLoading && <Skeleton />}
      <img ref={imgRef} src={image} alt="lazy" />
    </>
  );
};
```

---

### 🐛 Real-World Scenario

**Problem:** News/media site with article feeds containing 50+ images per scroll session. Users report:
- Excessive memory usage (browser memory: 800MB+)
- Jank during scroll (frame rate: 12 fps)
- Mobile app crashes with 100+ articles loaded
- Battery drain on mobile devices

**Metrics Before Optimization:**
```
Initial page load: 6.2MB
Memory (500 articles): 850MB
Scroll frame rate: 12 fps
Time to Interactive: 4.8s
Battery consumption (1 hour): 25% drain
```

**Root Cause:**
```javascript
// PROBLEM: Naive implementation observes all images continuously
const ArticleImage = ({ src }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoaded(true);  // Re-observer never stops!
      }
    });

    observer.observe(imgRef.current);
    // Missing: unobserve after loading
  }, []);

  return (
    <img
      ref={imgRef}
      src={loaded ? src : 'placeholder.jpg'}
      alt="article"
    />
  );
};
```

**Analysis:**
- Each image maintains active observer even after load
- 50+ observers per article × 100+ articles = 5,000+ active observers
- Each observer checks intersection on every scroll
- Results: High memory, scroll jank, battery drain

**Solution: Load-Once Pattern with Virtual Rendering**

```javascript
// Pattern 1: Load-once with cleanup
const OptimizedArticleImage = ({ src, placeholder }) => {
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = src;
        // CRITICAL: Stop observing after load
        observer.unobserve(img);
      }
    }, { rootMargin: '50px' });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
      observer.disconnect();
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={placeholder}
      data-src={src}
      alt="article"
      width={600}
      height={400}
    />
  );
};

// Pattern 2: Virtual scrolling for articles
const ArticleFeed = ({ articles }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 5 });
  const containerRef = useRef(null);
  const ARTICLE_HEIGHT = 1200; // pixels

  useEffect(() => {
    const sentinel = document.querySelector('[data-sentinel]');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          const start = Math.max(0, index - 2);
          const end = Math.min(articles.length, index + 10);
          setVisibleRange({ start, end });
        }
      });
    }, { rootMargin: '500px' });

    document.querySelectorAll('[data-sentinel]').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [articles.length]);

  const visibleArticles = articles.slice(
    visibleRange.start,
    visibleRange.end
  );

  return (
    <div ref={containerRef} className="article-feed">
      <div style={{ height: visibleRange.start * ARTICLE_HEIGHT }} />

      {visibleArticles.map((article, idx) => (
        <div
          key={article.id}
          data-sentinel=""
          data-index={visibleRange.start + idx}
          className="article"
        >
          <h2>{article.title}</h2>
          {article.images.map(img => (
            <OptimizedArticleImage
              key={img.id}
              src={img.src}
              placeholder={img.placeholder}
            />
          ))}
          <p>{article.content}</p>
        </div>
      ))}

      <div
        style={{
          height: (articles.length - visibleRange.end) * ARTICLE_HEIGHT
        }}
      />
    </div>
  );
};

// Pattern 3: Memory monitoring
useEffect(() => {
  const checkMemory = () => {
    if (performance.memory) {
      const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      const limit = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2);

      analytics.track('memory_usage', {
        used_mb: used,
        limit_mb: limit,
        percentage: ((used / limit) * 100).toFixed(1)
      });

      if (used > limit * 0.8) {
        console.warn('High memory usage detected');
        // Trigger garbage collection
        if (window.gc) window.gc();
      }
    }
  };

  const interval = setInterval(checkMemory, 5000);
  return () => clearInterval(interval);
}, []);
```

**Performance Impact:**
```
After optimization:
- Observers active at once: 5,000 → 15 (99.7% reduction)
- Memory usage: 850MB → 120MB (85.9% reduction)
- Scroll frame rate: 12 fps → 58 fps (4.8x improvement)
- Time to Interactive: 4.8s → 0.8s (83% improvement)
- Battery drain (1 hour): 25% → 4% (84% improvement)
- Page capacity: 100 articles → 1,000+ articles stable
```

**Monitoring Dashboard:**
```javascript
const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const monitor = () => {
      const entries = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      setMetrics({
        fcp: paint.find(e => e.name === 'first-contentful-paint')?.startTime,
        lcp: performance.getEntriesByType('largest-contentful-paint').pop()?.startTime,
        ttfb: entries?.responseStart - entries?.fetchStart,
        domInteractive: entries?.domInteractive - entries?.fetchStart,
        activeObservers: Array.from(new WeakMap()).length,
        memoryUsed: (performance.memory?.usedJSHeapSize / 1048576).toFixed(2)
      });
    };

    const interval = setInterval(monitor, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="perf-monitor">
      <p>FCP: {metrics.fcp?.toFixed(0)}ms</p>
      <p>LCP: {metrics.lcp?.toFixed(0)}ms</p>
      <p>Memory: {metrics.memoryUsed}MB</p>
    </div>
  );
};
```

---

### ⚖️ Trade-offs

#### Pattern Selection Trade-offs

| Pattern | Memory | Complexity | Performance | Use Case |
|---------|--------|-----------|------------|----------|
| Load-Once | ✅ Excellent | Simple | Good | Single images |
| Threshold | ❌ Higher | Moderate | Good | Analytics-heavy |
| Predictive | ❌ Higher | Moderate | Excellent | Fast scrolling |
| Progressive | ❌ Higher | Complex | Excellent | Visual priority |
| Virtual Scroll | ✅ Excellent | Complex | Excellent | Large lists |
| Gallery Preload | ❌ Higher | Moderate | Excellent | Image galleries |
| Reactive | ✅ Good | Complex | Good | Complex states |
| Custom Hook | ✅ Good | Simple | Good | Reusable logic |

**Decision Guide:**
- Small image count (< 20): Load-once
- Gallery with navigation: Gallery preload
- Large feeds (> 100 items): Virtual scroll + load-once
- Performance critical: Predictive loading
- Complex state needs: Reactive pattern

#### rootMargin Trade-offs

```javascript
// rootMargin: '0px' (default)
// ✅ Conservative, less bandwidth waste
// ❌ May show loading/blank images to user
const Conservative = () => {
  const observer = new IntersectionObserver(callback, {
    rootMargin: '0px'
  });
};

// rootMargin: '200px'
// ✅ Smooth scrolling, images ready before visible
// ❌ More bandwidth usage, load images user might not see
const Predictive = () => {
  const observer = new IntersectionObserver(callback, {
    rootMargin: '200px'
  });
};

// rootMargin: '500px' (aggressive)
// ✅ Very smooth, preloads far ahead
// ❌ High bandwidth waste, significant memory
const Aggressive = () => {
  const observer = new IntersectionObserver(callback, {
    rootMargin: '500px'
  });
};
```

**Bandwidth Impact:**
```
User scrolls 10 articles (50 images)

rootMargin: 0px
- Images loaded: 50
- Bandwidth: ~25MB
- Perceived loading: Some lag (100-300ms)

rootMargin: 200px
- Images loaded: 70 (extra below)
- Bandwidth: ~35MB
- Perceived loading: Smooth

rootMargin: 500px
- Images loaded: 120 (way ahead)
- Bandwidth: ~60MB (2.4x more!)
- Perceived loading: Very smooth
```

**Recommendation:** Start with '100px' for mobile, '200px' for desktop, adjust based on metrics.

#### Observer Reuse vs Single Observers

**Single Observer (Reuse):**
```javascript
const observer = new IntersectionObserver(callback);

// Observe many elements
document.querySelectorAll('img').forEach(img => {
  observer.observe(img);  // All on same observer
});

// ✅ Memory efficient
// ✅ Easier to manage
// ❌ Can't have different rootMargin per element
```

**Multiple Observers:**
```javascript
// One observer per element
document.querySelectorAll('img').forEach(img => {
  const observer = new IntersectionObserver(callback);
  observer.observe(img);  // Each has own observer
});

// ❌ Memory wasteful
// ✅ Can customize per element
// ❌ Hard to manage
```

**Best Practice:** Single observer with shared logic, custom options via data attributes.

#### Cleanup Strategy Trade-offs

```javascript
// Strategy 1: Unobserve after load (Memory: Low)
observer.unobserve(img);  // Stop watching after load

// ✅ Most memory efficient
// ✅ Single observation per element
// ❌ Can't re-trigger if element re-enters

// Strategy 2: Keep observing (Memory: High)
// Don't unobserve, observer stays active

// ❌ High memory for large lists
// ✅ Can handle element re-entry
// ✅ Useful for visibility analytics

// Strategy 3: Lazy unobserve (Memory: Medium)
setTimeout(() => {
  observer.unobserve(img);
}, 5000);  // Stop observing after 5 seconds

// ✅ Balanced approach
// ✅ Handles rapid scroll
// ❌ Still uses some memory
```

---

### 💬 Explain to Junior

**Intersection Observer Patterns Explained Simply**

Think of patterns as "different recipes for the same dish." All lazy loading recipes use IntersectionObserver, but the exact steps change based on what you're cooking.

**Pattern 1: Load-Once (Most Common)**

```
Recipe: Simple roast chicken
1. Put chicken in oven (start observing)
2. Wait until it's ready (element visible)
3. Take it out (unobserve and load image)
4. Serve (don't check oven again - it's done!)
```

```javascript
// Code:
const observer = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    loadImage(entry.target);
    observer.unobserve(entry.target);  // Stop watching
  }
});
```

**Why:** Most efficient. Once loaded, don't keep checking. Good for: Product images, blog posts.

**Pattern 2: Virtual Scrolling (For Big Lists)**

```
Recipe: Serving food at a large party
1. People arrive in groups
2. You only cook for the people here NOW
3. As they leave, cook for new people coming
4. Never cook for everyone at once!
```

```javascript
// Only render items in view range
const start = 0;
const end = 20;
const visibleItems = allItems.slice(start, end);
```

**Why:** Handles massive lists (1000+) efficiently. Good for: Social feeds, large product lists.

**Pattern 3: Progressive Loading (For Best UX)**

```
Recipe: Fancy multi-course meal
1. Serve appetizer (thumbnail)
2. While eating, prepare main (medium quality)
3. While eating main, prepare dessert (full quality)
4. Customer doesn't notice - seamless!
```

```javascript
// Code:
loadImage('thumbnail.jpg');        // Fast
loadImage('medium.jpg').then(...); // Medium wait
loadImage('full.jpg').then(...);   // Final wait
```

**Why:** Feels smooth. User sees something immediately. Good for: Premium UX, e-commerce.

**Common Patterns Cheat Sheet:**

```javascript
// Pattern 1: Load-once (simplest)
observer.unobserve(target);  // After load, stop watching

// Pattern 2: Threshold (performance tracking)
threshold: [0.5, 1.0]  // Trigger at 50% and 100% visible

// Pattern 3: Predictive (smooth scrolling)
rootMargin: '200px'  // Load before visible

// Pattern 4: Virtual scroll (big lists)
Display only items in (start, end) range

// Pattern 5: Gallery preload (images nearby)
Load images at (index - 1) and (index + 1)
```

**Interview Question: "Which pattern would you use for...?"**

1. **E-commerce product listing (500 products):**
   Answer: "Virtual scrolling with load-once. Only render visible items, load image when visible. Prevents rendering 500 items at once."

2. **Blog with inline images:**
   Answer: "Load-once with predictive loading. Simple load-once pattern, but rootMargin='100px' to load before visible for smooth scroll."

3. **Image gallery with thumbnails:**
   Answer: "Gallery preload pattern. Preload adjacent images (prev/current/next) so clicking next is instant."

4. **News feed with 50+ articles:**
   Answer: "Virtual scrolling with load-once. Each article has multiple images. Virtual scrolling prevents memory explosion."

**Common Mistakes to Avoid:**

```javascript
// ❌ Mistake: Never unobserving
const observer = new IntersectionObserver(callback);
observer.observe(img);
// Missing: observer.unobserve(img);
// Result: Thousands of observers, memory leak!

// ✅ Correct: Unobserve after load
observer.unobserve(img);

// ❌ Mistake: Creating new observer per element
document.querySelectorAll('img').forEach(img => {
  const observer = new IntersectionObserver(callback);
  observer.observe(img);
});
// Result: 1000 observers for 1000 images!

// ✅ Correct: Reuse single observer
const observer = new IntersectionObserver(callback);
document.querySelectorAll('img').forEach(img => {
  observer.observe(img);
});

// ❌ Mistake: Not cleaning up on unmount
useEffect(() => {
  observer.observe(img);
  // Missing: return () => observer.disconnect();
}, []);

// ✅ Correct: Cleanup
useEffect(() => {
  observer.observe(img);
  return () => observer.disconnect();
}, []);
```

**Interview Answer Template:**

"Intersection Observer patterns are different strategies for detecting visibility and triggering loads. The most common is load-once: start observing when component mounts, load image when visible, stop observing after load.

For large lists, virtual scrolling is better: only render visible items, avoiding DOM bloat.

For galleries, preload adjacent images so navigation is instant.

The key trade-off: memory vs perceived performance. Load-once is most efficient but might show loading states. Predictive loading (rootMargin) uses more bandwidth but feels smoother.

I always:
1. Unobserve after load (or don't if need continuous observation)
2. Reuse observers (one observer watching many elements)
3. Cleanup on unmount (disconnect to prevent leaks)
4. Monitor memory usage
5. Test on slow connections and low-end devices"

**Code Pattern Reference:**

```javascript
// Template you can copy
const useIntersectionPattern = (options = {}) => {
  const ref = useRef(null);
  const [state, setState] = useState('idle');

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Load action here
        setState('loaded');
        observer.unobserve(entry.target);  // Unobserve after
      }
    }, {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0
    });

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();  // Cleanup
  }, []);

  return [ref, state];
};
```

---

## Summary

This comprehensive guide covers lazy loading in React through two detailed questions:

**Q1: Implementation** - Three approaches (native, IntersectionObserver, libraries), progressive loading, custom hooks, and real-world e-commerce optimization saving 40-70% bandwidth.

**Q2: Patterns** - Load-once, threshold, predictive, progressive, virtual scrolling, gallery preload, and reactive patterns with memory/performance trade-offs.

**Key Takeaways:**
- Use `loading="lazy"` for quick wins
- IntersectionObserver for control
- Unobserve after loading to prevent memory leaks
- Virtual scrolling for large lists (1000+)
- Predictive loading (rootMargin) for smooth UX
- Monitor actual metrics, not assumptions
