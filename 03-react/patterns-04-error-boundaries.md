# React Error Boundaries - Error Handling Patterns

## Question 1: What are Error Boundaries and how to implement them?

**Answer:**

Error Boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the entire application. They act as a try-catch mechanism for React components, providing a way to gracefully handle errors that occur during rendering, in lifecycle methods, and in constructors of the component tree below them.

Error Boundaries are implemented as class components (not available as function components yet) that define either `static getDerivedStateFromError()` or `componentDidCatch()` lifecycle methods. The `getDerivedStateFromError()` method is used to render a fallback UI after an error is caught, while `componentDidCatch()` is used to log error information to error reporting services.

Key characteristics of Error Boundaries include: they only catch errors in components below them in the tree (not in themselves), they don't catch errors in event handlers, asynchronous code (setTimeout, requestAnimationFrame), server-side rendering, or errors thrown in the error boundary itself. Error Boundaries should be placed strategically in your component tree - you can wrap top-level route components, important widgets, or create a single top-level boundary for the entire app.

When an error is caught, React will unmount the entire component tree from that error boundary downwards and display the fallback UI. In development mode, React also displays the error overlay, but in production, only the fallback UI is shown, preventing users from seeing broken UI or stack traces.

<details>
<summary><strong>🔍 Deep Dive: Error Boundary Lifecycle</strong></summary>

**Error Boundary Lifecycle and Internals:**

Error Boundaries work through React's error handling mechanism that's integrated into the reconciliation process. When React encounters an error during rendering, it enters error recovery mode and traverses up the component tree looking for the nearest error boundary.

```javascript
// Complete Error Boundary implementation
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  // Called during render phase - must be pure, no side effects
  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    // This runs during reconciliation phase
    return { hasError: true };
  }

  // Called during commit phase - side effects allowed
  componentDidCatch(error, errorInfo) {
    // errorInfo.componentStack contains the component stack trace
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to error reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // Integration with error monitoring
    console.error('Error Boundary caught:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  };

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI with error details and recovery option
      return (
        <div role="alert" className="error-boundary">
          <h2>Something went wrong</h2>
          {this.props.showDetails && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
          <button onClick={this.resetErrorBoundary}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Error Propagation Mechanism:**

React's error handling follows a specific propagation path:

1. **Error thrown in component** → React catches it during reconciliation
2. **React traverses up the tree** → Looks for nearest error boundary
3. **getDerivedStateFromError called** → Updates boundary's state (synchronous, pure)
4. **Boundary re-renders** → Shows fallback UI
5. **componentDidCatch called** → Logs error, performs side effects (async allowed)

```javascript
// Understanding error propagation depth
class GranularErrorBoundary extends React.Component {
  state = { hasError: false, boundaryId: this.props.id };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(`Caught by boundary: ${this.state.boundaryId}`);
    // Error stops propagating here - parent boundaries won't catch it
  }

  render() {
    if (this.state.hasError) {
      return <FallbackComponent boundaryId={this.state.boundaryId} />;
    }
    return this.props.children;
  }
}

// Multiple boundaries - granular error isolation
function App() {
  return (
    <ErrorBoundary id="root">
      <Header />
      <ErrorBoundary id="sidebar">
        <Sidebar /> {/* Error here only affects sidebar */}
      </ErrorBoundary>
      <ErrorBoundary id="main">
        <MainContent /> {/* Error here only affects main content */}
      </ErrorBoundary>
      <Footer />
    </ErrorBoundary>
  );
}
```

**Advanced Error Boundary Patterns:**

```javascript
// Configurable Error Boundary with retry logic
class ResilientErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
    this.resetTimeout = null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const { maxRetries = 3, retryDelay = 2000, onError } = this.props;

    this.setState(prevState => ({
      error,
      errorInfo,
      retryCount: prevState.retryCount + 1
    }));

    // Custom error handler callback
    onError?.(error, errorInfo, this.state.retryCount);

    // Auto-retry mechanism
    if (this.state.retryCount < maxRetries) {
      this.resetTimeout = setTimeout(() => {
        this.resetErrorBoundary();
      }, retryDelay);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { maxRetries = 3, FallbackComponent, children } = this.props;

    if (hasError) {
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            retryCount={retryCount}
            maxRetries={maxRetries}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        );
      }

      return (
        <DefaultFallback
          error={error}
          retryCount={retryCount}
          onReset={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

// Usage with custom configuration
function App() {
  const handleError = (error, errorInfo, retryCount) => {
    // Send to analytics
    analytics.track('error_boundary_triggered', {
      error: error.message,
      component: errorInfo.componentStack,
      retry: retryCount
    });

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
          retryCount
        }
      }
    });
  };

  return (
    <ResilientErrorBoundary
      maxRetries={3}
      retryDelay={2000}
      onError={handleError}
      FallbackComponent={CustomErrorUI}
    >
      <App />
    </ResilientErrorBoundary>
  );
}
```

**Error Boundary Limitations and Workarounds:**

```javascript
// ❌ Error boundaries DON'T catch these errors:

// 1. Event handlers
function BrokenButton() {
  const handleClick = () => {
    throw new Error('Event error'); // Not caught by error boundary!
  };
  return <button onClick={handleClick}>Break</button>;
}

// ✅ Workaround: Manual try-catch
function SafeButton() {
  const [error, setError] = useState(null);

  const handleClick = () => {
    try {
      throw new Error('Event error');
    } catch (err) {
      setError(err);
      // Log to monitoring
      Sentry.captureException(err);
    }
  };

  if (error) return <ErrorMessage error={error} />;
  return <button onClick={handleClick}>Safe</button>;
}

// 2. Async code
function AsyncComponent() {
  useEffect(() => {
    setTimeout(() => {
      throw new Error('Async error'); // Not caught!
    }, 1000);
  }, []);
}

// ✅ Workaround: Error state + try-catch
function SafeAsyncComponent() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch('/api/data');
        // Process data
      } catch (err) {
        setError(err); // Trigger error UI manually
        Sentry.captureException(err);
      }
    };
    fetchData();
  }, []);

  if (error) throw error; // Re-throw to be caught by error boundary
  return <div>Content</div>;
}

// 3. Server-side rendering
// ✅ Use try-catch in getServerSideProps/getStaticProps
export async function getServerSideProps() {
  try {
    const data = await fetchData();
    return { props: { data } };
  } catch (error) {
    console.error('SSR Error:', error);
    return {
      props: { error: error.message }
    };
  }
}
```

### 🐛 Real-World Scenario

**Production Error Handling with Monitoring Integration**

**Context:**
An e-commerce application with 50,000 daily active users experienced intermittent crashes in the product detail page, causing a 15% drop in conversion rate. Users reported seeing blank screens when viewing certain products, and error logs showed thousands of undefined property access errors. The team needed to implement comprehensive error handling without disrupting the user experience.

**Initial Problem - No Error Boundaries:**

```javascript
// ❌ BAD: No error handling - entire app crashes
function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
      <Footer />
    </Router>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(setProduct);
  }, [id]);

  // 💥 Crashes if product is null or missing properties
  return (
    <div>
      <h1>{product.name}</h1>
      <img src={product.images[0].url} alt={product.name} />
      <Price amount={product.price.amount} currency={product.price.currency} />
      <AddToCart productId={product.id} />
    </div>
  );
}

