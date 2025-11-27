# React Portals - Rendering Outside the DOM Hierarchy

## Question 1: What are React portals and when should you use them?

### Answer

React portals provide a way to render children into a DOM node that exists outside the parent component's DOM hierarchy. Created using `ReactDOM.createPortal(child, container)`, portals allow you to "teleport" JSX to a different part of the DOM tree while maintaining React's component tree structure.

**Key characteristics:**
- **DOM placement**: Render to any DOM node, typically `document.body` or dedicated portal roots
- **React tree preservation**: Component remains part of React component tree for context, state, and props
- **Event bubbling**: Events bubble through React tree, not DOM tree
- **Use cases**: Modals, tooltips, dropdowns, notifications, popovers

**Primary use cases:**

1. **Modals/Dialogs**: Render above all other content without z-index battles
2. **Tooltips/Popovers**: Escape overflow:hidden containers
3. **Dropdowns**: Prevent clipping by positioned ancestors
4. **Notifications**: Render in fixed position independent of component location
5. **Full-screen overlays**: Video players, image galleries, lightboxes

**Basic syntax:**
```javascript
ReactDOM.createPortal(
  <div>Portal content</div>,
  document.getElementById('portal-root')
)
```

Portals solve CSS stacking context issues by rendering content outside the constrained parent hierarchy while maintaining all React features like context, event handling, and state management.

---

### 🔍 Deep Dive: Portal Implementation and Event Bubbling

#### How ReactDOM.createPortal Works Internally

**Portal creation mechanism:**

```javascript
// React's portal implementation (simplified)
function createPortal(children, containerNode, key = null) {
  return {
    $$typeof: REACT_PORTAL_TYPE,
    key: key == null ? null : '' + key,
    children,
    containerInfo: containerNode,
    implementation: null,
  };
}

// During reconciliation
function updatePortalComponent(current, workInProgress) {
  const portalType = workInProgress.type;
  const nextChildren = workInProgress.pendingProps;

  // Create fiber for portal children
  reconcileChildren(current, workInProgress, nextChildren);

  // Mark for placement in different container
  workInProgress.stateNode = {
    containerInfo: portalType.containerInfo,
  };

  return workInProgress.child;
}
```

**Rendering process:**

1. **Fiber creation**: Portal creates a special fiber node with `REACT_PORTAL_TYPE`
2. **Reconciliation**: Children are reconciled normally in React tree
3. **Commit phase**: Instead of appending to parent DOM, React appends to portal container
4. **Host config**: React DOM uses `appendChildToContainer(container, child)` instead of `appendChild(parent, child)`

```javascript
// React DOM renderer portal handling
function commitPlacement(finishedWork) {
  const parentFiber = getHostParentFiber(finishedWork);

  if (parentFiber.tag === HostPortal) {
    // Use portal's container instead of parent
    const container = parentFiber.stateNode.containerInfo;
    appendChildToContainer(container, finishedWork.stateNode);
  } else {
    // Normal parent-child relationship
    const parent = parentFiber.stateNode;
    appendChild(parent, finishedWork.stateNode);
  }
}
```

#### Event Bubbling Through Portals

**Critical behavior**: Events bubble through React component tree, NOT DOM tree.

```javascript
// DOM structure
<div id="app">
  <div onClick={handleAppClick}>
    <Button onClick={handleButtonClick} />
  </div>
</div>
<div id="modal-root">
  <!-- Portal renders here -->
  <div onClick={handleModalClick}>Modal</div>
</div>

// React component tree
<App onClick={handleAppClick}>
  <Button onClick={handleButtonClick}>
    <Portal>
      <Modal onClick={handleModalClick} />
    </Portal>
  </Button>
</App>
```

**Event flow:**

1. User clicks inside modal (physically in `#modal-root`)
2. React captures event at document level
3. Event bubbles: `handleModalClick` → `handleButtonClick` → `handleAppClick`
4. DOM event bubbling would go: `handleModalClick` → document (skipping App/Button)

**Implementation of synthetic event bubbling:**

```javascript
// React's event delegation (simplified)
function dispatchEventForPluginEventSystem(
  topLevelType,
  nativeEvent,
  targetInst,
  nativeEventTarget
) {
  // Find path through React fiber tree
  const path = [];
  let node = targetInst;

  while (node !== null) {
    path.push(node);
    node = node.return; // Traverse up React tree, not DOM tree
  }

  // Bubble through React component tree
  for (let i = path.length - 1; i >= 0; i--) {
    const instance = path[i];
    const listener = getListener(instance, topLevelType);

    if (listener) {
      listener(nativeEvent);
    }

    if (nativeEvent.isPropagationStopped()) {
      break;
    }
  }
}
```

#### Portal Rendering Outside Hierarchy

**Complete implementation example:**

```javascript
// ❌ BAD: Rendering modal without portal
function BadModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// Problems:
// 1. Inherits z-index stacking context from parent
// 2. Affected by parent's overflow: hidden
// 3. Affected by parent's transform/filter (creates stacking context)
// 4. Positioned relative to nearest positioned ancestor

// ✅ GOOD: Modal with portal
function GoodModal({ isOpen, onClose, children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

// Benefits:
// 1. Independent z-index stacking context
// 2. Not affected by parent overflow
// 3. Not affected by parent transforms
// 4. Can use fixed positioning relative to viewport
```

#### Multiple Portal Roots

```javascript
// Managing multiple portal types
const PortalManager = {
  roots: {
    modal: null,
    tooltip: null,
    notification: null,
  },

  initialize() {
    Object.keys(this.roots).forEach(type => {
      const id = `${type}-root`;
      let root = document.getElementById(id);

      if (!root) {
        root = document.createElement('div');
        root.id = id;
        root.className = `portal-root portal-root--${type}`;
        document.body.appendChild(root);
      }

      this.roots[type] = root;
    });
  },

  getRoot(type) {
    if (!this.roots[type]) {
      this.initialize();
    }
    return this.roots[type];
  }
};

// Usage
function Modal({ children }) {
  return ReactDOM.createPortal(
    children,
    PortalManager.getRoot('modal')
  );
}

function Tooltip({ children }) {
  return ReactDOM.createPortal(
    children,
    PortalManager.getRoot('tooltip')
  );
}
```

#### Portal Performance Characteristics

**Rendering performance:**

```javascript
// Portal render timing
function measurePortalPerformance() {
  const metrics = {
    fiberCreation: 0,      // ~0.1ms (same as normal component)
    reconciliation: 0,      // ~0.5ms (same as normal component)
    domInsertion: 0,        // ~0.2ms (slightly slower due to different container)
    layoutEffects: 0,       // ~0.3ms (same as normal component)
  };

  // Portal adds minimal overhead (~0.1ms) for container lookup
  // Main cost is normal React reconciliation

  return metrics; // Total: ~1.1ms (vs ~1.0ms for normal render)
}
```

**Memory implications:**

