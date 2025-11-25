# React Custom Hooks - Window Size Tracking

## Question 1: How do you create a `useWindowSize` custom hook that tracks window dimensions?

**Answer:**

A `useWindowSize` hook encapsulates the logic for tracking the browser window's width and height, providing responsive components with dimension updates when the window resizes. This is essential for responsive design, breakpoint detection, and adaptive layouts.

The basic implementation involves storing window dimensions in state and updating them via a resize event listener. The hook returns an object with `width` and `height` properties that update whenever the user resizes their browser window.

Key considerations:
1. **Initial value**: Get dimensions on mount to avoid SSR issues
2. **Event listener cleanup**: Remove listener on unmount to prevent memory leaks
3. **Debouncing**: Optionally throttle resize events (can fire 100+ times/sec)
4. **SSR safety**: Return undefined or default values on server
5. **Dependency array**: No dependencies needed since listener re-attaches on every render (if not memoized)

```javascript
// Basic implementation
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Cleanup event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Usage in component
function ResponsiveLayout() {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>Window dimensions: {width}x{height}</p>
      {width < 768 && <MobileMenu />}
      {width >= 768 && <DesktopMenu />}
    </div>
  );
}
```

This pattern is fundamental for responsive React applications and is widely used in production applications. The hook successfully separates dimension-tracking logic from UI components, making the code cleaner and more testable.

---

<details>
<summary><strong>🔍 Deep Dive: Event Listener Optimization and Performance Implications</strong></summary>

**The Resize Event Performance Crisis**

The resize event is one of the most problematic events to handle in modern web applications. When a user resizes their browser window, the resize event can fire 100-200+ times per second, causing severe performance degradation:

```javascript
// ❌ PROBLEMATIC: Naive implementation fires setState on every resize
function BadUseWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      // This setState call triggers on EVERY resize event
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Performance impact test:
// - Window resize from 800px to 600px
// - Resize events fired: 187 events
// - setState calls: 187 times
// - Re-renders triggered: 187 times
// - Time elapsed: 420ms
// - CPU time: ~450ms (blocking)
// - Components re-rendering: ALL components using this hook
```

**The Debounce Solution with RequestAnimationFrame**

Instead of responding to every single resize event, we can batch updates using `requestAnimationFrame` (RAF), which fires at most once per frame (16.67ms at 60fps):

```javascript
// ✅ GOOD: Debounced with requestAnimationFrame
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : undefined,
    height: typeof window !== 'undefined' ? window.innerHeight : undefined
  });

  useEffect(() => {
    let frameId = null;

    const handleResize = () => {
      // Cancel previous frame request
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      // Schedule update for next frame
      frameId = requestAnimationFrame(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return windowSize;
}

// Performance impact with RAF debounce:
// - Window resize from 800px to 600px
// - Resize events fired: 187 events
// - setState calls: 2-3 times (batched to frame rate)
// - Re-renders triggered: 2-3 times
// - Time elapsed: 420ms
// - CPU time: ~20ms (non-blocking)
// - Improvement: 22x better performance!
```

**Advanced Debouncing with Manual Throttle**

For even finer control, implement manual debouncing with a time delay:

```javascript
// ✅ EXCELLENT: Custom debounce with configurable delay
function useWindowSize(debounceDelay = 150) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : undefined,
    height: typeof window !== 'undefined' ? window.innerHeight : undefined
  });

  useEffect(() => {
    let timeoutId = null;

    const handleResize = () => {
      // Clear previous timeout
      clearTimeout(timeoutId);

      // Schedule update after delay
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, debounceDelay);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [debounceDelay]);

  return windowSize;
}

// Different debounce strategies:
// - debounceDelay=0: Immediate (use RAF instead)
// - debounceDelay=50: Aggressive (update at ~20fps)
// - debounceDelay=150: Balanced (default for most apps)
// - debounceDelay=300: Conservative (update at ~3fps)
```

**ResizeObserver Alternative**

`ResizeObserver` provides a more precise alternative that fires when an element's dimensions change, not when the window resizes. This is better for monitoring specific DOM elements:

```javascript
// ✅ MODERN: Using ResizeObserver instead of window resize
function useElementSize(ref) {
  const [size, setSize] = useState({
    width: undefined,
    height: undefined
  });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return size;
}

// Usage for element-specific sizing
function ResponsiveContainer() {
  const containerRef = useRef(null);
  const { width, height } = useElementSize(containerRef);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <p>Container dimensions: {width}x{height}</p>
      {width < 600 && <SingleColumnLayout />}
      {width >= 600 && <MultiColumnLayout />}
    </div>
  );
}

// ResizeObserver benefits:
// - Only fires when observed element's size changes
// - Independent of window resize (container could resize from CSS change)
// - More accurate for responsive design
// - Better performance for multiple elements
```

**Composition: Window Size + Element Size**

Create a more sophisticated version that supports both:

```javascript
// ✅ FLEXIBLE: Support both window and element sizing
function useSize(ref = null) {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : undefined,
    height: typeof window !== 'undefined' ? window.innerHeight : undefined
  });

  useEffect(() => {
    let frameId = null;

    if (!ref) {
      // Monitor window resize
      const handleResize = () => {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => {
          setSize({
            width: window.innerWidth,
            height: window.innerHeight
          });
        });
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (frameId) cancelAnimationFrame(frameId);
      };
    } else {
      // Monitor element resize
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      });

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }
  }, [ref]);

  return size;
}

// Usage examples
function WindowSizeExample() {
  const windowSize = useSize(); // No ref = window size
  return <div>Window: {windowSize.width}x{windowSize.height}</div>;
}

function ElementSizeExample() {
  const containerRef = useRef(null);
  const elementSize = useSize(containerRef); // With ref = element size
  return (
    <div ref={containerRef}>
      Container: {elementSize.width}x{elementSize.height}
    </div>
  );
}
```

**Memory and Performance Characteristics**

Analyzing resource usage patterns:

```javascript
// Memory impact analysis
// 1. Event listeners: 1 per hook instance = minimal (~4KB)
// 2. State objects: { width, height } = minimal (~100 bytes)
// 3. Closures: Captures setWindowSize = minimal (~200 bytes)
// Total per hook: ~5KB

// Performance impact test results:
// Naive implementation: 187 renders = 58.4ms CPU time per resize
// RAF debounce: 2-3 renders = 3.2ms CPU time per resize
// Manual debounce 150ms: 1-2 renders = 1.8ms CPU time per resize
// ResizeObserver: 1-2 renders = 2.1ms CPU time per element change

// Recommendation by use case:
// - Window responsive: Use RAF debounce (best balance)
// - Element monitoring: Use ResizeObserver (most accurate)
// - Slow devices/animations: Use 300ms debounce
// - Real-time charts: Use RAF debounce or ResizeObserver
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Portrait/Landscape Orientation Change Causing State Sync Issues</strong></summary>

**The Problem:**

A mobile e-commerce app using `useWindowSize` to switch between portrait and landscape layouts was experiencing critical bugs. Users reported:

1. Layout not switching when rotating device from portrait to landscape
2. Incorrect dimensions being rendered (old width with new height)
3. Occasional "infinite re-renders" freezing the app
4. Touch event listeners attached to wrong layout
5. Performance degradation after 5+ orientation changes

**Investigation:**

```javascript
// The problematic implementation
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      // ❌ ISSUE 1: No debounce
      // - Orientation change fires ~100+ resize events
      // - Each event triggers setState and re-render
      // - Can cause UI thrashing
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // ❌ ISSUE 2: Missing orientationchange event
    // - Mobile devices fire 'orientationchange' in addition to 'resize'
    // - Window might not have final dimensions during 'resize'
    // - Need to listen to both events

    return () => window.removeEventListener('resize', handleResize);
  }, []); // ✅ Correct: empty deps

  return size;
}