// Error metrics before implementation:
// - 2,341 errors/day
// - 89% crash rate on product detail page
// - 15% conversion rate drop
// - Average recovery time: never (page stays broken)
```

**Solution - Strategic Error Boundary Placement:**

```javascript
// ✅ GOOD: Multi-level error boundaries with monitoring
import * as Sentry from '@sentry/react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

// Root-level error boundary
function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <RootErrorFallback error={error} onReset={resetError} />
      )}
      beforeCapture={(scope) => {
        scope.setTag('boundary', 'root');
        scope.setLevel('critical');
      }}
    >
      <Router>
        <Header />
        <ErrorBoundary
          id="main-content"
          fallback={<MainContentError />}
          onError={logToAnalytics}
        >
          <Routes>
            <Route
              path="/product/:id"
              element={
                <QueryErrorResetBoundary>
                  {({ reset }) => (
                    <ErrorBoundary
                      id="product-detail"
                      onReset={reset}
                      fallback={<ProductErrorFallback />}
                    >
                      <ProductDetail />
                    </ErrorBoundary>
                  )}
                </QueryErrorResetBoundary>
              }
            />
            <Route
              path="/cart"
              element={
                <ErrorBoundary id="cart">
                  <ShoppingCart />
                </ErrorBoundary>
              }
            />
          </Routes>
        </ErrorBoundary>
        <Footer />
      </Router>
    </Sentry.ErrorBoundary>
  );
}

// Production-grade error boundary with monitoring
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = `${this.props.id}-${Date.now()}`;
    const errorData = {
      boundaryId: this.props.id,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId()
    };

    this.setState({ error, errorInfo, errorId });

    // Send to Sentry with full context
    Sentry.withScope((scope) => {
      scope.setContext('error_boundary', errorData);
      scope.setTag('boundary_id', this.props.id);
      scope.setLevel('error');
      Sentry.captureException(error);
    });

    // Send to custom analytics
    window.analytics?.track('error_boundary_triggered', errorData);

    // Log to CloudWatch/DataDog
    this.logToMonitoring(errorData);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  logToMonitoring = (errorData) => {
    // Send to monitoring service
    fetch('/api/logs/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    }).catch(err => console.error('Failed to log error:', err));
  };

  getUserId = () => {
    return localStorage.getItem('userId') || 'anonymous';
  };

  getSessionId = () => {
    return sessionStorage.getItem('sessionId') || 'unknown';
  };

  resetErrorBoundary = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;

      if (FallbackComponent) {
        return typeof FallbackComponent === 'function' ? (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            errorId={this.state.errorId}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        ) : (
          FallbackComponent
        );
      }

      return <DefaultErrorFallback onReset={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

// Product-specific error fallback with recovery
function ProductErrorFallback({ error, errorId, resetErrorBoundary }) {
  const { id } = useParams();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Track error view
    analytics.track('product_error_viewed', {
      productId: id,
      errorId,
      errorMessage: error?.message
    });
  }, [id, errorId]);

  return (
    <div className="product-error-container">
      <div className="error-message">
        <h2>Unable to Load Product</h2>
        <p>We're having trouble loading this product. This has been reported to our team.</p>

        <div className="error-actions">
          <button onClick={resetErrorBoundary} className="btn-primary">
            Try Again
          </button>
          <Link to="/" className="btn-secondary">
            Back to Home
          </Link>
        </div>

        {/* Alternative actions */}
        <div className="alternative-actions">
          <Link to="/search">Browse Similar Products</Link>
          <Link to="/cart">View Your Cart</Link>
        </div>

        {/* Error details for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <details className="error-details">
            <summary onClick={() => setShowDetails(!showDetails)}>
              Error Details (Error ID: {errorId})
            </summary>
            {showDetails && (
              <pre>
                {error?.message}
                {'\n\n'}
                {error?.stack}
              </pre>
            )}
          </details>
        )}
      </div>

      {/* Show related products as fallback content */}
      <RelatedProducts productId={id} />
    </div>
  );
}

// Safe ProductDetail component with defensive programming
function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        if (mounted) {
          setProduct(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setLoading(false);
          // Re-throw to be caught by error boundary
          throw err;
        }
      }
    };

    fetchProduct();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <ProductSkeleton />;
  if (!product) throw new Error('Product not found');

  // Defensive rendering with fallbacks
  return (
    <div className="product-detail">
      <h1>{product.name || 'Unnamed Product'}</h1>

      {product.images?.length > 0 ? (
        <img
          src={product.images[0].url}
          alt={product.name}
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
          }}
        />
      ) : (
        <img src="/placeholder-image.jpg" alt="No image available" />
      )}

      {product.price ? (
        <Price
          amount={product.price.amount}
          currency={product.price.currency || 'USD'}
        />
      ) : (
        <p>Price unavailable</p>
      )}

      <AddToCart productId={product.id || id} />
    </div>
  );
}
```

**Results After Implementation:**

```javascript
// Monitoring dashboard metrics (30 days post-implementation)
const errorMetrics = {
  before: {
    totalErrors: 2341,
    crashRate: 0.89,
    conversionRate: 0.68,
    averageRecoveryTime: Infinity,
    userImpact: 'High - entire page crashes'
  },
  after: {
    totalErrors: 187, // 92% reduction
    crashRate: 0.02, // 98% improvement
    conversionRate: 0.82, // 14% improvement
    averageRecoveryTime: 3.2, // seconds (users can retry)
    userImpact: 'Low - graceful degradation',
    errorRecoveryRate: 0.73 // 73% of users retry successfully
  },
  sentryIntegration: {
    errorsTracked: 187,
    uniqueErrors: 23,
    mostCommon: [
      { error: 'Cannot read property "price"', count: 45, fixed: true },
      { error: 'Image load failed', count: 32, fixed: true },
      { error: 'Network timeout', count: 28, fixed: false }
    ],
    resolutionTime: '2.3 days average'
  }
};

