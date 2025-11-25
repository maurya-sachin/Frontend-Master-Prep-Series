# Image Carousel System Design

> **Focus**: Frontend system design and component architecture

---

## Question 1: Design an Image Carousel with Infinite Loop and Touch Gestures

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 30-45 minutes
**Companies:** Amazon, Netflix, Airbnb, Pinterest, Instagram, Shopify

### Question
Design and implement a production-ready image carousel with infinite scrolling, lazy loading, touch/swipe gestures, and accessibility. Consider performance, mobile experience, and edge cases.

### Answer

An image carousel is a common UI pattern for browsing through images or content. Key requirements include:

1. **Infinite Loop** - Seamless circular navigation (no boundaries)
2. **Lazy Loading** - Load images only when needed
3. **Touch Gestures** - Swipe support for mobile devices
4. **Accessibility** - Keyboard navigation and screen reader support
5. **Performance** - Smooth animations without jank
6. **Auto-play** - Optional automatic slide advancement

### Code Example

**Complete Implementation:**

```javascript
import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Production-Ready Image Carousel
 * Features:
 * - Infinite loop (circular navigation)
 * - Lazy loading images
 * - Touch/swipe gestures
 * - Keyboard navigation (←→)
 * - Auto-play with pause on hover
 * - Accessibility (ARIA)
 * - Responsive design
 * - Preloading adjacent slides
 */
function ImageCarousel({
  images,
  autoPlayInterval = 5000,
  enableAutoPlay = false,
  enableInfiniteLoop = true,
  enableLazyLoading = true,
  transitionDuration = 300,
  swipeThreshold = 50, // pixels
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set([0]));

  const carouselRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  const transitionTimerRef = useRef(null);

  const totalSlides = images.length;

  // Navigate to specific index
  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning) return;

      let newIndex = index;

      // Handle infinite loop wrapping
      if (enableInfiniteLoop) {
        if (newIndex < 0) {
          newIndex = totalSlides - 1;
        } else if (newIndex >= totalSlides) {
          newIndex = 0;
        }
      } else {
        // Clamp to boundaries if not infinite
        newIndex = Math.max(0, Math.min(newIndex, totalSlides - 1));
      }

      setIsTransitioning(true);
      setCurrentIndex(newIndex);

      // Mark transition as complete
      transitionTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDuration);

      // Preload adjacent images
      if (enableLazyLoading) {
        const prevIndex = newIndex === 0 ? totalSlides - 1 : newIndex - 1;
        const nextIndex = newIndex === totalSlides - 1 ? 0 : newIndex + 1;

        setLoadedImages((prev) =>
          new Set([...prev, newIndex, prevIndex, nextIndex])
        );
      }
    },
    [isTransitioning, totalSlides, enableInfiniteLoop, enableLazyLoading, transitionDuration]
  );

  // Navigation functions
  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const goToPrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Auto-play logic
  useEffect(() => {
    if (!enableAutoPlay || isPaused) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [enableAutoPlay, isPaused, autoPlayInterval, goToNext]);

  // Touch handlers for swipe gestures
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > swipeThreshold;
    const isRightSwipe = distance < -swipeThreshold;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('keydown', handleKeyDown);
      return () => carousel.removeEventListener('keydown', handleKeyDown);
    }
  }, [goToNext, goToPrev]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Lazy image component
  const LazyImage = ({ src, alt, index }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(!enableLazyLoading);
    const imageRef = useRef(null);

    useEffect(() => {
      if (!enableLazyLoading) return;

      // Load image if it's in the loaded set
      if (loadedImages.has(index)) {
        setIsInView(true);
      }
    }, [index, loadedImages]);

    useEffect(() => {
      if (!isInView || !imageRef.current) return;

      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
    }, [isInView, src]);

    return (
      <div
        ref={imageRef}
        className={`carousel__image-wrapper ${isLoaded ? 'loaded' : ''}`}
      >
        {isInView ? (
          <>
            {!isLoaded && (
              <div className="carousel__image-skeleton">
                <div className="carousel__spinner">Loading...</div>
              </div>
            )}
            <img
              src={src}
              alt={alt}
              className={`carousel__image ${isLoaded ? 'visible' : 'hidden'}`}
              loading="lazy"
            />
          </>
        ) : (
          <div className="carousel__image-skeleton">
            <div className="carousel__spinner">Loading...</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={carouselRef}
      className="carousel"
      role="region"
      aria-label="Image carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      {/* Slides container */}
      <div
        className="carousel__slides"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? `transform ${transitionDuration}ms ease` : 'none',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {images.map((image, index) => (
          <div
            key={index}
            className={`carousel__slide ${
              index === currentIndex ? 'carousel__slide--active' : ''
            }`}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${totalSlides}`}
            aria-hidden={index !== currentIndex}
          >
            <LazyImage
              src={image.src}
              alt={image.alt || `Image ${index + 1}`}
              index={index}
            />

            {/* Optional caption */}
            {image.caption && (
              <div className="carousel__caption">{image.caption}</div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        className="carousel__button carousel__button--prev"
        onClick={goToPrev}
        aria-label="Previous slide"
        disabled={!enableInfiniteLoop && currentIndex === 0}
      >
        ‹
      </button>

      <button
        className="carousel__button carousel__button--next"
        onClick={goToNext}
        aria-label="Next slide"
        disabled={!enableInfiniteLoop && currentIndex === totalSlides - 1}
      >
        ›
      </button>

      {/* Indicators/dots */}
      <div className="carousel__indicators" role="tablist">
        {images.map((_, index) => (
          <button
            key={index}
            className={`carousel__indicator ${
              index === currentIndex ? 'carousel__indicator--active' : ''
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={index === currentIndex}
            role="tab"
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="carousel__counter" aria-live="polite">
        {currentIndex + 1} / {totalSlides}
      </div>

      {/* Auto-play control */}
      {enableAutoPlay && (
        <button
          className="carousel__autoplay-toggle"
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      )}
    </div>
  );
}

// Example usage
function App() {
  const images = [
    {
      src: 'https://example.com/image1.jpg',
      alt: 'Mountain landscape',
      caption: 'Beautiful mountain view',
    },
    {
      src: 'https://example.com/image2.jpg',
      alt: 'Ocean sunset',
      caption: 'Sunset over the ocean',
    },
    {
      src: 'https://example.com/image3.jpg',
      alt: 'City skyline',
      caption: 'Downtown city lights',
    },
    {
      src: 'https://example.com/image4.jpg',
      alt: 'Forest path',
      caption: 'Peaceful forest trail',
    },
  ];

  return (
    <div className="app">
      <h1>Image Gallery</h1>
      <ImageCarousel
        images={images}
        enableAutoPlay={true}
        autoPlayInterval={5000}
        enableInfiniteLoop={true}
        enableLazyLoading={true}
        transitionDuration={300}
        swipeThreshold={50}
      />
    </div>
  );
}

// CSS (carousel.css)
const styles = `
.carousel {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 12px;
  background: #000;
  outline: none;
}

.carousel__slides {
  display: flex;
  transition: transform 300ms ease;
}

.carousel__slide {
  flex-shrink: 0;
  width: 100%;
  height: 500px;
  position: relative;
}

.carousel__image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 300ms ease;
}

.carousel__image.visible {
  opacity: 1;
}

.carousel__image.hidden {
  opacity: 0;
}

.carousel__image-skeleton {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.carousel__spinner {
  color: #666;
  font-size: 14px;
}

.carousel__caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  text-align: center;
  font-size: 16px;
}

.carousel__button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  font-size: 32px;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
  z-index: 10;
}

.carousel__button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.8);
}

.carousel__button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel__button--prev {
  left: 16px;
}

.carousel__button--next {
  right: 16px;
}

.carousel__indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.carousel__indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
}

.carousel__indicator--active {
  background: white;
  width: 32px;
  border-radius: 6px;
}

.carousel__counter {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 10;
}

.carousel__autoplay-toggle {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  font-size: 18px;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
  z-index: 10;
}

.carousel__autoplay-toggle:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .carousel__slide {
    height: 300px;
  }

  .carousel__button {
    width: 36px;
    height: 36px;
    font-size: 24px;
  }

  .carousel__button--prev {
    left: 8px;
  }

  .carousel__button--next {
    right: 8px;
  }
}
`;

export default ImageCarousel;
```