- Each portal maintains reference to container DOM node
- No additional React fiber nodes (children are normal fibers)
- Event listeners still delegated at document level (no extra listeners)
- Memory overhead: ~100 bytes per portal instance

---

### 🐛 Real-World Scenario: Modal Z-Index and Overflow Issues

#### Production Problem: E-commerce Checkout Modal

**Context:**
- E-commerce platform with complex nested layout
- Product details in scrollable container with `overflow: hidden`
- "Quick Checkout" modal triggered from product card
- Modal appears behind header, gets clipped by container
- Affects 15,000+ daily checkouts, 8% abandonment due to UI issues

**Initial problematic implementation:**

```javascript
// ❌ BAD: Modal without portal
function ProductCard({ product }) {
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <div className="product-card"> {/* position: relative, overflow: hidden */}
      <img src={product.image} />
      <h3>{product.name}</h3>
      <button onClick={() => setShowCheckout(true)}>
        Quick Checkout
      </button>

      {showCheckout && (
        <div className="checkout-modal"> {/* Gets clipped! */}
          <CheckoutForm product={product} />
        </div>
      )}
    </div>
  );
}

// CSS
.product-card {
  position: relative;
  overflow: hidden; /* Clips modal content */
  border-radius: 8px;
  transform: translateZ(0); /* Creates stacking context */
}

.checkout-modal {
  position: fixed; /* Doesn't work - constrained by transform */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000; /* Useless - stacking context trapped */
}
```

**Issues encountered:**

1. **Stacking context trap**: Parent's `transform: translateZ(0)` creates new stacking context
2. **Overflow clipping**: Modal content clipped by `overflow: hidden`
3. **Z-index ineffective**: Modal can't escape parent's stacking context
4. **Positioning broken**: `position: fixed` relative to nearest transformed ancestor, not viewport

**Measured impact:**

```javascript
// Analytics data
const problemMetrics = {
  dailyAffectedUsers: 15234,
  modalNotFullyVisible: '43%',    // Modal partially clipped
  modalBehindHeader: '28%',        // Z-index issue
  checkoutAbandonment: '8.2%',     // Up from 5.1% baseline
  supportTickets: 47,               // Daily complaints
  revenueImpact: -12400,            // Daily USD lost
};
```

**Debugging process:**

```javascript
// Step 1: Identify stacking context issues
function debugStackingContext(element) {
  const styles = window.getComputedStyle(element);
  const stackingContextCreators = [];

  if (styles.position !== 'static' && styles.zIndex !== 'auto') {
    stackingContextCreators.push('position + z-index');
  }
  if (styles.opacity !== '1') {
    stackingContextCreators.push('opacity');
  }
  if (styles.transform !== 'none') {
    stackingContextCreators.push('transform');
  }
  if (styles.filter !== 'none') {
    stackingContextCreators.push('filter');
  }
  if (styles.willChange !== 'auto') {
    stackingContextCreators.push('will-change');
  }

  console.log(`Stacking contexts created by: ${stackingContextCreators.join(', ')}`);
}

// Step 2: Trace ancestor overflow
function debugOverflow(element) {
  let current = element.parentElement;
  const overflowChain = [];

  while (current) {
    const styles = window.getComputedStyle(current);
    if (styles.overflow !== 'visible' || styles.overflowX !== 'visible' || styles.overflowY !== 'visible') {
      overflowChain.push({
        element: current.className,
        overflow: styles.overflow,
      });
    }
    current = current.parentElement;
  }

  console.log('Overflow ancestors:', overflowChain);
}

// Results:
// Stacking contexts: transform (product-card), filter (category-section)
// Overflow: product-card (hidden), product-grid (auto)
```

**Solution with portals:**

```javascript
// ✅ GOOD: Modal with portal
function ProductCard({ product }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [modalRoot, setModalRoot] = useState(null);

  useEffect(() => {
    // Ensure modal root exists
    let root = document.getElementById('modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
    }
    setModalRoot(root);
  }, []);

  return (
    <div className="product-card">
      <img src={product.image} />
      <h3>{product.name}</h3>
      <button onClick={() => setShowCheckout(true)}>
        Quick Checkout
      </button>

      {showCheckout && modalRoot && ReactDOM.createPortal(
        <CheckoutModal
          product={product}
          onClose={() => setShowCheckout(false)}
        />,
        modalRoot
      )}
    </div>
  );
}

// Modal component
function CheckoutModal({ product, onClose }) {
  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <CheckoutForm product={product} onComplete={onClose} />
      </div>
    </div>
  );
}

// CSS - Now works correctly
.modal-overlay {
  position: fixed; /* Works - no transformed ancestors */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000; /* Works - independent stacking context */
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1001;
}
```

**Results after implementation:**

```javascript
const afterPortalMetrics = {
  modalFullyVisible: '100%',        // ✅ Up from 57%
  modalCorrectlyPositioned: '100%', // ✅ Up from 72%
  checkoutAbandonment: '5.3%',      // ✅ Down from 8.2%
  supportTickets: 3,                 // ✅ Down from 47
  revenueRecovered: 11800,          // ✅ Daily USD
  renderPerformance: '1.2ms',       // Minimal overhead
};
```

#### Tooltip Overflow Problem

**Scenario:** Tooltip in scrollable dashboard panel gets clipped.

```javascript
// ❌ BAD: Tooltip without portal
function DashboardMetric({ label, value, helpText }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="metric"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span>{label}: {value}</span>
      {showTooltip && (
        <div className="tooltip">{helpText}</div> // Gets clipped by parent overflow
      )}
    </div>
  );
}

// Parent container
<div className="dashboard-panel" style={{ overflow: 'auto', height: '400px' }}>
  <DashboardMetric label="Revenue" value="$125k" helpText="..." />
</div>
```

**Problem:** Tooltip extends beyond panel height, gets clipped by `overflow: auto`.

```javascript
// ✅ GOOD: Tooltip with portal
function Tooltip({ children, content, placement = 'top' }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 200; // Approximate
    const tooltipHeight = 50;

    let top, left;

    switch (placement) {
      case 'top':
        top = rect.top - tooltipHeight - 8;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - 8;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + 8;
        break;
    }

    setPosition({ top, left });
  }, [placement]);

  useEffect(() => {
    if (show) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [show, updatePosition]);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </span>

      {show && ReactDOM.createPortal(
        <div
          className="tooltip-portal"
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999,
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}
```

**Performance impact:** Tooltip position calculation runs on scroll (throttled), adds ~0.5ms overhead per scroll event.

---

<details>
<summary><strong>⚖️ Trade-offs: Portals vs Regular Rendering</strong></summary>

#### When to Use Portals