// Component using hook
function EcommerceApp() {
  const { width, height } = useWindowSize();
  const isPortrait = height > width;

  // ❌ ISSUE 3: Event listener lifecycle mismatch
  useEffect(() => {
    const handleTouchStart = (e) => {
      // Uses 'isPortrait' from closure
      // But if resize happens, useWindowSize updates
      // But touch handler still has old 'isPortrait' value!
      if (isPortrait) {
        // Handle portrait touch
      } else {
        // Handle landscape touch
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    return () => window.removeEventListener('touchstart', handleTouchStart);
  }, []); // ❌ Missing dependency: isPortrait

  return (
    <div>
      {isPortrait ? <PortraitLayout width={width} height={height} /> : <LandscapeLayout width={width} height={height} />}
    </div>
  );
}

// Metrics from production:
// - Orientation changes per session: 4-5 average
// - Re-renders per orientation change: 50-100 (should be 1-2)
// - Time to switch layout: 200-500ms (should be <50ms)
// - Memory leak detected: Layout didn't clean up properly
// - User complaints: 342 reports of "frozen after rotation"
```

**Root Cause Analysis:**

1. **Multiple resize events during orientation change**: Mobile fires 10-50 resize events when rotating
2. **Missing `orientationchange` event**: Should use both `resize` and `orientationchange`
3. **RAF/debounce missing**: No optimization for rapid fire events
4. **Stale closure in event handlers**: Touch handlers captured old dimensions
5. **No cleanup of dependent listeners**: Touch listeners didn't update dependency

**The Solution:**

```javascript
// ✅ CORRECT: Production-ready useWindowSize for mobile
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : undefined,
    height: typeof window !== 'undefined' ? window.innerHeight : undefined
  });

  useEffect(() => {
    let frameId = null;

    const handleResize = () => {
      // Debounce with RAF to batch multiple events
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      });
    };

    // Listen to both resize and orientationchange
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Get initial size
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return windowSize;
}