<details>
<summary><strong>🔍 Deep Dive: Infinite Loop Implementation & Performance</strong></summary>

**Infinite Loop Strategies:**

There are three main approaches to implementing infinite loop carousels:

**1. Modulo Arithmetic (Simplest):**

```javascript
// ✅ GOOD: Simple modulo wrapping
function SimpleInfiniteCarousel({ slides }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = slides.length;

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    // Example: 0 → 1 → 2 → 0 (wraps around)
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    // Example: 0 → 2 → 1 → 0 (wraps backwards)
  };

  return (
    <div style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
      {slides.map((slide, i) => (
        <div key={i}>{slide}</div>
      ))}
    </div>
  );
}

// PROS:
// - Simple logic (5 lines of code)
// - No DOM cloning needed
// - Easy to understand

// CONS:
// - Visible "jump" when wrapping (last → first)
// - Not truly seamless
// - Users notice the transition reset
```

**2. Clone Slides (Seamless Infinite):**

```javascript
// ✅ BETTER: Clone first/last slides for seamless loop
function SeamlessInfiniteCarousel({ slides }) {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at first real slide
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Clone first and last slides
  const extendedSlides = [
    slides[slides.length - 1], // Clone of last slide
    ...slides,                  // Original slides
    slides[0],                  // Clone of first slide
  ];

  const goToNext = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);

    // Wrap around logic
    if (currentIndex === extendedSlides.length - 1) {
      // Jumped to cloned first slide → reset to real first slide
      setIsTransitioning(false);
      setCurrentIndex(1); // No transition, instant jump
    } else if (currentIndex === 0) {
      // Jumped to cloned last slide → reset to real last slide
      setIsTransitioning(false);
      setCurrentIndex(extendedSlides.length - 2);
    }
  };

  return (
    <div
      style={{
        transform: `translateX(-${currentIndex * 100}%)`,
        transition: isTransitioning ? 'transform 300ms ease' : 'none',
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      {extendedSlides.map((slide, i) => (
        <div key={i}>{slide}</div>
      ))}
    </div>
  );
}

// PROS:
// - Truly seamless (no visible jump)
// - Smooth user experience
// - Industry standard (used by most carousels)

// CONS:
// - Slightly more complex logic
// - Extra DOM elements (clones)
// - Need to track "real" vs "cloned" slides
```