| **Scenario** | **Use Portal?** | **Reason** |
|--------------|----------------|-----------|
| Modal dialogs | ✅ Yes | Need to escape stacking context, overlay entire viewport |
| Tooltips | ✅ Yes | Need to escape overflow: hidden, position relative to viewport |
| Dropdowns in constrained containers | ✅ Yes | Prevent clipping by overflow/transform ancestors |
| Notifications/Toasts | ✅ Yes | Need fixed positioning independent of component location |
| Sidebar overlays | ✅ Yes | Full-height overlay regardless of parent constraints |
| Simple inline popover | ❌ No | No overflow/stacking issues, simpler without portal |
| Form validation messages | ❌ No | Should be positioned relative to input, inherit context |
| Dropdown in unconstrained space | ❌ No | No overflow issues, extra complexity unnecessary |

#### Performance Comparison

```javascript
// Benchmark: Regular vs Portal rendering
const performanceComparison = {
  regularRender: {
    fiberCreation: '0.08ms',
    reconciliation: '0.45ms',
    domOperations: '0.15ms',
    layoutEffects: '0.25ms',
    total: '0.93ms',
    memoryPerInstance: '~50 bytes',
  },

  portalRender: {
    fiberCreation: '0.10ms',      // +0.02ms for portal fiber
    reconciliation: '0.45ms',      // Same
    domOperations: '0.18ms',       // +0.03ms for container lookup
    layoutEffects: '0.25ms',       // Same
    total: '0.98ms',               // +5% overhead
    memoryPerInstance: '~150 bytes', // +100 bytes for container ref
  },
};

// Verdict: Minimal performance difference
// Portal overhead: ~0.05ms per render, 100 bytes per instance
```

#### CSS Stacking Context Trade-offs

```javascript
// Portal benefits for stacking context
const stackingContextScenarios = {
  scenario1: {
    description: 'Modal in component with transform',
    withoutPortal: {
      problem: 'Fixed positioning relative to transformed ancestor',
      zIndexWorks: false,
      canOverlayViewport: false,
    },
    withPortal: {
      solution: 'Renders to body, independent stacking context',
      zIndexWorks: true,
      canOverlayViewport: true,
    },
  },

  scenario2: {
    description: 'Tooltip in overflow:hidden container',
    withoutPortal: {
      problem: 'Content clipped by ancestor overflow',
      visibility: 'partial or hidden',
    },
    withPortal: {
      solution: 'Renders outside container, full visibility',
      visibility: 'complete',
    },
  },
};
```

**Stacking context creators (avoid these in parent hierarchy):**

- `position: relative/absolute/fixed` + `z-index: <value>`
- `opacity: <1`
- `transform: <value>`
- `filter: <value>`
- `perspective: <value>`
- `clip-path: <value>`
- `mask: <value>`
- `mix-blend-mode: <value>`
- `isolation: isolate`
- `will-change: <stacking-property>`

#### Event Handling Differences

```javascript
// Event bubbling comparison
function EventBubblingDemo() {
  const handleAppClick = () => console.log('App clicked');
  const handleButtonClick = () => console.log('Button clicked');
  const handleModalClick = () => console.log('Modal clicked');

  return (
    <div onClick={handleAppClick}>
      <button onClick={handleButtonClick}>
        Open Modal

        {/* Portal modal */}
        {ReactDOM.createPortal(
          <div onClick={handleModalClick}>Modal</div>,
          document.body
        )}
      </button>
    </div>
  );
}

// Click on modal triggers:
// 1. handleModalClick
// 2. handleButtonClick ✅ (React tree bubbling)
// 3. handleAppClick ✅ (React tree bubbling)

// WITHOUT portal (regular DOM child):
// 1. handleModalClick
// 2. handleButtonClick ✅ (same - React tree bubbling)
// 3. handleAppClick ✅ (same - React tree bubbling)

// Key difference: DOM bubbling vs React bubbling
// Portal: DOM bubbling goes to body, React bubbling goes to parent component
// Regular: Both DOM and React bubbling follow same path
```

**Event handling gotcha:**

```javascript
// ❌ PROBLEM: Stopping propagation affects React, not DOM
function ModalWithPortal() {
  const handleOverlayClick = (e) => {
    e.stopPropagation(); // Stops React bubbling, not DOM bubbling
    closeModal();
  };

  return ReactDOM.createPortal(
    <div onClick={handleOverlayClick}>
      <div onClick={(e) => e.stopPropagation()}>
        Modal content
      </div>
    </div>,
    document.body
  );
}

// Parent component
function Parent() {
  const handleParentClick = () => {
    console.log('Parent clicked'); // Won't fire - React propagation stopped
  };

  return (
    <div onClick={handleParentClick}>
      <ModalWithPortal />
    </div>
  );
}

// But document.body click listeners WILL fire (DOM bubbling continues)
```

#### SSR and Hydration Considerations

```javascript
// ❌ BAD: Portal on server causes hydration mismatch
function BadServerModal({ isOpen, children }) {
  if (!isOpen) return null;

  // Crashes on server - document not available
  return ReactDOM.createPortal(
    children,
    document.getElementById('modal-root')
  );
}

// ✅ GOOD: Portal with SSR safety
function GoodServerModal({ isOpen, children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  // Don't render portal on server
  if (!mounted) {
    return null; // Or return placeholder
  }

  return ReactDOM.createPortal(
    children,
    document.getElementById('modal-root')
  );
}

// Alternative: Use lazy mounting
function LazyPortal({ children }) {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    setContainer(el);

    return () => {
      document.body.removeChild(el);
    };
  }, []);

  return container ? ReactDOM.createPortal(children, container) : null;
}
```

**SSR trade-offs:**

| **Approach** | **SEO** | **First Paint** | **Hydration** | **Use Case** |
|--------------|---------|----------------|---------------|--------------|
| No SSR (client-only) | ❌ Poor | Fast | Simple | Admin panels, authenticated content |
| SSR placeholder | ⚠️ Partial | Fast | Complex | Modals (render placeholder, hydrate to portal) |
| SSR + client portal | ✅ Good | Slow | Tricky | Critical modals with content |

#### Accessibility Trade-offs

```javascript
// Portal accessibility challenges
const accessibilityConsiderations = {
  focusManagement: {
    problem: 'Focus can escape portal to background content',
    solution: 'Focus trap using react-focus-lock or manual management',
  },

  screenReaderAnnouncement: {
    problem: 'Portal content may not be announced properly',
    solution: 'ARIA live regions, role="dialog", aria-modal="true"',
  },

  keyboardNavigation: {
    problem: 'Tab order disconnected from visual order',
    solution: 'Manual tab order management, inert background',
  },
};

// ✅ Accessible portal modal
function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocus.current = document.activeElement;

      // Focus modal
      modalRef.current?.focus();

      // Make background inert
      document.getElementById('app-root')?.setAttribute('inert', '');

      return () => {
        // Restore focus
        previousFocus.current?.focus();

        // Remove inert
        document.getElementById('app-root')?.removeAttribute('inert');
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <h2 id="modal-title">{title}</h2>
      {children}
    </div>,
    document.getElementById('modal-root')
  );
}
```

---

### 💬 Explain to Junior: The Portal Teleportation Concept

