# React Performance - Basics

> React performance fundamentals and optimization basics

---

## Question 1: React.memo and Performance Optimization

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Netflix

### Question
How does React.memo work? When should you use it?

### Answer

**React.memo** is a higher-order component that memoizes component rendering. It only re-renders if props change.

```jsx
// Without React.memo - re-renders every time parent renders
function ExpensiveComponent({ data }) {
  console.log('Rendering ExpensiveComponent');
  return <div>{/* expensive rendering */}</div>;
}

// With React.memo - only re-renders when data changes
const MemoizedComponent = React.memo(function ExpensiveComponent({ data }) {
  console.log('Rendering Memoized');
  return <div>{/* expensive rendering */}</div>;
});

// Custom comparison function
const MemoizedWithCustom = React.memo(
  ExpensiveComponent,
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.data.id === nextProps.data.id;
  }
);
```

**When to Use:**
- ✅ Pure functional components
- ✅ Expensive rendering
- ✅ Component renders often with same props
- ❌ Props change frequently
- ❌ Cheap/fast components
- ❌ Component always renders differently

### Resources
- [React Performance Optimization](https://react.dev/reference/react/memo)

---