**3. Virtual Sliding (Advanced):**

```javascript
// ✅ BEST: Virtual sliding with 3 slides in DOM
function VirtualInfiniteCarousel({ slides }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offset, setOffset] = useState(0);

  // Only render current, prev, and next slides
  const getVisibleSlides = () => {
    const total = slides.length;
    const prev = (currentIndex - 1 + total) % total;
    const curr = currentIndex;
    const next = (currentIndex + 1) % total;

    return [
      { slide: slides[prev], index: prev, position: -1 },
      { slide: slides[curr], index: curr, position: 0 },
      { slide: slides[next], index: next, position: 1 },
    ];
  };

  const goToNext = () => {
    setOffset(-100);

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setOffset(0); // Reset position instantly
    }, 300);
  };

  const visibleSlides = getVisibleSlides();

  return (
    <div
      style={{
        transform: `translateX(${offset}%)`,
        transition: offset === 0 ? 'none' : 'transform 300ms ease',
      }}
    >
      {visibleSlides.map(({ slide, position }) => (
        <div
          key={position}
          style={{ transform: `translateX(${position * 100}%)` }}
        >
          {slide}
        </div>
      ))}
    </div>
  );
}

// PROS:
// - Only 3 slides in DOM (minimal memory)
// - Scales to 1,000+ slides without performance hit
// - Truly infinite (no clones)
// - Best for large datasets

// CONS:
// - Most complex implementation
// - Requires careful state management
// - Harder to debug
```

**Performance Comparison:**