#### The Magic Door Analogy

Imagine you're in a house with many rooms (React components). Each room has furniture (DOM elements) arranged in a specific layout. Now imagine you want to hang a painting, but:

1. **Problem**: The wall you want to hang it on is in the living room, but you're currently in the bedroom closet (deeply nested component)
2. **Without Portal**: You try to hang the painting in the closet, but it gets hidden behind other furniture (overflow:hidden), or the closet's lighting (z-index/stacking context) makes it look wrong
3. **With Portal**: You create a "magic door" (portal) that lets you teleport the painting directly to the living room wall, while you remain in the closet

**Key insight**: You (the component) stay in the closet (React tree), but the painting (DOM element) teleports to the living room (different DOM location).

#### Simple Mental Model

```javascript
// Regular rendering: "I render where I live"
function Component() {
  return <div>I appear where Component is in the DOM tree</div>;
}

// Portal rendering: "I live here, but I render there"
function ComponentWithPortal() {
  return ReactDOM.createPortal(
    <div>I appear in document.body, but I live in Component's React tree</div>,
    document.body
  );
}
```

**Think of it as:**
- **Your apartment address** (React tree position): Where you "live", receive mail (props), share utilities (context)
- **Your workplace** (DOM position): Where you physically show up, different building

Portal = commuting to work while still living at home. You're part of your family (React tree) but work elsewhere (DOM tree).

#### Common Beginner Confusions - Explained

**Confusion 1: "Does portal break React context?"**

```javascript
// ❌ WRONG ASSUMPTION
"Portal renders outside React tree, so it can't access context"

// ✅ TRUTH
const ThemeContext = React.createContext();

function Parent() {
  return (
    <ThemeContext.Provider value="dark">
      <Child />
    </ThemeContext.Provider>
  );
}

function Child() {
  const theme = useContext(ThemeContext); // ✅ Works perfectly!

  return ReactDOM.createPortal(
    <div>{theme}</div>, // Displays "dark"
    document.body
  );
}

// Why it works: Portal stays in React component tree
// Only DOM rendering happens elsewhere
```

**Analogy**: You move to a different office building (DOM), but your company benefits (context) still apply because you're still employed by the same company (React tree).

**Confusion 2: "Events don't bubble through portals?"**

```javascript
// ❌ WRONG ASSUMPTION
"Portal is in document.body, so clicks bubble to body, not parent"

// ✅ TRUTH
function Parent() {
  const handleClick = () => console.log('Parent clicked!');

  return (
    <div onClick={handleClick}>
      <button>
        {ReactDOM.createPortal(
          <span>Click me</span>, // Clicking here DOES trigger Parent's handleClick
          document.body
        )}
      </button>
    </div>
  );
}

// Why it works: React uses synthetic events that bubble through React tree
```

**Analogy**: You work in a different building (DOM), but when you send an email (event), it goes through your company's hierarchy (React tree), not the building's management (DOM tree).

#### Interview Answer Templates

**Q: "What are React portals?"**

**Template answer:**
```
"React portals let you render a component's JSX into a different part of the DOM tree,
outside the parent component's DOM hierarchy, while keeping it in the React component tree.

This is useful for modals, tooltips, and dropdowns that need to:
1. Escape overflow:hidden containers
2. Avoid z-index stacking context issues
3. Render in fixed position relative to viewport

You create a portal using ReactDOM.createPortal(child, domNode).

The key insight is that portals maintain React features like context and event bubbling
because the component stays in the React tree - only the DOM rendering happens elsewhere.

For example, [give modal example with overflow:hidden problem and portal solution]."
```

**Q: "When would you use a portal?"**

**Template answer:**
```
"I'd use portals when CSS positioning and stacking contexts cause issues:

1. Modals/Dialogs - Need to overlay entire screen without z-index battles
2. Tooltips - Need to escape parent's overflow:hidden or transform
3. Dropdowns - Need to extend beyond scrollable containers

I wouldn't use portals for simple inline content where there's no overflow or
stacking context issues - it adds unnecessary complexity.

The trade-off is minimal performance overhead (about 5%) but significantly simpler
CSS since you're not fighting stacking contexts."
```

**Q: "How do events work with portals?"**

**Template answer:**
```
"Events bubble through the React component tree, not the DOM tree.

This means if you have a portal rendered to document.body, clicking inside the portal
will trigger parent component's onClick handlers in the React tree, even though the
DOM element is not actually a child in the DOM.

This is because React uses synthetic events with event delegation at the document level.
When you click, React traces the fiber tree (React's internal component tree) to determine
which handlers to call.

This can be surprising at first, but it's actually helpful because your portal behaves
like a normal child component from the React perspective, while having the flexibility
to render anywhere in the DOM."
```

#### Practical Tips for Juniors

**Tip 1: Always check if you need a portal**

```javascript
// Ask yourself these questions:
const needsPortal = {
  hasOverflowHidden: false,     // Check parent styles
  hasTransformAncestor: false,  // Check parent styles
  needsViewportPosition: false, // Fixed relative to viewport?
  hasZIndexIssues: false,       // Can't get above other content?
};

// If all false → Don't use portal, simpler without it
// If any true → Portal will solve the problem
```

**Tip 2: Set up portal root in HTML**

```html
<!-- index.html -->
<body>
  <div id="root"></div>
  <div id="modal-root"></div>
  <div id="tooltip-root"></div>
</body>
```

**Tip 3: Handle SSR carefully**

```javascript
// Always use this pattern for Next.js/SSR
function SafePortal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Don't render on server

  return ReactDOM.createPortal(
    children,
    document.getElementById('modal-root')
  );
}
```

**Tip 4: Remember to clean up**

```javascript
// Portal content stays in DOM even after unmount if you create container dynamically
function PortalWithCleanup({ children }) {
  const [container] = useState(() => document.createElement('div'));

  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container); // Clean up!
    };
  }, [container]);

  return ReactDOM.createPortal(children, container);
}
```

#### Visual Debugging for Portals

```javascript
// Add this to help visualize portal rendering
function DebugPortal({ children, label }) {
  const portalRoot = document.getElementById('modal-root');

  // Add visual indicator
  useEffect(() => {
    portalRoot.style.border = '2px solid red';
    console.log(`Portal "${label}" rendered to:`, portalRoot);

    return () => {
      portalRoot.style.border = '';
    };
  }, [portalRoot, label]);

  return ReactDOM.createPortal(
    <div data-portal-label={label}>
      {children}
    </div>,
    portalRoot
  );
}

// Use in development
<DebugPortal label="Checkout Modal">
  <CheckoutForm />
</DebugPortal>
```

---

## Question 2: How do portals handle events and context?

### Answer

React portals maintain full integration with React's component tree for events and context, despite rendering to a different DOM location. This creates a unique characteristic: **DOM hierarchy differs from React hierarchy**.