// ✅ CORRECT: Component with proper dependency management
function EcommerceApp() {
  const { width, height } = useWindowSize();
  const isPortrait = height > width;

  // ✅ Proper cleanup of orientation-dependent handlers
  useEffect(() => {
    const handleTouchStart = (e) => {
      // No closure over isPortrait
      // Instead, check current state
      if (window.innerHeight > window.innerWidth) {
        // Portrait touch
      } else {
        // Landscape touch
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    return () => window.removeEventListener('touchstart', handleTouchStart);
  }, []); // No dependencies needed since we check dimensions directly

  // ✅ Separate layout update from dimension tracking
  useEffect(() => {
    // This runs whenever isPortrait changes
    // Perfect place to notify other systems
    document.documentElement.setAttribute('data-orientation', isPortrait ? 'portrait' : 'landscape');
  }, [isPortrait]);

  return (
    <div data-layout={isPortrait ? 'portrait' : 'landscape'}>
      {isPortrait ? <PortraitLayout width={width} height={height} /> : <LandscapeLayout width={width} height={height} />}
    </div>
  );
}

// Alternative: Using orientationchange event directly for better UX
function useOrientation() {
  const [orientation, setOrientation] = useState(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setOrientation(newOrientation);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  return orientation;
}

// Usage
function App() {
  const orientation = useOrientation();
  return <div>{orientation === 'portrait' ? <PortraitLayout /> : <LandscapeLayout />}</div>;
}
```

**Metrics After Fix:**

- **Re-renders per orientation change**: 1-2 (was 50-100) ✅
- **Time to switch layout**: <50ms (was 200-500ms) ✅
- **Memory leaks**: 0 (was detected before) ✅
- **User complaints**: Dropped from 342 to 2 (99.4% reduction) ✅
- **CPU time during rotation**: 5ms (was 150ms) ✅

**Key Learning:**

Mobile orientation changes are different from desktop window resizes. Always use both `resize` and `orientationchange` events, debounce aggressively, and be careful with closures in orientation-dependent handlers.

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: WindowResize vs ResizeObserver vs MediaQuery</strong></summary>

**Comparison Matrix:**

| Aspect | Window Resize | ResizeObserver | Media Query |
|--------|---------------|----------------|------------|
| **Tracks** | Window dimensions | Element dimensions | CSS breakpoints |
| **Frequency** | 100-200 events/sec | As needed | Browser-optimized |
| **Accuracy** | Window size only | Any element size | Conceptual (min/max width) |
| **Performance** | Needs debounce | Native optimization | Best (native) |
| **Browser Support** | All browsers | IE11+ (polyfills) | All modern browsers |
| **Use Case** | Responsive components | Adaptive layouts | Conditional styling |
| **Complexity** | Low | Medium | Low |

**Choice Decision Tree:**

```javascript
// 1. Need responsive styles based on window size?
//    → Use CSS Media Queries (best performance)

// 2. Need JS logic based on window size?
//    → Use useWindowSize with RAF debounce

// 3. Need JS logic based on ELEMENT size?
//    → Use ResizeObserver or useElementSize

// 4. Need to know ORIENTATION changes?
//    → Use orientationchange + useWindowSize

// 5. Need ALL of the above?
//    → Combine: CSS media queries + useSize hook + orientationchange listener
```

**Performance Comparison:**

```javascript
// Test: 1000 components, each monitoring dimensions
// Duration: 10 seconds of random window resizing

// Approach 1: Naive useWindowSize (no debounce)
// - CSS bundle: 2MB
// - JS bundle: 500KB
// - Mount time: 450ms
// - Resize time: 2500ms (blocks interaction)
// - Memory: 150MB
// ❌ NOT VIABLE for production

// Approach 2: useWindowSize + RAF debounce
// - CSS bundle: 2MB
// - JS bundle: 505KB
// - Mount time: 280ms
// - Resize time: 45ms (smooth)
// - Memory: 85MB
// ✅ RECOMMENDED for responsive components

// Approach 3: CSS Media Queries only
// - CSS bundle: 2.5MB
// - JS bundle: 400KB
// - Mount time: 120ms
// - Resize time: 0ms (native)
// - Memory: 30MB
// ✅ BEST for styling, combine with JS as needed

// Approach 4: ResizeObserver for elements
// - CSS bundle: 2MB
// - JS bundle: 510KB
// - Mount time: 200ms
// - Element resize: 15ms (native optimization)
// - Memory: 60MB
// ✅ BEST for adaptive element layouts
```

**Real-World Recommendation:**

```javascript
// PRODUCTION PATTERN: Layered approach
// Layer 1: CSS media queries for base responsive styles
// Layer 2: ResizeObserver for element-specific layouts
// Layer 3: useWindowSize for JS-dependent features

// Example: E-commerce product page
export function ProductPage() {
  // Layer 1: CSS handles basic responsive layout (no JS needed)
  // <style>
  //   @media (max-width: 768px) { .product-grid { grid-template-columns: 1; } }
  // </style>

  // Layer 2: Element resize for gallery
  const galleryRef = useRef(null);
  const gallerySize = useElementSize(galleryRef);

  // Layer 3: Window size for feature toggling
  const windowSize = useWindowSize();
  const isMobileDevice = windowSize.width < 480;

  return (
    <div>
      {/* Basic layout handled by CSS media queries */}
      <div className="product-container">
        {/* Gallery adapts to container size via ResizeObserver */}
        <Gallery ref={galleryRef} columns={calculateColumns(gallerySize.width)} />

        {/* Conditional UI based on device type */}
        {isMobileDevice ? <MobileAddToCart /> : <DesktopAddToCart />}
      </div>
    </div>
  );
}

// This approach:
// - Minimizes JS execution (CSS handles most)
// - Optimizes for ResizeObserver (native API)
// - Uses JS only for true dynamic needs
// - Provides best user experience
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

**What is useWindowSize?**

Imagine you're building a responsive website that looks different on phones vs. desktops. The site needs to know "how wide is the user's screen right now?" to decide which layout to show.

That's what `useWindowSize` does: it asks the browser "how big is the window?" whenever the user resizes their browser, and tells your React component the new dimensions.

**Analogy:**

Think of it like a restaurant that needs to know how many people walked in:

```javascript
// Bad way (naive):
function Restaurant() {
  // Check headcount 100 times per second (exhausting!)
  const checkHeadcount = () => {
    updateLayout(countPeople()); // This happens constantly!
  };
  window.addEventListener('peopleChanging', checkHeadcount);
}

// Good way (with debounce):
function SmartRestaurant() {
  // Check headcount only once every 150ms (efficient!)
  let checkScheduled = false;
  const handlePeopleChanging = () => {
    if (checkScheduled) return;
    checkScheduled = true;
    setTimeout(() => {
      updateLayout(countPeople()); // Check once per 150ms
      checkScheduled = false;
    }, 150);
  };
  window.addEventListener('peopleChanging', handlePeopleChanging);
}
```

**How it works step by step:**

```javascript
function useWindowSize() {
  // Step 1: Remember the current window size
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Step 2: When component mounts, set up a "listener"
  // A listener is like a "bell" that rings when window resizes
  useEffect(() => {
    function handleResize() {
      // Step 3: When resize event happens, update the remembered size
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    // Ring the bell (listen) when window resizes
    window.addEventListener('resize', handleResize);

    // Step 4: When component unmounts, remove the listener
    // (Stop listening when we don't need it anymore)
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Return the size so component can use it
  return windowSize;
}

// In a component:
function MyComponent() {
  const { width, height } = useWindowSize();

  // If screen is narrow (mobile), show one thing
  // If screen is wide (desktop), show another
  if (width < 768) {
    return <MobileVersion />;
  } else {
    return <DesktopVersion />;
  }
}
```

**Why do we need debounce?**

When you resize a window, the browser fires the resize event A LOT. Like, 50 times per second!

Without debouncing:
- User resizes window → 187 resize events fire
- Each event updates state → 187 re-renders happen
- Browser gets sluggish and slow

With debouncing:
- User resizes window → 187 resize events fire
- We ignore 185 of them, only update on the last one
- Only 1-2 re-renders happen
- Browser stays smooth and fast

It's like saying "I'll check the temperature only once every 2 seconds" instead of "I'll check 100 times per second".

**Common patterns you'll see:**

```javascript
// Pattern 1: Simple version (for tutorials)
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => setSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// Pattern 2: Production version (with debounce)
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    let frameId = null;

    const handleResize = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return size;
}

// Pattern 3: With custom debounce delay
function useWindowSize(delay = 150) {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    let timeoutId = null;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, delay);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [delay]);

  return size;
}
```

**Interview answer template:**

"A `useWindowSize` hook returns the browser window's width and height. It sets up a resize event listener when the component mounts, updates state whenever the window resizes, and removes the listener when unmounting to prevent memory leaks.

For production, I'd add debouncing with `requestAnimationFrame` to batch updates, since resize fires 100+ times per second. I'd also handle SSR by checking `typeof window` first.

The hook follows the pattern: set initial state, add event listener in useEffect, return cleanup function to remove listener on unmount. This keeps the logic reusable across many components."

</details>

## Question 2: How do you implement `useWindowSize` with SSR (Server-Side Rendering) support?

**Answer:**

SSR support means the hook needs to work in both browser and Node.js environments. Since `window` doesn't exist on the server, we must check if the code is running in the browser before accessing window-related APIs.

The key is using a guard clause like `typeof window !== 'undefined'` to safely access browser globals:

```javascript
function useWindowSize() {
  // Initialize with undefined on server, actual values on client
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : undefined,
    height: typeof window !== 'undefined' ? window.innerHeight : undefined
  });

  useEffect(() => {
    // Effect only runs on client (useEffect doesn't run on server)
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// In component, handle undefined gracefully
function ResponsiveComponent() {
  const { width, height } = useWindowSize();

  // width/height are undefined on server and initial render
  if (!width || !height) {
    return <div>Loading...</div>; // Or return desktop layout as default
  }

  return (
    <div>
      {width < 768 ? <Mobile /> : <Desktop />}
    </div>
  );
}
```

This approach prevents "Hydration mismatch" errors (where server HTML differs from client HTML), makes the hook reusable in Next.js and other SSR frameworks, and provides graceful degradation on older browsers.

---

<details>
<summary><strong>🔍 Deep Dive: Hydration Mismatch and SSR Challenges</strong></summary>

**The Hydration Mismatch Problem**

When using SSR (Next.js, Remix, etc.), React renders your app twice: once on the server (to generate HTML) and once on the client (to make it interactive). These two renders MUST produce identical HTML, or React throws a "Hydration mismatch" error.

```javascript
// ❌ PROBLEMATIC: Creates mismatch
function BadUseWindowSize() {
  // Server doesn't have window, so this throws an error!
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth, // ❌ ReferenceError on server!
    height: window.innerHeight
  });

  useEffect(() => {
    // ... resize listener
  }, []);

  return windowSize;
}

// When Next.js tries to render:
// Server render: Crashes with "window is not defined"
// Client render: Would work, but server failed
// Result: Deploy fails!
```

**Safe Initialization Strategies**

```javascript
// Strategy 1: Check typeof window
function useWindowSize_Strategy1() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : undefined,
    height: typeof window !== 'undefined' ? window.innerHeight : undefined
  });

  useEffect(() => {
    // Effect only runs on client
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Server renders: { width: undefined, height: undefined }
// Client renders: { width: 1024, height: 768 } (after hydration)
// Hydration: ✅ No mismatch (both start with undefined)

// Strategy 2: Return default values (assumes desktop)
function useWindowSize_Strategy2() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Server renders: { width: 1024, height: 768 }
// Client renders: { width: 1024, height: 768 } (initial)
// Hydration: ✅ No mismatch
// Issue: Mobile users get desktop layout on initial render (flashing)

// Strategy 3: useLayoutEffect (client-only)
function useWindowSize_Strategy3() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined
  });

  useLayoutEffect(() => {
    // useLayoutEffect runs synchronously on client, never on server
    // Updates state before browser paints
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Server renders: { width: undefined, height: undefined }
// Client renders (before paint): Updates to { width: 1024, height: 768 }
// Hydration: ✅ No mismatch, no flashing
// Best for UI components that need immediate values
```

**Handling Hydration in Next.js**

```javascript
// Next.js-specific pattern
import { useEffect, useState } from 'react';

export function useWindowSize() {
  const [isMounted, setIsMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    // Mark that we're now on client
    setIsMounted(true);

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    // Set initial size immediately
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Return undefined values until mounted (prevent hydration mismatch)
  if (!isMounted) {
    return { width: 0, height: 0 };
  }

  return windowSize;
}

// Usage with suspense boundary
import { Suspense } from 'react';

export function ResponsivePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResponsiveContent />
    </Suspense>
  );
}

function ResponsiveContent() {
  const { width, height } = useWindowSize();

  // On server: width=0, height=0
  // On client (before effect): width=0, height=0
  // On client (after effect): width=1024, height=768

  return <div>{width > 0 && <YourContent />}</div>;
}
```

**Real-World SSR Data Hydration Issues**

```javascript
// ❌ PROBLEMATIC: Mismatch in Next.js
export default function Page() {
  const { width } = useWindowSize();

  // Server renders: width=undefined → shows <MobileNav />
  // Client renders: width=1024 → shows <DesktopNav />
  // Hydration error: "Expected server HTML to contain..."

  return width < 768 ? <MobileNav /> : <DesktopNav />;
}

// ✅ CORRECT: Consistent rendering
export default function Page() {
  const [isMounted, setIsMounted] = useState(false);
  const { width } = useWindowSize();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Server renders: isMounted=false → shows nothing
  // Client renders: isMounted=false → shows nothing
  // After effect: isMounted=true → shows correct layout
  // Hydration: ✅ No mismatch

  if (!isMounted) {
    return null; // Or return a skeleton
  }

  return width < 768 ? <MobileNav /> : <DesktopNav />;
}

// Alternative: Return desktop by default
export default function Page() {
  const { width = 1024 } = useWindowSize(); // Default to desktop

  // Both renders show DesktopNav
  // After hydration, updates to MobileNav if needed
  // Hydration: ✅ No mismatch

  return width < 768 ? <MobileNav /> : <DesktopNav />;
}
```

**Performance Impact in Next.js**

```javascript
// Measuring SSR performance

// Without isMounted guard:
// - Server render time: 5ms
// - Client hydration time: 45ms (includes mismatch error handling)
// - Total: 50ms
// - User sees flashing layout change

// With isMounted guard:
// - Server render time: 2ms (returns null/skeleton)
// - Client hydration time: 12ms (no mismatch)
// - Total: 14ms
// - User sees smooth transition

// With inline strategy (default width):
// - Server render time: 4ms
// - Client hydration time: 18ms
// - Total: 22ms
// - User sees desktop layout first, switches if needed
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Hydration Mismatch Crash in Production Next.js App</strong></summary>

**The Problem:**

A fintech dashboard built with Next.js had a critical bug where the app would crash on first load for mobile users. The error appeared in console: "Hydration failed because the initial UI does not match what was rendered on the server."

**Investigation:**

```javascript
// The buggy code
import { useState, useEffect } from 'react';

function useWindowSize() {
  // ❌ ISSUE: Assuming window exists on server
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// In page component
export default function Dashboard() {
  const { width } = useWindowSize();

  // Server: Can't call useWindowSize (window undefined)
  // Never gets to render mobile layout
  // Client: Renders mobile layout
  // Hydration mismatch! Server HTML ≠ Client HTML

  return (
    <div>
      {width < 768 ? (
        <div>Mobile Dashboard (hidden on server)</div>
      ) : (
        <div>Desktop Dashboard (rendered on server)</div>
      )}
    </div>
  );
}
```

**What actually happened:**

```
1. Browser requests page from Next.js server
2. Server: Crashes with "window is not defined" during page generation
3. Error caught, returns 500 error page
4. Browser shows error, user confused
5. Mobile users hit refresh multiple times
6. Server logs filled with "window is not defined" errors

Production impact:
- Error rate: 23% of page loads (all mobile users)
- User impact: 45,000+ failed page loads
- Duration: 2 hours (from deploy to rollback)
- Cost: ~$5K in lost transactions
```

**The Fix:**

```javascript
// ✅ CORRECT: Safe for SSR
import { useState, useEffect, useLayoutEffect } from 'react';

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    // Safe: undefined on server, actual values on client
    width: typeof window !== 'undefined' ? window.innerWidth : undefined,
    height: typeof window !== 'undefined' ? window.innerHeight : undefined
  });

  useEffect(() => {
    // This effect only runs on client
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    // Set initial values immediately (useEffect runs async)
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export default function Dashboard() {
  const { width } = useWindowSize();

  // Server render: width=undefined
  // Client initial render: width=undefined
  // Client after effect: width=1024 (or actual width)
  // Hydration: ✅ No mismatch (both start with undefined)

  // Handle undefined gracefully
  if (width === undefined) {
    return <LoadingState />; // Or return null
  }

  return (
    <div>
      {width < 768 ? <MobileNav /> : <DesktopNav />}
    </div>
  );
}
```

**Metrics After Fix:**

- **Error rate**: 0% (was 23%) ✅
- **Page load success**: 100% for mobile users ✅
- **Hydration mismatches**: 0 (was 10,000+) ✅
- **Server crash errors**: 0 (was 45,000+) ✅

**Additional Best Practices for Next.js:**

```javascript
// Production-ready pattern for Next.js
import { useEffect, useState } from 'react';

export function useWindowSize() {
  // State for tracking mounted status
  const [isMounted, setIsMounted] = useState(false);

  // State for window dimensions
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    // Mark as mounted
    setIsMounted(true);

    // Get initial dimensions
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Set up resize listener
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Return undefined values until mounted to prevent hydration mismatch
  return isMounted ? windowSize : undefined;
}

// Alternative: Return object with isReady flag
export function useWindowSizeReady() {
  const [isReady, setIsReady] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    setIsReady(true);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { ...windowSize, isReady };
}

// Usage with isReady flag
export default function Dashboard() {
  const { width, isReady } = useWindowSizeReady();

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {width < 768 ? <MobileNav /> : <DesktopNav />}
    </div>
  );
}
```

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: useState vs useLayoutEffect vs useSyncExternalStore</strong></summary>

**Comparison of SSR-Safe Strategies:**

| Strategy | Initial Value | Hydration Safe | Performance | Complexity |
|----------|---------------|----------------|-------------|-----------|
| **useState + Guard** | undefined | ✅ Yes | ✅ Good | Low |
| **useState + Default** | 1024×768 | ⚠️ Flash | ✅ Good | Low |
| **useLayoutEffect** | 0×0 | ✅ Yes | ⚠️ Slower | Medium |
| **useSyncExternalStore** | Via store | ✅ Yes | ✅ Excellent | High |
| **useEffect + isMounted** | undefined | ✅ Yes | ✅ Good | Medium |

**Strategy Decision Tree:**

```javascript
// 1. Building a Next.js app?
//    → Use useState with typeof window guard

// 2. Need dimensions BEFORE paint?
//    → Use useLayoutEffect (but causes hydration mismatch, need guard)

// 3. Building with Remix or similar?
//    → Use useSyncExternalStore for reactive window size

// 4. Simple blog/docs site?
//    → Use CSS media queries, no JS needed

// 5. High-performance dashboard?
//    → Use useSyncExternalStore + debounce
```

**Production Pattern: useSyncExternalStore**

```javascript
// The most robust approach for React 18+
import { useSyncExternalStore } from 'react';

// External store for window size (outside React)
const windowSizeSubscribers = new Set();

function createWindowSizeStore() {
  let windowSize = {
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  };

  const updateSize = () => {
    const newSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    if (newSize.width !== windowSize.width || newSize.height !== windowSize.height) {
      windowSize = newSize;
      windowSizeSubscribers.forEach(callback => callback());
    }
  };

  if (typeof window !== 'undefined') {
    let frameId = null;
    const debouncedUpdate = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateSize);
    };

    window.addEventListener('resize', debouncedUpdate);
  }

  return {
    getSnapshot: () => windowSize,
    subscribe: (callback) => {
      windowSizeSubscribers.add(callback);
      return () => windowSizeSubscribers.delete(callback);
    }
  };
}

const store = createWindowSizeStore();

function useWindowSize() {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => ({ // Server-side snapshot
      width: 1024,
      height: 768
    })
  );
}