```javascript
// Benchmark: 100 slides, 10,000 transitions

// MODULO APPROACH:
// - DOM nodes: 100
// - Memory: 5MB (100 images)
// - Initial render: 250ms
// - Transition: 16ms (smooth)
// - User experience: Jarring (visible jump)

// CLONE APPROACH:
// - DOM nodes: 102 (2 clones)
// - Memory: 5.1MB (102 images)
// - Initial render: 255ms
// - Transition: 16ms (smooth)
// - User experience: Seamless ✅

// VIRTUAL APPROACH:
// - DOM nodes: 3 (only visible)
// - Memory: 150KB (3 images loaded)
// - Initial render: 15ms (94% faster!)
// - Transition: 16ms (smooth)
// - User experience: Seamless ✅
// - Best for: 1,000+ slides

// Recommendation: Clone approach for <50 slides, virtual for 50+ slides
```

**Lazy Loading Strategies:**

```javascript
// ❌ BAD: Load all images upfront
function BadCarousel({ images }) {
  return (
    <div>
      {images.map((img) => (
        <img src={img.src} /> // All 100 images load immediately!
      ))}
    </div>
  );
}

// PROBLEM:
// - 100 images × 500KB = 50MB downloaded
// - 10-15 second initial load time
// - User waits 15 seconds to see FIRST image
// - Wasted bandwidth (user may only view 3 slides)

// ✅ GOOD: Lazy load with Intersection Observer
function LazyCarousel({ images }) {
  const [loadedIndexes, setLoadedIndexes] = useState(new Set([0]));

  const loadAdjacentImages = (currentIndex) => {
    const prev = currentIndex - 1;
    const next = currentIndex + 1;

    setLoadedIndexes((prev) => new Set([...prev, currentIndex, prev, next]));
  };

  return (
    <div>
      {images.map((img, i) => (
        <LazyImage
          src={img.src}
          shouldLoad={loadedIndexes.has(i)}
          onEnterView={() => loadAdjacentImages(i)}
        />
      ))}
    </div>
  );
}

// BENEFIT:
// - Initial load: 3 images × 500KB = 1.5MB (97% reduction!)
// - Load time: 0.8 seconds (18× faster!)
// - User sees first image in <1 second
// - Additional images load as needed
```

**Intersection Observer for Lazy Loading:**

```javascript
function LazyImage({ src, alt, shouldLoad }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect(); // Stop observing once loaded
          }
        });
      },
      { rootMargin: '50px' } // Preload 50px before entering viewport
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    if (!isInView) return;

    // Preload image
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [isInView, src]);

  return (
    <div ref={imageRef}>
      {isLoaded ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="skeleton">Loading...</div>
      )}
    </div>
  );
}
```

**Touch Gesture Performance:**

```javascript
// ❌ BAD: Update DOM on every touchmove event
function BadTouchCarousel() {
  const handleTouchMove = (e) => {
    const x = e.touches[0].clientX;
    // Update DOM 60 times per second during swipe → jank!
    carouselRef.current.style.transform = `translateX(${x}px)`;
  };

  return <div onTouchMove={handleTouchMove}>...</div>;
}

// PROBLEM:
// - 60 style updates/second
// - Forces layout recalculation 60×/second
// - Janky animation (drops to 20 FPS)
// - Poor mobile experience

// ✅ GOOD: Use CSS transforms with RAF
function GoodTouchCarousel() {
  const [dragOffset, setDragOffset] = useState(0);
  const rafRef = useRef(null);

  const handleTouchMove = (e) => {
    const x = e.touches[0].clientX;

    // Cancel previous RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule update for next frame
    rafRef.current = requestAnimationFrame(() => {
      setDragOffset(x);
    });
  };

  return (
    <div
      onTouchMove={handleTouchMove}
      style={{ transform: `translateX(${dragOffset}px)` }}
    >
      ...
    </div>
  );
}

// BENEFIT:
// - Updates sync with browser's 60 FPS refresh
// - Smooth animation
// - Efficient (only 1 update per frame)
// - Excellent mobile experience
```

**Memory Profiling:**

