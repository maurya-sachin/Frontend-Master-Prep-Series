# React Event Handling

## Question 1: How does React's synthetic event system work?

**Answer:**

React's synthetic event system is a cross-browser wrapper around the browser's native event system. Instead of working directly with native events, React creates a `SyntheticEvent` object that wraps the native event and provides a consistent API across all browsers. This abstraction ensures that events work identically in all browsers, eliminating the need to handle browser-specific quirks.

The synthetic event system normalizes event properties and methods, so developers can use the same API regardless of the underlying browser. For example, `event.stopPropagation()` and `event.preventDefault()` work consistently across all browsers. React implements its own event delegation system where events are registered at the root of the React tree (in React 17+, previously at the document level) rather than on individual DOM nodes, improving performance and memory efficiency.

Synthetic events implement the same interface as native events, including properties like `type`, `target`, `currentTarget`, `preventDefault()`, and `stopPropagation()`. You can access the underlying native event through `event.nativeEvent` when needed for browser-specific functionality. React pools synthetic events for performance (in React <17), meaning the event object is reused and properties are nullified after the event callback executes.

Key characteristics include automatic event delegation, event pooling (legacy), cross-browser normalization, and performance optimizations through batching and efficient event listener management.

---

### 🔍 Deep Dive

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

### 🐛 Real-World Scenario

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

---

### ⚖️ Trade-offs

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

---

### 💬 Explain to Junior

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

---

## Question 2: What are event delegation and event pooling in React?

**Answer:**

Event delegation is a pattern where React attaches a single event listener to a parent element (the React root container) instead of attaching individual listeners to each child element. When an event occurs on any child element, it bubbles up to the parent, and React determines which handler to call based on the event target. This dramatically reduces the number of event listeners needed, improving memory usage and performance, especially for large lists or frequently updated components.

Event pooling was a performance optimization in React versions prior to React 17 where the SyntheticEvent object was reused for multiple events. After an event handler finished executing, React would nullify all properties of the event object and return it to a pool for reuse. This reduced garbage collection overhead but caused issues when accessing event properties asynchronously (like in setTimeout or promises). Developers had to call `event.persist()` to remove the event from the pool and prevent nullification.

In React 17+, event pooling was completely removed because modern JavaScript engines handle object allocation efficiently, and the complexity/bugs it introduced outweighed the performance benefits. Events now persist automatically, so you can access event properties asynchronously without calling `persist()`. The event delegation system was also updated to attach listeners to the React root container instead of the document, improving support for multiple React roots and integration with other frameworks.

Understanding these concepts is crucial for debugging event-related issues and optimizing performance in React applications, especially when working with large lists, dynamic content, or integrating with third-party libraries.

---

### 🔍 Deep Dive

**Event Delegation Architecture:**

**1. React 16 vs React 17+ Event Delegation:**

```javascript
// React 16: Events attached to document
<div id="root">
  <button onClick={handleClick}>Click</button>
</div>

// Internally:
document.addEventListener('click', (nativeEvent) => {
  // React's event handler
  dispatchEvent(nativeEvent);
});

// React 17+: Events attached to root container
<div id="root">
  <button onClick={handleClick}>Click</button>
</div>

// Internally:
const rootContainer = document.getElementById('root');
rootContainer.addEventListener('click', (nativeEvent) => {
  // React's event handler
  dispatchEvent(nativeEvent);
});
```

**Why the change?** Multiple React versions on the same page would conflict when all listening to document. Now each root has its own event listeners.

**2. Event Delegation Flow:**

```javascript
// Step-by-step event delegation process

// User clicks a button:
<div id="root">
  <div className="container" onClick={handleContainerClick}>
    <button onClick={handleButtonClick}>Click me</button>
  </div>
</div>

// 1. Native click event fires on <button>
// 2. Event bubbles up to root container
// 3. Root listener catches the event
// 4. React determines the fiber node that corresponds to the target
// 5. React walks up the fiber tree collecting all relevant handlers
// 6. React creates a SyntheticEvent wrapper
// 7. React calls handlers in order (target → root)

// Simplified internal process:
function dispatchEvent(nativeEvent) {
  const target = nativeEvent.target;

  // Find React fiber node for this DOM element
  const targetFiber = getClosestFiberFromDOM(target);

  // Collect all event handlers from target to root
  const listeners = [];
  let fiber = targetFiber;

  while (fiber) {
    if (fiber.onClick) {
      listeners.push({ instance: fiber, handler: fiber.onClick });
    }
    fiber = fiber.return; // Parent fiber
  }

  // Create synthetic event
  const syntheticEvent = new SyntheticEvent(nativeEvent);

  // Execute handlers in order
  for (const { instance, handler } of listeners) {
    if (syntheticEvent.isPropagationStopped()) break;

    syntheticEvent.currentTarget = instance.stateNode; // DOM node
    handler.call(instance.stateNode, syntheticEvent);
  }
}
```