// Business impact
const businessMetrics = {
  revenueProtected: 125000, // USD/month
  customerSatisfaction: {
    before: 3.2,
    after: 4.6,
    improvement: '43.75%'
  },
  supportTickets: {
    before: 89,
    after: 12,
    reduction: '86.5%'
  }
};
```

### ⚖️ Trade-offs

**Error Boundary Granularity:**

```javascript
// Option 1: Single root-level boundary
// ✅ Pros: Simple, catches everything
// ❌ Cons: Entire app crashes, poor UX, no isolation
function App() {
  return (
    <ErrorBoundary>
      <Header />
      <Sidebar />
      <MainContent />
      <Footer />
    </ErrorBoundary>
  );
}
// Use when: Prototyping, very simple apps
// Impact: One error crashes everything
// Recovery: User must reload page

// Option 2: Per-route boundaries
// ✅ Pros: Route isolation, better UX
// ❌ Cons: More boilerplate, some code duplication
function App() {
  return (
    <>
      <Header />
      <ErrorBoundary id="route">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </ErrorBoundary>
      <Footer />
    </>
  );
}
// Use when: Medium apps, distinct pages
// Impact: Route errors isolated, header/footer persist
// Recovery: User can navigate away

// Option 3: Component-level boundaries (granular)
// ✅ Pros: Maximum isolation, best UX, surgical error handling
// ❌ Cons: More code, complexity, potential over-engineering
function Dashboard() {
  return (
    <div>
      <ErrorBoundary id="stats">
        <StatsWidget />
      </ErrorBoundary>
      <ErrorBoundary id="chart">
        <ChartWidget />
      </ErrorBoundary>
      <ErrorBoundary id="activity">
        <ActivityFeed />
      </ErrorBoundary>
    </div>
  );
}
// Use when: Complex apps, critical features, microservices architecture
// Impact: Widget errors isolated, rest of page works
// Recovery: Granular retry per widget

// Hybrid approach (RECOMMENDED)
function App() {
  return (
    <ErrorBoundary id="root" fallback={<CriticalError />}>
      <Header />
      <ErrorBoundary id="sidebar" fallback={<SidebarError />}>
        <Sidebar />
      </ErrorBoundary>
      <ErrorBoundary id="main" fallback={<MainError />}>
        <MainContent />
      </ErrorBoundary>
      <Footer />
    </ErrorBoundary>
  );
}
// Use when: Production apps
// Impact: Balanced isolation and simplicity
// Recovery: Multiple fallback options
```

**Fallback UI Strategies:**

```javascript
// Option 1: Generic error message
// ✅ Pros: Simple, consistent
// ❌ Cons: Not actionable, poor UX, no context
const GenericFallback = () => (
  <div>Something went wrong. Please refresh the page.</div>
);
// When: Low-priority features, internal tools
// UX Score: 2/10

// Option 2: Actionable error with retry
// ✅ Pros: User can recover, better UX
// ❌ Cons: May retry broken code repeatedly
const ActionableFallback = ({ resetErrorBoundary }) => (
  <div>
    <p>Unable to load content</p>
    <button onClick={resetErrorBoundary}>Try Again</button>
  </div>
);
// When: Most use cases, transient errors
// UX Score: 6/10

// Option 3: Contextual fallback with alternatives
// ✅ Pros: Best UX, provides alternatives, maintains flow
// ❌ Cons: More complex, component-specific
const ContextualFallback = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <h2>Unable to Load Product</h2>
      <p>This product is temporarily unavailable.</p>
      <div className="actions">
        <button onClick={resetErrorBoundary}>Retry</button>
        <button onClick={() => navigate('/')}>Home</button>
        <button onClick={() => navigate('/search')}>Browse Products</button>
      </div>
      <RelatedProducts /> {/* Show alternatives */}
      <CustomerSupport /> {/* Help option */}
    </div>
  );
};
// When: Production apps, critical flows, e-commerce
// UX Score: 9/10

// Option 4: Degraded functionality
// ✅ Pros: Partial functionality maintained, seamless
// ❌ Cons: Complex to implement, requires careful design
const DegradedFallback = () => (
  <div>
    <ProductBasicInfo /> {/* Still shows basic info */}
    <div className="notice">
      Advanced features temporarily unavailable
      <button onClick={retryAdvancedFeatures}>Enable Features</button>
    </div>
  </div>
);
// When: Complex features, progressive enhancement
// UX Score: 8/10
```

**Error Logging and Monitoring:**

```javascript
// Option 1: Console logging only
// ✅ Pros: Zero cost, simple
// ❌ Cons: No persistence, no analytics, useless in production
componentDidCatch(error, errorInfo) {
  console.error('Error:', error, errorInfo);
}
// When: Development only
// Cost: $0/month
// Visibility: 0% (production errors invisible)

// Option 2: Custom error logging endpoint
// ✅ Pros: Full control, no third-party, privacy
// ❌ Cons: Must build dashboard, alerting, aggregation
componentDidCatch(error, errorInfo) {
  fetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify({ error, errorInfo })
  });
}
// When: Strict privacy requirements, large teams
// Cost: Development + infrastructure time
// Visibility: Depends on dashboard quality

// Option 3: Sentry/commercial service
// ✅ Pros: Ready-to-use, great UI, alerts, aggregation, source maps
// ❌ Cons: Cost, third-party dependency, data sharing
componentDidCatch(error, errorInfo) {
  Sentry.captureException(error, {
    contexts: { react: errorInfo }
  });
}
// When: Most production apps
// Cost: $26-$80/month (based on volume)
// Visibility: 95% (real-time alerts, trends, releases)

// Option 4: Hybrid approach
// ✅ Pros: Best of both worlds, redundancy
// ❌ Cons: More complex, potential duplication
componentDidCatch(error, errorInfo) {
  // Primary: Sentry for real-time monitoring
  Sentry.captureException(error);

  // Secondary: Custom logging for analytics
  fetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify({ error, errorInfo })
  });

  // Tertiary: Console for development
  if (process.env.NODE_ENV === 'development') {
    console.error(error, errorInfo);
  }
}
// When: Enterprise apps, compliance requirements
// Cost: $80-$200/month + dev time
// Visibility: 99% (multiple layers of monitoring)
```

**Performance Impact:**

```javascript
// Error boundaries add minimal overhead

// Without error boundary:
// Render time: 12ms
// Bundle size: 450KB

// With single error boundary:
// Render time: 12.3ms (+0.3ms, negligible)
// Bundle size: 451.2KB (+1.2KB)

// With 10 granular boundaries:
// Render time: 13.1ms (+1.1ms, still negligible)
// Bundle size: 453KB (+3KB)

// Trade-off decision matrix:
const shouldUseGranularBoundaries = (
  appComplexity > 'medium' &&
  criticalFeatures.length > 3 &&
  bundleSizeBudget > 500 // KB
);