// ✅ Benefits:
// - No hydration mismatch (server returns different snapshot)
// - Efficient subscription model
// - Automatic debouncing via RAF
// - Single listener for all hooks
// - Built-in React 18 support
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

**What is SSR and why does it matter?**

SSR stands for "Server-Side Rendering." Normally, React apps run entirely in the browser. But with SSR frameworks like Next.js, the app ALSO runs on the server to generate HTML before sending it to the browser.

This has advantages:
- Better SEO (search engines see real HTML)
- Faster initial page load (users see content immediately)
- Works better for mobile devices

But it creates a challenge: **the server and browser must produce identical HTML, or React crashes.**

**The Problem with `window`:**

The `window` object only exists in browsers, not on servers (servers use Node.js). So this code breaks:

```javascript
// ❌ BREAKS on server
const width = window.innerWidth; // Error: window is not defined!
```

**The Solution: Check if window exists first**

```javascript
// ✅ SAFE on server
const width = typeof window !== 'undefined' ? window.innerWidth : undefined;
// On server: width = undefined (window doesn't exist)
// On browser: width = actual width (window exists)
```

**How SSR rendering works:**

```
1. Browser requests page from server
2. Server renders React app:
   - Creates state with width=undefined
   - Returns HTML with undefined value
3. Server sends HTML to browser
4. Browser receives HTML and loads JavaScript
5. React "hydrates" (connects JavaScript to HTML):
   - Must match what server rendered
   - Both have width=undefined ✅ (matches!)
6. Effect runs in browser:
   - Updates state to actual width
   - Updates HTML to show real value

If server said width=1024 but browser has width=768:
- Hydration mismatch error!
- React crashes because they don't match
```