**3. Event Pooling (Legacy - React <17):**

```javascript
// React <17: Event pooling for performance

// Pool of reusable event objects
const eventPool = [];

function getEventFromPool(nativeEvent) {
  let syntheticEvent;

  if (eventPool.length > 0) {
    // Reuse existing event from pool
    syntheticEvent = eventPool.pop();
    syntheticEvent.nativeEvent = nativeEvent;
    syntheticEvent.target = nativeEvent.target;
    syntheticEvent.currentTarget = nativeEvent.currentTarget;
    // ... set other properties
  } else {
    // Create new event
    syntheticEvent = new SyntheticEvent(nativeEvent);
  }

  return syntheticEvent;
}

function releaseEventToPool(syntheticEvent) {
  // Nullify all properties
  syntheticEvent.nativeEvent = null;
  syntheticEvent.target = null;
  syntheticEvent.currentTarget = null;
  syntheticEvent.type = null;
  // ... nullify other properties

  // Return to pool for reuse
  if (eventPool.length < 10) {
    eventPool.push(syntheticEvent);
  }
}

function dispatchEvent(nativeEvent) {
  const syntheticEvent = getEventFromPool(nativeEvent);

  try {
    // Execute handlers
    executeHandlers(syntheticEvent);
  } finally {
    // Always return to pool (unless persist() was called)
    if (!syntheticEvent.isPersistent()) {
      releaseEventToPool(syntheticEvent);
    }
  }
}
```

**4. Event Persistence:**

```javascript
// React <17: Must call persist() for async access
class Form extends React.Component {
  handleChange = (event) => {
    // ❌ BAD: Async access without persist
    setTimeout(() => {
      console.log(event.target.value); // null!
    }, 100);

    // ✅ GOOD: Call persist() first
    event.persist();
    setTimeout(() => {
      console.log(event.target.value); // Works!
    }, 100);

    // ✅ BETTER: Extract value immediately
    const value = event.target.value;
    setTimeout(() => {
      console.log(value); // Works!
    }, 100);
  };

  render() {
    return <input onChange={this.handleChange} />;
  }
}

// React 17+: No pooling, persist() is no-op
function Form() {
  const handleChange = (event) => {
    // ✅ GOOD: Works without persist()
    setTimeout(() => {
      console.log(event.target.value); // Works!
    }, 100);
  };

  return <input onChange={handleChange} />;
}
```

**5. Custom Event Delegation:**

```javascript
// Advanced: Manual event delegation for optimized large lists

function VirtualizedList({ items }) {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    // Single delegated handler for all list items
    const handleClick = (event) => {
      // Find the closest list item
      const item = event.target.closest('[data-item-id]');
      if (!item) return;

      const itemId = item.dataset.itemId;
      const action = event.target.dataset.action;

      // Route based on action
      switch (action) {
        case 'delete':
          handleDelete(itemId);
          break;
        case 'edit':
          handleEdit(itemId);
          break;
        case 'view':
          handleView(itemId);
          break;
      }
    };

    // Single listener for entire list
    list.addEventListener('click', handleClick);

    return () => {
      list.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div ref={listRef} className="list">
      {items.map(item => (
        <div key={item.id} data-item-id={item.id}>
          <span>{item.name}</span>
          <button data-action="view">View</button>
          <button data-action="edit">Edit</button>
          <button data-action="delete">Delete</button>
        </div>
      ))}
    </div>
  );
}
```

**6. Event Priority System (React 18+):**