**Context behavior:**
- **Full context access**: Portal components receive all context from ancestors in React tree
- **Provider/Consumer pattern works**: Context providers above portal affect portal children
- **No special handling needed**: Access context with `useContext` or `Context.Consumer` normally

**Event handling:**
- **React tree bubbling**: Events bubble through React component hierarchy, not DOM hierarchy
- **Synthetic event system**: React's event delegation captures events at document level
- **Parent handlers trigger**: Parent `onClick` in React tree fires even if portal renders elsewhere
- **stopPropagation affects React tree**: `e.stopPropagation()` stops React bubbling, not DOM bubbling

**Key implications:**

1. **Context sharing**: Portal can access theme, user data, routing from parent providers
2. **Event composition**: Portal children can trigger parent callbacks naturally
3. **State management**: Redux/Zustand store access works normally
4. **Event delegation**: Custom event delegation must account for React vs DOM trees

This behavior makes portals feel like regular components from a React perspective, while giving DOM positioning flexibility.

---

### 🔍 Deep Dive: Event System and Context Propagation

#### React's Synthetic Event System with Portals

**Event delegation mechanism:**

```javascript
// React's event delegation (simplified internals)
class ReactDOMEventListener {
  constructor() {
    // React attaches ONE listener per event type at document/root
    this.eventTypes = ['click', 'keydown', 'change', 'submit', ...];
    this.rootContainer = document.getElementById('root');

    this.eventTypes.forEach(type => {
      // Modern React (v17+) attaches to root container, not document
      this.rootContainer.addEventListener(type, this.handleEvent, true); // Capture phase
      this.rootContainer.addEventListener(type, this.handleEvent, false); // Bubble phase
    });
  }

  handleEvent = (nativeEvent) => {
    // Find React fiber corresponding to event target
    const targetElement = nativeEvent.target;
    const targetFiber = this.getClosestFiberFromDOM(targetElement);

    if (!targetFiber) return;

    // Traverse React fiber tree (not DOM tree!)
    const eventPath = this.constructFiberPath(targetFiber);

    // Dispatch through React tree
    this.dispatchEventThroughPath(eventPath, nativeEvent);
  };

  constructFiberPath(fiber) {
    const path = [];
    let current = fiber;

    // Walk up fiber tree using .return pointer
    while (current !== null) {
      path.push(current);
      current = current.return; // ← This follows React tree, not DOM tree!
    }

    return path.reverse();
  }

  dispatchEventThroughPath(path, nativeEvent) {
    // Create synthetic event
    const syntheticEvent = new SyntheticEvent(nativeEvent);

    // Bubble through React component path
    for (let i = path.length - 1; i >= 0; i--) {
      const fiber = path[i];
      const handler = this.getHandlerFromFiber(fiber, nativeEvent.type);

      if (handler) {
        handler(syntheticEvent);
      }

      if (syntheticEvent.isPropagationStopped()) {
        break;
      }
    }
  }
}
```

**Portal fiber structure:**

```javascript
// React fiber tree with portal
const fiberTree = {
  tag: 'div',
  elementType: 'div',
  return: null, // Root
  child: {
    tag: 'App',
    return: parentRef,
    child: {
      tag: 'Button',
      return: appRef,
      child: {
        tag: 'Portal', // ← Special REACT_PORTAL_TYPE
        return: buttonRef, // ← Still points to Button as parent in React tree
        stateNode: {
          containerInfo: document.body, // ← DOM renders here
        },
        child: {
          tag: 'Modal',
          return: portalRef, // ← Modal's parent is Portal in React tree
          // But Modal's DOM parent is document.body!
        },
      },
    },
  },
};

// Key insight: fiber.return follows React tree, not DOM tree
// Portal's containerInfo determines DOM position
// Event bubbling uses fiber.return chain
```

#### Detailed Event Bubbling Example

```javascript
// Complete example showing React vs DOM bubbling
function EventBubblingDemo() {
  const [log, setLog] = useState([]);

  const addLog = (message) => {
    setLog(prev => [...prev, message]);
  };

  return (
    <div
      onClick={() => addLog('Grandparent React onClick')}
      style={{ padding: '20px', background: 'lightblue' }}
    >
      <div
        onClick={() => addLog('Parent React onClick')}
        style={{ padding: '20px', background: 'lightgreen' }}
      >
        <button
          onClick={() => addLog('Button React onClick')}
        >
          Open Portal Modal

          {ReactDOM.createPortal(
            <div
              onClick={() => addLog('Portal Overlay React onClick')}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
              }}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation(); // Stops React bubbling
                  addLog('Portal Content React onClick');
                }}
                style={{
                  background: 'white',
                  padding: '20px',
                  margin: '50px auto',
                  width: '300px',
                }}
              >
                Click me!
              </div>
            </div>,
            document.body
          )}
        </button>
      </div>

      <div>
        <h3>Event Log:</h3>
        {log.map((entry, i) => <div key={i}>{entry}</div>)}
      </div>
    </div>
  );
}

// Click on "Portal Content":
// 1. Portal Content React onClick ✅
// 2. Portal Overlay React onClick ❌ (stopped by e.stopPropagation)
// 3. Button React onClick ❌
// 4. Parent React onClick ❌
// 5. Grandparent React onClick ❌

// Without stopPropagation, order would be:
// 1. Portal Content React onClick
// 2. Portal Overlay React onClick
// 3. Button React onClick ← Travels through React tree!
// 4. Parent React onClick
// 5. Grandparent React onClick

// Note: DOM bubbling would go:
// Portal Content → Portal Overlay → document.body (no grandparent/parent)
```

#### Context Propagation Through Portals

**Context provider/consumer mechanism:**

```javascript
// React context implementation (simplified)
class ReactContext {
  constructor(defaultValue) {
    this._currentValue = defaultValue;
    this.Provider = this.createProvider();
    this.Consumer = this.createConsumer();
  }

  createProvider() {
    return ({ value, children }) => {
      // Store value in fiber's memoizedState
      const fiber = getCurrentFiber();
      fiber.memoizedState = { value };

      return children;
    };
  }

  createConsumer() {
    return ({ children }) => {
      const value = this.readContext();
      return children(value);
    };
  }

  readContext() {
    const fiber = getCurrentFiber();

    // Walk up fiber tree looking for Provider
    let currentFiber = fiber.return;
    while (currentFiber !== null) {
      if (currentFiber.type === this.Provider) {
        // Found provider - return its value
        return currentFiber.memoizedState.value;
      }
      currentFiber = currentFiber.return; // ← Walks React tree!
    }

    // No provider found - return default
    return this._currentValue;
  }
}

// Portal fiber tree for context
const contextFiberTree = {
  tag: 'ThemeProvider',
  memoizedState: { value: 'dark' }, // ← Provider stores value here
  child: {
    tag: 'App',
    return: themeProviderRef,
    child: {
      tag: 'Portal',
      return: appRef, // ← Portal's parent in React tree
      child: {
        tag: 'Modal',
        return: portalRef,
        // When Modal calls useContext(ThemeContext):
        // 1. Start at Modal fiber
        // 2. Walk up: portalRef.return → appRef.return → themeProviderRef
        // 3. Find ThemeProvider, read memoizedState.value
        // 4. Return 'dark' ✅
      },
    },
  },
};
```

