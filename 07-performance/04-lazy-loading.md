# Lazy Loading and Code Splitting

> Dynamic imports, React.lazy, route-based splitting, component-level splitting, and optimization strategies.

---

## Question 1: Code Splitting with React.lazy

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Meta, Google, Netflix

### Question
How does React.lazy work? Demonstrate route-based code splitting.

### Answer

**React.lazy** - Dynamically import components, creating separate bundles.

```jsx
// Without code splitting
import Dashboard from './Dashboard';
import Profile from './Profile';

// With React.lazy (code splitting)
const Dashboard = lazy(() => import('./Dashboard'));
const Profile = lazy(() => import('./Profile'));

// Route-based splitting
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**Benefits:**
- Smaller initial bundle
- Faster first load
- Load on demand

### Resources
- [React Code Splitting](https://react.dev/reference/react/lazy)

---

