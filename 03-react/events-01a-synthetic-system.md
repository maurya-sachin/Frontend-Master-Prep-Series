# React Synthetic Event System

## Question 1: How does React's synthetic event system work?

**Answer:**

React's synthetic event system is a cross-browser wrapper around the browser's native event system. Instead of working directly with native events, React creates a `SyntheticEvent` object that wraps the native event and provides a consistent API across all browsers. This abstraction ensures that events work identically in all browsers, eliminating the need to handle browser-specific quirks.

The synthetic event system normalizes event properties and methods, so developers can use the same API regardless of the underlying browser. For example, `event.stopPropagation()` and `event.preventDefault()` work consistently across all browsers. React implements its own event delegation system where events are registered at the root of the React tree (in React 17+, previously at the document level) rather than on individual DOM nodes, improving performance and memory efficiency.

Synthetic events implement the same interface as native events, including properties like `type`, `target`, `currentTarget`, `preventDefault()`, and `stopPropagation()`. You can access the underlying native event through `event.nativeEvent` when needed for browser-specific functionality. React pools synthetic events for performance (in React <17), meaning the event object is reused and properties are nullified after the event callback executes.

Key characteristics include automatic event delegation, event pooling (legacy), cross-browser normalization, and performance optimizations through batching and efficient event listener management.

---

### 🔍 Deep Dive

<details>
<summary><strong>🔍 Deep Dive: Synthetic Event Architecture</strong></summary>

**Synthetic Event Architecture:**

React's synthetic event system is built on several key architectural decisions that optimize performance and developer experience:

**1. Event Delegation at Root:**

In React 17+, React attaches event listeners to the root DOM container where your React app is mounted, not to individual elements. This is a fundamental shift from React 16 where events were attached to the `document` level.

```javascript
// React 17+ internals (simplified)
const root = document.getElementById('root');

// Single listener for all clicks in the React tree
root.addEventListener('click', (nativeEvent) => {
  const targetFiber = getClosestFiberFromDOM(nativeEvent.target);
  const syntheticEvent = createSyntheticEvent(nativeEvent);

  // Traverse fiber tree and execute handlers
  dispatchEventsForPlugins(targetFiber, syntheticEvent);
});
```

This change was made to support multiple React roots on the same page and to make React work better with other frameworks.

**2. SyntheticEvent Object:**

The `SyntheticEvent` wrapper provides a consistent interface:

```javascript
// Synthetic event structure (simplified)
class SyntheticEvent {
  constructor(nativeEvent) {
    this.nativeEvent = nativeEvent;
    this.type = nativeEvent.type;
    this.target = nativeEvent.target;
    this.currentTarget = nativeEvent.currentTarget;
    this.bubbles = nativeEvent.bubbles;
    this.cancelable = nativeEvent.cancelable;
    this.defaultPrevented = false;
    this.eventPhase = nativeEvent.eventPhase;
    this.isTrusted = nativeEvent.isTrusted;
    this.timeStamp = nativeEvent.timeStamp;
  }

  preventDefault() {
    this.defaultPrevented = true;
    if (this.nativeEvent.preventDefault) {
      this.nativeEvent.preventDefault();
    }
  }

  stopPropagation() {
    if (this.nativeEvent.stopPropagation) {
      this.nativeEvent.stopPropagation();
    }
  }

  persist() {
    // Prevents event pooling (React <17)
    // No-op in React 17+
  }
}
```

**3. Event Plugin System:**

React uses a plugin architecture to handle different event types:

```javascript
// SimpleEventPlugin handles basic events (click, input, etc.)
// ChangeEventPlugin handles onChange normalization
// SelectEventPlugin handles select events
// BeforeInputEventPlugin handles composition events

const eventPlugins = [
  SimpleEventPlugin,
  ChangeEventPlugin,
  SelectEventPlugin,
  BeforeInputEventPlugin,
];

// Each plugin extracts events from native events
function extractEvents(
  topLevelType,
  targetInst,
  nativeEvent,
  nativeEventTarget
) {
  let events = null;
  for (let plugin of eventPlugins) {
    const extractedEvents = plugin.extractEvents(
      topLevelType,
      targetInst,
      nativeEvent,
      nativeEventTarget
    );
    if (extractedEvents) {
      events = accumulateInto(events, extractedEvents);
    }
  }
  return events;
}
```

**4. Event Name Normalization:**

React normalizes event names to camelCase:

```javascript
// Browser native events → React synthetic events
'click' → 'onClick'
'mouseenter' → 'onMouseEnter'
'change' → 'onChange'
'keydown' → 'onKeyDown'

// Special cases - React provides better abstractions
'input' → 'onChange' (for controlled inputs)
'focusin' → 'onFocus' (with bubbling support)
'focusout' → 'onBlur' (with bubbling support)
```

**5. Event Batching:**

React batches multiple state updates triggered by the same event:

```javascript
function handleClick(e) {
  // These updates are batched into a single re-render
  setCount(c => c + 1);
  setValue(v => v + 1);
  setName('Updated');

  // React 18+: Automatic batching even in promises, setTimeout
}
```

**6. Passive Event Listeners:**

React automatically uses passive listeners for scroll and touch events to improve performance:

```javascript
// React internals
if (eventType === 'scroll' || eventType === 'touchmove') {
  rootElement.addEventListener(eventType, handler, {
    passive: true, // Allows browser to optimize scrolling
    capture: false,
  });
}
```

**7. Event Priority System (React 18+):**

Events are categorized by priority for Concurrent Mode:

```javascript
// DiscreteEventPriority: clicks, keypress, focus
// ContinuousEventPriority: drag, mouse move, scroll
// DefaultEventPriority: data fetching, transitions

// High priority events interrupt rendering
// Low priority events can be delayed
```

---

</details>

### 🐛 Real-World Scenario

<details>
<summary><strong>🐛 Real-World Scenario: E-Commerce Product Gallery Event Handler Issues</strong></summary>

**Scenario:** E-commerce product page with image gallery experiencing event handler bugs causing poor user experience and lost sales.

**Problem Detected:**
- User complaint: "Clicking images sometimes doesn't work"
- Analytics showing 23% drop in image interaction rate
- Performance metrics showing 280ms event handler execution time
- Memory leaks detected in Chrome DevTools performance profile

**Investigation:**

```javascript
// ❌ BAD: Multiple issues causing problems
class ProductGallery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedImage: 0,
      zoomLevel: 1,
      images: props.images
    };
  }

  handleImageClick(index, event) {
    // Issue 1: Event pooling bug (React <17)
    setTimeout(() => {
      console.log(event.target); // null! Event was pooled
    }, 100);

    // Issue 2: Unnecessary native event usage
    event.nativeEvent.stopImmediatePropagation();

    // Issue 3: Heavy computation in event handler
    const processedImages = this.state.images.map(img => ({
      ...img,
      processed: this.processImage(img), // 150ms operation!
    }));

    // Issue 4: Multiple state updates (not batched before React 18)
    this.setState({ selectedImage: index });
    this.setState({ zoomLevel: 1 });
    this.setState({ images: processedImages });
  }

  handleWheel(event) {
    // Issue 5: Not preventing default on passive event
    event.preventDefault(); // Warning: Unable to preventDefault

    // Issue 6: Memory leak - addEventListener not cleaned up
    document.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    // Issue 7: Missing cleanup
    // document.removeEventListener not called
  }

  render() {
    return (
      <div className="gallery">
        {this.state.images.map((img, index) => (
          <img
            key={index}
            src={img.url}
            // Issue 8: Creating new function on every render
            onClick={(e) => this.handleImageClick(index, e)}
            onWheel={(e) => this.handleWheel(e)}
          />
        ))}
      </div>
    );
  }
}
```