**Complete context example:**

```javascript
// Multiple contexts through portal
const ThemeContext = React.createContext('light');
const UserContext = React.createContext(null);
const FeatureFlagsContext = React.createContext({});

function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState({ name: 'Alice', role: 'admin' });
  const [features, setFeatures] = useState({ newUI: true, betaFeatures: false });

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={user}>
        <FeatureFlagsContext.Provider value={features}>
          <Dashboard />
        </FeatureFlagsContext.Provider>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

function Dashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>Open Settings</button>

      {showModal && (
        <PortalModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function PortalModal({ onClose }) {
  // ✅ All contexts accessible despite portal!
  const theme = useContext(ThemeContext);           // 'dark'
  const user = useContext(UserContext);             // { name: 'Alice', role: 'admin' }
  const features = useContext(FeatureFlagsContext); // { newUI: true, betaFeatures: false }

  return ReactDOM.createPortal(
    <div className={`modal modal--${theme}`}>
      <h2>Settings for {user.name}</h2>
      {features.newUI && <NewUISettings />}
      {user.role === 'admin' && <AdminPanel />}
      <button onClick={onClose}>Close</button>
    </div>,
    document.body
  );
}

// Context flow:
// App Provider → Dashboard → Portal → PortalModal
// React tree: App → Dashboard → Portal → PortalModal
// DOM tree: #root → Dashboard | document.body → PortalModal
// Context follows React tree ✅
```

#### Event and Context Performance Implications

```javascript
// Performance characteristics
const performanceMetrics = {
  contextLookup: {
    withoutPortal: {
      fiberTreeTraversal: '2-3 fibers',
      time: '~0.001ms',
    },
    withPortal: {
      fiberTreeTraversal: '2-4 fibers', // Same or +1 for portal fiber
      time: '~0.001ms',
      overhead: 'Negligible',
    },
  },

  eventBubbling: {
    withoutPortal: {
      syntheticEventCreation: '~0.01ms',
      pathConstruction: '~0.02ms',
      handlerExecution: '~0.05ms',
      total: '~0.08ms',
    },
    withPortal: {
      syntheticEventCreation: '~0.01ms',
      pathConstruction: '~0.025ms', // +0.005ms for portal fiber
      handlerExecution: '~0.05ms',
      total: '~0.085ms',
      overhead: '+0.005ms (~6%)',
    },
  },
};

// Conclusion: Portal adds minimal overhead to events and context
```

#### Advanced Event Patterns

**Pattern 1: Conditional event handling based on portal**

```javascript
function SmartModal({ onClose, onBackdropClick }) {
  const handleOverlayClick = (e) => {
    // Only close if clicking directly on overlay, not children
    if (e.target === e.currentTarget) {
      onBackdropClick?.(e);

      // Optional: different behavior for portal vs non-portal
      if (!e.isPropagationStopped()) {
        onClose();
      }
    }
  };

  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="modal-content">
        {/* Clicks here don't trigger handleOverlayClick due to currentTarget check */}
      </div>
    </div>,
    document.body
  );
}
```

**Pattern 2: Custom event bus for portal communication**

```javascript
// When you need to communicate between portal and non-ancestor components
class PortalEventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);

    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    this.listeners.get(eventName)?.delete(callback);
  }

  emit(eventName, data) {
    this.listeners.get(eventName)?.forEach(callback => callback(data));
  }
}

const portalEvents = new PortalEventBus();

// Portal component
function PortalNotification() {
  useEffect(() => {
    const unsubscribe = portalEvents.on('show-notification', (message) => {
      setNotification(message);
    });

    return unsubscribe;
  }, []);

  return ReactDOM.createPortal(
    <div>{notification}</div>,
    document.body
  );
}

// Non-ancestor component
function SomeOtherComponent() {
  const notify = () => {
    portalEvents.emit('show-notification', 'Action completed!');
  };

  return <button onClick={notify}>Trigger Notification</button>;
}
```

---

### 🐛 Real-World Scenario: Modal Event Handling Bug

#### Production Problem: Modal Closes Unexpectedly on Child Interaction

**Context:**
- SaaS application with complex modal for multi-step form
- Modal has dropdown menu inside modal content
- Clicking dropdown closes entire modal unexpectedly
- Affects 23% of form completions, 12% form abandonment rate
- Support tickets: 89 reports in first week

**Problematic implementation:**

```javascript
// ❌ BAD: Event handling causes modal to close unexpectedly
function BuggyModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  const handleOverlayClick = () => {
    onClose(); // Closes on ANY click, including children
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

// Form inside modal
function MultiStepForm() {
  return (
    <BuggyModal isOpen={true} onClose={() => setShowModal(false)}>
      <form>
        <select> {/* Clicking this closes modal! */}
          <option>Option 1</option>
          <option>Option 2</option>
        </select>

        <DatePicker /> {/* Clicking calendar closes modal! */}
      </form>
    </BuggyModal>
  );
}
```

**Root cause analysis:**

```javascript
// Event flow causing bug
const eventFlow = {
  step1: 'User clicks dropdown inside modal-content',
  step2: 'Click event bubbles (React tree): dropdown → modal-content → modal-overlay',
  step3: 'modal-overlay onClick fires handleOverlayClick',
  step4: 'onClose() called, modal closes',
  step5: 'User loses form progress, frustrated',
};

// Debugging
function debugEventPropagation(e) {
  console.log('Event target:', e.target);           // <select>
  console.log('Current target:', e.currentTarget);  // <div class="modal-overlay">
  console.log('Target === currentTarget:', e.target === e.currentTarget); // false!

  // Problem: handleOverlayClick fires even when target is NOT the overlay
}
```

**Measured impact:**

```javascript
const bugMetrics = {
  totalModalOpens: 12500,         // Daily
  unexpectedCloses: 2875,          // 23% of opens
  formsAbandoned: 1500,            // 12% of opens
  supportTickets: 89,               // First week
  userFrustrationScore: 8.2,       // Out of 10
  averageReattemptsPerUser: 2.4,   // Users reopen modal multiple times
};
```

**Solution 1: Check event target**

```javascript
// ✅ GOOD: Only close if clicking overlay directly
function GoodModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay itself, not children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

// Event flow now:
// Click on dropdown: target = <select>, currentTarget = <div class="modal-overlay">
// target !== currentTarget, onClose() not called ✅
```

**Solution 2: Stop propagation in content**

```javascript
// ✅ ALTERNATIVE: Stop propagation at content level
function AlternativeModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  const handleContentClick = (e) => {
    e.stopPropagation(); // Prevent bubbling to overlay
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
```

**Solution 3: Use ref to detect click outside**

