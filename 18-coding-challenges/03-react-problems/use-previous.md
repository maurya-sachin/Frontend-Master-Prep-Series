# usePrevious Hook

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** All
**Time:** 10 minutes

---

## Problem

Create a custom hook that returns the previous value of a prop or state.

---

## Solution

```javascript
import { useRef, useEffect } from 'react';

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Usage
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>Now: {count}, Before: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

---

[← Back to React Problems](./README.md)