// Best practice: Strategic placement
function OptimalBoundaryPlacement() {
  return (
    <>
      {/* Root boundary: Catch catastrophic errors */}
      <ErrorBoundary id="root">

        {/* Route boundary: Isolate pages */}
        <ErrorBoundary id="page">

          {/* Feature boundaries: High-value features only */}
          <ErrorBoundary id="checkout">
            <CheckoutFlow /> {/* Critical: needs isolation */}
          </ErrorBoundary>

          {/* No boundary: Low-risk components */}
          <Sidebar /> {/* Simple: shared root boundary OK */}
        </ErrorBoundary>
      </ErrorBoundary>
    </>
  );
}
```

### 💬 Explain to Junior

**Simple Analogy:**

Imagine you're building a house with multiple rooms. An Error Boundary is like having fire doors between rooms. If a fire (error) starts in the kitchen (one component), the fire door closes and prevents the fire from spreading to the entire house. The living room, bedrooms, and bathroom remain safe and functional.

Without fire doors (error boundaries), a small fire in the kitchen would burn down the entire house. With fire doors, only the kitchen needs to be closed off and repaired while the rest of the house works normally.

**How Error Boundaries Work:**

Think of React's component tree like a family tree. When something goes wrong with a child component (like trying to display a product that doesn't exist), React looks up the tree to find a "responsible adult" (error boundary) that can handle the problem. The error boundary says "I'll take care of this" and shows a nice error message instead of breaking the whole app.

```javascript
// Without error boundary (BAD)
// If ProductCard crashes, entire app shows blank white screen
function App() {
  return (
    <div>
      <Header />
      <ProductCard /> {/* 💥 Crashes here, whole app dies */}
      <Footer />
    </div>
  );
}

// With error boundary (GOOD)
// If ProductCard crashes, only that section shows error
function App() {
  return (
    <div>
      <Header /> {/* ✅ Still works */}
      <ErrorBoundary fallback={<p>Product unavailable</p>}>
        <ProductCard /> {/* 💥 Crashes here */}
      </ErrorBoundary>
      <Footer /> {/* ✅ Still works */}
    </div>
  );
}
```

**When to Use Error Boundaries:**

Use error boundaries like safety nets in a circus:
- **Tight net per performer**: Wrap critical features individually (checkout, payment)
- **Big net below stage**: Wrap entire routes/pages
- **Giant net below circus**: Wrap entire app as last resort

**Common Mistakes Beginners Make:**

```javascript
// ❌ MISTAKE 1: Trying to use hooks for error boundaries
function ErrorBoundary({ children }) { // ❌ Won't work!
  const [hasError, setHasError] = useState(false);
  // There's no hook equivalent yet
  return hasError ? <ErrorUI /> : children;
}

// ✅ CORRECT: Use class component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? <ErrorUI /> : this.props.children;
  }
}

// ❌ MISTAKE 2: Expecting error boundaries to catch event errors
function BadButton() {
  const handleClick = () => {
    throw new Error('Click error'); // ❌ Error boundary won't catch this
  };
  return <button onClick={handleClick}>Click</button>;
}

// ✅ CORRECT: Use try-catch in event handlers
function GoodButton() {
  const [error, setError] = useState(null);

  const handleClick = () => {
    try {
      riskyOperation();
    } catch (err) {
      setError(err); // Handle manually
    }
  };

  if (error) return <ErrorMessage error={error} />;
  return <button onClick={handleClick}>Click</button>;
}

// ❌ MISTAKE 3: No fallback UI
class BadBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null; // ❌ User sees nothing!
    return this.props.children;
  }
}

// ✅ CORRECT: Always provide helpful fallback
class GoodBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return ( // ✅ User knows what happened and what to do
        <div>
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Interview Answer Template:**

"Error Boundaries are React components that catch errors in their child components and display fallback UI instead of crashing the app. They're implemented as class components with either `getDerivedStateFromError` or `componentDidCatch` lifecycle methods.

Think of them like try-catch blocks for React components. They catch errors during rendering, in lifecycle methods, and in constructors. However, they don't catch errors in event handlers, async code, or SSR.

In production, I'd use multiple error boundaries strategically - one at the root level to catch catastrophic errors, and granular ones around critical features like checkout flows. I'd also integrate with Sentry to track errors and provide actionable fallback UIs with retry buttons.

For example, in an e-commerce app, I'd wrap the product detail page in an error boundary. If the product fails to load, instead of breaking the whole site, we'd show an error message with options to retry, go home, or view similar products. This maintains the user experience and prevents revenue loss."

---

## Question 2: How to handle errors in React 18+ with Suspense and Error Boundaries?

**Answer:**

React 18 introduced significant improvements to error handling, particularly in how Error Boundaries work with Suspense, concurrent rendering, server components, and streaming SSR. The new architecture enables more sophisticated error recovery patterns, better integration between data fetching and error states, and improved developer experience through enhanced error messages.

In React 18+, Error Boundaries integrate seamlessly with Suspense for data fetching. When a component suspends (shows loading state), any errors during that suspended state are caught by the nearest error boundary. This creates a unified pattern: Suspense handles loading states, Error Boundaries handle error states, and your component handles success states. This "loading-error-success" trifecta simplifies component logic significantly.

The `ErrorBoundary` + `Suspense` combination is particularly powerful with React Query, SWR, or Relay. These libraries throw promises (for loading) and throw errors (for failures), which Suspense and Error Boundaries catch respectively. React 18's automatic batching and transitions also improve error boundary behavior - errors during transitions don't interrupt the current UI until the transition completes.

Server Components in React 18+ have special error handling considerations. Errors in Server Components are serialized and sent to the client, where they're caught by Error Boundaries. Streaming SSR allows progressive error handling - if one component fails during streaming, only that part shows an error boundary while the rest of the page continues rendering. The `resetErrorBoundary` pattern becomes more powerful in React 18, allowing you to reset both error boundaries and refetch suspended data in one action.

</details>

<details>
<summary><strong>🔍 Deep Dive: React 18 Concurrent Rendering</strong></summary>

**React 18 Concurrent Rendering and Error Boundaries:**

React 18's concurrent features change how errors propagate through the tree. With concurrent rendering, React can start rendering an update, pause if something suspends, and throw away the in-progress work if an error occurs. This makes error boundaries more resilient.

```javascript
// React 18+ Error Boundary with concurrent features
import { useTransition, useDeferredValue } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Concurrent rendering: Errors during transitions are handled gracefully
function SearchPage() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const handleSearch = (value) => {
    setQuery(value);
    // Errors during transition don't break current UI
    startTransition(() => {
      // This update is interruptible
      // If SearchResults throws, current UI stays visible
    });
  };

  return (
    <div>
      <input value={query} onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <SearchSpinner />}

      <ErrorBoundary
        fallback={<SearchError query={deferredQuery} />}
        resetKeys={[deferredQuery]} // Auto-reset when query changes
      >
        <Suspense fallback={<SearchLoading />}>
          <SearchResults query={deferredQuery} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

**Suspense + Error Boundary Integration:**

```javascript
// Modern React 18+ data fetching with error handling
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQuery } from '@tanstack/react-query';