```javascript
// ✅ BEST: Robust click-outside detection
function RobustModal({ isOpen, onClose, children }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      // Check if click is outside content element
      if (contentRef.current && !contentRef.current.contains(e.target)) {
        onClose();
      }
    };

    // Use capture phase to catch events before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content" ref={contentRef}>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
```

**Results after fix:**

```javascript
const afterFixMetrics = {
  totalModalOpens: 12800,          // Daily (slightly increased)
  unexpectedCloses: 45,             // ✅ Down from 2875 (98% reduction)
  formsAbandoned: 640,              // ✅ Down from 1500 (57% reduction)
  supportTickets: 2,                 // ✅ Down from 89 (98% reduction)
  userFrustrationScore: 2.1,        // ✅ Down from 8.2
  averageReattemptsPerUser: 0.1,   // ✅ Down from 2.4
  formCompletionRate: '94.8%',     // ✅ Up from 88%
};
```

#### Context Issue: Theme Not Applied to Portal

**Problem:** Modal portal doesn't receive theme context.

```javascript
// ❌ BAD: Assuming context won't work
function BrokenThemedModal() {
  const theme = useContext(ThemeContext);

  // Developer assumes theme won't work in portal, hardcodes light theme
  return ReactDOM.createPortal(
    <div className="modal modal--light"> {/* Wrong! */}
      Content
    </div>,
    document.body
  );
}

// ✅ GOOD: Trust context propagation
function CorrectThemedModal() {
  const theme = useContext(ThemeContext); // ✅ Works perfectly!

  return ReactDOM.createPortal(
    <div className={`modal modal--${theme}`}>
      Content
    </div>,
    document.body
  );
}
```

**Real scenario:** Auth modal in dark mode app appeared with light theme, causing user confusion and accessibility issues (poor contrast).

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Event and Context Handling</strong></summary>

#### React Tree vs DOM Tree Bubbling

| **Aspect** | **React Tree Bubbling** | **DOM Tree Bubbling** |
|------------|------------------------|----------------------|
| **Path** | Follows fiber.return (React component hierarchy) | Follows DOM parentNode |
| **Portal behavior** | Bubbles to React parent (even if DOM is elsewhere) | Bubbles to DOM parent (document.body for portal) |
| **stopPropagation** | Stops React synthetic event bubbling | Stops native DOM event bubbling |
| **Use case** | React event handlers (onClick, onChange, etc.) | Native event listeners (addEventListener) |

**Trade-off decision matrix:**

```javascript
// When to use each approach
const eventHandlingApproach = {
  reactEventHandlers: {
    useCases: [
      'Normal component interactions',
      'Form handling',
      'Button clicks',
      'Most UI events',
    ],
    benefits: [
      'Automatic cross-browser compatibility',
      'Consistent behavior through portals',
      'Familiar React patterns',
    ],
    drawbacks: [
      'May not capture all native events',
      'Slight performance overhead',
    ],
  },

  nativeEventListeners: {
    useCases: [
      'Document-level shortcuts (Cmd+K)',
      'Drag and drop',
      'Scroll events on window',
      'Click outside detection',
    ],
    benefits: [
      'Direct access to native events',
      'Can use capture phase',
      'Lower-level control',
    ],
    drawbacks: [
      'Must handle cross-browser differences',
      'Portal behavior different (DOM tree bubbling)',
      'Manual cleanup required',
    ],
  },
};
```

**Example: Keyboard shortcut handling**

```javascript
// ❌ PROBLEMATIC: React event handler for global shortcut
function ModalWithReactShortcut() {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  // Only fires if modal is focused - doesn't work for global shortcut
  return ReactDOM.createPortal(
    <div onKeyDown={handleKeyDown}>
      Modal content
    </div>,
    document.body
  );
}

// ✅ GOOD: Native listener for global shortcut
function ModalWithNativeShortcut() {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    // Fires regardless of focus
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return ReactDOM.createPortal(
    <div>Modal content</div>,
    document.body
  );
}
```

#### Context Access Performance

```javascript
// Performance comparison: Context access in portal vs regular component
const contextPerformance = {
  regularComponent: {
    providerDistance: '2 fibers',      // App → Parent → Component
    contextRead: '~0.001ms',
    renderTime: '~1.2ms',
    totalTime: '~1.201ms',
  },

  portalComponent: {
    providerDistance: '3 fibers',      // App → Parent → Portal → Component
    contextRead: '~0.0012ms',          // +0.0002ms for extra fiber
    renderTime: '~1.2ms',
    totalTime: '~1.2012ms',
    overhead: '+0.0002ms (negligible)',
  },
};

// Verdict: Portal adds negligible context access overhead
```

#### Event Handler Patterns Comparison

**Pattern 1: Target vs CurrentTarget**

```javascript
// Simple, but requires proper HTML structure
const pattern1 = {
  code: `
    <div onClick={(e) => {
      if (e.target === e.currentTarget) close();
    }}>
      <div>{children}</div>
    </div>
  `,

  pros: [
    'Simple to understand',
    'No extra event listeners',
    'Works with React event system',
  ],

  cons: [
    'Requires overlay wrapper',
    'May not work if content has pointer-events',
    'Depends on proper nesting',
  ],

  performance: 'Best (~0.001ms check)',
};
```

**Pattern 2: Stop Propagation**

```javascript
// Explicit, but couples content to container
const pattern2 = {
  code: `
    <div onClick={close}>
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  `,

  pros: [
    'Explicit intent',
    'Guaranteed to prevent bubbling',
    'Simple logic',
  ],

  cons: [
    'Prevents parent handlers from firing',
    'Couples child to parent behavior',
    'May break event delegation patterns',
  ],

  performance: 'Good (~0.005ms stopPropagation call)',
};
```

**Pattern 3: Ref + Contains**

```javascript
// Most robust, but more complex
const pattern3 = {
  code: `
    const ref = useRef();
    useEffect(() => {
      const handleClick = (e) => {
        if (!ref.current.contains(e.target)) close();
      };
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }, []);
  `,

  pros: [
    'Most robust',
    'Works with complex nesting',
    'No coupling between components',
    'Handles dynamic content',
  ],

  cons: [
    'More code',
    'Requires ref management',
    'Native listener (not React event)',
  ],

  performance: 'Good (~0.01ms contains check)',
};
```

**Recommendation:**
- **Simple modals**: Pattern 1 (target check)
- **Complex nested content**: Pattern 3 (ref + contains)
- **Quick prototypes**: Pattern 2 (stopPropagation)

---

### 💬 Explain to Junior: Events and Context Through Portals

#### The Family Gathering Analogy

Imagine a family reunion where you're sending messages:

**Context (family relationships):**
- You're at the reunion (portal rendered in document.body)
- Your parents, grandparents are in the main hall (React component tree)
- Even though you're in a different room (different DOM location), you're still family
- You still get family updates (context): "Dinner is ready", "Uncle Joe arrived"
- Your relationship doesn't change based on which room you're in