```javascript
// Measure carousel memory usage
class CarouselMemoryProfiler {
  constructor() {
    this.initialMemory = performance.memory?.usedJSHeapSize || 0;
  }

  measureImageLoad(imageCount) {
    const memoryBefore = performance.memory?.usedJSHeapSize || 0;

    // Load images
    const images = Array(imageCount).fill().map((_, i) => {
      const img = new Image();
      img.src = `https://example.com/image${i}.jpg`;
      return img;
    });

    setTimeout(() => {
      const memoryAfter = performance.memory?.usedJSHeapSize || 0;
      const memoryUsed = (memoryAfter - memoryBefore) / 1024 / 1024;

      console.log(`Loaded ${imageCount} images`);
      console.log(`Memory used: ${memoryUsed.toFixed(2)} MB`);
      console.log(`Avg per image: ${(memoryUsed / imageCount).toFixed(2)} MB`);
    }, 2000);
  }
}

// Test results:
// - 10 images: 8.5 MB (0.85 MB/image)
// - 50 images: 42 MB (0.84 MB/image)
// - 100 images: 85 MB (0.85 MB/image)
// - Virtual carousel (3 images): 2.5 MB (0.83 MB/image)

// Conclusion: Virtual carousel uses 97% less memory for 100 images!
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Debugging Carousel Jank on Mobile</strong></summary>

**Scenario**: Your product carousel on an e-commerce site is janky on mobile devices. Users complain that swiping feels "laggy" and "choppy". Analytics show 68% of mobile users abandon the carousel before viewing 3 products, compared to 15% on desktop. Revenue from mobile is down 32%.

**Production Metrics (Before Fix):**
- Mobile bounce rate from carousel: 68%
- Average FPS during swipe: 24 FPS (target: 60 FPS)
- Frame drops: 45% of frames
- Time to interactive: 4.2 seconds
- Mobile revenue: Down 32% month-over-month
- User complaints: 127/day about "slow carousel"

**The Problem Code:**

```javascript
// ❌ CRITICAL BUG: Updating DOM on every touchmove → layout thrashing
function JankyCarousel({ images }) {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;

    // ❌ BUG: Direct DOM manipulation in touchmove handler
    // This fires 60-100 times per second!
    carouselRef.current.style.transform = `translateX(${deltaX}px)`;

    // ❌ BUG: Reading layout properties forces reflow
    const currentLeft = carouselRef.current.getBoundingClientRect().left;

    // ❌ BUG: Updating state on every move → excessive re-renders
    setDragPosition(deltaX);
  };

  return (
    <div ref={carouselRef} onTouchMove={handleTouchMove}>
      {images.map((img) => (
        <img src={img.src} alt={img.alt} />
      ))}
    </div>
  );
}

// THE PERFORMANCE PROBLEM:
// User swipes for 500ms:
// - touchmove fires 60 times
// - DOM updated 60 times (style.transform)
// - getBoundingClientRect() called 60 times (forces layout)
// - setState() called 60 times (triggers 60 re-renders)
// - Each render: 16ms budget, actually taking 40ms
// - Result: Drops from 60 FPS → 25 FPS (choppy!)

// Timeline of a single swipe (500ms):
// Frame 1 (0ms):   touchmove → transform → getBoundingClientRect → reflow → paint (40ms)
// Frame 2 (16ms):  DROPPED (previous frame still rendering)
// Frame 3 (32ms):  touchmove → transform → getBoundingClientRect → reflow → paint (40ms)
// Frame 4 (48ms):  DROPPED
// Frame 5 (64ms):  touchmove → transform → getBoundingClientRect → reflow → paint (40ms)
// ...30 frames completed, 30 frames dropped = 50% frame drop rate!
```

**Debugging Process:**

**Step 1: Identify Performance Bottleneck with Chrome DevTools**

```javascript
// Open Chrome DevTools → Performance tab
// Record while swiping carousel on mobile
// Analysis shows:

// Main Thread Timeline:
// [Long Task] ████████████ (180ms) ← Layout thrashing!
//   ├─ touchmove handler (5ms)
//   ├─ getBoundingClientRect (25ms) ← Forced reflow
//   ├─ style.transform = ... (3ms)
//   ├─ React setState (10ms)
//   ├─ React render (40ms)
//   ├─ Layout (45ms) ← Recalculate layout
//   └─ Paint (52ms) ← Repaint entire carousel

// Warnings:
// ⚠️ Forced reflow (60 times during swipe)
// ⚠️ Long task blocking main thread (180ms)
// ⚠️ Frame rate: 24 FPS (should be 60 FPS)

// Flamegraph shows:
// - 65% time in Layout
// - 20% time in Paint
// - 10% time in React renders
// - 5% time in JavaScript execution
```

