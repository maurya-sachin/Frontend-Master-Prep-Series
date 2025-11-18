# React Performance - Memoization

> React.memo, useMemo, useCallback for optimization

---

## Question 2: Code Splitting and Lazy Loading

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** All major companies

### Question
How do you implement code splitting and lazy loading in React?

### Answer

**Code Splitting** - Split your bundle into smaller chunks that load on demand. **Lazy Loading** - Load components only when needed.

### Code Example

```jsx
import React, { lazy, Suspense } from 'react';

// 1. DYNAMIC IMPORT (Basic)
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// 2. ROUTE-BASED SPLITTING
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// 3. CONDITIONAL LOADING
function FeatureFlag() {
  const [showFeature, setShowFeature] = useState(false);
  const Feature = lazy(() => import('./NewFeature'));

  return (
    <>
      <button onClick={() => setShowFeature(true)}>
        Show Feature
      </button>
      {showFeature && (
        <Suspense fallback={<Spinner />}>
          <Feature />
        </Suspense>
      )}
    </>
  );
}

// 4. ERROR BOUNDARY WITH SUSPENSE
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Failed to load component</div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Resources
- [Code Splitting](https://react.dev/reference/react/lazy)

---

## Question 3: React Profiler and Performance Debugging

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Meta, Netflix, large-scale apps

### Question
How do you use React Profiler to identify and fix performance issues?

### Answer

**React Profiler** - Built-in tool to measure rendering performance.

### Code Example

```jsx
// 1. PROFILER COMPONENT
import { Profiler } from 'react';

function onRenderCallback(
  id,        // component id
  phase,     // "mount" or "update"
  actualDuration,  // time spent rendering
  baseDuration,    // estimated time without memoization
  startTime,
  commitTime,
  interactions
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="Navigation" onRender={onRenderCallback}>
      <Navigation />
    </Profiler>
  );
}

// 2. REACT DEVTOOLS PROFILER
// - Open React DevTools
// - Click "Profiler" tab
// - Click record button
// - Interact with your app
// - Stop recording
// - Analyze flame graph & ranked chart

// 3. PERFORMANCE PATTERNS

// ❌ BAD: Creating objects in render
function Bad({ userId }) {
  return <User config={{ id: userId, theme: 'dark' }} />;
  // New object every render!
}

// ✅ GOOD: Memoize objects
function Good({ userId }) {
  const config = useMemo(
    () => ({ id: userId, theme: 'dark' }),
    [userId]
  );
  return <User config={config} />;
}

// ❌ BAD: Inline functions
function Bad() {
  return <Button onClick={() => console.log('click')} />;
  // New function every render
}

// ✅ GOOD: useCallback
function Good() {
  const handleClick = useCallback(() => {
    console.log('click');
  }, []);
  return <Button onClick={handleClick} />;
}
```

### Resources
- [Profiler API](https://react.dev/reference/react/Profiler)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)

---

**[← Back to React README](./README.md)**