```javascript
// React 18: Events have different priorities

// Discrete events (high priority):
// - click, keydown, keyup, input, change, etc.
// - Block rendering, processed immediately

// Continuous events (lower priority):
// - scroll, mousemove, touchmove, drag, etc.
// - Can be throttled, don't block rendering

// Example: Scroll events don't block urgent updates
function App() {
  const [urgentState, setUrgentState] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleClick = () => {
    // Discrete event: processed immediately
    setUrgentState(u => u + 1);
  };

  const handleScroll = () => {
    // Continuous event: can be deferred
    setScrollPosition(window.scrollY);
  };

  return (
    <div onScroll={handleScroll}>
      <button onClick={handleClick}>Urgent: {urgentState}</button>
      <div>Scroll: {scrollPosition}</div>
    </div>
  );
}
```

**7. Event Batching:**

```javascript
// React automatically batches state updates within event handlers

function Counter() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  const handleClick = () => {
    // React <18: Only batched in React event handlers
    setCount(c => c + 1);  // |
    setFlag(f => !f);      // } Batched into 1 render

    // React <18: NOT batched in promises/setTimeout
    setTimeout(() => {
      setCount(c => c + 1);  // Render 1
      setFlag(f => !f);      // Render 2 (not batched!)
    }, 100);

    // React 18+: Automatic batching everywhere
    setTimeout(() => {
      setCount(c => c + 1);  // |
      setFlag(f => !f);      // } Batched into 1 render!
    }, 100);
  };

  console.log('Render'); // How many times?

  return <button onClick={handleClick}>Click</button>;
}
```

---

### 🐛 Real-World Scenario

**Scenario:** Large data table with 10,000 rows experiencing severe performance issues due to improper event handling.

**Problem Detected:**
- Page freezes for 3-4 seconds when table loads
- Chrome DevTools shows 10,000+ event listeners
- Memory usage: 450MB for the table alone
- Scroll performance: 15 FPS (should be 60 FPS)
- User complaints: "The table is unusable with large datasets"

**Investigation:**

```javascript
// ❌ BAD: Attaching individual listeners to every row
function DataTable({ data }) {
  // 10,000 rows × 4 buttons = 40,000 event listeners!

  const handleEdit = (id) => {
    console.log('Edit', id);
  };

  const handleDelete = (id) => {
    console.log('Delete', id);
  };

  const handleView = (id) => {
    console.log('View', id);
  };

  const handleSelect = (id) => {
    console.log('Select', id);
  };

  return (
    <table>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            <td>
              {/* New function created for EACH row on EVERY render */}
              <button onClick={() => handleEdit(row.id)}>Edit</button>
              <button onClick={() => handleDelete(row.id)}>Delete</button>
              <button onClick={() => handleView(row.id)}>View</button>
              <input
                type="checkbox"
                onChange={() => handleSelect(row.id)}
              />
            </td>
            <td>{row.name}</td>
            <td>{row.email}</td>
            <td>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Debugging Process:**

```javascript
// Step 1: Count event listeners
function countEventListeners() {
  const listeners = window.getEventListeners?.(document.body);
  console.log('Total listeners:',
    Object.values(listeners || {}).reduce((sum, arr) => sum + arr.length, 0)
  );
}

// Step 2: Profile memory usage
// Chrome DevTools → Memory → Heap Snapshot
// Look for "Detached" event listeners

// Step 3: Profile render performance
function DataTable({ data }) {
  const renderStart = performance.now();

  useEffect(() => {
    const renderTime = performance.now() - renderStart;
    console.log(`Render took ${renderTime}ms`);
  });

  // ... component code
}

// Step 4: Use React DevTools Profiler
// Record component renders, identify slow components
```

**Metrics Analysis:**
```
Before Optimization:
- Initial render: 3,847ms
- Memory usage: 451MB
- Event listeners: 40,127
- Scroll FPS: 15 FPS
- Re-render on data update: 2,341ms