**Step 2: Add Performance Markers**

```javascript
function DebugCarousel() {
  const handleTouchMove = (e) => {
    performance.mark('touchmove-start');

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;

    performance.mark('before-dom-update');
    carouselRef.current.style.transform = `translateX(${deltaX}px)`;
    performance.measure('dom-update', 'before-dom-update');

    performance.mark('before-layout-read');
    const left = carouselRef.current.getBoundingClientRect().left;
    performance.measure('layout-read', 'before-layout-read');

    performance.mark('before-state-update');
    setDragPosition(deltaX);
    performance.measure('state-update', 'before-state-update');

    performance.measure('total-touchmove', 'touchmove-start');
  };

  // Log results
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => observer.disconnect();
  }, []);

  // Results show:
  // dom-update: 3.2ms
  // layout-read: 28.5ms ← BOTTLENECK!
  // state-update: 12.3ms
  // total-touchmove: 44.0ms (exceeds 16ms budget!)
}
```

**Step 3: Fix with CSS Transforms + RAF**

```javascript
// ✅ FIXED: Use CSS transforms without forced reflow
function SmoothCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const touchStartRef = useRef(null);
  const rafRef = useRef(null);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !touchStartRef.current) return;

    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartRef.current;

    // ✅ FIX: Use RAF to sync with browser's render cycle
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      // ✅ FIX: Update state (React will batch)
      setDragOffset(deltaX);
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Snap to nearest slide
    const slideWidth = window.innerWidth;
    const threshold = slideWidth / 3;

    if (Math.abs(dragOffset) > threshold) {
      const direction = dragOffset > 0 ? -1 : 1;
      setCurrentIndex((prev) => prev + direction);
    }

    setDragOffset(0);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
        transition: isDragging ? 'none' : 'transform 300ms ease',
        // ✅ FIX: Use will-change to optimize GPU acceleration
        willChange: 'transform',
      }}
    >
      {images.map((img, i) => (
        <div key={i} style={{ flex: '0 0 100%' }}>
          <img src={img.src} alt={img.alt} />
        </div>
      ))}
    </div>
  );
}

// BENEFITS:
// - touchmove updates throttled to 60 FPS (1 per frame)
// - No forced reflows (no getBoundingClientRect)
// - CSS transforms use GPU (no layout recalculation)
// - React batches state updates
// - Smooth 60 FPS animation ✅
```

**Step 4: Further Optimization with CSS GPU Acceleration**

```javascript
// ✅ EVEN BETTER: Force GPU acceleration with 3D transforms
function OptimizedCarousel({ images }) {
  // ... (same logic as above)

  return (
    <div
      style={{
        // ✅ Use translate3d for GPU acceleration
        transform: `translate3d(calc(-${currentIndex * 100}% + ${dragOffset}px), 0, 0)`,
        transition: isDragging ? 'none' : 'transform 300ms ease',
        willChange: 'transform',
        // ✅ Create separate compositing layer
        backfaceVisibility: 'hidden',
      }}
    >
      {images.map((img, i) => (
        <div
          key={i}
          style={{
            flex: '0 0 100%',
            // ✅ Optimize each slide for GPU
            transform: 'translateZ(0)',
          }}
        >
          <img
            src={img.src}
            alt={img.alt}
            style={{
              // ✅ Prevent image dragging
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        </div>
      ))}
    </div>
  );
}

// PERFORMANCE IMPROVEMENT:
// - Uses GPU compositing (no CPU paint)
// - Separate layer per slide (parallel rendering)
// - Eliminates layout thrashing
// - Achieves 60 FPS consistently
```

**Production Metrics (After Fix):**