**Simple analogy:**

Imagine you're building a house with a friend:

```javascript
// Bad way (causes mismatch):
// You (server): Build house with 3 doors
// Friend (browser): Builds same house, but with 4 doors
// Result: House is messed up, doesn't work

// Good way (no mismatch):
// You (server): Build generic house frame (width=undefined)
// Friend (browser): Builds same frame
// You both paint doors together later (width=actual value)
// Result: Perfect match!
```

**Interview answer template:**

"For SSR support, you need to check if `window` exists before accessing browser APIs. In the hook, I initialize state with `typeof window !== 'undefined'` to safely access `window.innerWidth`. On the server, this returns undefined. The browser then renders identically with undefined, and after the component mounts, the effect updates state with the actual values.

This prevents hydration mismatch errors where the server HTML differs from the browser HTML. I'd also consider using `useLayoutEffect` for immediate values, or `useSyncExternalStore` in React 18 for optimal performance."

</details>

---

**Summary:**

`useWindowSize` is a fundamental custom hook for responsive React applications. It must handle:
- **Performance**: Debounce resize events with RAF or manual throttling
- **Memory**: Proper cleanup of event listeners
- **SSR**: Safe access to `window` object
- **Accuracy**: Mobile orientation changes and ResizeObserver alternatives
- **Composition**: Layered approach with CSS, ResizeObserver, and JS hooks

The production-ready pattern combines RAF debouncing for performance with SSR-safe initialization and proper cleanup to create a reliable, reusable hook used in thousands of production applications.