**Debugging Process:**

```javascript
// Step 1: Measure event handler performance
function measureEventHandler(handler, name) {
  return function(event) {
    const start = performance.now();
    handler(event);
    const duration = performance.now() - start;

    if (duration > 16.67) { // Slower than 60fps
      console.warn(`${name} took ${duration}ms - too slow!`);
    }
  };
}

// Step 2: Check for event pooling issues
function debugEventPooling(event) {
  console.log('Immediate:', event.target); // Works
  setTimeout(() => {
    console.log('Async:', event.target); // null in React <17
  }, 0);
}

// Step 3: Profile memory leaks
// Chrome DevTools → Memory → Heap Snapshot
// Look for detached DOM nodes and event listeners
```

**Metrics Analysis:**
- **Before fix:** 280ms average event handler time
- **Event listener count:** 847 listeners (should be ~50)
- **Memory growth:** 2.3MB per minute of browsing
- **User interaction rate:** 77% (down from 100%)

**Solution:**

```javascript
// ✅ GOOD: Optimized event handling
import { useCallback, useState, useEffect, useRef } from 'react';

function ProductGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const galleryRef = useRef(null);

  // Fix 1: Use useCallback to prevent recreation
  const handleImageClick = useCallback((index, event) => {
    // Fix 2: Use event.persist() if needed (React <17)
    // event.persist(); // No longer needed in React 17+

    // Fix 3: Batch state updates (automatic in React 18)
    setSelectedImage(index);
    setZoomLevel(1);

    // Fix 4: Use transition for non-urgent updates
    startTransition(() => {
      // Low priority update
      trackImageClick(index);
    });
  }, []);

  // Fix 5: Proper wheel event handling
  const handleWheel = useCallback((event) => {
    // Don't call preventDefault on passive events
    // Instead, use non-passive listener when needed
    const delta = event.deltaY;

    setZoomLevel(prev => {
      const newZoom = prev + (delta > 0 ? -0.1 : 0.1);
      return Math.max(1, Math.min(3, newZoom));
    });
  }, []);

  // Fix 6: Proper native event listener cleanup
  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    // Use non-passive for wheel if preventDefault needed
    const wheelHandler = (e) => {
      if (e.ctrlKey) {
        e.preventDefault(); // Now works!
        handleWheel({ deltaY: e.deltaY });
      }
    };

    gallery.addEventListener('wheel', wheelHandler, { passive: false });

    // Fix 7: Always cleanup
    return () => {
      gallery.removeEventListener('wheel', wheelHandler);
    };
  }, [handleWheel]);

  // Fix 8: Optimize rendering with memoization
  const imageElements = useMemo(() => {
    return images.map((img, index) => (
      <img
        key={img.id} // Use stable key
        src={img.url}
        onClick={(e) => handleImageClick(index, e)}
        className={selectedImage === index ? 'selected' : ''}
        loading="lazy" // Performance optimization
      />
    ));
  }, [images, selectedImage, handleImageClick]);

  return (
    <div className="gallery" ref={galleryRef}>
      {imageElements}
    </div>
  );
}
```

**Advanced Pattern: Event Delegation:**

```javascript
// ✅ EXCELLENT: Manual event delegation for large lists
function OptimizedGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Single event handler for all images
  const handleGalleryClick = useCallback((event) => {
    const img = event.target.closest('img[data-index]');
    if (!img) return;

    const index = parseInt(img.dataset.index, 10);

    // Prevent multiple clicks within 300ms (debounce)
    if (Date.now() - lastClickTime.current < 300) {
      return;
    }
    lastClickTime.current = Date.now();

    setSelectedImage(index);
  }, []);

  const lastClickTime = useRef(0);

  return (
    <div className="gallery" onClick={handleGalleryClick}>
      {images.map((img, index) => (
        <img
          key={img.id}
          src={img.url}
          data-index={index}
          alt={img.alt}
        />
      ))}
    </div>
  );
}
```