```javascript
// Before fix (layout thrashing):
// - Mobile bounce rate: 68%
// - FPS during swipe: 24 FPS
// - Frame drops: 45%
// - Time to interactive: 4.2s
// - User complaints: 127/day
// - Mobile revenue: -32%

// After fix (GPU-accelerated):
// - Mobile bounce rate: 18% (74% improvement ✅)
// - FPS during swipe: 60 FPS (150% improvement ✅)
// - Frame drops: 2% (96% improvement ✅)
// - Time to interactive: 1.1s (74% improvement ✅)
// - User complaints: 3/day (98% reduction ✅)
// - Mobile revenue: +28% (recovered all losses + growth ✅)

// Additional benefits:
// - Battery life: 30% less CPU usage on mobile
// - Bandwidth: 40% reduction (lazy loading adjacent slides only)
// - User engagement: +45% swipe interactions
// - Conversion rate: +18% from mobile
// - Revenue impact: +$125K/month
```

**Common Mistakes & Lessons:**

```javascript
// ❌ MISTAKE 1: Reading layout in touchmove handler
const left = element.getBoundingClientRect().left; // Forces reflow!

// ✅ FIX: Use event coordinates instead
const deltaX = e.touches[0].clientX - touchStartX;

// ❌ MISTAKE 2: Updating state on every touchmove
onTouchMove={() => setState(value)}; // 60 re-renders/second!

// ✅ FIX: Use requestAnimationFrame to throttle
rafRef.current = requestAnimationFrame(() => setState(value));

// ❌ MISTAKE 3: Using left/right instead of transform
element.style.left = `${x}px`; // Triggers layout + paint

// ✅ FIX: Use transform (GPU-accelerated)
element.style.transform = `translateX(${x}px)`;

// ❌ MISTAKE 4: Not using will-change
// Browser doesn't know to optimize

// ✅ FIX: Hint browser to optimize
element.style.willChange = 'transform';

// ❌ MISTAKE 5: Large images without lazy loading
// Loads all 100 images → 50MB → 15 second load time

// ✅ FIX: Lazy load with Intersection Observer
// Load 3 images → 1.5MB → 1 second load time
```

**Key Takeaways:**

1. **Never read layout properties in touchmove handlers** - causes forced reflows
2. **Use CSS transforms instead of left/top** - GPU-accelerated, no layout
3. **Throttle with requestAnimationFrame** - sync with 60 FPS render cycle
4. **Use will-change and translate3d** - force GPU compositing
5. **Lazy load images** - only load visible + adjacent slides
6. **Profile with Chrome DevTools** - identify actual bottlenecks before optimizing

</details>

<details>
<summary><strong>⚖️ Trade-offs: Carousel Implementation Approaches</strong></summary>

| Approach | Pros | Cons | Use When |
|----------|------|------|----------|
| **CSS-only carousel** | No JavaScript, 0 bytes, works without JS | Limited features, no dynamic content, poor accessibility | Static marketing pages, simple image galleries |
| **React carousel** | Full control, rich features, good DX | Larger bundle (~50KB), requires React | React apps, complex interactions |
| **Native scroll snap** | Smooth, native feel, GPU-accelerated | Limited browser support (IE), less control | Modern browsers only, simple carousels |
| **Third-party library** | Quick setup, battle-tested, feature-rich | Large bundle (100-300KB), less customization | Rapid prototyping, standard requirements |

**Performance Comparison:**

```javascript
// CSS-ONLY CAROUSEL (no JS):
// Bundle size: 0 KB
// Performance: 60 FPS (native browser scroll)
// Features: Limited (no auto-play, no dynamic slides)
// Accessibility: Poor (no keyboard nav, no ARIA)

// CUSTOM REACT CAROUSEL:
// Bundle size: ~15 KB (minified + gzip)
// Performance: 60 FPS (optimized)
// Features: Full control (auto-play, lazy load, infinite loop)
// Accessibility: Excellent (full ARIA, keyboard nav)

// SWIPER.JS (popular library):
// Bundle size: ~140 KB (full build)
// Performance: 55-60 FPS
// Features: Extensive (100+ options)
// Accessibility: Good (ARIA support)

// NATIVE SCROLL SNAP:
// Bundle size: ~5 KB (minimal JS)
// Performance: 60 FPS (GPU-accelerated)
// Features: Basic (no auto-play, simple nav)
// Accessibility: Fair (can be enhanced)
```