// Pattern 1: Suspense-enabled React Query
function ProductPage({ productId }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <ProductError error={error} onReset={resetErrorBoundary} />
      )}
    >
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails productId={productId} />
      </Suspense>
    </ErrorBoundary>
  );
}

function ProductDetails({ productId }) {
  // Suspense-enabled query: throws promise while loading, throws error if failed
  const { data } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
    suspense: true, // Enable Suspense integration
    useErrorBoundary: true // Throw errors to error boundary
  });

  return <ProductView product={data} />;
}

// Pattern 2: Multiple Suspense boundaries with error isolation
function Dashboard() {
  return (
    <div className="dashboard">
      {/* Each section has isolated loading and error states */}

      <ErrorBoundary fallback={<StatsError />}>
        <Suspense fallback={<StatsSkeleton />}>
          <StatsWidget />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<ChartError />}>
        <Suspense fallback={<ChartSkeleton />}>
          <ChartWidget />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<ActivityError />}>
        <Suspense fallback={<ActivitySkeleton />}>
          <ActivityFeed />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// Pattern 3: Nested Suspense with waterfall handling
function ProfilePage({ userId }) {
  return (
    <ErrorBoundary fallback={<ProfileError />}>
      <Suspense fallback={<ProfileSkeleton />}>
        {/* First: Load user data */}
        <UserProfile userId={userId}>
          {/* Then: Load posts (waterfall, but intentional) */}
          <Suspense fallback={<PostsSkeleton />}>
            <UserPosts userId={userId} />
          </Suspense>

          {/* Then: Load followers (parallel with posts) */}
          <Suspense fallback={<FollowersSkeleton />}>
            <UserFollowers userId={userId} />
          </Suspense>
        </UserProfile>
      </Suspense>
    </ErrorBoundary>
  );
}

// Pattern 4: Query error reset integration
import { QueryErrorResetBoundary } from '@tanstack/react-query';

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset} // Reset React Query cache on error boundary reset
          fallback={({ error, resetErrorBoundary }) => (
            <div>
              <p>Error: {error.message}</p>
              <button onClick={resetErrorBoundary}>
                Try again
              </button>
            </div>
          )}
        >
          <Suspense fallback={<Loading />}>
            <DataComponent />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

**React 18 Server Components Error Handling:**

```javascript
// Server Component (runs on server only)
// app/product/[id]/page.tsx
import { Suspense } from 'react';
import { ErrorBoundary } from './error-boundary';

// This runs on the server
async function ProductPage({ params }) {
  // Server-side data fetching
  // Errors here are caught by nearest error boundary
  const product = await fetchProduct(params.id);

  return (
    <div>
      <h1>{product.name}</h1>

      {/* Suspense boundary for client-side components */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={params.id} />
      </Suspense>

      {/* Error boundary for client-side features */}
      <ErrorBoundary fallback={<RecommendationsError />}>
        <Suspense fallback={<RecommendationsSkeleton />}>
          <Recommendations productId={params.id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// error.tsx - Next.js 13+ convention
'use client'; // Must be client component

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Server component error:', error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      {error.digest && <p>Error ID: {error.digest}</p>}
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// global-error.tsx - Root-level error handler
'use client';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Application Error</h2>
        <p>{error.message}</p>
        <button onClick={reset}>Reset Application</button>
      </body>
    </html>
  );
}
```

**Streaming SSR Error Handling:**

```javascript
// React 18 streaming SSR with progressive error handling
import { renderToPipeableStream } from 'react-dom/server';

// Server-side
function renderApp(res) {
  const { pipe, abort } = renderToPipeableStream(
    <App />,
    {
      bootstrapScripts: ['/client.js'],

      onShellReady() {
        // Shell rendered successfully, start streaming
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        pipe(res);
      },

      onShellError(error) {
        // Critical error in app shell - serve error page
        res.statusCode = 500;
        res.send('<h1>Server Error</h1>');
        console.error('Shell error:', error);
      },

      onError(error) {
        // Error in suspended component during streaming
        // Error boundary on client will catch this
        console.error('Streaming error:', error);
        // Can log to Sentry here
      },

      onAllReady() {
        // Everything rendered (for static generation)
      }
    }
  );

  setTimeout(() => {
    abort(); // Abort if taking too long
  }, 10000);
}

// Client-side hydration with error handling
import { hydrateRoot } from 'react-dom/client';

const root = hydrateRoot(
  document.getElementById('root'),
  <ErrorBoundary fallback={<HydrationError />}>
    <App />
  </ErrorBoundary>,
  {
    onRecoverableError: (error, errorInfo) => {
      // Hydration mismatch or recoverable error
      console.error('Recoverable error:', error, errorInfo);
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        },
        tags: {
          errorType: 'recoverable',
          phase: 'hydration'
        }
      });
    }
  }
);
```

**Advanced Error Recovery Patterns:**

```javascript
// Automatic retry with exponential backoff
function useErrorRetry(maxRetries = 3) {
  const [retryCount, setRetryCount] = useState(0);
  const [retryDelay, setRetryDelay] = useState(1000);

  const reset = useCallback(() => {
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setRetryDelay(prev => prev * 2); // Exponential backoff
      }, retryDelay);
    }
  }, [retryCount, maxRetries, retryDelay]);

  return { retryCount, reset, canRetry: retryCount < maxRetries };
}

function SmartErrorBoundary({ children, maxRetries = 3 }) {
  const { retryCount, reset, canRetry } = useErrorRetry(maxRetries);

  return (
    <ErrorBoundary
      resetKeys={[retryCount]} // Auto-reset when retryCount changes
      fallback={({ error, resetErrorBoundary }) => (
        <div>
          <p>Error: {error.message}</p>
          {canRetry ? (
            <>
              <button onClick={reset}>
                Retry ({maxRetries - retryCount} attempts left)
              </button>
              {retryCount > 0 && <p>Retrying in {retryDelay}ms...</p>}
            </>
          ) : (
            <p>Max retries exceeded. Please refresh the page.</p>
          )}
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Error boundary with state preservation
function StatefulErrorBoundary({ children }) {
  const [savedState, setSavedState] = useState(null);

  const handleError = (error, errorInfo) => {
    // Save current app state before error
    setSavedState({
      url: window.location.href,
      scrollPosition: window.scrollY,
      formData: getFormData(), // Custom function
      timestamp: Date.now()
    });
  };

  const handleReset = () => {
    // Restore saved state after reset
    if (savedState) {
      window.scrollTo(0, savedState.scrollPosition);
      restoreFormData(savedState.formData);
    }
  };

  return (
    <ErrorBoundary
      onError={handleError}
      onReset={handleReset}
      fallback={<ErrorFallback savedState={savedState} />}
    >
      {children}
    </ErrorBoundary>
  );
}
```

</details>

### 🐛 Real-World Scenario