Issues Identified:
1. 40,000+ inline arrow functions created on every render
2. 40,000+ event listeners attached
3. No event delegation
4. No memoization
5. Synchronous state updates blocking render
```

**Solution:**

```javascript
// ✅ GOOD: Event delegation with data attributes
function DataTable({ data }) {
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Single delegated handler for entire table
  const handleTableClick = useCallback((event) => {
    const target = event.target;
    const row = target.closest('tr[data-row-id]');

    if (!row) return;

    const rowId = parseInt(row.dataset.rowId, 10);
    const action = target.dataset.action;

    // Route based on action
    switch (action) {
      case 'edit':
        handleEdit(rowId);
        break;
      case 'delete':
        handleDelete(rowId);
        break;
      case 'view':
        handleView(rowId);
        break;
      case 'select':
        handleSelect(rowId, target.checked);
        break;
    }
  }, []);

  const handleEdit = useCallback((id) => {
    console.log('Edit', id);
    // Open edit modal
  }, []);

  const handleDelete = useCallback((id) => {
    console.log('Delete', id);
    // Show delete confirmation
  }, []);

  const handleView = useCallback((id) => {
    console.log('View', id);
    // Navigate to detail page
  }, []);

  const handleSelect = useCallback((id, checked) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  // Single onClick handler for entire table
  return (
    <table onClick={handleTableClick}>
      <tbody>
        {data.map(row => (
          <tr key={row.id} data-row-id={row.id}>
            <td>
              {/* No inline functions! Use data-action attributes */}
              <button data-action="edit">Edit</button>
              <button data-action="delete">Delete</button>
              <button data-action="view">View</button>
              <input
                type="checkbox"
                data-action="select"
                checked={selectedRows.has(row.id)}
                onChange={() => {}} // Handled by delegation
              />
            </td>
            <td>{row.name}</td>
            <td>{row.email}</td>
            <td>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Advanced: Virtualized List with Event Delegation:**

```javascript
// ✅ EXCELLENT: Combine virtualization + event delegation
import { FixedSizeList } from 'react-window';

function VirtualizedDataTable({ data }) {
  const listRef = useRef(null);

  // Single delegated handler
  const handleAction = useCallback((action, rowId) => {
    switch (action) {
      case 'edit':
        openEditModal(rowId);
        break;
      case 'delete':
        deleteRow(rowId);
        break;
      case 'view':
        viewDetails(rowId);
        break;
    }
  }, []);

  // Row component (memoized)
  const Row = memo(({ index, style }) => {
    const row = data[index];

    return (
      <div style={style} data-row-id={row.id}>
        <button onClick={() => handleAction('edit', row.id)}>Edit</button>
        <button onClick={() => handleAction('delete', row.id)}>Delete</button>
        <button onClick={() => handleAction('view', row.id)}>View</button>
        <span>{row.name}</span>
        <span>{row.email}</span>
      </div>
    );
  });

  return (
    <FixedSizeList
      ref={listRef}
      height={600}
      itemCount={data.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

**Handling Event Pooling Issues (React <17):**

```javascript
// React <17: Common pooling bugs and solutions

// ❌ BAD: Async access without persist
function SearchInput() {
  const [query, setQuery] = useState('');

  const handleChange = (event) => {
    // Debounce with setTimeout
    setTimeout(() => {
      setQuery(event.target.value); // null! Event was pooled
    }, 300);
  };

  return <input onChange={handleChange} />;
}

// ✅ GOOD: Extract value immediately
function SearchInput() {
  const [query, setQuery] = useState('');
  const timeoutRef = useRef(null);

  const handleChange = (event) => {
    const value = event.target.value; // Extract immediately!

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setQuery(value); // Works!
    }, 300);
  };

  return <input onChange={handleChange} />;
}

// ✅ ALTERNATIVE: Use persist() (React <17 only)
function SearchInput() {
  const [query, setQuery] = useState('');
  const timeoutRef = useRef(null);

  const handleChange = (event) => {
    event.persist(); // Prevent pooling

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setQuery(event.target.value); // Works!
    }, 300);
  };

  return <input onChange={handleChange} />;
}
```

**Results After Optimization:**

```
After Optimization:
- Initial render: 124ms (31× faster)
- Memory usage: 47MB (90% reduction)
- Event listeners: 127 (99.7% reduction)
- Scroll FPS: 60 FPS (4× improvement)
- Re-render on data update: 89ms (26× faster)

Business Impact:
- Page load time: 3.8s → 0.9s (76% faster)
- User satisfaction: 62% → 94%
- Support tickets (performance): -87%
- Bounce rate: 34% → 12%
```

---

### ⚖️ Trade-offs

**1. Event Delegation vs Individual Listeners**

| Aspect | Event Delegation | Individual Listeners |
|--------|-----------------|---------------------|
| **Performance** | ✅ Fewer listeners, less memory | ❌ More listeners, more memory |
| **Scalability** | ✅ Constant listeners (large lists) | ❌ O(n) listeners |
| **Code Simplicity** | ⚠️ More complex routing logic | ✅ Simple, direct handlers |
| **Dynamic Content** | ✅ Works with added/removed elements | ❌ Must attach/detach manually |
| **Event Target Access** | ⚠️ Need to find actual target | ✅ Direct access to element |
| **Debugging** | ⚠️ Harder to trace event flow | ✅ Easier to debug |

**When to Use Event Delegation:**

```javascript
// ✅ GOOD: Large lists with many items
function TodoList({ todos }) {
  // 1000 todos = 1 listener (not 1000)
  const handleClick = (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const id = parseInt(button.closest('[data-id]').dataset.id, 10);

    if (action === 'delete') deleteTodo(id);
    if (action === 'edit') editTodo(id);
  };

  return (
    <ul onClick={handleClick}>
      {todos.map(todo => (
        <li key={todo.id} data-id={todo.id}>
          <span>{todo.text}</span>
          <button data-action="edit">Edit</button>
          <button data-action="delete">Delete</button>
        </li>
      ))}
    </ul>
  );
}

// ✅ GOOD: Dynamic content (items added/removed frequently)
function DynamicList() {
  const [items, setItems] = useState([]);

  const handleListClick = (e) => {
    // Works for dynamically added items
    const item = e.target.closest('[data-item]');
    if (item) handleItemClick(item.dataset.item);
  };

  return <div onClick={handleListClick}>...</div>;
}
```

**When to Use Individual Listeners:**

```javascript
// ✅ GOOD: Few static elements
function Navigation() {
  // Only 3-4 buttons, individual listeners are fine
  return (
    <nav>
      <button onClick={handleHome}>Home</button>
      <button onClick={handleAbout}>About</button>
      <button onClick={handleContact}>Contact</button>
    </nav>
  );
}

// ✅ GOOD: Complex interactive components
function Slider({ value, onChange }) {
  // Specific event handling logic
  const handleMouseDown = (e) => { /* ... */ };
  const handleMouseMove = (e) => { /* ... */ };
  const handleMouseUp = (e) => { /* ... */ };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      ...
    </div>
  );
}
```

**2. Event Pooling: React <17 vs React 17+**

| Aspect | React <17 (Pooling) | React 17+ (No Pooling) |
|--------|-------------------|----------------------|
| **Performance** | ✅ Less GC, reuses objects | ⚠️ More GC (minimal in practice) |
| **Async Access** | ❌ Must call persist() | ✅ Always works |
| **Developer Experience** | ❌ Confusing, easy to bug | ✅ Intuitive, predictable |
| **Memory Usage** | ✅ Slightly lower | ⚠️ Slightly higher (negligible) |
| **Debugging** | ❌ Hard to debug pooled events | ✅ Events persist in debugger |

```javascript
// React <17: Must handle pooling
function Form() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    event.persist(); // Required for async!

    const formData = new FormData(event.target);
    await submitForm(formData);

    console.log(event.target); // Now works
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// React 17+: Pooling removed, always works
function Form() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    // No persist() needed!

    const formData = new FormData(event.target);
    await submitForm(formData);

    console.log(event.target); // Works automatically
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**3. Inline Handlers vs Delegation in Lists**

```javascript
// Scenario: 1000-item list with action buttons

// ❌ BAD: Inline handlers (1000+ new functions per render)
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <button onClick={() => handleEdit(item.id)}>Edit</button>
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
// Performance: ~180ms render time, 450MB memory

// ⚠️ BETTER: useCallback (still 1000+ stable references)
function List({ items }) {
  const handleEdit = useCallback((id) => { /* ... */ }, []);
  const handleDelete = useCallback((id) => { /* ... */ }, []);

  return (
    <ul>
      {items.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}
// Performance: ~95ms render time, 280MB memory

// ✅ BEST: Event delegation (1 listener)
function List({ items }) {
  const handleClick = useCallback((e) => {
    const action = e.target.dataset.action;
    const id = parseInt(e.target.closest('[data-id]').dataset.id, 10);

    if (action === 'edit') handleEdit(id);
    if (action === 'delete') handleDelete(id);
  }, []);

  return (
    <ul onClick={handleClick}>
      {items.map(item => (
        <li key={item.id} data-id={item.id}>
          <button data-action="edit">Edit</button>
          <button data-action="delete">Delete</button>
        </li>
      ))}
    </ul>
  );
}
// Performance: ~28ms render time, 89MB memory
```

**Decision Matrix:**

```
Use Event Delegation when:
- Large lists (100+ items)
- Dynamic content (frequent adds/removes)
- Performance is critical
- Memory constraints exist

Use Individual Listeners when:
- Small number of elements (<20)
- Complex event logic per element
- Need direct element reference
- Readability > micro-optimization

Use event.persist() (React <17) when:
- Accessing event asynchronously
- Storing event in state
- Passing event to callbacks

Extract values immediately when:
- Working with React <17
- Don't need full event object
- Simpler than persist()
- Better performance

Upgrade to React 17+ when:
- Event pooling causes bugs
- Want simpler async event handling
- Need gradual React version adoption
- Want event listeners on root (not document)
```

---

### 💬 Explain to Junior

**Simple Explanation:**

Event delegation is like having a teacher (parent) watch the entire classroom instead of hiring a tutor for each student (child element).

**The Classroom Analogy:**

```javascript
// ❌ Without delegation (inefficient)
// Hiring a tutor for each of 30 students
students.forEach(student => {
  student.addEventListener('question', answerQuestion);
}); // 30 tutors needed!

// ✅ With delegation (efficient)
// One teacher watches the whole class
classroom.addEventListener('question', (event) => {
  const student = event.target; // Who asked?
  answerQuestion(student);
}); // Only 1 teacher needed!
```

**Event Pooling - The Rental Car Analogy:**

React <17 treated events like rental cars:

```javascript
// React <17: Event pooling

// You rent a car (event object) for a trip
function handleClick(event) {
  console.log(event.target); // Using the car right now - works!

  // Try to use the car later...
  setTimeout(() => {
    console.log(event.target); // Car returned to rental company - null!
  }, 100);

  // Solution 1: Buy the car (persist)
  event.persist(); // Now it's yours to keep!

  // Solution 2: Take a photo (extract data)
  const target = event.target; // Save what you need
  setTimeout(() => {
    console.log(target); // Photo still works!
  }, 100);
}

// React 17+: You own the car
function handleClick(event) {
  // No rental, no return - it's yours!
  setTimeout(() => {
    console.log(event.target); // Still works!
  }, 100);
}
```

**Key Concepts in Simple Terms:**

**1. Event Delegation:**

```javascript
// Instead of this (100 listeners):
{items.map(item => (
  <button onClick={() => handleClick(item.id)}>
    Click {item.id}
  </button>
))}

// Do this (1 listener):
<div onClick={handleClick}>
  {items.map(item => (
    <button data-id={item.id}>
      Click {item.id}
    </button>
  ))}
</div>

function handleClick(event) {
  const id = event.target.dataset.id;
  console.log('Clicked:', id);
}
```

**2. Finding the Right Target:**

```javascript
// When you click, you might click the icon inside the button
<button data-action="delete">
  <Icon /> {/* You clicked this */}
  Delete
</button>

// Use .closest() to find the actual button
function handleClick(event) {
  // Find the nearest button, even if you clicked the icon
  const button = event.target.closest('button[data-action]');
  if (!button) return; // Clicked something else

  const action = button.dataset.action;
  console.log('Action:', action); // "delete"
}
```

**3. Common Patterns:**

```javascript
// Pattern 1: Simple delegation
function List() {
  const handleClick = (e) => {
    const id = e.target.dataset.id;
    if (id) console.log('Clicked:', id);
  };

  return (
    <ul onClick={handleClick}>
      <li data-id="1">Item 1</li>
      <li data-id="2">Item 2</li>
      <li data-id="3">Item 3</li>
    </ul>
  );
}

// Pattern 2: Different actions
function List() {
  const handleClick = (e) => {
    const action = e.target.dataset.action;
    const id = e.target.closest('[data-id]').dataset.id;

    if (action === 'edit') editItem(id);
    if (action === 'delete') deleteItem(id);
  };

  return (
    <ul onClick={handleClick}>
      <li data-id="1">
        Item 1
        <button data-action="edit">Edit</button>
        <button data-action="delete">Delete</button>
      </li>
    </ul>
  );
}

// Pattern 3: Preventing unwanted clicks
function List() {
  const handleClick = (e) => {
    // Only handle button clicks
    const button = e.target.closest('button');
    if (!button) return; // Ignore other clicks

    const action = button.dataset.action;
    handleAction(action);
  };

  return (
    <div onClick={handleClick}>
      <h2>Title</h2> {/* Clicking this does nothing */}
      <button data-action="submit">Submit</button>
    </div>
  );
}
```

**4. Event Pooling (React <17 only):**

```javascript
// The "rental car" problem
function Input() {
  const handleChange = (event) => {
    // Right now: event works
    console.log(event.target.value); // "hello"

    // Later: event returned to pool
    setTimeout(() => {
      console.log(event.target.value); // null!
    }, 100);
  };

  return <input onChange={handleChange} />;
}

// Solution 1: Take what you need immediately
function Input() {
  const handleChange = (event) => {
    const value = event.target.value; // Save it!

    setTimeout(() => {
      console.log(value); // Works!
    }, 100);
  };

  return <input onChange={handleChange} />;
}

// Solution 2: Keep the event (React <17)
function Input() {
  const handleChange = (event) => {
    event.persist(); // Don't return to pool

    setTimeout(() => {
      console.log(event.target.value); // Works!
    }, 100);
  };

  return <input onChange={handleChange} />;
}
```

**Interview Answer Template:**

"Event delegation is a pattern where React attaches event listeners to a parent element instead of individual child elements. When you click a child, the event bubbles up to the parent, and React determines which handler to call based on the event target. This improves performance because you only need one listener instead of hundreds or thousands.

Event pooling was a performance optimization in React 16 and earlier where React reused event objects to reduce garbage collection. After your event handler finished, React would nullify the event properties and return it to a pool for reuse. This caused issues when accessing events asynchronously - you had to call `event.persist()` to keep the event alive. In React 17+, event pooling was removed because modern JavaScript engines are efficient enough that the performance benefit wasn't worth the confusion.

For example, in a list of 1000 items, instead of creating 1000 click handlers, you can use event delegation to attach one handler to the parent and use `event.target.dataset` to identify which item was clicked. This dramatically reduces memory usage and improves render performance."

**Common Mistakes:**

```javascript
// Mistake 1: Not checking if target exists
function handleClick(e) {
  const id = e.target.dataset.id; // What if no data-id?
  console.log(id); // undefined!
}

// Fix: Check before using
function handleClick(e) {
  const element = e.target.closest('[data-id]');
  if (!element) return; // Exit early

  const id = element.dataset.id;
  console.log(id); // Safe!
}

// Mistake 2: Forgetting stopPropagation
function Parent() {
  return (
    <div onClick={() => console.log('Parent')}>
      <button onClick={() => console.log('Child')}>
        Click
      </button>
    </div>
  );
}
// Clicking button logs: "Child" then "Parent" (bubbles up!)

// Fix: Stop propagation if needed
function Parent() {
  return (
    <div onClick={() => console.log('Parent')}>
      <button onClick={(e) => {
        e.stopPropagation(); // Stop bubbling
        console.log('Child');
      }}>
        Click
      </button>
    </div>
  );
}
// Now only logs: "Child"

// Mistake 3: Async event access (React <17)
function handleSubmit(event) {
  event.preventDefault();

  // ❌ BAD
  fetch('/api').then(() => {
    console.log(event.target); // null!
  });

  // ✅ GOOD
  const form = event.target;
  fetch('/api').then(() => {
    console.log(form); // Works!
  });
}
```

**When to Use What:**

```
Small list (< 20 items):
→ Individual handlers are fine
→ More readable, easier to debug

Large list (100+ items):
→ Use event delegation
→ Much better performance

React <17:
→ Extract values immediately for async
→ Or use event.persist() if you need the whole event

React 17+:
→ Events work everywhere
→ No need for persist()
```