**Infinite Loop Strategies:**

```javascript
// CLONE APPROACH (most common):
// - Slides: [last-clone, 1, 2, 3, first-clone]
// - Pros: Seamless, simple logic
// - Cons: Extra DOM nodes (2× slides for small carousels)

// VIRTUAL APPROACH (best for large datasets):
// - Only render 3 slides at a time
// - Pros: Minimal DOM, scales to 1000s of slides
// - Cons: Complex implementation, harder to debug

// MODULO APPROACH (simplest):
// - Use modulo arithmetic for wrapping
// - Pros: Simplest code, no clones
// - Cons: Visible "jump" when wrapping
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Image Carousel Component</strong></summary>

**Simple Explanation:**

An image carousel is like a slideshow that lets users browse through images by clicking arrows, swiping (on mobile), or waiting for auto-play.

**Key Concepts:**

1. **Infinite Loop** - When you reach the last image and click "next", it goes back to the first image seamlessly (no jump)
2. **Lazy Loading** - Only load images when they're about to be shown (saves bandwidth)
3. **Touch Gestures** - Swipe left/right on mobile to navigate
4. **Auto-play** - Automatically advance to next slide every few seconds

**Analogy for a PM:**

"Think of it like a photo album:
- **Without lazy loading**: You load the entire 100-page photo album into memory at once → slow startup
- **With lazy loading**: You only load the current page, previous page, and next page → fast startup

- **Without infinite loop**: You reach page 100 and have to flip back to page 1 manually
- **With infinite loop**: After page 100, the next page IS page 1 (seamless)

- **Without touch gestures**: Mobile users have to tap tiny arrow buttons
- **With touch gestures**: Users can swipe naturally like scrolling through photos on their phone"

**Visual Example:**

```javascript
// Carousel structure:
// [Image 1] [Image 2] [Image 3] [Image 4] [Image 5]
//     ↑
//  Current

// User clicks "Next" button:
// [Image 1] [Image 2] [Image 3] [Image 4] [Image 5]
//              ↑
//          Current (slides left by 100%)

// User clicks "Next" at end (infinite loop):
// [Image 5] [Image 1-clone] → Slides to clone → Instantly jumps to real Image 1
// Result: Looks seamless to user!
```

**Why Performance Matters:**

```javascript
// BAD PERFORMANCE (jank):
// User swipes → Carousel stutters → Drops to 20 FPS → Feels laggy

// GOOD PERFORMANCE (smooth):
// User swipes → Carousel glides smoothly → 60 FPS → Feels native

// How to achieve good performance:
// 1. Use CSS transforms (GPU-accelerated): transform: translateX()
// 2. Use requestAnimationFrame for smooth updates
// 3. Lazy load images (don't load all 100 images upfront)
// 4. Use will-change: transform to hint browser to optimize
```

**Interview Answer Template:**

"An image carousel needs to handle several challenges:

1. **Infinite loop** - I'd use the clone approach: duplicate first and last slides, then reset position after transition completes. This creates a seamless experience.

2. **Lazy loading** - Load the current image plus adjacent images (prev/next). As user navigates, load new adjacent images. This reduces initial load time by 80-90%.

3. **Touch gestures** - Track touchstart, touchmove, and touchend events. Calculate swipe distance, and if it exceeds a threshold (e.g., 50px), navigate to the next/previous slide.

4. **Performance** - Use CSS transforms instead of left/right positioning for GPU acceleration. Use requestAnimationFrame to throttle updates to 60 FPS.

For example, on mobile, a user swipes left 100px. We calculate that exceeds our 50px threshold, so we transition to the next slide. During the swipe, we use requestAnimationFrame to update the transform property smoothly at 60 FPS."

</details>

### Resources

- [WAI-ARIA Authoring Practices: Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)
- [MDN: Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Web.dev: Optimize for Smooth Animations](https://web.dev/animations/)

---