**Events (passing messages):**
- You shout "I'm ready!" (trigger event in portal)
- Your message goes through family hierarchy (React tree): You → Parents → Grandparents
- Your message does NOT go through building hierarchy (DOM tree): Your room → Hallway → Building manager
- Building staff (DOM event listeners) won't hear your family message (React events)

#### Mental Model for Events

```javascript
// Two parallel trees
const domTree = {
  root: '#root',
  children: ['App div', 'Button div'],
};

const domTreePortal = {
  root: 'document.body',
  children: ['Modal div'], // Separate!
};

const reactTree = {
  root: 'App',
  children: [
    'Button',
    'Portal (special node)',
    'Modal', // Child of Portal in React tree!
  ],
};

// Events follow reactTree, not domTree
// Context follows reactTree, not domTree
```

**Simple rule:** React features (events, context, state) follow React tree. Only rendering follows DOM tree.

#### Common Beginner Mistakes

**Mistake 1: Thinking context breaks**

```javascript
// ❌ WRONG MENTAL MODEL
"Portal renders to document.body, so it can't access App's context"

// ✅ CORRECT MENTAL MODEL
"Portal is a child in React tree, so it inherits all context from ancestors"

// Analogy: You move to a different office (DOM), but you're still employed
// by the same company (React tree), so you get same benefits (context)
```

**Mistake 2: Expecting DOM event bubbling**

```javascript
// ❌ WRONG MENTAL MODEL
"Portal in document.body, so clicks bubble to body's event listeners"

// ✅ CORRECT MENTAL MODEL
"React events bubble through React tree, so clicks bubble to React parent"

// Example
function Parent() {
  // This WILL fire when clicking portal!
  const handleClick = () => console.log('Parent clicked');

  return (
    <div onClick={handleClick}>
      {ReactDOM.createPortal(
        <button>Click me</button>, // ← Triggers Parent's handleClick!
        document.body
      )}
    </div>
  );
}
```

**Mistake 3: Using stopPropagation incorrectly**

```javascript
// ❌ BAD: Thinking stopPropagation stops DOM bubbling
function BrokenModal() {
  return ReactDOM.createPortal(
    <div onClick={(e) => e.stopPropagation()}>
      Modal
    </div>,
    document.body
  );
}

// Then adding native listener expecting it to fire:
document.body.addEventListener('click', () => {
  console.log('Body clicked'); // This WILL fire - stopPropagation doesn't affect it!
});

// ✅ CORRECT: stopPropagation only stops React synthetic events
```

#### Interview Answer Templates

**Q: "How do events work with portals?"**

```
"Events bubble through the React component tree, not the DOM tree. This is because
React uses a synthetic event system with event delegation.

When you click inside a portal that's rendered to document.body, the event bubbles
up through the React fiber tree - from the portal component to its React parent,
even though the DOM parent is document.body.

This happens because React attaches event listeners at the root container and then
traces the fiber tree to determine which handlers to call. The portal fiber has a
'return' pointer to its parent in the React tree, so bubbling follows that path.

This means parent components can handle events from portal children just like
regular children. For example, [give modal overlay example where parent's onClick
handles closing the modal]."
```

**Q: "Can portals access context?"**

```
"Yes, portals have full access to context from their ancestors in the React tree.
This is because context propagation follows the React component tree, not the DOM tree.

When a component inside a portal calls useContext, React walks up the fiber tree
using the 'return' pointer - from the portal component to its parent, grandparent, etc.
When it finds a matching Provider, it returns that value.

Even though the portal renders to a different DOM location like document.body, it's
still part of the React component tree, so all context, state, and props flow
normally. For example, [give theme context example where modal portal receives theme
from provider above it in component tree]."
```

**Q: "What's the difference between e.stopPropagation() in portal vs regular component?"**

```
"e.stopPropagation() works the same in both cases - it stops React's synthetic event
from bubbling up the React component tree. The key difference is that portals have
different React and DOM hierarchies.

In a portal:
- stopPropagation stops React event bubbling (to React parent)
- Native DOM bubbling continues (to DOM parent like document.body)

In a regular component:
- stopPropagation stops React event bubbling
- React and DOM bubbling follow the same path, so effect is similar

Practical implication: If you have native event listeners on document.body and you
call stopPropagation inside a portal, those native listeners WILL still fire because
stopPropagation only affects React's synthetic event system, not native DOM events."
```

#### Debugging Tips for Juniors

**Tip 1: Visualize the two trees**

```javascript
// Add this to your component to see both trees
function DebugPortal({ children }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      console.log('React parent:', ref.current._owner); // React tree
      console.log('DOM parent:', ref.current.parentElement); // DOM tree
      console.log('Are they same?', ref.current._owner?.stateNode === ref.current.parentElement);
    }
  }, []);

  return ReactDOM.createPortal(
    <div ref={ref}>{children}</div>,
    document.body
  );
}
```

**Tip 2: Trace event bubbling**

```javascript
// Add to every level to see bubbling path
function ComponentWithLogging({ name, children }) {
  const handleClick = (e) => {
    console.log(`${name} clicked`, {
      target: e.target.tagName,
      currentTarget: e.currentTarget.tagName,
      phase: e.eventPhase,
    });
  };

  return <div onClick={handleClick}>{children}</div>;
}

// Use:
<ComponentWithLogging name="Grandparent">
  <ComponentWithLogging name="Parent">
    <ComponentWithLogging name="Child">
      {ReactDOM.createPortal(
        <ComponentWithLogging name="Portal">
          <button>Click</button>
        </ComponentWithLogging>,
        document.body
      )}
    </ComponentWithLogging>
  </ComponentWithLogging>
</ComponentWithLogging>

// Output shows React tree bubbling path
```

**Tip 3: Verify context access**

```javascript
// Check all contexts are accessible
function PortalContextDebug() {
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);
  const router = useContext(RouterContext);

  console.table({
    theme,
    user: user?.name,
    route: router?.pathname,
  });

  return ReactDOM.createPortal(
    <div>Check console for context values</div>,
    document.body
  );
}
```

#### Quick Reference Guide

```javascript
// Portal event and context cheat sheet
const portalBehavior = {
  context: {
    question: 'Can portal access context?',
    answer: 'YES - follows React tree',
    example: 'useContext(ThemeContext) works normally',
  },

  events: {
    question: 'Do events bubble to React parent?',
    answer: 'YES - follows React tree',
    example: 'Parent onClick fires when clicking portal child',
  },

  domBubbling: {
    question: 'Do events bubble to DOM parent (document.body)?',
    answer: 'YES for native, NO for React synthetic events',
    example: 'document.body.addEventListener("click") fires',
  },

  stopPropagation: {
    question: 'Does e.stopPropagation() stop DOM bubbling?',
    answer: 'NO - only stops React synthetic event bubbling',
    example: 'Native listeners on document.body still fire',
  },
};
```

</details>