**Results After Fix:**
- **Event handler time:** 12ms average (23× faster)
- **Event listener count:** 52 listeners (16× reduction)
- **Memory growth:** 0.14MB per minute (16× improvement)
- **User interaction rate:** 98% (27% improvement)
- **Page load time:** Reduced from 3.2s to 1.8s
- **Conversion rate:** Increased from 2.1% to 2.7% (+28%)

</details>

---

### ⚖️ Trade-offs

<details>
<summary><strong>⚖️ Trade-offs: Synthetic Events vs Native Events</strong></summary>

**1. Synthetic Events vs Native Events**

| Aspect | Synthetic Events | Native Events |
|--------|-----------------|---------------|
| **Browser Compatibility** | ✅ Consistent across all browsers | ❌ May need polyfills/fallbacks |
| **Performance** | ✅ Optimized delegation, batching | ⚠️ Direct but more listeners |
| **API** | ✅ Normalized, predictable | ❌ Browser-specific quirks |
| **Access to Native Features** | ⚠️ Limited (need nativeEvent) | ✅ Full browser API access |
| **Event Timing** | ⚠️ Async in some cases | ✅ Synchronous |
| **Framework Integration** | ✅ Works with React lifecycle | ❌ Manual lifecycle management |

**When to Use Synthetic Events:**
```javascript
// ✅ GOOD: Standard React interactions
function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}

// ✅ GOOD: Form handling
function Input({ value, onChange }) {
  return <input value={value} onChange={onChange} />;
}

// ✅ GOOD: Keyboard shortcuts
function App() {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  return <div onKeyDown={handleKeyDown}>...</div>;
}
```

**When to Use Native Events:**
```javascript
// ✅ GOOD: Need passive: false for preventDefault
useEffect(() => {
  const handleWheel = (e) => {
    e.preventDefault(); // Prevent scroll
    handleZoom(e.deltaY);
  };

  element.addEventListener('wheel', handleWheel, { passive: false });
  return () => element.removeEventListener('wheel', handleWheel);
}, []);

// ✅ GOOD: Need capture phase behavior
useEffect(() => {
  const handleClickCapture = (e) => {
    // Runs before React synthetic events
    console.log('Capture phase');
  };

  document.addEventListener('click', handleClickCapture, { capture: true });
  return () => document.removeEventListener('click', handleClickCapture);
}, []);

// ✅ GOOD: Need to listen outside React root
useEffect(() => {
  const handleDocumentClick = (e) => {
    if (!containerRef.current.contains(e.target)) {
      closeDropdown();
    }
  };

  document.addEventListener('click', handleDocumentClick);
  return () => document.removeEventListener('click', handleDocumentClick);
}, []);
```

**2. Inline Handlers vs Extracted Functions**

| Aspect | Inline Arrow Functions | useCallback / Class Methods |
|--------|----------------------|---------------------------|
| **Code Readability** | ✅ Easy to read inline | ⚠️ Need to jump to definition |
| **Performance** | ❌ New function each render | ✅ Stable reference |
| **Memory Usage** | ❌ More garbage collection | ✅ Less memory churn |
| **Parameters** | ✅ Easy to pass data | ⚠️ Need closures or data-* |
| **Testing** | ❌ Hard to test | ✅ Easy to test separately |
| **Debugging** | ⚠️ Anonymous in stack traces | ✅ Named in stack traces |

```javascript
// ❌ BAD: Inline handler for large lists (performance issue)
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} onClick={() => handleClick(todo.id)}>
          {/* New function created for each todo on every render */}
          {todo.text}
        </li>
      ))}
    </ul>
  );
}

// ✅ GOOD: useCallback for stable reference
function TodoList({ todos }) {
  const handleClick = useCallback((id) => {
    // Handle click
  }, []);

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onClick={handleClick}
        />
      ))}
    </ul>
  );
}

// ⚠️ ACCEPTABLE: Inline for small, simple components
function Button({ label }) {
  // Fine if not re-rendering frequently
  return <button onClick={() => console.log('clicked')}>{label}</button>;
}
```