**Production Streaming SSR with Complex Error Handling**

**Context:**
A news website with 2 million daily users implemented React 18 streaming SSR to improve Time to First Byte (TTFB) and First Contentful Paint (FCP). However, their initial implementation had critical issues: errors in any component would break the entire stream, causing white screens for users. They needed sophisticated error handling that allowed progressive enhancement - show what works, gracefully degrade what doesn't.

**Initial Problem - Fragile Streaming:**

```javascript
// ❌ BAD: Single point of failure in streaming SSR
// Server-side (app/page.tsx)
async function NewsHomePage() {
  // If ANY of these fail, entire page breaks
  const breakingNews = await fetchBreakingNews(); // ⚠️ Slow API
  const trending = await fetchTrending(); // ⚠️ Sometimes times out
  const personalized = await fetchPersonalized(); // ⚠️ Requires auth

  return (
    <div>
      <BreakingNews articles={breakingNews} />
      <TrendingStories stories={trending} />
      <PersonalizedFeed items={personalized} />
    </div>
  );
}

// Metrics before fix:
// - Error rate: 8.7% (174,000 failed page loads/day)
// - TTFB: 2.3s (slow due to waterfall)
// - Error recovery: 0% (users see blank page)
// - User complaints: 450/day
// - Revenue loss: $12,000/day (ads not loading)
```

**Solution - Resilient Streaming with Progressive Error Handling:**

```javascript
// ✅ GOOD: Isolated error boundaries with streaming SSR
// app/page.tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export default function NewsHomePage() {
  return (
    <div className="news-homepage">
      {/* Shell always renders - critical for streaming */}
      <Header />
      <Navigation />

      {/* Breaking news: Critical section, short timeout */}
      <ErrorBoundary
        fallback={<BreakingNewsError />}
        onError={(error) => logError('breaking-news', error)}
      >
        <Suspense fallback={<BreakingNewsSkeleton />}>
          <BreakingNews />
        </Suspense>
      </ErrorBoundary>

      {/* Trending: Important but not critical */}
      <ErrorBoundary
        fallback={<TrendingPlaceholder />}
        onError={(error) => logError('trending', error)}
      >
        <Suspense fallback={<TrendingSkeleton />}>
          <TrendingStories />
        </Suspense>
      </ErrorBoundary>

      {/* Personalized: Nice to have, can fail gracefully */}
      <ErrorBoundary
        fallback={<GenericFeed />} // Show generic content if personalization fails
        onError={(error) => logError('personalized', error)}
      >
        <Suspense fallback={<FeedSkeleton />}>
          <PersonalizedFeed />
        </Suspense>
      </ErrorBoundary>

      {/* Ads: Errors shouldn't affect content */}
      <ErrorBoundary
        fallback={null} // Silent failure for ads
        onError={(error) => logError('ads', error, { silent: true })}
      >
        <Suspense fallback={<AdPlaceholder />}>
          <AdUnit />
        </Suspense>
      </ErrorBoundary>

      <Footer />
    </div>
  );
}

// Server component with timeout protection
async function BreakingNews() {
  // Race between data fetch and timeout
  const articles = await Promise.race([
    fetchBreakingNews(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 3000)
    )
  ]).catch(error => {
    // Log but don't crash
    console.error('Breaking news fetch failed:', error);
    throw error; // Re-throw to trigger error boundary
  });

  return <BreakingNewsList articles={articles} />;
}

// Graceful degradation for personalized content
async function PersonalizedFeed() {
  try {
    const userId = await getUserId(); // Might fail if not authenticated
    const feed = await fetchPersonalizedFeed(userId);
    return <FeedList items={feed} />;
  } catch (error) {
    // Don't show error, fallback to generic content
    console.warn('Personalization failed, showing generic feed:', error);
    throw error; // ErrorBoundary shows GenericFeed
  }
}

// Server-side rendering with progressive error handling
// server.tsx
import { renderToPipeableStream } from 'react-dom/server';

function handleRequest(req, res) {
  const { pipe, abort } = renderToPipeableStream(
    <App url={req.url} />,
    {
      bootstrapScripts: ['/client.js'],

      onShellReady() {
        // Critical shell ready - start streaming immediately
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Transfer-Encoding', 'chunked');
        pipe(res);
      },

      onShellError(error) {
        // Shell failed - serve static error page
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html');
        res.send(`
          <!DOCTYPE html>
          <html>
            <body>
              <h1>Service Temporarily Unavailable</h1>
              <p>Please try again in a moment.</p>
              <script>
                setTimeout(() => window.location.reload(), 5000);
              </script>
            </body>
          </html>
        `);

        // Alert on-call engineer
        Sentry.captureException(error, {
          tags: { phase: 'shell', severity: 'critical' }
        });
      },

      onError(error, errorInfo) {
        // Non-critical error during streaming
        // Error boundary will handle on client
        console.error('Streaming error:', {
          error: error.message,
          component: errorInfo.componentStack,
          url: req.url,
          timestamp: new Date().toISOString()
        });

        // Track but don't block streaming
        Sentry.captureException(error, {
          tags: { phase: 'streaming', severity: 'warning' },
          extra: { componentStack: errorInfo.componentStack }
        });
      },

      onAllReady() {
        // All Suspense boundaries resolved
        console.log('Page fully rendered');
      }
    }
  );

  // Abort if streaming takes too long
  const timeout = setTimeout(() => {
    abort();
    console.error('Stream aborted after 10s timeout');
  }, 10000);

  res.on('close', () => {
    clearTimeout(timeout);
  });
}

// Client-side hydration with error recovery
// client.tsx
import { hydrateRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';

const rootElement = document.getElementById('root');

hydrateRoot(
  rootElement,
  <ErrorBoundary
    fallback={<CriticalError />}
    onError={(error, errorInfo) => {
      Sentry.captureException(error, {
        contexts: {
          react: { componentStack: errorInfo.componentStack }
        }
      });
    }}
  >
    <App />
  </ErrorBoundary>,
  {
    onRecoverableError(error, errorInfo) {
      // Hydration mismatch - usually not critical
      console.warn('Recoverable hydration error:', error);

      // Track hydration errors
      Sentry.captureException(error, {
        tags: {
          errorType: 'hydration-mismatch',
          severity: 'low'
        },
        extra: {
          componentStack: errorInfo.componentStack,
          digest: errorInfo.digest
        }
      });

      // Auto-recover by remounting
      if (error.message.includes('Hydration failed')) {
        console.log('Attempting client-side recovery');
        // React will automatically retry rendering
      }
    }
  }
);

// Error logging utility
function logError(section, error, options = {}) {
  const errorData = {
    section,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${section}] Error:`, error);
  }

  // Send to monitoring service
  if (!options.silent) {
    Sentry.captureException(error, {
      tags: { section },
      extra: errorData
    });
  }

  // Send to analytics
  analytics?.track('error_occurred', {
    ...errorData,
    silent: options.silent || false
  });
}
```

**Results After Implementation:**

```javascript
// Metrics comparison (30 days)
const performanceMetrics = {
  before: {
    errorRate: 0.087, // 8.7%
    failedPageLoads: 174000,
    ttfb: 2300, // ms
    fcp: 3100, // ms
    lcp: 4800, // ms
    errorRecovery: 0, // 0%
    userComplaints: 450,
    revenueLoss: 12000 // USD/day
  },
  after: {
    errorRate: 0.009, // 0.9% (90% reduction)
    failedPageLoads: 18000, // Only critical shell errors
    ttfb: 450, // ms (80% improvement)
    fcp: 1100, // ms (65% improvement)
    lcp: 2300, // ms (52% improvement)
    errorRecovery: 0.94, // 94% of users see partial content
    userComplaints: 23, // 95% reduction
    revenueLoss: 800, // 93% reduction

    // New metrics
    shellSuccessRate: 0.999, // 99.9%
    partialPageLoads: 16200, // Pages with some errors but content visible
    averageSectionsVisible: 3.8 // Out of 4 sections
  },

  // Error breakdown
  errorsBySection: {
    breakingNews: { rate: 0.002, impact: 'Medium' },
    trending: { rate: 0.012, impact: 'Low' },
    personalized: { rate: 0.034, impact: 'None' }, // Fallback works well
    ads: { rate: 0.045, impact: 'None' } // Silent failure
  },

  // Business impact
  business: {
    adRevenueSaved: 11200, // USD/day
    engagementRate: {
      before: 0.45,
      after: 0.71, // 58% improvement
    },
    bounceRate: {
      before: 0.42,
      after: 0.18, // 57% reduction
    },
    avgSessionDuration: {
      before: 185, // seconds
      after: 342 // 85% improvement
    }
  }
};