**3. Event Bubbling vs Capture**

| Phase | When to Use | Use Cases |
|-------|-------------|-----------|
| **Bubbling (default)** | 95% of cases | Click handlers, form events, most interactions |
| **Capture** | Special cases | Global event interception, analytics, debugging |

```javascript
// ✅ GOOD: Capture phase for global click tracking
function AnalyticsProvider({ children }) {
  useEffect(() => {
    const trackClick = (e) => {
      const target = e.target.closest('[data-track]');
      if (target) {
        analytics.track(target.dataset.track);
      }
    };

    // Capture phase runs before any bubbling handlers
    document.addEventListener('click', trackClick, { capture: true });
    return () => document.removeEventListener('click', trackClick);
  }, []);

  return children;
}

// ✅ GOOD: Bubbling phase for normal interactions
function Form() {
  const handleSubmit = (e) => {
    e.preventDefault(); // Stops bubbling
    // Handle form
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**4. preventDefault vs stopPropagation**

```javascript
// preventDefault: Stops default browser behavior
// stopPropagation: Stops event bubbling to parent elements

// ✅ GOOD: Use preventDefault for form submissions
function Form({ onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    onSubmit(formData);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// ⚠️ CAREFUL: stopPropagation can break parent handlers
function NestedButton({ onClick }) {
  const handleClick = (e) => {
    e.stopPropagation(); // Parent won't receive event!
    onClick(e);
  };

  return <button onClick={handleClick}>Click</button>;
}

// ✅ BETTER: Use conditional logic instead
function NestedButton({ onClick, shouldPropagate = true }) {
  const handleClick = (e) => {
    onClick(e);
    if (!shouldPropagate) {
      e.stopPropagation();
    }
  };

  return <button onClick={handleClick}>Click</button>;
}
```

**Decision Matrix:**

```
Choose Synthetic Events when:
- Building standard React components
- Need cross-browser compatibility
- Want automatic batching and performance optimizations
- Working within React component tree

Choose Native Events when:
- Need passive: false for preventDefault
- Need capture phase behavior
- Listening outside React root (document, window)
- Need immediate synchronous execution
- Integrating with non-React libraries

Choose useCallback when:
- Passing handlers to memoized child components
- Large lists or frequently re-rendering components
- Handlers depend on props/state (use dependencies)

Choose inline handlers when:
- Simple, non-performance-critical components
- One-off components that don't re-render often
- Improved readability is more important than micro-optimization
```

</details>

---

### 💬 Explain to Junior

<details>
<summary><strong>💬 Explain to Junior: The Hotel Reception Desk Analogy</strong></summary>

**Simple Explanation:**

Imagine React's event system like a hotel reception desk (event delegation) instead of having a doorbell at every room (native events).

**The Hotel Analogy:**

In a traditional hotel (native browser events), every room has its own doorbell. When a guest presses their room's doorbell, it rings directly. But this means:
- The hotel needs to install and maintain hundreds of doorbells
- Each doorbell needs its own wiring and battery
- It's expensive and inefficient

React's approach is like having one reception desk at the hotel entrance:
- Guest presses ANY button in the hotel → message goes to reception
- Reception looks at which room the message came from
- Reception forwards the message to the right room handler
- Only ONE central system to maintain, not hundreds

**The "Translator" Analogy:**

React's SyntheticEvent is like a universal translator:

```javascript
// Different browsers speak different "languages"
// IE: event.srcElement
// Chrome: event.target
// Firefox: event.target

// React translator always gives you the same interface:
function handleClick(event) {
  console.log(event.target); // Works everywhere!
  console.log(event.type);   // Always the same!
}
```

**Key Concepts in Simple Terms:**

**1. Event Delegation:**
```javascript
// ❌ Without delegation (inefficient)
// Imagine attaching 1000 event listeners to 1000 buttons
buttons.forEach(btn => {
  btn.addEventListener('click', handleClick); // 1000 listeners!
});

// ✅ With delegation (efficient)
// React attaches ONE listener to the container
<div onClick={handleClick}> {/* Only 1 listener! */}
  <button>Button 1</button>
  <button>Button 2</button>
  {/* ... 1000 buttons */}
</div>
```

**2. Synthetic Events:**
```javascript
// React gives you a "normalized" event that works everywhere
function handleClick(event) {
  // These work identically in ALL browsers:
  event.preventDefault();     // Stop default action
  event.stopPropagation();    // Stop bubbling
  console.log(event.target);  // Element that was clicked
  console.log(event.type);    // Event type (e.g., "click")

  // Access native event if needed:
  console.log(event.nativeEvent); // Original browser event
}
```

**3. Event Pooling (Legacy - React <17):**
```javascript
// Old React "recycled" event objects for performance
function handleClick(event) {
  console.log(event.target); // Works immediately

  setTimeout(() => {
    console.log(event.target); // null! Event was recycled
  }, 100);

  // Solution: event.persist() to keep it alive
  event.persist();
  setTimeout(() => {
    console.log(event.target); // Now works!
  }, 100);
}

// React 17+: No more pooling! Events persist automatically
```

**Common Patterns:**

```javascript
// Pattern 1: Basic event handling
function Button() {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return <button onClick={handleClick}>Click me</button>;
}

// Pattern 2: Passing data to handler
function TodoList({ todos }) {
  const handleDelete = (id) => {
    console.log('Delete todo:', id);
  };

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.text}
          {/* Pass data using arrow function */}
          <button onClick={() => handleDelete(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

// Pattern 3: Accessing event object
function Input() {
  const handleChange = (event) => {
    const value = event.target.value;
    console.log('User typed:', value);
  };

  return <input onChange={handleChange} />;
}

// Pattern 4: Preventing default behavior
function Form() {
  const handleSubmit = (event) => {
    event.preventDefault(); // Don't reload page!
    console.log('Form submitted');
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Interview Answer Template:**

"React uses a synthetic event system that wraps native browser events to provide cross-browser compatibility. Instead of attaching event listeners to individual DOM elements, React uses event delegation by attaching listeners to the root container. When an event occurs, React creates a SyntheticEvent object that normalizes the event interface across all browsers.

The main benefits are: consistent API across browsers, performance optimization through event delegation, and automatic batching of state updates. In React 17+, the event system was updated to attach listeners to the React root instead of the document, which improved support for multiple React versions on the same page.

For example, when you write `onClick={handleClick}`, React doesn't actually attach a click listener to that element. Instead, it registers the handler internally and uses event delegation to call it when needed. If you need access to the native browser event, you can use `event.nativeEvent`."

**Common Gotchas:**

```javascript
// Gotcha 1: Async access to event (React <17)
function handleClick(event) {
  // Don't do this in React <17:
  setTimeout(() => {
    console.log(event.target); // null!
  }, 100);

  // Solution: Extract what you need immediately
  const target = event.target;
  setTimeout(() => {
    console.log(target); // Works!
  }, 100);
}

// Gotcha 2: Creating new functions in render
function List({ items }) {
  // ❌ BAD: New function on every render
  return (
    <div>
      {items.map(item => (
        <button onClick={() => console.log(item)}>
          {item.name}
        </button>
      ))}
    </div>
  );
}

// Gotcha 3: Accessing native events incorrectly
function handleClick(event) {
  // ❌ BAD: Trying to use browser-specific features
  event.srcElement; // undefined in most browsers

  // ✅ GOOD: Use React's normalized property
  event.target; // Works everywhere

  // ✅ GOOD: Access native event if really needed
  event.nativeEvent.srcElement; // Now available
}
```

</details>