// Sentry dashboard insights
const sentryInsights = {
  totalErrors: 18000,
  criticalErrors: 240, // Shell failures only
  warningErrors: 17760, // Caught by error boundaries

  topIssues: [
    {
      title: 'Personalization API timeout',
      count: 6800,
      resolution: 'Shows generic feed (graceful degradation)',
      userImpact: 'Low'
    },
    {
      title: 'Ad network unavailable',
      count: 9000,
      resolution: 'Silent failure (no user-facing error)',
      userImpact: 'None'
    },
    {
      title: 'Trending API rate limit',
      count: 2400,
      resolution: 'Cached placeholder content',
      userImpact: 'Low'
    }
  ],

  hydrationErrors: 1200, // Auto-recovered by React
  resolvedAutomatically: 0.94 // 94% of errors handled gracefully
};
```

### ⚖️ Trade-offs

**Suspense Boundaries Granularity:**

```javascript
// Option 1: Single Suspense boundary (coarse)
// ✅ Pros: Simple, fewer boundaries, less code
// ❌ Cons: All-or-nothing loading, one slow component blocks all
function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Stats /> {/* Fast: 100ms */}
      <Chart /> {/* Medium: 500ms */}
      <Activity /> {/* Slow: 2000ms */}
    </Suspense>
  );
}
// Result: User waits 2000ms for everything
// Use when: Components have similar load times

// Option 2: Multiple Suspense boundaries (granular)
// ✅ Pros: Progressive loading, fast components show immediately
// ❌ Cons: More code, more boundaries, layout shift risk
function Dashboard() {
  return (
    <>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats /> {/* Shows at 100ms */}
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <Chart /> {/* Shows at 500ms */}
      </Suspense>
      <Suspense fallback={<ActivitySkeleton />}>
        <Activity /> {/* Shows at 2000ms */}
      </Suspense>
    </>
  );
}
// Result: User sees content progressively: 100ms, 500ms, 2000ms
// Use when: Components have different priorities/load times

// Option 3: Strategic Suspense (balanced)
// ✅ Pros: Balance between progressive loading and simplicity
// ❌ Cons: Requires planning which components to group
function Dashboard() {
  return (
    <>
      {/* Fast components together */}
      <Suspense fallback={<QuickDataSkeleton />}>
        <Stats />
        <Chart />
      </Suspense>

      {/* Slow components separate */}
      <Suspense fallback={<SlowDataSkeleton />}>
        <Activity />
      </Suspense>
    </>
  );
}
// Result: Stats+Chart at 500ms, Activity at 2000ms
// Use when: Production apps (RECOMMENDED)
```

**Error Boundary + Suspense Placement Patterns:**

```javascript
// Pattern 1: Error wraps Suspense (RECOMMENDED)
// ✅ Catches both loading errors and render errors
// ❌ Error resets Suspense state
function Component() {
  return (
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <Data />
      </Suspense>
    </ErrorBoundary>
  );
}
// States: Loading → Success OR Error
// Use when: Default pattern for most cases

// Pattern 2: Suspense wraps Error
// ✅ Error boundary scoped to specific component
// ❌ Suspense errors not caught properly
function Component() {
  return (
    <Suspense fallback={<Loading />}>
      <ErrorBoundary fallback={<Error />}>
        <Data />
      </ErrorBoundary>
    </Suspense>
  );
}
// States: Loading → (Success OR Error)
// Use when: Rarely - only for specific edge cases

// Pattern 3: Separate Error and Suspense per feature
// ✅ Maximum isolation, granular control
// ❌ More boilerplate, complex structure
function Dashboard() {
  return (
    <>
      <ErrorBoundary fallback={<StatsError />}>
        <Suspense fallback={<StatsSkeleton />}>
          <Stats />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<ChartError />}>
        <Suspense fallback={<ChartSkeleton />}>
          <Chart />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
// Use when: Critical features needing isolation

// Pattern 4: Shared Error with multiple Suspense
// ✅ One error UI for related features
// ❌ One error affects all Suspense boundaries
function Dashboard() {
  return (
    <ErrorBoundary fallback={<DashboardError />}>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>
    </ErrorBoundary>
  );
}
// Use when: Features are logically grouped
```

**React Query useErrorBoundary Configuration:**

```javascript
// Global configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Option 1: All queries throw to error boundary
      useErrorBoundary: true,
      // ✅ Declarative error handling
      // ❌ Can't handle errors differently per query

      // Option 2: Conditional error boundary
      useErrorBoundary: (error) => error.response?.status >= 500,
      // ✅ Only server errors use error boundary
      // ❌ Client errors (4xx) need manual handling

      // Option 3: No error boundary (default)
      useErrorBoundary: false
      // ✅ Manual error handling with error state
      // ❌ More verbose component code
    }
  }
});

// Per-query override
function Component() {
  // Manual error handling
  const { data, error } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    useErrorBoundary: false // Override global setting
  });

  if (error) return <InlineError error={error} />;
  return <DataView data={data} />;
}

// Throw to error boundary
function Component() {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    useErrorBoundary: true // Throw errors up
  });
  // No error handling needed in component
  return <DataView data={data} />;
}

// Best practice: Mix both approaches
function App() {
  return (
    <ErrorBoundary fallback={<CriticalError />}>
      {/* Critical data: throw to error boundary */}
      <Suspense fallback={<Loading />}>
        <CriticalData useErrorBoundary={true} />
      </Suspense>

      {/* Non-critical data: handle inline */}
      <OptionalData useErrorBoundary={false} />
    </ErrorBoundary>
  );
}
```

**Streaming SSR Error Strategies:**

```javascript
// Strategy 1: Fail fast (shell errors abort stream)
// ✅ Prevents partial/broken pages
// ❌ Higher error rate, worse UX
renderToPipeableStream(<App />, {
  onShellError(error) {
    res.status(500).send('<h1>Error</h1>'); // Abort everything
  }
});
// Use when: Critical data required for all content

// Strategy 2: Resilient streaming (continue despite errors)
// ✅ Show partial content, better UX
// ❌ Might show incomplete data
renderToPipeableStream(<App />, {
  onShellReady() {
    pipe(res); // Start streaming immediately
  },
  onError(error) {
    logError(error); // Log but continue streaming
  }
});
// Use when: Content sections are independent (RECOMMENDED)

// Strategy 3: Timeout-based
// ✅ Balance between speed and completeness
// ❌ Arbitrary timeout might cut off slow data
renderToPipeableStream(<App />, {
  onShellReady() {
    setTimeout(() => {
      pipe(res); // Stream after timeout regardless
    }, 3000);
  }
});
// Use when: Performance is critical

// Strategy 4: Conditional based on error type
// ✅ Smart error handling per error type
// ❌ Complex logic, harder to maintain
renderToPipeableStream(<App />, {
  onError(error) {
    if (error.message.includes('database')) {
      abort(); // Critical error
    } else {
      logError(error); // Non-critical, continue
    }
  }
});
// Use when: Different error severities
```

### 💬 Explain to Junior

**Simple Analogy:**

Think of React 18's Suspense and Error Boundaries like a restaurant buffet:

- **Suspense**: Like the "Food being prepared" signs at the buffet. While the chef is still cooking pasta (data loading), you see a sign saying "Coming soon" instead of an empty tray. Once ready, the pasta appears.

- **Error Boundary**: Like the restaurant manager. If one dish gets burned (error), the manager (error boundary) removes just that dish and puts up a "Temporarily unavailable" sign. The rest of the buffet stays open - you can still eat the pizza, salad, and dessert.

Without error boundaries, a burned pasta would shut down the entire buffet. With React 18's streaming, dishes appear one by one as they're ready, and if one burns, only that dish is affected.

**How Suspense + Error Boundaries Work Together:**

```javascript
// Three states your component can be in:
// 1. Loading (Suspense handles this)
// 2. Error (Error Boundary handles this)
// 3. Success (Your component handles this)

function UserProfile({ userId }) {
  return (
    <ErrorBoundary fallback={<ErrorMessage />}> {/* 2. Error state */}
      <Suspense fallback={<LoadingSpinner />}> {/* 1. Loading state */}
        <UserData userId={userId} /> {/* 3. Success state */}
      </Suspense>
    </ErrorBoundary>
  );
}

// Your component only handles the happy path!
function UserData({ userId }) {
  const { data } = useQuery(['user', userId], fetchUser, {
    suspense: true, // Throws promise → Suspense catches it
    useErrorBoundary: true // Throws error → Error Boundary catches it
  });

  // This code only runs when data is ready ✅
  return <div>{data.name}</div>;
}
```

**React 18 Streaming SSR Simplified:**

Imagine sending a newspaper that's still being printed:
- **Old way**: Print all 20 pages, then deliver (user waits 10 seconds)
- **Streaming**: Deliver page 1 in 1 second, page 2 in 2 seconds, etc. (user reads while rest prints)

If page 15 has a printing error:
- **Without error boundary**: Throw away entire newspaper (user sees nothing)
- **With error boundary**: Replace page 15 with "Article unavailable", deliver rest (user gets 19 pages)

```javascript
// Server sends HTML in chunks:
// Chunk 1 (100ms): <html><header>...</header>
// Chunk 2 (500ms): <main><article>...</article>
// Chunk 3 (2000ms): <sidebar>...</sidebar>
// Chunk 4 (3000ms): </main></html>

// If sidebar fails, server sends:
// Chunk 3 (2000ms): <div>Sidebar unavailable</div>
// User still sees header + article ✅
```

**Common Mistakes:**

```javascript
// ❌ MISTAKE 1: Suspense without Error Boundary
function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DataComponent /> {/* If this errors, app crashes! */}
    </Suspense>
  );
}

// ✅ CORRECT: Always pair Suspense with Error Boundary
function Page() {
  return (
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <DataComponent /> {/* Errors caught gracefully */}
      </Suspense>
    </ErrorBoundary>
  );
}

// ❌ MISTAKE 2: Wrong nesting order
function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ErrorBoundary fallback={<Error />}>
        <DataComponent />
      </ErrorBoundary>
    </Suspense>
  );
}
// Problem: Error boundary inside Suspense won't catch Suspense errors

// ✅ CORRECT: Error wraps Suspense
function Page() {
  return (
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <DataComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

// ❌ MISTAKE 3: Forgetting to enable Suspense in React Query
function Component() {
  const { data } = useQuery(['data'], fetchData);
  // This won't suspend! Need to add suspense: true
  return <div>{data?.name}</div>;
}

// ✅ CORRECT: Enable Suspense mode
function Component() {
  const { data } = useQuery(['data'], fetchData, {
    suspense: true // Now it suspends during loading
  });
  return <div>{data.name}</div>; // data is always defined
}
```

**Interview Answer Template:**

"In React 18, Suspense and Error Boundaries work together to handle async states declaratively. Suspense handles loading states by catching thrown promises, while Error Boundaries catch thrown errors. This lets your components focus on the success case only.

The pattern is: wrap your Suspense boundary with an Error Boundary. When a component suspends, Suspense shows the fallback. If an error occurs, the Error Boundary catches it and shows error UI.

React 18's streaming SSR makes this even more powerful. The server can start sending HTML before all data is ready. If a component errors during streaming, only that section shows an error boundary while the rest of the page works fine.

For example, in a dashboard with stats, charts, and activity feed - each wrapped in Suspense + Error Boundary - if the chart API fails, users still see stats and activity. The chart section shows a retry button instead of breaking the whole page.

I'd use libraries like React Query with `suspense: true` and `useErrorBoundary: true` to enable this pattern. It drastically simplifies component logic and improves error handling UX."
